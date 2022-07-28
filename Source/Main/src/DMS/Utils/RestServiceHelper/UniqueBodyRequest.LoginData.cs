using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// LoginData
    /// </summary>
    public class LoginData : Data
    {
        /// <summary>
        /// Password
        /// </summary>
        public string Password { get; set; }
        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool? IsLoginActived { get; set; }
        /// <summary>
        /// IsBlocked
        /// </summary>
        public string LoginPicture { get; set; }
        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool? IsBlocked { get; set; }
    }
    public class ListUserData : LoginData
    {
        public string IdPerson { get; set; }
        public string IdLoginFilter { get; set; }
        public string UserEmail { get; set; }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
    }
    public class TotalRecordsData
    {
        public int TotalRecords { get; set; }
    }
}
