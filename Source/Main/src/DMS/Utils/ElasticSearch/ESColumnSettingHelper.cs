using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DMS.Utils.ElasticSearch
{
    public class ESColumnSettingHelper
    {
        public static string[] BuildSourceFields(object obj)
        {
            try
            {
                JArray jArray = obj as JArray;
                if (jArray == null || jArray.Count <= 0) return new string[] { "*" };

                JToken jToken = (JObject)jArray[0][0];
                var values = JsonConvert.DeserializeObject<List<JToken>>(jToken["SettingColumnName"].ToString());
                var columnSetting = JsonConvert.DeserializeObject<ESColumnSetting>(values[1].ToString());

                foreach (var item in columnSetting.ColumnsName)
                {
                    var arr = item.OriginalColumnName.Split(new char[] { '_' }, System.StringSplitOptions.RemoveEmptyEntries);
                    item.OriginalColumnName = Common.FirstCharacterToLower(arr.Length > 1 ? arr[1] : arr[0]);
                }//for

                return columnSetting.ColumnsName.Select(n => n.OriginalColumnName).ToArray();
            }
            catch (Exception ex) { }
            return new string[] { "*" };
        }
    }

    public class ESColumnSetting
    {
        public List<ESSettingColumnName> ColumnsName { get; set; }

        public ESColumnSetting()
        {
            ColumnsName = new List<ESSettingColumnName>();
        }
    }

    public class ESSettingColumnName
    {
        public string OriginalColumnName { get; set; }
    }
}
