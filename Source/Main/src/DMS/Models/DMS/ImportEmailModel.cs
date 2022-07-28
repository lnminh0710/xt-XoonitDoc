using DMS.Utils;

namespace DMS.Models.DMS
{
    public class ImportEmailModel
    {
        public string AccessToken { get; set; }
        public string ItemId { get; set; }
    }

    public class ImportEmailMessageModel : ScanningLotItemData
    {
        public string AccessToken { get; set; }
        public string ItemId { get; set; }

        public string PathTree { get; set; }

        public string SizeOfDocument { get; set; }
        public string CreatedDate { get; set; }
        public string LastModify { get; set; }
    }

    public class DocumentContainerEmailItem
    {
        public string IdDocumentContainerEmail { get; set; }
        public string Sender { get; set; }
        public string SentDate { get; set; }
        public string RecipientsTo { get; set; }
        public string RecipientsCc { get; set; }
        public string RecipientsBcc { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }

        public DocumentContainerEmailItem()
        {
            IsActive = "1";
            IsDeleted = "0";
        }
    }
}
