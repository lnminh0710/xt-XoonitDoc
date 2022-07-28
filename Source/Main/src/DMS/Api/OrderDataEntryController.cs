using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using DMS.Utils;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    /// <summary>
    /// OrderDataEntryController
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class OrderDataEntryController : BaseController
    {
        private readonly IOrderDataEntryBusiness _orderDataEntryBusiness;

        public OrderDataEntryController(IOrderDataEntryBusiness orderDataEntryBusiness)
        {
            _orderDataEntryBusiness = orderDataEntryBusiness;
        }

        // POST: api/OrderDataEntry/CreateLotName
        [HttpPost]
        [Route("CreateLotName")]
        public async Task<object> CreateLotName([FromBody]LotData model)
        {
            var result = _orderDataEntryBusiness.CreateLotName(model);

            return await result;
        }

        // GET: api/OrderDataEntry/DeleteLot
        [HttpGet]
        [Route("DeleteLot")]
        public async Task<object> DeleteLot(string lotId)
        {
            return await _orderDataEntryBusiness.DeleteLot(lotId);
        }


        // GET: api/OrderDataEntry/DeleteLotItem
        [HttpGet]
        [Route("DeleteLotItem")]
        public async Task<object> DeleteLotItem(string idScansContainerItems)
        {
            return await _orderDataEntryBusiness.DeleteLotItem(idScansContainerItems);
        }

        // POST: api/OrderDataEntry/SaveScanningOrder
        [HttpPost]
        [Route("SaveScanningOrder")]
        public async Task<object> SaveScanningOrder([FromBody]ScanningLotItemData model)
        {
            var result = _orderDataEntryBusiness.SaveScanningOrder(model);

            return await result;
        }

        // GET: api/OrderDataEntry/GetPreloadOrderData
        [HttpGet]
        [Route("GetPreloadOrderData")]
        public async Task<object> GetPreloadOrderData(string mode, int? skipIdPreload, int? idScansContainerItems, int? lotId)
        {
            var result = _orderDataEntryBusiness.GetPreloadOrderData(mode, skipIdPreload, idScansContainerItems, lotId);

            return await result;
        }
    }
}
