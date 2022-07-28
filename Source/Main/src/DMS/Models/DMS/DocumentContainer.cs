using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentContainer
    {
        public long? IdDocumentContainerScans { get; set; }
        public string ScannerTwainDllVersion { get; set; }
        public string ScannerDevice { get; set; }
        public int? SkippedCounter { get; set; }
        public int? IdLogin { get; set; }
        public int? IdDocumenstPathSettings { get; set; }
        public int? IdApplicationOwner { get; set; }
        public string ScannedPath { get; set; }
        public string ScannedFilename { get; set; }
        public string ScannedDateUTC { get; set; }
        public int? CoordinateX { get; set; }
        public int? CoordinateY { get; set; }
        public int? CoordinatePageNr { get; set; }
        public int? NumberOfImages { get; set; }
        public string SourceScanGUID { get; set; }
        public string Notes { get; set; }
        public bool IsWrong { get; set; }
        public string DoneDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class DocumentContainerOCRModel
    {
        public int? IdDocumentContainerOcr { get; set; }
        public int? IdDocumentContainerScans { get; set; }
        public int? IdRepDocumentContainerOcrType { get; set; }
        public int IdRepDocumentType { get; set; }

        public dynamic OCRText { get; set; }
        public dynamic OCRJson { get; set; }
        public bool? IsActive { get; set; }
    }

    public class DocumentContainerGroupModel
    {
        public int IdDocumentContainerOcr { get; set; }

        public int PageNr { get; set; }

    }

    public class DocumentContainerProcessedModel
    {
        public int IdDocumentContainerOcr { get; set; }
        public int? IdDocumentContainerProcessed { get; set; }

        public string JsonDocumentModules { get; set; }

        public bool? IsActive { get; set; }

        public bool? IsFromAI { get; set; }

        public bool? IsDeleted { get; set; }

    }

    public class DocumentContainerPageScanModel
    {
        public int? IdDocumentContainerOcr { get; set; }
        public int IdDocumentContainerScans { get; set; }

        public int OldIdDocumentContainerScans { get; set; }

        public int PageNr { get; set; }
        public string IdMainDocument { get; set; }
        public string IndexName { get; set; }
        public string ScannedPath { get; set; }
        public string OldFileName { get; set; }
        public string OldScannedPath { get; set; }



    }
    public class DocumentContainerUnGroupModel
    {
        public int? IdDocumentContainerOcr { get; set; }
        public int IdDocumentContainerScans { get; set; }

        public int PageNr { get; set; }
        public string IdMainDocument { get; set; }
        public string IndexName { get; set; }
        public string ScannedPath { get; set; }
        



    }


    public class DocumentContainerThumbnailResponse
    {
        public int TotalRecords { get; set; }

        public IEnumerable<dynamic> Data { get; set; }

    }

}
