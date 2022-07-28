using DMS.Models.DMS.ViewModels;
using System.Collections.Generic;

namespace DMS.Models.History
{
    public class AgGridHistoryViewModel : AgGridViewModel<object>
    {
        public ScanningHistoryTotalSummaryData TotalSummary { get; set; }
        public AgGridHistoryViewModel(IEnumerable<object> data, IEnumerable<ColumnDefinitionViewModel> columnDefinitions, int totalRecords, ScanningHistoryTotalSummaryData totalSummary) : base(data, columnDefinitions, totalRecords)
        {
            TotalSummary = totalSummary;
        }
    }
}
