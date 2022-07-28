using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IArticleService
    {

        /// <summary>
        /// GetArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<ArticleModel> GetArticle(ArticleData data);

        /// <summary>
        /// CreateArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateArticle(ArticleCreateData data);

        /// <summary>
        /// UpdateArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticle(ArticleUpdateData data);

        /// <summary>
        /// CheckArticleNrIsExisted
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSDataReturn> CheckArticleNrIsExisted(ArticleCheckData data);

        /// <summary>
        /// SearchArticleByNr
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSDataReturn> SearchArticleByNr(ArticleCheckData data);

        /// <summary>
        /// LoadArticleSetComposition
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetArticleSetComposition(ArticleData data);

        /// <summary>
        /// UpdateArticleSetComposition
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticleSetComposition(ArticleCreateData data);

        /// <summary>
        /// InsertArticlePurchasing
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> InsertArticlePurchasing(ArticleCreateData data);

        /// <summary>
        /// LoadArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetArticleMedia(ArticleData data);

        /// <summary>
        /// InsertArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> InsertArticleMedia(ArticleMediaCreateData data);

        /// <summary>
        /// InsertArticleMediaZip
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSDataReturn> InsertArticleMediaZip(ArticleMediaZipData data);

        /// <summary>
        /// UpdateArticleMedia
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateArticleMedia(ArticleMediaUpdateData data);

        Task<object> GetArticleNrManual(Data data);
    }
}
