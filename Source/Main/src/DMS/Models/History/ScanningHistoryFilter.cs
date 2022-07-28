using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.History
{
    public class ScanningHistoryFilter
    {
        public string FromDate { get; set; }

        public string ToDate { get; set; }

        public int? UserId { get; set; }

        public int? IdDocument { get; set; }

        [BindProperty(Name = "Company")]
        public int? CompanyId { get; set; }

        public int PageIndex { get; set; }

        public int PageSize { get; set; }

        public string Category { get; set; }

    }
}
