using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Utils;
using System.Collections.Generic;
using System.Threading.Tasks;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    public interface IDocumentIndexingBusiness
    {
        Task<IEnumerable<TreeNode<int, DocumentGroupingTreeModel>>> GetDocumentTreeIndexingByUser(GetDocumentTreeOptions options);
        Task<WSNewReturnValue> CreateFolderIndexing(string fullPath, string idLogin, string idApplicationOwner = null, string idRepLanguage = null);
        Task<List<DocumentTreeInfo>> GetDetailTreeNodeIndexing(string nodeName, string userId, string idApplicationOwner);
        Task<WSEditReturn> UpdateFolderIndexing(DocumentTreeViewModel model);

        Task<WSEditReturn> DeleteFolderIndexingService(DocumentTreeViewModel model, bool deletedFromWeb);

        Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfIndexing(string idDocumentTree, string userId, string idApplicationOwner);

        Task<WSEditReturn> DeleteDocumentIndexing(DocumentModel model);

        Task<WSEditReturn> UpdateDocumentIndexing(DocumentModel model);

        Task<WSNewReturnValue> CreateSubFolderIndexing(string nodeName, string idTreeParent, string idLogin, string idApplicationOwner = null, string idRepLanguage = null);

        Task<WSNewReturnValue> CheckAndCreateFolderIndexing(string idLogin, string folder, bool autoCreate);

        Task UpdateFolderIndexing(string oldPath, string newFolder, string idLogin, bool changedFromWeb);
        //Task RenameFolderDeletedIndexingOnPublicFile(string oldPath, string idLogin);
        Task DeleteFolderIndexing(string oldPath, string idLogin, bool deleteFromWeb);
        Task DeleteDocument(DocumentTreeMove item);
    }
}

