using System;
using System.Collections.Generic;

using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    public interface IDocumentContainerService
    {

        Task<object> GetThumbnails(DocumentContainerScansGetData data);

        Task<IEnumerable<dynamic>> GetDoc2OCR(DocumentContainerScansGetData data);
        Task<WSEditReturn> SaveDocumentContainerOCR(DocumentContainerOCRSaveData data);

        Task<IEnumerable<dynamic>> GetDoc2Group(DocumentContainerGroupGetData data);

        Task<IEnumerable<dynamic>> GetDoc2Entry(DocumentContainerGroupGetData data);
        Task<IEnumerable<dynamic>> SaveDocEntry(DocumentContainerGroupGetData data);
        Task<IEnumerable<dynamic>> getFieldForEntry(DocumentContainerGroupGetData data);

        Task<WSEditReturn> SaveDocumentContainerProcessed(DocumentContainerProcessedSaveData data);

        Task<WSEditReturn> SaveDocumentContainerFilesLog(DocumentContainerFilesLogSaveData data);

        Task<IEnumerable<dynamic>> getTextEntity(DocumentContainerTextEntityGetData data);
        Task<IEnumerable<dynamic>> GetPagesByDocId(DocumentContainerScansGetData data);
        Task<IEnumerable<dynamic>> GetOCRDataByFileId(DocumentContainerScansGetData data);
        Task<WSEditReturn> DeleteScanDocument(DocumentContainerScanCRUD data);

        Task<object> GetDocumentScanById(DocumentContainerScanCRUD data);

        Task<object> GetDocumentContainerForDownload(DocumentContainerScanCRUD data);
        Task<WSEditReturn> SaveDocumentContainerPage(DocumentContainerPageScanData data);
        Task<WSEditReturn> SaveDocumentUnGroup(DocumentContainerPageScanData data);

        Task<IEnumerable<dynamic>> GetDocumentContainerFileByListIds(DocumentContainerScanCRUD data);
        Task<object> GetFilesForUpload(Data data);
        Task<object> UpdateFilesForUpload(FileUploadSaveData data);
        Task<WSEditReturn> SaveDocumentQrCode(DocumentContainerQrCodeSaveData data);

        Task<WSEditReturn> SaveOCRPositionOnContainerFile(DocumentContainerPageScanData data);

        Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree);

        Task<List<DocumentTreeInfo>> GetDetailTreeNode(Data data, string nodeName);
        Task<List<DocumentTreeInfo>> GetOtherTreeNode(Data data);
    }
}
