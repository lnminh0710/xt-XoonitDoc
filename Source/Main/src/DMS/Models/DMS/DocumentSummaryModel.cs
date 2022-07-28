using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentSummaryModel
    {
        public int TotalUserDocument { get; set; }
        public int TotalRemainingDocument { get; set; }
        public int TotalNewDocument { get; set; }
    }
}
