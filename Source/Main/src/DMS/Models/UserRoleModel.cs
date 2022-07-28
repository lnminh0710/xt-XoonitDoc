
using System.Collections.Generic;

namespace DMS.Models
{

    public class RoleModel
    {
        public string IdLoginRole { get; set; }
        public string RoleName { get; set; }

        public bool? IsActive { get; set; }
    }

    public class DetailRoleModel
    {
        public string IdLoginRole { get; set; }
        public List<UserInfo> Users { get; set; }
        public List<ModulePermissionModel> ModulePermissions { get; set; }
    }

    public class ModulePermissionModel
    {
        public string IdModule { get; set;}
        public string ModuleName { get; set;}
        public List<PermissionModel> Permissions { get; set;}
    }

    public class PermissionModel
    {
        public string IdPermission { get; set; }
        public string IdModule { get; set; }
        public string Permission { get; set; }
        public bool?  IsActive { get; set; }
    }


    public class RoleGroupModel
    {
        public string IdRoleGroup { get; set; }
        public string RoleGroupName { get; set; }
    }

    public class DetailRoleGroupModel
    {
        public string IdRoleGroup { get; set; }
        public List<RoleModel> Roles { get; set; }
        public List<UserInfo> Users { get; set; }
    }
}
