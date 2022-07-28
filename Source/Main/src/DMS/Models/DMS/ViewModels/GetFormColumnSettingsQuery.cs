using Microsoft.AspNetCore.Mvc;

namespace DMS.Models.DMS.ViewModels
{
    public class GetFormColumnSettingsQuery
    {
        [FromQuery(Name = "idMainDocument")]
        public int? IdMainDocument { get; set; }
        [FromQuery(Name = "idBranch")]
        public int? IdBranch { get; set; }
    }
}
