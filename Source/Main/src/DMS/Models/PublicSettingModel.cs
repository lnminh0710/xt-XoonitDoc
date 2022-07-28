using System;

namespace DMS.Models
{
    public class PublicSettingModel
    {
        /// <summary>
        /// TrackingUrl
        /// </summary>
        public string TrackingUrl { get; set; }

        /// <summary>
        /// FileShareUrl
        /// </summary>
        public string FileShareUrl { get; set; }

        /// <summary>
        /// SignalRApiUrl
        /// </summary>
        public string SignalRApiUrl { get; set; }

        /// <summary>
        /// PdfApiUrl
        /// </summary>
        public string PdfApiUrl { get; set; }

        /// <summary>
        /// FileUrl
        /// </summary>
        public string FileUrl { get; set; }

        /// <summary>
        /// ImportEmailFileUrl
        /// </summary>
        public string ImportEmailFileUrl { get; set; }

        /// <summary>
        /// ImportEmailFolder
        /// </summary>
        public string ImportEmailFolder { get; set; }

        /// <summary>
        /// AppVersion
        /// </summary>
        public string AppVersion { get; set; }

        /// <summary>
        /// EnableLayoutCustomization
        /// </summary>
        public bool EnableLayoutCustomization { get; set; }

        /// <summary>
        /// ApplyAccessRight
        /// </summary>
        public bool ApplyAccessRight { get; set; }

        /// <summary>
        /// IsSelectionProject
        /// </summary>
        public bool IsSelectionProject { get; set; }

        /// <summary>
        /// EnableOrderFailed
        /// </summary>
        public bool EnableOrderFailed { get; set; }

        /// <summary>
        /// EnableSignalR
        /// </summary>
        public bool EnableSignalR { get; set; }

        /// <summary>
        /// EnableGSNewWindow
        /// </summary>
        public bool EnableGSNewWindow { get; set; }

        /// <summary>
        /// EnableCloud
        /// </summary>
        public bool EnableCloud { get; set; }

        public bool EnableNotificationPopup { get; set; }

        /// <summary>
        /// MatchingWeight
        /// </summary>
        public int MatchingWeight { get; set; }

        public DateTime ServerDateNow { get; set; }

        public object SystemInfo { get; set; }

        public object Sentry { get; set; }

        public object ScanningTool { get; set; }

        public string ClientIpAddress { get; set; }

        public string ExternalLoginUrl { get; set; }
        public bool ImportEmail_DeleteWhenDragFromOutlook { get; set; }

        /// <summary>
        /// WebsiteTitle
        /// </summary>
        public string WebsiteTitle { get; set; }

        public string PublicFolder { get; set; }


        /// <summary>
        /// PublicFileURL
        /// </summary>
        public string PublicFileURL { get; set; }

        public PublicSettingModel()
        {
            ServerDateNow = DateTime.Now;
        }

    }
}
