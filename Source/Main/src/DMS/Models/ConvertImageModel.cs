using DMS.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
namespace DMS.Models
{
    public class ConvertImageResult
    {
        public ConvertImageResult()
        {
            ResultImageFiles = new List<string>();
        }
        public string TiffFilename { get; set; }
        public int TotalPages { get; set; }
        public List<string> ResultImageFiles { get; set; }
        public string ScannedPath { get; set; }

    }

    public class UpdateImage
    {

        public List<string> IdDocumentContainerScans { get; set; }



    }
    public class UpdateImageServiceModel
    {

        public string IdDocumentContainerScans { get; set; }

    }
    public class UploadImageModel
    {
        public List<ImageModel> Images { get; set; }
        public bool IsKeepFileName { get; set; }
        public ScanningLotItemData ScanningLotItemData { get; set; }

        public SaveOtherDocumentModel OtherDocumentData { get; set; }

        public SaveContractModel ContractData { get; set; }

        public SaveInvoiceModel InvoiceData { get; set; }
    }
    public class ImageModel
    {
        public string base64_string { get; set; }
        public string FileName { get; set; }

        public int? PageNr { get; set; }

        public void BuildData()
        {
            if (base64_string != null)
            {
                //data:image/png;base64
                base64_string = Regex.Replace(base64_string, "^data:image\\/[a-zA-Z]+;base64,", string.Empty);
            }
        }
    }
    public class QrCodeModel
    {

        public string FilePath { get; set; }

        public string IdDocumentContainerScans { get; set; }

    }
    public class ImageMultipartModel
    {
        public IFormFile File { get; set; }
        public string FileName { get; set; }

        public int? PageNr { get; set; }


    }

    public class UploadImageProcessModel
    {
        public List<ImageProcessModel> Images { get; set; }

        public string ScannedPath { get; set; }
        public string IdLogin { get; set; }

        public string IdDocumentContainerScans { get; set; }
        public string IdApplicationOwner { get; set; }

        public ScanningLotItemData ScanningLotItemData { get; set; }

        public bool IsMsgOutlookFile { get; set; }

        public UploadImageProcessModel()
        {
            Images = new List<ImageProcessModel>();
        }

        public SaveOtherDocumentModel OtherDocumentData { get; set; }

        public SaveInvoiceModel InvoiceData { get; set; }

        public SaveContractModel ContractData { get; set; }

    }
    public class ImageProcessModel
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }

        public int? PageNr { get; set; }
        public string IdRepDocumentContainerFilesContentType { get; set; }

    }
    /// <summary>
    /// ImportProcessModel
    /// </summary>
    public class ImportProcessModel
    {
        /// <summary>
        /// Images
        /// </summary>
        public List<ImageProcessModel> Images { get; set; }

        /// <summary>
        /// BranchNr
        /// </summary>
        public string BranchNr { get; set; }

        /// <summary>
        /// IdBranches
        /// </summary>
        public string IdBranches { get; set; }

        /// <summary>
        /// GroupUuid
        /// </summary>
        public string GroupUuid { get; set; }

        public string IdDocumentTree { get; set; }

        public string Path { get; set; }

        public string IdRepDocumentContainerFilesContentType { get; set; }

        public string IsApproval { get; set; }
    }
    public class ImageProcessResponseModel
    {
        public string FileName { get; set; }

        public string IdDocumentContainerScans { get; set; }

    }

    public class UserUploadInfo
    {
        public string IdLogin { get; set; }

        public string FolderPath { get; set; }
        public string IdApplicationOwner { get; set; }
    }

    public class DocumentIndexingQueueModel
    {
        public string FolderPath { get; set; }
        public string FilePath { get; set; }

        public string ActionOnDocument { get; set; }

        public string IdLogin { get; set; }

        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentTree { get; set; }

        public string TypeDocument { get; set; }

        public string NewFolderPath { get; set; }

        public string DocumentName { get; set; }
    }

}
