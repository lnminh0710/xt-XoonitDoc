using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class CapturedOtherDocumentDetailViewModel
    {
        public IEnumerable<DocumentColumnSettingViewModel> OtherDocument { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonContact { get; set; }
        public IEnumerable<DocumentColumnSettingViewModel> PersonPrivat { get; set; }
    }
}
