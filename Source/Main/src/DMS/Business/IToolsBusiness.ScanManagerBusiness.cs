using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using System.Reflection;
using Newtonsoft.Json;
using DMS.Utils.ElasticSearch;

namespace DMS.Business
{
    public partial class ToolsBusiness : BaseBusiness, IToolsBusiness
    {
        private readonly IToolsService _toolsService;

        public ToolsBusiness(IHttpContextAccessor context, IToolsService toolsService) : base(context)
        {
            _toolsService = toolsService;
        }

        #region Dispatcher

        public async Task<object> GetScanCenter(string mode)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            data.Mode = mode;
            var result = await _toolsService.GetScanCenter(data);
            return result;
        }

        public async Task<object> GetScanCenterPools(int? idScanCenter)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            data._IdScanCenter = idScanCenter;
            var result = await _toolsService.GetScanCenterPools(data);
            return result;
        }

        public async Task<object> GetScanDataEntryCenter()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _toolsService.GetScanDataEntryCenter(data);
            return result;
        }

        public async Task<object> GetScanCenterDispatcher(int? idScanCenter)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            data._IdScanCenter = idScanCenter;
            var result = await _toolsService.GetScanCenterDispatcher(data);
            return result;
        }

        public async Task<WSEditReturn> SaveScanDispatcherPool(ScanDispatcherPoolModel model)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            if (model != null && model.ScanDispatcherPools != null && model.ScanDispatcherPools.Count > 0)
            {
                foreach (var item in model.ScanDispatcherPools)
                {
                    if (item.MarkActive != null)
                    {
                        item.IsActive = (bool)item.MarkActive ? "1" : "0";
                        item.MarkActive = null;
                    }
                }

                var _jSON = JsonConvert.SerializeObject(model.ScanDispatcherPools,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONSaveScanDispatcherPool = string.Format(@"""JSONSaveScanDispatcherPool"":{0}", _jSON);
                data.JSONSaveScanDispatcherPool = "{" + data.JSONSaveScanDispatcherPool + "}";
            }
            var result = await _toolsService.SaveScanDispatcherPool(data);
            return result;
        }

        public async Task<WSEditReturn> SaveScanUndispatch(ScanUndispatcherPoolModel model)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            if (model != null && model.ScanUndispatcherPool != null && model.ScanUndispatcherPool.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.ScanUndispatcherPool,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONSaveScanDispatcherUndispatch = string.Format(@"""JSONSaveScanDispatcherUndispatch"":{0}", _jSON);
                data.JSONSaveScanDispatcherUndispatch = "{" + data.JSONSaveScanDispatcherUndispatch + "}";
            }
            var result = await _toolsService.SaveScanUndispatch(data);
            return result;
        }

        #endregion

        #region Scan Assignment

        public async Task<object> GetScanAssigned()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _toolsService.GetScanAssigned(data);
            return result;
        }

        public async Task<object> GetScanAssignmentDataEntryCenter()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _toolsService.GetScanAssignmentDataEntryCenter(data);
            return result;
        }

        public async Task<object> GetScanAssignmentUsers()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _toolsService.GetScanAssignmentUsers(data);
            return result;
        }

        public async Task<object> GetScanAssignmentSelectPool(int? idPerson)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            data.IdPerson = idPerson;
            var result = await _toolsService.GetScanAssignmentSelectPool(data);
            return result;
        }

        public async Task<object> GetScanAssignmentUserLanguageAndCountry(ScanAssignmentUserLanguageCountry model)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            data.IdPerson = model.IdPerson;
            data.IdScansContainer = model.IdScansContainer;
            data.IdScansContainerDispatchers = model.IdScansContainerDispatchers;
            var result = await _toolsService.GetScanAssignmentUserLanguageAndCountry(data);
            return result;
        }

        public async Task<WSEditReturn> SaveSAPoolUser(ScanAssignmentPoolUserModel model)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            if (model != null && model.ScanAssignmentPools != null && model.ScanAssignmentPools.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.ScanAssignmentPools,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONSSaveAssignPool = string.Format(@"""SaveAssignPool"":{0}", _jSON);
                data.JSONSSaveAssignPool = "{" + data.JSONSSaveAssignPool + "}";
            }

            if (model != null && model.ScanAssignmentUserLogins != null && model.ScanAssignmentUserLogins.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.ScanAssignmentUserLogins,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONSSaveAssignUser = string.Format(@"""SaveAssignUser"":{0}", _jSON);
                data.JSONSSaveAssignUser = "{" + data.JSONSSaveAssignUser + "}";
            }
            var result = await _toolsService.SaveSAPoolUser(data);
            return result;
        }

        public async Task<WSEditReturn> DeleteSAPoolUser(ScanAssignmentPoolUserModel model)
        {
            ToolScanManagerData data = (ToolScanManagerData)ServiceDataRequest.ConvertToRelatedType(typeof(ToolScanManagerData));
            if (model != null && model.ScanAssignmentPools != null && model.ScanAssignmentPools.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.ScanAssignmentPools,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONSavePoolAndUserUnAssign = string.Format(@"""SavePoolAndUserUnAssign"":{0}", _jSON);
                data.JSONSavePoolAndUserUnAssign = "{" + data.JSONSavePoolAndUserUnAssign + "}";
            }
            
            var result = await _toolsService.DeleteSAPoolUser(data);
            return result;
        }

        public async Task<object> GetMatchingPerson(string idRepIsoCountryCode)
        {
            MatchingData data = (MatchingData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingData));
            data.IdRepIsoCountryCode = string.Empty;
            var result = await _toolsService.GetMatchingPerson(data);
            return result;
        }

        #endregion

        #region [Matching Tools]

        public async Task<object> GetMatchingCountry()
        {
            MatchingConfigurationData data = (MatchingConfigurationData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationData));        
            return await _toolsService.GetMatchingCountry(data);
        }

        public async Task<object> GetMatchingColumns()
        {
            MatchingConfigurationData data = (MatchingConfigurationData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationData));        
            return await _toolsService.GetMatchingColumns(data);
        }

        public async Task<object> GetMatchingConfiguration()
        {
            MatchingConfigurationData data = (MatchingConfigurationData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationData));        
            return await _toolsService.GetMatchingConfiguration(data);
        }

        public async Task<WSEditReturn> SaveMatchingConfiguration(MatchingModel model)
        {
            MatchingConfigurationSavingData data = (MatchingConfigurationSavingData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationSavingData));
            data.JSONText = model.JSONText;
            return await _toolsService.SaveMatchingConfiguration(data);
        }

        public async Task<object> GetScheduleTime()
        {
            MatchingConfigurationData data = (MatchingConfigurationData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationData));        
            return await _toolsService.GetScheduleTime(data);
        }

        public async Task<WSEditReturn> SaveScheduleTime(MatchingModel model)
        {
            MatchingConfigurationSavingData data = (MatchingConfigurationSavingData)ServiceDataRequest.ConvertToRelatedType(typeof(MatchingConfigurationSavingData));
            data.JSONText = model.JSONText;
            return await _toolsService.SaveScheduleTime(data);
        }

        #endregion
    }
}
