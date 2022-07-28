using DMS.Models.ViewModels.DynamicControlDefinitions;
using System.ComponentModel.DataAnnotations;

namespace DMS.Models.DMS.ViewModels
{
    public class SaveFormColumnSettings
    {
        [Required]
        public DocumentTreeViewModel Folder { get; set; }

        [Required]
        public MainDocumentModel MainDocument { get; set; }

        [Required]
        public DocumentTreeMediaModel DocumentTreeMedia { get; set; }

        [Required]
        public FormGroupDefinitionViewModel FormGroupDefinition { get; set; }
    }
}
