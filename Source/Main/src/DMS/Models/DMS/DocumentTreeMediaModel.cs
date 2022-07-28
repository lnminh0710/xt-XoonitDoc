using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentTreeMediaModel
    {
        public string IdDocumentTreeMedia { get; set; }
        public string CloudMediaPath { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string MediaName { get; set; }
        public string IsActive { get; set; }
        public string IdCloudConnection { get; set; }

        public string MediaRelativePath { get; set; }
    }

    public class DocumentTreeMediaPriceTagModels
    {
        public List<DocumentTreeMediaPriceTagModel> DocumentTreeMedia { get; set; }
    }

    public class DocumentTreeMediaPriceTagModel
    {
        public string IdDocumentTreeMedia { get; set; }
        public string CloudMediaPath { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string MediaName { get; set; }

        public string MediaOriginalName { get; set; }

        public string IsActive { get; set; }
        public string IdCloudConnection { get; set; }

        public string MediaRelativePath { get; set; }
        public string MediaSize { get; set; }
    }
}
