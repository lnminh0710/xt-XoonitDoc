using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Utils;
using DMS.Utils.ElasticSearch;

namespace DMS.Service
{
    /// <summary>
    /// ElasticSearchSyncService
    /// </summary>
    public class ElasticSearchSyncService : BaseUniqueServiceRequest, IElasticSearchSyncService
    {
        public ElasticSearchSyncService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        /// <summary>
        /// GetCustomerOrders
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<IList<EsSaleOrder>> GetCustomerOrders(ElasticSyncData data)
        {
            data.MethodName = "GetData";
            data.Object = "CustomerOrders";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsSaleOrder>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetBusinessCosts
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        public async Task<IList<EsBusinessCost>> GetBusinessCosts(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "BusinessCostsSearch";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsBusinessCost>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetCampaign
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        public async Task<IList<EsCampaign>> GetCampaign(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "CampaignSearch";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsCampaign>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetArticle
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        public async Task<IList<EsArticle>> GetArticle(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "ArticleSearch";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsArticle>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetPerson
        /// </summary>
        /// <param name="elasticSyncData"></param>
        /// <returns></returns>
        public async Task<IList<EsPerson>> GetPerson(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "PersonSearch";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsPerson>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<IEnumerable<dynamic>> GetData(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response != null && response.Count > 0)
            {
                var listT = ConverterUtils.ToDynamicEnumerable((JArray)response[0]);
                return listT;
            }
            return null;
        }

        public async Task<IList<EsDocumentOCR>> GetDocumentContainerOcr(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "DocumentContainerOCRSearch";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<EsDocumentOCR>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }
        public async Task<IList<EsAttachment>> GetAttachments(ElasticSyncData data)
        {
            data.MethodName = "SpSyncElasticSearch_GetData";
            data.Object = "Attachements";
            data.Mode = "GetData";
            BodyRequest bodyRquest = CreateBodyRequest(data);
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    try { 
                    //string json = array[0].ToString().Replace("{}", "").Replace("\"[{ ", "[{").Replace("}]\"", "}]");
                        string jsonStr = array[0].ToString();
                       
                        jsonStr = jsonStr.Replace("{}", "").Replace("\"[", "[").Replace("]\"", "]").Replace("\\\"", "\"").Replace("\r\n", "");
                        var listT = JsonConvert.DeserializeObject<List<EsAttachment>>(jsonStr);

                        return listT;
                    }catch(Exception )
                    {
                        return null;
                    }
                }
            }
            return null;
        }
    }
}
