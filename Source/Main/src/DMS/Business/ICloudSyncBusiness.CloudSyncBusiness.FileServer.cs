using DMS.Constants;
using DMS.Models.DMS;
using DMS.Utils;
using Hangfire.Console;
using Hangfire.Server;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using WinSCP;

namespace DMS.Business
{
    public class CloudSyncBusinessFileServer : ICloudSyncBusiness
    {
        private string FILE_SHARE_URL = "Temp_Resource";
        public void Init(AppSettings _appSettings)
        {

        }
        public CloudSyncBusinessFileServer(AppSettings _appSettings)
        {
            FILE_SHARE_URL = _appSettings.FileExplorerUrl;
        }
        private string CreateDirectories(string path)
        {

            path = Path.Combine(FILE_SHARE_URL, path);
            // Consistent forward slashes
            path = path.Replace(@"\", "/");
            string tmp = "";
            foreach (string dir in path.Split('/'))
            {
                // Ignoring leading/ending/multiple slashes
                if (!string.IsNullOrWhiteSpace(dir))
                {

                    tmp = tmp + "/" + dir;
                    if (!Directory.Exists(tmp))
                    {
                        Directory.CreateDirectory(tmp);
                    }


                }
            }
            return tmp;


        }
        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            string uploadFolder = connectionModel.FileServerFolder;
            var path = FILE_SHARE_URL;
            if (!string.IsNullOrEmpty(uploadFolder))
            {
                path = CreateDirectories(uploadFolder);
            }
            return new object[] { path };
        }
        private void SaveFileFromStream(Stream stream, string fullFileName)
        {

            Image image = Image.FromStream(stream);
            image.Save(fullFileName);

        }
        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            string sharedFolder = (string)agrs[0];
            var localPath = Path.Combine(doc.ScannedPath, doc.FileName);
            string remoteFilePath = sharedFolder;
            if (!string.IsNullOrEmpty(doc.CloudMediaPath))
            {
                remoteFilePath += "/" + doc.CloudMediaPath;
                CreateDirectories(remoteFilePath);
            }
            string uploadFileName = !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName;
            remoteFilePath = Path.Combine(remoteFilePath, uploadFileName);
            MemoryStream stream = new MemoryStream(File.ReadAllBytes(localPath));
            SaveFileFromStream(stream, remoteFilePath);
            ViewDocInfoMyCloudFileServer reponseUploadDocFileServer = new ViewDocInfoMyCloudFileServer { FilePath = remoteFilePath };
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(reponseUploadDocFileServer);
            return reponseUpload;

        }

        public async Task<object> GetFile(string cloudFilePath, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc)
        {
            ViewDocInfoMyCloudFileServer viewDocInfo = JsonConvert.DeserializeObject<ViewDocInfoMyCloudFileServer>(cloudFilePath);
            CloudDownloadFileReponse data = new CloudDownloadFileReponse();
            data.FileName = cloudMediaName;
            data.stream = new MemoryStream(File.ReadAllBytes(viewDocInfo.FilePath));
            return data;
        }

        public Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> RenamePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> DeletePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> TestCloudConnection(CloudConnectionTestModel model)
        {
            CreateDirectories(model.FileServerFolder);
            return true;
        }

        public Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {
            throw new NotImplementedException();
        }

        public async Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            ViewDocInfoMyCloudFileServer viewDocInfo = JsonConvert.DeserializeObject<ViewDocInfoMyCloudFileServer>(infoFile.ViewDocInfo);
            return new MemoryStream(File.ReadAllBytes(viewDocInfo.FilePath));
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            string sharedFolder = (string)agrs[0];
            string remoteFilePath = sharedFolder;
            if (!string.IsNullOrEmpty(doc.CloudMediaPath))
            {
                remoteFilePath += "/" + doc.CloudMediaPath;
                CreateDirectories(remoteFilePath);
            }
            string uploadFileName = !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName;
            remoteFilePath = Path.Combine(remoteFilePath, uploadFileName);

            SaveFileFromStream(stream, remoteFilePath);
            ViewDocInfoMyCloudFileServer reponseUploadDocFileServer = new ViewDocInfoMyCloudFileServer { FilePath = remoteFilePath };
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(reponseUploadDocFileServer);
            return reponseUpload;
        }

        public Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest = false)
        {
            throw new NotImplementedException();
        }
    }
    public class ViewDocInfoMyCloudFileServer
    {
        public string FilePath { get; set; }
    }
}
