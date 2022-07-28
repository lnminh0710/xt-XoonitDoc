using DMS.Business;
using DMS.Business.CloudDriveBusiness;
using DMS.Models.DMS;
using DMS.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CloudFilesController : Controller
    {
        private readonly ICloudBusiness _cloudBusiness;
        private readonly ICloudJobBusiness _cloudJobBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public CloudFilesController(ICloudBusiness cloudBusiness, ICloudJobBusiness cloudJobBusiness)
        {
            _cloudBusiness = cloudBusiness;
            _cloudJobBusiness = cloudJobBusiness;

        }

        [HttpPost]
        [Route("SyncDocumentManually")]
        [AllowAnonymous]
        public async Task<object> SyncDocumentsxx([FromBody]CloudSyncManually syncModel)
        {
            //if (syncModel == null) return "Data undefined";

            return await _cloudBusiness.UploadDocumentTestingToGoogleDrive(syncModel);
            //return await _cloudBusiness.FindSharedFolderOnDropbox("tuan","tuannguyenxl@gmail.com");
        }
        [HttpPost]
        [Route("SyncDocumentManuallyTest")]
        [AllowAnonymous]
        public async Task<object> SyncDocumentManuallyTest([FromBody] CloudSyncManuallyTest syncModel)
        {
            //if (syncModel == null) return "Data undefined";

             await _cloudJobBusiness.SyncDocumentsByIdsJob("test", syncModel.data, syncModel.cloudActiveUser, syncModel.syncModel);
            //return await _cloudBusiness.FindSharedFolderOnDropbox("tuan","tuannguyenxl@gmail.com");
            return true;
        }


        [HttpPost]
        [Route("File")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFile([FromBody]CloudViewDocModel model)
        {
            {
                try
                {
                    //ReponseDetailUploadDocToGD c = new ReponseDetailUploadDocToGD();
                    //c.id = "1Pl8qZy2VCGxlyC28BFHb_57dsxdwNSis";
                    //c.urlViewDoc = "";

                    //ReponseUploadDocToCloud b = new ReponseUploadDocToCloud();
                    //b.TypeCloud = "googledrive";
                    //b.ViewDocInfo = JsonConvert.SerializeObject(c);
                    ////b.ConnectionString = "";

                    //CloudViewDocModel a = new CloudViewDocModel();
                    //a.CloudMediaPath = "Notes";
                    //a.CloudMediaName = "Scan_002303.tiff.pdf";
                    //a.CloudFilePath = JsonConvert.SerializeObject(b);

                    var dataDownloaded = await _cloudBusiness.DownloadFile(model);
                    try
                    {
                        CloudDownloadFileReponse dataReturn = (CloudDownloadFileReponse)dataDownloaded;

                        var base64 = Convert.ToBase64String(ReadFully(dataReturn.stream));
                        return Ok(base64);

                    }
                    catch (Exception ex)
                    {
                        _logger.Error("get file from cloud", ex);
                        Stream stream = (Stream)dataDownloaded;

                        var base64 = Convert.ToBase64String(ReadFully(stream));
                        return Ok(base64);
                    }
                }
                catch (Exception e)
                {
                    return StatusCode(500, e);
                }

            }

        }

        private byte[] ReadFully(Stream input)
        {
            input.Position = 0;
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

    }

}
;
