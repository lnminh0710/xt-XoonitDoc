using DMS.Models.DynamicControlDefinitions;
using Newtonsoft.Json.Linq;
using System;

namespace DMS.Models.DMS.ViewModels
{
    public class DocumentColumnSettingViewModel
    {
        [NonSerialized]
        private ColumnDefinitionSetting _setting;

        public string ColumnName { get; set; }

        public string Value { get; set; }

        public string DataType { get; set; }

        public int? DataLength { get; set; }

        public string OriginalColumnName { get; set; }

        //public object Setting
        //{
        //    get
        //    {
        //        return _setting;
        //    }
        //    set
        //    {
        //        try
        //        {
        //            _setting = new ColumnDefinitionSetting();
        //            if (value is string && string.IsNullOrWhiteSpace(value as string))
        //            {
        //                return;
        //            }

        //            var jArray = JArray.Parse(value as string);
        //            int count = jArray.Count;

        //            _setting.DisplayField = count >= 1 ? jArray[0].SelectToken("DisplayField").ToObject<DisplayFieldSetting>() : null;
        //            _setting.ControlType = count >= 2 ? jArray[1].SelectToken("ControlType").ToObject<ControlTypeSetting>() : null;
        //            _setting.Validators = count >= 1 ? jArray[0].SelectToken("Validators") != null ? jArray[0].SelectToken("Validators").ToObject<ValidatorsSetting>() : null : null;
        //        }
        //        catch (Exception)
        //        {
        //            return;
        //        }
        //    }
        //}
        public ColumnDefinitionSetting Setting { get; set; }

        public ColumnDefinitionSetting GetSetting()
        {
            return Setting;
        }
    }
}
