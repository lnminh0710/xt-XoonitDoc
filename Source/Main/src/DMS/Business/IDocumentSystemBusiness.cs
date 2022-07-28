using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Utils;

namespace DMS.Business
{
    public interface IDocumentSystemBusiness
    {
        Task<WSEditReturn> SaveDocumentSystemModule(List<DocumentSystemModule> models);
        Task<WSEditReturn> SaveDocumentSystemDocumentType(List<DocumentSystemDocType> models);
        Task<WSEditReturn> SaveDocumentSystemField(List<DocumentSystemField> models);
        Task<WSEditReturn> SaveDocumentSystemContainer(List<DocumentSystemContainer> models);
        Task<IEnumerable<dynamic>> GetAllModules(int? IdRepDocumentType);
        Task<IEnumerable<dynamic>> GetAllFields(int? IdRepTableModuleTemplateName);
        Task<IEnumerable<dynamic>> GetAllDoctypes();

    }
}
