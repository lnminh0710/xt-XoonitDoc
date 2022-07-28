using System.Threading.Tasks;
using DMS.Utils;

namespace DMS.Service
{
    public interface IOrderDataEntryService
    {
        /// <summary>
        /// DeleteLot
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteLot(LotData data);

        /// <summary>
        /// DeleteLotItem
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteLotItem(ScanningLotItemData data);
        

        /// <summary>
        /// CreateLotName
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateLotName(LotData data);

        /// <summary>
        /// SaveScanningOrder
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanningOrder(ScanningLotItemData data);

        /// <summary>
        /// GetPreloadOrderData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetPreloadOrderData(OrderDataEntryData data);
    }
}

