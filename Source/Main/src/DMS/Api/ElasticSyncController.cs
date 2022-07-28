using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ElasticSyncController : ControllerBase
    {
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;

        public ElasticSyncController(IElasticSearchSyncBusiness elasticSearchSyncBusiness)
        {
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
        }

        [HttpGet]
        [Route("SyncToElasticSearch")]
        [AllowAnonymous]
        public async Task<object> SyncDocOCR(string indexName, string keyId, string idPerson)
        {
            if (string.IsNullOrEmpty(indexName))
            {
                return StatusCode(400, "indexName is Empty");
            }
            ElasticSyncResultModel result = null;
            if (indexName.ToLower() == ElasticSearchIndexName.Attachments.ToLower())
            {
                await _elasticSearchSyncBusiness.SyncAttachmentsToElasticSearch(idPerson, keyId);
            }
            else
            {
                ElasticSearchModule elasticSearchModule = ElasticSearchModuleData.GetModule(indexName);
                if (elasticSearchModule == null)
                {
                    return StatusCode(400, "indexName is Wrong");
                }
                result = await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    ModuleType = elasticSearchModule.ModuleType,
                    KeyId = keyId
                });
            }
            return Ok(new
            {
                Result = result
            });
        }

        [HttpGet]
        [Route("SyncDocOCR")]
        public async Task<object> SyncDocOCR(int? idDocScan, string idRepDocumentGuiType)
        {

            string exception = await _elasticSearchSyncBusiness.SyncDocumentOCRToElasticSearch(idDocScan != null ? idDocScan.ToString() : null, "document", idRepDocumentGuiType);
            if (!string.IsNullOrEmpty(exception))
            {
                return StatusCode(400, exception);
            }

            return "success";
        }

    }
}
