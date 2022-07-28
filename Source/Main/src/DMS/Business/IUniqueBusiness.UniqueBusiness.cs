using DMS.Constants;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Service;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Business
{
    /// <summary>
    /// UniqueBusiness
    /// </summary>
    public class UniqueBusiness : BaseBusiness, IUniqueBusiness
    {
        private readonly IUniqueService _uniqueService;

        public UniqueBusiness(IHttpContextAccessor context, IUniqueService uniqueService) : base(context)
        {
            _uniqueService = uniqueService;
        }

        /// <summary>
        /// GetMainLanguages
        /// </summary>
        /// <returns></returns>
        public async Task<object> GetMainLanguages(bool isMobile)
        {
            var response = await _uniqueService.GetMainLanguages(this.ServiceDataRequest);
            if (!isMobile)
                return response;

            var array = (response as WSDataReturn).Data;
            if (array.Count < 2) return null;

            var data = array[1].ToObject<IEnumerable<LanguageViewModel>>();
            return data;
        }

        /// <summary>
        /// GetAllSearchModules
        /// </summary>
        /// <returns></returns>
        public async Task<IList<GlobalModule>> GetAllSearchModules()
        {
            var results = _uniqueService.GetAllModules(UserFromService);
            var modules = (List<GlobalModule>)(await results);
            IList<GlobalModule> searchResultModules = new List<GlobalModule>();
            // Get Administrator Module
            var adminModule = modules.Where(p => p.IdSettingsGUI == 1).ToList();
            if (adminModule.Count > 0)
            {
                var subAdminModules = modules.Where(p => p.IsCanNew == true && p.IsCanSearch == true && p.IdSettingsGUIParent == 1).ToList();
                adminModule[0].Children = subAdminModules;
                searchResultModules.Add(adminModule[0]);
            }
            var invoiceApprovalModule = modules.Where(p => p.IdSettingsGUI == 100).ToList();
            if (invoiceApprovalModule.Count > 0)
            {
                var subApprovalModules = modules.Where(p => p.IsCanSearch == true && p.IdSettingsGUIParent == 100).ToList();
                subApprovalModules = subApprovalModules.OrderBy(s => s.OrderByNr).ToList();
                invoiceApprovalModule[0].Children = subApprovalModules;
                searchResultModules.Add(invoiceApprovalModule[0]);
            }
            var otherSearchModules = modules.Where(p => p.IsCanSearch == true && p.IdSettingsGUIParent != 100 && p.IdSettingsGUIParent != 1 && p.IdSettingsGUI != 5).ToList();
            if (otherSearchModules.Count > 0)
            {
                searchResultModules = searchResultModules.Concat(otherSearchModules).ToList();
            }
            searchResultModules = searchResultModules.OrderBy(s => s.OrderByNr).ToList();
            return searchResultModules;
        }

        /// <summary>
        /// GetAllGlobalModule
        /// </summary>
        /// <returns></returns>
        public Task<IList<GlobalModule>> GetAllGlobalModule()
        {
            return _uniqueService.GetAllGlobalModule(UserFromService);
        }

        /// <summary>
        /// GetDetailSubModule
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        public async Task<IList<GlobalModule>> GetDetailSubModule(int moduleId)
        {
            IList<GlobalModule> results = new List<GlobalModule>();
            var detailModule = _uniqueService.GetDetailSubModule(moduleId, UserFromService);
            var rs = (List<GlobalModule>)(await detailModule);
            if (rs != null && rs.Count > 0)
            {
                rs.Add(new GlobalModule
                {
                    IdSettingsGUI = moduleId,
                    IdSettingsGUIParent = null
                });
                var trees = rs.BuildTree();
                if (trees != null && trees.Count > 0)
                {
                    results = trees[0].Children;
                    RebuiltDetailSubModule(results);
                }
            }
            return results;
        }

        /// <summary>
        /// GetModuleSetting
        /// </summary>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <returns></returns>
        public async Task<IList<ModuleSettingModel>> GetModuleSetting(string fieldName, string fieldValue)
        {
            ModuleSettingData data = (ModuleSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(ModuleSettingData));
            data.SqlFieldName = fieldName;
            data.SqlFieldValue = fieldValue;
            var result = await _uniqueService.GetModuleSetting(data);
            return result;
        }

        public async Task<IList<TabSummaryModel>> GetTabSummaryInformation(string moduleName, int idObject)
        {
            var data = (TabData)ServiceDataRequest.ConvertToRelatedType(typeof(TabData));
            data.Object = moduleName;
            data.IdObject = idObject;
            var result = await _uniqueService.GetTabSummaryInformation(data);
            if (result == null) return new List<TabSummaryModel>();
            foreach (var item in result)
            {
                var filter = item.TabSummaryData.Where(c => !c.IsFavorited);
                item.TabSummaryMenu = filter.ToList();
                item.TabSummaryData = item.TabSummaryData.Except(filter).ToList();

            }
            return result;
        }

        public async Task<IList<TabSummaryModel>> GetTabByIdDocumentType(int idRepDocumentType, string documentType, int idObject)
        {
            // set default idRepDocumentType is OtherDocument Id
            if (documentType.Contains("Unknow", StringComparison.OrdinalIgnoreCase)
                || documentType.Equals("Unknow", StringComparison.OrdinalIgnoreCase))
            {
                const string contactType = "DocumentType";
                var docTypeListJsonObject = await GetComboBoxInformation(new List<string> { contactType }, null, null, null);

                var docTypeList = JsonConvert.DeserializeObject<RepDocumentTypesModel>(docTypeListJsonObject.ToString());

                var defaulDocType = docTypeList.DocumentType.Count > 0 ? docTypeList.DocumentType.Where(x =>
                x.TextValue.Contains("OtherDocument", StringComparison.OrdinalIgnoreCase)
                || x.TextValue.Equals("OtherDocument", StringComparison.OrdinalIgnoreCase)).FirstOrDefault() : null;

                idRepDocumentType = defaulDocType != null ? Int32.Parse(defaulDocType.IdValue) : 0;
            }

            var data = (TabData)ServiceDataRequest.ConvertToRelatedType(typeof(TabData));
            data.IdObject = idObject;
            data.IdDocumentType = idRepDocumentType;
            var result = await _uniqueService.GetTabByIdDocumentType(data);
            if (result == null) return new List<TabSummaryModel>();
            foreach (var item in result)
            {
                var filter = item.TabSummaryData.Where(c => !c.IsFavorited);
                item.TabSummaryMenu = filter.ToList();
                item.TabSummaryData = item.TabSummaryData.Except(filter).ToList();

            }
            return result;
        }

        public async Task<object> GetCustomerColumnsSetting(string objectName)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            data.Object = objectName;
            //  data.Mode = "GetColumnName";
            return await _uniqueService.GetCustomerColumnsSetting(data);
        }

        public async Task<object> GetComboBoxInformation(IList<string> comboBoxList, string strObject, string mode, string extraData = null)
        {
            var data = ServiceDataRequest;

            // set common combobox has IdApplicationOwner is 1
            foreach (var item in comboBoxList)
            {
                if (!string.IsNullOrWhiteSpace(item) && (item == "CommunicationTypeType" || item == "Currency"))
                {
                    data.IdApplicationOwner = "1";
                }
            }


            if (string.IsNullOrEmpty(strObject) && string.IsNullOrEmpty(mode))
            {
                data.Object = string.Join(",", comboBoxList.Select(c =>
                {
                    int n;
                    if (int.TryParse(c, out n))
                        return string.Format(@"""{0}""", ((EComboBoxType)n).ToString());
                    else
                        return string.Format(@"""{0}""", c);
                }));
            }
            else
            {
                data.Object = string.Format(@"""{0}""", strObject);
                data.Mode = mode;
            }

            var result = await _uniqueService.GetComboBoxInformation(data, extraData);
            return result;
        }

        /// <summary>
        /// Rebuilt
        /// </summary>
        /// <param name="modules"></param>
        private void RebuiltDetailSubModule(IEnumerable<GlobalModule> modules)
        {
            foreach (var result in modules)
            {
                if (!result.Children.Any())
                {
                    if (result.IsCanSearch)
                    {
                        result.Children.Add(new GlobalModule
                        {
                            IdSettingsGUI = -1,
                            ModuleName = result.ModuleName,
                            Path = result.Path,
                            IsCanSearch = true,
                            IdSettingsGUIParent = result.IdSettingsGUI
                        });
                    }
                    if (result.IsCanNew)
                    {
                        result.Children.Add(new GlobalModule
                        {
                            IdSettingsGUI = -1,
                            ModuleName = result.ModuleName,
                            Path = result.Path,
                            IsCanNew = true,
                            IdSettingsGUIParent = result.IdSettingsGUI
                        });
                    }
                }
                else
                {
                    RebuiltDetailSubModule(result.Children);
                }
            }
        }

        /// <summary>
        /// CreateContact
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<WSContactEditReturn> CreateContact(ContactEditModel model)
        {
            ContactCreateData data = (ContactCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(ContactCreateData));
            data = (ContactCreateData)Common.MappModelToData(data, model);
            if (model.Communications != null)
            {
                var communicationsValue = JsonConvert.SerializeObject(model.Communications);
                data.JSONText = string.Format(@"""Communications"":{0}", communicationsValue);
                data.JSONText = "{" + data.JSONText + "}";
            }

            if (model.PersonInterfaceContactCountries != null)
            {
                var countriesValue = JsonConvert.SerializeObject(model.PersonInterfaceContactCountries);
                data.JSONCountryText = string.Format(@"""PersonInterfaceContactCountries"":{0}", countriesValue);
                data.JSONCountryText = "{" + data.JSONCountryText + "}";
            }

            if (model.ContactAddressTypes != null && model.ContactAddressTypes.Count > 0)
            {
                var contactAddressTypes = JsonConvert.SerializeObject(model.ContactAddressTypes);
                data.JSONPersonContactAddressType = string.Format(@"""ContactAddressType"":{0}", contactAddressTypes);
                data.JSONPersonContactAddressType = "{" + data.JSONPersonContactAddressType + "}";
            }

            var result = await _uniqueService.CreateContact(data, model.Communications != null ? model.Communications.Count : 0);
            return result;
        }

        /// <summary>
        /// GetColumnSetting
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        public Task<object> GetColumnSetting(string moduleId, bool isMobileSearch = false)
        {
            return _uniqueService.GetColumnSetting(moduleId, UserFromService, isMobileSearch);
        }

        public async Task<IList<ModuleToPersonTypeModel>> GetModuleToPersonType()
        {
            var result = await _uniqueService.GetModuleToPersonType(ServiceDataRequest);
            return result;
        }

        public async Task<object> GetSettingModule(string objectParam, int? idSettingsModule, string objectNr, string moduleType)
        {
            ModuleSettingData data = (ModuleSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(ModuleSettingData));
            data.Object = objectParam;
            data.IdSettingsModule = idSettingsModule;
            data.ObjectNr = objectNr;
            data.ModuleType = moduleType;
            var result = await _uniqueService.GetSettingModule(data);
            return result;
        }

        public async Task<WSReturn> UpdateSettingsModule(string accesstoken, ModuleSettingModel model)
        {
            var data = new UpdateModuleSettingData
            {
                IdSettingsModule = model.IdSettingsModule,
                IdLogin = model.IdLogin + string.Empty,
                ObjectNr = model.ObjectNr,
                ModuleName = model.ModuleName,
                ModuleType = model.ModuleType,
                Description = model.Description,
                JsonSettings = model.JsonSettings
            };

            return await _uniqueService.UpdateSettingsModule(data);
        }

        /// <summary>
        /// GetDynamicRulesType
        /// </summary>
        /// <returns></returns>
        public Task<object> GetDynamicRulesType()
        {
            return _uniqueService.GetDynamicRulesType(UserFromService);
        }

        #region WidgetApp
        /// <summary>
        /// GetWidgetAppById
        /// </summary>
        /// <param name="idRepWidgetApp"></param>
        /// <returns></returns>
        public async Task<object> GetWidgetAppById(string idRepWidgetApp)
        {
            WidgetAppGetData data = (WidgetAppGetData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetAppGetData));
            data.IdRepWidgetApp = idRepWidgetApp + string.Empty;
            return await _uniqueService.GetWidgetAppById(data);
        }

        public async Task<WSEditReturn> UpdateWidgetApp(UpdateWidgetAppModel model)
        {
            UpdateWidgetAppData data = (UpdateWidgetAppData)ServiceDataRequest.ConvertToRelatedType(typeof(UpdateWidgetAppData));

            data.IdSettingsGUI = model.IdSettingsGUI;
            data.IdRepWidgetApp = model.IdRepWidgetApp;
            data.IdRepWidgetType = model.IdRepWidgetType;
            data.WidgetDataType = model.WidgetDataType;
            data.WidgetTitle = model.WidgetTitle;
            data.IconName = model.IconName;
            data.JsonString = model.JsonString;
            data.UpdateJsonString = model.UpdateJsonString;
            data.IdSettingsModule = model.IdSettingsModule;
            data.ToolbarJson = model.ToolbarJson;
            data.UsedModule = model.UsedModule;

            return await _uniqueService.UpdateWidgetApp(data);
        }
        #endregion
    }
}

