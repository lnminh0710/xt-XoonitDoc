using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentInfo
    {
        public string Id { get; set; }
        public dynamic FileName { get; set; }
        public dynamic Folder { get; set; }
        public dynamic Content { get; set; }
        public dynamic Tags { get; set; }
        public dynamic Keywords { get; set; }
        public dynamic Category { get; set; }
        public dynamic CreatedDate { get; set; }
    }
}
