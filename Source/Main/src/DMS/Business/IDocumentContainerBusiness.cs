using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;

namespace DMS.Business
{
    public interface IDocumentContainerBusiness
    {
        Task<object> GetThumbnails(int pageSize, int pageIndex);

        Task<IEnumerable<dynamic>> GetDoc2OCR(int? numberFile);

        Task<object> SaveDocumentContainerOCR(List<DocumentContainerOCRModel> models);

        Task<WSEditReturn> SaveDocumentContainerGroup(List<DocumentContainerGroupModel> models);

        Task<IEnumerable<dynamic>> GetDoc2Group(int pageSize, int? idDocumentContainerOcr);

        Task<IEnumerable<dynamic>> GetDoc2Entry();

        Task<IEnumerable<dynamic>> SaveDocEntry();

        Task<IEnumerable<dynamic>> getFieldForEntry();

        Task<WSEditReturn> SaveDocumentContainerProcessed(List<DocumentContainerProcessedModel> models);

        Task<WSEditReturn> SaveDocumentContainerFilesLog(DocumentContainerFilesLog documentContainerFilesLog);

        Task<IEnumerable<dynamic>> getTextEntity(int? IdRepDocumentType);
        Task<DocumentScanFiles> GetDocumentContainerForDownload(int idDocumentContainerScans, int? idDocumentContainerFileType);
        Task<object> DeleteScanDocument(List<int> IdDocumentContainerScans);
        Task<IEnumerable<dynamic>> GetPagesByDocId(int idDocumentContainerScans, int? idDocumentContainerFileType);
        Task<IEnumerable<dynamic>> GetOCRDataByFileId(string idDocumentContainerFile);
        Task<bool> SendEmailDocument(EmailDocumentModel model);

        Task<WSEditReturn> SaveDocumentContainerPage(List<DocumentContainerPageScanModel> models);

        CreateQueueModel CreateSystemScheduleUpdateImage(List<string> idDocumentContainerScans);
        Task<object> GetFilesForUpload();
        Task<object> UpdateFilesForUpload(FileUploadModel fileUploadModel);
        Task<List<DocumentScanFiles>> GetDocumentScanFiles(List<string> IdDocumentContainerScansList);
        Task<WSEditReturn> SaveDocumentContainerUnGroup(List<DocumentScanFiles> files);

        Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree);

        Task<object> GetEmailData(Dictionary<string, object> values);
        Task<object> GetEmailAttachements(Dictionary<string, object> values);
        Task<DocumentTreeImportEmailInfo> GetDefaultInfoTreeMailDoc();

        Task<List<DocumentTreeInfo>> GetDetailTreeNode(string nodeName, string userId, string idApplicationOwner);
        Task<List<DocumentTreeInfo>> GetOtherTreeNode(string userId, string idApplicationOwner);

        Task<object> GetDocumentsOfTree(Dictionary<string, object> values);
        Task<object> GetDocumentsOfEmailTree(Dictionary<string, object> values);

        Task<object> GetImportFolderOfCompany(Dictionary<string, object> values);
    }
}
