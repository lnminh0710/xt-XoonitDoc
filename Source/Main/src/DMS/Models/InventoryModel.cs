using System.Collections.Generic;
using System.IO;

namespace DMS.Models
{
    public class InventoryImportFileModel
    {
        public Stream File { get; set; }

        /// <summary>
        /// Column Names for checking
        /// </summary>
        public List<string> ColumnNames { get; set; }
    }

    public class InventoryImportFileResult
    {
        public string Message { get; set; }

        //public IList<object> Data { get; set; }
        public IList<InventoryImportItem> Data { get; set; }
    }

    public class InventoryImportItem
    {
        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        public int Qty { get; set; }
    }
}
