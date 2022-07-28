using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System.Threading.Tasks;
using DMS.Constants;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Dynamic;
using Newtonsoft.Json.Serialization;

namespace DMS.Utils
{
    /// <summary>
    /// RestRequestHelper
    /// </summary>
    public partial class RestRequestHelper : IRestRequestHelper
    {
        /// <summary>
        /// Execute Post
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="body"></param>
        /// <param name="mappingType"></param>
        /// <param name="parameter"></param>
        /// <param name="resource"></param>
        /// <param name="version"></param>
        /// <param name="resultIndexForParsing"></param>
        /// <returns></returns>
        public async Task<T> ExecutePost<T>(object body, EExecuteMappingType mappingType, Dictionary<string, object> parameter = null,
            string resource = "", string version = "", int resultIndexForParsing = 0) where T : class
        {
            var request = CreateRestRequest();

            #region Prepare Request
            _version = string.Format(CultureInfo.CurrentCulture, _version, version);
            if (!string.IsNullOrWhiteSpace(_version) ||
                !string.IsNullOrWhiteSpace(ServiceName) ||
                !string.IsNullOrWhiteSpace(resource))
            {
                string res = string.Format(CultureInfo.CurrentCulture, "{0}/{1}/{2}", _version, ServiceName, resource);
                char last = res[res.Length - 1];
                if (last == '/')
                {
                    res = res.Remove(res.Length - 1);
                }
                request.Resource = res;
            }

            request.Method = Method.POST;
            Dictionary<int, object> retObject = new Dictionary<int, object>();

            if (body != null)
                request.AddBody(body);

            if (parameter != null)
            {
                var paramKeys = parameter.Keys.ToArray();
                var paramVals = parameter.Values.ToArray();
                if (paramKeys.Length == paramVals.Length)
                {
                    for (var i = 0; i < paramKeys.Length; i++)
                    {
                        AddParameter(request, paramKeys[i], paramVals[i], ParameterType.QueryString);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(AuthString))
            {
                AddParameter(request, "Authorization", AuthString, ParameterType.HttpHeader);
            }
            #endregion

            #region TraceLog: Start
            // start log time for Unique Service
            var watch = new Stopwatch();
            var now = DateTime.Now;
            if (_appSettings.EnableTimeTraceLog)
            {
                var context = _httpContextAccessor.HttpContext;
                watch.Start();
                context.Response.OnStarting(state =>
                {
                    var httpContext = (HttpContext)state;
                    if (string.IsNullOrEmpty(httpContext.Response.Headers[Constants.ConstAuth.LogTimeUniqueService]))
                    {
                        string log = string.Format("start: {0} - end: {1} - total: {2}ms",
                            now.Subtract(watch.Elapsed).ToString("dd/MM/yyyy hh:mm:ss:fff"),
                            now.ToString("dd/MM/yyyy HH:mm:ss:fff"),
                            watch.ElapsedMilliseconds);
                        httpContext.Response.Headers.Add(Constants.ConstAuth.LogTimeUniqueService, new[] { log });
                    }
                    return Task.FromResult(0);
                }, context);
            }

            if (_appSettings.ShowDBQuery && _loggerSQL != null && body != null)
            {
                _loggerSQL.Debug(JsonConvert.SerializeObject(body));
            }
            #endregion

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = _client.ExecuteAsync(request, res => taskCompletion.SetResult(res));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            #region TraceLog: End
            // stop log time for Unique Service
            if (_appSettings.EnableTimeTraceLog)
            {
                watch.Stop();
                now = DateTime.Now;
            }
            #endregion

            if (response.StatusCode == HttpStatusCode.OK ||
                response.StatusCode == HttpStatusCode.NonAuthoritativeInformation ||
                response.StatusCode == HttpStatusCode.NoContent ||
                response.StatusCode == HttpStatusCode.ResetContent ||
                response.StatusCode == HttpStatusCode.PartialContent ||
                response.StatusCode == HttpStatusCode.Created)
            {
                ResultResponse resultResponse = JsonConvert.DeserializeObject<ResultResponse>(response.Content);
                if (resultResponse != null && resultResponse.Data != null)
                {
                    try
                    {
                        return MakeGenericMapping<T>(resultResponse.Data, mappingType, resultIndexForParsing);
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
            }
            else
            {
                var exception = new Exception(response.ErrorMessage ?? "Exception from Unique Service API");
                exception.Data["Content"] = response.Content;
                throw exception;
            }
            return null;
        }

        private T MakeGenericMapping<T>(string jsonData, EExecuteMappingType mappingType, int resultIndexForParsing) where T : class
        {
            // replace all emty object({}) with empty string("")
            //jsonData = jsonData.Replace(":{},", @":"""",")
            //                   .Replace(": {},", @": """",")
            //                   .Replace(": {}", @": """"")
            //                   .Replace(":{}", @":""""");
            jsonData = jsonData.ToString()
                                      .Replace(":{},", @":null,")
                                      .Replace(": {},", @":null,")
                                      .Replace(": {}", @":null,")
                                      .Replace(":{}", @":null,");

            JArray jsonArray = JArray.Parse(jsonData);
            if (jsonArray.Count <= 0) return null;

            switch (mappingType)
            {
                case EExecuteMappingType.None:
                    return jsonArray.ToObject<T>();

                case EExecuteMappingType.Normal:
                    return JsonConvert.DeserializeObject<T>(jsonArray[resultIndexForParsing] + string.Empty);

                case EExecuteMappingType.ComboBox:
                    return JsonConvert.DeserializeObject<T>(MapCombobox(jsonArray));

                case EExecuteMappingType.Country:
                case EExecuteMappingType.Country2:
                    return JsonConvert.DeserializeObject<T>(MapCountry(jsonArray, mappingType));

                case EExecuteMappingType.TabSummary:
                    return JsonConvert.DeserializeObject<T>(MapTabSummaryNewDynamic(jsonArray));

                case EExecuteMappingType.CreatePerson:
                    if (jsonArray.Count > 0)
                    {
                        string jsonResult = jsonArray.Last + string.Empty;
                        if (Common.IsValidJson(jsonResult))
                            return JsonConvert.DeserializeObject<T>(jsonResult);
                    }
                    break;
                case EExecuteMappingType.DataFormDetail:
                    return (T)MapDynamic_DataFormDetail<T>(jsonArray);

                    //case EExecuteMappingType.Dynamic:
                    //    return JsonConvert.DeserializeObject<T>(MapDynamic_DataFormDetail(jsonArray));
                    //case EExecuteMappingType.DynamicType2:
                    //    MapDynamicType2(jsonArray, expectedReturn, mappingType, retObject);
                    //    break;
                    //case EExecuteMappingType.DynamicType3:
                    //    MapDynamicType3(jsonArray, expectedReturn, mappingType, retObject);
                    //    break;
                    //case EExecuteMappingType.DynamicType4:
                    //case EExecuteMappingType.DynamicCoulumnsType:
                    //    MapDynamicType4(jsonArray, expectedReturn, mappingType, retObject);
                    //    break;
            }//switch

            return null;
        }

        /*
        "articleNr": {
            "displayValue": "ArticleNr",
            "value": "875600",
            "originalComlumnName": "ArticleNr"
        }
        */
        private string MapDynamic_DataTable(JArray jsonArray)
        {
            var colPropertiesJson = ((JProperty)jsonArray.First.First.First).Value.ToString();
            string[] colOriginalProperties = colPropertiesJson
                                    .Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries).Select(n => (n + string.Empty).Trim()).ToArray();

            Dictionary<string, object> dataModel = new Dictionary<string, object>();

            #region Convert all values to string
            //Ignore i = 0 -> array ColumnName
            var jsonArrayCount = jsonArray.Count;
            for (int i = 1; i < jsonArrayCount; i++)
            {
                //Loop each Array
                foreach (var item in ((JArray)jsonArray[i]))
                {
                    Dictionary<string, object> model = new Dictionary<string, object>();
                    JProperty[] jProperties = ((JObject)item).Properties().ToArray();
                    for (int iProp = 0; iProp < jProperties.Count(); iProp++)
                    {
                        JProperty prop = jProperties[iProp];

                        string propName = prop.Name.Trim();
                        if (propName == string.Empty) continue;

                        string proValue = prop.Value + string.Empty;
                        if (proValue == "{}")
                        {
                            proValue = null;
                        }
                        else
                        {
                            if (prop.Name == ConstNameSpace.DynamicColumn)
                            {
                                proValue = WebUtility.UrlEncode(proValue);
                            }
                            else if (prop.Value.Type == JTokenType.Date)
                            {
                                proValue = prop.Value.Value<DateTime>().ToString("u");
                            }
                        }

                        //procecss for jArray Data
                        if (i == jsonArrayCount - 1)
                        {
                            /*
                            "articleNr": {
                              "displayValue": "ArticleNr",
                              "value": "875600",
                              "originalComlumnName": "ArticleNr"
                            }
                             */
                            string originalPropName = colOriginalProperties[iProp].Trim();

                            Dictionary<string, object> modelValue = new Dictionary<string, object>();
                            modelValue[ConstNameSpace.ModelPropertyDisplayValue] = propName;
                            modelValue[ConstNameSpace.ModelPropertyValue] = proValue;
                            modelValue[ConstNameSpace.ModelPropertyOriginalColumnName] = originalPropName;

                            model[originalPropName] = modelValue;

                        }
                        else
                        {
                            prop.Value = proValue;

                            dataModel[propName] = proValue;
                        }

                    }//for JProperty

                    if (model.Count > 0)
                        dataModel["Data"] = model;

                }//for JArray Child
            }//for JArray Parent
            #endregion

            var jsonResult = JsonConvert.SerializeObject(dataModel,
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver(),
                    Formatting = Formatting.Indented
                });

            return jsonResult;
        }

        public object MapDynamic_DataFormDetail<T>(JArray jArray) where T : class
        {
            Dictionary<string, object> model = new Dictionary<string, object>();
            //Ignore i = 0 -> array ColumnName
            if (jArray.Count < 2) return model;

            foreach (JObject jObject in jArray[1])
            {
                /*
                "articleNr": {
                    "displayValue": "ArticleNr",
                    "value": "875600",
                    "OriginalColumnName": "ArticleNr"
                }
                */
                Dictionary<string, object> modelValue = new Dictionary<string, object>();
                foreach (JProperty prop in jObject.Properties())
                {
                    var nameFirstCharacterToLower = ConverterUtils.FirstCharacterToLower(prop.Name);
                    if (prop.Name == "Value")
                        modelValue[nameFirstCharacterToLower] = ConverterUtils.ConvertJTokenValue(prop.Value);
                    else if (prop.Name == "ColumnName")
                        modelValue["displayValue"] = prop.Value;
                    else
                        modelValue[nameFirstCharacterToLower] = prop.Value;

                }//for JProperty

                var key = jObject.GetValue("OriginalColumnName") + string.Empty;
                var arrKey = key.Split(new char[] { '_' }, StringSplitOptions.RemoveEmptyEntries);
                key = arrKey.Length > 1 ? arrKey[1] : arrKey[0];
                model[ConverterUtils.FirstCharacterToLower(key)] = modelValue;
            }

            return model;
        }

        /// <summary>
        /// map for Tab Summary type
        /// </summary>
        /// <param name="jsonArray"></param>
        /// <returns></returns>
        private string MapTabSummaryNew(JArray jsonArray)
        {
            string jsonResult = string.Empty;
            for (int i = 0; i + 1 < jsonArray.Count; i += 2)
            {
                jsonResult += string.Format(@"{{""{0}"":{1},""{2}"":{3},""{4}"":{5}}},",
                                    ConstNameSpace.TabSummaryInfor, jsonArray[i].First + string.Empty, //0, 1
                                    ConstNameSpace.TabSummaryData, jsonArray[i + 1] + string.Empty, //2, 3
                                    ConstNameSpace.TabSummaryRawData, jsonArray[i + 1] + string.Empty); //4, 5
            }
            jsonResult = jsonResult.Remove(jsonResult.Length - 1, 1);
            jsonResult = string.Format(@"[{0}]", jsonResult);
            return jsonResult;
        }

        static string MapTabSummaryNewDynamic(JArray jsonArray)
        {
            List<object> listDynamic = new List<object>();
            for (int i = 0; i + 1 < jsonArray.Count; i += 2)
            {
                var resultDictionary = new Dictionary<string, object>
                {
                    [ConstNameSpace.TabSummaryInfor] = jsonArray[i].First,
                    [ConstNameSpace.TabSummaryData] = jsonArray[i + 1],
                    [ConstNameSpace.TabSummaryRawData] = ((JArray)jsonArray[i + 1]).ToObject<List<ExpandoObject>>()
                };
                listDynamic.Add(resultDictionary);
            }//for

            return JsonConvert.SerializeObject(listDynamic, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        }
    }
}
