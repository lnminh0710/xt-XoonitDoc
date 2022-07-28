using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Service;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using Newtonsoft.Json;
using DMS.Utils;
using Newtonsoft.Json.Serialization;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class GlobalSettingController : BaseController
    {
        private readonly IGlobalBusiness _iGlobalSettingBusiness;

        public GlobalSettingController(IGlobalBusiness iGlobalSettingBusiness)
        {
            _iGlobalSettingBusiness = iGlobalSettingBusiness;
        }

        // GET: api/globalsetting/GetAllGlobalSettings
        [HttpGet]
        [Route("GetAllGlobalSettings")]
        public async Task<object> GetAllGlobalSettings(string idSettingsGUI)
        {
            var result = await _iGlobalSettingBusiness.GetAllGlobalSettings(idSettingsGUI);
            return result;
        }

        // GET: api/globalsetting/GetGlobalSettingById
        /// <summary>
        /// GetGlobalSettingById
        /// </summary>
        /// <param name="idSettingsGlobal">IdSettingsGlobal</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetGlobalSettingById")]
        public async Task<object> GetGlobalSettingById(int idSettingsGlobal)
        {
            var result = await _iGlobalSettingBusiness.GetGlobalSettingById(idSettingsGlobal);
            return result;
        }
        // GET: api/globalsetting/GetAdvanceSearchProfile
        [HttpGet]
        [Route("GetAdvanceSearchProfile")]
        public async Task<object> GetAdvanceSearchProfile(string moduleId)
        {
            var result = await _iGlobalSettingBusiness.GetAdvanceSearchProfile(moduleId);
            return result;
        }

        // Post: api/globalsetting/DeleteGlobalSettingById
        /// <summary>
        /// DeleteGlobalSettingById
        /// </summary>
        /// <param name="idSettingsGlobal">Id of Settings Global</param>
        /// <returns></returns>
        [HttpPost]
        [Route("DeleteGlobalSettingById")]
        public async Task<object> DeleteGlobalSettingById(int idSettingsGlobal)
        {
            var result = await _iGlobalSettingBusiness.DeleteGlobalSettingById(idSettingsGlobal);
            return result;
        }

        // Post: api/globalsetting/SaveGlobalSettingById
        /// <summary>
        /// SaveGlobalSettingById
        /// </summary>
        /// <param name="globalSettingModel">GlobalSettingModel</param>
        /// <returns></returns>
        [HttpPost]
        [Route("SaveGlobalSetting")]
        public async Task<object> SaveGlobalSetting([FromBody]GlobalSettingModel globalSettingModel)
        {
            var result = await _iGlobalSettingBusiness.SaveGlobalSettingById(globalSettingModel);
            return result;
        }

        // Post: api/globalsetting/SaveTranslateLabelText
        /// <summary>
        /// SaveTranslateLabelText
        /// </summary>
        /// <param name="translationModel">translationModel</param>
        /// <returns></returns>
        [HttpPost]
        [Route("SaveTranslateLabelText")]
        public async Task<object> SaveTranslateLabelText([FromBody]TranslationModel translationModel)
        {
            var result = await _iGlobalSettingBusiness.SaveTranslateLabelText(translationModel);
            return result;
        }

        // GET: api/globalsetting/GetTranslateLabelText
        [HttpGet]
        [Route("GetTranslateLabelText")]
        public async Task<object> GetTranslateLabelText(string originalText, string widgetMainID, string widgetCloneID, string idRepTranslateModuleType, string idTable, string fieldName, string tableName)
        {
            var result = _iGlobalSettingBusiness.GetTranslateLabelText(originalText, widgetMainID, widgetCloneID, idRepTranslateModuleType, idTable, fieldName, tableName);

            return await result;
        }

        [HttpGet]
        [Route("GetTranslateText")]
        public async Task<object> GetTranslateText(string widgetMainID, string widgetCloneID, string fields)
        {
            var result = _iGlobalSettingBusiness.GetTranslateText(widgetMainID, widgetCloneID,fields);
           
            return await result;
        }

        // GET: api/globalsetting/GetCommonTranslateLabelText
        [HttpGet]
        [Route("GetCommonTranslateLabelText")]
        [AllowAnonymous]
        public async Task<object> GetCommonTranslateLabelText()
        {
            string idRepLanguage = HttpContext.Request.Headers["IdRepLanguage"];
            var result = _iGlobalSettingBusiness.GetCommonTranslateLabelText(idRepLanguage);

            return await result;
        }
    }
}
