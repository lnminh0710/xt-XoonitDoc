using DMS.Models.DynamicControlDefinitions;
using DMS.Utils.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;

namespace DMS.Models
{
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class SettingColumnNameListWrapper
    {
        [JsonConverter(typeof(SettingColumnNameConverter))]
        public IEnumerable<SettingColumnName> SettingColumnName { get; set; }

        [JsonConverter(typeof(GroupSettingFormDefinitionConverter))]
        public IEnumerable<GroupSettingWrapper> GroupSetting { get; set; }

        public bool ShouldSerializeGroupSetting()
        {
            return false;
        }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class SettingColumnName
    {
        public WidgetSetting WidgetSetting { get; set; }

        public ColumnTableSetting ColumnSetting { get; set; }

        public TableDirectionSetting TableDirectionSetting { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class WidgetSetting
    {
        public string WidgetTitle { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class ColumnTableSetting
    {
        public IEnumerable<DynamicControlDefinitions.ColumnTableDefinition> ColumnsName { get; set; }

    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class TableDirectionSetting
    {
        public int EnterDirection { get; set; }

    }

    public class SettingColumnNameConverter : JsonDynamicArrayStringCreationConverter<SettingColumnName>
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {

        }

        protected override object Create(SettingColumnName instance, JObject jObject, JsonSerializer serializer)
        {

            if (jObject[nameof(SettingColumnName.WidgetSetting.WidgetTitle)] != null)
            {
                instance.WidgetSetting = new WidgetSetting();
                serializer.Populate(jObject.CreateReader(), instance.WidgetSetting);
                return instance.WidgetSetting;
            }

            if (jObject[nameof(SettingColumnName.ColumnSetting.ColumnsName)] != null)
            {
                instance.ColumnSetting = new ColumnTableSetting();
                serializer.Populate(jObject.CreateReader(), instance.ColumnSetting);
                return instance.ColumnSetting;
            }

            if (jObject[nameof(SettingColumnName.TableDirectionSetting.EnterDirection)] != null)
            {
                instance.TableDirectionSetting = new TableDirectionSetting();
                serializer.Populate(jObject.CreateReader(), instance.TableDirectionSetting);
                return instance.TableDirectionSetting;
            }

            return instance;
        }

        protected override object CreateIfNull(SettingColumnName instance)
        {
            return instance;
        }
    }

    public class GroupSettingFormDefinitionConverter : JsonDynamicArrayStringCreationConverter<GroupSettingWrapper>
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {

        }

        protected override object Create(GroupSettingWrapper instance, JObject jObject, JsonSerializer serializer)
        {
            instance.GroupSettingFormDefinition = new GroupSettingFormDefinition();
            serializer.Populate(jObject.CreateReader(), instance.GroupSettingFormDefinition);

            return instance;
        }

        protected override object CreateIfNull(GroupSettingWrapper instance)
        {
            return instance;
        }
    }

    public abstract class JsonDynamicArrayStringCreationConverterxx<T> : JsonConverter where T : class
    {
        protected abstract object Create(T instance, JObject jObject);

        public override bool CanConvert(Type objectType)
        {
            return typeof(T).IsAssignableFrom(objectType);
        }

        public override bool CanWrite
        {
            get { return false; }
        }

        public override object ReadJson(
            JsonReader reader,
            Type objectType,
            object existingValue,
            JsonSerializer serializer)
        {
            // Load JArray from stream
            JValue jValue = JValue.Load(reader) as JValue;
            JArray jArray = JArray.Parse(jValue.ToString());

            T instance = Activator.CreateInstance<T>();
            IList<T> results = new List<T>();

            foreach (JObject jObject in jArray)
            {
                // Create target object based on JObject
                object target = Create(instance, jObject);

                if (target == null) continue;

                // Populate the object properties
                serializer.Populate(jObject.CreateReader(), target);
            }
            results.Add(instance);
            return results;
        }
    }
}

