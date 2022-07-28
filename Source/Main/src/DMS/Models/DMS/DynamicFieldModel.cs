using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DynamicFieldModel
    {
        public string FieldName { get; set; }
        public string FieldValue { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdDynamicFields { get; set; }
        public string IdDynamicFieldsEntityName { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }
}
