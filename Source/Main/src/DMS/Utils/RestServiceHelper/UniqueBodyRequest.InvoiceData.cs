using DMS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class SaveInvoiceData
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }
        public string IdCloudConnection { get; set; }
        public PersonContactModel SharingContact { get; set; }

        public SaveInvoiceData()
        {
            IgnoredKeys = new List<string>();
        }
    }

    public class GetInvoiceData : Data
    {
        public int IdPerson { get; set; }
    }

    public class GetCapturedInvoiceDocumentDetailData : Data
    {
        public string IdMainDocument { get; set; }
    }
}
