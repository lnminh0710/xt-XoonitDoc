using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using Microsoft.AspNetCore.Http;

namespace DMS.Utils
{
    public interface IPathProvider
    {
        /// <summary>
        /// Gets the absolute path to the directory that contains the web-servable application content files.
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        string MapWebRootPath(string path);

        /// <summary>
        /// Gets the absolute path to the directory that contains the application content files.
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        string MapContentRootPath(string path);

        string WebRootPath { get; set; }
        string ContentRootPath { get; set; }

        string FileShare { get; set; }
        string UploadFolder { get; set; }
        string PublicFolder { get; set; }
        string CustomerFileServer { get; set; }
        /// <summary>
        /// FileShare + "\" + UploadFolder
        /// </summary>
        string RootUploadFolderPath { get; set; }

        string GetFullUploadFolderPath(UploadMode? mode, string subFolder = null);

        /// <summary>
        /// Path with remove FileShare
        /// </summary>
        /// <param name="fullPath"></param>
        /// <returns></returns>
        string GetRelativePath(string fullPath);

        /// <summary>
        /// \2018\11\10\  ->   2018\11\10
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        string TrimFolderPath(string folderPath);

        FileInfoItem GetFileInfoItem(string name, string returnName = null, UploadMode? mode = null, string subFolder = null);

        Task DeleteFiles(IList<DeleteFileItem> deleteItems);
    }

    public class PathProvider : IPathProvider
    {
        private IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public string WebRootPath { get; set; }
        public string ContentRootPath { get; set; }

        public string FileShare { get; set; }
        public string UploadFolder { get; set; }
        public string PublicFolder { get; set; }
        public string CustomerFileServer { get; set; }
        
        /// <summary>
        /// FileShare + "\" + UploadFolder
        /// </summary>
        public string RootUploadFolderPath { get; set; }

        private static readonly string[] ImageExtensions = new string[] { ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".jfif" };

        public PathProvider(IHostingEnvironment environment, IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting, IHttpContextAccessor httpContextAccessor)
        {
            _hostingEnvironment = environment;
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _httpContextAccessor = httpContextAccessor;

            WebRootPath = _hostingEnvironment.WebRootPath;
            ContentRootPath = _hostingEnvironment.ContentRootPath;

            FileShare = _serverConfig.ServerSetting.FileShareUrl;
            UploadFolder = _appSettings.UploadFolder;
            RootUploadFolderPath = string.IsNullOrEmpty(UploadFolder) ? FileShare : FileShare + Common.GetPlatFormPath(_appSettings) + UploadFolder;
            PublicFolder = _appSettings.PublicFolder;
            CustomerFileServer = _appSettings.CustomerFileServer;
        }

        /// <summary>
        /// Gets the absolute path to the directory that contains the web-servable application content files.
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public string MapWebRootPath(string path)
        {
            return Path.Combine(_hostingEnvironment.WebRootPath, path);
        }

        /// <summary>
        /// Gets the absolute path to the directory that contains the application content files.
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public string MapContentRootPath(string path)
        {
            return Path.Combine(_hostingEnvironment.ContentRootPath, path);
        }

        #region UploadFolder

