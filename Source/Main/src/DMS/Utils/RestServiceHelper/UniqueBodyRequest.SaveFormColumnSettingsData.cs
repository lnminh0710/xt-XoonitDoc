using DMS.Models.DMS.ViewModels;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.RestServiceHelper
{
    public class SaveFormColumnSettingsData : Data
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public IDictionary<string, object> Data { get; set; }
        public string IdCloudConnection { get; set; }

        public SaveFormColumnSettingsData()
        {
            IgnoredKeys = new List<string>();
        }
    }
}
