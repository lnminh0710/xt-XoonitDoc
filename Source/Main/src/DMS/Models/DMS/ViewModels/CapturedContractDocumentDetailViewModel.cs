using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class CapturedContractDocumentDetailViewModel
    {
        public IEnumerable<DocumentColumnSettingViewModel> Contract { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonContractor { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonContractingParty { get; set; }

    }
}
