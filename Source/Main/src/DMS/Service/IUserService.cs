using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IUserService
    {
        /// <summary>
        /// GetUserById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetUserById(UserProfileGetData data);

        /// <summary>
        /// ListUserRoleByUserId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> ListUserRoleByUserId(UserProfileGetData data);

        /// <summary>
        /// GetAllUserRole
        /// </summary>
        /// <returns></returns>
        Task<object> GetAllUserRole(UserProfileGetData data);

        /// <summary>
        /// ListUserRoleInclueUserId
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> ListUserRoleInclueUserId(UserProfileGetData data);

        /// <summary>
        /// UserProfileData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> CheckExistUserByField(UserProfileData data);

        /// <summary>
        /// SaveUserProfile
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveUserProfile(UserProfileData data);

        /// <summary>
        /// SaveRoleForUser
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveRoleForUser(UserProfileGetData data);

        /// <summary>
        /// SaveRoleForUser
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> SaveUserWidgetLayout(UserWidgetLayoutUpdateData data);

        /// <summary>
        /// GetUserFunctionList
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetUserFunctionList(UserFunctionListGetData data);

        /// <summary>
        /// AssignRoleToMultipleUser
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> AssignRoleToMultipleUser(UserRolesUpdateData data);

        /// <summary>
        /// GetUserByEmail
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetUserByEmail(UserEmailGetData data);

        Task<object> GetCompanyNameFromIdLogin(Data data);
        /// <summary>
        /// UpdateAvatar
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSAvatarReturnValue> UpdateAvatar(LoginData data);

        Task<UserFromService> GetDetailUserByIdOrEmail(string idLogin, string email);

        Task<WSEditReturn> UpdateProfileUser(UserProfileDetail signUpAccount, string idApplicationOwner, string idLoginCurrentUser);
    }
}

