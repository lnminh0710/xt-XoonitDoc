using DMS.Utils.Json.Converter;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DynamicControlDefinitions
{
    public class ColumnDefaultValueDefinition
    {
        public string TitleFormSection { get; set; }

        [JsonConverter(typeof(ColumnDefinitionSettingConverter))]
        public IEnumerable<ColumnDefinitionSettingWrapper> Setting { get; set; }

        [JsonConverter(typeof(GroupSettingFormDefinitionConverter))]
        public IEnumerable<GroupSettingWrapper> GroupSetting { get; set; }
    }
}
