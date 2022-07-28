using Newtonsoft.Json;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public partial class GlobalBusiness : BaseBusiness, IGlobalBusiness
    {
        public async Task<object> GetAllWidgetTemplateByModuleId(string moduleId, string objectValue)
        {
            ServiceDataRequest.IdSettingsGUI = moduleId;
            if (!string.IsNullOrEmpty(objectValue) && objectValue.Trim().Length > 0)
                ServiceDataRequest.Object = objectValue;
            var result = await _globalService.GetAllWidgetTemplateByModuleId(ServiceDataRequest);
            return result;
        }

        public async Task<object> GetWidgetTemplateDetailByRequestString(string request, int idRepWidgetType, string widgetGuid, string moduleName, string filterParam, string idLanguage, string widgetTitle, int? idRepWidgetApp, int? setOrderBy)
        {
            string loginInfo = CreateLoginInfoString(idLanguage);
            string widgetInfo = string.Empty;
            if (idRepWidgetApp != null && !string.IsNullOrEmpty(widgetGuid))
                widgetInfo = string.Format(@",\""WidgetMainID\"":\""{0}\"",\""WidgetCloneID\"":\""{1}\""", idRepWidgetApp, widgetGuid);
            if (setOrderBy != null)
                widgetInfo = widgetInfo + string.Format(@",\""SetOrderBy\"":\""{0}\""", setOrderBy);
            if (widgetTitle != null)
                widgetInfo = widgetInfo + string.Format(@",\""WidgetTitle\"":\""{0}\""", widgetTitle);
            // string filter = string.Format(@"\""{0}\"":\""{1}\""", filterKey, filterParam);            
            if (string.IsNullOrEmpty(filterParam) && !string.IsNullOrWhiteSpace(widgetInfo))
            {
                // remove first comma when filteParam is null
                widgetInfo = widgetInfo.Substring(1);
            }
            else
            {
                widgetInfo = filterParam + widgetInfo;
            }
            request = request.Replace(ConstWidgetReplaceToken.LoginInfoToken, loginInfo).Replace(ConstWidgetReplaceToken.FilterToken, widgetInfo);            

            var result = await _globalService.GetWidgetTemplateDetailByRequestString(request, idRepWidgetType);
            if (result != null)
            {
                switch (idRepWidgetType)
                {
                    case (int)EIdRepWidgetType.DataSet:
                    case (int)EIdRepWidgetType.DataGrid:
                    case (int)EIdRepWidgetType.TableWithFilter:
                    case (int)EIdRepWidgetType.EditableTable:
                        return (WSDataReturn)result;
                }
            }
            return result;
        }

        public async Task<WSDataReturnValue> UpdateWidgetInfo(DataUpdateModel dataUpdate)
        {
            string loginInfo = CreateLoginInfoString();

            if (dataUpdate.UsingReplaceString)
            {
                #region Use 'replace string'
                dataUpdate.Data = dataUpdate.Data.Replace(@"""", @"\""");
                if (dataUpdate.Data.Contains(@"\\\\"""))
                {
                    dataUpdate.Data = dataUpdate.Data.Replace(@"\\\\""", @"\\\\\""");
                }
                else if (Regex.IsMatch(dataUpdate.Data, @"([a-z|A-Z|0-9|\s+]\\{2}"")"))
                {
                    Regex rgx = new Regex(@"([a-z|A-Z|0-9|\s+]\\{2}"")");
                    dataUpdate.Data = rgx.Replace(dataUpdate.Data, @"\\\""");
                }

                if (dataUpdate.Data.IndexOf("{") == 0 && dataUpdate.Data.LastIndexOf("}") == dataUpdate.Data.Length - 1)
                {
                    dataUpdate.Data = dataUpdate.Data.Substring(1);
                    dataUpdate.Data = dataUpdate.Data.Substring(0, dataUpdate.Data.Length - 1);
                }
                //    if (dataUpdate.Data[0] == '{' && dataUpdate.Data[dataUpdate.Data.Length - 1] == '}')
                //    {
                //        dataUpdate.Data = dataUpdate.Data.Substring(1, dataUpdate.Data.Length - 2);
                //    }
                #endregion
            }

            string request = dataUpdate.Request.Replace(ConstWidgetReplaceToken.LoginInfoToken, loginInfo)
                                               .Replace(ConstWidgetReplaceToken.FilterToken, dataUpdate.Data)
                                               .Replace(ConstWidgetReplaceToken.ModeToken, !string.IsNullOrEmpty(dataUpdate.Mode) ? dataUpdate.Mode : null);

            var result = await _globalService.UpdateWidgetInfo(request);

            // Check to sync to elastic search.
            if (result.IsSuccess && dataUpdate.Module != null)
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    GlobalModule = dataUpdate.Module,
                    KeyId = dataUpdate.UpdateKey
                });
            }
            return result;
        }

        public async Task<WSDataReturn> LoadWidgetSetting(WidgetSettingModel model)
        {
            WidgetSettingLoadData data = (WidgetSettingLoadData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetSettingLoadData));
            data = (WidgetSettingLoadData)Common.MappModelToSimpleData(data, model);
            var result = await _globalService.LoadWidgetSetting(data);
            return result;
        }

        public async Task<WSReturn> CreateWidgetSetting(WidgetSettingModel model)
        {
            WidgetSettingData data = (WidgetSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetSettingData));
            data = (WidgetSettingData)Common.MappModelToSimpleData(data, model);
            var result = await _globalService.CreateWidgetSetting(data);
            return result;
        }

        public async Task<WSReturn> UpdateWidgetSetting(WidgetSettingModel model)
        {
            WidgetSettingData data = (WidgetSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetSettingData));
            data = (WidgetSettingData)Common.MappModelToSimpleData(data, model);
            var result = await _globalService.UpdateWidgetSetting(data);
            return result;
        }

        public async Task<WSReturn> DeleteWidgetSetting(WidgetSettingModel model)
        {
            WidgetSettingData data = (WidgetSettingData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetSettingData));
            data = (WidgetSettingData)Common.MappModelToSimpleData(data, model);
            var result = await _globalService.DeleteWidgetSetting(data);
            return result;
        }

        private string CreateLoginInfoString(string idLanguage = null)
        {
            return string.Format(@"\""IdLogin\"":\""{0}\"", \""LoginLanguage\"":\""{1}\"", \""IdApplicationOwner\"":\""{2}\"", \""GUID\"":\""{3}\""",
                                            ServiceDataRequest.IdLogin,
                                            string.IsNullOrEmpty(idLanguage) ? ServiceDataRequest.LoginLanguage : idLanguage,
                                            ServiceDataRequest.IdApplicationOwner,
                                            Guid.NewGuid());
        }

        public async Task<WSDataReturn> LoadWidgetOrderBy(string widgetApp, string widgetGuid)
        {
            WidgetOrderByData data = (WidgetOrderByData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetOrderByData));
            data.WidgetMainID = widgetApp;
            data.WidgetCloneID = widgetGuid;
            var result = await _globalService.LoadWidgetOrderBy(data);
            return result;
        }

        public async Task<WSEditReturn> SaveWidgetOrderBy(WidgetOrderByModel model)
        {
            WidgetOrderByData data = (WidgetOrderByData)ServiceDataRequest.ConvertToRelatedType(typeof(WidgetOrderByData));
            data.WidgetMainID = model.WidgetApp;
            data.WidgetCloneID = model.WidgetGuid;
            var modelValue = JsonConvert.SerializeObject(model.WidgetOrderBys, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""SaveWidgetOrderBy"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";

            var result = await _globalService.SaveWidgetOrderBy(data);

            return result;
        }
    }
}

