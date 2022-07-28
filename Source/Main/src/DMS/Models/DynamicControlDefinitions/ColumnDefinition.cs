using DMS.Utils.Json.Converter;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DynamicControlDefinitions
{
    public class ColumnDefinition
    {
        public string ColumnName { get; set; }

        public string ColumnHeader { get; set; }

        public string Value { get; set; }

        public string DataType { get; set; }

        public int? DataLength { get; set; }

        public string OriginalColumnName { get; set; }

        [JsonConverter(typeof(ColumnDefinitionSettingConverter))]
        public IEnumerable<ColumnDefinitionSettingWrapper> Setting { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class ColumnDefinitionSetting
    {
        public DisplayFieldSetting DisplayField { get; set; }
        public ControlTypeSetting ControlType { get; set; }
        public ValidatorsSetting Validators { get; set; }
        public IEnumerable<CallConfigSetting> CallConfigs { get; set; }
        public object CustomStyle { get; set; }
        public string CustomClass { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class DisplayFieldSetting
    {
        private string _hidden;
        private string _readOnly;
        private string _orderBy;
        private string _needForUpdate;
        private string _keepOriginialColumnName;
        private string _keyForUpdate;
        private string _groupHeader;
        private string _icon;

        public DisplayFieldSetting() { }

        public DisplayFieldSetting(bool hidden, bool @readonly, int orderBy, bool needForUpdate, bool groupHeader, string icon)
        {
            this._hidden = hidden ? "1" : "0";
            this._readOnly = @readonly ? "1" : "0";
            this._orderBy = orderBy.ToString();
            this._needForUpdate = needForUpdate ? "1" : "0";
            this._groupHeader = groupHeader ? "1" : "0";
            this._icon = icon;
        }


        public bool ShouldSerializeNeedForUpdate()
        {
            return false;
        }

        public bool ShouldSerializeKeepOriginialColumnName()
        {
            return false;
        }

        public bool ShouldSerializeKeyForUpdate()
        {
            return false;
        }

        public string Hidden
        {
            get
            {
                if (_hidden == null)
                {
                    _hidden = "0";
                }
                return _hidden;
            }
            set
            {
                _hidden = value;
            }
        }
        public string ReadOnly
        {
            get
            {
                if (_readOnly == null)
                {
                    _readOnly = "0";
                }
                return _readOnly;
            }
            set
            {
                _readOnly = value;
            }
        }
        public string OrderBy
        {
            get
            {
                if (_orderBy == null)
                {
                    _orderBy = "0";
                }
                return _orderBy;
            }
            set
            {
                _orderBy = value;
            }
        }

        public string NeedForUpdate
        {
            get
            {
                if (_needForUpdate == null)
                {
                    _needForUpdate = "0";
                }
                return _needForUpdate;
            }
            set
            {
                _needForUpdate = value;
            }
        }

        public string KeepOriginialColumnName
        {
            get
            {
                if (_keepOriginialColumnName == null)
                {
                    _keepOriginialColumnName = "0";
                }
                return _keepOriginialColumnName;
            }
            set
            {
                _keepOriginialColumnName = value;
            }
        }

        public string KeyForUpdate
        {
            get
            {
                if (_keyForUpdate == null)
                {
                    _keyForUpdate = "0";
                }
                return _keyForUpdate;
            }
            set
            {
                _keyForUpdate = value;
            }
        }

        public string GroupHeader
        {
            get
            {
                if (_groupHeader == null)
                {
                    _groupHeader = "0";
                }
                return _groupHeader;
            }
            set
            {
                _groupHeader = value;
            }
        }

        public string Icon
        {
            get
            {
                if (_icon == null)
                {
                    _icon = "";
                }
                return _icon;
            }
            set
            {
                _icon = value;
            }
        }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class ControlTypeSetting
    {
        public string Type { get; set; }
        public string Value { get; set; }
        public string Cols { get; set; }
        public string Rows { get; set; }
        public string IsResize { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class ValidatorsSetting
    {
        public string IgnoreKeyCharacters { get; set; }
        public string MaxLength { get; set; }
        public string IsRequired { get; set; }
        public PatternValidator Pattern { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class PatternValidator
    {
        public string Message { get; set; }
        public string Regex { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class CallConfigSetting
    {
        public string Alias { get; set; }
        public string Value { get; set; }
        public bool IsExtParam { get; set; }
        public CallConfigJsonText JsonText { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class CallConfigJsonText
    {
        public string Name { get; set; }
        public string Path { get; set; }
    }

    public class ColumnDefinitionSettingWrapper
    {
        public DisplayFieldSettingWrapper DisplayField { get; set; }
        public ControlTypeSettingWrapper ControlType { get; set; }
        public ValidatorsSettingWrapper Validators { get; set; }
        public CallConfigSettingWrapper CallConfig { get; set; }
        public string CustomStyle { get; set; }
        public string CustomClass { get; set; }
    }

    public class DisplayFieldSettingWrapper
    {
        public DisplayFieldSetting DisplayField { get; set; }
    }

    public class ControlTypeSettingWrapper
    {
        public ControlTypeSetting ControlType { get; set; }
    }

    public class ValidatorsSettingWrapper
    {
        public ValidatorsSetting Validators { get; set; }
    }

    public class CallConfigSettingWrapper
    {
        public IEnumerable<CallConfigSetting> CallConfig { get; set; }
    }
}
