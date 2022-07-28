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
    /// Widget Template Model
    /// </summary>
    public class WidgetTemplateModel
    {
        /// <summary>
        /// IdRepWidgetApp
        /// </summary>
        public int IdRepWidgetApp { get; set; }

        /// <summary>
        /// IdRepWidgetType
        /// </summary>
        public int IdRepWidgetType { get; set; }

        /// <summary>
        /// DefaultValue
        /// </summary>
        public string DefaultValue { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

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
        /// MinRowOfColumns
        /// </summary>
        public int MinRowOfColumns { get; set; }

        /// <summary>
        /// WidgetDataType
        /// </summary>
        public string WidgetDataType { get; set; }

        /// <summary>
        /// primaryId 
        /// </summary>
        public string PrimaryId { get; set; }

        /// <summary>
        /// DefaultProperties 
        /// </summary>
        public string DefaultProperties { get; set; }

        /// <summary>
        /// IsMainArea 
        /// </summary>
        public bool IsMainArea { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public int? IdSettingsGUI { get; set; }
    }

    /// <summary>
    /// WidgetSettingModel
    /// </summary>
    public class WidgetSettingModel
    {
        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public string IdSettingsGUI { get; set; }

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
    /// WidgetOrderBy
    /// </summary>
    public class WidgetOrderBy
    {
        /// <summary>
        /// IdSysWidgetFieldsOrderBy
        /// </summary>
        public int? IdSysWidgetFieldsOrderBy { get; set; }

        /// <summary>
        /// OrderBy
        /// </summary>
        public int? OrderBy { get; set; }

        /// <summary>
        /// IsDefault
        /// </summary>
        public bool? IsDefault { get; set; }
    }

    /// <summary>
    /// WidgetOrderByModel
    /// </summary>
    public class WidgetOrderByModel
    {
        public IList<WidgetOrderBy> WidgetOrderBys { get; set; }

        /// <summary>
        /// WidgetApp
        /// </summary>
        public string WidgetApp { get; set; }

        /// <summary>
        /// WidgetGuid
        /// </summary>
        public string WidgetGuid { get; set; }
    }
}
