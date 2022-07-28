using DMS.Constants;
using DMS.ServiceModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// BaseUniqueServiceRequest
    /// </summary>
    public abstract class BaseUniqueServiceRequest : BaseRestServiceRequest
    {
        private string _host = string.Empty;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;

        public BaseUniqueServiceRequest(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
            : base(appSettings, httpContextAccessor)
        {
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
        }

        /// <summary>
        /// Host
        /// </summary>
        protected override string Host
        {
            get
            {
                if (string.IsNullOrEmpty(_host))
                {
                    _host = _serverConfig.ServerSetting.ServiceUrl;
                }
                return _host;
            }
        }

        /// <summary>
        /// AuthString
        /// </summary>
        protected override string AuthString
        {
            get { return ""; }
        }

        /// <summary>
        /// ServiceName
        /// </summary>
        protected override string ServiceName
        {
            get { return "UniqueService"; }
        }

        #region Get Data, Save Data
        protected async Task<object> GetDataWithMapTypeIsNone(Data data)
        {
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }

        protected async Task<object> GetDataWithMapTypeIsNone(Data data, string methodName, string objectName)
        {
            data.MethodName = methodName;
            data.Object = objectName;

            return await GetDataWithMapTypeIsNone(data);
        }

        protected async Task<WSEditReturn> SaveData(Data data)
        {
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        protected async Task<WSEditReturn> SaveData(Data data, string methodName, string objectName)
        {
            data.MethodName = methodName;
            data.Object = objectName;

            return await SaveData(data);
        }
        #endregion

        #region Common
        /// <summary>
        /// ToExpandoObject
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public ExpandoObject ToExpandoObject(object obj)
        {
            // Null-check
            IDictionary<string, object> expando = new ExpandoObject();

            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(obj.GetType()))
            {
                expando.Add(property.Name, property.GetValue(obj));
            }

            return (ExpandoObject)expando;
        }

        /// <summary>
        /// CreateBodyRequest
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        protected BodyRequest CreateBodyRequest(Data data)
        {
            if (data.GUID == null)
            {
                data.GUID = Guid.NewGuid().ToString();
            }
            return CreateBodyRequestObject(data);
        }

        /// <summary>
        /// CreateBodyRequestObject
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        protected BodyRequest CreateBodyRequestObject(object data)
        {
            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Formatting.None,
                            new JsonSerializerSettings
                            {
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            return new BodyRequest { Request = uniq };
        }
        #endregion

        #region GetRawDynamicData
        /// <summary>
        /// GetRawDynamicData
        /// </summary>
        /// <param name="dynamicData"></param>
        /// <param name="mappingType"></param>
        /// <param name="returnType"></param>
        /// <returns></returns>
        protected async Task<object> GetRawDynamicData(DynamicData dynamicData, EExecuteMappingType mappingType = EExecuteMappingType.None, EDynamicDataGetReturnType returnType = EDynamicDataGetReturnType.None)
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
            var response = (await Service.Post(body: bodyRquest, expectedReturn: null, mappingType: mappingType))[0];
            return ParseGetRawData(response, returnType);
        }

        protected async Task<object> GetRawDynamicDataFormTable(DynamicData dynamicData, EExecuteMappingType mappingType = EExecuteMappingType.None, EDynamicDataGetReturnType returnType = EDynamicDataGetReturnType.None)
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
            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));// (await Service.Post(body: bodyRquest, expectedReturn: null, mappingType: EExecuteMappingType.None));
            return response;
        }

        private object ParseGetRawData(object response, EDynamicDataGetReturnType returnType = EDynamicDataGetReturnType.None)
        {
            if (returnType == EDynamicDataGetReturnType.None) return response;
            if (response == null) return new JArray();

            var jArray = (JArray)response;
            switch (returnType)
            {
                case EDynamicDataGetReturnType.OneRow:
                    if (jArray.Count > 0 && ((JArray)jArray[0]).Count > 0) return jArray[0][0];
                    return response;
                case EDynamicDataGetReturnType.Datatable:
                    if (jArray.Count > 0) return jArray[0];
                    return response;
                default:
                    return response;
            }
        }
        #endregion

        #region SaveDynamicData
        /// <summary>
        /// SaveDynamicData
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        protected async Task<WSEditReturn> SaveDynamicData(DynamicData saveData)
        {
            return await SaveDynamicData<WSEditReturn>(saveData);
        }

        /// <summary>
        /// SaveDynamicData
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="saveData"></param>
        /// <returns></returns>
        protected async Task<T> SaveDynamicData<T>(DynamicData saveData) where T : class
        {
            if (saveData.Data.GUID == null)
            {
                saveData.Data.GUID = Guid.NewGuid().ToString();
            }

            saveData.IgnoredKeys = saveData.IgnoredKeys ?? new List<string>();

            var expandData = Common.ToDictionary(saveData.Data);
            foreach (KeyValuePair<string, object> entry in saveData.ParamsData)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                expandData[entry.Key] = entry.Value;
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(T));
            var response = (await Service.Post(body: bodyRquest, expectedReturn: expectedReturn))[0];
            return response != null ? ((IList<T>)response).FirstOrDefault() : null;
        }
        #endregion

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
    }
}
