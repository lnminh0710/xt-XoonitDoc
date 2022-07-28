using System.Collections.Generic;

namespace DMS.Utils
{
    public class WareHouseMovementSortingGoodsData : Data
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public string IdWarehouseMovement { get; set; }
    }
    
    public class WareHouseMovementStockedArticlesData : Data
    {
        /// <summary>
        /// IdWarehouseMovementGoodsIssue
        /// </summary>
        public string IdWarehouseMovementGoodsIssue { get; set; }
    }

    public class WareHouseMovementSearchArticleData : Data
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public string SearchString { get; set; }
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public string IdPersonFromWarehouse { get; set; }
    }

    public class WareHouseMovementData : Data
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public string IdWarehouseMovement { get; set; }

        /// <summary>
        /// IdPersonFromWarehouse
        /// </summary>
        public string IdPersonFromWarehouse { get; set; }

        /// <summary>
        /// IdPersonToWarehouse
        /// </summary>
        public string IdPersonToWarehouse { get; set; }

        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }

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

        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    /// <summary>
    /// GoodsReceiptPostedData
    /// </summary>
    public class GoodsReceiptPostedData: Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    /// <summary>
    /// GoodsReceiptPostedBaseData
    /// </summary>
    public class GoodsReceiptPostedBaseData: Data
    {
        /// <summary>
        /// IdWarehouseMovementGoodsReceipt
        /// </summary>
        public string IdWarehouseMovementGoodsReceipt { get; set; }

        /// <summary>
        /// IdWarehouseMovementGoodsIssue
        /// </summary>
        public string IdWarehouseMovementGoodsIssue { get; set; }

        /// <summary>
        /// IdArticle
        /// </summary>
        public string IdArticle { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// IdWarehouseMovementGoodsReceiptPosted
        /// </summary>
        public string IdWarehouseMovementGoodsReceiptPosted { get; set; }

        /// <summary>
        /// QuantityToTargetTotal
        /// </summary>
        public string QuantityToTargetTotal { get; set; }

        /// <summary>
        /// IdWareHouseArticlePosted
        /// </summary>
        public string IdWareHouseArticlePosted { get; set; }

        /// <summary>
        /// QuantityPosted
        /// </summary>
        public string QuantityPosted { get; set; }

        /// <summary>
        /// OnStock
        /// </summary>
        public string OnStock { get; set; }

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
        public string IdRepWarehouseCorrection { get; set; }

        /// <summary>
        /// QuantityToPosted
        /// </summary>
        public string QuantityToPosted { get; set; }

        /// <summary>
        /// ReceiveDate
        /// </summary>
        public string ReceiveDate { get; set; }

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
    /// ConfirmGoodsReceiptPostedData
    /// </summary>
    public class ConfirmGoodsReceiptPostedData : Data
    {
        /// <summary>
        /// IdWarehouseMovement
        /// </summary>
        public string IdWarehouseMovement { get; set; }
    }
}
