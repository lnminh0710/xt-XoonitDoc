using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel;
using XenaEmail;

namespace DMS.Models
{
    public class EmailSimpleModel
    {
        /// <summary>
        /// ToEmail
        /// </summary>
        public string ToEmail { get; set; }

        /// <summary>
        /// Subject
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Body
        /// </summary>
        public string Body { get; set; }

        public EmailSimpleModel()
        {
        }
    }
    public class EmailWithTemplateModel
    {
        /// <summary>
        /// ToEmail
        /// </summary>
        public string ToEmail { get; set; }

        /// <summary>
        /// Subject
        /// </summary>
        public string Name { get; set; }
        public string CallbackUrl { get; set; }
        public string UrlExprired { get; set; }
        public string UrlExpriredDateTime { get; set; }
        //  public long UrlExpriredInMinutes { get; set; }
        public string GroupUuid { get; set; }



    }
    /// <summary>
    /// EmailModel
    /// </summary>
    public class EmailModel
    {
        /// <summary>
        /// RepMainNotificationType (string): FeedBack: 1, SendToAdmin: 2
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// (int): Bug, Improvement, Reason 1,....
        /// </summary>
        public int IdRepNotificationType { get; set; }

        /// <summary>
        /// ToEmail
        /// </summary>
        public string ToEmail { get; set; }

        /// <summary>
        /// Subject
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Body
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// Priority
        /// </summary>
        public string Priority { get; set; }

        public string DatabaseName { get; set; }
        public string FileAttachedUrl { get; set; }

        /// <summary>
        /// Image Attached
        /// </summary>
        public IList<ImageSend> ImageAttached { get; set; }

        /// <summary>
        /// BrowserInfo
        /// </summary>
        public BrowserInfo BrowserInfo { get; set; }

        /// <summary>
        /// List of full file names
        /// </summary>
        public IList<EmailAttachmentFile> Attachments { get; set; }

        public EmailModel()
        {
            ImageAttached = new List<ImageSend>();
            BrowserInfo = new BrowserInfo();
            Attachments = new List<EmailAttachmentFile>();

            Type = "FeedBack";
            IdRepNotificationType = 1;//Bug
            Priority = "Normal";
            DatabaseName = "";
        }
    }

    //public class EmailAttachmentFile
    //{
    //    /// <summary>
    //    /// Absolute full file name
    //    /// </summary>
    //    public string FullName { get; set; }

    //    /// <summary>
    //    /// Display name
    //    /// </summary>
    //    public string DisplayName { get; set; }
    //}

    public class ImageSend
    {
        /// <summary>
        /// EmbeddedId
        /// </summary>
        public string EmbeddedId { get; set; }

        /// <summary>
        /// Source
        /// </summary>
        public string Source { get; set; }

        /// <summary>
        /// Text
        /// </summary>
        public string Text { get; set; }
    }

    public class BrowserInfo
    {
        /// <summary>
        /// Screen
        /// </summary>
        [Description("Screen")]
        public string Screen { get; set; }

        /// <summary>
        /// Browser
        /// </summary>
        [Description("Browser")]
        public string Browser { get; set; }

        /// <summary>
        /// BrowserVersion
        /// </summary>
        [Description("Browser Version")]
        public string BrowserVersion { get; set; }

        /// <summary>
        /// BrowserMajorVersion
        /// </summary>
        [Description("Browser Major Version")]
        public string BrowserMajorVersion { get; set; }

        /// <summary>
        /// Mobile
        /// </summary>
        [Description("Mobile")]
        public string Mobile { get; set; }

        /// <summary>
        /// Os
        /// </summary>
        [Description("Os")]
        public string Os { get; set; }

        /// <summary>
        /// OsVersion
        /// </summary>
        [Description("Os Version")]
        public string OsVersion { get; set; }

        /// <summary>
        /// Cookies
        /// </summary>
        [Description("Cookies")]
        public string Cookies { get; set; }

        /// <summary>
        /// Module
        /// </summary>
        [Description("Module")]
        public string Module { get; set; }

        /// <summary>
        /// SubModule
        /// </summary>
        [Description("Sub Module")]
        public string SubModule { get; set; }

        /// <summary>
        /// SelectedTab
        /// </summary>
        [Description("Selected Tab")]
        public string SelectedTab { get; set; }

        /// <summary>
        /// SelectedODETab
        /// </summary>
        [Description("Selected ODE Tab")]
        public string SelectedODETab { get; set; }

        /// <summary>
        /// SelectedSubTab
        /// </summary>
        [Description("Selected Sub Tab")]
        public string SelectedSubTab { get; set; }

        /// <summary>
        /// EntityId
        /// </summary>
        [Description("Entity Id")]
        public string EntityId { get; set; }

        /// <summary>
        /// Mediacode
        /// </summary>
        [Description("Media Code")]
        public string Mediacode { get; set; }

        /// <summary>
        /// CampaignNumber
        /// </summary>
        [Description("Campaign Number")]
        public string CampaignNumber { get; set; }

        /// <summary>
        /// CustomerNumber
        /// </summary>
        [Description("Customer Number")]
        public string CustomerNumber { get; set; }

        /// <summary>
        /// Url
        /// </summary>
        [Description("Url")]
        public string Url { get; set; }

        /// <summary>
        /// CaptureTime
        /// </summary>
        [Description("Capture Time")]
        public string CaptureTime { get; set; }

        /// <summary>
        /// IP
        /// </summary>
        [Description("Client IP Address")]
        public string IP { get; set; }
    }
    public class EmailDocumentModel
    {


        /// <summary>
        /// ToEmail
        /// </summary>
        public string ToEmail { get; set; }

        /// <summary>
        /// Subject
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Body
        /// </summary>
        public string Body { get; set; }


        public int? IdDocumentContainerScans { get; set; }
        /// <summary>
        /// List of full file names
        /// </summary>
        public IList<EmailAttachmentFile> Attachments { get; set; }

        public EmailDocumentModel()
        {

            Attachments = new List<EmailAttachmentFile>();
        }
    }
}
