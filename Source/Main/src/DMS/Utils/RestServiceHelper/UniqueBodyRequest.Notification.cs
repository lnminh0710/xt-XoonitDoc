using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils
{
    #region Get
    public class NotificationGetData : Data
    {
        public string WidgetTitle { get; set; }

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

    public class NotificationGetDataItem
    {
        /// <summary>
        /// IdNotification
        /// </summary>
        public long IdNotification { get; set; }

        public int IdRepMainNotificationType { get; set; }

        /// <summary>
        /// FeedBack, SendToAdmin
        /// </summary>
        public string MainNotificationType { get; set; }

        public int IdRepNotificationType { get; set; }
        public int NotificationType { get; set; }

        /// <summary>
        /// Subject
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// MainComment
        /// </summary>
        public string MainComment { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public Nullable<int> IdLogin { get; set; }

        /// <summary>
        /// ServerIP
        /// </summary>
        public string ServerIP { get; set; }

        /// <summary>
        /// ClientIP
        /// </summary>
        public string ClientIP { get; set; }

        /// <summary>
        /// ClientOS
        /// </summary>
        public string ClientOS { get; set; }

        /// <summary>
        /// BrowserType
        /// </summary>
        public string BrowserType { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Comment: concat all comments
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public string CreateDate { get; set; }
    }
    #endregion

    #region CreateData
    public class NotificationCreateData : Data
    {
        public string JSONText { get; set; }

        public NotificationCreateData()
        {
            JSONText = "{}";
        }

        public void BuildData(NotificationForCreateData notification, IList<NotificationItemsForCreateData> notificationItems)
        {
            if (notification == null) return;

            var jsonText = new StringBuilder();
            jsonText.Append("{");

            jsonText.AppendFormat(@"""{0}"":", "Notification");
            jsonText.Append("[{");//start Notification

            string notificationText = JsonConvert.SerializeObject(notification, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            jsonText.Append(notificationText.Substring(1, notificationText.Length - 2));

            jsonText.AppendFormat(@",""{0}"":", "NotificationItems");
            jsonText.Append("\"{");//start NotificationItems

            jsonText.AppendFormat(@"\""{0}\"":", "_NotificationItems");
            string notificationItemsText = JsonConvert.SerializeObject(notificationItems, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            notificationItemsText = JsonConvert.SerializeObject(notificationItemsText, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            jsonText.Append(notificationItemsText.Substring(1, notificationItemsText.Length - 2));

            jsonText.Append("}\"");//start NotificationItems

            jsonText.Append("}]");//end Notification

            jsonText.Append("}");

            JSONText = jsonText.ToString();
        }
    }

    public class NotificationForCreateData
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

    public class NotificationItemsForCreateData
    {
        public string PicturePath { get; set; }
        public string Comment { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }
    #endregion

    #region Set Archive
    public class NotificationSetArchivedData : Data
    {
        public string JSONText { get; set; }

        public NotificationSetArchivedData()
        {
            JSONText = "{}";
        }

        public void BuildData(IList<NotificationSetArchivedItem> notificationItems)
        {
            if (notificationItems == null || notificationItems.Count <= 0) return;

            dynamic notificationModel = new ExpandoObject();
            notificationModel.Notification = notificationItems;

            JSONText = JsonConvert.SerializeObject(notificationModel, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
        }
        public IList<NotificationSetArchivedItem> Notification { get; set; }
    }

    public class NotificationSetArchivedItem
    {
        public long IdNotification { get; set; }
        public string IsActive { get; set; }
    }
    #endregion
}
