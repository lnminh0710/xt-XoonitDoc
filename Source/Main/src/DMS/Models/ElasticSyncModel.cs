using System;

namespace DMS.Models
{
    /// <summary>
    /// ElasticSyncModel
    /// </summary>
    public class ElasticSyncModel
    {
        /// <summary>
        /// ModuleType
        /// </summary>
        public ModuleType? ModuleType { get; set; }

        /// <summary>
        /// GlobalModule
        /// </summary>
        public GlobalModule GlobalModule { get; set; }

        /// <summary>
        /// Object
        /// </summary>
        public string Object { get; set; }

        /// <summary>
        /// SearchIndexKey
        /// </summary>
        public string SearchIndexKey { get; set; }

        /// <summary>
        /// KeyId
        /// </summary>
        public string KeyId { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }        

        /// <summary>
        /// StartDate
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// IdPersonType
        /// </summary>
        public int? IdPersonType { get; set; }
    }
    public class ElasticSyncResultModel
    {
        public string Object { get; set; }
        public bool IsSuccess { get; set; }
        public int Count { get; set; }
    }
    public class ElasticSyncSaveDocument
    {
        public string IndexName { get; set; }
        public string IdMainDocument { get; set; }
        public string IdDocumentContainerScans { get; set; }
    }
}
