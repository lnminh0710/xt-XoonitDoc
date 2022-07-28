using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;

namespace DMS.Service
{
    public interface IDocumentSystemService
    {
        Task<WSEditReturn> SaveDocumentSystemModule(DocumentSystemModuleSaveData data);
        Task<WSEditReturn> SaveDocumentSystemDocumentType(DocumentSystemDocumentTypeSaveData data);
        Task<WSEditReturn> SaveDocumentSystemField(DocumentSystemFieldSaveData data);
        Task<WSEditReturn> SaveDocumentSystemContainer(DocumentSystemContainerSaveData data);
  
        Task<IEnumerable<dynamic>> GetAllModules(DocumentSystemModuleGetData data);
        Task<IEnumerable<dynamic>> GetAllFields(DocumentSystemFieldGetData data);
        Task<IEnumerable<dynamic>> GetAllDoctypes(Data data);
    }
}
