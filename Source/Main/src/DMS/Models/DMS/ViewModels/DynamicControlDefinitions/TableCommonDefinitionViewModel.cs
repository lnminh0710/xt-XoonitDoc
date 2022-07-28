using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels.DynamicControlDefinitions
{
    public class TableCommonDefinitionViewModel : AbstractGroupControlDefinitionViewModel
    {
        public IEnumerable<object> Data { get; set; }

        public IEnumerable<SettingColumnNameListWrapper> Columns { get; set; }

        public bool IsHorizontal { get; set; }

        public TableCommonDefinitionViewModel(IEnumerable<object> data, IEnumerable<SettingColumnNameListWrapper> columns) : base("Form")
        {
            this.Data = data;
            this.Columns = columns;
            this.IsHorizontal = false;

            //if (columns != null && columns.Any())
            //{
            //    var groupSettings = columns.First().GroupSetting;
            //    if (groupSettings != null && groupSettings.Any())
            //    {
            //        var groupSetting = groupSettings.First();
            //        this.GroupSetting = groupSetting.GroupSettingFormDefinition;
            //        this.IsHorizontal = groupSetting.GroupSettingFormDefinition.GroupId.HasValue;
            //    }
            //    else
            //    {
            //        this.GroupSetting = null;
            //    }
            //}
        }
    }
}
