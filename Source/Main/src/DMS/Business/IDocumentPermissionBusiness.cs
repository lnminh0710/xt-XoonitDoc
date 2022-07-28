using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IDocumentPermissionBusiness
    {
        Task<object> GetDocumentIndexingPermission(Dictionary<string, object> values);
        Task<object> CRUDDocumentIndexingPermission(Dictionary<string, object> values);

        Task<object> GetDocumentMailPermission(Dictionary<string, object> values);

        Task<object> CRUDDocumentMailPermission(Dictionary<string, object> values);
    }
}

