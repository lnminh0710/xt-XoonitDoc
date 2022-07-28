using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// UserProfileData
    /// </summary>
    public class UserProfileGetData : Data
    {
        /// <summary>
        /// IdPerson
        /// <summary>
        public string IdPerson { get; set; }
        public string IsSetDefaultRole { get; set; }        

        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    /// <summary>
    /// UserProfileData
    /// </summary>
    public class UserProfileData : Data
    {
        /// <summary>
        /// IdPerson
        /// <summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// IdAppUser
        /// <summary>
        public string IdAppUser { get; set; }

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
        public string DbserverIdLogin { get; set; }

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
        public string DbServerUpdate { get; set; }

        /// <summary>
        /// DbServerPassword
        /// <summary>
        public string DbServerPassword { get; set; }

        /// <summary>
        /// DbServerPasswordChangeDate
        /// <summary>
        public string DbServerPasswordChangeDate { get; set; }

        /// <summary>
        /// DbServerPasswordAddDayToExpiration
        /// <summary>
        public string DbServerPasswordAddDayToExpiration { get; set; }

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
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// IsBlocked
        /// <summary>
        public bool? IsBlocked { get; set; }


        /// <summary>
        /// IsDeleted
        /// <summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// CreateDate
        /// <summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// <summary>
        public string UpdateDate { get; set; }

        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class UserWidgetLayoutUpdateData : Data
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

    /// <summary>
    /// UserFunctionListGetData
    /// </summary>
    public class UserFunctionListGetData : Data
    {
        /// <summary>
        /// IdLoginRoles
        /// <summary>
        public string IdLoginRoles { get; set; }

        /// <summary>
        /// - 1: get all
        /// - 0: get by LoginId
        /// Default is 1
        /// </summary>
        public string IsAll { get; set; }
    }

    /// <summary>
    /// UserRolesUpdateData
    /// </summary>
    public class UserRolesUpdateData : Data
    {
        /// <summary>
        /// ListOfIdLogin
        /// <summary>
        public string ListOfIdLogin { get; set; }

        /// <summary>        
        /// ListOfIdLoginRoles
        /// </summary>
        public string ListOfIdLoginRoles { get; set; }
    }

    public class UserEmailGetData : Data
    {
        /// <summary>
        /// Email
        /// <summary>
        public string Email { get; set; }

       
    }
}
