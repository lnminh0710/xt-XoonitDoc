using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.RestServiceHelper
{
    public class DocumentContainerScansGetData : Data
    {
        public string PageSize { get; set; }
        public string PageIndex { get; set; }
        public string IdDocumentContainerFileType { get; set; }

        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentContainerFiles { get; set; }
        public string TopRows { get; set; }
    }

    public class DocumentContainerOCR
    {
        public string IdDocumentContainerOcr { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdRepDocumentContainerOcrType { get; set; }
        public string IdRepDocumentType { get; set; }
        public string PageNr { get; set; }
        public dynamic OCRText { get; set; }
        public dynamic OCRJson { get; set; }
        public string IsActive { get; set; }
    }
    public class JSONDocumentContainerOCR
    {
        public List<DocumentContainerOCR> DocumentContainerOCR { get; set; }
    }

    public class DocumentContainerOCRSaveData : Data
    {
        public string JSONDocumentContainerOCR { get; set; }
    }

    public class DocumentContainerGroupGetData : Data
    {
        public string IdDocumentContainerFileType { get; set; }

        public string PageSize { get; set; }

        public string B06DocumentContainerOcr_IdDocumentContainerOcr { get; set; }
    }

    public class DocumentContainerGroup
    {
        public string IdDocumentContainerOcr { get; set; }

        public string PageNr { get; set; }

        public string GUID { get; set; }
    }
    public class JSONDocumentContainerGroup
    {
        public List<DocumentContainerGroup> DocumentContainerOCR { get; set; }
    }

    public class DocumentContainerProcessed
    {
        public string IdDocumentContainerOcr { get; set; }
        public string IdDocumentContainerProcessed { get; set; }

        public dynamic JsonDocumentModules { get; set; }

        public string IsActive { get; set; }

        public string IsFromAI { get; set; }

        public string IsDeleted { get; set; }

    }
    public class DocumentContainerProcessedSaveData : Data
    {
        public string JSONDocumentContainerProcessed { get; set; }
    }

    public class JSONDocumentContainerProcessed
    {
        public List<DocumentContainerProcessed> DocumentContainerProcessed { get; set; }
    }
    public class DocumentContainerTextEntityGetData : Data
    {
        public string IdRepDocumentType { get; set; }

    }

    public class DocumentContainerScanCRUD : Data
    {
        public string IdDocumentContainerOcr { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdRepDocumentContainerOcrType { get; set; }
        public string IdRepDocumentType { get; set; }
        public string IdDocumentContainerFileType { get; set; }
        public string IdDocumentContainerScansList { get; set; }
        public string FileName { get; set; }

        public string Size { get; set; }
        public string OriginalCreateDate { get; set; }
        public string OriginalUpdateDate { get; set; }
    }
    public class DocumentContainerPageScan
    {
        public string IdDocumentContainerOcr { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string OldIdDocumentContainerScans { get; set; }
        public string PageNr { get; set; }

    }
    public class DocumentContainerPageScanData : Data
    {
        public string JSONDocumentContainerOCR { get; set; }
    }

    public class JSONDocumentContainerPageScan
    {
        public List<DocumentContainerPageScan> DocumentContainerOCR { get; set; }
    }
    public class FileUploadSaveData : Data
    {
        public string IdDocumentContainerFilesUpload { get; set; }
        public string UploadDuration { get; set; }

    }
    public class DocumentContainerQrCodeSaveData : Data
    {
        public string JsonQRCode { get; set; }
        public string IdDocumentContainerScans { get; set; }
    }

    public class JSONDocumentContainerTextPosition
    {
        public List<OCRDocumentContainerTextPosition> DocumentContainerOCRTextPosition { get; set; }
    }

    public class OCRDocumentContainerTextPosition
    {
        public string IdDocumentContainerOcr { get; set; }
        public string OCRJsonTextPosition { get; set; }

    }

    public class DocumentTreeGetDetails : Data
    {
        public string IdDocumentTree { get; set; }
    }
}
