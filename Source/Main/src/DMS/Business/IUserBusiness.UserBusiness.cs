using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using System.IO;
using DMSWeb.Models.DMS.ViewModels;
using DMS.Constants;
using System.Globalization;
using DMS.ServiceModels;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Collections;
using DMS.Models.Authenticate;

namespace DMS.Business
{
    /// <summary>
    /// UserBusiness
    /// </summary>
    public class UserBusiness : BaseBusiness, IUserBusiness
    {
        private readonly IUniqueService _uniqueService;
        private readonly IUserService _userService;
        private readonly AppSettings _appSettings;
        private readonly IEmailBusiness _emailBusiness;
        private IPathProvider _pathProvider;
        private readonly IAuthenticateBusiness _authBusiness;
        private readonly IDynamicDataService _dynamicDataService;

        public UserBusiness(
            IUniqueService uniqueService,
            IHttpContextAccessor context,
            IOptions<AppSettings> appSettings,
            IUserService userService,
            IEmailBusiness emailBusiness,
            IPathProvider pathProvider,
            IAuthenticateBusiness authBusiness,
            IDynamicDataService dynamicDataService) : base(context)
        {
            _uniqueService = uniqueService;
            _userService = userService;
            _appSettings = appSettings.Value;
            _emailBusiness = emailBusiness;
            _pathProvider = pathProvider;
            _authBusiness = authBusiness;
            _dynamicDataService = dynamicDataService;
        }

        public async Task<object> GetUserById(string idPerson, bool isMobile = false)
        {
            if (string.IsNullOrWhiteSpace(idPerson)) return null;

            var result = await _uniqueService.GetAllUserByIdOrEmail(idPerson, null);
            if (result != null)
            {
                result.LoginPicture = _authBusiness.GetUserAvatar(result.LoginPicture, isMobile);
            }
            return result;
        }

        public async Task<object> ListUserRoleByUserId(string userId)
        {
            UserProfileGetData data = (UserProfileGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileGetData));
            data.JSONText = "{\"LoginRolebyUser\":[{\"IdLogin\":\"" + (string.IsNullOrEmpty(userId) ? data.IdLogin : userId) + "\"}]}";
            data.CrudType = "Read";
            var result = await _userService.ListUserRoleByUserId(data);
            return result;
        }

