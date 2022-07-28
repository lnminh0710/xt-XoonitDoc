using System;
using System.Collections.Generic;

namespace DMS.Models
{

    #region Get
    public class NotificationGetModel
    {
        /// <summary>
        /// 0: Get All
        /// <>0: Get for only this user
        /// </summary>
        public int IdLoginNotification { get; set; }

        /// <summary>
        /// 0: Get all
        /// 1: FeedBack
        /// 2: SendToAdmin
        /// </summary>
        public int MainNotificationType { get; set; }

        /// <summary>
        /// 0: All
        /// 1: New
        /// 2: Archived
        /// </summary>
        public int NotificationStatus { get; set; }

        public long? IdNotification { get; set; }
    } 
    #endregion

    #region Create
    public class NotificationCreateModel
    {
        public NotificationForCreateModel Notification { get; set; }

        public IList<NotificationItemsForCreateModel> NotificationItems { get; set; }
    }

    public class NotificationForCreateModel
    {
        /// <summary>
        /// RepMainNotificationType: FeedBack: 1, SendToAdmin: 2
        /// </summary>
        public string Type { get; set; }

        public string Subject { get; set; }
        public string MainComment { get; set; }
        public Nullable<int> IdLogin { get; set; }

        /// <summary>
        /// Bug, Improvement,Reason 1,....
        /// </summary>
        public int IdRepNotificationType { get; set; }
        public string ServerIP { get; set; }
        public string ClientIP { get; set; }
        public string ClientOS { get; set; }
        public string BrowserType { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }

    public class NotificationItemsForCreateModel
    {
        public string PicturePath { get; set; }
        public string Comment { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }
    #endregion

    #region Set Archive
    public class NotificationSetArchivedItemModel
    {
        public long IdNotification { get; set; }
        public string IsActive { get; set; }
    }
    #endregion
}
