using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface ICampaignBusiness
    {
        /// <summary>
        /// CreateMediaCode
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateMediaCode(IList<CampaignMediaCodeModel> model);

        /// <summary>
        /// CreateCampagnArticle
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignArticle(IList<CampagneArticleModel> model);

        /// <summary>
        /// GetCampaignArticle
        /// </summary>
        /// <param name="idSalesCampaign"></param>
        /// <returns></returns>
        Task<object> GetCampaignArticle(int idSalesCampaign);

        /// <summary>
        /// GetCampaignArticleCountries
        /// </summary>
        /// <param name="idArticle"></param>
        /// <returns></returns>
        Task<object> GetCampaignArticleCountries(int idArticle, int? idSalesCampaignWizard);

        /// <summary>
        /// CreateCampagnWizard
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignWizard(CampaignWizardModel model);

        /// <summary>
        /// GetCampaignWizardT1
        /// </summary>
        /// <param name="idSalesCampaignWizard"></param>
        /// <returns></returns>
        Task<object> GetCampaignWizardT1(int idSalesCampaignWizard);

        /// <summary>
        /// GetCampaignWizardT2
        /// </summary>
        /// <param name="idSalesCampaignWizard"></param>
        /// <returns></returns>
        Task<object> GetCampaignWizardT2(int? idSalesCampaignWizard, string idLanguage);

        /// <summary>
        /// SearchMediaCode
        /// </summary>
        /// <param name="SearchMediaCode"></param>
        /// <returns></returns>
        Task<object> SearchMediaCode(string mediaCodeNr);

        /// <summary>
        /// GetMediaCodeDetail
        /// </summary>
        /// <param name="idSalesCampaignWizardItems"></param>
        /// <returns></returns>
        Task<object> GetMediaCodeDetail(int? idSalesCampaignWizardItems);

        /// <summary>
        /// CheckExistingMediaCodeMulti
        /// </summary>
        /// <param name="mediaCodeNrs"></param>
        /// <returns></returns>
        Task<object> CheckExistingMediaCodeMulti(string mediaCodeNrs);

        /// <summary>
        /// GetCampagnCountry
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> GetCampaignCountry(int? idSalesCampaignWizard);

        /// <summary>
        /// CreateCampaignWizardCountriesT2
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignWizardCountriesT2(CampaignWizardCountriesT2Model model);

        /// <summary>
        /// GetCampaignTracksCountries
        /// </summary>
        /// <param name="idSalesCampaignTracks"></param>
        /// <param name="idSalesCampaignWizard"></param>
        /// <param name="idSalesCampaignWizardTrack"></param>
        /// <returns></returns>
        Task<object> GetCampaignTracksCountries(int idSalesCampaignTracks, int idSalesCampaignWizard, int idSalesCampaignWizardTrack);

        /// <summary>
        /// GetCampaignTracks
        /// </summary>
        /// <param name="idSalesCampaignWizard"></param>
        /// <returns></returns>
        Task<object> GetCampaignTracks(int idSalesCampaignWizard);

        /// <summary>
        /// SaveCampaignTracks
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignTracks(CampaignTracksModel model);

        /// <summary>
        /// SaveCampaignCosts
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignCosts(CampaignCostsModel model);

        /// <summary>
        /// SaveCampaignCostsItem
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignCostsItem(CampaignCostItemsModel model);

        /// <summary>
        /// GetCampaignCostsTreeView
        /// </summary>
        /// <param name="idBusinessCosts"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsTreeView(int idBusinessCosts);

        /// <summary>
        /// GetCampaignCosts
        /// </summary>
        /// <param name="idBusinessCosts"></param>
        /// <param name="isWrap"></param>
        /// <returns></returns>
        Task<object> GetCampaignCosts(int idBusinessCosts, bool isWrap);

        /// <summary>
        /// GetCampaignCostsItem
        /// </summary>
        /// <param name="idBusinessCosts"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsItem(int idBusinessCosts);

        /// <summary>
        /// GetFilesByBusinessCostsId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetFilesByBusinessCostsId(int idBusinessCosts, bool isUnWrap);


        /// <summary>
        /// SaveFilesByBusinessCostsId
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveFilesByBusinessCostsId(CampaignCostFilesModel model);
        
        /// <summary>
        /// SaveFilesByIdSharingTreeGroups
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveFilesByIdSharingTreeGroups(CampaignCostFilesModel model);

        /// <summary>
        /// GetCampaignCostsCountries
        /// </summary>
        /// <param name="idBusinessCostsItems"></param>
        /// <param name="idSalesCampaignWizard"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsCountries(int idBusinessCostsItems, int idSalesCampaignWizard);

        /// <summary>
        /// GetCampaignMediaCodeArticleSalesPrice
        /// </summary>
        /// <param name="idBusinessCostsItems"></param>
        /// <param name="idSalesCampaignWizard"></param>
        /// <param name="idSalesCampaignArticle"></param>
        /// <returns></returns>
        Task<object> GetCampaignMediaCodeArticleSalesPrice(int idCountrylanguage, int idSalesCampaignWizard, int idSalesCampaignArticle);

        /// <summary>
        /// SaveCampaignMediaCodeArticleSalesPrice
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveCampaignMediaCodeArticleSalesPrice(CampaignMediaCodeArticleSalesPriceModel model);

        /// <summary>
        /// CheckCampagneNr
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> CheckCampagneNr(CampaignNumberModel model);

        /// <summary>
        /// ListDocumentTemplateColumnName
        /// </summary>
        /// <param name="idRepAppSystemColumnNameTemplate"></param>
        /// <returns></returns>
        Task<object> ListDocumentTemplateColumnName(int idRepAppSystemColumnNameTemplate);

        /// <summary>
        /// GetDocumentTemplateCountries
        /// </summary>
        /// <param name="idRepAppSystemColumnNameTemplate"></param>
        /// <returns></returns>
        Task<object> GetDocumentTemplateCountries(int idRepAppSystemColumnNameTemplate);

        /// <summary>
        /// ListDocumentTemplatesBySharingTreeGroup
        /// </summary>
        /// <param name="idSharingTreeGroups"></param>
        /// <returns></returns>
        Task<object> ListDocumentTemplatesBySharingTreeGroup(int? idSharingTreeGroups);

        /// <summary>
        /// ListTreeItemByIdSharingTreeGroupsRootname
        /// </summary>
        /// <param name="idSharingTreeGroupsRootname"></param>
        /// <returns></returns>
        Task<object> ListTreeItemByIdSharingTreeGroupsRootname(int? idSharingTreeGroupsRootname);

        /// <summary>
        /// Save SalesCampaignAddOn
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveSalesCampaignAddOn(CampaignSaveSalesCampaignAddOnModel model);

        /// <summary>
        /// SaveDocumentTemplateSampleDataFile
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveDocumentTemplateSampleDataFile(CampaignSaveSalesCampaignAddOnModel model);

        /// <summary>
        /// SaveAppSystemColumnNameTemplate
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveAppSystemColumnNameTemplate(CampaignSaveSalesCampaignAddOnModel model);
    }
}

