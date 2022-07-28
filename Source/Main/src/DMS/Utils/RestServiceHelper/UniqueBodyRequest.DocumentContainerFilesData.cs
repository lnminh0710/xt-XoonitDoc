using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.RestServiceHelper
{
    public class DocumentContainerFilesLogSaveData : Data
    {
        public int? IdDocumentContainerFilesLog { get; set; }
        public string FileName { get; set; }


        public dynamic JsonLog { get; set; }

        public string IsActive { get; set; }

        public string IsDeleted { get; set; }
    }
}
