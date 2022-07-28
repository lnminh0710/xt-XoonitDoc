using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DMS.Service;
using DMS.Utils;
using Microsoft.Extensions.Options;
using DMS.Models;
using System.Collections.Generic;
using RestSharp;
using System.Dynamic;
using Newtonsoft.Json;
using System.Net;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Internal;
using System.Linq;

namespace DMS.Business
{
    public class CommonBusiness : BaseBusiness, ICommonBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly ICommonService _commonService;
        public CommonBusiness(IHttpContextAccessor context, IOptions<AppSettings> appSettings,
            ICommonService commonService) : base(context)
        {
            _appSettings = appSettings.Value;
            _commonService = commonService;
        }

        public async Task<object> GetSystemInfo()
        {
            var result = await _commonService.GetSystemInfo(ServiceDataRequest);
            return result;
        }

        public async Task<List<MatchingPerson>> DedupeCheckPerson(CustomerMatchedModel person)
        {
            List<MatchingPerson> result = new List<MatchingPerson>();

            var restClient = new RestClient(_appSettings.MatchingApiUrl);

            if (_appSettings.MatchingWeight <= 0) _appSettings.MatchingWeight = 90;
            var _defaultThreshold = (double)_appSettings.MatchingWeight / 100;

            RestRequest request = new RestRequest("check", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Accept", "application/json");

            IList<XMatchField> searchPersonFields = new List<XMatchField>()
                    {
                        new XMatchField{name = "FirstName", threshold = _defaultThreshold},
                        new XMatchField{name = "LastName", threshold = _defaultThreshold},
                        new XMatchField{name = "Street", threshold = _defaultThreshold},
                        new XMatchField{name = "Zip", threshold = _defaultThreshold}
                    };

            dynamic model = new ExpandoObject();
            model.idRepIsoCountryCode = person.IdRepIsoCountryCode;
            model.fields = searchPersonFields;
            model.person = person;
            request.AddJsonBody(model);
            //request.AddParameter("application/json; charset=utf-8", JsonConvert.SerializeObject(model), ParameterType.RequestBody);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            #region Parse Data
            if (response.StatusCode == HttpStatusCode.OK)
            {
                result = JsonConvert.DeserializeObject<List<MatchingPerson>>(response.Content);
            }
            #endregion

            return result;
        }

        public async Task<WSEditReturn> CreateQueue(CreateQueueModel model)
        {
            CommonCreateQueueData data = (CommonCreateQueueData)ServiceDataRequest.ConvertToRelatedType(typeof(CommonCreateQueueData));
            //var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
            //{
            //    NullValueHandling = NullValueHandling.Ignore
            //});
            data.IdRepAppSystemScheduleServiceName = model.IdRepAppSystemScheduleServiceName.ToString();
            data.JSONText = model.JsonText;
            var result = await _commonService.CreateQueue(data);

            return result;
        }

        public async Task<WSEditReturn> DeleteQueues(DeleteQueuesModel model)
        {
            CommonDeleteQueuesData data = (CommonDeleteQueuesData)ServiceDataRequest.ConvertToRelatedType(typeof(CommonDeleteQueuesData));
            //var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
            //{
            //    NullValueHandling = NullValueHandling.Ignore
            //});
            data.QueuesId = model.QueuesId;
            var result = await _commonService.DeleteQueues(data);

            return result;
        }
        public async Task<object> GetScanSettings()
        {
            Data data = ServiceDataRequest;
            WSDataReturn wsDataReturn = await _commonService.GetScanSettings(data);
            if (wsDataReturn != null && wsDataReturn.Data != null && wsDataReturn.Data.Count > 0)
            {
                return wsDataReturn.Data[0];
            }
            return null;
        }
        public async Task<object> SaveScanSettings(SaveScanSettingModel model)
        {
            if (string.IsNullOrEmpty(model.JSONScanSettings))
            {
                throw new Exception("JSONScanSettings Is Null");
            }
            if (!ValidateJSON(model.JSONScanSettings))
            { throw new Exception("JSONScanSettings Is Not Valid Json"); }
            ScanSettingsSaveData data = (ScanSettingsSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(ScanSettingsSaveData));
            data.IsActive = model.IsActive ? "1" : "0";
            data.JSONScanSettings = model.JSONScanSettings;
            data.IdSettingsScans = model.IdSettingsScans;
            var result = await _commonService.SaveScanSettings(data);

            return result;

        }
        public bool ValidateJSON(string s)
        {
            try
            {

                JToken.Parse(s);
                return true;
            }
            catch (Exception )
            {
                return false;
            }
        }

        public async Task<object> GetDocumentProcessingQueues()
        {
            List<ImageProcessResponseModel> listFiles = new List<ImageProcessResponseModel>();
            CommonGetQueuesData data = (CommonGetQueuesData)ServiceDataRequest.ConvertToRelatedType(typeof(CommonGetQueuesData));
            WSDataReturn wsDataReturn = await _commonService.GetDocumentProcessingQueues(data);
            if (wsDataReturn != null && wsDataReturn.Data != null && wsDataReturn.Data.Count > 0)
            {
                //  return wsDataReturn.Data[0];
                List<ScheduleQueue> list = JsonConvert.DeserializeObject<List<ScheduleQueue>>(wsDataReturn.Data[0].ToString());
                foreach (ScheduleQueue item in list)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(item.JsonLog))
                        {
                            UploadImageProcessModel model = JsonConvert.DeserializeObject<UploadImageProcessModel>(item.JsonLog);
                            if (!string.IsNullOrEmpty(model.IdLogin) && model.IdLogin == data.IdLogin)
                            {
                                foreach (ImageProcessModel image in model.Images)
                                {
                                    if (string.IsNullOrEmpty(image.FileName))
                                    {
                                        image.FileName = Path.GetFileName(image.FilePath);
                                    }
                                    listFiles.Add(new ImageProcessResponseModel
                                    {
                                        FileName = !string.IsNullOrEmpty(image.FileName) ? image.FileName : Path.GetFileName(image.FilePath),
                                        IdDocumentContainerScans = model.IdDocumentContainerScans
                                    });


                                }
                            }
                        }
                    }
                    catch (Exception e)
                    {

                    }
                }
            }
            return listFiles.Distinct();
        }
    }
}
