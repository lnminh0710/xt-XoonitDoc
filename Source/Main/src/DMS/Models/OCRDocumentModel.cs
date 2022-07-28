using System.Collections.Generic;

namespace DMS.Models
{
   
    public class RequestOCRMauallyModel
    {
        public List<OCRDocumentModel> OcrDocs { get; set; }

    }

    public class OCRDocumentModel
    {
        public string OcrId { get; set; }

        public string Rotate { get; set; }

        public string IdDocumentContainerScans { get; set; }
    }

}
