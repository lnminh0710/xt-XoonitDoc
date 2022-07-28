using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DMS.Utils;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class InvoiceApprovalController : BaseController
    {
        private readonly IInvoiceApprovalBusiness _invoiceApprovalBusiness;

        public InvoiceApprovalController(IInvoiceApprovalBusiness invoiceApprovalBusiness)
        {
            _invoiceApprovalBusiness = invoiceApprovalBusiness;
        }

        [HttpGet]
        [Route("History")]
        public async Task<object> GetHistoryApproval()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetHistoryApproval(model);
        }

        #region Groups - Users
        [HttpGet]
        [Route("ApprovalGroups")]
        public async Task<object> GetApprovalGroups()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetApprovalGroups(model);
        }

        [HttpGet]
        [Route("ApprovalGroupsUser")]
        public async Task<object> GetApprovalGroupsUser()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetApprovalGroupsUser(model);
        }

        [HttpGet]
        [Route("GroupsAssignedUsers")]
        public async Task<object> GetApprovalGroupsAssignedUsers()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetApprovalGroupsAssignedUsers(model);
        }

        [HttpPost]
        [Route("ApprovalGroups")]
        public async Task<object> CRUDGroupApproval([FromBody] Dictionary<string, object> data)
        {
            return await _invoiceApprovalBusiness.CRUDGroupApproval(data);
        }
        #endregion Groups - Users

        #region Invoice
        [HttpGet]
        [Route("InvoiceItems")]
        public async Task<object> GetInvoiceItems()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetInvoiceItems(model);
        }

        [HttpGet]
        [Route("InvoiceInformation")]
        public async Task<object> GetInvoiceInformation()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetInvoiceInformation(model);
        }

        [HttpGet]
        [Route("InvoiceMainApproval")]
        public async Task<object> GetInvoiceMainApproval()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetInvoiceMainApproval(model);
        }

        #endregion Invoice

        #region Suppliers
        [HttpGet]
        [Route("SearchSupplier")]
        public async Task<object> GetSearchSupplierByCompanyName()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetSearchSupplier(model);
        }

        [HttpGet]
        [Route("SupplierForm")]
        public async Task<object> GetSupplierDynamicForm()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetSupplierDynamicForm(model);
        }


        #endregion Suppliers

        #region Mandant
        [HttpGet]
        [Route("SearchMandant")]
        public async Task<object> GetSearchMandantByName()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetSearchMandant(model);
        }

        [HttpGet]
        [Route("MandantOverview")]
        public async Task<object> GetMandantOverview()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetMandantOverview(model);
        }

        [HttpGet]
        [Route("MandantForm")]
        public async Task<object> GetMandantDynamicForm()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetMandantDynamicForm(model);
        }

        [HttpPost]
        [Route("Mandant")]
        public async Task<object> CRUDMandant([FromBody] Dictionary<string, object> data)
        {
            return await _invoiceApprovalBusiness.CRUDMandant(data);
        }

        #endregion Mandant

        #region Notes
        [HttpGet]
        [Route("Notes")]
        public async Task<object> GetNotes()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetNotes(model);
        }

        [HttpPost]
        [Route("Notes")]
        public async Task<object> CRUDNotes([FromBody] Dictionary<string, object> data)
        {
            return await _invoiceApprovalBusiness.CRUDNotes(data);
        }
        #endregion Notes

        #region Payment
        [HttpGet]
        [Route("PaymentInformation")]
        public async Task<object> GetPaymentInformation()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetPaymentInformation(model);
        }

        [HttpGet]
        [Route("SearchBookingInfo")]
        public async Task<object> SearchBookingInfo()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.SearchDropdownTableInvoiceApproval(model, "GetBookingInfo");
        }
        [HttpGet]
        [Route("SearchCostCentre")]
        public async Task<object> SearchCostCentre()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.SearchDropdownTableInvoiceApproval(model, "GetCostCentre");
        }
        [HttpGet]
        [Route("SearchCostType")]
        public async Task<object> SearchCostType()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.SearchDropdownTableInvoiceApproval(model, "GetCostType");
        }
        [HttpGet]
        [Route("SearchProjectNumber")]
        public async Task<object> SearchProjectNumber()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.SearchDropdownTableInvoiceApproval(model, "GetProjectNumber");
        }
        #endregion Payment

        #region CRUD Form
        [HttpPost]
        [Route("SaveProcessingForm")]
        public async Task<object> SaveProcessingForm([FromBody] Dictionary<string, object> data)
        {
            return await _invoiceApprovalBusiness.SaveProcessingForm(data);
        }

        [HttpPost]
        [Route("SaveDynamicForm")]
        public async Task<object> SaveDynamicForm([FromBody] Dictionary<string, object> data)
        {
            return await _invoiceApprovalBusiness.SaveDynamicForm(data);
        }

        #endregion

        [HttpGet]
        [Route("AIDataExtracted")]
        public async Task<object> GetAIDataExtracted()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _invoiceApprovalBusiness.GetAIDataExtracted(model);
        }
    }
}
