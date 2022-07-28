using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using DMS.Models;
using DMS.Utils;
using Newtonsoft.Json;
using DMS.Constants;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DMS;
using AutoMapper;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Service
{
    /// <summary>
    /// UniqueService
    /// </summary>
    public class UniqueService : BaseUniqueServiceRequest, IUniqueService
    {
        private readonly IMapper _mapper;
        public UniqueService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting, IMapper mapper)
            : base(appSettings, httpContextAccessor, appServerSetting)
        {
            _mapper = mapper;
        }

        /// <summary>
        /// GetMainLanguages
        /// </summary>
        /// <returns></returns>
        public async Task<object> GetMainLanguages(Data data)
        {
            data.MethodName = "SpAppWg002RepLanguage";
            data.Object = "";
            return await GetDataWithMapTypeIsNone(data);
        }

        /// <summary>
        /// GetColumnSetting
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        public async Task<object> GetColumnSetting(string moduleId, UserFromService userFromService, bool isMobileSearch = false)
        {
            var methodName = isMobileSearch ? "SpSyncElasticSearch_GetColumnName_Mobile" : "SpSyncElasticSearch_GetColumnName";
            Data data = new Data
            {
                MethodName = methodName,
                CrudType = null,
                Object = moduleId,
                Mode = null,
                AppModus = "0",
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                GUID = null
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// GetAllModules
        /// </summary>
        /// <returns></returns>
        public async Task<IList<GlobalModule>> GetAllModules(UserFromService userFromService)
        {
            Data data = new Data
            {
                MethodName = "SpCallGuiMenus",
                CrudType = "Read",
                Object = "AllMenu",
                Mode = null,
                AppModus = "0",
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                GUID = null
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalModule>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetAllGlobalModule
        /// </summary>
        /// <returns></returns>
        public async Task<IList<GlobalModule>> GetAllGlobalModule(UserFromService userFromService)
        {
            Data data = new Data
            {
                MethodName = "SpCallGuiMenus",
                CrudType = "Read",
                Object = "MainMenu",
                Mode = null,
                AppModus = "0",
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                GUID = null
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalModule>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetDetailSubModule
        /// </summary>
        /// <returns></returns>
        public async Task<IList<GlobalModule>> GetDetailSubModule(int moduleId, UserFromService userFromService)
        {
            Data data = new Data
            {
                MethodName = "SpCallGuiMenus",
                CrudType = "Read",
                Object = "SubMenu",
                Mode = null,
                AppModus = "1",
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                GUID = null,
                IdSettingsGUI = moduleId.ToString()
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<GlobalModule>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// Get User By Email/Pwd
        /// </summary>
        /// <param name="email"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public async Task<UserFromService> GetUser(string email, string password)
        {
            LoginData data = new LoginData
            {
                MethodName = "SpCallLogin",
                Object = "SignIn",
                AppModus = "1",
                LoginLanguage = "1",
                IdApplicationOwner = "1",
                GUID = null,
                Email = email,
                Password = password,
                IsDisplayHiddenFieldWithMsg = "1"
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<UserFromService>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            UserFromService us = response?.FirstOrDefault();

            if (us != null)
            {
                us.IsSuperAdmin = false;
                us.IsAdmin = false;
                if (string.IsNullOrEmpty(us.Roles)) return us;
                try
                {
                    List<LoginRoleSignin> ls = JsonConvert.DeserializeObject<List<LoginRoleSignin>>(us.Roles);
                    if (ls != null && ls.Count > 0)
                    {
                        var superAdmin = ls.Where(u => u.IsSuperAdmin.HasValue && u.IsSuperAdmin.Value == true).FirstOrDefault();
                        if (superAdmin != null) us.IsSuperAdmin = true;
                        else
                        {
                            var admin = ls.Where(u => u.IsAdmin.HasValue && u.IsAdmin.Value == true).FirstOrDefault();
                            if (admin != null) us.IsAdmin = true;
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.StackTrace);
                }
            }
            return us;
        }

        /// <summary>
        /// Get User By Id
        /// </summary>
        /// <param name="IdLogin"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        public async Task<UserFromService> GetUserByIdOrEmail(string idLogin, string email)
        {
            LoginData data = new LoginData
            {
                MethodName = "SpCallLogin",
                Object = "GetUserInfo",
                GUID = null,
                LoginLanguage = "-1",
                IdLogin = idLogin,
                Email = email,
                IdApplicationOwner = "-1",
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<UserFromService>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }


        /// <summary>
        /// Get User By Id
        /// </summary>
        /// <param name="IdLogin"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        public async Task<UserFromService> GetAllUserByIdOrEmail(string idLogin, string email)
        {
            LoginData data = new LoginData
            {
                MethodName = "SpCallLogin",
                Object = "GetDetailsUserInfo",
                GUID = null,
                LoginLanguage = "-1",
                IdLogin = idLogin,
                Email = email,
                IdApplicationOwner = "-1",
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<UserFromService>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// Reset Password
        /// </summary>
        /// <param name="loginName"></param>
        /// <returns></returns>
        public async Task<UserFromService> ResetPassword(string loginName)
        {
            ResetPasswordData data = new ResetPasswordData
            {
                MethodName = "SpCallLogin",
                AppModus = "0",
                IdLogin = "",
                LoginLanguage = "1",
                IdApplicationOwner = "1",
                GUID = null,
                LoginName = loginName,
                Password = null,
                IsDisplayHiddenFieldWithMsg = "1",
                IsResetPassword = "1",
                Mode = "ResetPassword"
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<UserFromService>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// Get User By LoginName/Pwd
        /// </summary>
        /// <param name="loginName"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public async Task<WSNewReturnValue> ChangePassword(LoginData data)
        {
            data.MethodName = "SpCallLogin";
            data.Object = "ChangePassword";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSNewReturnValue> UpdateLoginActive(LoginData data)
        {
            data.MethodName = "SpCallLogin";
            data.Object = "SetLoginActived";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// Reset Password
        /// </summary>
        /// <param name="loginName"></param>
        /// <returns></returns>
        public Task<bool> SendNotificationForExpiredUser(string loginName, string content)
        {
            return Task.FromResult(true);
        }

        public async Task<IList<ModuleSettingModel>> GetModuleSetting(ModuleSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsModule";
            data.Object = "B00SettingsModule";
            data.CrudType = "Read";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<ModuleSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<object> GetSettingModule(ModuleSettingData data)
        {
            data.MethodName = "SpCallGetSettingsModule";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<ModuleSettingModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<IList<TabSummaryModel>> GetTabSummaryInformation(TabData data)
        {
            data.MethodName = "SpCallGuiMenus";
            data.Mode = "TabMenu";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<TabSummaryModel>>(bodyRquest, Constants.EExecuteMappingType.TabSummary));
            return response;
        }

        public async Task<IList<TabSummaryModel>> GetTabByIdDocumentType(TabData data)
        {
            data.CrudType = "READ";
            data.MethodName = "SpCallGuiMenusDocuments";
            data.Object = "DocumentModule";
            data.Mode = "TabMenu";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<TabSummaryModel>>(bodyRquest, Constants.EExecuteMappingType.TabSummary));
            return response;
        }

        public async Task<object> GetCustomerColumnsSetting(Data data)
        {
            data.MethodName = "SpSyncElasticSearch_GetColumnName";
            return await GetDataWithMapTypeIsNone(data);
        }

        public async Task<object> GetComboBoxInformation(Data data, string extraData = null)
        {
            data.MethodName = "SpCallComboBox";

            #region ExtraData
            //object oData = data;
            //if (!string.IsNullOrEmpty(extraData))
            //{
            //    dynamic dData = ToExpandoObject(data);
            //    var arrExtraData = extraData.Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries);
            //    foreach (var extraDataItem in arrExtraData)
            //    {
            //        var arrExtraDataItem = extraDataItem.Split(new char[] { ':' }, StringSplitOptions.RemoveEmptyEntries);
            //        if (arrExtraDataItem.Length == 2)
            //        {
            //            dData[arrExtraDataItem[0]] = arrExtraDataItem[1];
            //        }
            //    }//for
            //    oData = dData;
            //}
            #endregion

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<object>(bodyRquest, Constants.EExecuteMappingType.ComboBox));
            return response;
        }

        public async Task<WSContactEditReturn> CreateContact(ContactCreateData data, int numCommunications)
        {
            data.MethodName = "SpCallContactCreate";
            data.CrudType = "CREATE";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSContactEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.LastOrDefault();
        }

        public async Task<IList<ModuleToPersonTypeModel>> GetModuleToPersonType(Data data)
        {
            data.MethodName = "SpCallSettingsGlobalList";
            data.Object = "ModuleToPersonType";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<ModuleToPersonTypeModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// UpdateModuleSettingData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<WSReturn> UpdateSettingsModule(UpdateModuleSettingData data)
        {
            data.MethodName = "SpCrudB00SettingsModule";
            data.AppModus = "0";
            data.Object = "B00SettingsModule";
            data.CrudType = "Update";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// GetDynamicRulesType
        /// </summary>
        /// <returns></returns>
        public async Task<object> GetDynamicRulesType(UserFromService userFromService)
        {
            Data data = new Data
            {
                MethodName = "SpCrudB02RepSelectionDynamicRulesType",
                CrudType = "READ",
                Object = "B02RepSelectionDynamicRulesType",
                Mode = "",
                AppModus = "0",
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                GUID = null
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// Create User Account - Signup
        /// </summary>
        /// <param name="signUpAccount"></param>
        /// <returns></returns>
        public async Task<IList<WSNewReturnValue>> CreateUserAccount(SignUpAccount signUpAccount, string idApplicationOwner, string idLoginCurrentUser)
        {
            var jsonLoginAcc = JsonConvert.SerializeObject(new { LoginAccount = signUpAccount });
            SignupData data = new SignupData
            {
                MethodName = "SpCallLogin",
                Object = "LoginAccount",
                AppModus = "1",
                IdLogin = idLoginCurrentUser,
                LoginLanguage = signUpAccount.IdRepLanguage,
                IdApplicationOwner = idApplicationOwner,
                GUID = null,
                JSONLoginAccount = jsonLoginAcc
            };
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetUsersByIdLogin
        /// </summary>
        /// <param name="listUserData"></param>
        /// <returns></returns>
        public async Task<dynamic> GetUsersByIdLogin(ListUserData listUserData)
        {
            listUserData.MethodName = "SpCallLogin";
            listUserData.Object = "GetAllUserByIdLogin";

            BodyRequest bodyRquest = CreateBodyRequest(listUserData);


            var response = await Execute(() => Service.ExecutePost<IList<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 2) return null;

            // return Value
            var jArrayReturnValue = response.Count == 4 ? response[3] as JArray : response[2] as JArray;
            var returnValue = jArrayReturnValue.ToObject<IList<WSNewReturnValue>>();
            if (returnValue?.FirstOrDefault() == null || returnValue.FirstOrDefault().ReturnID != "1") return null;

            var jArrayTotalRecords = response.Count == 4 ? response[0] as JArray : null;
            var jArraySettingColumns = response.Count == 4 ? response[1] as JArray : response[0] as JArray;
            var jArrayDataSource = response.Count == 4 ? response[2] as JArray : response[1] as JArray;

            // total all records of data source
            var totalRecordsData = jArrayTotalRecords == null ? 1 : jArrayTotalRecords.ToObject<IEnumerable<TotalRecordsData>>()?.FirstOrDefault()?.TotalRecords ?? 0;

            // setting columns for grid
            var settingColumns = jArraySettingColumns.ToObject<IEnumerable<SettingColumnNameListWrapper>>();
            var columnDefinitions = settingColumns.FirstOrDefault()?.SettingColumnName?.FirstOrDefault()?.ColumnSetting?.ColumnsName.Select((column) => new ColumnDefinitionViewModel
            {
                ColumnName = column.ColumnName,
                ColumnHeader = column.ColumnHeader,
                OriginalColumnName = column.OriginalColumnName,
                DataType = column.DataType,
                DataLength = column.DataLength.Value,
                Value = column.Value,
                Setting = new ColumnDefinitionSetting
                {
                    DisplayField = column.Setting.FirstOrDefault()?.DisplayField,
                    ControlType = column.Setting.FirstOrDefault()?.ControlType,
                    CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                    Validators = column.Setting.FirstOrDefault()?.Validators,
                }
            });

            // data source of grid
            var dataSource = jArrayDataSource.ToObject<IList<object>>();

            // temporary, will update
            var total = dataSource.Count;
            return new
            {
                TotalRecord = totalRecordsData,
                ColumnSetting = columnDefinitions,
                Data = dataSource
            };
        }

        /// <summary>
        /// GetOptionsListFilter
        /// </summary>
        /// <param name="loginData"></param>
        /// <returns></returns>
        public async Task<dynamic> GetFilterOptionsUser(LoginData loginData)
        {
            loginData.MethodName = "SpB06GetDocumentContainer";
            loginData.Object = "GetDropDownList";

            BodyRequest bodyRquest = CreateBodyRequest(loginData);

            var response = await Execute(() => Service.ExecutePost<IList<dynamic>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// Change User Status
        /// </summary>
        /// <param name="LoginData"></param>
        /// <returns></returns>
        public async Task<WSNewReturnValue> UpdateUserStatus(LoginData data)
        {
            data.MethodName = "SpCallLogin";
            data.Object = "SetActive";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        #region WidgetApp
        /// <summary>
        /// GetWidgetAppById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<object> GetWidgetAppById(WidgetAppGetData data)
        {
            data.Object = "GetById";
            data.MethodName = "SpAppWg002GetWidgetApp";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// UpdateWidgetApp
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> UpdateWidgetApp(UpdateWidgetAppData data)
        {
            data.MethodName = "SpCallWidgetApp";
            data.Object = "";

            return await SaveData(data);
        }
        #endregion
    }
}
