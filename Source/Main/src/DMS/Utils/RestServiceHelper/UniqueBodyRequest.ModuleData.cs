using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    #region Module Setting
    /// <summary>
    /// ModuleSettingData
    /// </summary>
    public class ModuleSettingData : Data
    {
        /// <summary>
        /// SqlFieldName
        /// </summary>
        public string SqlFieldName { get; set; }

        /// <summary>
        /// SqlFieldValue
        /// </summary>
        public string SqlFieldValue { get; set; }

        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public int? IdSettingsModule { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// ModuleType
        /// </summary>
        public string ModuleType { get; set; }
    }

    public class UpdateModuleSettingData : Data
    {
        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public int IdSettingsModule { get; set; }

        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// ModuleType
        /// </summary>
        public string ModuleType { get; set; }

    }
    #endregion

    #region Tab
    /// <summary>
    /// TabData
    /// </summary>
    public class TabData : Data
    {
        /// <summary>
        /// IdSettingsGlobal
        /// </summary>
        public int? IdObject { get; set; }
        public int? IdDocumentType { get; set; }
    }
    #endregion

    #region WidgetApp
    public class WidgetAppGetData : Data
    {
        /// <summary>
        /// IdRepWidgetApp
        /// </summary>
        public string IdRepWidgetApp { get; set; }
    }

    /// <summary>
    /// UpdateWidgetAppData
    /// </summary>
    public class UpdateWidgetAppData : Data
    {
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
    #endregion
}
