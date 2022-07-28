using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System;
using DMS.Utils.ElasticSearch;

namespace DMS.Business
{
    public partial class GlobalBusiness : BaseBusiness, IGlobalBusiness
    {
        private readonly IPersonBusiness _personBusiness;
        private readonly IGlobalService _globalService;
        private readonly IConfiguration _iconfiguration;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;

        public GlobalBusiness(IHttpContextAccessor context,
            IGlobalService globalService,
            IConfiguration iconfiguration,
            IPersonBusiness personBusiness,
            IElasticSearchSyncBusiness elasticSearchSyncBusiness) : base(context)
        {
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
            _globalService = globalService;
            _iconfiguration = iconfiguration;
            _personBusiness = personBusiness;
        }

        public async Task<bool> DeleteGlobalSettingById(int idSettingsGlobal)
        {
            GlobalSettingData data = (GlobalSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(GlobalSettingData));
            data.IdSettingsGlobal = idSettingsGlobal;
            var result = await _globalService.DeleteGlobalSettingById(data);
            return result;
        }

        public async Task<IList<GlobalSettingModel>> GetAllGlobalSettings(string idSettingsGUI)
        {
            GlobalSettingData data = (GlobalSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(GlobalSettingData));
            data.IdSettingsGUI = idSettingsGUI;
            var result = await _globalService.GetAllGlobalSettings(data);

            SetESIgnoredFields(result);

            return result;
        }

        private void SetESIgnoredFields(IList<GlobalSettingModel> globalSettings)
        {
            if (globalSettings == null || globalSettings.Count == 0) return;

            var globalSetting = globalSettings.FirstOrDefault(n => n.GlobalType == "ESIgnoredFields");
            if (globalSetting != null)
            {
                var ESIgnoredFields = (globalSetting.JsonSettings + string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries).Select(n => n.ToLower()).ToList();
                ElasticSearchClientHelper.ESIgnoredFields = ESIgnoredFields;
            }
        }

        public async Task<GlobalSettingModel> GetGlobalSettingById(int? idSettingsGlobal)
        {
            GlobalSettingData data = (GlobalSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(GlobalSettingData));
            data.IdSettingsGlobal = idSettingsGlobal;
            var result = await _globalService.GetGlobalSettingById(data);
            return result;
        }

        public async Task<object> GetAdvanceSearchProfile(string moduleId)
        {
            GlobalSettingData data = (GlobalSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(GlobalSettingData));
            data.ObjectNr = moduleId;
            return await _globalService.GetAdvanceSearchProfile(data);
        }

        public async Task<WSReturn> SaveGlobalSettingById(GlobalSettingModel model)
        {
            GlobalSettingUpdateData data = (GlobalSettingUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(GlobalSettingUpdateData));
            data.IdSettingsGlobal = model.IdSettingsGlobal;
            data.ObjectNr = model.ObjectNr;
            data.GlobalName = model.GlobalName;
            data.GlobalType = model.GlobalType;
            data.Description = model.Description;
            data.JsonSettings = model.JsonSettings;
            data.IsActive = model.IsActive;
            data.IdSettingsGUI = model.IdSettingsGUI;
            var result = await _globalService.SaveGlobalSettingById(data);
            return result;
        }
    }
}
