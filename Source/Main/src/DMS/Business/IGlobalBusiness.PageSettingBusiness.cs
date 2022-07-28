using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using Microsoft.AspNetCore.Http;

namespace DMS.Business
{
    public partial class GlobalBusiness : BaseBusiness, IGlobalBusiness
    {
        public async Task<WSReturn> SavePageSetting(PageSettingModel model)
        {
            PageSettingUpdateData data = (PageSettingUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(PageSettingUpdateData));
            data.IdSettingsPage = model.IdSettingsPage;
            data.IdSettingsGUI = model.IdSettingsGUI;
            data.ObjectNr = model.ObjectNr;
            data.PageName = model.PageName;
            data.PageType = model.PageType;
            data.Description = model.Description;
            data.JsonSettings = model.JsonSettings;
            data.IsActive = model.IsActive;
            var result = await _globalService.SavePageSetting(data);
            return result;
        }

        public async Task<PageSettingModel> GetPageSetting(string value, EGetPageSettingType type)
        {
            PageSettingData data = (PageSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(PageSettingData));
            switch(type)
            {
                case EGetPageSettingType.ById:
                    data.SqlFieldName = "IdSettingsPage";
                    break;
                case EGetPageSettingType.ObjectNr:
                    data.SqlFieldName = "ObjectNr";
                    break;
            }
            data.SqlFieldValue = value;
            var result = await _globalService.GetPageSettingById(data);
            return result;
        }
    }
}
