using System;

namespace DMS.Models
{
    /// <summary>
    /// UpdateWidgetAppModel
    /// </summary>
    public class UpdateWidgetAppModel
    {
        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public string IdSettingsGUI { get; set; }

        /// <summary>
        /// IdRepWidgetApp: Pass IdRepWidgetApp in call for updating, without for inserting
        /// </summary>
        public string IdRepWidgetApp { get; set; }

        /// <summary>
        /// IdRepWidgetType
        /// </summary>
        public string IdRepWidgetType { get; set; }

        /// <summary>
        /// WidgetDataType
        /// </summary>
        public string WidgetDataType { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }

        /// <summary>
        /// IconName
        /// </summary>
        public string IconName { get; set; }

        /// <summary>
        /// JsonString
        /// </summary>
        public string JsonString { get; set; }

        /// <summary>
        /// UpdateJsonString
        /// </summary>
        public string UpdateJsonString { get; set; }

        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public string IdSettingsModule { get; set; }

        /// <summary>
        /// ToolbarJson
        /// </summary>
        public string ToolbarJson { get; set; }

        /// <summary>
        /// UsedModule
        /// </summary>
        public string UsedModule { get; set; }
    }
}
