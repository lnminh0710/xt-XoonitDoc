using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DMS.Service;
using DMS.Utils;
using DMS.Models;

namespace DMS.Business
{
    public class OrderDataEntryBusiness : BaseBusiness, IOrderDataEntryBusiness
    {
        private readonly IOrderDataEntryService _orderDataEntryService;
        private readonly IUserService _userService;

        public OrderDataEntryBusiness(IHttpContextAccessor context, IOrderDataEntryService orderDataEntryService, IUserService userService) : base(context)
        {
            _orderDataEntryService = orderDataEntryService;
            _userService = userService;
        }

        /// <summary>
        /// DeleteLot
        /// </summary>
        /// <param name="lotId"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> DeleteLot(string lotId)
        {
            LotData data = (LotData)ServiceDataRequest.ConvertToRelatedType(typeof(LotData));
            data.IdScansContainer = lotId;
            var result = await _orderDataEntryService.DeleteLot(data);
            return result;
        }

        /// <summary>
        /// DeleteLotItem
        /// </summary>
        /// <param name="idScansContainerItems"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> DeleteLotItem(string idScansContainerItems)
        {
            ScanningLotItemData data = (ScanningLotItemData)ServiceDataRequest.ConvertToRelatedType(typeof(ScanningLotItemData));
            data.IdScansContainerItems = idScansContainerItems;
            var result = await _orderDataEntryService.DeleteLotItem(data);
            return result;
        }

        public async Task<WSEditReturn> CreateLotName(LotData model)
        {
            LotData data = (LotData)ServiceDataRequest.ConvertToRelatedType(typeof(LotData), model);
            var result = await _orderDataEntryService.CreateLotName(data);
            return result;
        }

        public async Task<WSEditReturn> SaveScanningOrder(ScanningLotItemData model)
        {
            ScanningLotItemData data = (ScanningLotItemData)ServiceDataRequest.ConvertToRelatedType(typeof(ScanningLotItemData), model);
            var result = await _orderDataEntryService.SaveScanningOrder(data);
            return result;
        }

        public async Task<object> GetPreloadOrderData(string mode, int? skipIdPreload, int? idScansContainerItems, int? lotId)
        {
            OrderDataEntryData data = (OrderDataEntryData)ServiceDataRequest.ConvertToRelatedType(typeof(OrderDataEntryData));
            data.GUID = UserFromService.UserGuid;

            if (!string.IsNullOrEmpty(mode))
                data.Mode = mode;

            if (skipIdPreload != null)
                data.SkipIdScansContainerItemsPreload = skipIdPreload.ToString();

            if (idScansContainerItems.HasValue)
                data.IdScansContainerItems = idScansContainerItems.ToString();

            if (lotId.HasValue)
                data.IdScansContainer = lotId.ToString();

            var result = await _orderDataEntryService.GetPreloadOrderData(data);
            return result;
        }

        public async Task<UserFromService> GetDetailUserById(string idLogin)
        {
            UserFromService result = await _userService.GetDetailUserByIdOrEmail(idLogin, "");
            return result;
        }

        public async Task<UserFromService> GetDetailUserByEmail(string email)
        {
            UserFromService result = await _userService.GetDetailUserByIdOrEmail("", email);
            return result;
        }
    }
}
