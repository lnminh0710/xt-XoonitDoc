using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class AttachmentViewModel
    {
        public string IdPerson { get; set; }
        public string CreateDate { get; set; }
        public string IdApplicationOwner { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdMainDocument { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdRepDocumentGuiType { get; set; }
        public string RootName { get; set; }
        public string LocalPath { get; set; }
        public string CloudMediaPath { get; set; }
        public string GroupName { get; set; }
        public string MediaName { get; set; }
        public string Contacts { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string FullText { get; set; }
        public string LocalFileName { get; set; }
    }
}
