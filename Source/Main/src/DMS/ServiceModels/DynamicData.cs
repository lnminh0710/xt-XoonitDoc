using DMS.Utils;
using System.Collections.Generic;

namespace DMS.ServiceModels
{
    /// <summary>
    /// DynamicData
    /// </summary>
    public class DynamicData
    {
        /// <summary>
        /// IgnoredKeys
        /// </summary>
        public List<string> IgnoredKeys { get; set; }

        /// <summary>
        /// Items With Prefix Json
        /// </summary>
        public List<string> ItemsWithPrefixJson { get; set; }

        /// <summary>
        /// Data
        /// </summary>
        public Data Data { get; set; }

        /// <summary>
        /// ParamsData
        /// </summary>
        public Dictionary<string, object> ParamsData { get; set; }

        /// <summary>
        /// DynamicData
        /// </summary>
        public DynamicData()
        {
            IgnoredKeys = new List<string>();
            ItemsWithPrefixJson = new List<string>();
            ParamsData = new Dictionary<string, object>();
        }

        /// <summary>
        /// DynamicData
        /// </summary>
        /// <param name="serviceDataRequest"></param>
        public DynamicData(Data serviceDataRequest)
        {
            IgnoredKeys = new List<string>();
            ItemsWithPrefixJson = new List<string>();
            ParamsData = new Dictionary<string, object>();

            Data data = (Data)serviceDataRequest.ConvertToRelatedType(typeof(Data));
            Data = data;
        }

        /// <summary>
        /// Add Params from Model to Data
        /// </summary>
        /// <param name="inputModel"></param>
        public void AddParams(Dictionary<string, object> values)
        {
            if (values == null || values.Count == 0) return;

            ItemsWithPrefixJson = ItemsWithPrefixJson ?? new List<string>();
            IgnoredKeys = IgnoredKeys ?? new List<string>();

            List<string> ignoredKeys = values.GetValue("IgnoredKeys") as List<string>;
            if (ignoredKeys != null && ignoredKeys.Count > 0)
            {
                IgnoredKeys.AddRange(ignoredKeys);
            }
            
            foreach (KeyValuePair<string, object> entry in values)
            {
                if (IgnoredKeys.Contains(entry.Key)) continue;

                if (ItemsWithPrefixJson.Contains(entry.Key))
                {
                    var key = "JSON" + entry.Key;
                    ParamsData[key] = Common.CreateJsonText(entry.Key, entry.Value);
                }
                else
                {
                    ParamsData[entry.Key] = entry.Value;
                }
            }
        }
    }
}
