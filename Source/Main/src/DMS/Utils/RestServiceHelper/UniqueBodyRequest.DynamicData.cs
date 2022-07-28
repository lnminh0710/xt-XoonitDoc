using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class SaveDynamicData
    {
        public List<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public string SpObject { get; set; }
        public string SpMethodName { get; set; }


        public SaveDynamicData()
        {
            IgnoredKeys = new List<string>();
            Data = new Dictionary<string, object>();
        }
    }


    public class DynamicReportFields
    {
        public string IdDynamicReportFields { get; set; }
        public string IdDynamicTemplateReportFields { get; set; }
        public string FieldValue { get; set; }
        public string IdFormsReport { get; set; }
    }
}
