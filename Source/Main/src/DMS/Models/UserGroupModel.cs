
using System.Collections.Generic;

namespace DMS.Models
{

    public class GroupUserModel
    {

        public string IdGroupUser { get; set; }
        public string GroupName { get; set; }
    }

    public class DetailGroupUserModel
    {
        public string IdGroupUser { get; set; }
        public List<UserInfo> Users { get; set; }

    }
}
