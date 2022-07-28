using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using DMS.Models;
using DMS.Utils;
using Microsoft.AspNetCore.Http;

namespace DMS.Service
{
    /// <summary>
    /// GlobalService
    /// </summary>
    public partial class GlobalService : BaseUniqueServiceRequest, IGlobalService
    {
        public GlobalService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
            : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }

        #region Global Settings
        public async Task<bool> DeleteGlobalSettingById(GlobalSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsGlobal";
            data.Object = "B00SettingsGlobal";
            data.CrudType = "Delete";
            data.AppModus = "0";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            var wsReturn = response?.FirstOrDefault();
            return wsReturn != null ? new[] { "Successfully", "record does not exist" }.Any(wsReturn.SQLMessage.Contains) : false;
        }

        public async Task<IList<GlobalSettingModel>> GetAllGlobalSettings(Data data)
        {
            data.MethodName = "SpCallSettingsGlobalList";
            data.Object = "Global Settings";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<GlobalSettingModel> GetGlobalSettingById(GlobalSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsGlobal";
            data.Object = "B00SettingsGlobal";
            data.CrudType = "Read";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<object> GetAdvanceSearchProfile(Data data)
        {
            data.MethodName = "SpCallSettingsGlobalList";
            data.Object = "GetAdvanceSearchProfile";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<WSReturn> SaveGlobalSettingById(GlobalSettingUpdateData data)
        {
            data.MethodName = "SpCallSettingsGlobalList";
            data.Object = "SaveGlobalSetting";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }
        #endregion
    }
}
