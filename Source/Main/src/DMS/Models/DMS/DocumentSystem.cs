using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentSystemModule
    {
        public long? IdRepTableModuleTemplateName { get; set; }
        public string DefaultValue { get; set; }
        public bool? IsBlocked { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class DocumentSystemDocType
    {
        public long? IdRepDocumentType { get; set; }
        public string DefaultValue { get; set; }
        public bool? IsBlocked { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class DocumentSystemField
    {
        public long? IdTableModuleEntityTemplate { get; set; }
        public int IdRepDataType { get; set; }
        public int IdRepTableModuleTemplateName { get; set; }
        public string FieldName { get; set; }
        public string DefaultValue { get; set; }
        public bool? IsAddedFromUser { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public string OrderBy { get; set; }
    }

    public class DocumentSystemContainer
    {
        public long? IdDocumentTableModuleContainer { get; set; }
        public int IdRepDocumentType { get; set; }
        public int IdRepTableModuleTemplateName { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

    }
}
