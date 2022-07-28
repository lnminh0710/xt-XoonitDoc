using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DMS.Models.DMS.ViewModels
{
    public class DocumentTreeViewModel
    {
        public int? IdDocument { get; set; }
        public int? IdDocumentParent { get; set; }
        [Required]
        public int IdDocumentType { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public int Order { get; set; }
        [Required]
        public string Icon { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
        public bool IsActive { get; set; }

        public string IdRepDocumentGuiType { get; set; }

        [JsonIgnore]
        public string IsReadOnly { get; set; }
        
        public string IsDeleted { get; set; }
        public string IdLogin { get; set; }

        public string oldFolderName { get; set; }
        public string oldPath { get; set; }

        public string IdDocuments { get; set; }
    }

    public class UpdatedDocumentTreeViewModel : DocumentTreeViewModel
    {
        public string OldFolderName { get; set; }

        [JsonProperty("Path")]
        public string FilePath { get; set; }
    }


    public class DocumentModel
    {
        public string FileName { get; set; }
        public string OldFileName { get; set; }
        
        public string FilePath { get; set; }
        public string IsDeleted { get; set; }
        public string IdLogin { get; set; }
        public string IsRenamed { get; set; }

        public string SizeOfDocument { get; set; }
        public string CreatedDate { get; set; }
        public string LastModify { get; set; }

        public string IsMoveToOther { get; set; }
        public string NewFolder { get; set; }
    }
}
