using System;

namespace DMS.Utils
{
    /// <summary>
    /// System Schedule: CREATE. Call this api when User creates schedules from UI.
    /// </summary>
    public class SystemScheduleSaveData : Data
    {
        public string JSONText { get; set; }
        public string JConfig { get; set; }
        
        public SystemScheduleSaveData()
        {
            JSONText = "{}";
        }
    }

    /// <summary>
    /// System Schedule: TurnON/TurnOFF service
    /// </summary>
    public class SystemScheduleSaveStatusData : Data
    {
        public string JSONText { get; set; }
        public SystemScheduleSaveStatusData()
        {
            JSONText = "{}";
        }
    }

    /// <summary>
    /// System Schedule: GET LIST SERVICE by IdRepAppSystemScheduleServiceName (module). Call this api to get list of valid services which need to be run.
    /// </summary>
    public class SystemScheduleGetServiceListData : Data
    {
        public int? IdRepAppSystemScheduleServiceName { get; set; }
        public int? IdAppSystemScheduleQueue { get; set; }
        public int? IdSharingTreeGroups { get; set; }        
        public DateTime? RunDateTime { get; set; }
    }

    /// <summary>
    /// System Schedule: GET LIST Media files
    /// </summary>
    public class SystemScheduleGetReportFileListData : Data
    {
        public int? IdRepAppSystemScheduleServiceName { get; set; }
    }

    public class SystemScheduleGetSummayFileResultData : Data
    {
        public int IdRepAppSystemScheduleServiceName { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class SystemScheduleQueueElasticSaveData : Data
    {
        public string JsonLog { get; set; }
    }
}
