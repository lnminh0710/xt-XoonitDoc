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
    public class BlockOrdersController : BaseController
    {
        private readonly IBackOfficeBusiness _blockOrdersBusiness;

        public BlockOrdersController(IBackOfficeBusiness blockOrdersBusiness)
        {
            _blockOrdersBusiness = blockOrdersBusiness;
        }

        // GET: api/BlockOrders/GetTextTemplate
        [HttpGet]
        [Route("GetTextTemplate")]        
        public async Task<object> GetTextTemplate(int? idRepSalesOrderStatus)
        {
            return await _blockOrdersBusiness.GetBlockedOrderTextTemplate(idRepSalesOrderStatus);
        }

        // GET: api/BlockOrders/GetMailingListOfPlaceHolder
        [HttpGet]
        [Route("GetMailingListOfPlaceHolder")]
        public async Task<object> GetMailingListOfPlaceHolder()
        {
            return await _blockOrdersBusiness.GetMailingListOfPlaceHolder();
        }

        // POST: api/BlockOrders/SaveTextTemplate
        [HttpPost]
        [Route("SaveTextTemplate")]
        public async Task<object> SaveTextTemplate([FromBody]BlockOrdersModel model)
        {
            return await _blockOrdersBusiness.SaveTextTemplate(model);
        }
    }
}
