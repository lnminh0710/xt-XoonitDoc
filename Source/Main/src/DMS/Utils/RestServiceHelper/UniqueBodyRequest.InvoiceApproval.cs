using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class SaveApprovalUserAutoReleasedData : Data
    {
        public string IdInvoiceApproval { get; set; }
        public string IdInvoiceApprovalPerson { get; set; }
        public string IdInvoiceMainApproval { get; set; }
        public string IsInvoiceReleased { get; set; }
        public string IsInvoiceRejected { get; set; }
        public string Notes { get; set; }
    }
}
