using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using DMS.Business;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Models;
using System.IO;
using Newtonsoft.Json;
using Hangfire;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]

    public class DocumentContainerController : ControllerBase
    {
        private readonly IDocumentContainerBusiness _documentContainerBusiness;
        private readonly ICommonBusiness _commonBusiness;
        private readonly IDocumentBusiness _documentBusiness;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;
        private readonly IConvertImageBusiness _convertImageBusiness;
        private readonly IConvertImageProcessBusiness _convertImageProcessBusiness;
        public DocumentContainerController(IDocumentContainerBusiness documentContainerBusiness, ICommonBusiness commonBusiness,
            IElasticSearchSyncBusiness elasticSearchSyncBusiness,
             IDocumentBusiness documentBusiness, IConvertImageBusiness convertImageBusiness,
             IConvertImageProcessBusiness convertImageProcessBusiness)
        {
            _documentContainerBusiness = documentContainerBusiness;
            _commonBusiness = commonBusiness;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
            _documentBusiness = documentBusiness;
            _convertImageBusiness = convertImageBusiness;
            _convertImageProcessBusiness = convertImageProcessBusiness;
        }

        [HttpGet]
        [Route("GetThumbnails")]
        public async Task<object> GetThumbnails(int? pageIndex, int? pageSize)
        {
            pageIndex = pageIndex != null ? pageIndex : 0;
            pageSize = pageSize != null ? pageSize : 50;
            var result = await _documentContainerBusiness.GetThumbnails(pageSize.Value, pageIndex.Value);

            return result != null ? JObject.FromObject(result) : null;
        }


        [HttpGet]
        [Route("GetDoc2OCR")]
        public async Task<object> GetDoc2OCR(int? numberDoc)
        {
            var result = await _documentContainerBusiness.GetDoc2OCR(numberDoc);

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpPost]
        [Route("SaveOCRResult")]
        public async Task<object> SaveOCRResult([FromBody] List<DocumentContainerOCRModel> models)
        {
            var result = _documentContainerBusiness.SaveDocumentContainerOCR(models);
            return await result;
        }

        [HttpPost]
        [Route("SaveDocumentGroup")]
        public async Task<object> SaveDocumentGroup([FromBody] List<DocumentContainerGroupModel> models)
        {
            WSEditReturn result = await _documentContainerBusiness.SaveDocumentContainerGroup(models);
            if (result != null && result.ReturnID != null && Int32.Parse(result.ReturnID) > 0)
            {

                return result;

            }
            return StatusCode(400, "SaveDocumentGroup Error!"); ;
        }

        [HttpGet]
        [Route("GetDoc2Group")]
        public async Task<object> GetDoc2Group(int pageSize, int? idDocumentContainerOcr)
        {
            var result = await _documentContainerBusiness.GetDoc2Group(pageSize, idDocumentContainerOcr);

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpGet]
        [Route("GetDoc2Entry")]
        public async Task<object> GetDoc2Entry()
        {
            var result = await _documentContainerBusiness.GetDoc2Entry();

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpPost]
        [Route("SaveDocEntry")]
        public async Task<object> SaveDocEntry([FromBody] List<DocumentContainerOCRModel> models)
        {
            var result = await _documentContainerBusiness.SaveDocEntry();

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpPost]
        [Route("SaveDocumentContainerProcessed")]
        [AllowAnonymous]
        public async Task<object> SaveDocumentContainerProcessed([FromBody] List<DocumentContainerProcessedModel> models)
        {

            var result = await _documentContainerBusiness.SaveDocumentContainerProcessed(models);

            return result;
        }

        [HttpPost]
        [Route("SaveDocumentContainerFilesLog")]
        [AllowAnonymous]
        public async Task<IActionResult> SaveDocumentContainerFilesLog([FromBody] DocumentContainerFilesLog model)
        {

            var result = await _documentContainerBusiness.SaveDocumentContainerFilesLog(model);

            return Ok(result);

        }

        [HttpGet]
        [Route("GetTextEntity")]
        public async Task<object> GetTextEntity(int? idRepDocumentType)
        {

            var result = await _documentContainerBusiness.getTextEntity(idRepDocumentType);

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpPost]
        [Route("DeleteScanDocument")]
        public async Task<object> DeleteScanDocument([FromBody] DocumentContainerScan model)
        {
            if (model == null)
            {
                return StatusCode(400, "data is undefined."); ;
            }
            if (model.DocumentContainerScanIds == null || model.DocumentContainerScanIds.Count == 0)
            {
                return StatusCode(400, "DocumentContainerScanIds is undefined."); ;
            }

            var result = _documentContainerBusiness.DeleteScanDocument(model.DocumentContainerScanIds);

            return await result;
        }

        [HttpGet]
        [Route("GetPagesByDocId")]

        public async Task<object> GetPagesByDocId(int idDocumentContainerScans, int? idDocumentContainerFileType)
        {

            var result = await _documentContainerBusiness.GetPagesByDocId(idDocumentContainerScans, idDocumentContainerFileType);

            return result != null ? JArray.FromObject(result) : new JArray();
        }

        [HttpGet]
        [Route("GetOCRDataByFileId")]
        public async Task<object> GetOCRDataByFileId(string idDocumentContainerFile)
        {
            var result = await _documentContainerBusiness.GetOCRDataByFileId(idDocumentContainerFile);
            return result != null ? JArray.FromObject(result) : new JArray();
        }


        [HttpGet]
        [Route("GetFile")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFile(int idDocumentContainerScans, int? idDocumentContainerFileType)
        {
            DocumentScanFiles documentScanFiles = await _documentContainerBusiness.GetDocumentContainerForDownload(idDocumentContainerScans, idDocumentContainerFileType);
            if (documentScanFiles == null)
            {
                return StatusCode(404);
            }
            var fullFileName = Path.Combine(documentScanFiles.ScannedPath, documentScanFiles.FileName);
            
            Stream stream = new FileStream(fullFileName, FileMode.Open, FileAccess.Read);
            var fileResult = new FileStreamResult(stream, XenaUtils.MIMEAssistant.GetMIMETypeByExtension(Path.GetExtension(fullFileName)));
            fileResult.FileDownloadName = documentScanFiles.FileName;

            return fileResult;
        }

        [HttpPost]
        [Route("SendEmail")]
        public async Task<object> SendEmail([FromBody] EmailDocumentModel model)
        {
            return await _documentContainerBusiness.SendEmailDocument(model);
        }

        [HttpPost]
        [Route("SaveDocumentContainerPage")] 
        public async Task<object> SaveDocumentContainerPage([FromBody] List<DocumentContainerPageScanModel> models)
        {
            try
            {
                _convertImageBusiness.HandleImageBeforeMergeDb(models);
            }
            catch (Exception e)
            {
                return StatusCode(400, "Copy Image Before Merge Error " + e.Message); ;
            }
            var result = await _documentContainerBusiness.SaveDocumentContainerPage(models);
            if (result.IsSuccess)
            {
                List<UpdateImageServiceModel> updateImageServiceModels = new List<UpdateImageServiceModel>();
                List<string> deleteIds = models.Where(x => x.IdDocumentContainerScans != x.OldIdDocumentContainerScans)
                .Select(s => s.OldIdDocumentContainerScans.ToString()).
               Distinct().ToList();
                if (deleteIds != null && deleteIds.Count > 0)
                {
                    
                    _elasticSearchSyncBusiness.DeleteFromElasticSearch(deleteIds, "document");
                }
                List<string> listId = models.Select(s => s.OldIdDocumentContainerScans.ToString()).Distinct().ToList();

                var idDocScans = String.Join(", ", listId.ToArray());
                await _elasticSearchSyncBusiness.SyncDocumentOCRToElasticSearch(idDocScans, "document", "");

                await _convertImageProcessBusiness.AddQueueUpdateImage(listId);
           //     BackgroundJob.Enqueue<IConvertImageBusiness>(x => x.UpdateImagesJob(idDocScans));

            }

            return result;
        }

        [HttpPost]
        [Route("UnGroupDocument")]

        public async Task<object> UnGroupDocument([FromBody] List<DocumentContainerUnGroupModel> models)
        {
            List<string> IdDocumentContainerScansList = models
               .Select(s => s.IdDocumentContainerScans.ToString()).
              Distinct().ToList();
            var listScanFiles = await _documentContainerBusiness.GetDocumentScanFiles(IdDocumentContainerScansList);
            var result = await _documentContainerBusiness.SaveDocumentContainerUnGroup(listScanFiles);
            if (result.IsSuccess)
            {
                List<UpdateImageServiceModel> updateImageServiceModels = new List<UpdateImageServiceModel>();
               
                var idDocScans = String.Join(", ", IdDocumentContainerScansList.ToArray());
                await _elasticSearchSyncBusiness.SyncDocumentOCRToElasticSearch(idDocScans, "document", "");

                await _convertImageProcessBusiness.AddQueueUpdateImage(IdDocumentContainerScansList);
                //     BackgroundJob.Enqueue<IConvertImageBusiness>(x => x.UpdateImagesJob(idDocScans));

            }

            return result;
        }

        [HttpGet]
        [Route("GetFilesForUpload")]
        [AllowAnonymous]
        public async Task<object> GetFilesForUpload()
        {

            var result = await _documentContainerBusiness.GetFilesForUpload();

            return result;
        }

        [HttpPost]
        [Route("UpdateFilesForUpload")]
        [AllowAnonymous]
        public async Task<object> UpdateFilesForUpload([FromBody] FileUploadModel model)
        {

            var result = await _documentContainerBusiness.UpdateFilesForUpload(model);

            return result;
        }

        [HttpPost]
        [Route("UploadService/GetFile")]
        [AllowAnonymous]
        public IActionResult GetFile([FromBody] FileUploadGetModel model)
        {
            string fileName = Path.Combine(model.ScannedPath, model.FileName);
            if (!System.IO.File.Exists(fileName))
            {
                return StatusCode(400, "File " + fileName + " not exist!");
            }
            Stream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read);
            byte[] data = new byte[fs.Length];
            int br = fs.Read(data, 0, data.Length);
            if (br != fs.Length)
                throw new System.IO.IOException(fileName);

            return File(data, XenaUtils.MIMEAssistant.GetMIMETypeByExtension(Path.GetExtension(fileName).ToLowerInvariant()), fileName);
        }

        /// <summary>
        /// GetEmailData: IdDocumentContainerScans
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetEmailData")]
        public async Task<object> GetEmailData()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentContainerBusiness.GetEmailData(model);
        }

        /// <summary>
        /// GetEmailAttachements: IdDocumentContainerScans
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetEmailAttachements")]
        public async Task<object> GetEmailAttachements()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentContainerBusiness.GetEmailAttachements(model);
        }

        [HttpGet("DocumentsOfTree")]
        public async Task<object> DocumentsOfTree()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentContainerBusiness.GetDocumentsOfTree(model);
        }
        [HttpGet("DocumentsOfEmailTree")]
        public async Task<object> DocumentsOfEmailTree()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentContainerBusiness.GetDocumentsOfEmailTree(model);
        }
    }
}
