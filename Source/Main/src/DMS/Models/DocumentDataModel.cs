using DMS.Utils;
using System.Collections.Generic;

namespace DMS.Models
{
    /// <summary>
    /// Save Order, Invoice, Offer
    /// </summary>
    public class DocumentDataModel
    {
        public Dictionary<string, object> Data { get; set; }
    }

    public class StatusTimeLineFilter
    {
        public string Company { get; set; }
        public string BranchNr { get; set; }
    }

    public class StatusTimeLineModel : Data
    {
        public string Company { get; set; }
        public string BranchNr { get; set; }

        public string EmailFilter { get; set; }
    }

    public class BranchRequestModel : Data
    {
        public string IdPersonHeadCompany { get; set; }
        public string IdBranches { get; set; }
    }

    public class CompanyRequestModel : Data
    {
        public string CompanyName { get; set; }
    }

    public class BranchModel
    {
        public string Company { get; set; }
        public string BranchName { get; set; }
        public string IdPersonHeadCompany { get; set; }
        public string IdBranches { get; set; }
        public string BranchNr { get; set; }
        public string BranchNrOrigin { get; set; }

    }

    public class CompanyModel
    {
        public string Company { get; set; }
        public string IdSharingCompany { get; set; }
        public string IdApplicationOwner { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }

    }

    public class ReportNoteModel
    {
        public string Date { get; set; }
        public string LoginName { get; set; }
        public string Notes { get; set; }
        public string IdSupportNotes { get; set; }
    }

    public class SaveReportNote : Data
    {
        public string Date { get; set; }

        public string Notes { get; set; }
        public string IdSupportNotes { get; set; }
        public string EmailFilter { get; set; }
    }

    public class StatusTimeLine
    {
        public CompanyDataTimeLine CompanyData { get; set; }

        public List<DocumentStatusTimeLine> Documents { get; set; }
    }

    public class CompanyDataTimeLine
    {
        public string Company { get; set; }
        public string Branch { get; set; }

    }

    public class DocumentStatusTimeLine
    {
        public string CreateDate { get; set; }
        public string Status { get; set; }

        public string Message { get; set; }

        public string IdMainDocument { get; set; }
        public string IdDocumentContainerScans { get; set; }
    }

    public class MainDocumentSaving
    {
        public string IdMainDocument { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentTree { get; set; }
        public string IsToDo { get; set; }
        public string ToDoNotes { get; set; }

    }

    public class ScannedPathModel
    {
        public string ScannedPath { get; set; }
    }

    public class DocumentScanModel
    {
        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdTreeRoot { get; set; }

        public string ScannedFilename { get; set; }
        public string ScannedPath { get; set; }
    }

}
