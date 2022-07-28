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
    /// Global Setting model
    /// </summary>
    public class GlobalSettingModel
    {
        /// <summary>
        /// IdSettingsGlobal
        /// </summary>
        public int? IdSettingsGlobal { get; set; }

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
        public string IsActive { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public string IdSettingsGUI { get; set; }

    }

    public class DynamicCollection
    {
        public IList<object> CollectionData { get; set; }
        public string WidgetTitle { get; set; }
        public object ColumnSettings { get; set; }
        public object Data { get; set; }
    }

    public class DynamicCollection<T> where T : class
    {
        public IList<T> CollectionData { get; set; }
        public string WidgetTitle { get; set; }
        public object ColumnSettings { get; set; }
        public object Data { get; set; }
    }

    /// <summary>
    /// Translation
    /// </summary>
    public class Translation
    {
        /// <summary>
        /// IdTranslateLabelText
        /// </summary>
        public int? IdTranslateLabelText { get; set; }

        /// <summary>
        /// IdRepTranslateModuleType
        /// </summary>
        public int? IdRepTranslateModuleType { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public int? IdRepLanguage { get; set; }

        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public int? IdCountrylanguage { get; set; }

        /// <summary>
        /// TableName
        /// </summary>
        public string TableName { get; set; }

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
        /// TranslatedText
        /// </summary>
        public string TranslatedText { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public int? IsDeleted { get; set; }

        /// <summary>
        /// IdTable
        /// </summary>
        public string IdTable { get; set; }

        /// <summary>
        /// FieldName
        /// </summary>
        public string FieldName { get; set; }
    }

    /// <summary>
    /// TranslationModel
    /// </summary>
    public class TranslationModel
    {
        public IList<Translation> Translations { get; set; }
    }

    
    public class ColumnValue
    {
        public string ColumnName { get; set; }

        public string DisplayValue { get; set; }

        public string OriginialColumnName { get; set; }

        public string Value { get; set; }
    }
}
