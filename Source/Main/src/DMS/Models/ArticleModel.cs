using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    #region Article Model
    /// <summary>
    /// ArticleModel
    /// </summary>
    public class ArticleModel
    {
        /// <summary>
        /// Unique identifier for this article.
        /// </summary>
        public IdArticle IdArticle { get; set; }

        /// <summary>
        /// IdRepArticleStatus
        /// </summary>
        public IdRepArticleStatus IdRepArticleStatus { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public UpdateDate UpdateDate { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public CreateDate CreateDate { get; set; }

        /// <summary>
        /// ArticleNr
        /// </summary>
        public ArticleNr ArticleNr { get; set; }

        /// <summary>
        /// ArticleManufacturersNr
        /// </summary>
        public ArticleManufacturersNr ArticleManufacturersNr { get; set; }

        /// <summary>
        /// ArticleNameShort
        /// </summary>
        public ArticleNameShort ArticleNameShort { get; set; }

        /// <summary>
        /// DefaultValue
        /// </summary>
        public DefaultValue DefaultValue { get; set; }

        /// <summary>
        /// ArticleDescriptionShort
        /// </summary>
        public ArticleDescriptionShort ArticleDescriptionShort { get; set; }

        public ArticleDescriptionLong ArticleDescriptionLong { get; set; }
        
        /// <summary>
        /// IsWarehouseControl
        /// </summary>
        public IsWarehouseControl IsWarehouseControl { get; set; }

        /// <summary>
        /// IsSetArticle
        /// </summary>
        public IsSetArticle IsSetArticle { get; set; }

        /// <summary>
        /// IsVirtual
        /// </summary>
        public IsVirtual IsVirtual { get; set; }

        /// <summary>
        /// IsPrintProduct
        /// </summary>
        public IsPrintProduct IsPrintProduct { get; set; }

        /// <summary>
        /// IsService
        /// </summary>
        public IsService IsService { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public Notes Notes { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public IdRepIsoCountryCode IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdArticleDescription
        /// </summary>
        public IdArticleDescription IdArticleDescription { get; set; }

        /// <summary>
        /// IdArticleName
        /// </summary>
        public IdArticleName IdArticleName { get; set; }
    }
    #endregion

    #region Edit Model
    /// <summary>
    /// Article business object
    /// </summary>
    public class Article
    {
        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get; set; }

        /// <summary>
        /// IdRepArticleStatus
        /// </summary>
        public string IdRepArticleStatus { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        /// <summary>
        /// ArticleManufacturersNr
        /// </summary>
        public string ArticleManufacturersNr { get; set; }

        /// <summary>
        /// IsSetArticle
        /// </summary>
        public bool IsSetArticle { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// IsWarehouseControl
        /// </summary>
        public bool IsWarehouseControl { get; set; }

        /// <summary>
        /// IsVirtual
        /// </summary>
        public bool IsVirtual { get; set; }

        /// <summary>
        /// IsPrintProduct
        /// </summary>
        public bool IsPrintProduct { get; set; }

        /// <summary>
        /// IsService
        /// </summary>
        public bool IsService { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// ArticleName
    /// </summary>
    public class ArticleName
    {
        /// <summary>
        /// IdArticleName
        /// </summary>
        public string IdArticleName { get; set; }

        /// <summary>
        /// ArticleNameShort
        /// </summary>
        public string ArticleNameShort { get; set; }

        /// <summary>
        /// ArticleNameLong
        /// </summary>
        public string ArticleNameLong { get; set; }

        /// <summary>
        /// IsAdditionalName
        /// </summary>
        public bool IsAdditionalName { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        ///// <summary>
        ///// Notes
        ///// </summary>
        //public bool Notes { get; set; }
    }

    /// <summary>
    /// ArticleDescription
    /// </summary>
    public class ArticleDescription
    {
        /// <summary>
        /// IdArticleDescription
        /// </summary>
        public string IdArticleDescription { get; set; }

        /// <summary>
        /// ArticleDescriptionShort
        /// </summary>
        public string ArticleDescriptionShort { get; set; }

        /// <summary>
        /// ArticleDescriptionLong
        /// </summary>
        public string ArticleDescriptionLong { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }
    }

    /// <summary>
    /// ArticleGroupsMedia
    /// </summary>
    public class ArticleGroupsMedia
    {
        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get; set; }

        /// <summary>
        /// IdSharingTreeMedia
        /// </summary>
        public string IdSharingTreeMedia { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IdArticleGroupsMedia
        /// </summary>
        public string IdArticleGroupsMedia { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// SharingTreeMedia
    /// </summary>
    public class SharingTreeMedia
    {
        /// <summary>
        /// IdRepTreeMediaType
        /// </summary>
        public string IdRepTreeMediaType { get; set; }

        /// <summary>
        /// IdSharingTreeGroups
        /// </summary>
        public string IdSharingTreeGroups { get; set; }

        /// <summary>
        /// MediaRelativePath
        /// </summary>
        public string MediaRelativePath { get; set; }

        /// <summary>
        /// MediaName
        /// </summary>
        public string MediaName { get; set; }

        /// <summary>
        /// MediaOriginalName
        /// </summary>
        public string MediaOriginalName { get; set; }

        /// <summary>
        /// MediaNotes
        /// </summary>
        public string MediaNotes { get; set; }

        /// <summary>
        /// MediaTitle
        /// </summary>
        public string MediaTitle { get; set; }

        /// <summary>
        /// MediaDescription
        /// </summary>
        public string MediaDescription { get; set; }

        /// <summary>
        /// MediaSize
        /// </summary>
        public string MediaSize { get; set; }

        /// <summary>
        /// MediaHight
        /// </summary>
        public string MediaHight { get; set; }

        /// <summary>
        /// MediaWidth
        /// </summary>
        public string MediaWidth { get; set; }

        /// <summary>
        /// MediaPassword
        /// </summary>
        public string MediaPassword { get; set; }

        /// <summary>
        /// IsBlocked
        /// </summary>
        public string IsBlocked { get; set; }

        /// <summary>
        /// IdSharingTreeMedia
        /// </summary>
        public string IdSharingTreeMedia { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// ArticleEditModel
    /// </summary>
    public class ArticleEditModel
    {
        /// <summary>
        /// ArticleDescription
        /// </summary>
        public ArticleDescription ArticleDescription { get; set; }

        /// <summary>
        /// ArticleName
        /// </summary>
        public ArticleName ArticleName { get; set; }

        /// <summary>
        /// Article
        /// </summary>
        public Article Article { get; set; }
    }

    /// <summary>
    /// ArticleSetCompositionEditModel
    /// </summary>
    public class ArticleSetCompositionEditModel
    {
        /// <summary>
        /// IdArticleMaster
        /// </summary>
        public string IdArticleMaster { get; set; }

        /// <summary>
        /// IdArticleItems
        /// </summary>
        public string IdArticleItems { get; set; }

        /// <summary>
        /// QuantityItems
        /// </summary>
        public string QuantityItems { get; set; }

        /// <summary>
        /// IdArticleSet
        /// </summary>
        public string IdArticleSet { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// ArticlePurchasingEditModel
    /// </summary>
    public class ArticlePurchasingEditModel
    {
        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdRepVat
        /// </summary>
        public string IdRepVat { get; set; }

        /// <summary>
        /// Price
        /// </summary>
        public string Price { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool? IsDeleted { get; set; }
    }

    /// <summary>
    /// ArticleEditModel
    /// </summary>
    public class ArticleMediaEditModel
    {
        /// <summary>
        /// ArticleGroupsMedia
        /// </summary>
        public ArticleGroupsMedia ArticleGroupsMedia { get; set; }

        /// <summary>
        /// SharingTreeMedia
        /// </summary>
        public SharingTreeMedia SharingTreeMedia { get; set; }
    }

    #endregion

    #region Return And Refund
    public class ReturnRefundSaveModel
    {
        /// <summary>
        /// IdRepSalesOrderReturnReason
        /// </summary>
        public string IdRepSalesOrderReturnReason { get; set; }

        /// <summary>
        /// IdSalesOrderInvoice
        /// </summary>
        public string IdSalesOrderInvoice { get; set; }

        /// <summary>
        /// IdSalesOrderReturn
        /// </summary>
        public string IdSalesOrderReturn { get; set; }

        /// <summary>
        /// IsNewInvoice
        /// </summary>
        public int? IsNewInvoice { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public int? IsActive { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsAutoSave
        /// </summary>
        public int? IsAutoSave { get; set; }

        /// <summary>
        /// IsAutoBroken
        /// </summary>
        public int? IsAutoBroken { get; set; }

        /// <summary>
        /// ReturnAndRefundOrderPayments
        /// </summary>
        public IList<ReturnAndRefundOrderPayment> ReturnAndRefundOrderPayments { get; set; }

        /// <summary>
        /// OrderReturnArticles
        /// </summary>
        public IList<OrderReturnArticle> OrderReturnArticles { get; set; }
    }

    public class ReturnAndRefundOrderPayment
    {
        /// <summary>
        /// IdSalesOrderReturnReimbursement
        /// </summary>
        public string IdSalesOrderReturnReimbursement { get; set; }

        /// <summary>
        /// IdSalesOrderReturn
        /// </summary>
        public string IdSalesOrderReturn { get; set; }

        /// <summary>
        /// IdRepPaymentsMethods
        /// </summary>
        public string IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// IdSharingPaymentGateway
        /// </summary>
        public string IdSharingPaymentGateway { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdSharingCreditCard
        /// </summary>
        public string IdSharingCreditCard { get; set; }

        /// <summary>
        /// IdRepCreditCardType
        /// </summary>
        public string IdRepCreditCardType { get; set; }

        /// <summary>
        /// CreditCardHolderName
        /// </summary>
        public string CreditCardHolderName { get; set; }

        /// <summary>
        /// CreditCardNr
        /// </summary>
        public string CreditCardNr { get; set; }

        /// <summary>
        /// CreditCardValidMonth
        /// </summary>
        public int? CreditCardValidMonth { get; set; }

        /// <summary>
        /// CreditCardValidYear
        /// </summary>
        public int? CreditCardValidYear { get; set; }

        /// <summary>
        /// CreditCardCVV
        /// </summary>
        public int? CreditCardCVV { get; set; }

        /// <summary>
        /// IdSharingPaymentCheque
        /// </summary>
        public string IdSharingPaymentCheque { get; set; }

        /// <summary>
        /// ChequeCodeline
        /// </summary>
        public string ChequeCodeline { get; set; }

        /// <summary>
        /// ChequeNr
        /// </summary>
        public string ChequeNr { get; set; }

        /// <summary>
        /// ChequeType
        /// </summary>
        public string ChequeType { get; set; }

        /// <summary>
        /// ChequeCreditedDate
        /// </summary>
        public string ChequeCreditedDate { get; set; }

        /// <summary>
        /// ChequeRejectDate
        /// </summary>
        public string ChequeRejectDate { get; set; }
    }

    public class OrderReturnArticle
    {
        /// <summary>
        /// IdSalesOrderReturnArticle
        /// </summary>
        public string IdSalesOrderReturnArticle { get; set; }

        /// <summary>
        /// IdSalesOrderReturn
        /// </summary>
        public string IdSalesOrderReturn { get; set; }

        /// <summary>
        /// IdSalesOrderArticles
        /// </summary>
        public string IdSalesOrderArticles { get; set; }

        /// <summary>
        /// ControlAmount
        /// </summary>
        public int? ControlAmount { get; set; }

        /// <summary>
        /// QtyBackToWarehouse
        /// </summary>
        public int? QtyBackToWarehouse { get; set; }

        /// <summary>
        /// QtyDefect
        /// </summary>
        public int? QtyDefect { get; set; }

        /// <summary>
        /// QtyKeep
        /// </summary>
        public int? QtyKeep { get; set; }

        /// <summary>
        /// IsSetArticle
        /// </summary>
        public int? IsSetArticle { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public int? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public int? IsDeleted { get; set; }
    }
    #endregion

    #region Block Orders
    public class BlockOrdersModel
    {
        /// <summary>
        /// IdTextTemplate
        /// </summary>
        public int? IdTextTemplate { get; set; }

        /// <summary>
        /// IdRepSalesOrderStatus
        /// </summary>
        public int? IdRepSalesOrderStatus { get; set; }

        /// <summary>
        /// IdRepTextTemplateType
        /// </summary>
        public int? IdRepTextTemplateType { get; set; }

        /// <summary>
        /// TemplateText
        /// </summary>
        public string TemplateText { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// MarkAsActive
        /// </summary>
        public bool? MarkAsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public int? IsDeleted { get; set; }
    }
    #endregion

    #region Stock Corrections
    public class StockCorrectionModel
    {
        /// <summary>
        /// ArticleNr
        /// </summary>
        public int? ArticleNr { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// StockCorrections
        /// </summary>
        public IList<StockCorrection> StockCorrections { get; set; }
    }

    public class StockCorrection
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// IdWarehouseArticlePosted
        /// </summary>
        public int? IdWarehouseArticlePosted { get; set; }

        /// <summary>
        /// IdRepWarehouseCorrection
        /// </summary>
        public int? IdRepWarehouseCorrection { get; set; }

        /// <summary>
        /// IdArticle
        /// </summary>
        public int? IdArticle { get; set; }

        /// <summary>
        /// AddOnStock
        /// </summary>
        public int? AddOnStock { get; set; }

        /// <summary>
        /// LessOnStock
        /// </summary>
        public int? LessOnStock { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        public Nullable<decimal> Price { get; set; }
        public int? IdRepVat { get; set; }
        public int? IdRepCurrencyCode { get; set; }

        public string ArticleNr { get; set; }
    }
    #endregion

    /// <summary>
    /// ArticleMediaZipInfo
    /// Used for Zip Images of Article
    /// </summary>
    public class ArticleMediaZipInfo
    {
        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        /// <summary>
        /// FileName
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// OriginalName
        /// </summary>
        public string OriginalName { get; set; }

        /// <summary>
        /// FileSize
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// FilePath
        /// </summary>
        public string FilePath { get; set; }
    }
}
