using Newtonsoft.Json;
using System.Collections.Generic;

namespace DMS.Models
{
    /// <summary>
    /// User
    /// </summary>
    public class UserFromService : User
    {
        /// <summary>
        /// FullName
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// RMRead
        /// </summary>
        public string RMRead { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// ValidTo
        /// </summary>
        public string ValidTo { get; set; }

        /// <summary>
        /// MessageType
        /// </summary>
        public string MessageType { get; set; }

        /// <summary>
        /// LoginPicture
        /// </summary>
        public string LoginPicture { get; set; }

        /// <summary>
        /// UserGuid
        /// </summary>
        public string UserGuid { get; set; }

        /// <summary>
        /// IdCloudConnection
        /// </summary>
        public string IdCloudConnection { get; set; }
        /// <summary>
        /// Initials
        /// </summary>
        public string Initials { get; set; }

        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool? IsBlocked { get; set; }

        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool? IsLoginActived { get; set; }

        /// <summary>
        /// Encrypted from user role
        /// </summary>
        public string Encrypted { get; set; }

        public string InfoCloud { get; set; }

        public ActiveCloudOfUser ActiveCloud { get; set; }

        public string IdAppUser { get; set; }
        public string IdPerson { get; set; }
        public string Company { get; set; }

        public bool? IsSuperAdmin { get; set; }
        public bool? IsAdmin { get; set; }
        public string Roles { get; set; }
        public string AvatarDefault { get; set; }
    }

    /// <summary>
    /// User
    /// </summary>
    public class UserToken 
    {
        public string IdLogin { get; set; }
    }

    public class ActiveCloudOfUser
    {
        public string UserEmail { get; set; }
        public string ClientId { get; set; }
        public string CloudName { get; set; }
        public string ConnectionString { get; set; }
        public int IdCloudProviders { get; set; }

        public string ProviderName { get; set; }
    }

    public class LoginRole
    {
        public List<LoginRoleSignin> Roles { get; set; }
    }

    public class LoginRoleSignin
    {
        public string IdLoginRoles { get; set; }
        public string RoleName { get; set; }
        public string IdLogin { get; set; }
        public bool? IsSuperAdmin { get; set; }
        public bool? IsAdmin { get; set; }
    }
}
