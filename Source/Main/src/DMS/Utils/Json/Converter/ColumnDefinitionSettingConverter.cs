using DMS.Models;
using DMS.Models.DynamicControlDefinitions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DMS.Utils.Json.Converter
{
    public class ColumnDefinitionSettingConverter : JsonDynamicArrayStringCreationConverter<ColumnDefinitionSettingWrapper>
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
        }

        protected override object Create(ColumnDefinitionSettingWrapper instance, JObject jObject, JsonSerializer serializer)
        {            
            if (jObject[nameof(ColumnDefinitionSettingWrapper.DisplayField)] != null)
            {
                instance.DisplayField = new DisplayFieldSettingWrapper();
                serializer.Populate(jObject.CreateReader(), instance.DisplayField);
            }

            if (jObject[nameof(ColumnDefinitionSettingWrapper.ControlType)] != null)
            {
                instance.ControlType = new ControlTypeSettingWrapper();
                serializer.Populate(jObject.CreateReader(), instance.ControlType);
            }

            if (jObject[nameof(ColumnDefinitionSettingWrapper.Validators)] != null)
            {
                instance.Validators = new ValidatorsSettingWrapper();
                serializer.Populate(jObject.CreateReader(), instance.Validators);
            }

            if (jObject[nameof(ColumnDefinitionSettingWrapper.CustomStyle)] != null)
            {
                instance.CustomStyle = jObject[nameof(ColumnDefinitionSettingWrapper.CustomStyle)].ToString();
            }

            if (jObject[nameof(ColumnDefinitionSettingWrapper.CustomClass)] != null)
            {
                instance.CustomClass = jObject[nameof(ColumnDefinitionSettingWrapper.CustomClass)].ToString();
            }

            if (jObject[nameof(ColumnDefinitionSettingWrapper.CallConfig)] != null)
            {
                instance.CallConfig = new CallConfigSettingWrapper();
                serializer.Populate(jObject.CreateReader(), instance.CallConfig);
            }

            return instance;
        }

        protected override object CreateIfNull(ColumnDefinitionSettingWrapper instance)
        {
            instance.DisplayField = new DisplayFieldSettingWrapper
            {
                DisplayField = new DisplayFieldSetting
                {
                    Hidden = "0",
                    ReadOnly = "0",
                    NeedForUpdate = "0",
                    OrderBy = "0",
                },
            };

            return instance;
        }
    }
}
