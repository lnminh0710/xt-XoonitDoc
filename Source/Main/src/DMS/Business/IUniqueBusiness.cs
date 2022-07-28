using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    /// <summary>
    /// IUniqueBusiness
    /// </summary>
    public interface IUniqueBusiness
    {
        /// <summary>
        /// GetMainLanguages
        /// </summary>
        /// <returns></returns>
        Task<object> GetMainLanguages(bool isMobile);

        /// <summary>
        /// GetColumnSetting
        /// </summary>
        /// <param name="moduleId"></param>
        /// <param name="isMobileSearch"></param>
        /// <returns></returns>
        Task<object> GetColumnSetting(string moduleId, bool isMobileSearch = false);

        /// <summary>
        /// GetAllSearchModules
        /// </summary>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetAllSearchModules();

        /// <summary>
        /// GetAllGlobalModule
        /// </summary>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetAllGlobalModule();

        /// <summary>
        /// GetDetailSubModule
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetDetailSubModule(int moduleId);

        /// <summary>
        /// GetModuleSetting
        /// </summary>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <returns></returns>
        Task<IList<ModuleSettingModel>> GetModuleSetting(string fieldName, string fieldValue);

        /// <summary>
        /// GetSettingModule
        /// </summary>
        /// <param name="objectParam"></param>
        /// <param name="idSettingsModule"></param>
        /// <param name="objectNr"></param>
        /// <param name="moduleType"></param>
        /// <returns></returns>
        Task<object> GetSettingModule(string objectParam, int? idSettingsModule, string objectNr, string moduleType);

        /// <summary>
        /// GetModuleToPersonType
        /// </summary>
        /// <returns></returns>
        Task<IList<ModuleToPersonTypeModel>> GetModuleToPersonType();

        /// <summary>
        /// GetTabSummaryInformation
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        Task<IList<TabSummaryModel>> GetTabSummaryInformation(string moduleName, int idObject);

        /// <summary>
        /// GetTabWithDocumentType
        /// </summary>
        /// <param name="documentType"></param>
        /// <returns></returns>
        Task<IList<TabSummaryModel>> GetTabByIdDocumentType(int idRepDocumentType, string documentType, int idObject);

        /// <summary>
        /// GetCustomerColumnsSetting
        /// </summary>
        /// <param name="objectName"></param>
        /// <returns></returns>
        Task<object> GetCustomerColumnsSetting(string objectName);

        /// <summary>
        /// GetComboBoxInformation
        /// </summary>
        /// <param name="comboBoxList"></param>
        /// <param name="strObject"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        Task<object> GetComboBoxInformation(IList<string> comboBoxList, string strObject, string mode, string extraData = null);

        /// <summary>
        /// CreateContact
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSContactEditReturn> CreateContact(ContactEditModel model);

        /// <summary>
        /// UpdateSettingsModule
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> UpdateSettingsModule(string accesstoken, ModuleSettingModel model);

        /// <summary>
        /// GetDynamicRulesType
        /// </summary>
        /// <returns></returns>
        Task<object> GetDynamicRulesType();

        /// <summary>
        /// GetWidgetAppById
        /// </summary>
        /// <param name="idRepWidgetApp"></param>
        /// <returns></returns>
        Task<object> GetWidgetAppById(string idRepWidgetApp);

        /// <summary>
        /// UpdateWidgetApp
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateWidgetApp(UpdateWidgetAppModel model);
    }
}

