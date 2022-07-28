using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// SavingScanningDocumentItemData
    /// </summary>
    public class SavingScanningDocumentItemData : Data
    {
        /// <summary>
        /// JSONDocumentContainerScans
        /// </summary>
        public string JSONDocumentContainerScans { get; set; }
    }


    /// <summary>
    /// ScanningDocumentData
    /// </summary>
    public class ScanningDocumentData
    {
        /// <summary>
        /// DocumentContainerScans
        /// </summary>
        public IList<ScanningDocumentItemData> DocumentContainerScans { get; set; }
    }


    /// <summary>
    /// ScanningDocumentItemData
    /// </summary>
    public class ScanningDocumentItemData
    {
        /// <summary>
        /// IdLogin
        /// </summary>
        public int? IdLogin { get; set; }

        /// <summary>
        /// IdDocumentContainerScans
        /// </summary>
        public string IdDocumentContainerScans { get; set; }

        /// <summary>
        /// ScannerTwainDllVersion
        /// </summary>
        public string ScannerTwainDllVersion { get; set; }

        /// <summary>
        /// ScannerDevice
        /// </summary>
        public string ScannerDevice { get; set; }

        /// <summary>
        /// SkippedCounter
        /// </summary>
        public int? SkippedCounter { get; set; }

        /// <summary>
        /// IdDocumenstPathSettings
        /// </summary>
        public int? IdDocumenstPathSettings { get; set; }
        
        /// <summary>
        /// ScannedPath
        /// </summary>
        public string ScannedPath { get; set; }

        /// <summary>
        /// ScannedFilename
        /// </summary>
        public string ScannedFilename { get; set; }

        /// <summary>
        /// ScannedDateUTC
        /// </summary>
        public string ScannedDateUTC { get; set; }        

        /// <summary>
        /// CoordinateX
        /// </summary>
        public string CoordinateX { get; set; }

        /// <summary>
        /// CoordinateY
        /// </summary>
        public string CoordinateY { get; set; }

        /// <summary>
        /// CoordinatePageNr
        /// </summary>
        public string CoordinatePageNr { get; set; }

        /// <summary>
        /// NumberOfImages
        /// </summary>
        public string NumberOfImages { get; set; }    

        /// <summary>
        /// SourceScanGUID
        /// </summary>
        public string SourceScanGUID { get; set; }       

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; } 

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// JSONDocumentContainerFiles
        /// </summary>
        public List<DocumentContainerFilesData> JSONDocumentContainerFiles { get; set; }

        /// <summary>
        /// IsMainDocument
        /// </summary>
        public bool IsMainDocument { get; set; }
    }

    /// <summary>
    /// DocumentContainerFilesData
    /// </summary>
    public class DocumentContainerFilesData
    {
        /// <summary>
        /// IdDocumentContainerFiles
        /// </summary>
        public int? IdDocumentContainerFiles { get; set; }

        /// <summary>
        /// IdDocumentContainerScans
        /// </summary>
        public int? IdDocumentContainerScans { get; set; }

        /// <summary>
        /// IdRepDocumentContainerFilesType
        /// </summary>
        public int? IdRepDocumentContainerFilesType { get; set; }

        /// <summary>
        /// IdDocumenstPathSettings
        /// </summary>
        public int? IdDocumenstPathSettings { get; set; }

        /// <summary>
        /// FileName
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Size
        /// </summary>
        public long? Size { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }
    }

    #region Save Order, Invoice, Offer
    public class SaveOrderProcessingData
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public SaveOrderProcessingData()
        {
            IgnoredKeys = new List<string>();
        }
    }

    public class SaveOrderProcessingDocumentsLinkData
    {
        public Data Data { get; set; }
        public IList<OrderProcessingDocumentsLink> Files { get; set; }

        public SaveOrderProcessingDocumentsLinkData()
        {
        }
    }

    public class OrderProcessingDocumentsLink
    {
        public int IdOrderProcessing { get; set; }
        public int IdRepProcessingType { get; set; }
        public string  MediaName { get; set; }
        public string MediaRelativePath { get; set; }
        public string MediaOriginalName { get; set; }
        public long MediaSize { get; set; }
        public string FileType { get; set; }

        public int? IdOffer { get; set; }
        public int? IdOrder { get; set; }
        public int? IdInvoice { get; set; }
    }

    public class DeleteCancelDocumentData
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public DeleteCancelDocumentData()
        {
            IgnoredKeys = new List<string>();
        }
    }
    #endregion
}
