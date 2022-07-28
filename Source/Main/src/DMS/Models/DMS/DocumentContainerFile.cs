using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentContainerFiles
    {
        public int? IdDocumentContainerScans { get; set; }
        public int? IdRepDocumentContainerFilesType { get; set; }

        public int? IdDocumenstPathSettings { get; set; }
        public string JsoFileNamenLog { get; set; }
        public decimal Size { get; set; }
    }

    public class DocumentContainerFilesLog
    {
        public int? IdDocumentContainerFilesLog { get; set; }
        public string FileName { get; set; }


        public string JsonLog { get; set; }
    }


    public class DocumentContainerScan
    {
        public List<int> DocumentContainerScanIds { get; set; }
    }
}
