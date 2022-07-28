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
    public class PersonController : BaseController
    {
        private readonly IPersonBusiness _personItemBusiness;

        public PersonController(IPersonBusiness personItemBusiness)
        {
            _personItemBusiness = personItemBusiness;
        }

        // GET: api/person/GetPersonById
        [HttpGet]
        [Route("GetPersonById")]
        public async Task<object> GetPersonById(int? idPerson)
        {
            var result = await _personItemBusiness.GetPerson(idPerson);
            return result;
        }

        // GET: api/customer/PreLoadBusinessLogic
        [HttpGet]
        [Route("PreLoadBusinessLogic")]
        public async Task<object> PreLoadBusinessLogic(string mediaCode)
        {
            return await _personItemBusiness.PreLoadBusinessLogic(mediaCode);
        }

        // POST: api/person/CreateCustomer
        [HttpPost]
        [Route("CreatePerson")]
        public async Task<object> CreatePerson([FromBody]PersonEditModel model, string searchIndexKey)
        {
            var result = _personItemBusiness.CreatePerson(model, searchIndexKey);

            return await result;
        }

        // POST: api/person/UpdatePerson
        [HttpPost]
        [Route("UpdatePerson")]
        public async Task<object> UpdatePerson([FromBody]PersonEditModel model, string searchIndexKey)
        {
            var result = _personItemBusiness.UpdatePerson(model, searchIndexKey);

            return await result;
        }

        // POST: api/person/CreatePaymentAccount
        [HttpPost]
        [Route("CreatePaymentAccount")]
        public async Task<object> CreatePaymentAccount([FromBody]PaymentEditModel model)
        {
            var result = _personItemBusiness.CreatePaymentAccount(model);

            return await result;
        }

        // GET: api/person/GetPaymentAccountById
        [HttpGet]
        [Route("GetPaymentAccountById")]
        public async Task<object> GetPaymentAccountById(string idCashProviderPaymentTerms)
        {
            var result = _personItemBusiness.LoadPaymentAccount(idCashProviderPaymentTerms);

            return await result;
        }

        // POST: api/person/CreateCCPRN
        [HttpPost]
        [Route("CreateCCPRN")]
        public async Task<object> CreateCCPRN([FromBody]CCPRNEditModel model)
        {
            var result = _personItemBusiness.CreateCCPRN(model);

            return await result;
        }

        // GET: api/person/GetCCPRN
        [HttpGet]
        [Route("GetCCPRN")]
        public async Task<object> GetCCPRN(string idCashProviderContract)
        {
            var result = _personItemBusiness.LoadCCPRN(idCashProviderContract);

            return await result;
        }

        // POST: api/person/CreateCostProvider
        [HttpPost]
        [Route("CreateCostProvider")]
        public async Task<object> CreateCostProvider([FromBody]CostProviderEditModel model)
        {
            var result = _personItemBusiness.CreateCostProvider(model);

            return await result;
        }

        // GET: api/person/LoadCommunication
        [HttpGet]
        [Route("LoadCommunication")]
        public async Task<object> LoadCommunication(int idPersonInterface)
        {
            var result = _personItemBusiness.LoadCommunication(idPersonInterface);

            return await result;
        }

        // GET: api/person/GetCustomerHistory
        [HttpGet]
        [Route("GetCustomerHistory")]
        public async Task<object> GetCustomerHistory(string idPerson, int? pageIndex, int? pageSize)
        {
            var result = await _personItemBusiness.GetCustomerHistory(idPerson, pageIndex, pageSize);
            return result;
        }

        // GET: api/person/GetMandatoryField
        [HttpGet]
        [Route("GetMandatoryField")]
        public async Task<object> GetMandatoryField(string mode)
        {
            var result = await _personItemBusiness.GetMandatoryField(mode);
            return result;
        }

        // GET: api/person/GetPersonData
        [HttpGet]
        [Route("GetPersonData")]
        public async Task<object> GetPersonData(string idPersons)
        {
            var result = await _personItemBusiness.GetPersonData(idPersons);
            return result;
        }

        [HttpPost]
        [Route("SaveCustomer")]
        public async Task<object> SaveCustomer([FromBody] SaveCustomerModel model)
        {
            return await _personItemBusiness.SaveCustomer(model);
        }
    }
}
