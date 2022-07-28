using DMS.Utils;
using System;

namespace DMS.Utils.RestServiceHelper
{
    public class GetScanningHistoryListData : Data
    {
        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public int? FilterIdLogin { get; set; }

        public int? IdDocumentTree { get; set; }

        public int? IdSharingCompany { get; set; }

        public int PageIndex { get; set; }

        public int PageSize { get; set; }
    }
}
