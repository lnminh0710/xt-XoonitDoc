using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IConvertImageProcessBusiness
    {
        void ReInit(string authorization);

        Task<UploadImageProcessModel> ConvertImage(List<IFormFile> files, List<ImageModel> imageModels, ScanningLotItemData scanningLotItemData);
        Task<UploadImageProcessModel> ImportEmail(string accessToken, string itemId);
        UploadImageProcessModel ConvertImageByBase64(List<ImageModel> images, ScanningLotItemData scanningLotItemData);

        Task<WSEditReturn> AddQueue(UploadImageProcessModel uploadImageProcess);

        Task<WSEditReturn> AddQueueUpdateImage(List<string> idDocumentContainerScans);

        Task<WSEditReturn> AddQueueUnGroupImage(List<string> idDocumentContainerScans);

        bool CheckTypeDocumentImport(IFormFileCollection listFiles);

        Task<DocumentTreeInfo> GetDocumentTreesDetails(string idDocumentTree);

        Task<DocumentTreeInfo> GetDetailTreeNode(string nodeName, string userId, string idApplicationOwner);

        Task<DocumentTreeInfo> GetOtherTreeNode(string userId, string idApplicationOwner);

        UserFromService CurrentUser();

        Task<UserFromService> GetUserInfo(string idLogin);

        Task<WSEditReturn> ImportDocumentToDB(ScanningLotItemData model);

        Task<WSEditReturn> AddQueueDocumentIndexing(UploadImageProcessModel uploadImageProcess);
        Task<WSEditReturn> AddQueueReadContentDocumentIndexing(UploadImageProcessModel uploadImageProcess);

        Task<UploadImageProcessModel> SaveDocumentEmailIndexing(List<IFormFile> files, ScanningLotItemData scanningLotItemData, string treePath);
        Task<ImageProcessModel> ImportImage(IFormFile file);
        ImageProcessModel ImportImage(string filePath);
        Task<WSEditReturn> CompleteImportProcess(ImportProcessModel importProcessModel);
    }
}
