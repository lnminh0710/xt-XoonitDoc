using DMS.Models.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public  class ColumnDefinitionViewModel
    {
        public string ColumnName { get; set; }

        public string ColumnHeader { get; set; }

        public object Value { get; set; }

        public string DataType { get; set; }

        public int DataLength { get; set; }

        public string OriginalColumnName { get; set; }

        public ColumnDefinitionSetting Setting { get; set; }
    }
}
