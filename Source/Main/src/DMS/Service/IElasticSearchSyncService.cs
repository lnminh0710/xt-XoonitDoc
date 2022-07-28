using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Utils;
using DMS.Utils.ElasticSearch;

namespace DMS.Service
{
    /// <summary>
    /// IElasticSearchSyncService
    /// </summary>
    public interface IElasticSearchSyncService
    {
        /// <summary>
        /// GetPerson
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        Task<IList<EsPerson>> GetPerson(ElasticSyncData elasticSyncData);

        /// <summary>
        /// GetBusinessCosts
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<EsBusinessCost>> GetBusinessCosts(ElasticSyncData elasticSyncData);

        /// <summary>
        /// GetCampaign
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        Task<IList<EsCampaign>> GetCampaign(ElasticSyncData elasticSyncData);


        /// <summary>
        /// GetArticle
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        Task<IList<EsArticle>> GetArticle(ElasticSyncData elasticSyncData);

        /// <summary>
        /// GetCustomerOrders
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<EsSaleOrder>> GetCustomerOrders(ElasticSyncData data);

        /// <summary>
        /// GetData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<dynamic>> GetData(ElasticSyncData data);

        /// <summary>
        /// GetDocumentContainerOcr
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        Task<IList<EsDocumentOCR>> GetDocumentContainerOcr(ElasticSyncData elasticSyncData);
        Task<IList<EsAttachment>> GetAttachments(ElasticSyncData data);
    }    
}

