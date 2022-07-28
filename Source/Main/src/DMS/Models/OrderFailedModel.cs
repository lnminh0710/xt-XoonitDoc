namespace DMS.Models
{
    public class OrderFailedSaveModel
    {
        /// <summary>
        /// TabID
        /// </summary>
        public string TabID { get; set; }

        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }

        /// <summary>
        /// Mediacode
        /// </summary>
        public string Mediacode { get; set; }

        /// <summary>
        /// CampaignNr
        /// </summary>
        public string CampaignNr { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// CreateDate: dd.MM.yyyy. Ex: 28.12.2018
        /// </summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public string IdLogin { get; set; }       

        /// <summary>
        /// JsonData
        /// </summary>
        public string JsonData { get; set; }

        public OrderFailedParkedItemData GetParkedItemData()
        {
            return new OrderFailedParkedItemData {
                IdScansContainerItems = IdScansContainerItems,
                Mediacode = Mediacode,
                CampaignNr = CampaignNr,
                CustomerNr = CustomerNr,
                CreateDate = CreateDate                 
            };
        }
    }

    public class OrderFailedDeleteModel
    {
        /// <summary>
        /// TabID
        /// </summary>
        public string TabID { get; set; }

        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }
    }

    public class OrderFailedDeleteAllModel
    {
        /// <summary>
        /// TabID
        /// </summary>
        public string TabID { get; set; }
    }

    public class OrderFailedParkedItem
    {
        /// <summary>
        /// DateTime.Ticks
        /// </summary>
        public long Ticks { get; set; }

        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// OrderFailedParkedItemData
        /// </summary>
        public OrderFailedParkedItemData Data { get; set; }

        public OrderFailedParkedItem()
        {
            Data = new OrderFailedParkedItemData();
        }
    }

    public class OrderFailedParkedItemData
    {
        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }

        /// <summary>
        /// Mediacode
        /// </summary>
        public string Mediacode { get; set; }

        /// <summary>
        /// CampaignNr
        /// </summary>
        public string CampaignNr { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// CreateDate: dd.MM.yyyy. Ex: 28.12.2018
        /// </summary>
        public string CreateDate { get; set; }
    }
}
