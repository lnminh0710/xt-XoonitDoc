using DMS.Business;
using DMS.Models;
using DMS.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Diagnostics;
using System;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class PriceTagController : BaseController
    {
        private readonly IPriceTagBusiness _priceTagBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
       
        public PriceTagController(IPriceTagBusiness priceTagBusiness)
        {
            _priceTagBusiness = priceTagBusiness;
        }

        [HttpGet]
        [Route("")]
        [AllowAnonymous]
        public async Task<object> GetPriceTagById(Dictionary<string, object> data)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _priceTagBusiness.GetPriceTag(model);
        }

        [HttpPost]
        [Route("")]
        [AllowAnonymous]
        public async Task<object> CRUDPriceTag([FromBody] Dictionary<string, object> data)
        {
            return await _priceTagBusiness.CRUDPriceTag(data);
        }

        [HttpPost]
        [Route("remove")]
        [Authorize]
        public async Task<object> DeletePriceTag([FromBody] Dictionary<string, object> data)
        {

            return await _priceTagBusiness.DeletePriceTag(data);
        }

        [HttpPost]
        [Route("attachments")]
        public async Task<object> UploadDocuments(string type, CancellationToken cancellationToken)
        {
            _logger.Debug("Call API UploadDocuments");
            cancellationToken.ThrowIfCancellationRequested();

            //if (string.IsNullOrEmpty(type) || (type != "articles" && type != "projects")) {
            //    return StatusCode(400, "type is unknow");
            //}

            var request = HttpContext.Request;
            IFormFileCollection listFiles = request.Form.Files;
            long size = listFiles.Sum(f => f.Length);
            WSEditReturn rs = new WSEditReturn();
            rs.ReturnID = "-1";
            if (listFiles.Any())
            {
                try
                {
                    //List<ImageModel> imageModels = GetImageModel(request);
                    //if (CheckIsError(listFiles, imageModels))
                    //{
                    //    rs.EventType = "Images is invalid";
                    //    return StatusCode(400, rs);
                    //}
                    ImportPriceTagDocumentSessionModel sess = new ImportPriceTagDocumentSessionModel();
                    sess.IdPriceTag = request.Form["IdPriceTag"].Count > 0 ? request.Form["IdPriceTag"].First().ToString() : null;
                    sess.IdPriceTagMedia = request.Form["IdPriceTagMedia"].Count > 0 ? request.Form["IdPriceTagMedia"].First().ToString() : null;
                    sess.IdDocumentTreeMedia = request.Form["IdDocumentTreeMedia"].Count > 0 ? request.Form["IdDocumentTreeMedia"].First().ToString() : null;
                    //sess.IdDocumentType = request.Form["IdDocumentType"].Count > 0 ? request.Form["IdDocumentType"].First().ToString() : null;
                    //sess.IdRepDocumentType = request.Form["IdRepDocumentType"].Count > 0 ? request.Form["IdRepDocumentType"].First().ToString() : null;
                    //sess.IdRepTreeMediaType = request.Form["IdRepTreeMediaType"].Count > 0 ? request.Form["IdRepTreeMediaType"].First().ToString() : null;
                    
                    if (string.IsNullOrEmpty(sess.IdPriceTag))
                    {
                        rs.EventType = "IdPriceTag required";
                        return StatusCode(400, rs);
                    }
                    

                    var files = listFiles.OrderBy(f => f.FileName).ToList();
                    var watch = Stopwatch.StartNew();

                    rs = await _priceTagBusiness.SaveDocumentFile(sess, files, cancellationToken);
                    watch.Stop();

                    return StatusCode(200, rs);
                }
                catch (Exception exx)
                {
                    _logger.Error("Cannot upload documents to Server", exx);
                    rs.EventType = "Error: " + exx.Message;
                    return StatusCode(500, rs);
                }
            }

            rs.EventType = "Error: File Empty";
            return StatusCode(400, rs);
        }

        [HttpGet]
        [Route("attachments")]
        public async Task<object> GetMediaOfArticle()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _priceTagBusiness.GetAttachmentsOfPriceTag(model);
        }
    }
}
