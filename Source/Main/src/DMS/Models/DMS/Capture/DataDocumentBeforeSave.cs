using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.Capture
{
    public class DataCommonDocumentBeforeSave
    {
        public string IdCloudConnection { get; set; }

        public PersonContactModel SharingContact { get; set; }
    }
}
