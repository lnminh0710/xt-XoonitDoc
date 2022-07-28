using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class AttachmentModel
    {
        public int IdPerson { get; set; }
        public int IdDocumentTree { get; set; }
        public int IdDocumentContainerScans { get; set; }
        public string DocumentType { get; set; }
        public string ContactType { get; set; }
        public string ScannedFilename { get; set; }
        public string CreateDocument { get; set; }
        public string IdMainDocument { get; set; }
        public string IdRepDocumentGuiType { get; set; }
    }
}
