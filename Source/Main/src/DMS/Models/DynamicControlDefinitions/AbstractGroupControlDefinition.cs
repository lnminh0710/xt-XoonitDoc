using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;

namespace DMS.Models.DynamicControlDefinitions
{
    public abstract class AbstractGroupControlDefinition
    {
        public GroupSettingFormDefinition GroupSetting { get; set; }
        internal abstract AbstractGroupControlDefinitionViewModel ParseViewModel();
    }
}
