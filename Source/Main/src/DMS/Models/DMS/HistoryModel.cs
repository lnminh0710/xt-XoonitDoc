using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class HistoryModel
    {
        public string IdDocumentContainerScans { get; set; }
        public string ScannedFilename { get; set; }
        public string DocType { get; set; }
        public string TotalDocument { get; set; }
        public string ScanDate { get; set; }
        public string ScanTime { get; set; }
        public string FromDevice { get; set; }
        public string SyncStatus { get; set; }
        public string Cloud { get; set; }
    }
    public class HistoryColumnPropertiesModel
    {
        [JsonProperty("ColumnName")]
        public string ColumnName { get; set; }
        [JsonProperty("ColumnHeader")]
        public string ColumnHeader { get; set; }
        [JsonProperty("Setting")]
        public List<Setting> Setting { get; set; }
        [JsonProperty("Value")]
        public string Value { get; set; }
        [JsonProperty("DataType")]
        public string DataType { get; set; }
        [JsonProperty("DataLength")]
        public string DataLength { get; set; }
        [JsonProperty("OriginalColumnName")]
        public string OriginalColumnName { get; set; }
    }

    public class Setting
    {
        [JsonProperty("DisplayField")]
        public DisplayField DisplayField { get; set; }
    }

    public class DisplayField
    {
        [JsonProperty("Hidden")]
        public string Hidden { get; set; }
    }
}
