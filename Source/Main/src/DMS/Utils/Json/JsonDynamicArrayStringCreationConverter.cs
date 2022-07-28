using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.Json
{
    public abstract class JsonDynamicArrayStringCreationConverter<T> : JsonConverter where T : class
    {
        protected abstract object Create(T instance, JObject jObject, JsonSerializer serializer);
        protected abstract object CreateIfNull(T instance);

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
            if (jValue == null)
            {
                return null;
            }

            string strValue = (jValue?.Value) + string.Empty;
            if (string.IsNullOrWhiteSpace(strValue))
            {
                return null;
            }

            JArray jArray = JArray.Parse(strValue);

            T instance = Activator.CreateInstance<T>();
            IList<T> results = new List<T>();

            if (!jArray.Any())
            {
                CreateIfNull(instance);
            }
            else
            {
                foreach (JObject jObject in jArray)
                {
                    // Create target object based on JObject
                    object target = Create(instance, jObject, serializer);

                    if (target == null) continue;
                }
            }
            results.Add(instance);
            return results;
        }

        public  object ReadJsonxxx(
            JsonReader reader,
            Type objectType,
            object existingValue,
            JsonSerializer serializer)
        {
            IList<T> results = new List<T>();
            try
            {
                // Load JArray from stream
                JValue jValue = JValue.Load(reader) as JValue;
                JArray jArray = JArray.Parse(jValue.ToString());

                T instance = Activator.CreateInstance<T>();


                if (!jArray.Any())
                {
                    CreateIfNull(instance);
                }
                else
                {
                    foreach (JObject jObject in jArray)
                    {
                        // Create target object based on JObject
                        object target = Create(instance, jObject, serializer);

                        if (target == null) continue;
                    }
                }
                results.Add(instance);
            }
            catch (Exception) { }
            return results;
        }
    }
}
