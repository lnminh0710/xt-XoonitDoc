using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    /// <summary>
    /// BackofficeController
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class BackofficeController : Controller
    {
        private readonly IPurchaseReportBusiness _purchaseReportBusiness;

        public BackofficeController(IPurchaseReportBusiness purchaseReportBusiness)
        {
            _purchaseReportBusiness = purchaseReportBusiness;
        }

        // GET: /<controller>/
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Index()
        {
            _purchaseReportBusiness.CreateReport();
            return View();
        }
    }
}
