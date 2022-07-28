using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;

namespace DMS.Models.DynamicControlDefinitions
{
    public class TableCommonDefinition : AbstractGroupControlDefinition
    {
        public IEnumerable<object> Data { get; set; }

        public IEnumerable<SettingColumnNameListWrapper> Columns { get; set; }

        public TableCommonDefinition(IEnumerable<object> dataSource, IEnumerable<SettingColumnNameListWrapper> settingTableColumns)
        {
            this.Data = dataSource;
            this.Columns = settingTableColumns;
            GroupSetting = settingTableColumns.FirstOrDefault()?.GroupSetting?.FirstOrDefault().GroupSettingFormDefinition;
        }

        internal override AbstractGroupControlDefinitionViewModel ParseViewModel()
        {
            var tableCommonDef = new TableCommonDefinitionViewModel(Data, Columns);
            tableCommonDef.GroupSetting = this.GroupSetting;

            return tableCommonDef;
        }
    }
}
