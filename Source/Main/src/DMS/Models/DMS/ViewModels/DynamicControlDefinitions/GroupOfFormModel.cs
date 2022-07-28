using DMS.Models.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels.DynamicControlDefinitions
{
    public class GroupOfFormModel
    {
        public int? GroupId { get; set; }
        public IEnumerable<AbstractGroupControlDefinitionViewModel> Forms { get; set; }
    }

    public class GroupFormDefinitionViewModel : AbstractGroupControlDefinitionViewModel
    {
        public IEnumerable<AbstractGroupControlDefinitionViewModel> FormDefinitions { get; set; }
        public bool IsHorizontal => true;

        public GroupFormDefinitionViewModel(IEnumerable<AbstractGroupControlDefinitionViewModel> groupFormDefinitions) : base("GroupForms")
        {
            FormDefinitions = groupFormDefinitions.OrderBy(g => g.GroupSetting.Order);
            var groupSetting = groupFormDefinitions.FirstOrDefault().GroupSetting;
            this.GroupSetting = new GroupSettingFormDefinition
            {
                GroupId = groupSetting.GroupId,
                GroupTitle = groupSetting.GroupTitle,
            };
        }
    }
}
