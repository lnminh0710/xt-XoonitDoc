using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Models.DMS.ViewModels.DynamicControlDefinitions
{
    public abstract class ColumnDefinitionDynamicViewModel
    {
        public string ColumnName { get; set; }

        public object Value { get; set; }

        public string DataType { get; set; }

        public int DataLength { get; set; }

        public string OriginalColumnName { get; set; }

        public ColumnDefinitionSetting Setting { get; set; }
    }
}
