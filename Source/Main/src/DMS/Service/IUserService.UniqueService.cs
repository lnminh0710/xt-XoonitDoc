using AutoMapper;
using DMS.Models;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    /// <summary>
    /// UniqueService
    /// </summary>
    public class UserService : BaseUniqueServiceRequest, IUserService
    {
        public UserService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting, IMapper mapper)
            : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }

        public Task<object> GetUserById(UserProfileGetData data)
        {
            data.MethodName = "SpAppWg001UserProfile";
            data.Object = "GetUserById";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<object> ListUserRoleByUserId(UserProfileGetData data)
        {
            data.MethodName = "SpCallUserRole";
            data.Object = "LoginRolebyUser";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<object> GetAllUserRole(UserProfileGetData data)
        {
            data.MethodName = "SpCallUserRole";
            data.Object = "UserRoleList";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<object> ListUserRoleInclueUserId(UserProfileGetData data)
        {
            data.MethodName = "Test";
            data.Object = "Test";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<object> CheckExistUserByField(UserProfileData data)
        {
            data.MethodName = "SpAppWg001UserProfile";
            data.Object = "GetUserById";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<WSEditReturn> SaveUserProfile(UserProfileData data)
        {
            data.MethodName = "SpCallUserProfile";
            data.Object = "UserProfile";
            return SaveData(data);
        }

        public Task<WSEditReturn> SaveRoleForUser(UserProfileGetData data)
        {
            data.MethodName = "SpCallUserRole";
            data.Object = "LoginRolebyUser";
            return SaveData(data);
        }

        public Task<WSEditReturn> AssignRoleToMultipleUser(UserRolesUpdateData data)
        {
            data.MethodName = "SpCallUserRole";
            data.Object = "AssignUsersRoles";
            return SaveData(data);
        }

        public async Task<object> SaveUserWidgetLayout(UserWidgetLayoutUpdateData data)
        {
            data.MethodName = "SpCallUserWidgetLayout";
            data.CrudType = "UPDATE";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// GetUserFunctionList
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<object> GetUserFunctionList(UserFunctionListGetData data)
        {
            data.MethodName = "SpAppWg002UserRoleDetail";
            data.Object = "GetUserRole";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response != null && response.Count > 1)
            {
                #region Make Data
                var jarray = response;
                Dictionary<string, Dictionary<string, bool>> result = new Dictionary<string, Dictionary<string, bool>>();
                jarray = (JArray)jarray[1];
                foreach (JToken jToken in jarray)
                {
                    string key = "";
                    Dictionary<string, bool> model = new Dictionary<string, bool>();
                    foreach (JProperty prop in ((JObject)jToken).Properties())
                    {
                        switch (prop.Name)
                        {
                            case "KeyValue":
                                key = prop.Value + string.Empty;
                                break;
                            case "RMRead":
                            case "RMNew":
                            case "RMEdit":
                            case "RMDelete":
                            case "RMExport":
                                model[prop.Name.Substring(2).ToLower()] = ConverterUtils.ToBool(prop.Value);
                                break;
                        }
                    }//for

                    if (key != string.Empty && key != "{}")
                    {
                        //Group by Key and 'Or' Read/New/Edit/Delete/Export
                        var prevModel = result.GetValueOrDefault(key);
                        if (prevModel != null)
                        {
                            //Or bit with current model
                            foreach (string modelKey in model.Keys.ToArray())
                            {
                                model[modelKey] = model[modelKey] | prevModel[modelKey];
                            }
                        }

                        result[key] = model;
                    }
                }//for
                return result;
                #endregion
            }

            return null;
        }

        public Task<object> GetUserByEmail(UserEmailGetData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetDataFromEmail";
            return GetDataWithMapTypeIsNone(data);
        }

        public Task<object> GetCompanyNameFromIdLogin(Data data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetCompanyNameFromIdLogin";
            return GetDataWithMapTypeIsNone(data);
        }

        public async Task<WSAvatarReturnValue> UpdateAvatar(LoginData data)
        {
            data.MethodName = "SpCallLogin";
            data.Object = "SetLoginProfile";

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSAvatarReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSEditReturn> UpdateProfileUser(UserProfileDetail signUpAccount, string idApplicationOwner, string idLoginCurrentUser)
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

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<UserFromService> GetDetailUserByIdOrEmail(string idLogin, string email)
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

    }
}
