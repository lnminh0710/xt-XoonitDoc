//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using DMS.Service;
//using DMS.Models;
//using Microsoft.AspNetCore.Authorization;
//using DMS.Business;
//using Newtonsoft.Json;
//using DMS.Utils;
//using Newtonsoft.Json.Serialization;
//using System.Net;

//// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

//namespace DMS.Api
//{
//    [Route("api/[controller]")]
//    [Authorize]
//    public class CustomerController : BaseController
//    {
//        private readonly IPersonBusiness _customerItemBusiness;

//        public CustomerController(IPersonBusiness customerItemBusiness)
//        {
//            _customerItemBusiness = customerItemBusiness;
//        }

//        // GET: api/customer/CreateCustomer
//        [HttpGet]
//        [Route("GetCustomerById")]
//        public async Task<object> GetCustomerById(int idPerson)
//        {
//            return await _customerItemBusiness.GetCustomer(idPerson);
//        }

//        // GET: api/customer/CreateCustomer
//        [HttpPost]
//        [Route("CreateCustomer")]
//        public async Task<object> CreateCustomer([FromBody]CustomerEditModel customer)
//        {
//            return await _customerItemBusiness.CreateCustomer(customer);
//        }

//        // Post: api/customer/UpdateCustomer
//        [HttpPost]
//        [Route("UpdateCustomer")]
//        public async Task<object> UpdateCustomer([FromBody] DataUpdateModel dataUpdate)
//        {
//            return await _customerItemBusiness.UpdateCustomer(dataUpdate.Data);
//        }

//        [HttpPost]
//        [Route("SaveCustomer")]
//        public async Task<object> SaveCustomer([FromBody] SaveCustomerModel model)
//        {
//            return await _customerItemBusiness.SaveCustomer(model);
//        }
//    }
//}
