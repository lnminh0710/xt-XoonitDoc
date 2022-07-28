using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// WidgetSettingData
    /// </summary>
    public class WidgetSettingData : Data
    {
        /// <summary>
        /// IdSettingsWidget
        /// </summary>
        public int? IdSettingsWidget { get; set; }

        /// <summary>
        /// IdRepWidgetApp
        /// </summary>
        public int? IdRepWidgetApp { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// WidgetName
        /// </summary>
        public string WidgetName { get; set; }

        /// <summary>
        /// WidgetType
        /// </summary>
        public int? WidgetType { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }
    }

    /// <summary>
    /// WidgetSettingLoadData
    /// </summary>
    public class WidgetSettingLoadData : Data
    {
        /// <summary>
        /// SqlFieldName
        /// </summary>
        public string SqlFieldName { get; set; }

        /// <summary>
        /// SqlFieldValue
        /// </summary>
        public string SqlFieldValue { get; set; }
    }

    /// <summary>
    /// WidgetOrderByData
    /// </summary>
    public class WidgetOrderByData : Data
    {
        /// <summary>
        /// WidgetMainID
        /// </summary>
        public string WidgetMainID { get; set; }

        /// <summary>
        /// WidgetCloneID
        /// </summary>
        public string WidgetCloneID { get; set; }

        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get; set; }
    }
}
