using Newtonsoft.Json;
using System;

namespace DMS.Utils
{

    /// <summary>
    /// ResultResponse
    /// </summary>
    public class ResultResponse
    {
        /// <summary>
        /// Data
        /// </summary>
        public string Data { get; set; }
    }

    /// <summary>
    /// Data
    /// </summary>
    public class DataWithJsonText: Data {
        public string JSONText { get; set; }
        public DataWithJsonText()
        {
            JSONText = "{}";
        }
    }

    /// <summary>
    /// Data
    /// </summary>
    public class Data
    {
        /// <summary>
        /// MethodName
        /// </summary>
        public string MethodName { get; set; }

        /// <summary>
        /// CrudType
        /// </summary>
        public string CrudType { get; set; }

        /// <summary>
        /// Object
        /// </summary>
        public string Object { get; set; }

        /// <summary>
        /// Mode
        /// </summary>
        public string Mode { get; set; }

        /// <summary>
        /// AppModus
        /// </summary>
        public string AppModus { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }

        /// <summary>
        /// LoginLanguage
        /// </summary>
        public string LoginLanguage { get; set; }

        /// <summary>
        /// IdRepTranslateModuleType
        /// </summary>
        public string IdRepTranslateModuleType { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public string IdApplicationOwner { get; set; }

        /// <summary>
        /// GUID
        /// </summary>
        public string GUID { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public string IdSettingsGUI { get; set; }
        /// <summary>
        /// LoginName
        /// </summary>
        public string LoginName { get; set; }

        public string Email { get; set; }

        /// <summary>
        /// IsDisplayHiddenFieldWithMsg
        /// </summary>
        public string IsDisplayHiddenFieldWithMsg { get; set; }

        public Data()
        {
            GUID = Guid.NewGuid().ToString();
        }

        public object ConvertToRelatedType(Type type)
        {
            var instance = Activator.CreateInstance(type, true);
            foreach (var prop in this.GetType().GetProperties())
            {
                if (type.GetProperty(prop.Name) != null)
                    prop.SetValue(instance, prop.GetValue(this));
            }
            return instance;
        }

        public object ConvertToRelatedType(Type type, object instance)
        {
            if (instance == null)
                instance = Activator.CreateInstance(type, true);
            foreach (var prop in this.GetType().GetProperties())
            {
                if (type.GetProperty(prop.Name) != null && prop.GetValue(this) != null)
                    prop.SetValue(instance, prop.GetValue(this));
            }
            return instance;
        }

        public string CreateJsonText(string key, object value, string startString = "{", string endString = "}")
        {
            var modelValue = JsonConvert.SerializeObject(value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            var jsonText = string.Format(@"""{0}"":{1}", key, modelValue);
            jsonText = startString + jsonText + endString;
            return jsonText;
        }
    }

    public class CreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    /// <summary>
    /// UniqueBody
    /// </summary>
    public class UniqueBody
    {
        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// ServiceName
        /// </summary>
        public string ServiceName { get; set; }

        /// <summary>
        /// data
        /// </summary>
        public string Data { get; set; }
    }

    /// <summary>
    /// BodyRequest
    /// </summary>
    public class BodyRequest
    {
        /// <summary>
        /// UniqueBody
        /// </summary>
        public UniqueBody Request { get; set; }
    }
}
