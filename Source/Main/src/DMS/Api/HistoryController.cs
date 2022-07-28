using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models.DMS.ViewModels;
using DMS.Models.History;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DMS.Api
{
    [Route("api/[controller]")]
    //[Authorize]
    public class HistoryController : BaseController
    {
        private readonly IHistorytBusiness _historyBusiness;
        public HistoryController(IHistorytBusiness historytBusiness)
        {
            _historyBusiness = historytBusiness;
        }

        [HttpGet]
        [Route("AllHistoryDocument")]
        public async Task<object> GetDocumentHistory()
        {
            return await _historyBusiness.GetDocumentHistory();
        }

        [HttpGet]
        [Route("ScanningHistory")]
        public async Task<AgGridHistoryViewModel> GetScanningHistory(ScanningHistoryFilter filter)
        {
            return await _historyBusiness.GetScanningHistoryList(filter);
        }

        [HttpGet]
        [Route("ScanningHistoryDetail")]
        public async Task<AgGridHistoryDetailViewModel> GetScanningHistoryDetail([FromQuery] ScanningHistoryDetailParameters @params)
        {
            if (!ModelState.IsValid)
            {
                return new AgGridHistoryDetailViewModel(new object[] { }, new ColumnDefinitionViewModel[] { }, 0);
            }
            return await _historyBusiness.GetScanningHistoryDetail(@params);
        }

        [HttpGet]
        [Route("HistoryUsers")]
        public async Task<object> GetHistoryUsersByFilter(string filter)
        {
            return await _historyBusiness.GetHistoryUsersByFilter(filter);
        }
    }
}
