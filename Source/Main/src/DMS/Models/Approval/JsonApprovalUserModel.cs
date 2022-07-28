using System.Collections.Generic;
using System.Linq;

namespace DMS.Models.Approval
{
    public class JsonApprovalUserModel
    {
        public JsonApprovalUser JSONApprovalUser { get; set; }
    }

    public class JsonApprovalUser
    {
        public List<ApprovalUser> ApprovalUser { get; set; }

        public List<string> GetIdLogins()
        {
            if (ApprovalUser == null || ApprovalUser.Count == 0) return null;

            return ApprovalUser.First().GetIdLogins();
        }
    }

    public class ApprovalUser
    {
        public List<ApprovalGroup> Groups { get; set; }
        public List<ApprovalAddonUser> AddOnUser { get; set; }

        public List<string> GetIdLogins()
        {
            var ids = new List<string>();
            if (Groups != null && Groups.Count > 0)
            {
                var tempIds = Groups.SelectMany(n => n.AssignedUsers).Select(n => n.IdLogin);
                ids.AddRange(tempIds);
            }

            if (AddOnUser != null && AddOnUser.Count > 0)
            {
                var tempIds = AddOnUser.Select(n => n.IdLogin);
                ids.AddRange(tempIds);
            }
            ids = ids.Distinct().ToList();
            return ids;
        }
    }

    public class ApprovalGroup
    {
        //public int IdRepInvoiceApprovalGroup { get; set; }
        public List<ApprovalAssignedUser> AssignedUsers { get; set; }

        public ApprovalGroup()
        {
            AssignedUsers = new List<ApprovalAssignedUser>();
        }
    }

    public class ApprovalAssignedUser
    {
        //public object IdInvoiceApprovalPerson { get; set; }
        //public object IsDeleted { get; set; }
        public string IdLogin { get; set; }
    }

    public class ApprovalAddonUser : ApprovalAssignedUser
    {
    }

    public class ApprovalUserAutoReleased
    {
        public List<ConfirmInvoiceApprovalObj> ConfirmInvoiceApproval { get; set; }
    }
    public class ConfirmInvoiceApprovalObj
    {
        public string IdInvoiceApproval { get; set; }
        public string IdInvoiceMainApproval { get; set; }
        public string IdInvoiceApprovalPerson { get; set; }
        public string IsInvoiceReleased { get; set; }
        public string IsInvoiceRejected { get; set; }
        public string Notes { get; set; }
    }

    public class SaveApprovalUser
    {
        public string IdInvoiceMainApproval { get; set; }
        public string IdLogin { get; set; }
        public string Email { get; set; }
    }
}
