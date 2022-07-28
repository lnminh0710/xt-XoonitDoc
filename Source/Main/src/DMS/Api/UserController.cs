using DMS.Business;
using DMS.Models;
using DMS.Utils;
using DMS.Utils.Caches;
using DMS.Utils.Firebase;
using DMSWeb.Models.DMS.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class UserController : BaseController
    {
        private readonly AppSettings _appSettings;
        private readonly IUserBusiness _userBusiness;
        private readonly IUserLoginCache _userLoginCache;
        private readonly IFirebaseNotificationClient _firebaseNotificationClient;

        public UserController(IUserBusiness userBusiness, IOptions<AppSettings> appSettings,
            IUserLoginCache userLoginCache,
            IFirebaseNotificationClient firebaseNotificationClient)
        {
            _userBusiness = userBusiness;
            _appSettings = appSettings.Value;
            _userLoginCache = userLoginCache;
            _firebaseNotificationClient = firebaseNotificationClient;
        }

        // GET: api/User/GetUserById
        [HttpGet]
        [Route("GetUserById")]
        public async Task<object> GetUserById(string idPerson, bool isMobile = false)
        {
            return await _userBusiness.GetUserById(idPerson, isMobile);
        }

        // GET: api/User/ListUserRoleByUserId
        [HttpGet]
        [Route("ListUserRoleByUserId")]
        public async Task<object> ListUserRoleByUserId(string userId)
        {
            return await _userBusiness.ListUserRoleByUserId(userId);
        }

        // GET: api/User/ListUserRoleInclueUserId
        [HttpGet]
        [Route("ListUserRoleInclueUserId")]
        public async Task<object> ListUserRoleInclueUserId(int idPerson)
        {
            return await _userBusiness.ListUserRoleInclueUserId(idPerson);
        }

        // GET: api/User/GetAllUserRole
        [HttpGet]
        [Route("GetAllUserRole")]
        public async Task<object> GetAllUserRole()
        {
            return await _userBusiness.GetAllUserRole();
        }

        // GET: api/User/CheckExistUserByField
        [HttpGet]
        [Route("CheckExistUserByField")]
        public async Task<object> CheckExistUserByField(string fieldName, string fieldValue)
        {
            return await _userBusiness.CheckExistUserByField(fieldName, fieldValue);
        }

        // POST: api/User/SaveUserProfile
        [HttpPost]
        [Route("SaveUserProfile")]
        public async Task<object> SaveUserProfile([FromBody] UserSaving model)
        {
            return await _userBusiness.SaveUserProfile(model, HttpContext, Domain);
        }

        // POST: api/User/SaveRoleForUser
        [HttpPost]
        [Route("SaveRoleForUser")]
        public async Task<object> SaveRoleForUser([FromBody] UserRoleUpdateModel model)
        {
            return await _userBusiness.SaveRoleForUser(model.Roles, HttpContext, model.IsSetDefaultRole);
        }

        [HttpPost]
        [Route("SaveUserWidgetLayout")]
        public async Task<object> SaveUserWidgetLayout([FromBody] UserWidgetLayoutUpdate model)
        {
            return await _userBusiness.SaveUserWidgetLayout(model, HttpContext);
        }

        [HttpGet]
        [Route("GetUserFunctionList")]
        public async Task<object> GetUserFunctionList(string idLoginRoles)
        {
            return await _userBusiness.GetUserFunctionList(idLoginRoles);
        }

        /// <summary>
        /// Assign Role List To Multiple Users
        /// </summary>E
        /// <param name="idLogins"> List ids string. Ex: '9,10,11,12'</param>
        /// <param name="idLoginRoles">List ids string. Ex: '9,10,11,12'</param>
        /// <returns></returns>
        [HttpPost]
        [Route("AssignRoleToMultipleUser")]
        public async Task<object> AssignRoleToMultipleUser(string idLogins, string idLoginRoles)
        {
            return await _userBusiness.AssignRoleToMultipleUser(idLogins, idLoginRoles);
        }


        // GET: api/User/GetUserByEmail
        [HttpGet]
        [Route("GetUserByEmail")]
        [AllowAnonymous]
        public async Task<object> GetUserByEmail(string email)
        {
            return await _userBusiness.GetUserByEmail(email);
        }

        [HttpGet]
        [Route("GetCompanyNameFromIdLogin")]
        [AllowAnonymous]
        public async Task<object> GetCompanyNameFromIdLogin(string IdLogin)
        {
            return await _userBusiness.GetCompanyNameFromIdLogin(IdLogin);
        }

        [HttpPost]
        //[DisableRequestSizeLimit]
        [Route("UploadAvatar")]
        public async Task<object> UploadAvatar()
        {
            return await _userBusiness.UpdateAvatar(Request.Form.Files, HttpContext);
        }

        [HttpPost]
        [Route("RemoveAvatar")]
        public async Task<object> RemoveAvatarAsync()
        {
            return await _userBusiness.RemoveAvatar();
        }
        [HttpGet]
        [Route("GetUserByIdLogin")]
        public async Task<object> GetUserByIdLogin(UserFilterViewModel userFilterViewModel)
        {
            return await _userBusiness.GetUsersByIdLogin(userFilterViewModel);
        }

        [HttpGet]
        [Route("GetFilterOptionsUser")]
        public async Task<object> GetFilterOptionsUser()
        {
            return await _userBusiness.GetFilterOptionsUser();
        }

        [HttpGet]
        [Route("CompanyList")]
        public async Task<object> GetCompanyList()
        {
            return await _userBusiness.GetCompanyList();
        }


        [HttpPost]
        [Route("EditProfile")]
        public async Task<object> EditProfile([FromBody] UserProfileDetail model)
        {
            return await _userBusiness.UpdateProfile(model);
        }

        [HttpPost]
        [Route("ChangeProfileOtherUser")]
        public async Task<object> EditProfileOtherUser([FromBody] UserProfileDetail model)
        {
            return await _userBusiness.UpdateProfileOtherUser(model, HttpContext);
        }

        /// <summary>
        /// Update Firebase Token
        /// </summary>
        /// <param name="model">{ Token(string): value, IsRemove(bool): value }</param>
        /// <returns></returns>
        [HttpPost("UpdateFirebaseToken")]
        public async Task<object> UpdateFirebaseToken([FromBody] Dictionary<string, object> data)
        {
            var errorMessage = "";
            var userBusiness = (BaseBusiness)_userBusiness;
            var idLogin = userBusiness.UserFromService.IdLogin;
            var user = _userLoginCache.GetUserOrAdd(idLogin);
            if (user != null)
            {
                var deviceToken = data.GetValue("Token") + string.Empty;
                var response = _firebaseNotificationClient.CreateOrUpdateUserGroup(idLogin, user.FireBaseGroupToken, deviceToken);
                if (response.data != null && response.data.IsSuccess())
                {
                    data["FireBaseGroupToken"] = response.data.notification_key;

                    //update cache
                    user.FireBaseGroupToken = response.data.notification_key;
                    //update db
                    return await _userBusiness.UpdateFirebaseGroupToken(data);
                }
                errorMessage = response.GetMessage();
            }

            return await Task.FromResult(new WSEditReturn()
            {
                ErrorMessage = errorMessage
            });
        }

        /// <summary>
        /// Get User Firebase Tokens By Ids
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        [HttpGet("GetUserFirebaseTokens")]
        public async Task<object> GetUserFirebaseTokens(string ids)
        {
            var listIds = ids.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            var users = _userLoginCache.GetUserFirebaseTokens(listIds);
            return await Task.FromResult(users);
        }

        [HttpGet]
        [Route("GetAllUsers")]
        public async Task<object> GetAllUsers()
        {
            return await _userBusiness.GetAllUsers();
        }

        [HttpGet("UserAndGroups")]
        public async Task<object> GetAllUserAndGroup()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetAllUserAndGroup(model);
        }


        #region UserGroups
        [HttpGet("UserGroups/Details")]
        public async Task<object> GetUserGroupDetails()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetUserGroupDetail(model);
        }

        [HttpGet("UserGroups")]
        public async Task<object> GetUserGroups()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetUserGroups(model);
        }

        [HttpPost("UserGroups")]
        public async Task<object> CRUDUserGroup([FromBody] Dictionary<string, object> data)
        {
            return await _userBusiness.CRUDUserGroup(data);
        }

        #endregion UserGroups

        #region Roles
        [HttpGet("Roles")]
        public async Task<object> GetRoles()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetRoles(model);
        }

        [HttpGet("Roles/Details")]
        public async Task<object> GetDetailsRole()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetRoleDetail(model);
        }

        [HttpPost("Roles")]
        public async Task<object> CRUDRole([FromBody] Dictionary<string, object> data)
        {
            return await _userBusiness.CRUDRole(data);
        }
        #endregion Roles

        #region Role-Groups
        [HttpGet("RoleGroups")]
        public async Task<object> GetRoleGroups()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetGroupRole(model);
        }

        [HttpGet("RoleGroups/Details")]
        public async Task<object> GetDetailsRoleGroups()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetGroupRoleDetail(model);
        }

        [HttpPost("RoleGroups")]
        public async Task<object> CRUDRoleGroup([FromBody] Dictionary<string, object> data)
        {
            return await _userBusiness.CRUDRoleGroup(data);
        }

        #endregion Role-Groups

        [HttpGet("Permissions")]
        public async Task<object> GetAllPermission()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetPermissions(model);
        }


        [HttpGet("PermissionsAssign")]
        public async Task<object> GetPermissionByUser(Dictionary<string, object> values)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetPermissionByUser(model);
        }

        [HttpPost("PermissionsAssign")]
        public async Task<object> CRUDPermissionUser([FromBody] Dictionary<string, object> data)
        {
            return await _userBusiness.CRUDPermissionUser(data, HttpContext);
        }

        [HttpGet("FunctionsAssign")]
        public async Task<object> GetFunctionByUser(Dictionary<string, object> values)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetFunctionByUser(model);
        }

        [HttpGet("PermissionByListRole")]
        public async Task<object> GetPermissionByListRole(Dictionary<string, object> values)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _userBusiness.GetPermissionByListRole(model);
        }
    }
}
