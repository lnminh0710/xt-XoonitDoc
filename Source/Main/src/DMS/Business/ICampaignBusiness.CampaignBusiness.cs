using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using System.Reflection;
using Newtonsoft.Json;
using DMS.Utils.ElasticSearch;
using System.Linq;

namespace DMS.Business
{
    public class CampaignBusiness : BaseBusiness, ICampaignBusiness
    {
        private IPathProvider _pathProvider;
        private readonly ICampaignService _campaignService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;

        public CampaignBusiness(IHttpContextAccessor context, ICampaignService campaignService, IElasticSearchSyncBusiness elasticSearchSyncBusiness, IPathProvider pathProvider) : base(context)
        {
            _pathProvider = pathProvider;
            _campaignService = campaignService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
        }

        public async Task<WSEditReturn> CreateMediaCode(IList<CampaignMediaCodeModel> model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""Mediacode"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";
            var result = await _campaignService.CreateMediaCode(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    ModuleType = ModuleType.Campaign_MediaCode,
                    KeyId = result.ReturnID
                });
            }

            return result;
        }

        public async Task<WSEditReturn> CreateCampaignArticle(IList<CampagneArticleModel> model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""CampagneArticle"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";
            var result = await _campaignService.CreateCampaignArticle(data);

            return result;
        }

        public async Task<WSEditReturn> CreateCampaignWizard(CampaignWizardModel model)
        {
            CampaignWizardCreateData data = (CampaignWizardCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignWizardCreateData));
            var modelValue = JsonConvert.SerializeObject(model.SalesCampaignWizard, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""SalesCampaignWizard"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";

            modelValue = JsonConvert.SerializeObject(model.CampaignWizardCountries, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONTextCountries = string.Format(@"""Countries"":{0}", modelValue);
            data.JSONTextCountries = "{" + data.JSONTextCountries + "}";

            var result = await _campaignService.CreateCampaignWizard(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    ModuleType = ModuleType.Campaign,
                    KeyId = result.ReturnID
                });
            }

            return result;
        }

        public async Task<object> GetCampaignCountry(int? idSalesCampaignWizard)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            if (idSalesCampaignWizard != null)
                data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignCountry(data);
            return result;
        }

        public async Task<WSEditReturn> CreateCampaignWizardCountriesT2(CampaignWizardCountriesT2Model model)
        {
            CampaignWizardCountriesT2CreateData data = (CampaignWizardCountriesT2CreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignWizardCountriesT2CreateData));
            var modelValue = JsonConvert.SerializeObject(model.CampaignWizardCountriesT2s, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""CampaignWizardCountriesT2"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";

            modelValue = JsonConvert.SerializeObject(model.Currencies, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONTextCurrencies = string.Format(@"""Currencies"":{0}", modelValue);
            data.JSONTextCurrencies = "{" + data.JSONTextCurrencies + "}";

            modelValue = JsonConvert.SerializeObject(model.Payments, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JsonTextPayment = string.Format(@"""Payment"":{0}", modelValue);
            data.JsonTextPayment = "{" + data.JsonTextPayment + "}";

            var result = await _campaignService.CreateCampaignWizardCountriesT2(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                if (model != null &&
                    model.CampaignWizardCountriesT2s != null &&
                    model.CampaignWizardCountriesT2s.Any())
                {
                    var idSalesCampaignWizard = model.CampaignWizardCountriesT2s[0].IdSalesCampaignWizard + string.Empty;

                    await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                    {
                        ModuleType = ModuleType.Campaign,
                        KeyId = idSalesCampaignWizard
                    });
                }
            }

            return result;
        }

        public async Task<object> GetCampaignArticle(int idSalesCampaign)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdSalesCampaignWizard = idSalesCampaign.ToString();
            var result = await _campaignService.GetCampaignArticle(data);
            return result;
        }

        public async Task<object> GetCampaignArticleCountries(int idArticle, int? idSalesCampaignWizard)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdArticle = idArticle.ToString();
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignArticleCountries(data);
            return result;
        }

        public async Task<object> GetCampaignTracksCountries(int idSalesCampaignTracks, int idSalesCampaignWizard, int idSalesCampaignWizardTrack)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdSalesCampaignTracks = idSalesCampaignTracks.ToString();
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            data.IdSalesCampaignWizardTrack = idSalesCampaignWizardTrack.ToString();
            var result = await _campaignService.GetCampaignTracksCountries(data);
            return result;
        }

        public async Task<object> GetCampaignTracks(int idSalesCampaignWizard)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignTracks(data);
            return result;
        }

        public async Task<WSEditReturn> SaveCampaignTracks(CampaignTracksModel model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            string modelValue = string.Empty;
            modelValue = JsonConvert.SerializeObject(model.CampaignTracks, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""CampagneTracks"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";
            var result = await _campaignService.SaveCampaignTracks(data);
            return result;
        }

        public async Task<object> GetCampaignWizardT1(int idSalesCampaignWizard)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignWizardT1(data);
            return result;
        }

        public async Task<object> GetCampaignWizardT2(int? idSalesCampaignWizard, string idLanguage)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            if (!string.IsNullOrWhiteSpace(idLanguage))
            {
                data.LoginLanguage = idLanguage;
            }
            if (idSalesCampaignWizard != null)
                data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignWizardT2(data);
            return result;
        }

        public async Task<object> SearchMediaCode(string mediaCodeNr)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.MediaCodeNr = mediaCodeNr;
            var result = await _campaignService.SearchMediaCode(data);
            return result;
        }

        public async Task<object> GetMediaCodeDetail(int? idSalesCampaignWizardItems)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            if (idSalesCampaignWizardItems != null)
                data.IdSalesCampaignWizardItems = idSalesCampaignWizardItems.ToString();
            var result = await _campaignService.GetMediaCodeDetail(data);
            return result;
        }

        public async Task<object> CheckExistingMediaCodeMulti(string mediaCodeNrs)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.MediaCodeNr = mediaCodeNrs;
            var result = await _campaignService.CheckExistingMediaCodeMulti(data);
            return result;
        }

        public async Task<WSEditReturn> SaveCampaignCosts(CampaignCostsModel model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            if (model.CampaignCosts != null && model.CampaignCosts.Count > 0)
            {
                foreach (var item in model.CampaignCosts)
                {
                    item.IdLogin = data.IdLogin;
                }
                string modelValue = JsonConvert.SerializeObject(model.CampaignCosts);
                data.JSONText = string.Format(@"""BusinessCosts"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _campaignService.SaveCampaignCosts(data);

                // Sync to elastic search
                if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
                {
                    await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                    {
                        ModuleType = ModuleType.CampagneCosts,
                        KeyId = result.ReturnID
                    });
                }

                return result;
            }
            return new WSEditReturn();
        }

        public async Task<object> GetCampaignCostsTreeView(int idBusinessCosts)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdBusinessCosts = idBusinessCosts.ToString();
            var result = await _campaignService.GetCampaignCostsTreeView(data);
            return result;
        }

        public async Task<object> GetCampaignCosts(int idBusinessCosts, bool isWrap)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdBusinessCosts = idBusinessCosts.ToString();
            var result = await _campaignService.GetCampaignCosts(data, isWrap);
            return result;
        }

        public async Task<object> GetFilesByBusinessCostsId(int idBusinessCosts, bool isUnWrap)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdBusinessCosts = idBusinessCosts.ToString();
            var result = await _campaignService.GetFilesByBusinessCostsId(data, isUnWrap);
            return result;
        }

        public async Task<object> SaveFilesByBusinessCostsId(CampaignCostFilesModel model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            if (model.CampaignCostFiles != null && model.CampaignCostFiles.Count > 0)
            {
                string modelValue = JsonConvert.SerializeObject(model.CampaignCostFiles, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""BusinessCostsFileAttach"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _campaignService.SaveFilesByBusinessCostsId(data);

                if (result.IsSuccess && !string.IsNullOrEmpty(result.ReturnID))
                {
                    //This code will run async without affect the main thread
                    await _pathProvider.DeleteFiles(model.DeleteFiles).ConfigureAwait(false);
                }

                return result;
            }
            return new WSEditReturn();
        }

        public async Task<object> SaveFilesByIdSharingTreeGroups(CampaignCostFilesModel model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            if (model.CampaignCostFiles != null && model.CampaignCostFiles.Count > 0)
            {
                string modelValue = JsonConvert.SerializeObject(model.CampaignCostFiles, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""BusinessCostsFileAttach"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _campaignService.SaveFilesByIdSharingTreeGroups(data);

                if (result.IsSuccess && !string.IsNullOrEmpty(result.ReturnID))
                {
                    //This code will run async without affect the main thread
                    await _pathProvider.DeleteFiles(model.DeleteFiles).ConfigureAwait(false);
                }

                return result;
            }
            return new WSEditReturn();
        }

        public async Task<WSEditReturn> SaveCampaignCostsItem(CampaignCostItemsModel model)
        {
            CampaignCreateData data = (CampaignCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignCreateData));
            string modelValue = string.Empty;
            if (model.CampaignCostItems != null && model.CampaignCostItems.Count > 0)
            {
                foreach (var item in model.CampaignCostItems)
                {
                    item.IdLogin = data.IdLogin;
                    if (item.CampaignCostsItemsCountries != null && item.CampaignCostsItemsCountries.Count > 0)
                    {
                        modelValue = JsonConvert.SerializeObject(item.CampaignCostsItemsCountries, new JsonSerializerSettings
                        {
                            NullValueHandling = NullValueHandling.Ignore
                        });
                        item.JSONBusinessCostsCountries = string.Format(@"""BusinessCostsItemsCountries"":{0}", modelValue);
                        item.JSONBusinessCostsCountries = "{" + item.JSONBusinessCostsCountries + "}";
                        item.CampaignCostsItemsCountries = null;
                    }
                }
                modelValue = JsonConvert.SerializeObject(model.CampaignCostItems, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""BusinessCostsItems"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
            }
            var result = await _campaignService.SaveCampaignCostsItem(data);
            return result;
        }

        public async Task<object> GetCampaignCostsCountries(int idBusinessCostsItems, int idSalesCampaignWizard)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdBusinessCostsItems = idBusinessCostsItems.ToString();
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            var result = await _campaignService.GetCampaignCostsCountries(data);
            return result;
        }

        public async Task<object> GetCampaignCostsItem(int idBusinessCosts)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdBusinessCosts = idBusinessCosts.ToString();
            var result = await _campaignService.GetCampaignCostsItem(data);
            return result;
        }

        public async Task<object> SaveCampaignMediaCodeArticleSalesPrice(CampaignMediaCodeArticleSalesPriceModel model)
        {
            CampaignMediaCodeArticleSalesPriceData data =
                (CampaignMediaCodeArticleSalesPriceData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignMediaCodeArticleSalesPriceData));
            if (model.CampaignMediaCodeArticleSalesPrices != null && model.CampaignMediaCodeArticleSalesPrices.Count > 0)
            {
                string modelValue = JsonConvert.SerializeObject(model.CampaignMediaCodeArticleSalesPrices, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""MediacodeArticleSalesPrice"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _campaignService.SaveCampaignMediaCodeArticleSalesPrice(data);
                return result;
            }
            return new WSEditReturn();
        }

        public async Task<object> GetCampaignMediaCodeArticleSalesPrice(int idCountrylanguage, int idSalesCampaignWizard, int idSalesCampaignArticle)
        {
            CampaignData data = (CampaignData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignData));
            data.IdCountrylanguage = idCountrylanguage.ToString();
            data.IdSalesCampaignWizard = idSalesCampaignWizard.ToString();
            data.IdSalesCampaignArticle = idSalesCampaignArticle.ToString();
            var result = await _campaignService.GetCampaignMediaCodeArticleSalesPrice(data);
            return result;
        }

        public async Task<object> CheckCampagneNr(CampaignNumberModel model)
        {
            CampaignNumberData data = (CampaignNumberData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignNumberData));
            data.IdRepSalesCampaignNamePrefix = model.IdRepSalesCampaignNamePrefix;
            data.CampaignNr1 = model.CampaignNr1;
            data.CampaignNr2 = model.CampaignNr2;
            data.CampaignNr3 = model.CampaignNr3;
            return await _campaignService.CheckCampagneNr(data);
        }

        public async Task<object> ListDocumentTemplateColumnName(int idRepAppSystemColumnNameTemplate)
        {
            CampaignGetData data = (CampaignGetData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignGetData));
            data.IdRepAppSystemColumnNameTemplate = idRepAppSystemColumnNameTemplate;
            return await _campaignService.ListDocumentTemplateColumnName(data);
        }

        public async Task<object> GetDocumentTemplateCountries(int idRepAppSystemColumnNameTemplate)
        {
            CampaignGetData data = (CampaignGetData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignGetData));
            data.IdRepAppSystemColumnNameTemplate = idRepAppSystemColumnNameTemplate;
            return await _campaignService.GetDocumentTemplateCountries(data);
        }

        public async Task<object> ListDocumentTemplatesBySharingTreeGroup(int? idSharingTreeGroups)
        {
            CampaignGetData data = (CampaignGetData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignGetData));
            if (idSharingTreeGroups != null)
            {
                data.IdSharingTreeGroups = idSharingTreeGroups;
            }
            return await _campaignService.ListDocumentTemplatesBySharingTreeGroup(data);
        }

        public async Task<object> ListTreeItemByIdSharingTreeGroupsRootname(int? idSharingTreeGroupsRootname)
        {
            CampaignGetData data = (CampaignGetData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignGetData));
            if (idSharingTreeGroupsRootname != null)
            {
                data.IdSharingTreeGroupsRootname = idSharingTreeGroupsRootname;
            }
            return await _campaignService.ListTreeItemByIdSharingTreeGroupsRootname(data);
        }

        public async Task<WSEditReturn> SaveSalesCampaignAddOn(CampaignSaveSalesCampaignAddOnModel model)
        {
            var data = (CampaignSaveSalesCampaignAddOnData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignSaveSalesCampaignAddOnData));
            data.ExternalParam = model.ExternalParam;
            if (!string.IsNullOrEmpty(model.JSONText))
            {
                data.JSONText = model.JSONText;
                var result = await _campaignService.SaveSalesCampaignAddOn(data);

                if (result.IsSuccess && !string.IsNullOrEmpty(result.ReturnID))
                {
                    //This code will run async without affect the main thread
                    await _pathProvider.DeleteFiles(model.DeleteFiles).ConfigureAwait(false);
                }

                return result;
            }
            return new WSEditReturn();
        }

        public async Task<WSEditReturn> SaveDocumentTemplateSampleDataFile(CampaignSaveSalesCampaignAddOnModel model)
        {
            var data = (CampaignSaveSalesCampaignAddOnData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignSaveSalesCampaignAddOnData));
            if (!string.IsNullOrEmpty(model.JSONText))
            {
                data.JSONText = model.JSONText;
                var result = await _campaignService.SaveDocumentTemplateSampleDataFile(data);
                return result;
            }
            return new WSEditReturn();
        }

        public async Task<WSEditReturn> SaveAppSystemColumnNameTemplate(CampaignSaveSalesCampaignAddOnModel model)
        {
            var data = (CampaignSaveSalesCampaignAddOnData)ServiceDataRequest.ConvertToRelatedType(typeof(CampaignSaveSalesCampaignAddOnData));
            if (!string.IsNullOrEmpty(model.JSONText))
            {
                data.JSONText = model.JSONText;
                var result = await _campaignService.SaveAppSystemColumnNameTemplate(data);
                return result;
            }
            return new WSEditReturn();
        }
    }
}