        public async Task<object> GetAllUserRole()
        {
            UserProfileGetData data = (UserProfileGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileGetData));
            data.JSONText = "{\"UserRoleList\":[{\"IdLoginRoles\":\"\"}]}";
            data.CrudType = "Read";
            var result = await _userService.GetAllUserRole(data);
            return result;
        }

        public async Task<object> ListUserRoleInclueUserId(int? idPerson)
        {
            UserProfileGetData data = (UserProfileGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileGetData));
            data.IdPerson = idPerson == null ? "" : idPerson.Value.ToString();
            var result = await _userService.ListUserRoleInclueUserId(data);
            return result;
        }

        public async Task<object> CheckExistUserByField(string fieldName, string fieldValue)
        {
            UserProfileData data = (UserProfileData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileData));
            switch (fieldName)
            {
                case "LoginName":
                    {
                        data.LoginName = fieldValue;
                        break;
                    }
                case "Email":
                    {
                        data.Email = fieldValue;
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
            var result = await _userService.CheckExistUserByField(data);
            return result;
        }

        #region SaveUserProfile
        public async Task<object> SaveUserProfile(UserSaving model, HttpContext context, string domain)
        {
            UserProfileData data = (UserProfileData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileData));
            data = (UserProfileData)Common.MappModelToData(data, model, true);
            if (model.UserProfile.Password != null)
                data.Password = Common.SHA256Hash(model.UserProfile.Password);
            var roles = JsonConvert.SerializeObject(model.UserRoles, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""UserRoles"":{0}", roles);
            data.JSONText = "{" + data.JSONText + "}";
            var result = await _userService.SaveUserProfile(data);
            if (model.UserProfile.IdPerson == null && !string.IsNullOrEmpty(result.ReturnID))
            {
                SendUserInformationToUserEmail(model.UserProfile, context);
            }
            return result;
        }

        private void SendUserInformationToUserEmail(UserProfile user, HttpContext context)
        {
            var domainUrl = Common.GetFullDomainUrl(context);
            Task.Run(() =>
            {
                string hrefLink = string.Format("{0}/auth/login", domainUrl);
                var emailModel = new EmailModel()
                {
                    Subject = "[No reply] Xena creates a new user",
                    ToEmail = user.Email,
                    Body = BuildEmailBody(user, hrefLink)
                };
                emailModel.ImageAttached = new List<ImageSend>
                {
                    new ImageSend()
                    {
                        Source = _emailBusiness.ImageToBase64(_appSettings.ImageLogoUrl),
                        EmbeddedId = Common.XeNaLogoCid
                    }
                };
                _emailBusiness.SendEmailWithEmbeddedImage(emailModel);
            });
        }

        private string BuildEmailBody(UserProfile user, string hrefLink)
        {
            return string.Format(@"<table style='width: 1200px;
                                    border: 1px solid #0b6599;
                                    line-height: 16px;
                                    font-size: 14px;
                                    font-family: tahoma;
                                    min-width: 400px;
                                    margin-bottom: 30px;'>
                                    <tr><td>
                                <div style='width: 100%;
                                        height: 50px;
                                        background-color: #0b6599'>
                                    <img style='width:130px' src='cid:{0}'/>
                                </div>
                                <div style='padding: 10px 40px 20px 40px;'>
                                    <h1 style='line-height: 25px'>Create new account</h1>
                                    <br/>
                                    <strong>Dear {1},</strong>
                                    <p>We has just created an account form your email <strong>{2}</strong></p>
                                    <br/>
                                    <strong>Account Information:</strong>
                                    <p style='padding-left: 20px'>Login name:&nbsp;<strong>{3}</strong></p>
                                    <p style='padding-left: 20px'>Password:&nbsp;<strong>{4}</strong></p>
                                    <br/>
                                    <p>Please click on Sign In button for starting.</p>
                                    <br/>
                                    <table style='
                                        width: 150px;
                                        height: 40px;
                                        padding: 0;
                                        background-color: #0b6599;
                                        '>
                                        <tbody><tr style='
                                            padding: 0;
                                            '>
                                            <td align='center'>
                                                <a href='{5}' style='font-size: 19px;
                                                                color: #fff;
                                                                text-decoration: none;
                                                                display: block;
                                                                padding: 0;
                                                                line-height: 45px;'>Sign In</a>
                                            </td>
                                        </tr>
                                    </tbody></table>
                                </div>
                                <div style='width: calc(100% - 20px);
                                        height: 30px;
                                        background-color: #cdcece;
                                        border-top: 1px solid #0b6599;
                                        padding-top: 20px;
                                        padding-left: 20px;'>
                                        <i>*We send you  this email for creating new account purpose*</i>
                                </div>
                            </td></tr></table>",
                Common.XeNaLogoCid,
                user.FullName,
                user.Email,
                user.LoginName,
                user.Password,
                hrefLink);
        }

        #endregion

        public async Task<object> SaveRoleForUser(IList<UserRoleUpdate> roles, HttpContext context, string isSetDefaultRole = null)
        {
            UserProfileGetData data = (UserProfileGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileGetData));
            data.JSONText = "{\"LoginRolebyUser\":[";
            for (int i = 0; i < roles.Count; i++)
            {
                data.JSONText = data.JSONText +
                    "{\"IdLoginRolesLoginGw\":\"" + roles[i].IdLoginRolesLoginGw + "\"" +
                    ",\"IdLoginRoles\":\"" + roles[i].IdLoginRoles + "\"" +
                    ",\"IdLogin\":\"" + roles[i].IdLogin + "\"" +
                    ",\"IsDefault\":\"" + roles[i].IsDefault + "\"}"
                    + (i != roles.Count - 1 ? "," : "");
            }
            data.JSONText = data.JSONText + "]}";
            data.IsSetDefaultRole = isSetDefaultRole;

            var result = await _userService.ListUserRoleByUserId(data);
            return result;
        }

        public async Task<object> SaveUserWidgetLayout(UserWidgetLayoutUpdate model, HttpContext context)
        {
            UserWidgetLayoutUpdateData data = (UserWidgetLayoutUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(UserWidgetLayoutUpdateData));
            data.ObjectNr = model.ObjectNr;
            data.IdMember = model.IdMember;
            if (model.IsResetDefault == "1")
            {
                data.IsResetDefault = model.IsResetDefault;
            }

            var result = await _userService.SaveUserWidgetLayout(data);
            return result;
        }


        /// <summary>
        /// GetUserFunctionList
        /// </summary>
        /// <param name="idLoginRoles"></param>
        /// <returns></returns>
        public async Task<object> GetUserFunctionList(string idLoginRoles)
        {
            UserFunctionListGetData data = (UserFunctionListGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserFunctionListGetData));
            data.IdLoginRoles = idLoginRoles + string.Empty;
            data.IsAll = "0";
            var result = await _userService.GetUserFunctionList(data);
            return result;
        }

        /// <summary>
        /// Assign Role List To Multiple Users
        /// </summary>E
        /// <param name="idLogins"> List ids string. Ex: '9,10,11,12'</param>
        /// <param name="idLoginRoles">List ids string. Ex: '9,10,11,12'</param>
        /// <returns></returns>
        public async Task<object> AssignRoleToMultipleUser(string idLogins, string idLoginRoles)
        {
            UserRolesUpdateData data = (UserRolesUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(UserRolesUpdateData));
            data.ListOfIdLogin = idLogins;
            data.ListOfIdLoginRoles = idLoginRoles;
            var result = await _userService.AssignRoleToMultipleUser(data);
            return result;
        }

        public async Task<object> GetUserByEmail(string email)
        {
            UserEmailGetData data = (UserEmailGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserEmailGetData));
            if (string.IsNullOrEmpty(data.IdLogin))
            {
                data.IdLogin = this.UserFromService.IdLogin;
                data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            }
            data.Email = email;
            var result = await _userService.GetUserByEmail(data);
            return result;
        }

        public async Task<object> GetCompanyNameFromIdLogin(string IdLogin)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            data.IdLogin = IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;


            var result = await _userService.GetCompanyNameFromIdLogin(data);
            return result;
        }

        public async Task<object> UpdateAvatar(IFormFileCollection files, HttpContext context)
        {
            try
            {
                if (files.Count > 0 && files[0] == null) return null;
                var file = files[0];
                if (!("image/png, image/jpeg, image/jpg").Contains(file.ContentType.ToLower()))
                {
                    return new
                    {
                        ReturnID = "0",
                        UserErrorMessage = "File upload must be PNG, JPEG/JPG."
                    };
                }
                if (file.Length > 5 * 1024 * 1024)
                {
                    return new
                    {
                        ReturnID = "0",
                        UserErrorMessage = "File upload has size larger 5MB."
                    };
                }

                var userDb = await _uniqueService.GetUserByIdOrEmail(UserFromService.IdLogin, null);
                if (userDb == null) return null;

                var extension = file.FileName.Substring(file.FileName.LastIndexOf(".") + 1);
                var fileName = $"{DateTime.Now.Ticks.ToString()}.{extension}";
                string uploadFolder = _pathProvider.GetFullUploadFolderPath(UploadMode.Profile);
                var saveFilePath = Path.Combine(uploadFolder, fileName);

                await AddFileAsync(file, saveFilePath);

                LoginData loginData = new LoginData
                {
                    IdLogin = UserFromService.IdLogin,
                    LoginPicture = fileName,
                    IdApplicationOwner = UserFromService.IdApplicationOwner,
                    LoginLanguage = UserFromService.IdRepLanguage
                };
                var result = await _userService.UpdateAvatar(loginData);

                if (result == null || result.ReturnID != UserFromService.IdLogin) return null;

                //Remove Old Picture
                if (!string.IsNullOrWhiteSpace(userDb.LoginPicture))
                {
                    await RemoveAvatar(userDb.LoginPicture, false);
                }

                result.LoginPicture = _authBusiness.GetUserAvatar(fileName);
                return result;
            }
            catch (Exception ex)
            {
                return ex;
            }
        }

        public async Task<dynamic> RemoveAvatar(string loginPicture, bool isUpdateDb = true)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginPicture))
                {
                    var userDb = await _uniqueService.GetUserByIdOrEmail(UserFromService.IdLogin, null);
                    if (userDb == null || string.IsNullOrWhiteSpace(userDb.LoginPicture)) return null;
                    loginPicture = userDb.LoginPicture;
                }

                string uploadFolder = _pathProvider.GetFullUploadFolderPath(UploadMode.Profile);
                RemoveFile(Path.Combine(uploadFolder, loginPicture));

                if (!isUpdateDb) return null;

                LoginData loginData = new LoginData
                {
                    IdLogin = UserFromService.IdLogin,
                    LoginPicture = null,
                    IdApplicationOwner = UserFromService.IdApplicationOwner,
                    LoginLanguage = UserFromService.IdRepLanguage
                };
                var result = await _userService.UpdateAvatar(loginData);
                if (result != null)
                {
                    result.LoginPicture = _authBusiness.GetUserAvatar("");
                }
                return result;
            }
            catch (Exception ex)
            {
                return ex;
            }
        }

        public async Task<dynamic> GetUsersByIdLogin(UserFilterViewModel userFilterViewModel)
        {
            ListUserData listUserData = new ListUserData
            {
                IdLogin = UserFromService.IdLogin,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
                LoginLanguage = UserFromService.IdRepLanguage,
                PageIndex = userFilterViewModel.PageIndex - 1,
                PageSize = userFilterViewModel.PageSize,
                IdPerson = userFilterViewModel.CompanyId,
                IdLoginFilter = userFilterViewModel.FullNameId,
                UserEmail = userFilterViewModel.Email
            };
            return await _uniqueService.GetUsersByIdLogin(listUserData);
        }

        public async Task<dynamic> GetFilterOptionsUser()
        {
            //if (UserFromService.Encrypted.Equals(UserEncrypted.USER)) return null;

            LoginData loginData = new LoginData
            {
                IdLogin = UserFromService.IdLogin,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
                LoginLanguage = UserFromService.IdRepLanguage
            };

            loginData.Mode = "FullName";
            var fullNameListAsync = _uniqueService.GetFilterOptionsUser(loginData);

            loginData.Mode = "Email";
            var emailListAsync = _uniqueService.GetFilterOptionsUser(loginData);

            dynamic companyListAsync = null;
            loginData.Mode = "Company";
            companyListAsync = _uniqueService.GetFilterOptionsUser(loginData);
            //if (UserFromService.Encrypted.Equals(UserEncrypted.MASTER_ADMIN))
            //{
            //    loginData.Mode = "Company";
            //    companyListAsync = _uniqueService.GetFilterOptionsUser(loginData);
            //}

            return new
            {
                fullNameList = await fullNameListAsync,
                emailList = await emailListAsync,
                companyList = await companyListAsync
            };
        }

        public async Task<dynamic> GetCompanyList()
        {
            //if (!UserFromService.Encrypted.Equals(UserEncrypted.MASTER_ADMIN)) return null;

            LoginData loginData = new LoginData
            {
                IdLogin = UserFromService.IdLogin,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
                LoginLanguage = UserFromService.IdRepLanguage,
            };

            loginData.Mode = "Company";
            var companyListAsync = await _uniqueService.GetFilterOptionsUser(loginData);

            return companyListAsync;
        }

        private void RemoveFile(string path)
        {
            if (File.Exists(path))
                File.Delete(path);
        }

        private async Task AddFileAsync(IFormFile file, string path)
        {
            var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);
            stream.Close();
        }

        public async Task<object> UpdateProfileOtherUser(UserProfileDetail model, HttpContext context)
        {
            bool isSentEmail = false;
            string email = "";
            if (model != null)
            {
                if (model.IsBlocked.HasValue)
                {
                    model.IsLoginActived = false;
                    isSentEmail = !model.IsBlocked.Value;
                    email = (await _uniqueService.GetAllUserByIdOrEmail(model.IdLogin, null)).Email;
                    model.Password = _authBusiness.GenrateNewPasswordWithEmailChanged(email);
                }
                if (!string.IsNullOrEmpty(model.Email))
                {
                    if (isSentEmail) model.Password = _authBusiness.GenrateNewPasswordWithEmailChanged(model.Email);
                    model.IsBlocked = false;
                    model.IsLoginActived = false;
                    isSentEmail = true;
                }
            }
            var result = await _userService.UpdateProfileUser(model, model.IdApplicationOwner, model.IdLogin);

            if (!string.IsNullOrEmpty(result.ReturnID) && isSentEmail)
            {
                model.Email = model.Email ?? email;
                await _authBusiness.GenerateTokenWithNewEmail(model, model.IdLogin, context);
            }
            return result;
        }

        public async Task<object> UpdateProfile(UserProfileDetail model)
        {
            model.IdLogin = UserFromService.IdLogin;
            if (!string.IsNullOrWhiteSpace(model.DateOfBirth))
            {
                model.DateOfBirth = DateTime.Parse(model.DateOfBirth).ToString("MM.dd.yyyy", CultureInfo.InvariantCulture);
            }
            return await _userService.UpdateProfileUser(model, UserFromService.IdApplicationOwner, UserFromService.IdLogin);
        }

        /// <summary>
        /// Update Firebase Group Token
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<object> UpdateFirebaseGroupToken(Dictionary<string, object> data)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpCallUserProfile";
            dynamicData.Data.Object = "FireBaseGroupToken";

            dynamicData.AddParams(data);

            return await _dynamicDataService.SaveData(dynamicData);
        }

        /// <summary>
        /// Get Users Firebase Group Token
        /// </summary>
        /// <returns></returns>
        public async Task<List<UserLoginInfo>> GetUsersFireBaseGroupToken()
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpAppWg001UserProfile ";
            dynamicData.Data.Object = "GetUserFireBaseGroupToken";

            var response = await _dynamicDataService.GetData(dynamicData);
            var jArray = (JArray)response;
            if (jArray.Count > 0)
            {
                return JsonConvert.DeserializeObject<List<UserLoginInfo>>(jArray[0] + string.Empty);
            }
            return new List<UserLoginInfo>();
        }

        public async Task<object> GetAllUsers()
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpCallLogin";
            dynamicData.Data.Object = "GetAllUser";

            var response = await _dynamicDataService.GetData(dynamicData);
            return response;
        }

        public async Task<object> GetGroupRole(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetGroupRole";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetGroupRoleDetail(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetRoleByGroup";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetRoles(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetRole";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetRoleDetail(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionByRole";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetPermissions(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermission";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }


        public async Task<object> GetUserGroups(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetUserGroup";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetUserGroupDetail(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetUserByGroup";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDUserGroup(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SaveUserGroup"
            };

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> CRUDRole(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SaveRole"
            };

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> CRUDRoleGroup(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SaveGroupRole"
            };

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> GetPermissionByUser(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionByUser";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDPermissionUser(Dictionary<string, object> data, HttpContext context)
        {
            bool createUser = false;
            string IdLogin = "";
            string email = "";
            User user = null;
            #region Detect value of key fields
            if (data.ContainsKey("JSONLoginAccount"))
            {
                IEnumerable v = ((IEnumerable)data.GetValue("JSONLoginAccount"));
                foreach (object element in v)
                {
                    IdLogin = GetValueAttributeInJSONDynamic(element, "IdLogin");
                    email = GetValueAttributeInJSONDynamic(element, "Email");

                    if (string.IsNullOrEmpty(IdLogin))
                    {
                        if (string.IsNullOrEmpty(email))
                        {
                            return new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = "Email is undefined." };
                        }
                        createUser = true;
                        string password = Common.SHA256Hash(GenratePasswordDefault(email));
                        ((JObject)((Newtonsoft.Json.Linq.JContainer)element).First())["Password"] = password;

                        user = new User
                        {
                            Email = email,
                            Password = password,
                            FirstName = GetValueAttributeInJSONDynamic(element, "FirstName"),
                            LastName = GetValueAttributeInJSONDynamic(element, "LastName")

                        };

                    }
                    break;
                }
            }
            #endregion

            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SaveUserPermission"
            };

            var response = await _dynamicDataService.SaveFormData(saveData);

            if (createUser)
            {
                if (response.ReturnID == "-1") return response;

                // if account is block will be not send email
                //if (signUpAccount.IsBlocked) return new ApiResultResponse { StatusCode = ApiMethodResultId.Success, ResultDescription = response.UserErrorMessage };

                var userToken = new UserToken
                {
                    IdLogin = response.ReturnID
                };

                var oAuthTokens = await _authBusiness.GenerateOAuthTokenForSentEmail(new HandleAccessTokenModel
                {
                    UserToken = userToken,
                    UserClient = user,
                    TokenTarget = TargetToken.NEW_PASSWORD
                });
                if (oAuthTokens == null) new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = "System error, cannot create token!" };

                var sendEmailResult = await _authBusiness.SendEmailTemplate(user, oAuthTokens, context, TargetToken.NEW_PASSWORD, null);
                if (!sendEmailResult) return new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = "User is created but cannot send activation email to email user!" };

                //return new ApiResultResponse { StatusCode = ApiMethodResultId.Success, ResultDescription = response.UserErrorMessage };
            }
            return response;
        }

        public async Task<object> GetFunctionByUser(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetFunctionByUser";

            values["UserIdLogin"] = UserFromService.IdLogin;

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetAllUserAndGroup(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetAllUserAndGroup";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        private string GetValueAttributeInJSONDynamic(object element, string key)
        {
            if (element == null)
            {
                return null;
            }
            return ((JObject)((Newtonsoft.Json.Linq.JContainer)element).First()).GetValue(key)?.ToString();

            //((JObject)((Newtonsoft.Json.Linq.JContainer)((Newtonsoft.Json.Linq.JContainer)element).First()).First()).
            //return ((JObject)((Newtonsoft.Json.Linq.JContainer)((Newtonsoft.Json.Linq.JContainer)element).First()).First()).GetValue(key)?.ToString();
        }

        private string GenratePasswordDefault(string email)
        {
            return $"{ConstAuth.PASSWORD_DEFAULT}_{email}_{ConstAuth.WEBSITE}";
        }

        public async Task<object> GetPermissionByListRole(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionByListRole";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }
    }
}
