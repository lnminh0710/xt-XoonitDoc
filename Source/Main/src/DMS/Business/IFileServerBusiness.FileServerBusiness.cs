using DMS.Utils;
using Microsoft.Extensions.Options;
using System.Linq;
using System.IO;
using System.Collections.Generic;
using DMS.Models.DMS;

namespace DMS.Business
{
    public class FileServerBusiness : IFileServerBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly IPathProvider _pathProvider;
        private readonly ServerConfig _serverConfig;
        private const int MAX_LEVEL_TREE = 2;
        //private const string ROOT_PATH = "\\\\file.xena.local\\Expense";

        public FileServerBusiness(IOptions<AppSettings> appSettings,
            IAppServerSetting appServerSetting,
            IPathProvider pathProvider)
        {
            _pathProvider = pathProvider;
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
        }
        
        public List<FileExplorerModel> ExplorerDirectory(string detailOfPath)
        {
            string folder = _appSettings.FileExplorerUrl;// _pathProvider.GetFullUploadFolderPath(mode, detailOfPath);
            if (!string.IsNullOrEmpty(detailOfPath))
                folder = Path.Combine(_appSettings.FileExplorerUrl, detailOfPath);

            List<FileExplorerModel> results = new List<FileExplorerModel>();
            if (!(new DirectoryInfo(folder).Exists))
                return null;
            List<string> dirs = Directory.EnumerateDirectories(folder).ToList();
            dirs.ForEach(item =>
            {
                results.Add(new FileExplorerModel() {
                    Path = item.Replace(_appSettings.FileExplorerUrl,""),
                    Value = Path.GetFileName(item),
                    IsFile = false,
                    IsEmpty = !Directory.EnumerateFileSystemEntries(item).Any()
                });
            });

            List<string> files = Directory.EnumerateFiles(folder).ToList();
            files.ForEach(item =>
            {
                results.Add(new FileExplorerModel()
                {
                    Path = item.Replace(_appSettings.FileExplorerUrl, ""),
                    Value = Path.GetFileName(item),
                    Extension = Path.GetExtension(item).Replace(".",""),
                    IsFile = true,
                    IsEmpty = true,
                });
            });
            return results.Where(f => !f.Value.StartsWith("#") && !f.Value.StartsWith(".")).ToList();
        }

        public List<FileExplorerModel> GetTreeDirectory(string pathRoot)
        {
            string folder = _appSettings.FileExplorerUrl;// _pathProvider.GetFullUploadFolderPath(mode, pathRoot);
            if (!string.IsNullOrEmpty(pathRoot))
                folder = Path.Combine(_appSettings.FileExplorerUrl, pathRoot);
            List<FileExplorerModel> results = new List<FileExplorerModel>();
            List<string> files = Directory.EnumerateDirectories(folder).ToList();
            files = files.Where(f => !Path.GetFileName(f).StartsWith("#") && !Path.GetFileName(f).StartsWith(".")).ToList();

            files.ForEach(item =>
            {
                results.Add(new FileExplorerModel()
                {
                    Path = item.Replace(_appSettings.FileExplorerUrl, ""),
                    Value = Path.GetFileName(item),
                    IsFile = false,
                    Children = GetSubFolders(item, 1)
                });
            });
            return results;
        }

        private List<FileExplorerModel> GetSubFolders(string folder, int level)
        {
            List<FileExplorerModel> results = new List<FileExplorerModel>();
            List<string> files = Directory.EnumerateDirectories(folder).ToList();
            files = files.Where(f => !Path.GetFileName(f).StartsWith("#") && !Path.GetFileName(f).StartsWith(".")).ToList();
            files.ForEach(item =>
            {
                results.Add(new FileExplorerModel()
                {
                    Path = item.Replace(_appSettings.FileExplorerUrl, ""),
                    Value = Path.GetFileName(item),
                    IsFile = false,
                    Children = level == MAX_LEVEL_TREE ? null : GetSubFolders(item, level + 1)
                });
            });
            if (results.Count == 0) return null;
            return results;
        }

        public int RenameDirectory(string fromFolder, string toFolder)
        {
            fromFolder = Path.Combine(_appSettings.FileExplorerUrl, fromFolder);
            toFolder = Path.Combine(_appSettings.FileExplorerUrl, toFolder);
            Directory.Move(fromFolder, toFolder);
            return 1;
        }


        public int AddNewDirectory(string parentFolder, string newFolder)
        {
            string rootFolder = _appSettings.FileExplorerUrl;
            if (!string.IsNullOrEmpty(parentFolder))
                parentFolder = Path.Combine(rootFolder, parentFolder);
            else
                parentFolder = rootFolder;

            newFolder = Path.Combine(parentFolder, newFolder);

            DirectoryInfo di = new DirectoryInfo(newFolder);
            if (di.Exists)
               return -1;
            di.Create();            
            return 1;
        }

        /**
         * return -2: fromFile not exist
         *      -1: toFile Exist
         * */
        public int RenameFile(string fromFile, string toFile)
        {
            fromFile = Path.Combine(_appSettings.FileExplorerUrl, fromFile);
            if (!new FileInfo(fromFile).Exists) return -2;

            toFile = Path.Combine(_appSettings.FileExplorerUrl, toFile);
            if (new FileInfo(toFile).Exists) return -1;

            System.IO.File.Move(fromFile, toFile);

            return 1;
        }

    }
}
