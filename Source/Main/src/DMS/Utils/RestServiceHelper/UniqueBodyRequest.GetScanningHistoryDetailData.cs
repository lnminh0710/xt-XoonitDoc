using DMS.Utils;
using System;

namespace DMS.Utils.RestServiceHelper
{
    public class GetScanningHistoryDetailData : Data
    {
        public string ScanDate { get; set; }

        public int IdLoginFilter { get; set; }

        public string EmailFilter { get; set; }

        public int? FilterIdLogin { get; set; }

        public int? IdDocument { get; set; }

        public int? IdPerson { get; set; }
    }
}
