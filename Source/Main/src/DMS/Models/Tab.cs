using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    /// <summary>
    /// Tab Summary Information Model object
    /// </summary>
    public class TabSummaryInfor
    {
        /// <summary>
        /// TabName
        /// </summary>
        public string TabName { get; set; }

        /// <summary>
        /// TabType
        /// </summary>
        public string TabType { get; set; }

        /// <summary>
        /// LastUpdate
        /// </summary>
        public DateTime LastUpdate { get; set; }

        /// <summary>
        /// TabID
        /// </summary>
        public string TabID { get; set; }

        /// <summary>
        /// IsMainTab
        /// </summary>
        public bool IsMainTab { get; set; }
    }

    /// <summary>
    /// Tab Summary Information Model object
    /// </summary>
    public class TabSummaryData
    {

        /// <summary>
        /// Data
        /// </summary>
        public string Data { get; set; }

        /// <summary>
        /// IconName
        /// </summary>
        public string IconName { get; set; }

        /// <summary>
        /// TextColor
        /// </summary>
        public string TextColor { get; set; }

        /// <summary>
        /// HttpLink
        /// </summary>
        public string HttpLink { get; set; }

        /// <summary>
        /// ToolTip
        /// </summary>
        public string ToolTip { get; set; }

        /// <summary>
        /// IsFavorited
        /// </summary>
        public bool IsFavorited { get; set; }
        public string Logo { get; set; }
    }

    public class TabSummaryModel
    {
        public TabSummaryInfor TabSummaryInfor { get; set; }
        public IList<TabSummaryData> TabSummaryData { get; set; }
        public IList<TabSummaryData> TabSummaryMenu { get; set; }
        public object TabSummaryRawData { get; set; }
    }
}
