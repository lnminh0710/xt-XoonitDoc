using DMS.Models;
using DMS.Models.DMS.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.History
{
    public class AgGridHistoryDetailViewModel : AgGridViewModel<object>
    {
        public string FileName { get; set; }

        public AgGridHistoryDetailViewModel(IEnumerable<object> data, IEnumerable<ColumnDefinitionViewModel> columnDefinitions, int totalRecords) : base(data, columnDefinitions, totalRecords)
        {
        }
    }
}
