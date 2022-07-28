namespace DMS.Utils.RestServiceHelper
{
    public class B07InvoicePdm
    {
        public string IdInvoicePdm { get; set; }
        public string IdMainDocument { get; set; }
        public string IdRepMeansOfPayment { get; set; }
        public string IdRepFinancialinstitute { get; set; }
        public string IdRepCurrencyCode { get; set; }
        public string IdRepInvoiceType { get; set; }
        public string ContoNr { get; set; }
        public string SWIFTBIC { get; set; }
        public string IBAN { get; set; }
        public string ESRNr { get; set; }
        public string MembershipNr { get; set; }
        public string InvoiceNr { get; set; }
        public string InvoiceDate { get; set; }
        public string VatNr { get; set; }
        public string PayableWithinDays { get; set; }
        public string PurposeOfPayment { get; set; }
        public string InvoiceAmount { get; set; }
        public string CustomerNr { get; set; }
        public string Collaborator { get; set; }
        public string IsPaid { get; set; }
        public string IsTaxRelevant { get; set; }
        public string IsGuarantee { get; set; }
        public string GuaranteeDateOfExpiry { get; set; }
        public string Notes { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07MainDocument
    {
        public string IdMainDocument { get; set; }
        public string IdApplicationOwner { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdDocumentTreeMedia { get; set; }
        public string GUID { get; set; }
        public string SearchKeyWords { get; set; }
        public string Notes { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07MainDocumentPerson
    {
        public string IdMainDocumentPerson { get; set; }
        public string IdMainDocument { get; set; }
        public string IdPerson { get; set; }
        public string IdRepMainDocumentPersonType { get; set; }
        public string IdRepPersonType { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07DocumentTreeMedia
    {
        public string IdDocumentTreeMedia { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdCloudConnection { get; set; }
        public string MediaRelativePath { get; set; }
        public string MediaName { get; set; }
        public string MediaOriginalName { get; set; }
        public string MediaNotes { get; set; }
        public string MediaTitle { get; set; }
        public string MediaDescription { get; set; }
        public string MediaSize { get; set; }
        public string MediaHight { get; set; }
        public string MediaWidth { get; set; }
        public string MediaPassword { get; set; }
        public string IsBlocked { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07Contract
    {
        public string IdContract { get; set; }
        public string IdMainDocument { get; set; }
        public string IdRepCurrencyCode { get; set; }
        public string ContractNr { get; set; }
        public string NetAnnualPremium { get; set; }
        public string CommencementOfInsurance { get; set; }
        public string TermOfContract { get; set; }
        public string Notes { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07OtherDocuments
    {
        public string IdOtherDocuments { get; set; }
        public string IdMainDocument { get; set; }
        public string Notes { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B07DocumentTree
    {
        public string IdDocumentTree { get; set; }
        public string IdDocumentTreeRoot { get; set; }
        public string IdDocumentTreeParent { get; set; }
        public string IdRepDocumentGuiType { get; set; }
        public string IdApplicationOwner { get; set; }
        public string GroupName { get; set; }
        public string SortingIndex { get; set; }
        public string IconName { get; set; }
        public string IsReadOnly { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }
}
