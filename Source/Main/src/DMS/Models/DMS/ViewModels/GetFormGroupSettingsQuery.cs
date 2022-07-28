using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace DMS.Models.DMS.ViewModels
{
    /// <summary>
    /// GetFormGroupSettingsQuery
    /// </summary>
    public class GetFormGroupSettingsQuery
    {
        /// <summary>
        /// IdMainDocument
        /// </summary>
        public string IdMainDocument { get; set; }

        /// <summary>
        /// IdDocumentContainerScans
        /// </summary>
        public string IdDocumentContainerScans { get; set; }
        
        /// <summary>
        /// IdRepDocumentGuiType
        /// </summary>
        [FromQuery(Name = "idDocumentType")]
        public string IdRepDocumentGuiType { get; set; }

        /// <summary>
        /// IdBranch
        /// </summary>
        [FromQuery(Name = "idBranch")]
        public int? IdBranch { get; set; }

        /// <summary>
        /// MethodName
        /// </summary>
        [Required]
        public string MethodName { get; set; }

        /// <summary>
        /// Object
        /// </summary>
        [Required]
        public string Object { get; set; }

        /// <summary>
        /// Mode
        /// </summary>
        public string Mode { get; set; }

        public string IdPerson { get; set; }
    }
}
