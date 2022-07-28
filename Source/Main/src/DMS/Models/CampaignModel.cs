using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    #region Campaign Model
    /// <summary>
    /// CampaignModel
    /// </summary>
    public class CampaignMediaCodeModel
    {
        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public string IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdSalesCampaignMediaCode
        /// </summary>
        public string IdSalesCampaignMediaCode { get; set; }

        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// MediaCodeLabel
        /// </summary>
        public string MediaCodeLabel { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        public int? Quantity { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public int? IsDeleted { get; set; }
    }

    /// <summary>
    /// CampaignModel
    /// </summary>
    public class CampagneArticleModel
    {
        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int? IdSalesCampaignArticlePrice { get; set; }

        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int? IdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdArticle
        /// </summary>
        public int? IdArticle { get; set; }

        /// <summary>
        /// IdSalesCampaignArticle
        /// </summary>
        public int? IdSalesCampaignArticle { get; set; }

        /// <summary>
        /// SalesCampaignArticle_IsActive
        /// </summary>
        public bool? SalesCampaignArticle_IsActive { get; set; }

        /// <summary>
        /// IdSalesCampaignCountryCurrency
        /// </summary>
        public int? IdSalesCampaignCountryCurrency { get; set; }

        /// <summary>
        /// SalesPrice
        /// </summary>
        public string SalesPrice { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        public int? Quantity { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsGift
        /// </summary>
        public bool? IsGift { get; set; }

        /// <summary>
        /// IsDeleted
        /// value = 0/null => not delete
        /// value = 1 => delete
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// SalesCampaignWizard
    /// </summary>
    public class SalesCampaignWizard
    {
        /// <summary>
        /// IdRepSalesCampaignNamePrefix
        /// </summary>
        public int? IdRepSalesCampaignNamePrefix { get; set; }

        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int? IdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdSharingTreeGroups
        /// </summary>
        public int? IdSharingTreeGroups { get; set; }

        /// <summary>
        /// IdPersonToMandant
        /// </summary>
        public int? IdPersonToMandant { get; set; }

        /// <summary>
        /// IdPersonToServiceProvider
        /// </summary>
        public int? IdPersonToServiceProvider { get; set; }

        /// <summary>
        /// IdPersonToWarehouse
        /// </summary>
        public int? IdPersonToWarehouse { get; set; }

        /// <summary>
        /// IdPersonInterfaceContactAddressGWToShippingAddress
        /// </summary>
        public int? IdPersonInterfaceContactAddressGWToShippingAddress { get; set; }

        /// <summary>
        /// IdPersonInterfaceContactAddressGWToReturnAddress
        /// </summary>
        public int? IdPersonInterfaceContactAddressGWToReturnAddress { get; set; }

        /// <summary>
        /// CampaignNr
        /// </summary>
        public string CampaignNr { get; set; }

        /// <summary>
        /// CampaignNr1
        /// </summary>
        public string CampaignNr1 { get; set; }

        /// <summary>
        /// CampaignNr2
        /// </summary>
        public string CampaignNr2 { get; set; }

        /// <summary>
        /// CampaignNr3
        /// </summary>
        public string CampaignNr3 { get; set; }

        /// <summary>
        /// CampaignName
        /// </summary>
        public string CampaignName { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsMaster
        /// </summary>
        public bool? IsMaster { get; set; }

        /// <summary>
        /// IsInter
        /// </summary>
        public bool? IsInter { get; set; }

        /// <summary>
        /// IsAsile
        /// </summary>
        public bool? IsAsile { get; set; }

        /// <summary>
        /// IsTrack
        /// </summary>
        public bool? IsTrack { get; set; }

        /// <summary>
        /// IsWithCollate
        /// </summary>
        public bool? IsWithCollate { get; set; }

        /// <summary>
        /// IsWithPostageCost
        /// </summary>
        public bool? IsWithPostageCost { get; set; }

        /// <summary>
        /// IsWithSelection
        /// </summary>
        public bool? IsWithSelection { get; set; }

        /// <summary>
        /// IsWithGift
        /// </summary>
        public bool? IsWithGift { get; set; }

        /// <summary>
        /// IsWithTrack
        /// </summary>
        public bool? IsWithTrack { get; set; }

        /// <summary>
        /// IsWithInter
        /// </summary>
        public bool? IsWithInter { get; set; }

        /// <summary>
        /// IsWithAsile
        /// </summary>
        public bool? IsWithAsile { get; set; }

        /// <summary>
        /// IsWithWhitemail
        /// </summary>
        public bool? IsWithWhitemail { get; set; }

        /// <summary>
        /// IsWithCatalog
        /// </summary>
        public bool? IsWithCatalog { get; set; }

        /// <summary>
        /// IsWithBirthday
        /// </summary>
        public bool? IsWithBirthday { get; set; }

        /// <summary>
        /// PostageDate
        /// </summary>
        public string PostageDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// CampagneWizardModel
    /// </summary>
    public class CampaignWizardCountry
    {
        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }
    }

    /// <summary>
    /// CampagneWizardModel
    /// </summary>
    public class CampaignWizardModel
    {
        /// <summary>
        /// SalesCampaignWizard
        /// </summary>
        public IList<SalesCampaignWizard> SalesCampaignWizard { get; set; }

        /// <summary>
        /// CampagneWizardCountries
        /// </summary>
        public IList<CampaignWizardCountry> CampaignWizardCountries { get; set; }
    }
    #endregion

    #region CampaignWizardCountriesT2Model

    /// <summary>
    /// CampaignWizardCountriesT2
    /// </summary>
    public class CampaignWizardCountriesT2
    {
        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int? IdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardOffice
        /// </summary>
        public int? IdSalesCampaignWizardOffice { get; set; }

        /// <summary>
        /// IdPersonToMandant
        /// </summary>
        public int? IdPersonToMandant { get; set; }

        /// <summary>
        /// IdPersonToServiceProvider
        /// </summary>
        public int? IdPersonToServiceProvider { get; set; }

        /// <summary>
        /// IdPersonToWarehouse
        /// </summary>
        public int? IdPersonToWarehouse { get; set; }

        /// <summary>
        /// IdPersonInterfaceContactAddressGWToShippingAddress
        /// </summary>
        public int? IdPersonInterfaceContactAddressGWToShippingAddress { get; set; }

        /// <summary>
        /// IdPersonInterfaceContactAddressGWToReturnAddress
        /// </summary>
        public int? IdPersonInterfaceContactAddressGWToReturnAddress { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// PostageDate
        /// </summary>
        public string PostageDate { get; set; }

        /// <summary>
        /// PrintQty
        /// </summary>
        public int? PrintQty { get; set; }

        /// <summary>
        /// IsWithPlayer
        /// </summary>
        public bool? IsWithPlayer { get; set; }

    }

    /// <summary>
    /// Currency
    /// </summary>
    public class Currency
    {
        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdCountryCurrency
        /// </summary>
        public int? IdCountryCurrency { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItemsCurrency
        /// </summary>
        public int? IdSalesCampaignWizardItemsCurrency { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// Payment
    /// </summary>
    public class Payment
    {
        /// <summary>
        /// IdSalesCampaignWizardItemsPayments
        /// </summary>
        public int? IdSalesCampaignWizardItemsPayments { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// PostageCosts
        /// </summary>
        public float? PostageCosts { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }
    }


    /// <summary>
    /// CampaignWizardCountriesT2Model
    /// </summary>
    public class CampaignWizardCountriesT2Model
    {
        /// <summary>
        /// CampaignWizardCountriesT2s
        /// </summary>
        public IList<CampaignWizardCountriesT2> CampaignWizardCountriesT2s { get; set; }

        /// <summary>
        /// Currencies
        /// </summary>
        public IList<Currency> Currencies { get; set; }

        /// <summary>
        /// Payments
        /// </summary>
        public IList<Payment> Payments { get; set; }
    }
    #endregion

    #region CampaignTracksModel

    /// <summary>
    /// CampaignTracks
    /// </summary>
    public class CampaignTrack
    {
        /// <summary>
        /// IdSalesCampaignTracks
        /// </summary>
        public int? IdSalesCampaignTracks { get; set; }

        /// <summary>
        /// MasterToIdSalesCampaignWizard
        /// </summary>
        public int? MasterToIdSalesCampaignWizard { get; set; }

        /// <summary>
        /// ChainToIdSalesCampaignWizard
        /// </summary>
        public int? ChainToIdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdRepSalesCampaignType
        /// </summary>
        public int? IdRepSalesCampaignType { get; set; }

        /// <summary>
        /// ParentIdSalesCampaignTracks
        /// </summary>
        public int? ParentIdSalesCampaignTracks { get; set; }

        /// <summary>
        /// DaysToWait
        /// </summary>
        public int? DaysToWait { get; set; }

        /// <summary>
        /// Descriptions
        /// </summary>
        public string Descriptions { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// JsonCampagneTracksCountries
        /// </summary>
        public string JsonCampagneTracksCountries { get; set; }
    }

    /// <summary>
    /// CampaignTracksCountries
    /// </summary>
    public class CampaignTrackCountry
    {
        /// <summary>
        /// IdSalesCampaignTracksCountrys
        /// </summary>
        public int? IdSalesCampaignTracksCountrys { get; set; }

        /// <summary>
        /// IdSalesCampaignTracks
        /// </summary>
        public int? IdSalesCampaignTracks { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// DaysToWait
        /// </summary>
        public int? DaysToWait { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }
    }


    /// <summary>
    /// CampaignTracksModel
    /// </summary>
    public class CampaignTracksModel
    {
        /// <summary>
        /// CampaignTracks
        /// </summary>
        public IList<CampaignTrack> CampaignTracks { get; set; }
    }
    #endregion

    #region CampaignCostsModel

    /// <summary>
    /// CampaignCost
    /// </summary>
    public class CampaignCost
    {
        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }

        /// <summary>
        /// IdRepBusinessCosts
        /// </summary>
        public int? IdRepBusinessCosts { get; set; }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public int? IdBusinessCosts { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public int? IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// IdPersonToCompany
        /// </summary>
        public int? IdPersonToCompany { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public int? Amount { get; set; }

        /// <summary>
        /// IdRepVat1
        /// </summary>
        public int? IdRepVat1 { get; set; }

        /// <summary>
        /// VatAmount1
        /// </summary>
        public int? VatAmount1 { get; set; }

        /// <summary>
        /// IdRepVat2
        /// </summary>
        public int? IdRepVat2 { get; set; }

        /// <summary>
        /// VatAmount2
        /// </summary>
        public int? VatAmount2 { get; set; }

        /// <summary>
        /// InvoiceNr
        /// </summary>
        public string InvoiceNr { get; set; }

        /// <summary>
        /// InvoiceDate
        /// </summary>
        public string InvoiceDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// DoneDate
        /// </summary>
        public string DoneDate { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// CampaignCostsModel
    /// </summary>
    public class CampaignCostsModel
    {
        /// <summary>
        /// CampaignCost
        /// </summary>
        public IList<CampaignCost> CampaignCosts { get; set; }
    }

    // <summary>
    /// CampaignCostsGetModel
    /// </summary>
    public class CampaignCostsGetModel
    {
        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public IdPerson IdPerson { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public CreateDate CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public UpdateDate UpdateDate { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public Company Company { get; set; }

        /// <summary>
        /// InvoiceNr
        /// </summary>
        public InvoiceNr InvoiceNr { get; set; }

        /// <summary>
        /// InvoiceDate
        /// </summary>
        public InvoiceDate InvoiceDate { get; set; }

        /// <summary>
        /// CurrencyCode
        /// </summary>
        public CurrencyCode CurrencyCode { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public StreetNr StreetNr { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public Amount Amount { get; set; }

        /// <summary>
        /// IdRepVat1
        /// </summary>
        public IdRepVat1 IdRepVat1 { get; set; }

        /// <summary>
        /// VatAmount1
        /// </summary>
        public VatAmount1 VatAmount1 { get; set; }

        /// <summary>
        /// VatAmount2
        /// </summary>
        public VatAmount2 VatAmount2 { get; set; }

        /// <summary>
        /// IdRepVat2
        /// </summary>
        public IdRepVat2 IdRepVat2 { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public Notes Notes { get; set; }

        /// <summary>
        /// DoneDate
        /// </summary>
        public DoneDate DoneDate { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public IsActive IsActive { get; set; }

        /// <summary>
        /// Status
        /// </summary>
        public Status Status { get; set; }

        /// <summary>
        /// Attachment
        /// </summary>
        public Attachment Attachment { get; set; }

        /// <summary>
        /// IdPersonToPrincipal
        /// </summary>
        public IdPersonToPrincipal IdPersonToPrincipal { get; set; }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public IdBusinessCosts IdBusinessCosts { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public IdRepCurrencyCode IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdRepBusinessCosts
        /// </summary>
        public IdRepBusinessCosts IdRepBusinessCosts { get; set; }
    }
    #endregion

    #region CampaignCostsFilesModel

    /// <summary>
    /// CampaignCost
    /// </summary>
    public class CampaignCostFile
    {
        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }

        /// <summary>
        /// IdBusinessCostsFileAttach
        /// </summary>
        public int? IdBusinessCostsFileAttach { get; set; }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public int? IdBusinessCosts { get; set; }

        /// <summary>
        /// IdSharingTreeMedia
        /// </summary>
        public int? IdSharingTreeMedia { get; set; }

        /// <summary>
        /// IdRepTreeMediaType
        /// </summary>
        public int? IdRepTreeMediaType { get; set; }

        /// <summary>
        /// IdSharingTreeGroups
        /// </summary>
        public int? IdSharingTreeGroups { get; set; }

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
        public bool? IsBlocked { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// CampaignCostsModel
    /// </summary>
    public class CampaignCostFilesModel
    {
        /// <summary>
        /// CampaignCostFiles
        /// </summary>
        public IList<CampaignCostFile> CampaignCostFiles { get; set; }

        /// <summary>
        /// DeleteFiles
        /// </summary>
        public IList<DeleteFileItem> DeleteFiles { get; set; }
    }
    #endregion

    #region CampaignCostsItem

    /// <summary>
    /// CampaignCost
    /// </summary>
    public class CampaignCostItem
    {
        /// <summary>
        /// IdBusinessCostsItems
        /// </summary>
        public int? IdBusinessCostsItems { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public int? IdBusinessCosts { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public int? IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdRepBusinessCostsGroups
        /// </summary>
        public int? IdRepBusinessCostsGroups { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        public int? Quantity { get; set; }

        /// <summary>
        /// CostsPerPiece
        /// </summary>
        public float? CostsPerPiece { get; set; }

        /// <summary>
        /// TotalAomount
        /// </summary>
        public float? TotalAomount { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// JSONBusinessCostsCountries
        /// </summary>
        public string JSONBusinessCostsCountries { get; set; }

        /// <summary>
        /// CampaignCostsItemsCountries
        /// </summary>
        public IList<CampaignCostsItemsCountry> CampaignCostsItemsCountries { get; set; }
    }

    /// <summary>
    /// CampaignCostsItemsCountry
    /// </summary>
    public class CampaignCostsItemsCountry
    {
        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public int? IdCountrylanguage { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public int? IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdBusinessCostsItemsCountries
        /// </summary>
        public int? IdBusinessCostsItemsCountries { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// CampaignCostsModel
    /// </summary>
    public class CampaignCostItemsModel
    {
        /// <summary>
        /// CampaignCostItems
        /// </summary>
        public IList<CampaignCostItem> CampaignCostItems { get; set; }
    }
    #endregion

    #region CampaignMediaCodeArticleSalesPriceModel
    /// <summary>
    /// CampaignMediaCodeArticleSalesPriceModel
    /// </summary>
    public class CampaignMediaCodeArticleSalesPrice
    {
        /// <summary>
        /// IdSalesCampaignMediaCodeSalesPrice
        /// </summary>
        public int? IdSalesCampaignMediaCodeSalesPrice { get; set; }

        /// <summary>
        /// IdSalesCampaignArticle
        /// </summary>
        public int? IdSalesCampaignArticle { get; set; }

        /// <summary>
        /// IdSalesCampaignMediaCode
        /// </summary>
        public int? IdSalesCampaignMediaCode { get; set; }

        /// <summary>
        /// SalesPrice
        /// </summary>
        public decimal? SalesPrice { get; set; }

        /// <summary>
        /// PostageCosts
        /// </summary>
        public decimal? PostageCosts { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// CampaignMediaCodeArticleSalesPriceModel
    /// </summary>
    public class CampaignMediaCodeArticleSalesPriceModel
    {
        /// <summary>
        /// CampaignCostItems
        /// </summary>
        public IList<CampaignMediaCodeArticleSalesPrice> CampaignMediaCodeArticleSalesPrices { get; set; }
    }

    /// <summary>
    /// CampaignNumberModel
    /// </summary>
    public class CampaignNumberModel
    {
        /// <summary>
        /// IdRepSalesCampaignNamePrefix
        /// </summary>
        public string IdRepSalesCampaignNamePrefix { get; set; }
        /// <summary>
        /// CampaignNr1
        /// </summary>
        public string CampaignNr1 { get; set; }
        /// <summary>
        /// CampaignNr2
        /// </summary>
        public string CampaignNr2 { get; set; }
        /// <summary>
        /// CampaignNr3
        /// </summary>
        public string CampaignNr3 { get; set; }
    }

    #endregion

    #region SalesCampaignAddOn
    public class CampaignSaveSalesCampaignAddOnModel
    {
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get; set; }

        /// <summary>
        /// ExternalParam
        /// </summary>
        public string ExternalParam { get; set; }

        /// <summary>
        /// DeleteFiles
        /// </summary>
        public IList<DeleteFileItem> DeleteFiles { get; set; }
    }
    #endregion
}
