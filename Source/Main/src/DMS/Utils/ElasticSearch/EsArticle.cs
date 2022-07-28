using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsArticle
    /// </summary>
    public class EsArticle
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id
        {
            get
            {
                return IdArticle;
            }
        }

        /// <summary>
        /// IdArticle
        /// </summary>
        public int IdArticle { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }

        /// <summary>
        /// ArticleStatus
        /// </summary>
        public string ArticleStatus { get; set; }

        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        /// <summary>
        /// ArticleNameShort
        /// </summary>
        public string ArticleNameShort { get; set; }

        /// <summary>
        /// IsSetArticle
        /// </summary>
        public bool IsSetArticle { get; set; }

        /// <summary>
        /// IsWarehouseControl
        /// </summary>
        public bool IsWarehouseControl { get; set; }

        /// <summary>
        /// IsVirtual
        /// </summary>
        public bool IsVirtual { get; set; }

        /// <summary>
        /// IsPrintProduct
        /// </summary>
        public bool IsPrintProduct { get; set; }

        /// <summary>
        /// IsService
        /// </summary>
        public bool IsService { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public string UpdateDate { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        public string Country { get; set; }
    }
}
