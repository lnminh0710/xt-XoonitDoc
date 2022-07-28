using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Models.DynamicControlDefinitions
{
    public class FormGroupDefinition
    {
        public string MethodName { get; set; }
        public List<FormDefinition> FormDefinitions { get; set; }

        public FormGroupDefinition()
        {
            MethodName = "";
            FormDefinitions = new List<FormDefinition>();
        }
    }

    public class FormGroupDefinitionV2
    {
        public string MethodName { get; set; }
        public string Object { get; set; }
        public List<AbstractGroupControlDefinition> FormDefinitions { get; set; }

        public FormGroupDefinitionV2()
        {
            MethodName = "";
            FormDefinitions = new List<AbstractGroupControlDefinition>();
        }
    }
}
