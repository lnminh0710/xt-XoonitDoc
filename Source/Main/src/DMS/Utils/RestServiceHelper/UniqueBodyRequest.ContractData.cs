using DMS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class GetContractData : Data
    {
    }

    public class SaveContractData
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public string IdCloudConnection { get; set; }

        public PersonContactModel SharingContact { get; set; }

        public SaveContractData()
        {
            IgnoredKeys = new List<string>();
        }
    }

    public class GetCapturedContractDocumentDetailData : Data
    {
        public string IdMainDocument { get; set; }
    }
}
