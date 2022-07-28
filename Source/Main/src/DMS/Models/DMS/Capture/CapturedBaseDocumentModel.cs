using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.Capture
{
    public class CapturedBaseDocumentModel
    {
        public MainDocumentModel MainDocument { get; set; }
        public DocumentTreeMediaModel DocumentTreeMedia { get; set; }
        public IEnumerable<DynamicFieldModel> DynamicFields { get; set; }

        [JsonProperty(PropertyName = "FolderChange")]
        public FolderCapturedDocumentModel ChangeDocumentIdentity { get; set; }

        public object JSONMainDocumentNotes { get; set; }

        public string IdLogin { get; set; }
        public string IdApplicationOwner { get; set; }
    }

    public class FolderCapturedDocumentModel
    {
        public string IdDocumentTree { get; set; }
        public string IdMainDocument { get; set; }
    }
}
