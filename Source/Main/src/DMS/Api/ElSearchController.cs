using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Utils.ElasticSearch;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using DMS.Utils;
using DMS.Models;
using Microsoft.Extensions.Options;
using DMS.Models.DMS;
using Newtonsoft.Json;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Authorize]
    [Route("api/[controller]")]
    public class ElSearchController : BaseController
    {
        private readonly AppSettings _appSettings;
        private IPathProvider _pathProvider;
        private readonly IElasticSearchClientHelper _elasticSearchClientHelper;
        private readonly IUniqueBusiness _uniqueBusiness;
        private readonly IArticleBusiness _articleBusiness;
        private readonly ICloudBusiness _cloudBusiness;
        private readonly string _idApplicationOwner;
        private readonly string _idLogin;
        private readonly string _idSharingCompany;
        private readonly IBaseBusiness _baseBusiness;

        public ElSearchController(IOptions<AppSettings> appSettings, IUniqueBusiness uniqueBusiness, IBaseBusiness baseBusiness,
            IAppServerSetting appServerSetting, IArticleBusiness articleBusiness, IPathProvider pathProvider, ICloudBusiness cloudBusiness)
        {
            _appSettings = appSettings.Value;
            _pathProvider = pathProvider;
            _uniqueBusiness = uniqueBusiness;
            _articleBusiness = articleBusiness;
            _cloudBusiness = cloudBusiness;
            _baseBusiness = baseBusiness;

            _idLogin = baseBusiness.UserFromService.IdLogin;
            _idSharingCompany = baseBusiness.UserFromService.IdSharingCompany;
            _idApplicationOwner = baseBusiness.UserFromService.IdApplicationOwner;
            _elasticSearchClientHelper = new ElasticSearchClientHelper(_appSettings.EnableLogES)
            {
                IdApplicationOwner = _idApplicationOwner,
                EsUri = appServerSetting.ServerConfig.ServerSetting.ElasticSearchServiceUrl,
                WebRootPath = _pathProvider.WebRootPath
            };
        }

        /// <summary>
        /// GetSearchSummary
        /// </summary>
        /// <param name="indexes"></param>
        /// <param name="keyword"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetSearchSummary")]
        public IList<IndexSearchSummary> GetSearchSummary(string indexes, string keyword, bool isWithStar = false, string searchWithStarPattern = null,
                IList<string> fieldName = null, IList<string> fieldValue = null, string fieldsJson = null, string idsDocTree = null)
        {
            //indexes = RemoveFakeIndexes(indexes);
            if (string.IsNullOrEmpty(indexes))
                return new List<IndexSearchSummary>();

            keyword = string.IsNullOrEmpty(keyword) ? "*" : keyword;
            keyword = keyword.ToLower();
            if (keyword != "*")
            {
                if (!keyword.StartsWith("*"))
                    keyword = "*" + keyword;
                if (!keyword.EndsWith("*"))
                    keyword = keyword + "*";
            }

            _elasticSearchClientHelper.CreateClient<dynamic>();
            _elasticSearchClientHelper.EsConfigFolder = GetEsConfigFolder();

            List<IndexSearchSummary> indexSearchSummaryList = new List<IndexSearchSummary>();

            isWithStar = false;
            searchWithStarPattern = "";

            #region MainDocument
            var mainDocumentIndex = "maindocument";
            if (ContainIndex(indexes, mainDocumentIndex))
            {
                var cloudInfo = GetCloudInfo();
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson, cloudInfo: cloudInfo);
                var result = _elasticSearchClientHelper.GetIndexSummary(mainDocumentIndex, keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields);

                //Summary for Ids Document Tree
                if (result.Count > 0 && !string.IsNullOrEmpty(idsDocTree))
                {
                    List<IndexSearchSummary> children = new List<IndexSearchSummary>();
                    var lisIds = SplitText(idsDocTree);
                    foreach (var idTree in lisIds)
                    {
                        var fieldsChild = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson, cloudInfo: cloudInfo);
                        fieldsChild.Add(new ESSearchFieldBasic
                        {
                            FieldName = "idTreeRoot",
                            FieldValue = idTree,
                            QueryType = ESQueryType.Term
                        });

                        var resultChild = _elasticSearchClientHelper.GetIndexSummary(mainDocumentIndex, keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fieldsChild);
                        if (resultChild.Count > 0)
                        {
                            resultChild[0].Key = idTree;
                            children.Add(resultChild[0]);
                        }
                    }

                    if (children.Count > 0)
                    {
                        result[0].Children = children;
                    }
                }

                //maindocument with all Ids Document Tree
                indexSearchSummaryList.AddRange(result);

                //remove approval index 
                indexes = RemoveIndex(indexes, mainDocumentIndex);
            }
            #endregion

            #region Approval
            var approvalIndex = "approval";
            if (ContainIndex(indexes, approvalIndex))
            {
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson);
                _elasticSearchClientHelper.IdApplicationOwner = null;
                AddFilterForApprovalIndex(fields);
                var result = _elasticSearchClientHelper.GetIndexSummary(approvalIndex, keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields);
                indexSearchSummaryList.AddRange(result);

                //remove approval index 
                indexes = RemoveIndex(indexes, approvalIndex);
            }
            #endregion

            #region Approval Rejected
            var approvalRejectedIndex = "approvalrejected";
            if (ContainIndex(indexes, approvalRejectedIndex))
            {
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson);
                _elasticSearchClientHelper.IdApplicationOwner = null;
                AddFilterForApprovalIndex(fields);
                var result = _elasticSearchClientHelper.GetIndexSummary(approvalRejectedIndex, keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields);
                indexSearchSummaryList.AddRange(result);

                //remove approval index 
                indexes = RemoveIndex(indexes, approvalRejectedIndex);
            }
            #endregion

            #region Don't filter by IdApplicationOwner
            if (!string.IsNullOrEmpty(_appSettings.ESIndexesNoFilterByIdApplicationOwner))
            {
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson);
                _elasticSearchClientHelper.IdApplicationOwner = null;
                var result = _elasticSearchClientHelper.GetIndexSummary(_appSettings.ESIndexesNoFilterByIdApplicationOwner, keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields);
                indexSearchSummaryList.AddRange(result);
            }
            #endregion

            #region document_indexing
            var documentIndexing = "document_indexing";
            if (ContainIndex(indexes, "document_indexing"))
            {
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson);
                BuildListSearchFieldsWithRole(fields);
                var result = _elasticSearchClientHelper.GetIndexSummary(documentIndexing, keyword, isWithKeywords: false, searchWithStarPattern: "", fields: fields);
                indexSearchSummaryList.AddRange(result);

                //remove documentIndexing
                indexes = RemoveIndex(indexes, documentIndexing);
            }
            #endregion

            //Remove indexes which Don't filter by IdApplicationOwner -> filter by IdApplicationOwner
            indexes = GetIndexesFilterByIdApplicationOwner(indexes);
            _elasticSearchClientHelper.IdApplicationOwner = _idApplicationOwner;

            var listIndex = GetIndexesFilterByCloud(indexes);
            for (int i = 0; i < listIndex.Count; i++)
            {
                if (string.IsNullOrEmpty(listIndex[i])) continue;
                if (listIndex[i] == documentIndexing) continue;
                var cloudInfo = i == 1 ? GetCloudInfo() : null;
                List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson, cloudInfo: cloudInfo);

                var result = _elasticSearchClientHelper.GetIndexSummary(listIndex[i], keyword, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields);
                indexSearchSummaryList.AddRange(result);
            }

            return indexSearchSummaryList;
        }

        /// <summary>
        /// SearchDetail
        /// </summary>
        /// <param name="searchIndex"></param>
        /// <param name="searchType"></param>
        /// <param name="keyword"></param>
        /// <param name="moduleId"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <param name="isWithStar"></param>
        /// <param name="searchWithStarPattern"></param>
        /// <param name="isGetCustomerById"></param>
        /// <param name="onlySearchCampaign"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("SearchDetail")]
        public async Task<EsSearchResult<dynamic>> SearchDetail(string searchIndex, string searchType, string keyword, int moduleId, int pageIndex, int pageSize,
            IList<string> fieldName = null, IList<string> fieldValue = null, bool isWithStar = false, string searchWithStarPattern = null,
            bool isGetCustomerById = false, bool onlySearchCampaign = false, bool isMobileSearch = false,
            string fieldsJson = null)
        {
            isWithStar = false;
            searchWithStarPattern = "";

            keyword = string.IsNullOrEmpty(keyword) ? "*" : keyword;
            keyword = keyword.ToLower();
            if (keyword != "*")
            {
                if (!keyword.StartsWith("*"))
                    keyword = "*" + keyword;
                if (!keyword.EndsWith("*"))
                    keyword = keyword + "*";
            }
            
            if (string.IsNullOrWhiteSpace(searchType))
                searchType = searchIndex;

            var isApprovalIndex = (searchIndex == "approval") || (searchIndex == "approvalrejected");
            var cloudInfo = !isApprovalIndex && ContainsIndexByCloud(searchIndex) ? GetCloudInfo() : null;
            
            List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldName, fieldValue, fieldsJson, cloudInfo: cloudInfo, searchIndex: searchIndex);
            _elasticSearchClientHelper.CreateClient<dynamic>(searchIndex, searchType);
            _elasticSearchClientHelper.EsConfigFolder = GetEsConfigFolder();
            _elasticSearchClientHelper.IdApplicationOwner = isApprovalIndex || ContainsIndexNoFilterByIdApplicationOwner(searchIndex) ? null : _idApplicationOwner;

            if (isApprovalIndex) AddFilterForApprovalIndex(fields);

            var setting = await _uniqueBusiness.GetColumnSetting(moduleId.ToString(), isMobileSearch);
            var sourceFields = ESColumnSettingHelper.BuildSourceFields(setting);
            EsSearchResult<dynamic> resultList = _elasticSearchClientHelper.SearchAny<dynamic>(keyword, pageIndex, pageSize, isWithKeywords: isWithStar, searchWithStarPattern: searchWithStarPattern, fields: fields, isGetCustomerById: isGetCustomerById, onlySearchCampaign: onlySearchCampaign, sourceFields: sourceFields);

            resultList.Setting = setting;
            return resultList;
        }

        /// <summary>
        /// SearchByField
        /// </summary>
        /// <param name="field"></param>
        /// <param name="searchIndex"></param>
        /// <param name="keyword"></param>
        /// <param name="moduleId"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("SearchByField")]
        public async Task<EsSearchResult<dynamic>> SearchByField(string field, string searchIndex, string keyword, int moduleId, int pageIndex, int pageSize,
            IList<string> fieldNames = null, IList<string> fieldValues = null, ESQueryType? queryType = null,
            string fieldsJson = null)
        {
            var isApprovalIndex = (searchIndex == "approval") || (searchIndex == "approvalrejected");
            var cloudInfo = !isApprovalIndex && ContainsIndexByCloud(searchIndex) ? GetCloudInfo() : null;
            List<ESSearchFieldBasic> fields = BuildListSearchFieldBasic(fieldNames, fieldValues, fieldsJson, cloudInfo: cloudInfo);
            _elasticSearchClientHelper.CreateClient<dynamic>(searchIndex);
            _elasticSearchClientHelper.IdApplicationOwner = isApprovalIndex || ContainsIndexNoFilterByIdApplicationOwner(searchIndex) ? null : _idApplicationOwner;

            if (isApprovalIndex) AddFilterForApprovalIndex(fields);

            var setting = await _uniqueBusiness.GetColumnSetting(moduleId.ToString());
            var sourceFields = ESColumnSettingHelper.BuildSourceFields(setting);
            EsSearchResult<dynamic> resultList = _elasticSearchClientHelper.SearchByField<dynamic>(field, keyword, pageIndex, pageSize, fields: fields, queryType: queryType, sourceFields: sourceFields);

            resultList.Setting = setting;
            return resultList;
        }

        #region Article
        /// <summary>
        /// 1. Search with keyword
        /// 2. Search with related article
        /// 3. Get artclenr for manual
        /// </summary>
        /// <param name="searchIndex"></param>
        /// <param name="searchType"></param>
        /// <param name="keyword"></param>
        /// <param name="moduleId"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <param name="isWithStar"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("SearchArticle")]
        //[AllowAnonymous]
        public async Task<object> SearchArticle(string keyword, int pageIndex, int pageSize, bool isGetManualArticleNr = false)
        {
            string searchIndex = "article";
            string searchType = searchIndex;
            int moduleId = 3;//Article

            if (string.IsNullOrWhiteSpace(searchType))
                searchType = searchIndex;

            _elasticSearchClientHelper.CreateClient<dynamic>(searchIndex, searchType);

            EsSearchResult<dynamic> exactList = new EsSearchResult<dynamic>();
            EsSearchResult<dynamic> relatedList = new EsSearchResult<dynamic>();

            keyword = (keyword + string.Empty).Trim();
            keyword = string.IsNullOrEmpty(keyword) ? "*" : keyword;

            keyword = keyword.ToLower();

            if (keyword != "*" && !keyword.Contains("*"))
                keyword = "*" + keyword + "*";

            #region Exact
            ESSearchConditionGroup searchConditionGroup = new ESSearchConditionGroup();
            //searchConditionGroup.Conditions.Add(new ESSearchCondition
            //{
            //    QueryClause = ESQueryClause.Should,
            //    QueryType = ESQueryType.Wildcard,
            //    Fields = new List<ESSearchField>()
            //        {
            //            new ESSearchField{FieldName = "articleNameShort_lower", FieldValue = keyword},
            //            new ESSearchField{FieldName = "articleNr", FieldValue = keyword}
            //        }
            //});
            //exactList = _elasticSearchClientHelper.SearchAnyByCondition<dynamic>(searchConditionGroup, pageIndex, pageSize);
            exactList = _elasticSearchClientHelper.SearchAny<dynamic>(keyword, pageIndex, pageSize, isWithKeywords: true);
            #endregion

            #region Related
            if (exactList.Results.Count > 0)
            {
                //Combine articleGroup
                List<ESArticleIGroup> listGroup = exactList.Results.Select(n => new ESArticleIGroup { articleGroup = n.articleGroup + string.Empty }).ToList();
                Dictionary<string, string> dicGroup = new Dictionary<string, string>();
                foreach (var articleGroup in listGroup)
                {
                    var arrGroups = articleGroup.articleGroup.Split(",", StringSplitOptions.RemoveEmptyEntries);
                    foreach (var group in arrGroups)
                    {
                        dicGroup[group] = group;
                    }
                }

                if (dicGroup.Count > 0)
                {
                    searchConditionGroup = new ESSearchConditionGroup();

                    var esSearchCondition = new ESSearchCondition
                    {
                        QueryClause = ESQueryClause.Should
                    };

                    foreach (KeyValuePair<string, string> item in dicGroup)
                    {
                        esSearchCondition.Fields.Add(new ESSearchField { FieldName = "articleGroup", FieldValue = "," + item.Key + "," });
                    }

                    searchConditionGroup.Conditions.Add(esSearchCondition);
                    relatedList = _elasticSearchClientHelper.SearchAnyByCondition<dynamic>(searchConditionGroup, pageIndex, pageSize);
                }
            }
            #endregion

            var setting = await _uniqueBusiness.GetColumnSetting(moduleId.ToString());
            exactList.Setting = setting;

            if (relatedList.Results != null && relatedList.Results.Count > 0)
            {
                foreach (var item in relatedList.Results)
                {
                    exactList.Results.Add(item);
                }
            }

            if (exactList.Results.Count == 0 && isGetManualArticleNr)
            {
                var articleNrManual = await _articleBusiness.GetArticleNrManual();
                exactList.Payload = articleNrManual;
            }

            return exactList;
        }

        /// <summary>
        /// DeleteIndex
        /// </summary>
        /// <param name="indexes"></param>
        /// <param name="idApplicationOwner"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("DeleteIndex")]
        //[AllowAnonymous]
        public async Task<object> DeleteIndex(string indexes, string idApplicationOwner)
        {
            if (string.IsNullOrEmpty(indexes))
            {
                return StatusCode(400, "indexes Empty");
            }
            var result = _elasticSearchClientHelper.DeleteIndex(indexes, idApplicationOwner);
            return await Task.FromResult(result);
        }

        /// <summary>
        /// Search Detail Advance
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("SearchDetailAdvance")]
        public async Task<EsSearchResult<dynamic>> SearchDetailAdvance([FromBody] ESSearchDetailAdvanceModel model)
        {
            model.Keyword = string.IsNullOrEmpty(model.Keyword) ? "*" : model.Keyword;
            if (string.IsNullOrWhiteSpace(model.SearchType))
                model.SearchType = model.SearchIndex;

            var fieldName = new List<string>();
            var fieldValue = new List<string>();

            #region SelectionProject
            if (_appSettings.IsSelectionProject)
            {
                var isActive = model.SearchIndex.ToLower().Contains("isactive");
                var isArchived = model.SearchIndex.ToLower().Contains("isarchived");
                var subStringLength = isActive ? "isactive".Length : isArchived ? "isarchived".Length : 0;
                model.SearchIndex = model.SearchIndex.Substring(0, model.SearchIndex.Length - subStringLength);
                model.SearchType = model.SearchIndex;

                if (isActive)
                {
                    fieldName.Add("isActive");
                    fieldValue.Add("1");
                }
                if (isArchived)
                {
                    fieldName.Add("isArchived");
                    fieldValue.Add("1");
                }
            }
            #endregion

            #region Prepare Index
            //if (model.SearchIndex == ElasticSearchIndexName.CampaignMediaCode)
            //{
            //    model.SearchIndex = ElasticSearchIndexName.Campaign;
            //    model.SearchType = ElasticSearchIndexName.CampaignMediaCode;
            //}

            //if (model.SearchIndex == ElasticSearchIndexName.CustomerFoot)
            //{
            //    model.SearchIndex = ElasticSearchIndexName.Customer;
            //    model.SearchType = ElasticSearchIndexName.CustomerFoot;
            //}
            //else if (model.SearchIndex == ElasticSearchIndexName.CustomerContact)
            //{
            //    model.SearchIndex = ElasticSearchIndexName.Customer;
            //    model.SearchType = ElasticSearchIndexName.CustomerContact;
            //}
            //else if (model.SearchIndex == ElasticSearchIndexName.CustomerFootContact)
            //{
            //    model.SearchIndex = ElasticSearchIndexName.Customer;
            //    model.SearchType = ElasticSearchIndexName.CustomerFootContact;
            //}
            #endregion

            _elasticSearchClientHelper.CreateClient<dynamic>(model.SearchIndex);

            ESSearchConditionRootGroups rootGroups = model.BuildSearchConditionGroups();
            var resultList = _elasticSearchClientHelper.SearchAnyByCondition<dynamic>(rootGroups, model.PageIndex, model.PageSize);

            var setting = _uniqueBusiness.GetColumnSetting(model.ModuleId.ToString());
            resultList.Setting = await setting;
            return resultList;
        }

        [HttpGet]
        [Route("GetColumnSetting")]
        public async Task<object> GetColumnSetting(int moduleId)
        {
            var setting = await _uniqueBusiness.GetColumnSetting(moduleId.ToString());
            return setting;
        }
        #endregion

        #region Private
        private List<string> SplitText(string text, string separator = ",")
        {
            if (string.IsNullOrEmpty(text)) return new List<string>();

            return text.Split(new string[] { separator }, StringSplitOptions.RemoveEmptyEntries)
                                               .Select(n => n.Trim())
                                               .ToList();
        }

        private string RemoveFakeIndexes(string indexes)
        {
            if (string.IsNullOrEmpty(indexes)) return "";

            string[] arr = indexes.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                               .Select(n => n.Trim())
                                               //.Where(n => n != string.Empty && n != "dashboard")
                                               .ToArray();
            return string.Join(",", arr);
        }

        /// <summary>
        /// Remove Index
        /// 1. All Indexes: email,approval,approvalprocessing
        /// 2. Index need to remove: approval
        /// -> result: email,approvalprocessing
        /// </summary>
        /// <param name="allIndexes"></param>
        /// <param name="indexNeedToRemove"></param>
        /// <returns></returns>
        private string RemoveIndex(string allIndexes, string indexNeedToRemove)
        {
            if (string.IsNullOrEmpty(allIndexes) || string.IsNullOrEmpty(indexNeedToRemove)) return allIndexes;

            var arr = allIndexes.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                               .Select(n => n.Trim())
                                               .ToList();

            arr.Remove(indexNeedToRemove);
            return string.Join(",", arr);
        }

        private bool ContainIndex(string allIndexes, string index)
        {
            return $",{allIndexes},".Contains($",{index},");
        }

        private string GetEsConfigFolder()
        {
            return _pathProvider.MapContentRootPath(string.Format(@"ESConfigs\{0}", "XoonDoc"));
        }

        private List<ESSearchFieldBasic> BuildListSearchFieldBasic(IList<string> fieldName, IList<string> fieldValue, string fieldsJson = null, CloudActiveUserModel cloudInfo = null, string searchIndex = null)
        {
            var fields = new List<ESSearchFieldBasic>();
            if (fieldName != null && fieldName.Count > 0 && fieldValue != null && fieldValue.Count > 0)
            {
                for (int i = 0; i < fieldName.Count; i++)
                {
                    if (i >= fieldValue.Count) break;

                    var field = new ESSearchFieldBasic
                    {
                        FieldName = fieldName[i],
                        FieldValue = Common.RemoveSpecialCharactersCurrency(fieldValue[i]),
                        QueryType = ESQueryType.Wildcard
                    };
                    var fName = fieldName[i].ToLower();
                    if (fName.Contains("idperson"))
                    {
                        field.QueryType = ESQueryType.Term;
                    }
                    else if (fName == "idtreeroot" || fName == "iddocumenttree")
                    {
                        //if(!string.IsNullOrEmpty(searchIndex) && searchIndex == "maindocument")
                        //    field.FieldName = "idTreeRoot";
                        field.QueryType = fieldValue[i].Contains(",") ? ESQueryType.Terms : ESQueryType.Term;
                    }
                    fields.Add(field);
                }
            }

            if (cloudInfo != null)
            {
                fields.Add(new ESSearchFieldBasic
                {
                    FieldName = "clientId",
                    FieldValue = cloudInfo.ClientId,
                    QueryType = ESQueryType.Wildcard
                });
                fields.Add(new ESSearchFieldBasic
                {
                    FieldName = "idCloudProviders",
                    FieldValue = cloudInfo.IdCloudProviders + string.Empty,
                    QueryType = ESQueryType.Term
                });
            }

            if (fieldsJson != null)
            {
                ParseAndBuildListSearchFieldBasic(fields, fieldsJson);
            }
            if (new List<string> { "document_indexing" }.Contains(searchIndex))
            {
                BuildListSearchFieldsWithRole(fields);
            }

            return fields;
        }

        private string GetIndexesFilterByIdApplicationOwner(string indexes)
        {
            List<string> listIndex = new List<string>();

            var indexesNoFilterByIdApplicationOwner = _appSettings.ESIndexesNoFilterByIdApplicationOwner + string.Empty;
            if (indexesNoFilterByIdApplicationOwner == string.Empty)
                return indexes;

            string[] arrIndexes = indexes.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(n => n.Trim()).ToArray();
            foreach (var index in arrIndexes)
            {
                if (!indexesNoFilterByIdApplicationOwner.Contains($",{index},"))
                    listIndex.Add(index);
            }//for

            return string.Join(",", listIndex);
        }

        /// <summary>
        /// * Return two arrays:
        ///   1: Remaining Indexes
        ///   2: Indexes Filter ByCloud
        /// </summary>
        /// <param name="indexes"></param>
        /// <returns></returns>
        private List<string> GetIndexesFilterByCloud(string indexes)
        {
            if (!_appSettings.EnableCloud)
            {
                return new List<string>() { indexes };
            }

            List<string> listIndex = new List<string>();

            var remainingIndexes = "";
            var indexesFilterByCloud = "";
            if (string.IsNullOrEmpty(_appSettings.ESIndexesFilterByCloud))
            {
                remainingIndexes = indexes;
            }
            else
            {
                string[] arrIndexes = indexes.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(n => n.Trim()).ToArray();
                foreach (var index in arrIndexes)
                {
                    if (ContainsIndexByCloud(index))
                        indexesFilterByCloud += $"{index},";
                    else
                        remainingIndexes += $"{index},";
                }
            }

            listIndex.Add(remainingIndexes);
            listIndex.Add(indexesFilterByCloud);
            return listIndex;
        }

        private bool ContainsIndexByCloud(string index)
        {
            if (!_appSettings.EnableCloud || _appSettings.ESIndexesFilterByCloud == null) return false;

            return (_appSettings.ESIndexesFilterByCloud + string.Empty).Contains($",{index},");
        }

        private bool ContainsIndexNoFilterByIdApplicationOwner(string index)
        {
            return (_appSettings.ESIndexesNoFilterByIdApplicationOwner + string.Empty).Contains($",{index},");
        }

        /// <summary>
        /// Detect info Cloud of user
        /// </summary>
        /// <returns></returns>
        private CloudActiveUserModel GetCloudInfo()
        {
            if (!_appSettings.EnableCloud) return null;

            CloudActiveUserModel cloudInfo = null;
            try
            {
                cloudInfo = _cloudBusiness.GetCloudActiveOfUser();
                if (cloudInfo == null ||
                    cloudInfo.IdCloudProviders == -1 ||
                    string.IsNullOrEmpty(cloudInfo.ClientId))
                    return null;
            }
            catch { }
            return cloudInfo;
        }

        private void ParseAndBuildListSearchFieldBasic(List<ESSearchFieldBasic> fields, string fieldsJson)
        {
            if (string.IsNullOrEmpty(fieldsJson)) return;
            try
            {
                /*
                    [
                      {
                        "Name":"id",
                        "Val":"a",
                        "QType" : "Wildcard"
                      }
                    ]
                 */
                fieldsJson = fieldsJson.Replace("\\", "");
                var list = JsonConvert.DeserializeObject<List<EsClientQueryStringJsonSearchModel>>(fieldsJson);
                foreach (var item in list)
                {
                    fields.Add(new ESSearchFieldBasic
                    {
                        FieldName = item.Name,
                        FieldValue = item.Val,
                        QueryType = item.QType
                    });
                }//for
            }
            catch (Exception ex) { }
        }

        private void AddFilterForApprovalIndex(List<ESSearchFieldBasic> fields)
        {
            if (fields == null) fields = new List<ESSearchFieldBasic>();

            fields.Add(new ESSearchFieldBasic
            {
                FieldName = "assignedLoginIds",
                FieldValue = $"*|{_idLogin}|*",
                QueryType = ESQueryType.Wildcard
            });
        }

        private void BuildListSearchFieldsWithRole(List<ESSearchFieldBasic> fields)
        {
            if (_baseBusiness.UserFromService.IsSuperAdmin.HasValue && _baseBusiness.UserFromService.IsSuperAdmin.Value == true)
            {
                //see all data
            }
            else if (_baseBusiness.UserFromService.IsAdmin.HasValue && _baseBusiness.UserFromService.IsAdmin.Value == true)
            {
                //filter data by IdSharingCompany
                fields.Add(new ESSearchFieldBasic
                {
                    FieldName = "idSharingCompany",
                    FieldValue = _idSharingCompany,
                    QueryType = ESQueryType.Term
                });
            }
            else
            {
                //filter data by _idLogin
                fields.Add(new ESSearchFieldBasic
                {
                    FieldName = "idLogin",
                    FieldValue = _idLogin,
                    QueryType = ESQueryType.Term
                });
            }
        }
        #endregion
    }
}
