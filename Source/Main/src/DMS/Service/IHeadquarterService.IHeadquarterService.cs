using DMS.ServiceModels;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public class HeadquarterService : BaseUniqueServiceRequest, IHeadquarterService
    {
        public HeadquarterService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }

        public async Task<WSEditReturn> SaveFormDynamicData(SaveDynamicData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = saveData.SpMethodName;
            data.Object = saveData.SpObject;

            if (string.IsNullOrEmpty(data.AppModus))
            {
                data.AppModus = "0";
            }

            var expandData = Common.ToDictionary(data);
            //var types = new List<Type>() { typeof(object), typeof(Array), typeof(JObject), typeof(JArray) };
            //foreach (KeyValuePair<string, object> entry in saveData.Data)
            //{
            //    if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

            //    var key = entry.Key;
            //    if (entry.Value != null && !entry.Key.StartsWith("JSON") && types.Contains(entry.Value.GetType()))
            //    {
            //        key = "JSON" + entry.Key;
            //    }
            //    expandData[key] = Common.CreateJsonText(entry.Key, entry.Value);
            //}

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSEditReturn> SaveFormData(SaveDynamicData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = saveData.SpMethodName;
            data.Object = saveData.SpObject;

            if (string.IsNullOrEmpty(data.AppModus))
            {
                data.AppModus = "0";
            }

            var expandData = Common.ToDictionary(data);
            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = entry.Key;
                //if (entry.Key.StartsWith("JSON"))
                //{
                //    key = entry.Key;
                //}
                if (entry.Value == null || entry.Value.GetType() == typeof(string) || entry.Value.GetType() == typeof(int))
                {
                    expandData[key] = entry.Value;
                }
                else
                {
                    expandData[key] = JsonConvert.SerializeObject(entry.Value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });// Common.CreateJsonText(entry.Key, entry.Value);
                }
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSEditReturn> SaveProcessingForm(SaveDynamicData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = saveData.SpMethodName;
            data.Object = saveData.SpObject;

            var expandData = Common.ToDictionary(data);

            var types = new List<Type>() { typeof(object), typeof(Array), typeof(JObject), typeof(JArray) };
            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = entry.Key;
                if (entry.Value != null && !entry.Key.StartsWith("JSON") && types.Contains(entry.Value.GetType()))
                {
                    key = "JSON" + entry.Key;
                }
                expandData[key] = entry.Value + string.Empty;
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);
            //JsonConvert.SerializeObject(expandData)
            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSEditReturn> SaveApprovalUserAutoReleased(SaveApprovalUserAutoReleasedData saveData)
        {
            var expandData = Common.ToDictionary(saveData);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<JArray> SaveApprovalUser(SaveApprovalUserAutoReleasedData saveData)
        {
            var expandData = Common.ToDictionary(saveData);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        public async Task<JArray> GetDataExtractedAI(DynamicData dynamicData)
        {
            if (dynamicData.Data.GUID == null)
            {
                dynamicData.Data.GUID = Guid.NewGuid().ToString();
            }

            var expandData = Common.ToDictionary(dynamicData.Data);
            foreach (KeyValuePair<string, object> entry in dynamicData.ParamsData)
            {
                if (dynamicData.IgnoredKeys.Contains(entry.Key)) continue;
                expandData[entry.Key] = entry.Value + string.Empty;
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);
            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            //var expandData = Common.ToDictionary(saveData);
            //BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            //var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }
    }
}
