using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Utils;
using Microsoft.Extensions.Options;
using DMS.Business;
using DMS.Models.DMS;
using System.Collections.Generic;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class FileExplorerController : Controller
    {
        //private readonly IPathProvider _pathProvider;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        private readonly IFileServerBusiness _fileServerBusiness;

        public FileExplorerController(IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting, IFileServerBusiness fileServerBusiness)
        {
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _fileServerBusiness = fileServerBusiness;
        }

        [HttpGet]
        [Route("explorer")]
        public List<FileExplorerModel> ExplorerFileServer(string path)
        {
            return _fileServerBusiness.ExplorerDirectory(path);
        }

        [HttpGet]
        [Route("tree")]
        public List<FileExplorerModel> ExplorerTreeFileServer(string path)
        {
            return _fileServerBusiness.GetTreeDirectory(path);
        }

        [HttpPost]
        [Route("folder")]
        public object CRUDFolder([FromBody]FolderInputModel folderInput)
        {
            if (folderInput == null) return StatusCode(400);
            if (string.IsNullOrEmpty(folderInput.Action)) return StatusCode(400);
            if (folderInput.Action.ToLower() == "create")
            {
                if (string.IsNullOrEmpty(folderInput.NewFolder)) return StatusCode(400);
                int result = _fileServerBusiness.AddNewDirectory(folderInput.ParentFolder, folderInput.NewFolder);
                if (result == -1) return StatusCode(400, "Folder exist.");                
            } else if (folderInput.Action.ToLower() == "rename")
            {
                if (string.IsNullOrEmpty(folderInput.NewFolder)
                        || string.IsNullOrEmpty(folderInput.FromFolder)) return StatusCode(400);
                _fileServerBusiness.RenameDirectory(folderInput.FromFolder, folderInput.NewFolder);
            } else
            {
                return StatusCode(400, "Unsupport for Action '" + folderInput.Action + "'");
            }
            return StatusCode(200 , "Success");
        }

        [HttpPost]
        [Route("file")]
        public object CRUDFile([FromBody]FolderInputModel folderInput)
        {
            if (folderInput == null) return StatusCode(400);
            if (string.IsNullOrEmpty(folderInput.Action)) return StatusCode(400);

            if (folderInput.Action.ToLower() == "rename")
            {
                if (string.IsNullOrEmpty(folderInput.OrginalFile)
                        || string.IsNullOrEmpty(folderInput.NewFile)) return StatusCode(400);
                _fileServerBusiness.RenameFile(folderInput.OrginalFile, folderInput.NewFile);
            }
            else
            {
                return StatusCode(400, "Unsupport for Action '" + folderInput.Action + "'");
            }
            return StatusCode(200, "Success");
        }
    }

}
