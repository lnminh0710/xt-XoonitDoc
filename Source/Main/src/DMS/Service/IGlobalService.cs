using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IGlobalService
    {
        #region Global Settings
        /// <summary>
        /// GetAllGlobalSettings
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<GlobalSettingModel>> GetAllGlobalSettings(Data data);

        /// <summary>
        /// GetGlobalSettingById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<GlobalSettingModel> GetGlobalSettingById(GlobalSettingData data);

        /// <summary>
        /// GetAdvanceSearchProfile
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetAdvanceSearchProfile(Data data);


        /// <summary>
        /// SaveGlobalSettingById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> SaveGlobalSettingById(GlobalSettingUpdateData data);

        /// <summary>
        /// DeleteGlobalSettingById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<bool> DeleteGlobalSettingById(GlobalSettingData data);
        #endregion

        #region Page Settings
        /// <summary>
        /// >
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<PageSettingModel> GetPageSettingById(PageSettingData data);


        /// <summary>
        /// SavePageSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> SavePageSetting(PageSettingUpdateData data);
        #endregion

        #region Wdget Template
        /// <summary>
        /// GetAllWidgetTemplateByModuleId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetAllWidgetTemplateByModuleId(Data data);

        /// <summary>
        /// GetWidgetTemplateDetailByRequestString
        /// </summary>
        /// <param name="request"></param>
        /// <param name="idRepWidgetType"></param>
        /// <returns></returns>
        Task<object> GetWidgetTemplateDetailByRequestString(string request, int idRepWidgetType);

        /// <summary>
        /// UpdateWidgetInfo
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<WSDataReturnValue> UpdateWidgetInfo(string request);

        /// <summary>
        /// CreateWidgetSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> CreateWidgetSetting(WidgetSettingData data);

        /// <summary>
        /// UpdateWidgetSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> UpdateWidgetSetting(WidgetSettingData data);

        /// <summary>
        /// DeleteWidgetSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> DeleteWidgetSetting(WidgetSettingData data);

        /// <summary>
        /// LoadWidgetSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSDataReturn> LoadWidgetSetting(WidgetSettingLoadData data);

        /// <summary>
        /// LoadWidgetSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSDataReturn> LoadWidgetOrderBy(WidgetOrderByData data);

        /// <summary>
        /// SaveWidgetOrderBy
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWidgetOrderBy(WidgetOrderByData data);
        #endregion

        #region Translation
        /// <summary>
        /// GetTranslateLabelText
        /// </summary>
        /// <returns></returns>
        Task<WSDataReturn> GetTranslateLabelText(TranslateLabelGetData data);

        /// <summary>
        /// GetTranslateLabelText
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveTranslateLabelText(TranslateLabelSaveData data);

        /// <summary>
        /// GetTranslateText
        /// </summary>
        /// <returns></returns>
        Task<WSDataReturn> GetTranslateText(TranslateTextGetData data);

        /// <summary>
        /// GetCommonTranslateLabelText
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCommonTranslateLabelText(TranslateLabelGetData data);

        #endregion
    }    
}

