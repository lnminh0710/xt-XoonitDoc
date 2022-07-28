using Nest;

namespace DMS.Utils.ElasticSearch
{

    public class EsDocumentOCR : EsBaseDocument
    {
        [Keyword(IgnoreAbove = 256)]
        public string IdDocumentContainerOcr { get; set; }
        public long IdApplicationOwner { get; set; }
        public long IdDocumentContainerScans { get; set; }
        public int? IdDocumentTree { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string DocumentType { get; set; }
        public string FileName { get; set; }
        public string PathFolder { get; set; }
        public string CreatedDate { get; set; }
        public string UpdatedDate { get; set; }
        public string DoneDate { get; set; }
        public string ScannedPath { get; set; }
        public string ScannedFilename { get; set; }
        public long NumberOfImages { get; set; }
        public string Notes { get; set; }

        //Dont allow search this field
        [Keyword(IgnoreAbove = int.MaxValue, Index = false)]
        public string OcrText { get; set; }


        //private string _ocrText_RemovedHtml = null;

        //[Keyword(IgnoreAbove = int.MaxValue)]
        //public string OCRText_RemovedHtml
        //{
        //    get
        //    {
        //        if (_ocrText_RemovedHtml != null) return _ocrText_RemovedHtml;

        //        _ocrText_RemovedHtml = RemoveHtml(OcrText).ToLowerInvariant();

        //        return _ocrText_RemovedHtml;
        //    }
        //}
        //Dont allow search this field
        [Keyword(IgnoreAbove = int.MaxValue, Index = false)]
        public string FullText { get; set; }

        private string _fullText_RemovedHtml = null;

        [Keyword(IgnoreAbove = int.MaxValue)]
        public string FullText_RemovedHtml
        {
            get
            {
                if (_fullText_RemovedHtml != null) return _fullText_RemovedHtml;

                _fullText_RemovedHtml = RemoveHtml(FullText).ToLowerInvariant();

                return _fullText_RemovedHtml;
            }
        }
    }
}
