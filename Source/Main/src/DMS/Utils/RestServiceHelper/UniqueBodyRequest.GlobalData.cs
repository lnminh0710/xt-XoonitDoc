using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    #region Global Setting
    /// <summary>
    /// LoginData
    /// </summary>
    public class GlobalSettingData : Data
    {
        /// <summary>
        /// IdSettingsGlobal
        /// </summary>
        public int? IdSettingsGlobal { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public new string IdSettingsGUI { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public new string ObjectNr { get; set; }
    }

    /// <summary>
    /// GlobalCreateData
    /// </summary>
    public class GlobalSettingCreateData : Data
    {
        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// GlobalName
        /// </summary>
        public string GlobalName { get; set; }

        /// <summary>
        /// GlobalType
        /// </summary>
        public string GlobalType { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }
    }

    /// <summary>
    /// GlobalCreateData
    /// </summary>
    public class GlobalSettingUpdateData : GlobalSettingCreateData
    {
        /// <summary>
        /// IdSettingsGlobal
        /// </summary>
        public int? IdSettingsGlobal { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public new string IdSettingsGUI { get; set; }
    }
    #endregion

    #region Page Setting
    /// <summary>
    /// PageSettingData
    /// </summary>
    public class PageSettingData : Data
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
    /// PageSettingCreateData
    /// </summary>
    public class PageSettingCreateData : Data
    {
        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// GlobalName
        /// </summary>
        public string PageName { get; set; }

        /// <summary>
        /// GlobalType
        /// </summary>
        public string PageType { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }
    }

    /// <summary>
    /// PageSettingUpdateData
    /// </summary>
    public class PageSettingUpdateData : PageSettingCreateData
    {
        /// <summary>
        /// IdSettingsPage
        /// </summary>
        public int? IdSettingsPage { get; set; }
    }
    #endregion

    #region Translate Label Text
    /// <summary>
    /// LoginData
    /// </summary>
    public class TranslateLabelGetData : Data
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
        /// OriginalText
        /// </summary>
        public string OriginalText { get; set; }

        /// <summary>
        /// IdTable
        /// </summary>
        public string IdTable { get; set; }

        /// <summary>
        /// FieldName
        /// </summary>
        public string FieldName { get; set; }

        /// <summary>
        /// TableName
        /// </summary>
        public string TableName { get; set; }

    }

    public class TranslateLabelSaveData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class TranslateTextGetData : Data
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
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// Fields
        /// </summary>
        public string Fields { get; set; }

    }
    #endregion
}
