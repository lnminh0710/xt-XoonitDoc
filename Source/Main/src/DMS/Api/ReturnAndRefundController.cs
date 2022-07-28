using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Service;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using Newtonsoft.Json;
using DMS.Utils;
using Newtonsoft.Json.Serialization;
using System.Net;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class ReturnAndRefundController : BaseController
    {
        private readonly IBackOfficeBusiness _returnAndRefundBusiness;

        public ReturnAndRefundController(IBackOfficeBusiness returnAndRefundBusiness)
        {
            _returnAndRefundBusiness = returnAndRefundBusiness;
        }

        // GET: api/ReturnAndRefund/GetWidgetInfoByIds
        [HttpGet]
        [Route("GetWidgetInfoByIds")]
        public async Task<object> GetWidgetInfoByIds(string personNr, string invoiceNr, string mediaCode)
        {
            var result = _returnAndRefundBusiness.GetWidgetInfoByIds(personNr, invoiceNr, mediaCode);

            return await result;

        }

        // POST: api/ReturnAndRefund/SaveWidgetData
        [HttpPost]
        [Route("SaveWidgetData")]
        public async Task<object> SaveWidgetData([FromBody]ReturnRefundSaveModel model)
        {
            var result = _returnAndRefundBusiness.SaveWidgetData(model);
           
            return await result;

        }

        // POST: api/ReturnAndRefund/SaveUnblockOrder
        [HttpPost]
        [Route("SaveUnblockOrder")]
        public async Task<object> SaveUnblockOrder(string idSalesOrder, bool? isDeleted)
        {
            var result = _returnAndRefundBusiness.SaveUnblockOrder(idSalesOrder, isDeleted);
            
            return await result;

        }
    }
}
