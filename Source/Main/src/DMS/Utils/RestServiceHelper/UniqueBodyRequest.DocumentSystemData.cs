using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.RestServiceHelper
{
    public class DocumentSystemDocumentTypeSaveData : Data
    {
        public string JSONDocumentType { get; set; }
    }
    public class JSONDocumentType
    {
        public List<DocumentType> DocumentType { get; set; }
    }
    public class DocumentType
    {
        public string IdRepDocumentType { get; set; }
        public string DefaultValue { get; set; }
        public string IsBlocked { get; set; }
        public string IsDeleted { get; set; }
    }

    public class DocumentSystemModuleSaveData : Data
    {
        public string JSONDocumentModuleTemplateName { get; set; }
    }
    public class JSONDocumentModule
    {
        public List<DocumentModule> DocumentModuleTemplateName { get; set; }
    }
    public class DocumentModule
    {
        public string IdRepTableModuleTemplateName { get; set; }
        public string DefaultValue { get; set; }
        public string IsBlocked { get; set; }
        public string IsDeleted { get; set; }
    }
    public class DocumentSystemFieldSaveData : Data
    {
        public string JSONDocumentModuleEntityTemplate { get; set; }
    }
    public class JSONDocumentField
    {
        public List<DocumentField> DocumentModuleEntityTemplate { get; set; }
    }
    public class DocumentField
    {
        public string IdTableModuleEntityTemplate { get; set; }
        public string IdRepDataType { get; set; }
        public string IdRepTableModuleTemplateName { get; set; }
        public string FieldName { get; set; }
        public string DefaultValue { get; set; }
        public string IsAddedFromUser { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string OrderBy { get; set; }
    }
    public class DocumentSystemContainerSaveData : Data
    {
        public string JSONDocumentTableModuleContainer { get; set; }
    }
    public class JSONDocumentContainer
    {
        public List<DocumentModuleContainer> DocumentTableModuleContainer { get; set; }
    }
    public class DocumentModuleContainer
    {
        public string IdDocumentTableModuleContainer { get; set; }
        public string IdRepDocumentType { get; set; }
        public string IdRepTableModuleTemplateName { get; set; }

        public string IsActive { get; set; }
        public string IsDeleted { get; set; }

    }

    public class DocumentSystemModuleGetData : Data
    {
        public string IdRepDocumentType { get; set; }
    }
    public class DocumentSystemFieldGetData : Data
    {
        public string IdRepTableModuleTemplateName { get; set; }
    }

    public class DocumentTreeGetData : Data
    {
        public string WidgetTitle { get; set; }
        public bool ShouldGetDocumentQuantity { get; set; }
        public string IdPerson { get; set; }
        public string IsSearchForEmail { get; set; }
        public int IsProcessingModule { get; set; }
    }

    public class DocumentInvoiceDynamicData : Data
    {
        public string WidgetTitle { get; set; }
        public string IdDocumentTree { get; set; }
    }

    public class ExtractedDataOcrData: Data
    {
        public int IdRepDocumentType { get; set; }
        public int IdDocumentContainerOcr { get; set; }
        public int IdDocumentContainerScan { get; set; }
        public string FromModule { get; set; }        
    }

    public class PathTreeGetData : Data
    {
        public int? IdDocumentContainerScans { get; set; }
        public int? IdMainDocument { get; set; }
    }
}
