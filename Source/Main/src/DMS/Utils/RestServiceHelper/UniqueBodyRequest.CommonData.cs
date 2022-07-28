using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class CommonCreateQueueData : Data
    {
        /// <summary>
        /// IdRepAppSystemScheduleServiceName
        /// </summary>
        public string IdRepAppSystemScheduleServiceName { get; set; }

        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class CommonDeleteQueuesData : Data
    {
        /// <summary>
        /// QueuesId
        /// </summary>
        public string QueuesId { get; set; }
    }
    public class ScanSettingsSaveData : Data
    {
        /// <summary>
        /// QueuesId
        /// </summary>
        public string JSONScanSettings { get; set; }
        public string IsActive { get; set; }
        public string IdSettingsScans { get; set; }
    }

    public class CommonGetQueuesData : Data
    {
        /// <summary>
        /// IdRepAppSystemScheduleServiceName (multi : split by ',')
        /// </summary>
        public string IdRepAppSystemScheduleServiceName { get; set; }
    }
}
