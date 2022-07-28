using System;
using System.Collections.Generic;

namespace DMS.Models
{
    #region SystemSchedule Save
    public class SystemScheduleSaveModel
    {
        public IList<B00AppSystemSchedule> Schedule { get; set; }
    }

    public class B00AppSystemSchedule
    {
        public long? IdAppSystemSchedule { get; set; }
        public int? IdRepAppSystemScheduleServiceName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? StopDate { get; set; }
        public DateTime? StopTime { get; set; }
        public string JDays { get; set; }
        public string JWeeks { get; set; }
        public string JMonths { get; set; }
        public string JYears { get; set; }
        public string JHours { get; set; }
        public string IsForEverDay { get; set; }
        public string IsForEveryWeek { get; set; }
        public string IsForEveryMonth { get; set; }
        public string IsForEveryYear { get; set; }
        public string IsForEveryHours { get; set; }
        public string StartExecStoredName { get; set; }
        public string StopExecStoredName { get; set; }
        public string Notes { get; set; }
        public string IsDeleted { get; set; }

        #region Use for case Immediately: used to filter data for generating report file
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Emails { get; set; }
        #endregion
    }
    #endregion

    #region SystemSchedule SaveStatus
    public class SystemScheduleSaveStatusModel
    {
        public IList<B00AppSystemScheduleStatus> ScheduleStatus { get; set; }

    }

    public class B00AppSystemScheduleStatus
    {
        public long IdRepAppSystemScheduleServiceName { get; set; }
        public string IsDeleted { get; set; }
    }
    #endregion

    public class SystemScheduleGetServiceListModel
    {
        /// <summary>
        /// If null -> get all
        /// </summary>
        public int? IdRepAppSystemScheduleServiceName { get; set; }
        public int? IdSharingTreeGroups { get; set; }
        public DateTime? RunDateTime { get; set; }
    }

    public class SystemScheduleGetReportFileListModel
    {
        /// <summary>
        /// If null -> get all
        /// </summary>
        public int? IdRepAppSystemScheduleServiceName { get; set; }
    }

    public class SystemScheduleGetSummayFileResultModel
    {
        public int IdRepAppSystemScheduleServiceName { get; set; }

        public string Mode { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class SystemScheduleQueueModel {
        public int? IdAppSystemSchedule { get; set; }
        public int? IdRepAppSystemScheduleServiceName { get; set; }
        public string StartDateTime { get; set; }
        public string StopDateTime { get; set; }
        public string JsonLog { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }
}
