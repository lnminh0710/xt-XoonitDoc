using DMS.Utils;

namespace DMS.Models.DMS
{
    public class ImportDocumentModel : ScanningLotItemData
    {
        public string AccessToken { get; set; }
        public string ItemId { get; set; }

        public string PathTree { get; set; }

        public string SizeOfDocument { get; set; }
        public string CreatedDate{get; set; }
        public string LastModify { get; set; }
    }
}
