using System.Collections.Generic;

namespace DMS.Models
{
    //public class OrderProcessingPdfModel
    //{
    //    public OrderProcessingPdfHeader Header { get; set; }
    //    public OrderProcessingPdfFooter Footer { get; set; }
    //    public OrderProcessingPdfTotal Total { get; set; }

    //    public IList<OrderProcessingPdfOrderDetail> OrderDetails { get; set; }
    //    public string HtmlOrderDetails { get; set; }

    //    public OrderProcessingPdfModel()
    //    {
    //        Header = new OrderProcessingPdfHeader();
    //        Footer = new OrderProcessingPdfFooter();
    //        Total = new OrderProcessingPdfTotal();

    //        OrderDetails = new List<OrderProcessingPdfOrderDetail>();
    //        HtmlOrderDetails = string.Empty;
    //    }
    //}

    //public class OrderProcessingPdfOrderDetail
    //{
    //    public string ArticleNameShort { get; set; }
    //    public string SerialNr { get; set; }
    //    public double? PriceExclVat { get; set; }
    //    public double? VatRate { get; set; }
    //    public double? TaxAmount { get; set; }
    //    public string Quantity { get; set; }
    //    public double? PriceInclVat { get; set; }
    //    public double? Discount { get; set; }
    //    public double? DiscountAmount { get; set; }
    //    public double? Amount { get; set; }
    //    public double? Grossamount { get; set; }
    //}

    //public class OrderProcessingPdfHeader
    //{
    //    public string CompanyLogo { get; set; }
    //    public string CompanyAddress { get; set; }
    //    public string ReceiverInfo { get; set; }
    //    public string OrderInfo { get; set; }
    //    public string OP_Number { get; set; }
    //}

    //public class OrderProcessingPdfFooter
    //{
    //    public string PaymentFor { get; set; }
    //    public string InfavourOf { get; set; }
    //    public string AccountNr { get; set; }
    //    public string CReferenceNr { get; set; }
    //    public string PaidBy { get; set; }
    //    public string ScanNr { get; set; }
    //}

    //public class OrderProcessingPdfTotal
    //{
    //    public double? TotalAmount { get; set; }
    //    public double? TotalTaxAmount { get; set; }
    //    public double? OrganizerTax { get; set; }
    //}

    public class OrderProcessingPdfFileInfo
    {
        public int IdOrderProcessing { get; set; }
        public int IdRepProcessingType { get; set; }

        public string FileType { get; set; }
        public string RelativeFolderPath { get; set; }
        public string FullFolderPath { get; set; }
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public string FullFileName { get; set; }
        public long MediaSize { get; set; }
    }
}
