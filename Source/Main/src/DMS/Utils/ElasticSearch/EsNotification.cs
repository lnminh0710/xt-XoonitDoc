using System;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsNotification
    /// </summary>
    public class EsNotification
    {
        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }

        /// <summary>
        /// Id
        /// </summary>
        public long Id
        {
            get
            {
                return IdNotification;
            }
        }

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
        public string NotificationType { get; set; }

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

        /// <summary>
        /// SysCreateDate: long date time
        /// </summary>
        public string SysCreateDate { get; set; }

        /// <summary>
        /// LoginName
        /// </summary>
        public string LoginName { get; set; }
    }

    public class EsArchivedNotification
    {
        /// <summary>
        /// Id
        /// </summary>
        public long Id
        {
            get
            {
                return IdNotification;
            }
        }

        /// <summary>
        /// IdNotification
        /// </summary>
        public long IdNotification { get; set; }

        public bool IsActive { get; set; }
    }
}
