using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Newtonsoft.Json.Linq;
using OrderProcessingPdf;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Service
{
    /// <summary>
    /// IDocumentService
    /// </summary>
    public interface IDocumentService
    {
        /// <summary>
        /// SaveScanningDocument
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanningDocument(SavingScanningDocumentItemData data);

        /// <summary>
        /// GetDocumentContainerPathSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<DocumentContainerPathSetting>> GetDocumentContainerPathSetting(Data data);

        /// <summary>
        /// GetDocumentContainerFilesType
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<DocumentContainerFilesType>> GetDocumentContainerFilesType(Data data);

        /// <summary>
        /// GetCustomerAssignmentsDetail
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idPerson"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetCustomerAssignmentsDetail(Data data, int idPerson, int idOrderProcessing);

        /// <summary>
        /// Save Order, Invoice, Offer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveOrderProcessing(SaveOrderProcessingData data);

        /// <summary>
        /// Get OrderProcessing For Generating Pdf
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<OrderProcessingPdfModel> GetOrderProcessingForGeneratingPdf(Data data, int idRepProcessingType, int idOrderProcessing, int? idOffer = null, int? idOrder = null, int? idInvoice = null);

        /// <summary>
        /// Save Order Processing Documents Link
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveOrderProcessingDocumentsLink(SaveOrderProcessingDocumentsLinkData data);

        /// <summary>
        /// Get Data OrderProcessing By Id
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetDataOrderProcessingById(Data data, int idOrderProcessing);

        /// <summary>
        /// Get Order Processing Documents
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        Task<object> GetOrderProcessingDocuments(Data data, int idRepProcessingType, int idOrderProcessing);

        /// <summary>
        /// GetOrderProcessingEmail
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idOrderProcessing"></param>
        /// <param name="perType"></param>
        /// <returns></returns>
        Task<object> GetOrderProcessingEmail(Data data, int idOrderProcessing, string perType);

        /// <summary>
        /// Delete/ Cancel OP, Order, Invoice
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteCancelDocument(DeleteCancelDocumentData data);

        /// <summary>
        /// Get Document Summary
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<DocumentSummaryModel> GetDocumentSummary(Data data);

        /// <summary>
        /// Get Document Tree By User
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentTreeModel>> GetDocumentTreeByUser(DocumentTreeGetData data);

        /// <summary>
        /// Get Document Tree By User
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<FavouriteFolderModel>> GetFavouriteFolderByUser(DocumentTreeGetData data);


        /// <summary>
        /// Get Document Invoice Dynamic Combobox
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentInvoiceDynamicComboboxModel>> GetDocumentInvoiceDynamicCombobox(DocumentInvoiceDynamicData data);

        /// <summary>
        /// Get extracted data from ocr
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<object>> GetExtractedDataFromOcr(ExtractedDataOcrData data);

        /// <summary>
        /// Create folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSNewReturnValue> CreateFolder(DocumentTreeRootData data, DocumentTreeViewModel model);

        /// <summary>
        /// Create folder favourite
        /// </summary>
        /// <param name="model">favourite folder data</param>
        /// <returns></returns>
        Task<object> CreateFolderFavourite(FavouriteFolderData data);

        /// <summary>
        /// Add Contact To Favourite
        /// </summary>
        /// <param name="model">favourite folder data</param>
        /// <returns></returns>
        Task<object> AddContactToFavourite(FavouriteFolderData data);


        /// <summary>
        /// Update folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateFolder(DocumentTreeRootData data, UpdatedDocumentTreeViewModel model);

        /// <summary>
        /// Delete folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteFolder(DocumentTreeRootData data, DocumentTreeViewModel model);

        /// <summary>
        /// Delete folder
        /// </summary>
        /// <param name="model">document tree model</param>
        /// <returns></returns>
        Task<IEnumerable<object>> GetAttachmentListByContact(AttachmentData data);

        JObject TransformMainDocumentModelToParametersStored(MainDocumentModel mainDocumentModel);

        JObject TransformDocumentTreeMediaModelToParametersStored(DocumentTreeMediaModel documentTreeMediaModel, string idCloudConnection);

        JObject TransformFolderCapturedDocumentModelToParametersStored(FolderCapturedDocumentModel folderCapturedDocument);

        Task<DocumentTreePathModel> GetTreePathOfDocument(PathTreeGetData data);

        Task<FormGroupDefinition> GetFormColumnSettings(GetFormColumnSettingsData @params);
        Task<FormGroupDefinitionV2> GetFormGroupSettings(GetFormGroupSettingsData @params);
        Task<WSEditReturn> SaveFormColumnSettings(SaveFormColumnSettingsData data);

        Task<object> GetReportNotes(Data data, int idMainDocument);
        Task<JArray> GetReportNotesForOuput(Data data, int idMainDocument);

        /// <summary>
        /// Save Dynamic Data
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveFormDynamicData(SaveDynamicData data);
        Task<WSEditReturn> SaveProcessingForm(SaveDynamicData data);

        Task<object> GetScannedPathOfDocument(Data data, string IdDocumentContainerScans);

        Task<object> GetDetailTreeNode(Data data, string nodeName);
        #region Indexing tree
        Task<IEnumerable<object>> GetDocumentTreeIndexing(DocumentTreeGetData data);
        Task<WSNewReturnValue> CreateFolderIndexing(DocumentTreeRootData data, DocumentTreeViewModel model);
        Task<List<DocumentTreeInfo>> GetDetailTreeNodeIndexing(Data data, string nodeName);
        Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfIndexing(Data data, string idDocumentTree);

        Task<List<DocumentIndexingInfo>> GetDocumentIndexing(Data data, string filePath, string fileName);

        Task<WSEditReturn> DeleteDocumentIndexing(DocumentContainerScanCRUD data);

        Task<WSEditReturn> UpdateDocumentIndexing(DocumentContainerScanCRUD data);
        #endregion
        Task<object> GetTreePath(Data data, string idDocumentTree);
        Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(Data data, string idDocumentTree);

        #region Email tree
        Task<IEnumerable<object>> GetDocumentTreeEmail(DocumentTreeGetData data);
        #endregion

        Task<object> GetImportFolderOfCompany(Data data, string idSharingCompany);

        Task<List<DocumentIndexingInfo>> GetDocumentIndexingById(Data data, string idDocumentContainerScan);
    }
}

