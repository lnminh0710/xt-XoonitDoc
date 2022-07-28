using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.DTO
{
    public class ScanningHistoryDetailDto
    {
        public IEnumerable<ScanningHistoryDetailFileNameDto> FileNames { get; set; }
        public IEnumerable<object> Data { get; set; }
        public IEnumerable<SettingColumnNameListWrapper> SettingColumnNameListWrappers { get; set; }
    }

    public class ScanningHistoryDetailFileNameDto
    {
        public string FileName { get; set; }
    }
}
