using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface ICampaignService
    {

        /// <summary>
        /// CreateMediaCode
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateMediaCode(CampaignCreateData data);

        /// <summary>
        /// CreateCampaignArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignArticle(CampaignCreateData data);

        /// <summary>
        /// GetCampaignArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignArticle(CampaignData data);

        /// <summary>
        /// GetCampaignArticleCountries
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignArticleCountries(CampaignData data);

        /// <summary>
        /// CreateCampagnWizard
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignWizard(CampaignWizardCreateData data);

        /// <summary>
        /// GetCampaignWizardT1
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignWizardT1(CampaignData data);

        /// <summary>
        /// GetCampaignWizardT2
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignWizardT2(CampaignData data);

        /// <summary>
        /// SearchMediaCode
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> SearchMediaCode(CampaignData data);

        /// <summary>
        /// GetMediaCodeDetail
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetMediaCodeDetail(CampaignData data);

        /// <summary>
        /// CheckExistingMediaCodeMulti
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> CheckExistingMediaCodeMulti(CampaignData data);

        /// <summary>
        /// GetCampaignCountry
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignCountry(CampaignData data);

        /// <summary>
        /// CreateCampaignWizardCountriesT2
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCampaignWizardCountriesT2(CampaignWizardCountriesT2CreateData data);

        /// <summary>
        /// SaveCampaignTracks
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignTracks(CampaignCreateData data);

        /// <summary>
        /// GetCampaignTracks
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignTracks(CampaignData data);

        /// <summary>
        /// GetCampaignTracksCountries
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignTracksCountries(CampaignData data);

        /// <summary>
        /// SaveCampaignCost
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignCosts(CampaignCreateData data);

        /// <summary>
        /// SaveCampaignCostsItem
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveCampaignCostsItem(CampaignCreateData data);

        /// <summary>
        /// GetCampaignCostsTreeView
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsTreeView(CampaignData data);

        /// <summary>
        /// GetCampaignCosts
        /// </summary>
        /// <param name="data"></param>
        /// <param name="isWrap"></param>
        /// <returns></returns>
        Task<object> GetCampaignCosts(CampaignData data, bool isWrap);

        /// <summary>
        /// GetCampaignCostsItem
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsItem(CampaignData data);

        /// <summary>
        /// GetFilesByBusinessCostsId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetFilesByBusinessCostsId(CampaignData data, bool isUnWrap);

        /// <summary>
        /// SaveFilesByBusinessCostsId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveFilesByBusinessCostsId(CampaignCreateData data);

        /// <summary>
        /// SaveFilesByIdSharingTreeGroups
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveFilesByIdSharingTreeGroups(CampaignCreateData data);

        /// <summary>
        /// GetCampaignCostsCountries
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignCostsCountries(CampaignData data);

        /// <summary>
        /// GetCampaignMediaCodeArticleSalesPrice
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCampaignMediaCodeArticleSalesPrice(CampaignData data);

        /// <summary>
        /// SaveCampaignMediaCodeArticleSalesPrice
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> SaveCampaignMediaCodeArticleSalesPrice(CampaignMediaCodeArticleSalesPriceData data);

        /// <summary>
        /// CheckCampagneNr
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> CheckCampagneNr(CampaignNumberData data);

        /// <summary>
        /// ListDocumentTemplateColumnName
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> ListDocumentTemplateColumnName(CampaignGetData data);

        /// <summary>
        /// GetDocumentTemplateCountries
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetDocumentTemplateCountries(CampaignGetData data);

        /// <summary>
        /// ListDocumentTemplatesBySharingTreeGroup
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> ListDocumentTemplatesBySharingTreeGroup(CampaignGetData data);

        /// <summary>
        /// ListTreeItemByIdSharingTreeGroupsRootname
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> ListTreeItemByIdSharingTreeGroupsRootname(CampaignGetData data);

        /// <summary>
        /// SaveSalesCampaignAddOn
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveSalesCampaignAddOn(CampaignSaveSalesCampaignAddOnData data);

        /// <summary>
        /// SaveDocumentTemplateSampleDataFile
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveDocumentTemplateSampleDataFile(CampaignSaveSalesCampaignAddOnData data);

        /// <summary>
        /// SaveAppSystemColumnNameTemplate
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveAppSystemColumnNameTemplate(CampaignSaveSalesCampaignAddOnData data);
    }    
}

