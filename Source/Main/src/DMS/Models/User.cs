using DMS.Constants;
using DMS.Utils;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DMS.Models
{
    /// <summary>
    /// User
    /// </summary>
    public class User
    {
        /// <summary>
        /// FirstName
        /// </summary>
        public string FirstName { get; set; }
        /// <summary>
        /// LastName
        /// </summary>
        public string LastName { get; set; }
        /// <summary>
        /// Email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// NewPassword
        /// </summary>
        public string NewPassword { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }
        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public string IdApplicationOwner { get; set; }
        /// <summary>
        /// DateTime
        /// </summary>
        public string CurrentDateTime { get; set; }
        public string PhoneNr { get; set; }
        public string DateOfBirth { get; set; }
        public string RoleName { get; set; }

        public string PasswordHash { get; set; }
        /// <summary>
        /// In hours
        /// </summary>
        public int AccessTokenExpire { get; set; }

        public string IdSharingCompany { get; set; }

        public string IsSuperAdmin { get; set; }
        public string IsAdmin { get; set; }

    }

    public class SignUpAccount
    {
        [Required]
        [RegularExpression(AuthenticateConstant.REGEX_EMAIL, ErrorMessage = AuthenticateConstant.REGEX_EMAIL_MES)]
        public string Email { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string IdRepLanguage { get; set; }
        public string Password { get; set; }
        public string PhoneNr { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string IdLoginRoles { get; set; }
        public string Initials { get; set; }
        public string Encrypted { get; set; }
        public bool IsBlocked { get; set; }
        public string IdPerson { get; set; }
        public string IdAppUser { get; set; }
        public string Company { get; set; }
        [Required]
        public string CurrentDateTime { get; set; }
    }

    public class NewAccount
    {
        [Required]
        [RegularExpression(AuthenticateConstant.REGEX_EMAIL, ErrorMessage = AuthenticateConstant.REGEX_EMAIL_MES)]
        public string Email { get; set; }
        public string LastName { get; set; }
        [Required]
        public string FirstName { get; set; }
        public string IdRepLanguage { get; set; }
        public string Password { get; set; }
        public string PhoneNr { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string IdLoginRoles { get; set; }
        public string Initials { get; set; }
        public string Encrypted { get; set; }
        public bool IsBlocked { get; set; }
        public string IdPerson { get; set; }
        public string IdAppUser { get; set; }
        public string Company { get; set; }
        [Required]
        public string CurrentDateTime { get; set; }
    }

    public class UserInfo
    {
        public string IdLogin { get; set; }
        public string IdApplicationOwner { get; set; }
        public string Email { get; set; }
        public DateTime EmailSent { get; set; }
        public string Company { get; set; }
        public string FullName { get; set; }
        public string Initials { get; set; }
        public bool? Active { get; set; }
        public bool IsLoginActived { get; set; }
        public string CurrentDateTime { get; set; }
        public bool SetActiveButton { get; set; }
        public string IdPerson { get; set; }
        public string Encrypted { get; set; }
    }

    /// <summary>
    /// Token
    /// </summary>
    public class Token
    {
        /// <summary>
        /// AccessToken
        /// </summary>
        public string AccessToken { get; set; }
    }

    /// <summary>
    /// CheckTokenResult
    /// </summary>
    public class CheckTokenResult
    {
        /// <summary>
        /// IsValid
        /// </summary>
        public bool IsValid { get; set; }
        public bool IsConfirmEmail { get; set; }
        public bool IsExpired { get; set; }
        public bool IsForgot { get; set; }
    }

    #region [For User Management]

    /// <summary>
    /// UserProfile
    /// </summary>
    public class UserSaving
    {
        /// <summary>
        /// UserProfile
        /// <summary>
        public UserProfile UserProfile { get; set; }

        /// <summary>
        /// UserRoles
        /// <summary>
        [IgnoreMap]
        public IList<UserRole> UserRoles { get; set; }
    }

    /// <summary>
    /// UserProfile
    /// </summary>
    public class UserRole
    {
        /// <summary>
        /// UserRoleId
        /// <summary>
        public int? UserRoleId { get; set; }

        /// <summary>
        /// RoleId
        /// <summary>
        public int? RoleId { get; set; }

        /// <summary>
        /// IsDeleted
        /// <summary>
        public bool? IsDeleted { get; set; }
    }

    /// <summary>
    /// UserProfile
    /// </summary>
    public class UserProfile
    {
        /// <summary>
        /// IdLogin
        /// <summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// IdAppUser
        /// <summary>
        public int? IdAppUser { get; set; }

        /// <summary>
        /// LoginName
        /// <summary>
        public string LoginName { get; set; }

        /// <summary>
        /// Password
        /// <summary>
        public string Password { get; set; }

        /// <summary>
        /// NickName
        /// <summary>
        public string NickName { get; set; }

        /// <summary>
        /// FullName
        /// <summary>
        public string FullName { get; set; }

        /// <summary>
        /// LastName
        /// <summary>
        public string LastName { get; set; }

        /// <summary>
        /// FirstName
        /// <summary>
        public string FirstName { get; set; }

        /// <summary>
        /// DateOfBirth
        /// <summary>
        public string DateOfBirth { get; set; }

        /// <summary>
        /// LoginPicture
        /// <summary>
        public string LoginPicture { get; set; }

        /// <summary>
        /// DbserverIdLogin
        /// <summary>
        public int? DbserverIdLogin { get; set; }

        /// <summary>
        /// DbServerLoginName
        /// <summary>
        public string DbServerLoginName { get; set; }

        /// <summary>
        /// DbServerSidString
        /// <summary>
        public string DbServerSidString { get; set; }

        /// <summary>
        /// DbServerUpdate
        /// <summary>
        public DateTime? DbServerUpdate { get; set; }

        /// <summary>
        /// DbServerPassword
        /// <summary>
        public string DbServerPassword { get; set; }

        /// <summary>
        /// DbServerPasswordChangeDate
        /// <summary>
        public DateTime? DbServerPasswordChangeDate { get; set; }

        /// <summary>
        /// DbServerPasswordAddDayToExpiration
        /// <summary>
        public int? DbServerPasswordAddDayToExpiration { get; set; }

        /// <summary>
        /// ValidFrom
        /// <summary>
        public string ValidFrom { get; set; }

        /// <summary>
        /// ValidTo
        /// <summary>
        public string ValidTo { get; set; }

        /// <summary>
        /// Email
        /// <summary>
        public string Email { get; set; }

        /// <summary>
        /// IsBlocked
        /// <summary>
        public bool? IsBlocked { get; set; }

        /// <summary>
        /// IsDeleted
        /// <summary>
        public bool? IsDeleted { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// CreateDate
        /// <summary>
        public DateTime? CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// <summary>
        public DateTime? UpdateDate { get; set; }
    }

    public class UserRoleUpdate
    {
        /// <summary>
        /// IdLoginRolesLoginGw
        /// <summary>
        public string IdLoginRolesLoginGw { get; set; }

        /// <summary>
        /// IdLoginRoles
        /// <summary>
        public string IdLoginRoles { get; set; }

        /// <summary>
        /// IsBlocked
        /// <summary>
        public bool? IsBlocked { get; set; }

        /// <summary>
        /// IsDefault
        /// <summary>
        public bool? IsDefault { get; set; }

        /// <summary>
        /// IdLogin
        /// <summary>
        public int? IdLogin { get; set; }
    }

    public class UserRoleUpdateModel
    {
        public string IsSetDefaultRole { get; set; }
        public IList<UserRoleUpdate> Roles { get; set; }

        public UserRoleUpdateModel()
        {
            Roles = new List<UserRoleUpdate>();
        }
    }

    public class UserWidgetLayoutUpdate
    {
        /// <summary>
        /// IdMember
        /// <summary>
        public string IdMember { get; set; }

        /// <summary>
        /// ObjectNr
        /// <summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// IsResetDefault: 0, 1
        /// <summary>
        public string IsResetDefault { get; set; }
    }
    #endregion

    public class UserProfileDetail
    {
        public string Email { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string IdRepLanguage { get; set; }
        public string Password { get; set; }
        public string PhoneNr { get; set; }
        public string DateOfBirth { get; set; }
        public string IdLoginRoles { get; set; }
        public string Initials { get; set; }
        public string Encrypted { get; set; }
        public bool? IsBlocked { get; set; }
        public bool? IsLoginActived { get; set; }
        public string IdPerson { get; set; }
        public string IdAppUser { get; set; }
        public string CurrentDateTime { get; set; }
        public bool? IsDeleted { get; set; }
        public string IdApplicationOwner { get; set; }
        public string Company { get; set; }
        public string IdLogin { get; set; }
    }

    public class HashData
    {
        public string Text { get; set; }
    }

    public class ResetPassUser
    {
        public int IdLogin { get; set; }
        public int IdPerson { get; set; }
        public bool IsAutoGenerate { get; set; }
        public string NewPassword { get; set; }
    }
}
