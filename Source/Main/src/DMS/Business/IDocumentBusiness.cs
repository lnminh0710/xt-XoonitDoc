using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using DMS.Models.DMS.ViewModels;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using DMS.Utils;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    /// <summary>
    /// IDocumentBusiness
    /// </summary>
    public interface IDocumentBusiness
    {
        /// <summary>
        /// SaveScanningDocument
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanningDocument(SavingScanningDocumentItemData model);

        /// <summary>
        /// GetDocumentContainerPathSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<DocumentContainerPathSetting>> GetDocumentContainerPathSetting();

        /// <summary>
        /// GetDocumentContainerFilesType
        /// </summary>
        /// <returns></returns>
        Task<IList<DocumentContainerFilesType>> GetDocumentContainerFilesType();

        /// <summary>
        /// GetCustomerAssignmentsDetail
        /// </summary>
        /// <param name="idPerson"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetCustomerAssignmentsDetail(int idPerson, int idOrderProcessing);

        /// <summary>
        /// Save Order, Invoice, Offer
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveOrderProcessing(OrderProcessingModel model);

        /// <summary>
        /// Generate Order Processing Pdf
        /// </summary>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<OrderProcessingPdfFileInfo> GenerateOrderProcessingPdf(int idRepProcessingType, int idOrderProcessing, int? idOffer = null, int? idOrder = null, int? idInvoice = null);

        /// <summary>
        /// Save Order Processing Documents Link
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<IList<OrderProcessingPdfFileInfo>> SaveOrderProcessingDocumentsLink(OrderProcessingSaveDocumentsLinkModel model);

        /// <summary>
        /// Send Mail Order Processing
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SendMailOrderProcessing(OrderProcessingSendMailModel model);

        /// <summary>
        /// Get Data OrderProcessing By Id
        /// </summary>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetDataOrderProcessingById(int idOrderProcessing);

        /// <summary>
        /// Get Order Processing Documents
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetOrderProcessingDocuments(int idRepProcessingType, int idOrderProcessing);

        /// <summary>
        /// GetOrderProcessingEmail
        /// </summary>
        /// <param name="idOrderProcessing"></param>
        /// <param name="perType"></param>
        /// <returns></returns>
        Task<object> GetOrderProcessingEmail(int idOrderProcessing, string perType);

        /// <summary>
        /// Delete/ Cancel OP, Order, Invoice
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> DeleteCancelDocument(DeleteCancelDocumentModel model);

        /// <summary>
        /// Get Document Summary By User
        /// </summary>
        /// <returns></returns>
        Task<DocumentSummaryModel> GetDocumentSummary();

        /// <summary>
        /// Get Document Tree By User
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<TreeNode<int, DocumentTreeModel>>> GetDocumentTreeByUser(GetDocumentTreeOptions options);

        /// <summary>
        /// Get favourite folder By User
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<TreeNode<int, FavouriteFolderModel>>> GetFavouriteFolderByUser();

        /// <summary>
        /// Get Document Invoice Dynamic Combobox
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<DocumentInvoiceDynamicComboboxModel>> GetDocumentInvoiceDynamicCombobox(int idDocumentTree);

        /// <summary>
        /// Get extracted data from ocr
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<object>> GetExtractedDataFromOcr(int idRepDocumentType, int idDocumentContainerOcr, int idDocumentContainerScan, string module);

        /// <summary>
        /// Create folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSNewReturnValue> CreateFolder(DocumentTreeViewModel model);

        /// <summary>
        /// Create folder favouritw
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<object> CreateFolderFavourite(DocumentTreeViewModel model);

        /// <summary>
        /// Add Contact To Favourite
        /// </summary>
        /// <param name="model">favourite contact model</param>
        /// <returns></returns>
        Task<object> AddContactToFavourite(FavouriteContactModel model);


        /// <summary>
        /// Update folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateFolder(UpdatedDocumentTreeViewModel model);

        /// <summary>
        /// Delete folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteFolder(DocumentTreeViewModel model);

        /// <summary>
        /// Get Attachment List By Contact
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<object>> GetAttachmentListByContact(AttachmentViewModel model);

        Task<DataCommonDocumentBeforeSave> HandleCommonDocumentBeforeSave(CapturedBaseDocumentModel model, string sharingContactPersonNr);

        Task HandleCommonDocumentAfterSave(SaveDocumentResultModel model, CapturedBaseDocumentModel document);
        Task HandleAfterUpdateImage(List<string> idMainDocuments, string esIndex, Data data);

        Task<DocumentTreePathModel> GetPathTreeDocument(int? IdDocumentContainerScans, int? IdMainDocument);

        Task SendMailDocument(DocumentSendMailModel model);

        Task<FormGroupDefinitionV2ViewModel> GetFormGroupSettings(GetFormGroupSettingsQuery query);
        Task<FormGroupDefinitionViewModel> GetFormColumnSettings(GetFormColumnSettingsQuery model);
        Task<WSEditReturn> SaveFormColumnSettings(SaveFormColumnSettings model);

        Task<WSEditReturn> ChangeDocumentToOtherTree(Dictionary<string, object> data);

        Task<object> GetDetailTreeNode(string nodeName);
        Task<object> CRUDNotes(Dictionary<string, object> data);
        Task<object> GetNotes(Dictionary<string, object> values);
        
        Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree, string userId, string idApplicationOwner);
        Task<object> GetPermissionUserTree(Dictionary<string, object> values);

        Task<object> ChangeDocumentTreeOfDocuments(Dictionary<string, object> data);
        Task<WSEditReturn> DeleteDocuments(Dictionary<string, object> data);
    }
}

