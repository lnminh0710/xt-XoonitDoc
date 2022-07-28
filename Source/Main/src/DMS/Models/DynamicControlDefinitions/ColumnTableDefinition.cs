using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DynamicControlDefinitions
{
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class ColumnTableDefinition
    {
        public string ColumnName { get; set; }

        public string ColumnHeader { get; set; }

        public string Value { get; set; }

        public string DataType { get; set; }

        public int? DataLength { get; set; }

        public string OriginalColumnName { get; set; }

        public IEnumerable<ColumnDefinitionSetting> Setting { get; set; }
    }
}
