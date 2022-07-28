using DMS.Utils;
using Microsoft.Extensions.Options;
using System.Linq;
using System;
using System.IO;
using System.Collections.Generic;
using DMS.Models.DMS;
using RestSharp;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using DMS.Models;

namespace DMS.Business
{
    public class OCRDocumentBusiness : IOCRDocumentBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        //private const string ROOT_PATH = "\\\\file.xena.local\\Expense";

        public OCRDocumentBusiness(IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting)
        {
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
        }
        
        public async Task<object> ManuallyOCRForDocuments(RequestOCRMauallyModel ocr_ids)
        {
            string ocr_service_api = _appSettings.APIRunOCRForDOC;
            var restClient = new RestClient(ocr_service_api);
            
            RestRequest request = new RestRequest("/", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            
            request.AddJsonBody(ocr_ids);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response != null && response.ErrorException != null)
            {
                throw response.ErrorException;
            }
            //#region check status
            //if (response.StatusCode == HttpStatusCode.OK)
            //{
            //    return (object)(response.Content);
            //}
            //#endregion

            return response;
        }

    }
}
