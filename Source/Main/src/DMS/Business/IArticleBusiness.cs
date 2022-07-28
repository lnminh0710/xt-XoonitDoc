using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IArticleBusiness
    {
        /// <summary>
        /// CreateArticle
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateArticle(ArticleEditModel model);

        /// <summary>
        /// UpdateArticle
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticle(ArticleEditModel model);

        /// <summary>
        /// GetArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<ArticleModel> GetArticle(int articleId, string idLanguage);

        /// <summary>
        /// CheckArticleNrIsExisted
        /// </summary>
        /// <param name="articleNr"></param>
        /// <param name="currentArticleNr"></param>
        /// <returns></returns>
        Task<WSDataReturn> CheckArticleNrIsExisted(string articleNr, string currentArticleNr);

        /// <summary>
        /// SearchArticleByNr
        /// </summary>
        /// <param name="mediaCode"></param>
        /// <param name="articleNr"></param>
        /// <returns></returns>
        Task<WSDataReturn> SearchArticleByNr(string mediaCode, string articleNr, string idCountrylanguage);

        /// <summary>
        /// LoadArticleSetComposition
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetArticleSetComposition(int articleId);

        /// <summary>
        /// UpdateArticleSetComposition
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticleSetComposition(IList<ArticleSetCompositionEditModel> model);

        /// <summary>
        /// InsertArticlePurchasing
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> InsertArticlePurchasing(IList<ArticlePurchasingEditModel> model);

        /// <summary>
        /// GetArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetArticleMedia(int articleId);

        /// <summary>
        /// InsertArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> InsertArticleMedia(ArticleMediaEditModel model);

        /// <summary>
        /// InsertArticleMediaZip
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> InsertArticleMediaZip(IList<ArticleMediaZipInfo> articleMediaZipInfos);

        /// <summary>
        /// UpdateArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticleMedia(ArticleMediaEditModel model);

        Task<object> GetArticleNrManual();
    }
}
