using Nest;
using System.Collections.Generic;

namespace DMS.Utils.ElasticSearch
{

    public class EsAttachment : EsBaseDocument
    {
        [Keyword(IgnoreAbove = 256)]
        public string IdMainDocument { get; set; }
        public long IdApplicationOwner { get; set; }
        public long IdDocumentContainerScans { get; set; }
        public int? IdDocumentTree { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? IsSync { get; set; }
        public bool? IsTodo { get; set; }
        public string IdCloudConnection { get; set; }
        public string IdRepDocumentGuiType { get; set; }
        public string RootName { get; set; }
        public string CreatedDate { get; set; }
        public string UpdatedDate { get; set; }
        public string GroupName { get; set; }
        public string ScannedPath { get; set; }
        public string ScannedFilename { get; set; }
        public long NumberOfImages { get; set; }
        public string Notes { get; set; }
        public string MediaRelativePath { get; set; }
        public string MediaName { get; set; }
        [Nested]
        public List<ContactInfo> Contacts { get; set; }
       
        public List<DynamicField> DynamicFields { get; set; }
        public string SearchKeyWords { get; set; }
        public string ToDoNotes { get; set; }

       
        //Dont allow search this field
        [Keyword(IgnoreAbove = int.MaxValue, Index = false)]
        public List<FullText> FullText { get; set; }

        private string _fullText_RemovedHtml = null;

        //[Keyword(IgnoreAbove = int.MaxValue)]
        //public string FullText_RemovedHtml
        //{
        //    get
        //    {
        //        if (_fullText_RemovedHtml != null) return _fullText_RemovedHtml;

        //        _fullText_RemovedHtml = RemoveHtml(FullText).ToLowerInvariant();

        //        return _fullText_RemovedHtml;
        //    }
        //}
    }

    public class ContactInfo
    {
        public string IdPerson { get; set; }
        public string PersonNr { get; set; }
        public string PersonType { get; set; }
        public string DocumentType { get; set; }

        public string IdPersonType { get; set; }
    }
    public class DynamicField
    {
        public string FieldName { get; set; }
        public string FieldValue { get; set; }
    }
    public class FullText
    {
        public string OCRText { get; set; }
       
    }
}
