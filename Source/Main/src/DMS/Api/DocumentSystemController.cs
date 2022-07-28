using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using DMS.Business;
using DMS.Models.DMS;
using DMS.Utils;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]


    public class DocumentSystemController : ControllerBase
    {
        private readonly IDocumentSystemBusiness _documentSystemBusiness;

        public DocumentSystemController(IDocumentSystemBusiness documentSystemBusiness)
        {
            _documentSystemBusiness = documentSystemBusiness;
        }

        [HttpPost]
        [Route("SaveModule")]
        public async Task<object> SaveModule([FromBody]List<DocumentSystemModule> models)
        {

            WSEditReturn result = await _documentSystemBusiness.SaveDocumentSystemModule(models);
            if (result != null && result.ReturnID != null && Int32.Parse(result.ReturnID) > 0)
            {

                return result;

            }

            return StatusCode(400, "SaveModule Error!"); ;
        }

        [HttpPost]
        [Route("SaveDocType")]
        public async Task<object> SaveDocType([FromBody]List<DocumentSystemDocType> models)
        {

            WSEditReturn result = await _documentSystemBusiness.SaveDocumentSystemDocumentType(models);
            if (result != null && result.ReturnID != null && Int32.Parse(result.ReturnID) > 0)
            {

                return result;

            }

            return StatusCode(400, "SaveDocType Error!"); ;
        }

        [HttpPost]
        [Route("SaveField")]
        public async Task<object> SaveField([FromBody]List<DocumentSystemField> models)
        {

            WSEditReturn result = await _documentSystemBusiness.SaveDocumentSystemField(models);
            if (result != null && result.ReturnID != null && Int32.Parse(result.ReturnID) > 0)
            {

                return result;

            }

            return StatusCode(400, "SaveField Error!"); ;
        }
        [HttpPost]
        [Route("AssignModule")]
        public async Task<object> AssignModule([FromBody]List<DocumentSystemContainer> models)
        {

            WSEditReturn result = await _documentSystemBusiness.SaveDocumentSystemContainer(models);
            if (result != null && result.ReturnID != null && Int32.Parse(result.ReturnID) > 0)
            {

                return result;

            }

            return StatusCode(400, "AssignModule Error!"); ;
        }
        [HttpGet]
        [Route("GetAllModules")]
        public async Task<object> GetAllModules(int? idRepDocumentType)
        {
            var result = await _documentSystemBusiness.GetAllModules(idRepDocumentType);
            return result != null ? JArray.FromObject(result) : new JArray();
        }
        [HttpGet]
        [Route("GetAllFields")]
        public async Task<object> GetAllFields(int? idRepTableModule)
        {
            var result = await _documentSystemBusiness.GetAllFields(idRepTableModule);
            return result != null ? JArray.FromObject(result) : new JArray();
        }
        [HttpGet]
        [Route("GetAllDoctypes")]
        public async Task<object> GetAllDoctypes()
        {
            var result = await _documentSystemBusiness.GetAllDoctypes();
            return result != null ? JArray.FromObject(result) : new JArray();
        }

    }
}
