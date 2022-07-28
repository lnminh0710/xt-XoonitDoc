using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    /// <summary>
    /// CampaignService
    /// </summary>
    public class CampaignService : BaseUniqueServiceRequest, ICampaignService
    {
        public CampaignService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        public async Task<WSEditReturn> CreateMediaCode(CampaignCreateData data)
        {
            data.MethodName = "SpCallCampaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "Mediacode";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> CreateCampaignArticle(CampaignCreateData data)
        {
            data.MethodName = "SpCallCampaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampagneArticle";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> CreateCampaignWizard(CampaignWizardCreateData data)
        {
            data.MethodName = "SpCallCampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignWizardT1";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignCountry(CampaignData data)
        {
            data.MethodName = "SpAppWg001CampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignWizardT1-CountriesLanguage";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.Country)))[0];
            return response;
        }

        public async Task<WSEditReturn> CreateCampaignWizardCountriesT2(CampaignWizardCountriesT2CreateData data)
        {
            data.MethodName = "SpCallCampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignWizardCountriesT2";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignArticle(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignArticle";
            data.WidgetTitle = "Campaign Article";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetCampaignArticleCountries(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignArticleCountries";
            data.WidgetTitle = "Campaign Article Countries";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<WSEditReturn> SaveCampaignTracks(CampaignCreateData data)
        {
            data.MethodName = "SpCallCampaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampagneTracks";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignTracks(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignTracks";
            data.WidgetTitle = "Campaign Tracks";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetCampaignTracksCountries(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignTracksCountries";
            data.WidgetTitle = "Campaign Tracks Countries";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetCampaignWizardT1(CampaignData data)
        {
            data.MethodName = "SpAppWg001CampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignWizardT1";
            data.WidgetTitle = "Campaign Wizard";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(1, typeof(DynamicCollection));
            var _response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicCoulumnsType)))[1];
            return _response != null ? ((IList<DynamicCollection>)_response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignWizardT2(CampaignData data)
        {
            data.MethodName = "SpAppWg001CampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CampaignWizardT2-Grid";
            data.WidgetTitle = "Campaign Wizard";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public Task<object> SearchMediaCode(CampaignData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg001Campaign", "SearchMediaCode");
        }

        public Task<object> CheckExistingMediaCodeMulti(CampaignData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg001Campaign", "CheckExistingMediaCodeMulti");
        }

        public async Task<object> GetMediaCodeDetail(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "MediaCodeDetail";
            data.WidgetTitle = "MediaCode Detail";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<WSEditReturn> SaveCampaignCosts(CampaignCreateData data)
        {
            data.MethodName = "SpCallBusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessCosts";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignCostsTreeView(CampaignData data)
        {
            data.MethodName = "SpAppWg001BusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessTreeGroups";
            data.WidgetTitle = "Campaign Costs Tree View";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetCampaignCosts(CampaignData data, bool isWrap)
        {
            data.MethodName = "SpAppWg001BusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessCosts";
            data.WidgetTitle = "Campaign Costs Detail";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            if (!isWrap)
            {
                var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
                return response != null ? new WSDataReturn { Data = (JArray)response } : null;
            }
            else
            {
                var expectedReturn = new Dictionary<int, Type>();
                expectedReturn.Add(1, typeof(CampaignCostsGetModel));
                var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType3)))[1];
                return response != null ? ((IList<CampaignCostsGetModel>)response).FirstOrDefault() : null;
            }
        }

        public async Task<object> GetFilesByBusinessCostsId(CampaignData data, bool isUnWrap)
        {
            data.MethodName = "SpAppWg001BusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessTreeGroupsItems";
            data.WidgetTitle = "Campaign Costs Files List";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            if (!isUnWrap)
            {
                var expectedReturn = new Dictionary<int, Type>();
                expectedReturn.Add(1, typeof(DynamicCollection));
                var _response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType4)))[1];
                return _response != null ? ((IList<DynamicCollection>)_response).FirstOrDefault() : null;
            }
            else
            {
                var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
                return response != null ? new WSDataReturn { Data = (JArray)response } : null;
            }
        }

        public async Task<WSEditReturn> SaveFilesByBusinessCostsId(CampaignCreateData data)
        {
            data.MethodName = "SpCallBusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.CrudType = "CREATE";
            data.Object = "BusinessCostsFileAttach";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> SaveFilesByIdSharingTreeGroups(CampaignCreateData data)
        {
            data.CrudType = "CREATE";
            return await SaveData(data, "SpCallFileTemplate", "SaveFileTemplate");
        }

        public async Task<WSEditReturn> SaveCampaignCostsItem(CampaignCreateData data)
        {
            data.MethodName = "SpCallBusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessCostsItems";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCampaignCostsCountries(CampaignData data)
        {
            data.MethodName = "SpCallBusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetDataBusinessItemsCountries";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.Country2)))[0];
            return response;
        }

        public async Task<object> GetCampaignCostsItem(CampaignData data)
        {
            data.MethodName = "SpAppWg001BusinessCosts";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "BusinessCostsItems";
            data.WidgetTitle = "Campaign Costs Item Detail";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> SaveCampaignMediaCodeArticleSalesPrice(CampaignMediaCodeArticleSalesPriceData data)
        {
            data.MethodName = "SpCallCampaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "MediacodeArticleSalesPrice";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> GetCampaignMediaCodeArticleSalesPrice(CampaignData data)
        {
            data.MethodName = "SpAppWg001Campaign";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "MediaCodeArticlePrice";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }

        public async Task<object> CheckCampagneNr(CampaignNumberData data)
        {
            data.MethodName = "SpCallCampaignWizard";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "CheckCampagneNr";

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(
                            data,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                //Formatting = Formatting.Indented,
                                NullValueHandling = NullValueHandling.Ignore
                            })
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response != null ? new WSDataReturn { Data = (JArray)response } : null;
        }
        
        public Task<object> ListDocumentTemplateColumnName(CampaignGetData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWgGetSalesCampaignAddOn", "DocumentTemplateColumnName");
        }
        
        public Task<object> GetDocumentTemplateCountries(CampaignGetData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWgGetSalesCampaignAddOn", "DocumentTemplateCountries");
        }
        
        public Task<object> ListDocumentTemplatesBySharingTreeGroup(CampaignGetData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg001FileTemplate", "ListFileByIdSharingTreeGroups");
        }
        
        public Task<object> ListTreeItemByIdSharingTreeGroupsRootname(CampaignGetData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg001BusinessCosts", "FileTemplateTreeView");
        }

        #region SalesCampaignAddOn
        public async Task<WSEditReturn> SaveSalesCampaignAddOn(CampaignSaveSalesCampaignAddOnData data)
        {
            return await SaveData(data, "SpCallSalesCampaignAddOn", "DocumentTemplate");
        }
        #endregion
        
        public async Task<WSEditReturn> SaveDocumentTemplateSampleDataFile(CampaignSaveSalesCampaignAddOnData data)
        {
            return await SaveData(data, "SpCallSalesCampaignAddOn", "DocumentTemplateSampleDataFile");
        }
        
        public async Task<WSEditReturn> SaveAppSystemColumnNameTemplate(CampaignSaveSalesCampaignAddOnData data)
        {
            return await SaveData(data, "SpCallAppSystemColumnNameTemplate", "");
        }
    }
}
