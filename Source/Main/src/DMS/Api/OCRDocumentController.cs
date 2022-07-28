using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Utils;
using Microsoft.Extensions.Options;
using DMS.Business;
using DMS.Models.DMS;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using RestSharp;
using System;
using System.Reflection;
using Newtonsoft.Json;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class OCRDocumentController : Controller
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        private readonly IOCRDocumentBusiness _ocrServiceBusiness;

        public OCRDocumentController(IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting, IOCRDocumentBusiness ocrServiceBusiness)
        {
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _ocrServiceBusiness = ocrServiceBusiness;
        }

        [HttpPost]
        [Route("manually")]
        public async Task<object> ManuallyOCRDocument([FromBody]RequestOCRMauallyModel OcrIds)
        {
            try
            {
                object rs = await _ocrServiceBusiness.ManuallyOCRForDocuments(OcrIds);
                if (rs == null)
                {
                    return StatusCode(500, "ERROR");
                }
                RestResponse response = (RestResponse)rs;
                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                    return StatusCode(200, response.Content);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    return StatusCode(404, response.Content);
                if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    return StatusCode(400, response.Content);
                return StatusCode(500, response.Content);
            }
            catch(Exception exx)
            {
                _logger.Error("API OCR manually (" + JsonConvert.SerializeObject(OcrIds) + ")", exx);
                return StatusCode(500, exx.Message);
            }            
        }

        //[HttpGet]
        //[Route("tree")]
        //public List<FileExplorerModel> ExplorerTreeFileServer(string path)
        //{
        //    return _fileServerBusiness.GetTreeDirectory(path);
        //}

        //[HttpPost]
        //[Route("folder")]
        //public object CRUDFolder([FromBody]FolderInputModel folderInput)
        //{
        //    if (folderInput == null) return StatusCode(400);
        //    if (string.IsNullOrEmpty(folderInput.Action)) return StatusCode(400);
        //    if (folderInput.Action.ToLower() == "create")
        //    {
        //        if (string.IsNullOrEmpty(folderInput.NewFolder)) return StatusCode(400);
        //        int result = _fileServerBusiness.AddNewDirectory(folderInput.ParentFolder, folderInput.NewFolder);
        //        if (result == -1) return StatusCode(400, "Folder exist.");                
        //    } else if (folderInput.Action.ToLower() == "rename")
        //    {
        //        if (string.IsNullOrEmpty(folderInput.NewFolder)
        //                || string.IsNullOrEmpty(folderInput.FromFolder)) return StatusCode(400);
        //        _fileServerBusiness.RenameDirectory(folderInput.FromFolder, folderInput.NewFolder);
        //    } else
        //    {
        //        return StatusCode(400, "Unsupport for Action '" + folderInput.Action + "'");
        //    }
        //    return StatusCode(200 , "Success");
        //}

    }

}
