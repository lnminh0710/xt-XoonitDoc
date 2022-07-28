using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    /// <summary>
    /// GlobalService
    /// </summary>
    public partial class CommonService : BaseUniqueServiceRequest, ICommonService
    {
        public CommonService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
            : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }

        /// <summary>
        /// GetSystemInfo
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<object> GetSystemInfo(Data data)
        {
            data.MethodName = "SpAppSystemInfo";
            data.Object = "Get System Info";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return (response != null && response.Count > 0) ? response.First().First() : null;
        }

        public async Task<WSEditReturn> CreateQueue(CommonCreateQueueData data)
        {
            return await SaveData(data, "SpCallSystemScheduleQueue", "SavingQueue");
        }

        public async Task<WSEditReturn> DeleteQueues(CommonDeleteQueuesData data)
        {
            return await SaveData(data, "SpCallSystemScheduleQueue", "DeleteQueues");
        }
        public async Task<WSDataReturn> GetScanSettings(Data data)
        {
            data.MethodName = "SpAppSettings";
            data.Object = "GetScanSettings";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }
        public async Task<WSEditReturn> SaveScanSettings(ScanSettingsSaveData data)
        {
            return await SaveData(data, "SpCallAppSettings", "ScanSettings");
        }

        public async Task<WSDataReturn> GetDocumentProcessingQueues(CommonGetQueuesData data)
        {
            data.MethodName = "SpCallSystemScheduleQueue";
            data.Object = "GetListDocumentProcessing";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }
    }
}
