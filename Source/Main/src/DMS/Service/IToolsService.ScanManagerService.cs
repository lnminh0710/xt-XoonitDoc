using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    /// <summary>
    /// ToolsService
    /// </summary>
    public partial class ToolsService : BaseUniqueServiceRequest, IToolsService
    {
        public ToolsService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        #region Dispatcher
        public async Task<object> GetScanCenter(Data data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanCenter";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanCenterDispatcher(ToolScanManagerData data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanCenterDispatcher";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanCenterPools(ToolScanManagerData data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanCenterPools";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanDataEntryCenter(Data data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanDataEntryCenter";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<WSEditReturn> SaveScanDispatcherPool(ToolScanManagerData data)
        {
            data.MethodName = "SpCallScanningOrdersEntry";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveScanDispatcherPool";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> SaveScanUndispatch(ToolScanManagerData data)
        {
            data.MethodName = "SpCallScanningOrdersEntry";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveScanUndispatch";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        #endregion

        #region Scan Assignment

        public async Task<object> GetScanAssigned(Data data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanAssigned";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanAssignmentDataEntryCenter(Data data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanAssignmentSelectDataEntryCenter";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanAssignmentSelectPool(ToolScanManagerData data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanAssignmentSelectPoll";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanAssignmentUsers(Data data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanAssignmentUserLogins";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetScanAssignmentUserLanguageAndCountry(ToolScanManagerData data)
        {
            data.MethodName = "SpAppB01ScanningDataEntry";
            data.Object = "GetScanAssignmentUserLanguageAndCountry";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<WSEditReturn> SaveSAPoolUser(ToolScanManagerData data)
        {
            data.MethodName = "SpCallScanningOrdersEntry";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveAssignPoolUser";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> DeleteSAPoolUser(ToolScanManagerData data)
        {
            data.MethodName = "SpCallScanningOrdersEntry";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SavePoolAndUserUnAssign";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetMatchingPerson(MatchingData data)
        {
            data.MethodName = "SpCallMatching";
            data.Object = "GetMatchingPerson";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        #endregion

        #region [Matching Tools]

        public Task<object> GetMatchingCountry(MatchingConfigurationData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpCallMatching", "GetMatchingCountry");
        }

        public Task<object> GetMatchingColumns(MatchingConfigurationData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpCallMatching", "GetMatchingColumns");
        }

        public Task<object> GetMatchingConfiguration(MatchingConfigurationData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg00MatchingTool", "");
        }

        public Task<WSEditReturn> SaveMatchingConfiguration(MatchingConfigurationSavingData data)
        {
            return SaveData(data, "SpCallMatchingTool", "");
        }

        public Task<object> GetScheduleTime(MatchingConfigurationData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg00MatchingToolSchedule", "");
        }

        public Task<WSEditReturn> SaveScheduleTime(MatchingConfigurationSavingData data)
        {
            return SaveData(data, "SpCallMatchingToolSchedule", "");
        }

        #endregion
    }
}
