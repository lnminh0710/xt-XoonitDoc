using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IGlobalBusiness : IBaseBusiness
    {
        /// <summary>
        /// GetAllGlobalSettings
        /// </summary>
        /// <returns></returns>
        Task<IList<GlobalSettingModel>> GetAllGlobalSettings(string idSettingsGUI);

        /// <summary>
        /// GetGlobalSettingById
        /// </summary>
        /// <param name="idSettingsGloba"></param>
        /// <returns></returns>
        Task<GlobalSettingModel> GetGlobalSettingById(int? idSettingsGloba);

        /// <summary>
        /// GetAdvanceSearchProfile
        /// </summary>
        /// <returns></returns>
        Task<object> GetAdvanceSearchProfile(string moduleId);

        /// <summary>
        /// SaveGlobalSettingById
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSReturn> SaveGlobalSettingById(GlobalSettingModel model);

        /// <summary>
        /// DeleteGlobalSettingById
        /// </summary>
        /// <param name="idSettingsGlobal"></param>
        /// <returns></returns>
        Task<bool> DeleteGlobalSettingById(int idSettingsGlobal);

        #region Widget Template
        /// <summary>
        /// GetAllWidgetTemplateByModuleId
        /// </summary>
        /// <param name="moduleId"></param>
        /// <param name="objectValue"></param>
        /// <returns></returns>
        Task<object> GetAllWidgetTemplateByModuleId(string moduleId, string objectValue);

        /// <summary>
        /// GetWidgetTemplateDetailByRequestString
        /// </summary>
        /// <param name="request"></param>
        /// <param name="idRepWidgetType"></param>
        /// <param name="widgetGuid"></param>
        /// <param name="moduleName"></param>
        /// <param name="filterParam"></param>
        /// <returns></returns>
        Task<object> GetWidgetTemplateDetailByRequestString(string request, int idRepWidgetType, string widgetGuid, string moduleName, string filterParam, string idLanguage, string widgetTitle, int? idRepWidgetApp, int? setOrderBy);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="dataUpdate"></param>
        /// <returns></returns>
        Task<WSDataReturnValue> UpdateWidgetInfo(DataUpdateModel dataUpdate);

        /// <summary>
        /// CreateWidgetSetting
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSReturn> CreateWidgetSetting(WidgetSettingModel model);

        /// <summary>
        /// UpdateWidgetSetting
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSReturn> UpdateWidgetSetting(WidgetSettingModel model);

        /// <summary>
        /// DeleteWidgetSetting
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSReturn> DeleteWidgetSetting(WidgetSettingModel model);

        /// <summary>
        /// LoadWidgetSetting
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSDataReturn> LoadWidgetSetting(WidgetSettingModel model);

        /// <summary>
        /// LoadWidgetOrderBy
        /// </summary>
        /// <param name="widgetType"></param>
        /// <param name="widgetGuid"></param>
        /// <returns></returns>
        Task<WSDataReturn> LoadWidgetOrderBy(string widgetApp, string widgetGuid);

        /// <summary>
        /// SaveWidgetOrderBy
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWidgetOrderBy(WidgetOrderByModel model);
        #endregion

        #region Translation
        /// <summary>
        /// GetTranslateLabelText
        /// </summary>
        /// <returns></returns>
        Task<WSDataReturn> GetTranslateLabelText(string originalText, string widgetMainID, string widgetCloneID, string idRepTranslateModuleType, string idTable, string fieldName, string tableName);

        /// <summary>
        /// GetTranslateLabelText
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveTranslateLabelText(TranslationModel data);

        /// <summary>
        /// GetTranslateText
        /// </summary>
        /// <returns></returns>
        Task<WSDataReturn> GetTranslateText(string widgetMainID, string widgetCloneID, string fields);

        /// <summary>
        /// GetCommonTranslateLabelText
        /// </summary>
        /// <returns></returns>
        Task<object> GetCommonTranslateLabelText(string idRepLanguage);


        #endregion


        #region Page Setting
        /// <summary>
        /// GetPageSetting
        /// </summary>
        /// <param name="value"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        Task<PageSettingModel> GetPageSetting(string value, EGetPageSettingType type);


        /// <summary>
        /// SavePageSetting
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSReturn> SavePageSetting(PageSettingModel model);
        #endregion
    }
}

