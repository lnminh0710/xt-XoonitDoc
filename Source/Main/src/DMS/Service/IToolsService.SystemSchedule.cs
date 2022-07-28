using System.Threading.Tasks;
using DMS.Utils;

namespace DMS.Service
{
    public partial class ToolsService 
    {
        /// <summary>
        /// System Schedule: CREATE. Call this api when User creates schedules from UI.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<WSEditReturn> SystemScheduleSave(SystemScheduleSaveData data)
        {
            data.Object = "SystemScheduleService";
            data.MethodName = "SpCallSystemScheduleService";
            return SaveData(data);
        }

        /// <summary>
        /// System Schedule: TurnON/TurnOFF service
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<WSEditReturn> SystemScheduleSaveStatus(SystemScheduleSaveStatusData data)
        {
            data.Object = "ScheduleStatus";
            data.MethodName = "SpCallScheduleStatusSetting";
            return SaveData(data);
        }

        /// <summary>
        /// System Schedule: GET LIST SERVICE by IdRepAppSystemScheduleServiceName (module). Call this api to get list of valid services which need to be run.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<object> SystemScheduleGetServiceList(SystemScheduleGetServiceListData data)
        {
            data.Object = "GetServiceList";
            data.MethodName = "SpCallSystemScheduleService";
            return GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// Get Schedule Service Status By QueueId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<object> GetScheduleServiceStatusByQueueId(SystemScheduleGetServiceListData data)
        {
            data.Object = "SystemScheduleService";
            data.MethodName = "SpCallSystemQueueStatus";
            return GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// Get Schedule By idRepAppSystemScheduleServiceName
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<object> GetScheduleByServiceId(SystemScheduleGetServiceListData data)
        {
            data.Object = "GetScheduleByServiceId";
            data.MethodName = "SpCallSystemScheduleService";
            return GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// System Schedule: GET LIST Media files
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<object> SystemScheduleGetReportFileList(SystemScheduleGetReportFileListData data)
        {
            data.MethodName = "SpCallReportFileResult";
            return GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// System Schedule: Get Summay File Result
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<object> SystemScheduleGetSummayFileResult(SystemScheduleGetSummayFileResultData data)
        {
            data.MethodName = "SpCallSummayFileResult";
            return GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// System Schedule Queue: Saving Queue
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<WSEditReturn> SavingQueue(DataWithJsonText data)
        {
            data.Object = "SavingQueue";
            data.MethodName = "SpCallSystemScheduleQueue";
            return SaveData(data);
        }

        /// <summary>
        /// System Schedule Queue: Saving Queue Elastic
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public Task<WSEditReturn> SavingQueueElastic(SystemScheduleQueueElasticSaveData data)
        {
            data.MethodName = "SpCallSystemScheduleQueueElastic";
            data.Object = "SystemScheduleQueueElastic";
            return SaveData(data);
        }
    }
}
