using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;

namespace DMS.Business
{
    public interface IInvoiceApprovalBusiness
    {
        Task<object> GetHistoryApproval(Dictionary<string, object> values);

        #region Groups - Users
        Task<object> GetApprovalGroups(Dictionary<string, object> values);
        Task<object> GetApprovalGroupsUser(Dictionary<string, object> values);
        Task<object> GetApprovalGroupsAssignedUsers(Dictionary<string, object> values);
        Task<object> CRUDGroupApproval(Dictionary<string, object> values);
        #endregion

        #region Invoice
        Task<object> GetInvoiceItems(Dictionary<string, object> values);
        Task<object> GetInvoiceInformation(Dictionary<string, object> values);

        Task<object> GetInvoiceMainApproval(Dictionary<string, object> values);

        #endregion

        #region Suppliers
        Task<object> GetSearchSupplier(Dictionary<string, object> values);
        Task<object> GetSupplierDynamicForm(Dictionary<string, object> values);
        #endregion Suppliers

        #region Mandant
        Task<object> GetSearchMandant(Dictionary<string, object> values);
        Task<object> GetMandantOverview(Dictionary<string, object> values);
        Task<object> GetMandantDynamicForm(Dictionary<string, object> values);
        Task<object> CRUDMandant(Dictionary<string, object> data);
        #endregion Mandant

        #region Notes
        Task<object> GetNotes(Dictionary<string, object> values);
        Task<object> CRUDNotes(Dictionary<string, object> values);
        #endregion Notes

        #region Payment
        Task<object> GetPaymentInformation(Dictionary<string, object> values);
        Task<object> SearchDropdownTableInvoiceApproval(Dictionary<string, object> values, string objName);
        #endregion Payment

        #region CRUD Form
        Task<object> SaveProcessingForm(Dictionary<string, object> data, UserFromService userFromService = null);

        Task<object> SaveDynamicForm(Dictionary<string, object> data);
        #endregion

        Task<object> GetAIDataExtracted(Dictionary<string, object> values);
    }
}
