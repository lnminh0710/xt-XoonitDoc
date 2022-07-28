using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using System.Reflection;
using Newtonsoft.Json;
using DMS.Utils.ElasticSearch;

namespace DMS.Business
{
    public class ArticleBusiness : BaseBusiness, IArticleBusiness
    {
        private readonly IArticleService _articleService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;

        public ArticleBusiness(IHttpContextAccessor context, IArticleService articleService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness) : base(context)
        {
            _articleService = articleService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
        }

        public async Task<WSDataReturn> CheckArticleNrIsExisted(string articleNr, string currentArticleNr = "")
        {
            ArticleCheckData data = (ArticleCheckData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleCheckData));
            data.ArticleNr = articleNr;
            data.CurrentArticleNr = currentArticleNr;
            var result = await _articleService.CheckArticleNrIsExisted(data);
            return result;
        }

        public async Task<WSEditReturn> CreateArticle(ArticleEditModel model)
        {
            ArticleCreateData data = (ArticleCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleCreateData));
            data = (ArticleCreateData)Common.MappModelToData(data, model);
            var result = await _articleService.CreateArticle(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    ModuleType = ModuleType.Article,
                    KeyId = result.ReturnID
                });
            }

            return result;
        }

        public async Task<WSEditReturn> UpdateArticle(ArticleEditModel model)
        {
            ArticleUpdateData data = (ArticleUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleUpdateData));
            data = (ArticleUpdateData)Common.MappModelToData(data, model);
            var result = await _articleService.UpdateArticle(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    ModuleType = ModuleType.Article,
                    KeyId = result.ReturnID
                });
            }

            return result;
        }

        public async Task<ArticleModel> GetArticle(int articleId, string idLanguage)
        {
            ArticleData data = (ArticleData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleData));
            data.IdArticle = articleId.ToString();
            if (!string.IsNullOrWhiteSpace(idLanguage))
            {
                data.LoginLanguage = idLanguage;
            }
            var result = await _articleService.GetArticle(data);
            return result;
        }

        public async Task<WSEditReturn> InsertArticlePurchasing(IList<ArticlePurchasingEditModel> model)
        {
            if (model != null && model.Count > 0)
            {
                ArticleCreateData data = (ArticleCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleCreateData));
                var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""ArticleSalesPricing"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _articleService.InsertArticlePurchasing(data);
                return result;
            }
            return null;
        }

        public async Task<object> GetArticleSetComposition(int articleId)
        {
            ArticleData data = (ArticleData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleData));
            data.IdArticle = articleId.ToString();
            data.WidgetTitle = "Aticle Set...";
            var result = await _articleService.GetArticleSetComposition(data);
            return result;
        }

        public async Task<WSEditReturn> UpdateArticleSetComposition(IList<ArticleSetCompositionEditModel> model)
        {
            if (model != null && model.Count > 0)
            {
                ArticleCreateData data = (ArticleCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleCreateData));
                var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""ArticleSet"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _articleService.UpdateArticleSetComposition(data);
                return result;
            }
            return null;
        }

        public async Task<object> GetArticleMedia(int articleId)
        {
            ArticleData data = (ArticleData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleData));
            data.IdArticle = articleId.ToString();
            data.WidgetTitle = "Aticle Set...";
            var result = await _articleService.GetArticleMedia(data);
            return result;
        }

        public async Task<WSEditReturn> InsertArticleMedia(ArticleMediaEditModel model)
        {
            ArticleMediaCreateData data = (ArticleMediaCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleMediaCreateData));
            data = (ArticleMediaCreateData)Common.MappModelToData(data, model);
            var result = await _articleService.InsertArticleMedia(data);
            return result;
        }

        public async Task<WSEditReturn> UpdateArticleMedia(ArticleMediaEditModel model)
        {
            ArticleMediaUpdateData data = (ArticleMediaUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleMediaUpdateData));
            data = (ArticleMediaUpdateData)Common.MappModelToData(data, model);
            var result = await _articleService.UpdateArticleMedia(data);
            return result;
        }

        public async Task<WSDataReturn> SearchArticleByNr(string mediaCode, string articleNr, string idCountrylanguage)
        {
            ArticleCheckData data = (ArticleCheckData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleCheckData));
            data.ArticleNr = articleNr;
            data.MediaCode = mediaCode;
            data.IdCountrylanguage = idCountrylanguage;
            var result = await _articleService.SearchArticleByNr(data);
            return result;
        }

        /// <summary>
        /// InsertArticleMediaZip
        /// </summary>
        /// <param name="articleMediaZipInfos"></param>
        /// <returns></returns>
        public async Task<object> InsertArticleMediaZip(IList<ArticleMediaZipInfo> articleMediaZipInfos)
        {
            ArticleMediaZipData data = (ArticleMediaZipData)ServiceDataRequest.ConvertToRelatedType(typeof(ArticleMediaZipData));
            var modelValue = JsonConvert.SerializeObject(articleMediaZipInfos, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""ArticleImages"":{0}", modelValue);
            data.JSONText = "{" + data.JSONText + "}";
            var result = await _articleService.InsertArticleMediaZip(data);
            return result;
        }

        public async Task<object> GetArticleNrManual()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _articleService.GetArticleNrManual(data);
            return result;
        }
    }
}