        /// <summary>
        /// GetFullUploadFolderPath
        /// </summary>
        /// <param name="mode"></param>
        /// <param name="subFolder"></param>
        /// <returns></returns>
        public string GetFullUploadFolderPath(UploadMode? mode, string subFolder = null)
        {
            string fullFolderPath = "";
            try
            {
                string rootFolderPath = "";

                /*Example about a path:
                    FileShare + UploadFolder + SubFolder + FileName
                    \\file.xena.local\XenaUploadFile\Printing\660\filename.docx
                 */

                //Relative Path from UploadFolder
                if (!string.IsNullOrEmpty(subFolder) && subFolder.StartsWith(UploadFolder))
                {
                    fullFolderPath = FileShare + Common.GetPlatFormPath(_appSettings) + subFolder;
                }
                else
                {
                    rootFolderPath = RootUploadFolderPath;
                    if (mode.HasValue)
                    {
                        switch (mode)
                        {
                            case UploadMode.ArticleMedia:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.ArticleMediaUploadFolder);
                                break;
                            case UploadMode.Profile:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.ProfileUploadFolder);
                                break;
                            case UploadMode.Notification:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.NotificationUploadFolder);
                                break;
                            case UploadMode.Template:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.TemplateUploadFolder);
                                break;
                            case UploadMode.Printing:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.PrintingUploadFolder);
                                break;
                            case UploadMode.General:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.GeneralUploadFolder);
                                break;
                            case UploadMode.StatisticReport:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.StatisticReportUploadFolder);
                                break;
                            case UploadMode.ODEFailed:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.ODEFailedUploadFolder);
                                break;
                            case UploadMode.Inventory:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.InventoryUploadFolder);
                                break;
                            case UploadMode.Customer:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.CustomerUploadFolder);
                                break;
                            case UploadMode.OrderProcessing:
                                fullFolderPath = Path.Combine(rootFolderPath, "OrderProcessing");
                                break;
                            case UploadMode.MyDM:
                                var userFromService = Business.BaseBusiness.ReadAccessToken<UserFromService>(_httpContextAccessor, Constants.ConstAuth.AppInfoKey);
                                if (userFromService == null)
                                {
                                    return string.Empty;
                                }
                                fullFolderPath = Path.Combine(FileShare, "XenaScan", userFromService.IdLogin);
                                break;

                            case UploadMode.ResourcesXoonit:
                                fullFolderPath = Path.Combine(FileShare, "Resources");
                                break;

                            default:
                                fullFolderPath = Path.Combine(rootFolderPath, _appSettings.OtherUploadFolder);
                                break;
                        }
                    }
                    else
                    {
                        fullFolderPath = rootFolderPath;
                    }

                    if (!string.IsNullOrEmpty(subFolder))
                    {
                        // \\2018\11\10\\  ->   2018\11\10
                        if (subFolder[0] == '\\' || subFolder[subFolder.Length - 1] == '\\')
                            subFolder = TrimFolderPath(subFolder);

                        fullFolderPath = Path.Combine(fullFolderPath, subFolder);
                    }
                }

                if (!Directory.Exists(fullFolderPath))
                {
                    Directory.CreateDirectory(fullFolderPath);
                }
            }
            catch { }
            return fullFolderPath;
        }
        #endregion

        /// <summary>
        /// Path with remove FileShare
        /// </summary>
        /// <param name="fullPath"></param>
        /// <returns></returns>
        public string GetRelativePath(string fullPath)
        {
            fullPath = fullPath.Replace(FileShare, "");
            return TrimFolderPath(fullPath);
        }

        /// <summary>
        /// GetFileInfoItem
        /// </summary>
        /// <param name="name"></param>
        /// <param name="returnName"></param>
        /// <param name="mode"></param>
        /// <param name="subFolder"></param>
        /// <returns></returns>
        public FileInfoItem GetFileInfoItem(string name, string returnName = null, UploadMode? mode = null, string subFolder = null)
        {
            var info = new FileInfoItem();

            string fullFileName = name;

            //If mode is Path, this is absolute path and we don't need to process for path
            if (mode == UploadMode.Path || fullFileName.StartsWith(FileShare))
            {
                if ((mode == UploadMode.Path || !fullFileName.StartsWith(FileShare)) && !(File.Exists(fullFileName)))
                {
                    string tempPath = (FileShare + fullFileName);
                    if (!File.Exists(tempPath)) {
                        string s = Path.Combine(FileShare, PublicFolder) + fullFileName;
                        tempPath = s;
                    }
                    fullFileName = tempPath;
                }
                if (string.IsNullOrEmpty(returnName))
                {
                    returnName = Path.GetFileName(fullFileName);
                }
            }
            else
            {
                //for case: name=2018\12\16\ba43683290a1.jpg
                //-> subFolder: 2018\12\16
                //-> name: ba43683290a1.jpg
                if (name.Contains("\\"))
                {
                    subFolder = Path.GetDirectoryName(name);
                    name = Path.GetFileName(name);
                }

                string uploadFolder = GetFullUploadFolderPath(mode, subFolder);

                returnName = string.IsNullOrEmpty(returnName) ? name : returnName;
                if (name[0] == '/')
                {
                    returnName = returnName.Replace("/", @"-");
                    name = name.Replace("/", @"\");
                    fullFileName = uploadFolder + name;
                }
                else
                {
                    fullFileName = Path.Combine(uploadFolder, name);
                }
            }

            info.FullFileName = fullFileName;
            info.ReturnName = returnName;
            info.FileName = name;
            info.Extension = Path.GetExtension(fullFileName).ToLowerInvariant();
            info.IsImage = ImageExtensions.Contains(info.Extension);

            return info;
        }

        public async Task DeleteFiles(IList<DeleteFileItem> deleteItems)
        {
            await Task.Run(() =>
            {

                if (deleteItems == null || deleteItems.Count == 0) return;

                foreach (var item in deleteItems)
                {
                    var fileInfoItem = GetFileInfoItem(name: item.MediaName, mode: item.UploadFileMode, subFolder: item.SubFolder);

                    if (File.Exists(fileInfoItem.FullFileName))
                    {
                        File.SetAttributes(fileInfoItem.FullFileName, FileAttributes.Normal);
                        File.Delete(fileInfoItem.FullFileName);
                    }
                }
            });
        }

        /// <summary>
        /// \2018\11\10\  ->   2018\11\10
        /// </summary>
        /// <param name="folderPath"></param>
        /// <returns></returns>
        public string TrimFolderPath(string folderPath)
        {
            var returnPath = folderPath.Replace(FileShare, "");

            if (returnPath[0] == '\\')
            {
                var startIndex = 1;
                for (int i = 1; i < returnPath.Length - 1; i++)
                {
                    if (returnPath[i] == '\\')
                        startIndex++;
                    else break;
                }
                returnPath = returnPath.Substring(startIndex, returnPath.Length - startIndex);
            }

            if (returnPath[returnPath.Length - 1] == '\\')
            {
                var lastIndex = returnPath.Length;
                for (int i = returnPath.Length - 1; i >= 0; i--)
                {
                    if (returnPath[i] == '\\')
                        lastIndex--;
                    else break;
                }
                returnPath = returnPath.Substring(0, lastIndex);
            }

            return returnPath;
        }
    }
}
