using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class FileUploadModel
    {
        public string IdDocumentContainerFilesUpload { get; set; }
        public string UploadDuration { get; set; }
    }

    public class FileUploadGetModel
    {
        public string IdDocumentContainerFilesUpload { get; set; }
        public string IdDocumentContainerFiles { get; set; }
        public string IdRepDocumentContainerFilesType { get; set; }
        public string IdDocumenstPathSettings { get; set; }
        public string FileName { get; set; }
        public string ScannedPath { get; set; }

    }
}
