using DMS.Models.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels.DynamicControlDefinitions
{
    public abstract class AbstractGroupControlDefinitionViewModel
    {
        public readonly string Type;
        public GroupSettingFormDefinition GroupSetting { get; set; }

        public AbstractGroupControlDefinitionViewModel(string type)
        {
            this.Type = type;
        }
    }
}
