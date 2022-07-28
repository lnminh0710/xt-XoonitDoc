using System.Collections.Generic;

namespace DMS.Models
{
    /// <summary>
    /// WareHouseMovementModel
    /// </summary>
    public class WareHouseMovementModel {

        /// <summary>
        /// WareHouseMovement
        /// </summary>
        public WareHouseMovement WareHouseMovement { get; set; }

        /// <summary>
        /// JSONMovementArticles
        /// </summary>
        public IList<JSONMovementArticles> JSONMovementArticles { set; get; }
    }
    /// <summary>
    /// WareHouseMovementModel
    /// </summary>
    public class WareHouseMovement
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public int? IdWarehouseMovement { get; set; }

        /// <summary>
        /// IdPersonFromWarehouse
        /// </summary>
        public int? IdPersonFromWarehouse { get; set; }

        /// <summary>
        /// IdPersonToWarehouse
        /// </summary>
        public int? IdPersonToWarehouse { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public int? IdRepCurrencyCode { get; set; }

        /// <summary>
        /// EstimateDeliveryDate
        /// </summary>
        public string EstimateDeliveryDate { get; set; }

        /// <summary>
        /// CompletedDate
        /// </summary>
        public string CompletedDate { get; set; }

        /// <summary>
        /// ConfirmDate
        /// </summary>
        public string ConfirmDate { get; set; }

        /// <summary>
        /// NotesForRecipient
        /// </summary>
        public string NotesForRecipient { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// JSONMovementArticles
    /// </summary>
    public class JSONMovementArticles
    {
        /// <summary>
        /// IdWarehouseArticlePosted
        /// </summary>
        public int? IdWarehouseArticlePosted { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// IdArticle
        /// </summary>
        public int? IdArticle { get; set; }

        /// <summary>
        /// IdArticleNew
        /// </summary>
        public int? IdArticleNew { get; set; }

        /// <summary>
        /// QuantityToMove
        /// </summary>
        public string QuantityToMove { get; set; }

        /// <summary>
        /// FakePrice
        /// </summary>
        public string FakePrice { get; set; }

        /// <summary>
        /// PurchaisePrice
        /// </summary>
        public string PurchaisePrice { get; set; }

        /// <summary>
        /// DeliveryDate
        /// </summary>
        public string DeliveryDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// GoodsReceiptPostedModel
    /// </summary>
    public class GoodsReceiptPostedModel
    {

        /// <summary>
        /// IdWarehouseMovementGoodsIssue
        /// </summary>
        public int? IdWarehouseMovementGoodsIssue { get; set; }

        /// <summary>
        /// IdWarehouseMovementGoodsReceiptPosted
        /// </summary>
        public int? IdWarehouseMovementGoodsReceiptPosted { get; set; }

        /// <summary>
        /// LotNr
        /// </summary>
        public string LotNr { get; set; }

        /// <summary>
        /// Division
        /// </summary>
        public string Division { get; set; }

        /// <summary>
        /// Coordinate
        /// </summary>
        public string Coordinate { get; set; }

        /// <summary>
        /// BarCode
        /// </summary>
        public string BarCode { get; set; }

        /// <summary>
        /// ShelfLife
        /// </summary>
        public string ShelfLife { get; set; }

        /// <summary>
        /// IdRepWarehouseCorrection
        /// </summary>
        public int? IdRepWarehouseCorrection { get; set; }

        /// <summary>
        /// QuantityToPosted
        /// </summary>
        public string QuantityToPosted { get; set; }

        /// <summary>
        /// ReceiveDate
        /// </summary>
        public string ReceiveDate { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// ConfirmGoodsReceiptPostedModel
    /// </summary>
    public class ConfirmGoodsReceiptPostedModel
    {
        /// <summary>
        /// ConfirmGoodsReceiptPosted
        /// </summary>
        public ConfirmGoodsReceiptPosted ConfirmGoodsReceiptPosted { get; set; }
    }

    /// <summary>
    /// ConfirmGoodsReceiptPosted
    /// </summary>
    public class ConfirmGoodsReceiptPosted
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public int? IdWarehouseMovement { get; set; }
    }
}
