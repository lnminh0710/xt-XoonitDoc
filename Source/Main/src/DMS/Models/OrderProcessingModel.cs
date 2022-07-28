using DMS.Utils;
using System.Collections.Generic;

namespace DMS.Models
{
    /// <summary>
    /// Save Order, Invoice, Offer
    /// </summary>
    public class OrderProcessingModel
    {
        public Dictionary<string, object> Data { get; set; }
    }

    public class OrderProcessingSendMailModel
    {
        public IList<OrderProcessingSendMailItem> Items { get; set; }
    }

    public class OrderProcessingSendMailItem
    {
        /// <summary>
        /// To Emails
        /// </summary>
        public string ToEmails { get; set; }

        public string Subject { get; set; }

        public string Content { get; set; }

        public IList<OrderProcessingPdfFileInfo> AttachmentFiles { get; set; }
    }

    /// <summary>
    /// Delete/ Cancel OP, Order, Invoice
    /// </summary>
    public class DeleteCancelDocumentModel
    {
        public Dictionary<string, object> Data { get; set; }
    }

    public partial class OrderProcessingSaveDocumentsLinkModel
    {
        public IList<int> IdRepProcessingTypes { get; set; }
        public int IdOrderProcessing { get; set; }
        public int? IdOffer { get; set; }
        public int? IdOrder { get; set; }
        public int? IdInvoice { get; set; }

        public IList<OrderProcessingPdfFileInfo> AllFileInfos { get; set; }

        public OrderProcessingSaveDocumentsLinkModel()
        {
            IdRepProcessingTypes = new List<int>();
            AllFileInfos = new List<OrderProcessingPdfFileInfo>();
        }
       public class DataCommonDocumentAfterUpdate
        {
            public List<string> idMainDocuments { get; set; }
            public string esIndex { get; set; }
            public Data data { get; set; }
        }
    }
}
