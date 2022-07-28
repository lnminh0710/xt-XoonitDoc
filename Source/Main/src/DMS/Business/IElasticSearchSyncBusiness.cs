using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;
using DMS.Utils.ElasticSearch;

namespace DMS.Business
{
    /// <summary>
    /// IElasticSearchSyncBusiness
    /// </summary>
    public interface IElasticSearchSyncBusiness
    {
        /// <summary>
        /// SyncPersonToElasticSearch
        /// </summary>
        /// <param name="idPerson"></param>
        void SyncPersonToElasticSearch(string idPerson, string searchIndexKey);

        /// <summary>
        /// SyncPersonToElasticSearchByStartDate
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="searchIndexKey"></param>
        void SyncPersonToElasticSearchByStartDate(DateTime startDate, string searchIndexKey);

        /// <summary>
        /// SyncBusinessCostsToElasticSearch
        /// </summary>
        /// <param name="idBusinessCosts"></param>
        void SyncBusinessCostsToElasticSearch(string idBusinessCosts, string searchIndexKey = null);

        /// <summary>
        /// SyncBusinessCostsToElasticSearchByStartDate
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="searchIndexKey"></param>
        void SyncBusinessCostsToElasticSearchByStartDate(DateTime startDate, string searchIndexKey = null);

        /// <summary>
        /// SyncCampaignToElasticSearch
        /// </summary>
        /// <param name="idBusinessCosts"></param>
        void SyncCampaignToElasticSearch(string idSalesCampaignWizard, string searchIndexKey = null);

        /// <summary>
        /// SyncCampaignToElasticSearchByStartDate
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="searchIndexKey"></param>
        void SyncCampaignToElasticSearchByStartDate(DateTime startDate, string searchIndexKey = null);

        /// <summary>
        /// SyncArticleToElasticSearch
        /// </summary>
        void SyncArticleToElasticSearch(string idArticle, string searchIndexKey = null);

        /// <summary>
        /// SyncArticleToElasticSearchByStartDate
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="searchIndexKey"></param>
        void SyncArticleToElasticSearchByStartDate(DateTime startDate, string searchIndexKey = null);

        /// <summary>
        /// SyncToElasticSearch
        /// </summary>
        /// <param name="module"></param>
        void SyncToElasticSearch(GlobalModule module);

        /// <summary>
        /// SyncCustomerOrdersToElasticSearch
        /// </summary>
        /// <param name="idSalesOrder"></param>
        /// <param name="searchIndexKey"></param>
        void SyncCustomerOrdersToElasticSearch(string idSalesOrder, string searchIndexKey = null);

        /// <summary>
        /// SyncCustomerOrdersToElasticSearchByStartDate
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="searchIndexKey"></param>
        void SyncCustomerOrdersToElasticSearchByStartDate(DateTime startDate, string searchIndexKey = null);

        /// <summary>
        /// SyncNotificationToElasticSearch
        /// </summary>
        /// <param name="idNotification"></param>
        /// <param name="searchIndexKey"></param>
        void SyncNotificationToElasticSearch(string idNotification, string searchIndexKey = null);

        void SyncArchivedNotificationToElasticSearch(IEnumerable<EsArchivedNotification> listArchivedNotifications, string searchIndexKey = null);

        Task<ElasticSyncResultModel> SyncToElasticSearch(ElasticSyncModel model);
        Task<ElasticSyncResultModel> SyncToElasticSearch(string indexName, string spObject, object keyId);

        /// <summary>
        /// SyncDocumentOCRToElasticSearch
        /// </summary>
        /// <param name="idDocumentContainerOCR"></param>
        Task<string> SyncDocumentOCRToElasticSearch(string idDocScans, string searchIndexKey, string idRepDocumentGuiType);

        object DeleteFromElasticSearch(List<string> ids, string indexName);

        Task SyncESAfterSaveDocument(ElasticSyncSaveDocument model);
        Task SyncESAfterSyncCloud(ElasticSyncSaveDocument model);
        Task<string> SyncAttachmentsToElasticSearch(string IdPerson, string IdMainDocument);        
    }
}

