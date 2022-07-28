using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class CapturedInvoiceDocumentDetailViewModel
    {
        public IEnumerable<DocumentColumnSettingViewModel> Invoice { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonBank { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonBeneficiary { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonRemitter { get; set; }
    }
}
