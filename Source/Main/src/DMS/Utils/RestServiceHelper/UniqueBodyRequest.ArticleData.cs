using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class ArticleData : Data
    {
        private string idArticle = string.Empty;
        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get { return idArticle; } set { if (value != "0") idArticle = value; } }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }
    }

    public class ArticleCheckData : Data
    {
        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        /// <summary>
        /// CurrentArticleNr
        /// </summary>
        public string CurrentArticleNr { get; set; }

        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

    }

    /// <summary>
    /// ArticleMediaZipData
    /// </summary>
    public class ArticleMediaZipData : Data
    {
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get; set; }
    }

    public class ArticleCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// B00Article_IdRepArticleStatus
        /// </summary>
        public string B00Article_IdRepArticleStatus { get; set; }

        /// <summary>
        /// B00Article_IdSharingTreeGroups
        /// </summary>
        public string B00Article_IdSharingTreeGroups { get; set; }

        /// <summary>
        /// B00Article_IdArticleSuitable
        /// </summary>
        public string B00Article_IdArticleSuitable { get; set; }

        /// <summary>
        /// B00Article_IdRepIsoCountryCode
        /// </summary>
        public string B00Article_IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// B00Article_ArticleNr
        /// </summary>
        public string B00Article_ArticleNr { get; set; }

        /// <summary>
        /// B00Article_ArticleManufacturersNr
        /// </summary>
        public string B00Article_ArticleManufacturersNr { get; set; }

        /// <summary>
        /// B00Article_IsSetArticle
        /// </summary>
        public string B00Article_IsSetArticle { get; set; }

        /// <summary>
        /// B00Article_IsWarehouseControl
        /// </summary>
        public string B00Article_IsWarehouseControl { get; set; }

        /// <summary>
        /// B00Article_IsVirtual
        /// </summary>
        public string B00Article_IsVirtual { get; set; }

        /// <summary>
        /// B00Article_IsPrintProduct
        /// </summary>
        public string B00Article_IsPrintProduct { get; set; }

        /// <summary>
        /// B00Article_IsService
        /// </summary>
        public string B00Article_IsService { get; set; }

        /// <summary>
        /// B00Article_Notes
        /// </summary>
        public string B00Article_Notes { get; set; }

        /// <summary>
        /// B00Article_IsActive
        /// </summary>
        public string B00Article_IsActive { get; set; }

        /// <summary>
        /// B00ArticleName_ArticleNameShort
        /// </summary>
        public string B00ArticleName_ArticleNameShort { get; set; }

        /// <summary>
        /// B00ArticleName_ArticleNameLong
        /// </summary>
        public string B00ArticleName_ArticleNameLong { get; set; }

        /// <summary>
        /// B00ArticleName_Notes
        /// </summary>
        public string B00ArticleName_Notes { get; set; }

        /// <summary>
        /// B00ArticleName_IsAdditionalName
        /// </summary>
        public string B00ArticleName_IsAdditionalName { get; set; }

        /// <summary>
        /// B00ArticleName_IsActive
        /// </summary>
        public string B00ArticleName_IsActive { get; set; }

        /// <summary>
        /// B00ArticleDescription_ArticleDescriptionShort
        /// </summary>
        public string B00ArticleDescription_ArticleDescriptionShort { get; set; }

        /// <summary>
        /// B00ArticleDescription_ArticleDescriptionLong
        /// </summary>
        public string B00ArticleDescription_ArticleDescriptionLong { get; set; }

        /// <summary>
        /// B00ArticleDescription_IsActive
        /// </summary>
        public string B00ArticleDescription_IsActive { get; set; }
    }


    public class ArticleUpdateData : ArticleCreateData
    {
        /// <summary>
        /// B00Article_IdArticle
        /// </summary>
        public string B00Article_IdArticle { get; set; }

        /// <summary>
        /// B00ArticleDescription_IdArticleDescription
        /// </summary>
        public string B00ArticleDescription_IdArticleDescription { get; set; }

        /// <summary>
        /// B00ArticleName_IdArticleName
        /// </summary>
        public string B00ArticleName_IdArticleName { get; set; }

    }    

    public class ArticleSetCompositionEditData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

    }

    public class ArticleMediaCreateData : Data
    {

        /// <summary>
        /// B00ArticleGroupsMedia_IdArticle
        /// </summary>
        public string B00ArticleGroupsMedia_IdArticle { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IdSharingTreeMedia
        /// </summary>
        public string B00ArticleGroupsMedia_IdSharingTreeMedia { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IsActive
        /// </summary>
        public string B00ArticleGroupsMedia_IsActive { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IdRepTreeMediaType
        /// </summary>
        public string B00SharingTreeMedia_IdRepTreeMediaType { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IdSharingTreeGroups
        /// </summary>
        public string B00SharingTreeMedia_IdSharingTreeGroups { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaRelativePath
        /// </summary>
        public string B00SharingTreeMedia_MediaRelativePath { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaName
        /// </summary>
        public string B00SharingTreeMedia_MediaName { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaOriginalName
        /// </summary>
        public string B00SharingTreeMedia_MediaOriginalName { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaNotes
        /// </summary>
        public string B00SharingTreeMedia_MediaNotes { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaTitle
        /// </summary>
        public string B00SharingTreeMedia_MediaTitle { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaDescription
        /// </summary>
        public string B00SharingTreeMedia_MediaDescription { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaSize
        /// </summary>
        public string B00SharingTreeMedia_MediaSize { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaHight
        /// </summary>
        public string B00SharingTreeMedia_MediaHight { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaWidth
        /// </summary>
        public string B00SharingTreeMedia_MediaWidth { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaPassword
        /// </summary>
        public string B00SharingTreeMedia_MediaPassword { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IsBlocked
        /// </summary>
        public string B00SharingTreeMedia_IsBlocked { get; set; }

    }

    public class ArticleMediaUpdateData : Data
    {

        /// <summary>
        /// B00ArticleGroupsMedia_IdArticleGroupsMedia
        /// </summary>
        public string B00ArticleGroupsMedia_IdArticleGroupsMedia { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IsDeleted
        /// </summary>
        public string B00ArticleGroupsMedia_IsDeleted { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IdSharingTreeMedia
        /// </summary>
        public string B00SharingTreeMedia_IdSharingTreeMedia { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IsDeleted
        /// </summary>
        public string B00SharingTreeMedia_IsDeleted { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IdArticle
        /// </summary>
        public string B00ArticleGroupsMedia_IdArticle { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IdSharingTreeMedia
        /// </summary>
        public string B00ArticleGroupsMedia_IdSharingTreeMedia { get; set; }

        /// <summary>
        /// B00ArticleGroupsMedia_IsActive
        /// </summary>
        public string B00ArticleGroupsMedia_IsActive { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IdRepTreeMediaType
        /// </summary>
        public string B00SharingTreeMedia_IdRepTreeMediaType { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IdSharingTreeGroups
        /// </summary>
        public string B00SharingTreeMedia_IdSharingTreeGroups { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaRelativePath
        /// </summary>
        public string B00SharingTreeMedia_MediaRelativePath { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaName
        /// </summary>
        public string B00SharingTreeMedia_MediaName { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaOriginalName
        /// </summary>
        public string B00SharingTreeMedia_MediaOriginalName { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaNotes
        /// </summary>
        public string B00SharingTreeMedia_MediaNotes { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaTitle
        /// </summary>
        public string B00SharingTreeMedia_MediaTitle { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaDescription
        /// </summary>
        public string B00SharingTreeMedia_MediaDescription { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaSize
        /// </summary>
        public string B00SharingTreeMedia_MediaSize { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaHight
        /// </summary>
        public string B00SharingTreeMedia_MediaHight { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaWidth
        /// </summary>
        public string B00SharingTreeMedia_MediaWidth { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_MediaPassword
        /// </summary>
        public string B00SharingTreeMedia_MediaPassword { get; set; }

        /// <summary>
        /// B00SharingTreeMedia_IsBlocked
        /// </summary>
        public string B00SharingTreeMedia_IsBlocked { get; set; }

    }

    #region Return And Refund
    public class ReturnRefundData : Data
    {
        /// <summary>
        /// InvoiceNr
        /// </summary>
        public string InvoiceNr { get; set; }
        /// <summary>
        /// PersonNr
        /// </summary>
        public string PersonNr { get; set; }
        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }

        /// <summary>
        /// IdSalesOrder
        /// </summary>
        public string IdSalesOrder { get; set; }
    }

    public class ReturnRefundSaveData : Data
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
        /// JSONOrderReturnArticles
        /// </summary>
        public string JSONOrderReturnArticles { get; set; }

        /// <summary>
        /// JSONOrderPayments
        /// </summary>
        public string JSONOrderPayments { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }
    }
    #endregion

    #region Block Orders
    public class BlockOrdersData : Data
    {
        /// <summary>
        /// IdRepSalesOrderStatus
        /// </summary>
        public int? IdRepSalesOrderStatus { get; set; }

        /// <summary>
        /// IdTextTemplate
        /// </summary>
        public int? IdTextTemplate { get; set; }

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
        /// IsActive
        /// </summary>
        public int? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public int? IsDeleted { get; set; }

    }
    #endregion

    #region StockCorrection
    public class StockCorrectionData : Data
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        public long? WarehouseId { get; set; }

        /// <summary>
        /// JSONStockCorrection
        /// </summary>
        public string JSONStockCorrection { get; set; }

    }
    #endregion
}
