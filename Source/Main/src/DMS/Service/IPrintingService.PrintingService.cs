using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Utils;

namespace DMS.Service
{
    /// <summary>
    /// PrintingService
    /// </summary>
    public class PrintingService : BaseUniqueServiceRequest, IPrintingService
    {
        public PrintingService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        public async Task<WSDataReturn> GetCampaigns(PrintingGetCampaignData data)
        {
            data.MethodName = "SpCallAPIToolGPM";
            //data.Object = "GetDataForOfflineExport";
            //data.IdLogin = "2";
            data.LoginLanguage = "1";

            data.IdSalesCampaignWizard = "1";
            data.IdCountrylanguage = "204";
            data.WidgetTitle = "Campaign Countries";
            data.IsDisplayHiddenFieldWithMsg = "1";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(data)
            };
            BodyRequest bodyRquest = new BodyRequest { Request = uniq };

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<WSDataReturn> ConfirmGetData(PrintingCampaignConfirmData data)
        {
            data.MethodName = "SpCallAPIToolGPM";
            data.Object = "ConfirmGetDataForOfflineExport";
            //data.IdLogin = "2";
            data.LoginLanguage = "1";
            
            data.IdSalesCampaignWizard = "1";
            data.IdCountrylanguage = "204";
            data.WidgetTitle = "Campaign Countries";
            data.IsDisplayHiddenFieldWithMsg = "1";

            data.GUID = Guid.NewGuid().ToString();

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(data)
            };
            BodyRequest bodyRquest = new BodyRequest { Request = uniq };

            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSDataReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }
    }
}
