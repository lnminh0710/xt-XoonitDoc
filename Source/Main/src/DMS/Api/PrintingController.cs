using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using System;
using DMS.Utils;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class PrintingController : Controller
    {
        private IPathProvider _pathProvider;
        private readonly IPrintingBusiness _printingBusiness;

        public PrintingController(IPrintingBusiness printingBusiness, IPathProvider pathProvider)
        {
            _pathProvider = pathProvider;
            _printingBusiness = printingBusiness;
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("GetStatus")]
        public ActionResult<bool> GetStatus()
        {
            return true;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("GetCampaignDatas")]
        public async Task<object> GetCampaigns(string objectName)
        {
            return await _printingBusiness.GetCampaigns(objectName);
        }

        [HttpPost]
        [Route("Confirm")]
        [AllowAnonymous]
        public async Task<object> ConfirmGetCampain([FromBody]PrintingCampaignConfirmModel model)
        {
            return await _printingBusiness.ConfirmGetCampaign(model);
        }

        [HttpPost]
        [Route("DownloadTemplates")]
        [AllowAnonymous]
        public async Task<object> DownloadTemplates([FromBody]PrintingDownloadTemplatesModel model)
        {
            try
            {
                string uploadFolder = _pathProvider.GetFullUploadFolderPath(UploadMode.Printing, model.IdFolder);
                foreach (var item in model.Templates)
                {
                    item.Path = uploadFolder;
                }//for

                var response = await _printingBusiness.DownloadTemplates(model);

                if (!string.IsNullOrEmpty(response.FullFileName))
                {
                    return File(response.Content, System.Net.Mime.MediaTypeNames.Application.Octet, response.FileName);
                }

                return new
                {
                    Message = "Create zip file failed"
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Message = ex.Message,
                    StackTrace = ex.ToString(),
                };
            }
        }

        [HttpPost]
        [Route("DownloadArticleMedia")]
        [AllowAnonymous]
        public async Task<object> DownloadArticleMedia([FromBody]IList<ArticleMedia> articleMediaList)
        {
            try
            {
                if (articleMediaList != null && articleMediaList.Any())
                {
                    string rootUploadFolderPath = _pathProvider.FileShare;
                    string uploadPrintingFolder = _pathProvider.GetFullUploadFolderPath(UploadMode.Printing);

                    var response = await _printingBusiness.DownloadArticleMedia(articleMediaList, rootUploadFolderPath, uploadPrintingFolder);

                    if (!string.IsNullOrEmpty(response.FullFileName))
                    {
                        return File(response.Content, System.Net.Mime.MediaTypeNames.Application.Octet, response.FileName);
                    }

                }
                return new
                {
                    Message = "Create zip file failed"
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Message = ex.Message,
                    StackTrace = ex.ToString(),
                };
            }
        }
    }
}
