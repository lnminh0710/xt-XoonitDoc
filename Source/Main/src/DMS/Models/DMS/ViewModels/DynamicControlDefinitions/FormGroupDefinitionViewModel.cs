using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.ViewModels.DynamicControlDefinitions
{
    public class FormGroupDefinitionViewModel
    {
        public string MethodName { get; set; }
        public IEnumerable<FormDefinitionViewModel> FormDefinitions { get; set; }

        public FormGroupDefinitionViewModel()
        {
            MethodName = "";
            FormDefinitions = new List<FormDefinitionViewModel>();
        }
    }

    public class FormGroupDefinitionV2ViewModel
    {
        public string MethodName { get; set; }
        public string Object { get; set; }
        public IEnumerable<AbstractGroupControlDefinitionViewModel> FormDefinitions { get; set; }

        public FormGroupDefinitionV2ViewModel()
        {
            MethodName = "";
            FormDefinitions = new List<AbstractGroupControlDefinitionViewModel>();
        }
    }
}
