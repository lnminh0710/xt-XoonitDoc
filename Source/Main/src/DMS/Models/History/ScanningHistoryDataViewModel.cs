using DMS.Models.DMS.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using DMS.Utils.Json;

namespace DMS.Models.History
{
    public class ScanningHistoryData
    {
        public IEnumerable<object> Data { get; set; }
        public IEnumerable<ColumnDefinitionViewModel> ColumnDefinitions { get; set; }
        public int TotalRecords { get; set; }
        public ScanningHistoryTotalSummaryData TotalSummary { get; set; }

        public ScanningHistoryData()
        {
            TotalSummary = new ScanningHistoryTotalSummaryData();
        }
    }

    public class ScanningHistoryTotalSummaryData
    {
        public int Scan { get; set; }
        public int Import { get; set; }
        public int Mobile { get; set; }
        public int Transferring { get; set; }
        public int Transferred { get; set; }
    }

    public class ScanningHistoryTotalRecordsData
    {
        public int TotalRecords { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(Newtonsoft.Json.Serialization.DefaultNamingStrategy))]
    public class ScanningHistoryDataViewModel
    {
        public string FullName { get; set; }
        public string Initials { get; set; }
        public string Email { get; set; }
        [JsonConverter(typeof(JsonConverterDateFormat), "dd.MM.yyyy")]
        public DateTime ScanDate { get; set; }
        public int Scan { get; set; }
        public int Import { get; set; }
        public int Mobile { get; set; }
        public int Transferring { get; set; }
        public int Transferred { get; set; }
    }
}
