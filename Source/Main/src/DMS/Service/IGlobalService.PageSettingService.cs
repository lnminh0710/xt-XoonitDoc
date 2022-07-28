using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public partial class GlobalService : BaseUniqueServiceRequest, IGlobalService
    {
        public async Task<PageSettingModel> GetPageSettingById(PageSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsPage";
            data.Object = "B00SettingsPage";
            data.CrudType = "Read";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<PageSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSReturn> SavePageSetting(PageSettingUpdateData data)
        {
            data.MethodName = "SpCrudB00SettingsPage";
            data.AppModus = "0";
            data.GUID = null;
            data.Object = "B00SettingsPage";
            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService"
            };
            // create new if it does not exist setting global id
            if (data.IdSettingsPage == null)
            {
                data.CrudType = "Create";
                uniq.Data = JsonConvert.SerializeObject(data.ConvertToRelatedType(typeof(PageSettingCreateData)));
            }
            // update with existed setting global id
            else
            {
                data.CrudType = "Update";
                uniq.Data = JsonConvert.SerializeObject(data);
            }

            BodyRequest bodyRquest = new BodyRequest { Request = uniq };

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }
    }
}

