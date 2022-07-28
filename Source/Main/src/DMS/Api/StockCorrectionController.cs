using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class StockCorrectionController : BaseController
    {
        private readonly IBackOfficeBusiness _stockCorrectionBusiness;

        public StockCorrectionController(IBackOfficeBusiness stockCorrectionBusiness)
        {
            _stockCorrectionBusiness = stockCorrectionBusiness;
        }

        // GET: api/StockCorrection/GetStockCorrection
        [HttpGet]
        [Route("GetStockCorrection")]
        public async Task<object> GetStockCorrection()
        {
            var result = _stockCorrectionBusiness.GetStockCorrection();

            return await result;
        }

        // GET: api/StockCorrection/GetWarehouseArticle
        [HttpGet]
        [Route("GetWarehouseArticle")]
        public async Task<object> GetWarehouseArticle(string articleNr, long warehouseId)
        {
            var result = _stockCorrectionBusiness.GetWarehouseArticle(articleNr, warehouseId);

            return await result;
        }

        // POST: api/StockCorrection/SaveStockCorrection
        [HttpPost]
        [Route("SaveStockCorrection")]
        public async Task<object> SaveStockCorrection([FromBody]StockCorrectionModel model)
        {
            var result = _stockCorrectionBusiness.SaveStockCorrection(model);

            return await result;
        }
    }
}
