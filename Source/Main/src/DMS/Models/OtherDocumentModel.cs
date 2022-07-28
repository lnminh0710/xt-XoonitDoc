using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace DMS.Models
{
    public class SaveOtherDocumentModel : CapturedBaseDocumentModel
    {
        public OtherDocumentFormViewModel OtherDocuments { get; set; }
        public PersonContactFormModel PersonContact { get; set; }
        public PersonContactFormModel PersonPrivat { get; set; }

        [JsonIgnore]
        public object PersonContactComm { get; set; }
        [JsonIgnore]
        public object PersonPrivatComm { get; set; }
    }

    public class OtherDocumentFormViewModel
    {
        public string Notes { get; set; }
        public string IdOtherDocuments { get; set; }
    }

    public class ImportPriceTagDocumentSessionModel
    {
        public string IdPriceTag { get; set; }

        public string IdProduct { get; set; }

        public string IdProjects { get; set; }
        public string IdProjectsMedia { get; set; }


        public string IdDocumentType { get; set; }

        public string IdLogin { get; set; }
        public string IdApplicationOwner { get; set; }

        public string IdPriceTagMedia { get; set; }
        public string IdDocumentTreeMedia { get; set; }
        public string IdRepDocumentType { get; set; }

        public string MediaRelativePath { get; set; }

        public string MediaName { get; set; }

        public string IdDocumentTree { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string IdProjectsItems { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public string Additional { get; set; }

    }
}
