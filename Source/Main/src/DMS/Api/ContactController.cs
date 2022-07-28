using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    /// <summary>
    /// InvoiceController
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class ContactController : BaseController
    {
        private readonly IContactBusiness _contactBusiness;

        public ContactController(IContactBusiness contactBusiness)
        {
            _contactBusiness = contactBusiness;
        }

        [HttpPost]
        [Route("SaveContact")]
        public async Task<object> SaveContact([FromBody] ContactDetailModel model)
        {
            return await _contactBusiness.UpdateContact(model);
        }

        [HttpGet]
        [Route("DataSettingColumnsContact")]
        public async Task<object> GetDataSettingColumnsOfContact([FromQuery] DocumentContactQueryModel model)
        {
            var columns = await _contactBusiness.GetDataSettingColumnsOfContact(model);
            if (columns == null) return null;

            return columns.Where(col =>
            {
                
                return (col.Setting.DisplayField?.Hidden == "0" || col.Setting.DisplayField?.Hidden == "1") &&
                        col.Setting.DisplayField?.ReadOnly == "0" && col.Setting.DisplayField?.NeedForUpdate == "0";
            });
        }

        /// <summary>
        /// Get data setting columns of contact based on document type
        /// </summary>
        /// <param name="documentType"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("DataSettingColumnsContactOfDocumentType/{documentType}")]
        public async Task<object> GetDataSettingColumnsContactOfDocumentType(string documentType)
        {
            if (string.IsNullOrWhiteSpace(documentType))
            {
                return null;
            }


            var columns = await _contactBusiness.GetDataSettingColumnsContactOfDocumentType(documentType);
            if (columns == null) return null;

            return columns.Where(col =>
            {

                return (col.Setting.DisplayField.Hidden == "0" || col.Setting.DisplayField.Hidden == "1") &&
                        col.Setting.DisplayField.ReadOnly == "0";
            });
        }

        [HttpGet]
        [Route("DocumentCommunication")]
        public async Task<object> GetDocumentCommunication([FromQuery] DocumentCommunicationQueryModel model)
        {
            return await _contactBusiness.GetDocumentCommunication(model);
        }

        [HttpGet]
        [Route("ContactDetail/{idPersonType}/{idPerson}")]
        public async Task<object> GetContactDetail(int idPersonType, int idPerson)
        {
            return await _contactBusiness.GetMyContactDetail(idPerson, idPersonType);
        }

        [HttpGet]
        [Route("CheckAndGetCompanyList")]
        public async Task<object> CheckAndGetCompanyList(string companyName)
        {
            return await _contactBusiness.CheckAndGetCompanyList(companyName, null, "", "");
        }
    }
}
