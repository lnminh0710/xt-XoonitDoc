using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.History
{
    public class ScanningHistoryDetailParameters
    {
        [Required]
        public string Date { get; set; }

        public string Email { get; set; }

        public int? UserId { get; set; }

        public int? IdDocument { get; set; }

        [BindProperty(Name = "Company")]
        public int? CompanyId { get; set; }
    }
}
