using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils.RestServiceHelper;
using System.Collections.Generic;
using System.Threading.Tasks;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    public interface IDocumentCommonBusiness
    {
        List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeGroupCompany(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent);
        Task<DocumentTreeGetData> TransformRequestToDocTreeGetData(GetDocumentTreeOptions options);

        Task<object> GetTreePath(string idDocumentTree, string userId, string idApplicationOwner);

        Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree, string userId, string idApplicationOwner);
        string GetUploadFolder();

        CreateQueueModel CreateSystemSchedule(object dataQueue, int IdRepAppSystemScheduleServiceName);
        string CreateJsonText(string key, object value, string startString = "{", string endString = "}");

        Task<List<TreePermissionModel>> GetTreePermissionIdLogin(Dictionary<string, object> values);
        IEnumerable<DocumentGroupingTreeModel> AddTreePermissionToStructureTreeIndexing(bool isIndexing, string idLogin, IEnumerable<DocumentGroupingTreeModel> tree, List<TreePermissionModel> treePermission, bool isSuperAdmin, bool isAdmin);
        IEnumerable<DocumentGroupingTreeModel> PreSettingDocumentTree(string idLogin, IEnumerable<DocumentGroupingTreeModel> tree, bool isSuperAdmin, bool isAdmin);

        Task<object> GetDocumentsOfEmailTree(Dictionary<string, object> values);

        Task<string> DetectCommonFolderUser(string idLogin, string prefixTypeDocument);
        Task<string> CreateCommonFolderUser(string idLogin, string prefixTypeDocument);
    }
}

