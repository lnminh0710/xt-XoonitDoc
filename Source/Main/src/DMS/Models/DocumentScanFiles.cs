using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace DMS.Models
{
    public class DocumentScanFiles
    {
        public int IdDocumentContainerScans { get; set; }
        public string FileName { get; set; }
        public string ScannedPath { get; set; }

        public string FullFileName { get; set; }
        public int? PageNr { get; set; }
        public string IdMainDocument { get; set; }
        public string EsIndex { get; set; }
        public string IdLogin { get; set; }

        public string LoginName { get; set; }
        public string LoginLanguage { get; set; }

        public int IdDocumentContainerOcr { get; set; }
        public int? OldIdDocumentContainerScans { get; set; }
        public string IdApplicationOwner { get; set; }
    }

    public class ResulDeleteDocumentScanFiles
    {
        public int IdDocumentContainerScans { get; set; }
        public bool StatusDeleteOnDB { get; set; }
        //public int TotalFilesDeleted { get; set; }

        public string ResultDeleteFiles { get; set; }
    }

}
