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
    public class ArticleController : BaseController
    {
        private readonly IArticleBusiness _articleBusiness;

        public ArticleController(IArticleBusiness articleBusiness)
        {
            _articleBusiness = articleBusiness;
        }

        // GET: api/article/GetArticleById
        [HttpGet]
        [Route("GetArticleById")]
        public async Task<object> GetArticleById(int idArticle, string idLanguage)
        {
            return await _articleBusiness.GetArticle(idArticle, idLanguage);
        }

        // GET: api/article/CheckArticleNr
        [HttpGet]
        [Route("CheckArticleNr")]
        public async Task<object> CheckArticleNr(string articleNr, string currentArticleNr = "")
        {
            return await _articleBusiness.CheckArticleNrIsExisted(articleNr, currentArticleNr);
        }

        // GET: api/article/SearchArticleByNr
        [HttpGet]
        [Route("SearchArticleByNr")]
        public async Task<object> SearchArticleByNr(string mediaCode, string articleNr, string idCountrylanguage)
        {
            return await _articleBusiness.SearchArticleByNr(mediaCode, articleNr, idCountrylanguage);
        }

        // GET: api/article/GetArticleSetComposition
        [HttpGet]
        [Route("GetArticleSetComposition")]
        public async Task<object> GetArticleSetComposition(int idArticle)
        {
            return await _articleBusiness.GetArticleSetComposition(idArticle);
        }

        // POST: api/article/CreateArticle
        [HttpPost]
        [Route("CreateArticle")]
        public async Task<object> CreateArticle([FromBody]ArticleEditModel model)
        {
            return await _articleBusiness.CreateArticle(model);
        }

        // POST: api/article/UpdateArticle
        [HttpPost]
        [Route("UpdateArticle")]
        public async Task<object> UpdateArticle([FromBody]ArticleEditModel model)
        {
            return await _articleBusiness.UpdateArticle(model);
        }

        // POST: api/article/UpdateArticlePurchasing
        [HttpPost]
        [Route("InsertArticlePurchasing")]
        public async Task<object> InsertArticlePurchasing([FromBody]IList<ArticlePurchasingEditModel> model)
        {
            return await _articleBusiness.InsertArticlePurchasing(model);
        }

        // POST: api/article/UpdateArticleSetComposition
        [HttpPost]
        [Route("UpdateArticleSetComposition")]
        public async Task<object> UpdateArticleSetComposition([FromBody]IList<ArticleSetCompositionEditModel> model)
        {
            return await _articleBusiness.UpdateArticleSetComposition(model);
        }

        // GET: api/article/GetArticleMedia
        [HttpGet]
        [Route("GetArticleMedia")]
        public async Task<object> GetArticleMedia(int idArticle)
        {
            return await _articleBusiness.GetArticleMedia(idArticle);
        }

        // POST: api/article/InsertArticleMedia
        [HttpPost]
        [Route("InsertArticleMedia")]
        public async Task<object> InsertArticleMedia([FromBody]ArticleMediaEditModel model)
        {
            return await _articleBusiness.InsertArticleMedia(model);
        }

        // POST: api/article/UpdateArticleMedia
        [HttpPost]
        [Route("UpdateArticleMedia")]
        public async Task<object> UpdateArticleMedia([FromBody]ArticleMediaEditModel model)
        {
            return await _articleBusiness.UpdateArticleMedia(model);
        }

    }
}
