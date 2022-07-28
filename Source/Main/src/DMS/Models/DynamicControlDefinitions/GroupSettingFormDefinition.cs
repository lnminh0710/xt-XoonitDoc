using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DynamicControlDefinitions
{
    public class GroupSettingFormDefinition
    {
        public int? GroupId { get; set; }
        public string GroupTitle { get; set; }
        public int? Order { get; set; }
        public string Type { get; set; }
    }

    public class GroupSettingWrapper
    {
        public GroupSettingFormDefinition GroupSettingFormDefinition { get; set; }
    }
}
