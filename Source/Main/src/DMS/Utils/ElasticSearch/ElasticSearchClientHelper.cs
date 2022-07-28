using System;
using System.Collections.Generic;
using System.Linq;
using Nest;
using Newtonsoft.Json.Linq;
using DMS.Models;
using System.IO;
using System.Globalization;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// IElasticSearchClientHelper
    /// </summary>
    public interface IElasticSearchClientHelper
    {
        void CreateClient<T>(string defaultIndexName = "", string typeName = "", bool isAutoMap = false) where T : class;
        ElasticClient GetElasticClient();

        #region Insert/Update/Delete
        bool Index<T>(T t) where T : class;

        bool Update<TDocument, TPartialDocument>(TPartialDocument tPartialDocument, long id)
            where TDocument : class
            where TPartialDocument : class;

        BulkResponse IndexAll<T>(IEnumerable<T> collection, bool isBulkAll = false) where T : class;

        void DeleteIndexIfExists(string indexName);
        DeleteResponse Delete(string indexName, string id);

        BulkResponse Delete(string indexName, List<string> ids);
        object DeleteIndex(string indexes, string idApplicationOwner);
        #endregion

        EsSearchResult<T> SearchAny<T>(string keyword, int page, int pageSize, IList<ESSearchFieldBasic> fields = null, bool isWithKeywords = false, string searchWithStarPattern = null,
            bool isGetCustomerById = false, bool onlySearchCampaign = false, string[] sourceFields = null) where T : class;

        EsSearchResult<T> SearchByField<T>(string field, string keyword, int page, int pageSize, IList<ESSearchFieldBasic> fields = null, ESQueryType? queryType = null, string[] sourceFields = null) where T : class;

        EsSearchResult<T> SearchAnyByCondition<T>(ESSearchCondition condition, int page, int pageSize) where T : class;
        EsSearchResult<T> SearchAnyByCondition<T>(ESSearchConditionGroup conditionGroup, int page, int pageSize) where T : class;
        EsSearchResult<T> SearchAnyByCondition<T>(ESSearchConditionRootGroups rootGroups, int page, int pageSize) where T : class;

        IList<IndexSearchSummary> GetIndexSummary(string indexList, string keyword, IList<ESSearchFieldBasic> fields = null, bool isWithKeywords = false, string searchWithStarPattern = null);

        string IdApplicationOwner { get; set; }
        string EsUri { get; set; }
        string EsConfigFolder { get; set; }
        string WebRootPath { get; set; }

        string BuildKeywordWithPattern(string keyword, string searchWithStarPattern);
    }

    /// <summary>
    /// ElasticSearchClientHelper
    /// </summary>
    public class ElasticSearchClientHelper : IElasticSearchClientHelper
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "ES");
        public static List<string> ESIgnoredFields = new List<string>();
        private string _filedNameIdApplicationOwner = "idApplicationOwner";

        #region Properties

        /// <summary>
        /// Current instantiated client
        /// </summary>
        public ElasticClient ElasticClient { get; set; }

        protected string IndexName { get; set; }
        protected string TypeName { get; set; }
        /// <summary>
        /// Host
        /// </summary>
        public string EsUri { get; set; }
        public string EsConfigFolder { get; set; }
        public string WebRootPath { get; set; }
        public bool EnableLogES { get; set; }
        public string IdApplicationOwner { get; set; }

        public ILogger<ElasticSearchClientHelper> Log { get; set; }
        #endregion

        public ElasticSearchClientHelper()
        {
        }

        public ElasticSearchClientHelper(bool enableLogES)
        {
            EnableLogES = enableLogES;
        }

        public ElasticSearchClientHelper(ILogger<ElasticSearchClientHelper> log, bool enableLogES)
        {
            Log = log;
            EnableLogES = enableLogES;
        }

        public void CreateClient<T>(string defaultIndexName = "", string typeName = "", bool isAutoMap = false) where T : class
        {
            IndexName = defaultIndexName;
            TypeName = typeName;
            var node = new Uri(EsUri);
            var settings = new ConnectionSettings(node);
            settings.DisableDirectStreaming(true);

            if (!string.IsNullOrWhiteSpace(IndexName))
            {
                settings.DefaultIndex(IndexName);
            }
            ElasticClient = new ElasticClient(settings);

            if (isAutoMap && !string.IsNullOrWhiteSpace(IndexName))
            {
                ElasticClient.Map<T>(m => m.AutoMap());
            }

            if (EnableLogES)// && Log != null
            {
                settings.OnRequestCompleted(call =>
                {
                    if (call.RequestBodyInBytes != null)
                    {
                        var log = System.Text.Encoding.UTF8.GetString(call.RequestBodyInBytes);
                        _logger.Info(log);
                    }
                });
            }
        }

        private void CreateDefaultClient()
        {
            if (ElasticClient == null)
            {
                var node = new Uri(EsUri);
                var settings = new ConnectionSettings(node);
                ElasticClient = new ElasticClient(settings);
            }
        }

        public ElasticClient GetElasticClient()
        {
            return ElasticClient;
        }

        #region Insert/Update/Delete
        /// <summary>
        /// Index
        /// </summary>
        /// <returns></returns>
        public bool Index<T>(T t) where T : class
        {
            var response = ElasticClient.IndexDocument(t);
            if (response.IsValid == false && response.ServerError != null)
                throw new Exception(response.ServerError.Error.Reason);

            return true;
        }

        /// <summary>
        /// Update
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="updateDoc"></param>
        /// <returns></returns>
        public bool Update<T>(T updateDoc) where T : class
        {
            var task = ElasticClient.Update<T>(
                    new DocumentPath<T>(updateDoc), u =>
                        u.Index(IndexName).Doc(updateDoc));
            return task.IsValid;
        }

        public bool Update<TDocument, TPartialDocument>(TPartialDocument tPartialDocument, long id)
            where TDocument : class
            where TPartialDocument : class
        {
            var updateResponse = ElasticClient.Update<TDocument, TPartialDocument>(new DocumentPath<TDocument>(id),
                                                    u => u.Index(IndexName)
                                                          .Doc(tPartialDocument)
                                                          .RetryOnConflict(3)
                                                  //.Refresh()
                                                  );
            return true;
        }

        /// <summary>
        /// Index
        /// </summary>
        /// <returns></returns>
        public BulkResponse IndexAll<T>(IEnumerable<T> collection, bool isBulkAll = false) where T : class
        {
            if (!isBulkAll)
            {
                var bulkResponse = ElasticClient.Bulk(s => s.IndexMany(collection,
                                            (bulkDescriptor, record) =>
                                             bulkDescriptor.Index(IndexName).Document(record).Id(((IDictionary<string, object>)record)["id"].ToString())));
                return bulkResponse;
            }

            //var waitHandle = new CountdownEvent(1);
            var results = collection.ToList();
            if (results.Count == 0) return null;

            var bulkAll = ElasticClient.BulkAll(results, b => b
                .Index(IndexName)
                .BackOffRetries(5)
                .BackOffTime("5s")
                .RefreshOnCompleted(true)
                .MaxDegreeOfParallelism(4)
                .Size(1000));

            bulkAll.Subscribe(new BulkAllObserver(
                onNext: (b) =>
                {
                },
                onError: (e) =>
                {
                    throw e;
                },
                onCompleted: () =>
                {
                }
            ));

            // waitHandle.Wait();
            return null;
        }
        #endregion

        #region SearchAny
        /// <summary>
        /// Search Any
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="keyword"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="fields"></param>
        /// <param name="isWithKeywords"></param>
        /// <param name="searchWithStarPattern"></param>
        /// <param name="isGetCustomerById"></param>
        /// <returns></returns>
        public EsSearchResult<T> SearchAny<T>(string keyword, int page, int pageSize,
            IList<ESSearchFieldBasic> fields = null, bool isWithKeywords = false, string searchWithStarPattern = null,
            bool isGetCustomerById = false, bool onlySearchCampaign = false, string[] sourceFields = null) where T : class
        {
            LogMessage($"* SearchAny: {IndexName}");

            var from = GetPageIndex(page, pageSize);
            if (keyword == "*")
            {
                isWithKeywords = false;
            }
            keyword = (keyword + string.Empty).Trim();

            SearchDescriptor<T> query = null;
            BoolQueryDescriptor<T> boolQueryDescriptor = BuildCommonBoolQueryDescriptor<T>(fields);

            //Search by keywords
            if (isWithKeywords)
            {
                BoolQueryDescriptor<T> boolQueryDescriptorKeyword = BuildBoolQueryDescriptorWithKeyword<T>(IndexName, keyword, searchWithStarPattern);
                boolQueryDescriptor = boolQueryDescriptor.Must(m => m.Bool(b => boolQueryDescriptorKeyword));
            }
            else
            {
                QueryContainer queryContainer = new QueryContainerDescriptor<T>().QueryString(q => q.Query(keyword));
                BoolQueryDescriptor<T> boolQueryDescriptorMust = BuildBoolQueryDescriptor<T>(ESQueryClause.Must, new QueryContainer[] { queryContainer });
                boolQueryDescriptor = CombineBoolQueryDescriptors(boolQueryDescriptor, boolQueryDescriptorMust);
            }

            BoolQueryDescriptor<T> boolShouldQueryDescriptor = BuildCommonBoolShouldQueryDescriptor<T>();

            query = new SearchDescriptor<T>().Query(qry => qry.Bool(b => boolQueryDescriptor) && qry.Bool(b => boolShouldQueryDescriptor));

            sourceFields = sourceFields ?? new string[] { "*" };
            ISearchResponse<T> queryResult = ElasticClient.Search<T>(s => query
                        .Source(sf => sf.Includes(i => i.Fields(sourceFields)))
                        .From(from)
                        .Take(pageSize)
                        .IgnoreUnavailable(true)
                        .Aggregations(a => a.Terms("count_summary", st => st.Field("_index")))
                        .Sort(sort => sort.Descending("_score"))
                        );

            var result = new EsSearchResult<T>
            {
                PageIndex = page,
                PageSize = pageSize,
                Total = SearchAnyGetTotal(queryResult),
                Results = SearchAnyBuildResult(queryResult)
            };
            return result;
        }

        private long SearchAnyGetTotal<T>(ISearchResponse<T> queryResult) where T : class
        {
            var searchTotal = queryResult.Total;
            #region Get Total
            if (searchTotal > 0)
            {
                TermsAggregate<string> terms = queryResult.Aggregations.Terms("count_summary");
                if (terms != null && terms.Buckets.Count > 0)
                {
                    foreach (var bucket in terms.Buckets)
                    {
                        if (bucket.Key == IndexName)
                        {
                            searchTotal = bucket.DocCount.GetValueOrDefault(searchTotal);
                            break;
                        }
                    }
                }
            }
            #endregion

            return searchTotal;
        }

        private List<T> SearchAnyBuildResult<T>(ISearchResponse<T> queryResult) where T : class
        {
            var hits = queryResult.Hits;
            List<T> resultList = new List<T>();
            if (hits.Count > 0)
            {
                resultList = hits.Select(h => h.Source).ToList();

                //var docs = hits.SelectMany(x => x.MatchedQueries)
                //               .GroupBy(x => x)
                //               .Select(group => new
                //               {
                //                   Metric = group.Key,
                //                   Count = group.Count()
                //               });
            }

            return resultList;
        }
        #endregion

        #region Get Index Summary

        /// <summary>
        /// Get Index Summary
        /// </summary>
        /// <param name="indexList"></param>
        /// <param name="keyword"></param>
        /// <param name="fields"></param>
        /// <param name="isWithKeywords"></param>
        /// <param name="searchWithStarPattern"></param>
        /// <returns></returns>
        public IList<IndexSearchSummary> GetIndexSummary(string indexList, string keyword, IList<ESSearchFieldBasic> fields = null, bool isWithKeywords = false, string searchWithStarPattern = null)
        {
            if (keyword == "*") isWithKeywords = false;
            keyword = (keyword + string.Empty).Trim();

            var idxKeysParentChild = new List<string>();
            var idxKeys = SplitIndexName(indexList);
            #region Process for the specific cases
            if (idxKeys.Contains(ElasticSearchIndexName.Campaign))
            {
                idxKeys = idxKeys.Where(n => n != ElasticSearchIndexName.Campaign).ToList();
                indexList = string.Join(",", idxKeys);
                idxKeysParentChild.Add(ElasticSearchIndexName.Campaign);
            }
            if (idxKeys.Contains(ElasticSearchIndexName.Customer))
            {
                idxKeys = idxKeys.Where(n => n != ElasticSearchIndexName.Customer).ToList();
                indexList = string.Join(",", idxKeys);
                idxKeysParentChild.Add(ElasticSearchIndexName.Customer);
            }
            #endregion

            List<IndexSearchSummary> indexSearchSummaryList = new List<IndexSearchSummary>();

            #region Get Summary for Indexes excluding Campaign, Customer index. Every only get Top 10
            if (idxKeys.Count > 0)
            {
                var pageIndex = 1;
                var pageSize = 10;
                while (true)
                {
                    var execIdxKeys = idxKeys.Skip(pageSize * (pageIndex - 1)).Take(pageSize).ToList();
                    if (execIdxKeys.Count == 0) break;

                    var indexSummarys = GetTopIndexSummary(execIdxKeys, keyword, fields: fields, isWithKeywords: isWithKeywords, searchWithStarPattern: searchWithStarPattern);
                    indexSearchSummaryList.AddRange(indexSummarys);

                    pageIndex++;
                    if (execIdxKeys.Count < pageSize) break;
                }
            }
            #endregion

            #region Parent-Child Index: Campaign,Customer
            if (idxKeysParentChild.Count > 0)
            {
                foreach (var index in idxKeysParentChild)
                {
                    var indexSummary = GetIndexSummaryForParentChild(index, keyword, isWithKeywords: isWithKeywords, searchWithStarPattern: searchWithStarPattern, fields: fields);
                    indexSearchSummaryList.Add(indexSummary);
                }
            }
            #endregion

            return indexSearchSummaryList;
        }

        private IList<IndexSearchSummary> GetTopIndexSummary(List<string> idxKeys, string keyword, IList<ESSearchFieldBasic> fields = null, bool isWithKeywords = false, string searchWithStarPattern = null)
        {
            var indexList = string.Join(",", idxKeys);
            LogMessage($"* GetTopIndexSummary: {indexList}");
            if (indexList == "document_indexing")
            {
                Console.WriteLine("");
            }
            IList<IndexSearchSummary> indexSearchSummaryList = new List<IndexSearchSummary>();

            BoolQueryDescriptor<dynamic> boolQueryDescriptor = BuildCommonBoolQueryDescriptor<dynamic>(fields);

            //*Wildcard search
            if (isWithKeywords)
            {
                BoolQueryDescriptor<dynamic> boolQueryDescriptorKeyword = BuildBoolQueryDescriptorWithKeyword<dynamic>(indexList, keyword, searchWithStarPattern);
                boolQueryDescriptor = boolQueryDescriptor.Must(m => m.Bool(b => boolQueryDescriptorKeyword));
            }
            else
            {
                QueryContainer queryContainer = new QueryContainerDescriptor<dynamic>().QueryString(q => q.Query(keyword));
                BoolQueryDescriptor<dynamic> boolQueryDescriptorMust = BuildBoolQueryDescriptor<dynamic>(ESQueryClause.Must, new QueryContainer[] { queryContainer });
                boolQueryDescriptor = CombineBoolQueryDescriptors(boolQueryDescriptor, boolQueryDescriptorMust);
            }

            BoolQueryDescriptor<dynamic> boolShouldQueryDescriptor = BuildCommonBoolShouldQueryDescriptor<dynamic>();

            SearchDescriptor<dynamic> query = new SearchDescriptor<dynamic>().Query(qry => qry.Bool(b => boolQueryDescriptor) && qry.Bool(b => boolShouldQueryDescriptor));
            var queryResult = ElasticClient.Search<dynamic>(s => query
                                      .RequestConfiguration(r => r.DisableDirectStreaming())
                                      .Index(indexList)
                                      .IgnoreUnavailable(true)
                                      //.Size(1000)//defaults to 10 aggregation terms returned
                                      .Aggregations(a => a.Terms("count_summary", st => st.Field("_index"))));

            TermsAggregate<string> terms = queryResult.Aggregations.Terms("count_summary");
            if (terms != null && terms.Buckets.Count > 0)
            {
                foreach (var bucket in terms.Buckets)
                {
                    indexSearchSummaryList.Add(new IndexSearchSummary()
                    {
                        Key = bucket.Key,
                        Count = bucket.DocCount
                    });
                }
                var notFoundKeys = idxKeys.Where(p => !indexSearchSummaryList.Any(p2 => p2.Key == p));
                foreach (var key in notFoundKeys)
                {
                    indexSearchSummaryList.Add(new IndexSearchSummary()
                    {
                        Key = key,
                        Count = 0
                    });
                }
            }
            else
            {
                foreach (var key in idxKeys)
                {
                    indexSearchSummaryList.Add(new IndexSearchSummary()
                    {
                        Key = key,
                        Count = 0
                    });
                }
            }

            return indexSearchSummaryList;
        }

        private IndexSearchSummary GetIndexSummaryForParentChild(string indexName, string keyword, bool isWithKeywords = false, string searchWithStarPattern = null, IList<ESSearchFieldBasic> fields = null)
        {
            LogMessage($"* GetIndexSummaryForParentChild: {indexName}");
            if (keyword == "*")
            {
                isWithKeywords = false;
            }

            BoolQueryDescriptor<dynamic> boolQueryDescriptor = BuildCommonBoolQueryDescriptor<dynamic>(fields);

            //*Wildcard search
            if (isWithKeywords)
            {
                BoolQueryDescriptor<dynamic> boolQueryDescriptorKeyword = BuildBoolQueryDescriptorWithKeyword<dynamic>(indexName, keyword, searchWithStarPattern);
                boolQueryDescriptor = boolQueryDescriptor.Must(m => m.Bool(b => boolQueryDescriptorKeyword));
            }
            else
            {
                QueryContainer queryContainer = new QueryContainerDescriptor<dynamic>().QueryString(q => q.Query(keyword));
                BoolQueryDescriptor<dynamic> boolQueryDescriptorMust = BuildBoolQueryDescriptor<dynamic>(ESQueryClause.Must, new QueryContainer[] { queryContainer });
                boolQueryDescriptor = CombineBoolQueryDescriptors(boolQueryDescriptor, boolQueryDescriptorMust);
            }

            SearchDescriptor<dynamic> query = new SearchDescriptor<dynamic>().Query(qry => qry.Bool(b => boolQueryDescriptor));

            var queryResult = ElasticClient.Search<dynamic>(s => query
                                      .RequestConfiguration(r => r.DisableDirectStreaming())
                                      .Index(indexName)
                                      .IgnoreUnavailable(true)
                                      //.Size(1000)//defaults to 10 aggregation terms returned
                                      .Aggregations(a => a.Terms("count_summary", st => st.Field("_index"))));

            TermsAggregate<string> terms = queryResult.Aggregations.Terms("count_summary");
            if (terms != null && terms.Buckets.Count > 0)
            {
                foreach (var bucket in terms.Buckets)
                {
                    return new IndexSearchSummary()
                    {
                        Key = bucket.Key,
                        Count = bucket.DocCount
                    };
                }
            }

            return new IndexSearchSummary()
            {
                Key = indexName,
                Count = 0
            };
        }

        #endregion

        /// <summary>
        /// SearchById
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public T SearchById<T>(string id) where T : class
        {
            EsSearchResult<T> result = SearchByField<T>("_id", id, 1, 1);
            if (result != null && result.Results.Count > 0)
            {
                return result.Results[0];
            }
            return null;
        }

        /// <summary>
        /// Search By Field
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="field"></param>
        /// <param name="keyword"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        public EsSearchResult<T> SearchByField<T>(string field, string keyword, int page, int pageSize, IList<ESSearchFieldBasic> fields = null, ESQueryType? queryType = null, string[] sourceFields = null) where T : class
        {
            var from = GetPageIndex(page, pageSize);

            keyword = (keyword + string.Empty).Trim();

            BoolQueryDescriptor<T> boolQueryDescriptor = BuildCommonBoolQueryDescriptor<T>(fields);
            BoolQueryDescriptor<T> boolShouldQueryDescriptor = BuildCommonBoolShouldQueryDescriptor<T>();

            SearchDescriptor<T> query = null;
            switch (queryType)
            {
                case ESQueryType.Wildcard:
                    query = new SearchDescriptor<T>().Query(qry => qry.Bool(b => boolQueryDescriptor) && qry.Wildcard(new Field(field + ".keyword"), keyword, null, rewrite: (MultiTermQueryRewrite)null) && qry.Bool(b => boolShouldQueryDescriptor));
                    break;
                case ESQueryType.Term:
                    query = new SearchDescriptor<T>().Query(qry => qry.Bool(b => boolQueryDescriptor) && qry.Term(new Field(field), keyword) && qry.Bool(b => boolShouldQueryDescriptor));
                    break;
                default:
                    query = new SearchDescriptor<T>().Query(qry => qry.Bool(b => boolQueryDescriptor) && qry.QueryString(d => d.DefaultField(field).DefaultOperator(Operator.And).Query(keyword)) && qry.Bool(b => boolShouldQueryDescriptor));
                    break;
            }

            sourceFields = sourceFields ?? new string[] { "*" };
            var queryResult = ElasticClient.Search<T>(s => query
                        .Source(sf => sf.Includes(i => i.Fields(sourceFields)))
                        .From(from)
                        .Take(pageSize)
                        .IgnoreUnavailable(true)
                        );

            var hits = queryResult.Hits;
            hits.Select(h => h.Source);
            List<T> resultList = hits.Select(h => h.Source).ToList();
            var result = new EsSearchResult<T>
            {
                PageIndex = page,
                PageSize = pageSize,
                Total = queryResult.Total,
                Results = resultList
            };
            return result;
        }

        #region SearchAny By Condition
        public EsSearchResult<T> SearchAnyByCondition<T>(ESSearchCondition condition, int page, int pageSize) where T : class
        {
            var from = GetPageIndex(page, pageSize);

            SearchDescriptor<T> query = new SearchDescriptor<T>().Query(qry =>
                                        qry.Bool(b => BuildSearchConditionBoolQuery<T>(condition))
                                    );

            var queryResult = ElasticClient.Search<T>(s => query
                            .From(from)
                            .Take(pageSize)
                            .IgnoreUnavailable(true)
                            .Aggregations(a => a.Terms("count_summary", st => st.Field("_index")))
                            );

            var result = new EsSearchResult<T>
            {
                PageIndex = page,
                PageSize = pageSize,
                Total = SearchAnyGetTotal(queryResult),
                Results = SearchAnyBuildResult(queryResult)
            };
            return result;
        }

        public EsSearchResult<T> SearchAnyByCondition<T>(ESSearchConditionGroup conditionGroup, int page, int pageSize) where T : class
        {
            var from = GetPageIndex(page, pageSize);

            //Func<QueryContainerDescriptor<T>, QueryContainer> queryContainer = BuildSearchQueryGroup<T>(conditionGroup);
            //BoolQueryDescriptor<T> descriptor = BuildBoolQueryDescriptor(conditionGroup.QueryClause, queryContainer);

            SearchDescriptor<T> query = new SearchDescriptor<T>().Query(qry =>
                                        //qry.Bool(b => BuildBoolQueryDescriptor(b, conditionGroup.QueryClause, queryContainerDescriptor))
                                        //qry.Bool(bl => descriptor)
                                        //BuildSearchGroupQueryContainer(qry, conditionGroup)
                                        qry.Bool(b => BuildSearchGroupBoolQuery<T>(conditionGroup))
                                    );

            var queryResult = ElasticClient.Search<T>(s => query
                             .From(from)
                             .Take(pageSize)
                             .IgnoreUnavailable(true)
                             .Aggregations(a => a.Terms("count_summary", st => st.Field("_index")))
                             );

            var result = new EsSearchResult<T>
            {
                PageIndex = page,
                PageSize = pageSize,
                Total = SearchAnyGetTotal(queryResult),
                Results = SearchAnyBuildResult(queryResult)
            };
            return result;
        }

        public EsSearchResult<T> SearchAnyByCondition<T>(ESSearchConditionRootGroups rootGroups, int page, int pageSize) where T : class
        {
            var from = GetPageIndex(page, pageSize);

            BoolQueryDescriptor<T> descriptor = rootGroups.Items.Count == 1 ?
                                                    BuildSearchGroupsBoolQuery<T>(rootGroups.Items[0]) :
                                                    BuildSearchRootGroupsBoolQuery<T>(rootGroups);

            BoolQueryDescriptor<T> descriptorJoinField = new BoolQueryDescriptor<T>();
            switch (IndexName)
            {
                case ElasticSearchIndexName.Campaign:
                    descriptorJoinField = BuildBoolQueryDescriptor<T>(ESQueryClause.Must, new QueryContainer[] { new QueryContainerDescriptor<T>().Term(new Field("myJoinField"), "campaign") });
                    break;
                case ElasticSearchIndexName.Customer:
                    descriptorJoinField = BuildBoolQueryDescriptor<T>(ESQueryClause.Must, new QueryContainer[] { new QueryContainerDescriptor<T>().Term(new Field("myJoinField"), "customer") });
                    break;
            }

            SearchDescriptor<T> query = new SearchDescriptor<T>().Query(qry =>
                               qry.Bool(b => descriptorJoinField) && qry.Bool(bl => descriptor)
                            );

            //var sortFieldName = GetSortFieldName(IndexName);
            var queryResult = ElasticClient.Search<T>(s => query
                             .From(from)
                             .Take(pageSize)
                             .IgnoreUnavailable(true)
                             .Aggregations(a => a.Terms("count_summary", st => st.Field("_index")))
                             //.Sort(ss => ss.Ascending(new Field(sortFieldName, null, null)))
                             //.Sort(ss => ss.Ascending(SortSpecialField.DocumentIndexOrder))//_index
                             );

            var result = new EsSearchResult<T>
            {
                PageIndex = page,
                PageSize = pageSize,
                Total = SearchAnyGetTotal(queryResult),
                Results = SearchAnyBuildResult(queryResult)
            };
            return result;
        }

        private string GetSortFieldName(string indexName)
        {
            /*Index Sorting
                https://www.elastic.co/guide/en/elasticsearch/reference/master/index-modules-index-sorting.html
                - index.sort.field: The list of fields used to sort the index. Only boolean, numeric, date and keyword fields with doc_values are allowed here.
             */
            switch (indexName)
            {
                case "customer"://id is text -> not allowed -> must use idPerson (long) to replace
                    return "idPerson";
                case "campaign":
                    return "idSalesCampaignWizard";
                default:
                    return "id";
            }
        }
        #endregion

        public string BuildKeywordWithPattern(string keyword, string searchWithStarPattern)
        {
            switch (searchWithStarPattern)
            {
                case ESSearchWithStarPattern.Begin:
                    return "*" + keyword;
                case ESSearchWithStarPattern.End:
                    return keyword + "*";
                case ESSearchWithStarPattern.Both:
                    {
                        var first = "";
                        var last = "";
                        if (keyword.Length > 0)
                        {
                            if (keyword[0] != '*')
                                first = "*";
                            if (keyword[keyword.Length - 1] != '*')
                                last = "*";
                        }
                        return first + keyword + last;
                    }
                default:
                    return keyword;
            }
        }

        private int GetPageIndex(int page, int pageSize)
        {
            var from = (page - 1) * pageSize;
            from = from < 0 ? 0 : from;
            return from;
        }

        /// <summary>
        /// Build Common Bool Query
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="indexName"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        private BoolQueryDescriptor<T> BuildCommonBoolQueryDescriptor<T>(IList<ESSearchFieldBasic> fields) where T : class
        {
            BoolQueryDescriptor<T> boolQueryDescriptor = new BoolQueryDescriptor<T>();
            if (fields == null || fields.Count == 0) return boolQueryDescriptor;

            QueryContainer[] filtersBoolMustByQueryString = BuildQueryWithFields<T>(fields);
            if (filtersBoolMustByQueryString.Length > 0)
            {
                boolQueryDescriptor = boolQueryDescriptor.Filter(filtersBoolMustByQueryString);
            }
            return boolQueryDescriptor;
        }

        /// <summary>
        /// Build Common Bool Should Query
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="indexName"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        private BoolQueryDescriptor<T> BuildCommonBoolShouldQueryDescriptor<T>() where T : class
        {
            BoolQueryDescriptor<T> boolQueryDescriptor = new BoolQueryDescriptor<T>();
            if (string.IsNullOrEmpty(IdApplicationOwner)) return boolQueryDescriptor;

            var fields = new List<ESSearchFieldBasic>
            {
                new ESSearchFieldBasic
                {
                    FieldName = _filedNameIdApplicationOwner,
                    FieldValue = IdApplicationOwner,
                    QueryType = ESQueryType.Term
                },

                new ESSearchFieldBasic
                {
                    FieldName = _filedNameIdApplicationOwner,
                    FieldValue = "0",
                    QueryType = ESQueryType.Term
                }
            };

            QueryContainer[] listQueryContainer = BuildQueryWithFields<T>(fields);
            var listGroupQueryContainer = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>() { BuildBoolGroupAsFuncOf<T>(ESQueryClause.Should, listQueryContainer) };
            return boolQueryDescriptor.Must(listGroupQueryContainer);
        }

        private BoolQueryDescriptor<T> BuildBoolQueryDescriptorWithKeyword<T>(string indexName, string keyword, string searchWithStarPattern) where T : class
        {
            //*Wildcard search
            keyword = keyword.ToLower();

            var hasSeparatorComma = keyword.Contains(",");
            var hasSeparatorPlus = keyword.Contains("+");
            string[] arrayKeyword = new string[] { };
            var properties = GetMappings(indexName);

            if (hasSeparatorComma || hasSeparatorPlus)
            {
                var separator = hasSeparatorComma ? ',' : '+';
                arrayKeyword = SplitKeyword(keyword, separator);
            }
            if (arrayKeyword.Length > 1)//from 2 keywords
            {
                var listQueryContainer = BuildQueryContainerForSplitKeyWord<T>(arrayKeyword, searchWithStarPattern, properties, separatorIsComma: hasSeparatorComma);

                //Comma
                if (hasSeparatorComma)
                {
                    //search 'or' for 2 array: one list 'and' and one list 'or'
                    return new BoolQueryDescriptor<T>().Should(listQueryContainer);
                }
                else//Plus
                {
                    //search 'and' for all fields
                    return new BoolQueryDescriptor<T>().Must(listQueryContainer);
                }
            }
            else//1 keyword
            {
                keyword = BuildKeywordWithPattern(keyword, searchWithStarPattern);
                var listQueryContainer = BuildQueryWithAllFields<T>(keyword, properties);
                return new BoolQueryDescriptor<T>().Should(listQueryContainer);
            }
        }

        private string[] SplitKeyword(string keyword, char separator = ',')
        {
            string[] arrayKeyword = keyword.Split(new char[] { separator }, StringSplitOptions.RemoveEmptyEntries)
                                               .Select(n => n.Trim())
                                               .Where(n => n != string.Empty)
                                               .ToArray();
            return arrayKeyword;
        }

        private List<string> SplitIndexName(string indexName)
        {
            return indexName.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                               .Select(n => n.Trim())
                                               .Where(n => n != string.Empty)
                                               .ToList();
        }

        #region Build Query with Split KeyWord
        /// <summary>
        /// Search 'or' for 2 array: one list 'and' and one list 'or'
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="indexName"></param>
        /// <param name="arrayKeyword"></param>
        /// <param name="searchWithStarPattern"></param>
        /// <returns></returns>
        private IList<Func<QueryContainerDescriptor<T>, QueryContainer>> BuildQueryContainerForSplitKeyWord<T>(string[] arrayKeyword, string searchWithStarPattern, IProperties properties, bool separatorIsComma = true) where T : class
        {
            var listGroupQuery = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>();
            foreach (string sKeyword in arrayKeyword)//Customer: lam,huynh | Artilce: 400000,110100,410602
            {
                var keyword = BuildKeywordWithPattern(sKeyword, searchWithStarPattern);
                var filters = BuildQueryWithAllFields<T>(keyword, properties);
                //Each Group: one keyword will search on All Fields
                var group = BuildBoolShouldGroupAsFuncOf<T>(filters.ToArray());//Search 'or'
                listGroupQuery.Add(group);
            }//for

            if (separatorIsComma)
            {
                var groupMust = BuildBoolMustGroupAsFuncOf(listGroupQuery.ToArray());//Search 'and'
                var groupShould = BuildBoolShouldGroupAsFuncOf(listGroupQuery.ToArray());//Search 'or'
                var listGroupShouldFilters = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>
                {
                    groupMust,
                    groupShould
                };

                return listGroupShouldFilters;
            }

            //separator Is Plus
            return listGroupQuery;
        }
        #endregion

        #region QueryBuilder       

        #region QueryContainer
        private string FixWildcardFieldValue(string fieldValue)
        {
            return fieldValue.Replace("\\", "?").Replace("/", "?").Replace("\"", "");
        }

        private string FixMatchFieldValue(string fieldValue)
        {
            return fieldValue.Replace("@", " ").Replace("*", " ").Replace("\"", "").Trim();
        }

        private string FixMatchPhraseFieldValue(string fieldValue)
        {
            return fieldValue.Replace("*", " ").Replace("\"", "").Trim();
        }

        private QueryContainer BuildQueryWithField<T>(ESSearchFieldBasic field) where T : class
        {
            field.Build();
            if (field.IsIgnoreSearch) return new QueryContainer();

            switch (field.QueryType)
            {
                case ESQueryType.Term:
                    object fieldValue = field.FieldValue;
                    switch (field.FieldDataType)
                    {
                        case ESFieldDataType.Numeric:
                            fieldValue = double.Parse(field.FieldValue, CultureInfo.InvariantCulture);
                            break;
                        case ESFieldDataType.Boolean:
                            fieldValue = bool.Parse(field.FieldValue);
                            break;
                    }
                    return new QueryContainerDescriptor<T>().Term(new Field(field.FieldName), fieldValue, field.Boost);
                case ESQueryType.QueryString:
                    return new QueryContainerDescriptor<T>().QueryString(d => d.DefaultField(new Field(field.FieldName))
                                                                               .DefaultOperator(Operator.And)
                                                                               .Query(field.FieldValue));
                case ESQueryType.Match:
                    return new QueryContainerDescriptor<T>().Match(d => d.Field(new Field(field.FieldName))
                                                                               .Operator(Operator.And)
                                                                               .Query(FixMatchFieldValue(field.FieldValue)));

                case ESQueryType.MatchPhrase:
                    //if (field.FieldName == "contentdocument")
                    //{
                    //    return new QueryContainerDescriptor<T>().Wildcard(new Field(field.FieldName), FixWildcardFieldValue(field.FieldValue), field.Boost, rewrite: (MultiTermQueryRewrite)null);//, name: field.FieldName);
                    //}
                    return new QueryContainerDescriptor<T>().MatchPhrase(d => d.Field(new Field(field.FieldName))
                                                                               .Query(FixMatchPhraseFieldValue(field.FieldValue)));
                case ESQueryType.Wildcard:
                    return new QueryContainerDescriptor<T>().Wildcard(new Field(field.FieldName + (field.NotAppendSubffix ? "" : ".keyword")), FixWildcardFieldValue(field.FieldValue), field.Boost, rewrite: (MultiTermQueryRewrite)null);//, name: field.FieldName);

                case ESQueryType.Terms:
                    return new QueryContainerDescriptor<T>().Terms(t => t.Field(field.FieldName).Terms(field.FieldValue.Split(",").ToArray()));

                default:
                    return new QueryContainer();
            }  //switch     
        }

        private QueryContainer[] BuildQueryWithFields<T>(IList<ESSearchFieldBasic> fields) where T : class
        {
            var queryList = new List<QueryContainer>();
            foreach (var field in fields)
            {
                if (field.FieldName.Contains("."))
                    field.QueryType = ESQueryType.Term;
                else if (field.FieldValue.Split(",").Length > 1)
                    field.QueryType = ESQueryType.Terms;

                queryList.Add(BuildQueryWithField<T>(field));
            }
            return queryList.ToArray();
        }

        /// <summary>
        /// BuildQueryWithAllFields
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="keyword"></param>
        /// <param name="properties"></param>
        /// <param name="indexName"></param>
        /// <returns></returns>
        private QueryContainer[] BuildQueryWithAllFields<T>(string keyword, IProperties properties) where T : class
        {
            var filtersList = new List<QueryContainer>();
            foreach (var property in properties)
            {
                string fieldName = property.Key.Name;

                double? boost = null;
                var mappingProperty = property.Value as ESMappingProperty;
                if (mappingProperty != null)
                {
                    boost = mappingProperty.Boost;

                    filtersList.Add(BuildQueryWithField<T>(new ESSearchFieldBasic
                    {
                        QueryType = mappingProperty.QueryType,
                        FieldDataType = mappingProperty.FieldDataType,
                        NotAppendSubffix = mappingProperty.NotAppendSubffix,
                        FieldName = fieldName,
                        FieldValue = keyword,
                        Boost = boost
                    }));
                }
                else
                {
                    filtersList.Add(BuildQueryWithField<T>(new ESSearchFieldBasic
                    {
                        //QueryType = ESQueryType.Wildcard,
                        //FieldDataType = ESFieldDataType.Keyword,
                        QueryType = ESQueryType.Match,//QueryString,
                        FieldDataType = ESFieldDataType.Text,
                        FieldName = fieldName,
                        FieldValue = keyword,
                        Boost = boost
                    }));
                }
            }

            return filtersList.ToArray();
        }
        #endregion

        #region QueryContainerDescriptor

        /// <summary>
        /// BuildBoolMustGroupAsFuncOf: This is the function that joins the filters into a group of ANDs (which is a Bool Query with an array of MUSTs)
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queries"></param>
        /// <returns></returns>
        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolMustGroupAsFuncOf<T>(QueryContainer[] queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Must(queries));
        }

        /// <summary>
        /// BuildBoolMustNotGroupAsFuncOf: This is the function that joins the filters into a group of ANDs (which is a Bool Query with an array of MUST_NOTs)
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queries"></param>
        /// <returns></returns>
        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolMustNotGroupAsFuncOf<T>(QueryContainer[] queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().MustNot(queries));
        }

        /// <summary>
        /// BuildBoolShouldGroupAsFuncOf: This is the function that joins the filters into a group of ANDs (which is a Bool Query with an array of SHOULDs)
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queries"></param>
        /// <returns></returns>
        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolShouldGroupAsFuncOf<T>(QueryContainer[] queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Should(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolFilterGroupAsFuncOf<T>(QueryContainer[] queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Filter(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolMustGroupAsFuncOf<T>(IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Must(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolMustNotGroupAsFuncOf<T>(IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().MustNot(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolShouldGroupAsFuncOf<T>(IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Should(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolFilterGroupAsFuncOf<T>(IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            return q => q.Bool(bl => new BoolQueryDescriptor<T>().Filter(queries));
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolGroupAsFuncOf<T>(ESQueryClause queryClause, IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            switch (queryClause)
            {
                case ESQueryClause.Must:
                    return BuildBoolMustGroupAsFuncOf<T>(queries);
                case ESQueryClause.MustNot:
                    return BuildBoolMustNotGroupAsFuncOf<T>(queries);
                case ESQueryClause.Filter:
                    return BuildBoolFilterGroupAsFuncOf<T>(queries);
                case ESQueryClause.Should:
                default:
                    return BuildBoolShouldGroupAsFuncOf<T>(queries);
            }
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolGroupAsFuncOf<T>(ESQueryClause queryClause, Func<QueryContainerDescriptor<T>, QueryContainer> query) where T : class
        {
            switch (queryClause)
            {
                case ESQueryClause.Must:
                    return BuildBoolMustGroupAsFuncOf<T>(new Func<QueryContainerDescriptor<T>, QueryContainer>[] { query });
                case ESQueryClause.MustNot:
                    return BuildBoolMustNotGroupAsFuncOf<T>(new Func<QueryContainerDescriptor<T>, QueryContainer>[] { query });
                case ESQueryClause.Filter:
                    return BuildBoolFilterGroupAsFuncOf<T>(new Func<QueryContainerDescriptor<T>, QueryContainer>[] { query });
                case ESQueryClause.Should:
                default:
                    return BuildBoolShouldGroupAsFuncOf<T>(new Func<QueryContainerDescriptor<T>, QueryContainer>[] { query });
            }
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> BuildBoolGroupAsFuncOf<T>(ESQueryClause queryClause, QueryContainer[] queries) where T : class
        {
            switch (queryClause)
            {
                case ESQueryClause.Must:
                    return BuildBoolMustGroupAsFuncOf<T>(queries);
                case ESQueryClause.MustNot:
                    return BuildBoolMustNotGroupAsFuncOf<T>(queries);
                case ESQueryClause.Filter:
                    return BuildBoolFilterGroupAsFuncOf<T>(queries);
                case ESQueryClause.Should:
                default:
                    return BuildBoolShouldGroupAsFuncOf<T>(queries);
            }
        }
        #endregion

        #region BoolQueryDescriptor
        public BoolQueryDescriptor<T> BuildBoolQueryDescriptor<T>(BoolQueryDescriptor<T> descriptor, ESQueryClause queryClause, IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            switch (queryClause)
            {
                case ESQueryClause.Should:
                    return descriptor.Should(queries);
                case ESQueryClause.MustNot:
                    return descriptor.MustNot(queries);
                case ESQueryClause.Filter:
                    return descriptor.Filter(queries);
                default:
                    return descriptor.Must(queries);
            }
        }

        public BoolQueryDescriptor<T> BuildBoolQueryDescriptor<T>(BoolQueryDescriptor<T> descriptor, ESQueryClause queryClause, Func<QueryContainerDescriptor<T>, QueryContainer> query) where T : class
        {
            switch (queryClause)
            {
                case ESQueryClause.Should:
                    return descriptor.Should(query);
                case ESQueryClause.MustNot:
                    return descriptor.MustNot(query);
                case ESQueryClause.Filter:
                    return descriptor.Filter(query);
                default:
                    return descriptor.Must(query);
            }
        }

        public BoolQueryDescriptor<T> BuildBoolQueryDescriptor<T>(ESQueryClause queryClause, IEnumerable<Func<QueryContainerDescriptor<T>, QueryContainer>> queries) where T : class
        {
            var descriptor = new BoolQueryDescriptor<T>();
            switch (queryClause)
            {
                case ESQueryClause.Should:
                    return descriptor.Should(queries);
                case ESQueryClause.MustNot:
                    return descriptor.MustNot(queries);
                case ESQueryClause.Filter:
                    return descriptor.Filter(queries);
                default:
                    return descriptor.Must(queries);
            }
        }

        public BoolQueryDescriptor<T> BuildBoolQueryDescriptor<T>(ESQueryClause queryClause, Func<QueryContainerDescriptor<T>, QueryContainer> query) where T : class
        {
            var descriptor = new BoolQueryDescriptor<T>();
            switch (queryClause)
            {
                case ESQueryClause.Should:
                    return descriptor.Should(query);
                case ESQueryClause.MustNot:
                    return descriptor.MustNot(query);
                case ESQueryClause.Filter:
                    return descriptor.Filter(query);
                default:
                    return descriptor.Must(query);
            }
        }

        public BoolQueryDescriptor<T> BuildBoolQueryDescriptor<T>(ESQueryClause queryClause, QueryContainer[] queries, BoolQueryDescriptor<T> descriptor = null) where T : class
        {
            descriptor = descriptor ?? new BoolQueryDescriptor<T>();
            switch (queryClause)
            {
                case ESQueryClause.Should:
                    return descriptor.Should(queries);
                case ESQueryClause.MustNot:
                    return descriptor.MustNot(queries);
                case ESQueryClause.Filter:
                    return descriptor.Filter(queries);
                default:
                    return descriptor.Must(queries);
            }
        }

        public static BoolQueryDescriptor<T> CombineBoolQueryDescriptors<T>(params BoolQueryDescriptor<T>[] queries) where T : class
        {
            var descriptor = new BoolQueryDescriptor<T>();
            var combinedQuery = (IBoolQuery)descriptor;

            foreach (var query in queries.Cast<IBoolQuery>())
            {
                if (query.Must != null)
                {
                    combinedQuery.Must = combinedQuery.Must != null
                        ? combinedQuery.Must.Concat(query.Must)
                        : (query.Must.ToArray());
                }
                if (query.Should != null)
                {
                    combinedQuery.Should = combinedQuery.Should != null
                        ? combinedQuery.Should.Concat(query.Should)
                        : (query.Should.ToArray());
                }

                if (query.MustNot != null)
                {
                    combinedQuery.MustNot = combinedQuery.MustNot != null
                        ? combinedQuery.MustNot.Concat(query.MustNot)
                        : (query.MustNot.ToArray());
                }

                if (query.Filter != null)
                {
                    combinedQuery.Filter = combinedQuery.Filter != null
                        ? combinedQuery.Filter.Concat(query.Filter)
                        : (query.Filter.ToArray());
                }
            }

            return descriptor;
        }

        public Func<QueryContainerDescriptor<T>, QueryContainer> GetBoolQueryAsFuncOf<T>(BoolQueryDescriptor<T> descriptor) where T : class
        {
            return q => q.Bool(bl => descriptor);
        }
        #endregion

        /// <summary>
        /// BuildSubQueryContainer
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="subQuery"></param>
        /// <param name="keyword"></param>
        /// <param name="conditionalOperators"></param>
        /// <param name="func"></param>
        /// <returns></returns>
        private QueryContainer BuildSubQueryContainer<T>(QueryContainerDescriptor<T> subQuery,
            string keyword, ESConditionalOperators conditionalOperators,
            Func<QueryContainerDescriptor<T>, QueryContainer> func) where T : class
        {
            if (func == null)
                return subQuery.QueryString(d => d.DefaultField("_all").Query(keyword));

            switch (conditionalOperators)
            {
                case ESConditionalOperators.And:
                    return subQuery.QueryString(qry => qry.DefaultField("_all").Query(keyword)) && func(subQuery);
                default:
                    return subQuery.QueryString(qry => qry.DefaultField("_all").Query(keyword)) || func(subQuery);
            }
        }
        #endregion

        #region Get Mappings
        public IProperties GetMappings(string indexName)
        {
            var properties = new Properties();
            var idxKeys = indexName.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            var allowTypes = new[] { "text", "keyword" };
            foreach (var key in idxKeys)
            {
                var isSetMappingsFromJsonFileSuccess = SetMappingsFromJsonFile(properties, key);
                if (!isSetMappingsFromJsonFileSuccess)
                {
                    #region Get Mapping from ES
                    var mappingRequest = new GetMappingRequest(Indices.Index(key))
                    {
                        IgnoreUnavailable = true
                    };
                    var allMappings = ElasticClient.Indices.GetMapping(mappingRequest);
                    if (allMappings != null && allMappings.Indices != null && allMappings.Indices.Count > 0)
                    {
                        foreach (var indice in allMappings.Indices)
                        {
                            if (indice.Value == null || indice.Value.Mappings == null || indice.Value.Mappings.Properties == null) continue;

                            var indiceProperties = indice.Value.Mappings.Properties;
                            foreach (var prop in indiceProperties)
                            {
                                var type = prop.Value.Type.ToString();
                                if (!allowTypes.Contains(type)) continue;

                                string fieldName = prop.Key.Name.ToLower();
                                if (fieldName == "id" || fieldName.StartsWith("id") || ESIgnoredFields.Any(n => n == fieldName || fieldName.StartsWith(n + "."))) continue;

                                properties[prop.Key] = prop.Value;
                            }
                        }
                    }
                    #endregion
                }
            }
            return properties;
        }

        public bool SetMappingsFromJsonFile(Properties properties, string indexName)
        {
            try
            {
                if (string.IsNullOrEmpty(EsConfigFolder)) return false;

                var fileConfigJson = Path.Combine(EsConfigFolder, string.Format("{0}.json", indexName));
                if (!File.Exists(fileConfigJson)) return false;

                var mappingJson = File.ReadAllText(fileConfigJson);
                if (string.IsNullOrEmpty(mappingJson)) return false;

                JToken outer = JToken.Parse(mappingJson);
                JObject jObjectProperties = outer["properties"].Value<JObject>();
                foreach (JProperty prop in jObjectProperties.Properties())
                {
                    JObject jObjectValues = JObject.Parse(prop.Value + string.Empty);
                    ESMappingProperty esMappingProperty = new ESMappingProperty() { Name = prop.Name };
                    foreach (JProperty propChild in jObjectValues.Properties())
                    {
                        switch (propChild.Name)
                        {
                            case "type":
                                esMappingProperty.Type = propChild.Value + string.Empty;
                                break;
                            case "boost":
                                esMappingProperty.Boost = (double?)propChild.Value;
                                break;
                            case "notAppendSubffix":
                                esMappingProperty.NotAppendSubffix = (bool)propChild.Value;
                                break;
                        }
                    }//for
                    esMappingProperty.Build();
                    properties[prop.Name] = esMappingProperty;
                }//for
                return true;
            }
            catch { }
            return false;
        }
        #endregion

        #region Advance Search - BuildSearchQueryGroup

        #region Condition
        private QueryContainer BuildSearchFieldQuery<T>(ESSearchField searchField) where T : class
        {
            var queryContainer = new QueryContainer();

            switch (searchField.QueryType)
            {
                case ESQueryType.Term:
                    #region TermLevel
                    //Reference: https://www.elastic.co/guide/en/elasticsearch/reference/5.6/term-level-queries.html
                    //Net-api: https://www.elastic.co/guide/en/elasticsearch/client/net-api/5.x/term-level-queries.html
                    switch (searchField.TermLevel)
                    {
                        case ESTermLevelQuery.Range:
                            var fixedNumberValue = double.Parse(searchField.FieldValue, CultureInfo.InvariantCulture);
                            var numericRangeQuery = new NumericRangeQuery
                            {
                                Name = searchField.FieldName,
                                Field = searchField.FieldName
                            };
                            switch (searchField.TermLevelQueryOperator)
                            {
                                case ESTermLevelQueryOperator.GreaterThan:
                                    numericRangeQuery.GreaterThan = fixedNumberValue;
                                    break;
                                case ESTermLevelQueryOperator.GreaterThanOrEquals:
                                    numericRangeQuery.GreaterThanOrEqualTo = fixedNumberValue;
                                    break;
                                case ESTermLevelQueryOperator.LessThan:
                                    numericRangeQuery.LessThan = fixedNumberValue;
                                    break;
                                case ESTermLevelQueryOperator.LessThanOrEquals:
                                    numericRangeQuery.LessThanOrEqualTo = fixedNumberValue;
                                    break;
                                case ESTermLevelQueryOperator.Equals:
                                    return new QueryContainerDescriptor<T>().Term(new Field(searchField.FieldName), searchField.FieldValue);
                            }
                            return new QueryContainerDescriptor<T>().Range(c => numericRangeQuery);
                        case ESTermLevelQuery.DateRange:
                            //https://www.elastic.co/guide/en/elasticsearch/client/net-api/current/date-range-query-usage.html
                            //https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html
                            var fixedDate = DateMath.FromString(searchField.FieldValue);
                            var dateRangeQuery = new DateRangeQuery
                            {
                                Name = searchField.FieldName,
                                Field = searchField.FieldName,
                                Format = "dd.MM.yyyy"
                            };
                            switch (searchField.TermLevelQueryOperator)
                            {
                                case ESTermLevelQueryOperator.GreaterThan:
                                    dateRangeQuery.GreaterThan = fixedDate;
                                    break;
                                case ESTermLevelQueryOperator.GreaterThanOrEquals:
                                    dateRangeQuery.GreaterThanOrEqualTo = fixedDate;
                                    break;
                                case ESTermLevelQueryOperator.LessThan:
                                    dateRangeQuery.LessThan = fixedDate;
                                    break;
                                case ESTermLevelQueryOperator.LessThanOrEquals:
                                    dateRangeQuery.LessThanOrEqualTo = fixedDate;
                                    break;
                                case ESTermLevelQueryOperator.Equals:
                                case ESTermLevelQueryOperator.Difference://Use for 'MustNot' Condition
                                    return new QueryContainerDescriptor<T>().Term(new Field(searchField.FieldName), searchField.FieldValue);
                            }
                            return new QueryContainerDescriptor<T>().DateRange(c => dateRangeQuery);
                        case ESTermLevelQuery.TermRange:
                            var termRangeQuery = new TermRangeQuery
                            {
                                Name = searchField.FieldName,
                                Field = searchField.FieldName
                            };
                            switch (searchField.TermLevelQueryOperator)
                            {
                                case ESTermLevelQueryOperator.GreaterThan:
                                    termRangeQuery.GreaterThan = searchField.FieldValue;
                                    break;
                                case ESTermLevelQueryOperator.GreaterThanOrEquals:
                                    termRangeQuery.GreaterThanOrEqualTo = searchField.FieldValue;
                                    break;
                                case ESTermLevelQueryOperator.LessThan:
                                    termRangeQuery.LessThan = searchField.FieldValue;
                                    break;
                                case ESTermLevelQueryOperator.LessThanOrEquals:
                                    termRangeQuery.LessThanOrEqualTo = searchField.FieldValue;
                                    break;
                                case ESTermLevelQueryOperator.Equals:
                                case ESTermLevelQueryOperator.Difference://Use for 'MustNot' Condition
                                    return new QueryContainerDescriptor<T>().Term(new Field(searchField.FieldName), searchField.FieldValue);
                            }
                            return new QueryContainerDescriptor<T>().TermRange(c => termRangeQuery);
                        default:
                            object fieldValue = searchField.FieldValue;
                            switch (searchField.FieldDataType)
                            {
                                case ESFieldDataType.Numeric:
                                    fieldValue = double.Parse(searchField.FieldValue, CultureInfo.InvariantCulture);
                                    break;
                                case ESFieldDataType.Boolean:
                                    fieldValue = bool.Parse(searchField.FieldValue);
                                    break;
                            }
                            return new QueryContainerDescriptor<T>().Term(new Field(searchField.FieldName), fieldValue);
                    }
                #endregion
                case ESQueryType.QueryString:
                    #region FullTextQuery
                    //Reference: https://www.elastic.co/guide/en/elasticsearch/reference/master/full-text-queries.html
                    //Net-api: https://www.elastic.co/guide/en/elasticsearch/client/net-api/5.x/full-text-queries.html
                    switch (searchField.FullTextQuery)
                    {
                        case ESFullTextQuery.Match:
                            var matchQuery = new MatchQuery
                            {
                                Name = searchField.FieldName,
                                Field = searchField.FieldName,
                                Query = searchField.FieldValue,
                                Operator = Operator.And
                            };
                            return new QueryContainerDescriptor<T>().Match(c => matchQuery);
                        case ESFullTextQuery.MatchPhrase:
                            var matchPhraseQuery = new MatchPhraseQuery
                            {
                                Name = searchField.FieldName,
                                Field = searchField.FieldName,
                                Query = searchField.FieldValue
                            };
                            return new QueryContainerDescriptor<T>().MatchPhrase(c => matchPhraseQuery);
                        case ESFullTextQuery.SimpleQueryString:
                            var simpleQueryStringQuery = new SimpleQueryStringQuery
                            {
                                Name = searchField.FieldName,
                                Fields = new[] { searchField.FieldName },
                                Query = searchField.FieldValue,
                                DefaultOperator = Operator.And
                            };
                            return new QueryContainerDescriptor<T>().SimpleQueryString(c => simpleQueryStringQuery);
                        case ESFullTextQuery.QueryString:
                            var queryStringQuery = new QueryStringQuery
                            {
                                Name = searchField.FieldName,
                                Fields = new[] { searchField.FieldName },
                                Query = searchField.FieldValue,
                                DefaultOperator = Operator.And
                            };
                            return new QueryContainerDescriptor<T>().QueryString(c => queryStringQuery);
                        default:
                            return new QueryContainerDescriptor<T>().QueryString(d => d.DefaultField(searchField.FieldName)
                                                                               .DefaultOperator(Operator.And)
                                                                               .Query(searchField.FieldValue));
                    }
                #endregion
                case ESQueryType.Wildcard:
                    return new QueryContainerDescriptor<T>().Wildcard(new Field(searchField.FieldName), searchField.FieldValue, null, rewrite: (MultiTermQueryRewrite)null);//, name: searchField.FieldName);
            }  //switch     
            return new QueryContainer();
        }

        private QueryContainer BuildSearchConditionQueryContainer<T>(QueryContainerDescriptor<T> queryDescriptor, ESSearchCondition condition) where T : class
        {
            //Func<QueryContainerDescriptor<T>, QueryContainer> queryContainer = BuildSearchConditionFuncQueryContainer<T>(condition);
            //BoolQueryDescriptor<T> descriptor = BuildBoolQueryDescriptor(condition.QueryClause, queryContainer);

            return queryDescriptor.Bool(bl => BuildSearchConditionBoolQuery<T>(condition));
        }

        private Func<QueryContainerDescriptor<T>, QueryContainer> BuildSearchConditionFuncQueryContainer<T>(ESSearchCondition condition) where T : class
        {
            List<QueryContainer> queryWithFields = new List<QueryContainer>();
            foreach (var field in condition.Fields)
            {
                queryWithFields.Add(BuildSearchFieldQuery<T>(field));
            }

            return BuildBoolGroupAsFuncOf<T>(condition.QueryClause, queryWithFields.ToArray());
        }

        private BoolQueryDescriptor<T> BuildSearchConditionBoolQuery<T>(ESSearchCondition condition) where T : class
        {
            List<QueryContainer> queryWithFields = new List<QueryContainer>();
            foreach (var field in condition.Fields)
            {
                queryWithFields.Add(BuildSearchFieldQuery<T>(field));
            }

            return BuildBoolQueryDescriptor<T>(condition.QueryClause, queryWithFields.ToArray());
        }

        #endregion

        #region Group
        private QueryContainer BuildSearchGroupQueryContainer<T>(QueryContainerDescriptor<T> queryDescriptor, ESSearchConditionGroup group) where T : class
        {
            //Func<QueryContainerDescriptor<T>, QueryContainer> queryContainer = BuildSearchGroupFuncQueryContainer<T>(group);
            //BoolQueryDescriptor<T> descriptor = BuildBoolQueryDescriptor(group.QueryClause, queryContainer);

            var listBool = BuildSearchGroupListBoolQuery<T>(group);
            return queryDescriptor.Bool(bl => CombineBoolQueryDescriptors(listBool.ToArray()));
        }

        private BoolQueryDescriptor<T> BuildSearchGroupBoolQuery<T>(ESSearchConditionGroup group) where T : class
        {
            //var listBool = BuildSearchGroupListBoolQuery<T>(group);
            //var boolQueryDescriptor = CombineBoolQueryDescriptors(listBool.ToArray());
            //return group.IsGrouped ? BuildBoolQueryDescriptor(group.QueryClause, GetBoolQueryAsFuncOf(boolQueryDescriptor)) : boolQueryDescriptor;

            if (group.QueryClause.HasValue)
            {
                Func<QueryContainerDescriptor<T>, QueryContainer> queryContainer = BuildSearchGroupFuncQueryContainer<T>(group);
                return BuildBoolQueryDescriptor(group.QueryClause.Value, queryContainer);
            }

            return CombineBoolQueryDescriptors(BuildSearchGroupListBoolQuery<T>(group).ToArray());
        }

        private Func<QueryContainerDescriptor<T>, QueryContainer> BuildSearchGroupFuncQueryContainer<T>(ESSearchConditionGroup group) where T : class
        {
            var listQueryContainer = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>();
            foreach (var condition in group.Conditions)
            {
                listQueryContainer.Add(BuildSearchConditionFuncQueryContainer<T>(condition));
            }//for 

            return BuildBoolGroupAsFuncOf(group.QueryClause.Value, listQueryContainer.ToArray());
        }

        private List<Func<QueryContainerDescriptor<T>, QueryContainer>> BuildSearchGroupListFuncQueryContainer<T>(ESSearchConditionGroup group) where T : class
        {
            var listQueryContainer = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>();
            foreach (var condition in group.Conditions)
            {
                listQueryContainer.Add(BuildSearchConditionFuncQueryContainer<T>(condition));
            }//for 

            return listQueryContainer;
        }

        private List<BoolQueryDescriptor<T>> BuildSearchGroupListBoolQuery<T>(ESSearchConditionGroup group) where T : class
        {
            var listBool = new List<BoolQueryDescriptor<T>>();
            foreach (var condition in group.Conditions)
            {
                listBool.Add(BuildSearchConditionBoolQuery<T>(condition));
            }//for

            return listBool;
        }
        #endregion

        #region Groups
        private QueryContainer BuildSearchGroupsQueryContainer<T>(QueryContainerDescriptor<T> queryDescriptor, ESSearchConditionGroups groups) where T : class
        {
            var listBool = BuildSearchGroupsListBoolQuery<T>(groups);
            return queryDescriptor.Bool(bl => CombineBoolQueryDescriptors(listBool.ToArray()));
        }

        private BoolQueryDescriptor<T> BuildSearchGroupsBoolQuery<T>(ESSearchConditionGroups groups) where T : class
        {
            if (groups.QueryClause.HasValue)
            {
                var listQueryContainer = BuildSearchGroupsListFuncQueryContainer<T>(groups);
                return BuildBoolQueryDescriptor(groups.QueryClause.Value, listQueryContainer);
            }

            return CombineBoolQueryDescriptors(BuildSearchGroupsListBoolQuery<T>(groups).ToArray());
        }

        private List<Func<QueryContainerDescriptor<T>, QueryContainer>> BuildSearchGroupsListFuncQueryContainer<T>(ESSearchConditionGroups groups) where T : class
        {
            var listQueryContainer = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>();
            foreach (var group in groups.Groups)
            {
                listQueryContainer.AddRange(BuildSearchGroupListFuncQueryContainer<T>(group));
            }//for 

            if (groups.QueryClause.HasValue && (groups.Groups.Count > 1 || groups.Groups.Any(n => n.ForceCreateGroup)))
            {
                return new List<Func<QueryContainerDescriptor<T>, QueryContainer>>() { BuildBoolGroupAsFuncOf(groups.QueryClause.Value, listQueryContainer.ToArray()) };
            }

            return listQueryContainer;
        }

        private List<BoolQueryDescriptor<T>> BuildSearchGroupsListBoolQuery<T>(ESSearchConditionGroups groups) where T : class
        {
            var listBool = new List<BoolQueryDescriptor<T>>();
            foreach (var group in groups.Groups)
            {
                listBool.Add(BuildSearchGroupBoolQuery<T>(group));
            }
            return listBool;
        }
        #endregion

        #region RootGroups
        private BoolQueryDescriptor<T> BuildSearchRootGroupsBoolQuery<T>(ESSearchConditionRootGroups rootGroups) where T : class
        {
            if (rootGroups.QueryClause.HasValue)
            {
                var listQueryContainer = BuildSearchRootGroupsListFuncQueryContainer<T>(rootGroups);
                return BuildBoolQueryDescriptor(rootGroups.QueryClause.Value, listQueryContainer);
            }
            return CombineBoolQueryDescriptors(BuildSearchRootGroupsListBoolQuery<T>(rootGroups).ToArray());
        }

        private List<Func<QueryContainerDescriptor<T>, QueryContainer>> BuildSearchRootGroupsListFuncQueryContainer<T>(ESSearchConditionRootGroups rootGroups) where T : class
        {
            var listQueryContainer = new List<Func<QueryContainerDescriptor<T>, QueryContainer>>();
            foreach (var groups in rootGroups.Items)
            {
                listQueryContainer.AddRange(BuildSearchGroupsListFuncQueryContainer<T>(groups));
            }//for

            return listQueryContainer;
        }

        private List<BoolQueryDescriptor<T>> BuildSearchRootGroupsListBoolQuery<T>(ESSearchConditionRootGroups rootGroups) where T : class
        {
            var listBool = new List<BoolQueryDescriptor<T>>();
            foreach (var groups in rootGroups.Items)
            {
                BoolQueryDescriptor<T> boolGroupsDescriptor = null;
                if (groups.QueryClause.HasValue)
                {
                    var listQueryContainer = BuildSearchGroupsListFuncQueryContainer<T>(groups);
                    boolGroupsDescriptor = BuildBoolQueryDescriptor(groups.QueryClause.Value, listQueryContainer.ToArray());
                    if (groups.Groups.Count > 1)
                    {
                        boolGroupsDescriptor = BuildBoolQueryDescriptor(groups.QueryClause.Value, GetBoolQueryAsFuncOf(boolGroupsDescriptor));
                    }
                }
                else
                {
                    boolGroupsDescriptor = BuildSearchGroupsBoolQuery<T>(groups);
                }

                //var boolGroupsDescriptor = groups.QueryClause.HasValue ? BuildBoolQueryDescriptor(groups.QueryClause.Value, GetBoolQueryAsFuncOf(boolGroupsDescriptor)) : boolGroupsDescriptor;
                listBool.Add(boolGroupsDescriptor);
            }
            return listBool;
        }
        #endregion

        #endregion

        #region Delete
        public void DeleteIndexIfExists(string indexName)
        {
            CreateDefaultClient();

            if (ElasticClient.Indices.Exists(indexName).Exists)
                ElasticClient.Indices.Delete(indexName);
        }

        public DeleteResponse Delete(string indexName, string id)
        {
            CreateDefaultClient();

            var deleteResponse = ElasticClient.Delete(new DeleteRequest(indexName, id));
            return deleteResponse;
        }

        public BulkResponse Delete(string indexName, List<string> ids)
        {
            CreateDefaultClient();

            var bulkDescriptor = new BulkDescriptor();
            foreach (var id in ids)
            {
                if (string.IsNullOrWhiteSpace(id)) continue;

                bulkDescriptor.Delete<dynamic>(d => d.Id(id).Index(indexName));
            }

            var bulkResponse = ElasticClient.Bulk(bulkDescriptor);
            return bulkResponse;

        }

        public object DeleteIndex(string indexes, string idApplicationOwner)
        {
            CreateClient<dynamic>();

            List<DeleteByQueryResponse> deleteByQueryResponses = new List<DeleteByQueryResponse>();
            foreach (string indexName in indexes.Split(",", StringSplitOptions.RemoveEmptyEntries))
            {
                if (string.IsNullOrWhiteSpace(indexName)) continue;
                try
                {
                    var request = new DeleteByQueryRequest(indexName);
                    if (!string.IsNullOrEmpty(idApplicationOwner))
                    {
                        QueryContainer queryContainer = BuildQueryWithField<dynamic>(new ESSearchFieldBasic
                        {
                            FieldName = _filedNameIdApplicationOwner,
                            FieldValue = idApplicationOwner,
                            QueryType = ESQueryType.Term
                        });
                        request.Query = queryContainer;
                    }
                    DeleteByQueryResponse response = ElasticClient.DeleteByQueryAsync(request).Result;
                    deleteByQueryResponses.Add(response);
                }
                catch (Exception)
                {
                }
            }
            return deleteByQueryResponses;
        }
        #endregion

        private void LogMessage(string message)
        {
            if (!EnableLogES) return;

            _logger.Info(message);
        }
    }

}
