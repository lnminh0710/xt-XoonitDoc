using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;
using Newtonsoft.Json;

namespace DMS.Business
{
    public partial class ToolsBusiness
    {
        public async Task<WSEditReturn> SystemScheduleSave(SystemScheduleSaveModel model)
        {
            SystemScheduleSaveData data = (SystemScheduleSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleSaveData));
            data.JSONText = data.CreateJsonText("SystemScheduleService", model.Schedule);

            //if (model.JConfig != null && model.JConfig.Count > 0)
            //{
            //    data.JConfig = data.CreateJsonText("JConfig", model.JConfig);
            //    //data.JConfig = string.Format(@"""{0}"":{1}", "JConfig", model.JConfig);
            //}

            return await _toolsService.SystemScheduleSave(data);
        }

        public async Task<WSEditReturn> SystemScheduleSaveStatus(SystemScheduleSaveStatusModel model)
        {
            SystemScheduleSaveStatusData data = (SystemScheduleSaveStatusData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleSaveStatusData));
            data.JSONText = data.CreateJsonText("ScheduleStatus", model.ScheduleStatus);
            return await _toolsService.SystemScheduleSaveStatus(data);
        }

        public async Task<object> SystemScheduleGetServiceList(SystemScheduleGetServiceListModel model)
        {
            SystemScheduleGetServiceListData data = (SystemScheduleGetServiceListData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleGetServiceListData));
            if (model != null)
            {
                data.IdRepAppSystemScheduleServiceName = model.IdRepAppSystemScheduleServiceName;
                data.IdSharingTreeGroups = model.IdSharingTreeGroups;
                data.RunDateTime = model.RunDateTime;
            }
            return await _toolsService.SystemScheduleGetServiceList(data);
        }

        public async Task<object> GetScheduleServiceStatusByQueueId(int idAppSystemScheduleQueue)
        {
            SystemScheduleGetServiceListData data = (SystemScheduleGetServiceListData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleGetServiceListData));
            data.IdAppSystemScheduleQueue = idAppSystemScheduleQueue;
            return await _toolsService.GetScheduleServiceStatusByQueueId(data);
        }

        public async Task<object> GetScheduleByServiceId(int idRepAppSystemScheduleServiceName)
        {
            SystemScheduleGetServiceListData data = (SystemScheduleGetServiceListData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleGetServiceListData));
            data.IdRepAppSystemScheduleServiceName = idRepAppSystemScheduleServiceName;
            return await _toolsService.GetScheduleByServiceId(data);
        }

        public async Task<object> SystemScheduleGetReportFileList(SystemScheduleGetReportFileListModel model)
        {
            SystemScheduleGetReportFileListData data = (SystemScheduleGetReportFileListData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleGetReportFileListData));
            if (model != null)
            {
                data.IdRepAppSystemScheduleServiceName = model.IdRepAppSystemScheduleServiceName;
            }
            return await _toolsService.SystemScheduleGetReportFileList(data);
        }

        public async Task<object> SystemScheduleGetSummayFileResult(SystemScheduleGetSummayFileResultModel model)
        {
            SystemScheduleGetSummayFileResultData data = (SystemScheduleGetSummayFileResultData)ServiceDataRequest.ConvertToRelatedType(typeof(SystemScheduleGetSummayFileResultData));
            if (model != null)
            {
                data.IdRepAppSystemScheduleServiceName = model.IdRepAppSystemScheduleServiceName;
                data.Mode = model.Mode;
                data.FromDate = model.FromDate;
                data.ToDate = model.ToDate;
            }
            return await _toolsService.SystemScheduleGetSummayFileResult(data);
        }

        public async Task<WSEditReturn> SavingQueue(IList<SystemScheduleQueueModel> model)
        {
            DataWithJsonText data = (DataWithJsonText)ServiceDataRequest.ConvertToRelatedType(typeof(DataWithJsonText));
            data.JSONText = data.CreateJsonText("SystemScheduleQueue", model);
            return await _toolsService.SavingQueue(data);
        }

        public async Task<WSEditReturn> SavingQueueElastic(Dictionary<string, object> values)
        {
            values["ProjectType"] = "XoonDoc";

            var model = new SystemScheduleQueueModel()
            {
                IdRepAppSystemScheduleServiceName = 6,
                IsActive = "1",
                IsDeleted = "0",
                JsonLog = JsonConvert.SerializeObject(new List<Dictionary<string, object>>() { values }, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore })
            };

            DataWithJsonText data = (DataWithJsonText)ServiceDataRequest.ConvertToRelatedType(typeof(DataWithJsonText));
            data.JSONText = data.CreateJsonText("SystemScheduleQueue", new List<SystemScheduleQueueModel>() { model });
            return await _toolsService.SavingQueue(data);
        }
    }
}
