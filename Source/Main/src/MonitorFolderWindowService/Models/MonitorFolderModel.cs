using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonitorFolderWindowService.Models
{
   public class MonitorFolderModel
    {
        [JsonIgnore]
        public long? Id { get; set; }
        public string FileName { get; set; }

        public string FullPath { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string OldFullPath { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string OldFileName { get; set; }

        public string Action { get; set; }

        public string ChangedTime { get; set; }

        public string FileInfo { get; set; }

        [JsonIgnore]
        public int SaveServerCount { get; set; }
    }

    public class DocumentContainerFilesLog
    {
     
        public string FileName { get; set; }


        public string JsonLog { get; set; }
    }
}
