using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Utils;
using System.Collections.Generic;
using System.Threading.Tasks;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    public interface IDocumentEmailBusiness
    {
        Task<IEnumerable<TreeNode<int, DocumentGroupingTreeModel>>> GetDocumentTreeEmailByUser(GetDocumentTreeOptions options);
        Task<WSNewReturnValue> CreateFolderEmail(string fullPath, string idLogin, string idApplicationOwner = null, string idRepLanguage = null);
        Task<List<DocumentTreeInfo>> GetDetailTreeNodeEmail(string nodeName, string userId, string idApplicationOwner);
        Task<WSEditReturn> UpdateFolderEmail(DocumentTreeViewModel model);

        Task<WSEditReturn> DeleteFolderEmailService(DocumentTreeViewModel model, bool deletedFromWeb);

        Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfEmail(string idDocumentTree, string userId, string idApplicationOwner);

        Task<WSEditReturn> DeleteDocumentEmail(DocumentModel model);

        Task<WSEditReturn> UpdateDocumentEmail(DocumentModel model);

        Task<WSNewReturnValue> CreateSubFolderEmail(string nodeName, string idTreeParent, string idLogin, string idApplicationOwner = null, string idRepLanguage = null);

        Task<WSNewReturnValue> CheckAndCreateFolderEmail(Dictionary<string, object> values);

        Task UpdateFolderEmail(string oldPath, string newFolder, string idLogin, bool changedFromWeb);
        //Task RenameFolderDeletedEmailOnPublicFile(string oldPath, string idLogin);
        Task DeleteFolderEmail(string oldPath, string idLogin, bool deleteFromWeb);

        Task<WSEditReturn> MoveEmailToOtherTree(DocumentModel model);

        Task DetectDocumentMoved(DocumentTreeMailMove item);
    }
}

