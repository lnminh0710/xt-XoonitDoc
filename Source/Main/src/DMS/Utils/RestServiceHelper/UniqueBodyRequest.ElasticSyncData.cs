using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// ElasticSyncData
    /// </summary>
    public class ElasticSyncData : Data
    {
        /// <summary>
        /// KeyId
        /// </summary>
        public string KeyId { get; set; }

        /// <summary>
        /// StartDate
        /// </summary>
        public string StartDate { get; set; }

        /// <summary>
        /// IdPersonType
        /// </summary>
        public int? IdPersonType { get; set; }

        public string IdPerson { get; set; }
    }

    public class ElasticSyncDocumentOCRData : Data
    {
        /// <summary>
        /// KeyId
        /// </summary>
        public string KeyId { get; set; }

        /// <summary>
        /// StartDate
        /// </summary>
        public string StartDate { get; set; }

        /// <summary>
        /// IdPersonType
        /// </summary>
        public string IdDocumentContainerFileType { get; set; }

        public string PageSize { get; set; }


        public string PageIndex { get; set; }
    }
}
