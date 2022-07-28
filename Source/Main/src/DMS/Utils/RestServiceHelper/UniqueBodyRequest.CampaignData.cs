using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class CampaignData : Data
    {
        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get; set; }

        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public string IdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardTrack
        /// </summary>
        public string IdSalesCampaignWizardTrack { get; set; }

        /// <summary>
        /// IdSalesCampaignWizardItems
        /// </summary>
        public string IdSalesCampaignWizardItems { get; set; }

        /// <summary>
        /// IdSalesCampaignTracks
        /// </summary>
        public string IdSalesCampaignTracks { get; set; }

        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public string IdBusinessCosts { get; set; }

        /// <summary>
        /// IdBusinessCostsItems
        /// </summary>
        public string IdBusinessCostsItems { get; set; }

        /// <summary>
        /// MediaCodeNr
        /// </summary>
        public string MediaCodeNr { get; set; }

        /// <summary>
        /// IdSalesCampaignArticle
        /// </summary>
        public string IdSalesCampaignArticle { get; set; }
    }

    public class CampaignCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class CampaignWizardCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        private string jSONTextCountries = "{}";
        /// <summary>
        /// jSONTextCountries
        /// </summary>
        public string JSONTextCountries { get { return jSONTextCountries; } set { if (!string.IsNullOrEmpty(value)) jSONTextCountries = value; } }
    }

    public class CampaignWizardCountriesT2CreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        private string jSONTextCurrencies = "{}";
        /// <summary>
        /// JSONTextCurrencies
        /// </summary>
        public string JSONTextCurrencies { get { return jSONTextCurrencies; } set { if (!string.IsNullOrEmpty(value)) jSONTextCurrencies = value; } }

        private string jsonTextPayment = "{}";
        /// <summary>
        /// JsonTextPayment
        /// </summary>
        public string JsonTextPayment { get { return jsonTextPayment; } set { if (!string.IsNullOrEmpty(value)) jsonTextPayment = value; } }
    }

    public class CampaignMediaCodeArticleSalesPriceData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class CampaignNumberData : Data
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

    public class CampaignGetData : Data
    {
        /// <summary>
        /// IdRepAppSystemColumnNameTemplate
        /// </summary>
        public int? IdRepAppSystemColumnNameTemplate { get; set; }

        /// <summary>
        /// IdSharingTreeGroups
        /// </summary>
        public int? IdSharingTreeGroups { get; set; }

        /// <summary>
        /// IdSharingTreeGroupsRootname
        /// </summary>
        public int? IdSharingTreeGroupsRootname { get; set; }
    }

    #region SalesCampaignAddOn
    public class CampaignSaveSalesCampaignAddOnData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// ExternalParam
        /// </summary>
        public string ExternalParam { get; set; }
    }
    #endregion
}
