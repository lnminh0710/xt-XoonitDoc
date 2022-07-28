using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IOrderDataEntryBusiness
    {
        /// <summary>
        /// CreateLotName
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateLotName(LotData model);

        /// <summary>
        /// DeleteLot
        /// </summary>
        /// <param name="lotId"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteLot(string lotId);

        /// <summary>
        /// DeleteLotItem
        /// </summary>
        /// <param name="idScansContainerItems"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteLotItem(string idScansContainerItems);

        /// <summary>
        /// SaveScanningOrder
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanningOrder(ScanningLotItemData model);

        /// <summary>
        /// GetPreloadOrderData
        /// </summary>
        /// <returns></returns>
        Task<object> GetPreloadOrderData(string mode, int? skipIdPreload, int? idScansContainerItems, int? lotId);

        Task<UserFromService> GetDetailUserById(string idLogin);

        Task<UserFromService> GetDetailUserByEmail(string email);
    }
}

