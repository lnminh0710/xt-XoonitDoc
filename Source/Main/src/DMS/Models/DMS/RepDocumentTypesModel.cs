using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class RepDocumentTypesModel
    {
        public List<DocumentTypeModel> DocumentType { get; set; }
    }

    public class DocumentTypeModel
    {
        public string DataType { get; set; }
        public string IdValue { get; set; }
        public string TextValue { get; set; }
    }
}
