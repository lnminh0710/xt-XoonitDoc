using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;

namespace DMS.Business
{
   public class DocumentSystemBusiness : BaseBusiness, IDocumentSystemBusiness
    {
        private readonly IDocumentSystemService _documentSystemService;

        public DocumentSystemBusiness(IHttpContextAccessor context, IDocumentSystemService documentSystemService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness) : base(context)
        {
            _documentSystemService = documentSystemService;
        }

        public async  Task<WSEditReturn> SaveDocumentSystemDocumentType(List<DocumentSystemDocType> models)
        {
            DocumentSystemDocumentTypeSaveData data = (DocumentSystemDocumentTypeSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemDocumentTypeSaveData));
         
            List<DocumentType> documentTypes = new List<DocumentType>();
            string GroupGuiId = Guid.NewGuid().ToString();
            foreach (DocumentSystemDocType model in models)
            {
                DocumentType documentType = new DocumentType();
                documentType.IdRepDocumentType = model.IdRepDocumentType != null ? model.IdRepDocumentType.ToString() : "";
                documentType.DefaultValue = model.DefaultValue;
                documentType.IsBlocked = ConverterUtils.BoolToString(model.IsBlocked);
                documentType.IsDeleted = ConverterUtils.BoolToString(model.IsDeleted);
                documentTypes.Add(documentType);
            }
            JSONDocumentType jSONDocumentType = new JSONDocumentType { DocumentType = documentTypes };
            data.JSONDocumentType = JsonConvert.SerializeObject(jSONDocumentType);
            var result = await _documentSystemService.SaveDocumentSystemDocumentType(data);
            return result;
        }

        public async Task<WSEditReturn> SaveDocumentSystemField(List<DocumentSystemField> models)
        {
            DocumentSystemFieldSaveData data = (DocumentSystemFieldSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemFieldSaveData));

            List<DocumentField> documentFields = new List<DocumentField>();
            string GroupGuiId = Guid.NewGuid().ToString();
            foreach (DocumentSystemField model in models)
            {
                DocumentField documentField = new DocumentField();
                documentField.IdTableModuleEntityTemplate = model.IdTableModuleEntityTemplate != null ? model.IdTableModuleEntityTemplate.ToString() : "";
                documentField.IdRepDataType = model.IdRepDataType.ToString();
                documentField.IdRepTableModuleTemplateName = model.IdRepTableModuleTemplateName.ToString();
                documentField.DefaultValue = model.DefaultValue;
                documentField.FieldName = model.FieldName;
                documentField.IsActive = ConverterUtils.BoolToString(model.IsActive);
                documentField.IsAddedFromUser = ConverterUtils.BoolToString(model.IsAddedFromUser);
                documentField.IsDeleted = ConverterUtils.BoolToString(model.IsDeleted);
                documentField.OrderBy = model.OrderBy;
                documentFields.Add(documentField);
            }
            JSONDocumentField jSONDocumentField = new JSONDocumentField
            {
                DocumentModuleEntityTemplate = documentFields
            };
            data.JSONDocumentModuleEntityTemplate = JsonConvert.SerializeObject(jSONDocumentField);
            var result = await _documentSystemService.SaveDocumentSystemField(data);
            return result;
        }

        public async Task<WSEditReturn> SaveDocumentSystemModule(List<DocumentSystemModule> models)
        {
            DocumentSystemModuleSaveData data = (DocumentSystemModuleSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemModuleSaveData));

            List<DocumentModule> documentModules = new List<DocumentModule>();
            string GroupGuiId = Guid.NewGuid().ToString();
            foreach (DocumentSystemModule model in models)
            {
                DocumentModule documentModule = new DocumentModule();
                documentModule.IdRepTableModuleTemplateName = model.IdRepTableModuleTemplateName != null ? model.IdRepTableModuleTemplateName.ToString() : "";
                documentModule.DefaultValue = model.DefaultValue;
                documentModule.IsBlocked = ConverterUtils.BoolToString(model.IsBlocked);
                documentModule.IsDeleted = ConverterUtils.BoolToString(model.IsDeleted);
                documentModules.Add(documentModule);
            }
            JSONDocumentModule jSONDocumentModule = new JSONDocumentModule
            {
                DocumentModuleTemplateName = documentModules
            };

            data.JSONDocumentModuleTemplateName = JsonConvert.SerializeObject(jSONDocumentModule);
            var result = await _documentSystemService.SaveDocumentSystemModule(data);
            return result;
        }
        public async Task<WSEditReturn> SaveDocumentSystemContainer(List<DocumentSystemContainer> models)
        {
            DocumentSystemContainerSaveData data = (DocumentSystemContainerSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemContainerSaveData));

            List<DocumentModuleContainer> documentContainers = new List<DocumentModuleContainer>();
            string GroupGuiId = Guid.NewGuid().ToString();
            foreach (DocumentSystemContainer model in models)
            {
                DocumentModuleContainer documentField = new DocumentModuleContainer();
                documentField.IdDocumentTableModuleContainer = model.IdDocumentTableModuleContainer != null ? model.IdDocumentTableModuleContainer.ToString() : "";
                documentField.IdRepDocumentType = model.IdRepDocumentType.ToString();
                documentField.IdRepTableModuleTemplateName = model.IdRepTableModuleTemplateName.ToString();
                documentField.IsActive = ConverterUtils.BoolToString(model.IsActive);
                documentField.IsDeleted = ConverterUtils.BoolToString(model.IsDeleted);
                documentContainers.Add(documentField);
            }
            JSONDocumentContainer jSONDocumentContainer = new JSONDocumentContainer
            {
                DocumentTableModuleContainer = documentContainers
            };
            data.JSONDocumentTableModuleContainer = JsonConvert.SerializeObject(jSONDocumentContainer);
            var result = await _documentSystemService.SaveDocumentSystemContainer(data);
            return result;
        }

        public async Task<IEnumerable<dynamic>> GetAllModules(int? IdRepDocumentType)
        {
            DocumentSystemModuleGetData data = (DocumentSystemModuleGetData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemModuleGetData));
            data.IdRepDocumentType = IdRepDocumentType!=null?IdRepDocumentType.ToString():null;
            return await _documentSystemService.GetAllModules(data);
        }

        public async Task<IEnumerable<dynamic>> GetAllFields(int? IdRepTableModuleTemplateName)
        {
            DocumentSystemFieldGetData data = (DocumentSystemFieldGetData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentSystemFieldGetData));
            data.IdRepTableModuleTemplateName = IdRepTableModuleTemplateName!=null? IdRepTableModuleTemplateName.ToString():null;
            return await _documentSystemService.GetAllFields(data);
        }
        public async Task<IEnumerable<dynamic>> GetAllDoctypes()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            return await _documentSystemService.GetAllDoctypes(data);
        }
    }
}
