using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public partial class GlobalService : BaseUniqueServiceRequest, IGlobalService
    {
        #region Wdget Template
        public async Task<object> GetAllWidgetTemplateByModuleId(Data data)
        {
            data.MethodName = "SpCallWidgetManaging";

            bool isReturnRawData = !string.IsNullOrEmpty(data.Object);            
            if (!isReturnRawData)
                data.Object = "SelectWidgetApp";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            if (isReturnRawData)
            {
                var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
                return new WSDataReturn(response);
            }
            else
            {
                var response = await Execute(() => Service.ExecutePost<IList<WidgetTemplateModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
                return response;
            }
        }

        public async Task<object> GetWidgetTemplateDetailByRequestString(string request, int idRepWidgetType)
        {
            BodyRequest bodyRquest = JsonConvert.DeserializeObject<BodyRequest>(request);

            var expectedReturn = new Dictionary<int, Type>();
            switch (idRepWidgetType)
            {
                case (int)EIdRepWidgetType.Combination:
                case (int)EIdRepWidgetType.CombinationType2:
                case (int)EIdRepWidgetType.DataSet:
                case (int)EIdRepWidgetType.DataGrid:
                case (int)EIdRepWidgetType.TableWithFilter:
                case (int)EIdRepWidgetType.EditableTable:
                case (int)EIdRepWidgetType.EditableDataGrid:
                case (int)EIdRepWidgetType.FileExplorer:
                case (int)EIdRepWidgetType.ToolsFileTemplate:
                default:
                    var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
                    return new WSDataReturn(response);

                case (int)EIdRepWidgetType.GroupTable:
                case (int)EIdRepWidgetType.TreeCategoriesTable:
                    //TODO: will refactor
                    expectedReturn.Add(1, typeof(DynamicCollection));
                    var _response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType4)))[1];
                    return _response != null ? ((IList<DynamicCollection>)_response).FirstOrDefault() : null;
            }
        }

        public async Task<WSDataReturnValue> UpdateWidgetInfo(string request)
        {
            BodyRequest bodyRquest = JsonConvert.DeserializeObject<BodyRequest>(request);

            var response = await Execute(() => Service.ExecutePost<IList<WSDataReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSDataReturn> LoadWidgetSetting(WidgetSettingLoadData data)
        {
            data.MethodName = "SpCallGetSettingWidget";
            data.CrudType = "Read";
            data.Object = "B00SettingsWidget";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
            return new WSDataReturn(response);

        }

        public async Task<WSReturn> CreateWidgetSetting(WidgetSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsWidget";
            data.CrudType = "Create";
            data.Object = "B00SettingsWidget";
            data.AppModus = "0";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSReturn> DeleteWidgetSetting(WidgetSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsWidget";
            data.CrudType = "Delete";
            data.Object = "B00SettingsWidget";
            data.AppModus = "0";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSReturn> UpdateWidgetSetting(WidgetSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsWidget";
            data.CrudType = "Update";
            data.Object = "B00SettingsWidget";
            data.AppModus = "0";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSDataReturn> LoadWidgetOrderBy(WidgetOrderByData data)
        {
            data.MethodName = "SpSys_SysAppTools";
            data.Object = "GetWidgetOrderBy";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);

        }

        public async Task<WSEditReturn> SaveWidgetOrderBy(WidgetOrderByData data)
        {
            data.MethodName = "SpSys_SysAppTools";
            data.Object = "SaveWidgetOrderBy";
            data.CrudType = "Update";            
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        #endregion
    }
}

