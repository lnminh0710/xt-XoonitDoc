using System.Collections.Generic;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsSearchResult
    /// </summary>
    public class EsSearchResult<T> where T : class
    {
        /// <summary>
        /// PageIndex
        /// </summary>
        public int PageIndex { get; set; }

        /// <summary>
        /// PageSize
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Total
        /// </summary>
        public long Total { get; set; }

        /// <summary>
        /// Results
        /// </summary>
        public IList<T> Results { get; set; }        

        /// <summary>
        /// Setting
        /// </summary>
        public object Setting { get; set; }

        /// <summary>
        /// Payload
        /// </summary>
        public object Payload { get; set; }

        public string RawQuery { get; set; }
    }
}
