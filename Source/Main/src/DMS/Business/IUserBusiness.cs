using DMS.Models;
using DMSWeb.Models.DMS.ViewModels;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IUserBusiness
    {
        /// <summary>
        /// GetUserById
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<object> GetUserById(string idPerson, bool isMobile = false);

        /// <summary>
        /// ListUserRoleByUserId
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<object> ListUserRoleByUserId(string userId);

        /// <summary>
        /// ListUserRoleInclueUserId
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<object> ListUserRoleInclueUserId(int? idPerson);

        /// <summary>
        /// GetAllUserRole
        /// </summary>
        /// <returns></returns>
        Task<object> GetAllUserRole();

        /// <summary>
        /// CheckExistUserByField
        /// </summary>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <returns></returns>
        Task<object> CheckExistUserByField(string fieldName, string fieldValue);

        /// <summary>
        /// SaveUserProfile
        /// </summary>
        /// <param name="model"></param>
        /// <param name="domain"></param>
        /// <returns></returns>
        Task<object> SaveUserProfile(UserSaving model, HttpContext context, string domain);

        /// <summary>
        /// SaveRoleForUser
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveRoleForUser(IList<UserRoleUpdate> model, HttpContext context, string isSetDefaultRole = null);

        /// <summary>
        /// SaveUserWidgetLayout
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveUserWidgetLayout(UserWidgetLayoutUpdate model, HttpContext context);

        /// <summary>
        /// GetUserFunctionList
        /// </summary>
        /// <param name="idLoginRoles"></param>
        /// <returns></returns>
        Task<object> GetUserFunctionList(string idLoginRoles);

        /// <summary>
        /// AssignRoleToMultipleUser
        /// </summary>
        /// <param name="idLogins"></param>
        /// <param name="idLoginRoles"></param>
        /// <returns></returns>
        Task<object> AssignRoleToMultipleUser(string idLogins, string idLoginRoles);

        /// <summary>
        /// GetUserByEmail
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        Task<object> GetUserByEmail(string email);


        Task<object> GetCompanyNameFromIdLogin(string IdLogin);

        /// <summary>
        /// UpdateAvatar
        /// </summary>
        /// <param name="avatarName"></param>
        /// <returns></returns>
        Task<object> UpdateAvatar(IFormFileCollection file, HttpContext context);

        /// <summary>
        /// RemoveAvatar
        /// </summary>
        /// <returns></returns>
        Task<dynamic> RemoveAvatar(string loginPicture = "", bool isUpdatedDb = true);
        /// <summary>
        /// GetUserByIdLogin
        /// </summary>
        /// <returns></returns>
        Task<dynamic> GetUsersByIdLogin(UserFilterViewModel userFilterViewModel);

        /// <summary>
        /// GetOptionsListFilter
        /// </summary>
        /// <returns></returns>
        Task<dynamic> GetFilterOptionsUser();


        /// <summary>
        /// Get Company List
        /// </summary>
        /// <returns></returns>
        Task<dynamic> GetCompanyList();

        Task<object> UpdateProfile(UserProfileDetail model);

        Task<object> UpdateProfileOtherUser(UserProfileDetail model, HttpContext context);

        /// <summary>
        /// Update Firebase Group Token
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> UpdateFirebaseGroupToken(Dictionary<string, object> data);

        /// <summary>
        /// Get Users Firebase Group Token
        /// </summary>
        /// <returns></returns>
        Task<List<UserLoginInfo>> GetUsersFireBaseGroupToken();

        Task<object> GetAllUsers();

        Task<object> GetGroupRole(Dictionary<string, object> values);
        Task<object> GetGroupRoleDetail(Dictionary<string, object> values);

        Task<object> GetRoles(Dictionary<string, object> values);
        Task<object> GetRoleDetail(Dictionary<string, object> values);

        Task<object> GetPermissions(Dictionary<string, object> values);

        Task<object> GetUserGroups(Dictionary<string, object> values);
        Task<object> GetUserGroupDetail(Dictionary<string, object> values);

        Task<object> CRUDUserGroup(Dictionary<string, object> data);
        Task<object> CRUDRole(Dictionary<string, object> data);
        Task<object> CRUDRoleGroup(Dictionary<string, object> data);

        Task<object> GetPermissionByUser(Dictionary<string, object> values);
        Task<object> CRUDPermissionUser(Dictionary<string, object> data, HttpContext context);

        Task<object> GetFunctionByUser(Dictionary<string, object> values);

        Task<object> GetAllUserAndGroup(Dictionary<string, object> values);

        Task<object> GetPermissionByListRole(Dictionary<string, object> values);
    }
}

