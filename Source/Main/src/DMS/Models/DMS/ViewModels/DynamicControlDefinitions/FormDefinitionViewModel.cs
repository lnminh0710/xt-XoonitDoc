using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;
using System.Collections.Generic;

namespace DMS.Models.ViewModels.DynamicControlDefinitions
{
    public class FormDefinitionViewModel : AbstractGroupControlDefinitionViewModel
    {
        public string Title { get; set; }
        public string CustomStyle { get; set; }
        public string CustomClass { get; set; }
        public IEnumerable<ColumnFieldDefinitionViewModel> ColumnDefinitions { get; set; }

        public FormDefinitionViewModel() : base("Form")
        {

        }
    }
}
