using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IBackOfficeService
    {
        #region BlockOrders
        /// <summary>
        /// GetBlockedOrderTextTemplate
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetBlockedOrderTextTemplate(BlockOrdersData data);

        /// <summary>
        /// GetMailingListOfPlaceHolder
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetMailingListOfPlaceHolder(BlockOrdersData data);

        /// <summary>
        /// SaveTextTemplate
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveTextTemplate(BlockOrdersData data);

        #endregion

        #region ReturnAndRefund
        /// <summary>
        /// GetOrderArticles
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWidgetInfoByIds(ReturnRefundData data);

        /// <summary>
        /// SaveWidgetData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWidgetData(ReturnRefundSaveData data);

        /// <summary>
        /// SaveUnblockOrder
        /// </summary>
        /// <param name="data"></param>
        /// <param name="isDeleted"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveUnblockOrder(ReturnRefundData data, bool? isDeleted);

        #endregion

        #region StockCorrection
        /// <summary>
        /// GetStockCorrection
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetStockCorrection(Data data);

        /// <summary>
        /// GetWarehouseArticle
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWarehouseArticle(StockCorrectionData data);

        /// <summary>
        /// SaveStockCorrection
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveStockCorrection(StockCorrectionData data);

        #endregion

        #region WareHouse Movement
        /// <summary>
        /// GetWarehouseMovement
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWarehouseMovement(Data data);

        /// <summary>
        /// GetWarehouseMovementForPdf
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWarehouseMovementForPdf(Data data);

        /// <summary>
        /// GetWarehouseMovementCosts
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWarehouseMovementCosts(WareHouseMovementData data);

        /// <summary>
        /// SortingGoods
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> SortingGoods(WareHouseMovementSortingGoodsData data);

        /// <summary>
        /// StockedArticles
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> StockedArticles(WareHouseMovementStockedArticlesData data);
        
        /// <summary>
        /// SearchArticles
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> SearchArticles(WareHouseMovementSearchArticleData data);

        /// <summary>
        /// SaveWarehouseMovement
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveWarehouseMovement(WareHouseMovementData data);

        /// <summary>
        /// SaveGoodsReceiptPosted
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveGoodsReceiptPosted(GoodsReceiptPostedData data);

        /// <summary>
        /// ConfirmGoodsReceiptPosted
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> ConfirmGoodsReceiptPosted(ConfirmGoodsReceiptPostedData data);

        #endregion
    }
}

