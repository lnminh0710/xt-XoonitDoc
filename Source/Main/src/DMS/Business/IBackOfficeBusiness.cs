using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IBackOfficeBusiness
    {
        #region ReturnAndRefund
        /// <summary>
        /// GetWidgetInfoByIds
        /// </summary>
        /// <returns></returns>
        Task<object> GetWidgetInfoByIds(string personNr, string invoiceNr, string mediaCode);

        /// <summary>
        /// SaveWidgetData
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWidgetData(ReturnRefundSaveModel model);

        /// <summary>
        /// SaveUnblockOrder
        /// </summary>
        /// <param name="idSalesOrder"></param>
        /// <param name="isDeleted"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveUnblockOrder(string idSalesOrder, bool? isDeleted);

        #endregion

        #region BlockOrders
        /// <summary>
        /// GetBlockedOrderTextTemplate
        /// </summary>
        /// <param name="idRepSalesOrderStatus"></param>
        /// <returns></returns>
        Task<object> GetBlockedOrderTextTemplate(int? idRepSalesOrderStatus);

        /// <summary>
        /// GetMailingListOfPlaceHolder
        /// </summary>
        /// <returns></returns>
        Task<object> GetMailingListOfPlaceHolder();

        /// <summary>
        /// SaveTextTemplate
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveTextTemplate(BlockOrdersModel model);

        #endregion

        #region StockCorrection
        /// <summary>
        /// GetStockCorrection
        /// </summary>
        /// <returns></returns>
        Task<object> GetStockCorrection();

        /// <summary>
        /// GetWarehouseArticle
        /// </summary>
        /// <param name="articleNr"></param>
        /// <param name="warehouseId"></param>
        /// <returns></returns>
        Task<object> GetWarehouseArticle(string articleNr, long warehouseId);

        /// <summary>
        /// SaveStockCorrection
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveStockCorrection(StockCorrectionModel model);
        #endregion

        #region WareHouse Movement
        /// <summary>
        /// GetWarehouseMovement
        /// </summary>
        /// <returns></returns>
        Task<object> GetWarehouseMovement();

        /// <summary>
        /// GetWarehouseMovementForPdf
        /// </summary>
        /// <returns></returns>
        Task<object> GetWarehouseMovementForPdf();

        /// <summary>
        /// GetWarehouseMovementCosts
        /// </summary>
        /// <param name="idWarehouseMovement"></param>
        /// <returns></returns>
        Task<object> GetWarehouseMovementCosts(int? idWarehouseMovement);

        /// <summary>
        /// SortingGoods
        /// </summary>
        /// <param name="SortingGoods"></param>
        /// <returns></returns>
        Task<object> SortingGoods(int? idWarehouseMovement);

        /// <summary>
        /// StockedArticles
        /// </summary>
        /// <param name="idWarehouseMovementGoodsIssue"></param>
        /// <returns></returns>
        Task<object> StockedArticles(int? idWarehouseMovementGoodsIssue);

        /// <summary>
        /// SearchArticles
        /// </summary>
        /// <param name="searchString"></param>
        /// <param name="idPersonFromWarehouse"></param>
        /// <returns></returns>
        Task<object> SearchArticles(string searchString, int? idPersonFromWarehouse);

        /// <summary>
        /// SaveWarehouseMovement
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWarehouseMovement(WareHouseMovementModel model);

        /// <summary>
        /// SaveGoodsReceiptPosted
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveGoodsReceiptPosted(IList<GoodsReceiptPostedModel> model);

        /// <summary>
        /// ConfirmGoodsReceiptPosted
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> ConfirmGoodsReceiptPosted(ConfirmGoodsReceiptPostedModel model);

        #endregion

    }
}

