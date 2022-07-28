using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentInvoiceDynamicComboboxModel
    {
        public string IdDynamicFieldsEntityName { get; set; }
        public string IdDocumentTree { get; set; }
        public string FieldName { get; set; }
        public string DataLength { get; set; }
        public string DataType { get; set; }
        public string IsAddedFromUser { get; set; }
        public string IsActive { get; set; }
        public string OrderBy { get; set; }
        public string IsDeleted { get; set; }
    }
}
