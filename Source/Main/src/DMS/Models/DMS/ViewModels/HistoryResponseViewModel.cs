using Newtonsoft.Json;
using System.Collections.Generic;

namespace DMS.Models.DMS.ViewModels
{
    public class HistoryResponseViewModel
    {
        public List<HistoryViewModel> Data { get; set; }
        public List<ControlGridColumnViewModel> Columns { get; set; }
        public int TotalResults { get; set; }
    }

    public class HistoryViewModel
    {
        [JsonProperty("IdDocumentContainerScans")]
        public string IdDocumentContainerScans { get; set; }
        [JsonProperty("FileName")]
        public string FileName { get; set; }
        [JsonProperty("DocType")]
        public string DocType { get; set; }
        [JsonProperty("TotalDocument")]
        public string TotalDocument { get; set; }
        [JsonProperty("ScanDate")]
        public string ScanDate { get; set; }
        [JsonProperty("ScanTime")]
        public string ScanTime { get; set; }
        [JsonProperty("Devices")]
        public string Devices { get; set; }
        [JsonProperty("SyncStatus")]
        public string SyncStatus { get; set; }
        [JsonProperty("Cloud")]
        public string Cloud { get; set; }
    }

    public class ControlGridColumnViewModel
    {
        public string Title { get; set; }
        public string Data { get; set; }
        public HistoryColumnPropertiesModel Setting { get; set; }
    }
}
