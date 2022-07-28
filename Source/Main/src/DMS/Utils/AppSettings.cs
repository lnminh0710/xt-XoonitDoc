using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// AppSettings
    /// </summary>
    public class AppSettings
    {
        /// <summary>
        /// OAuthSecretKey
        /// </summary>
        public string OAuthSecretKey { get; set; }

        /// <summary>
        /// OAuthAccessTokenExpire
        /// unit: hour
        /// </summary>
        public double OAuthAccessTokenExpire { get; set; }

        /// <summary>
        /// OAuthRefreshTokenExpire
        /// unit: hour
        /// </summary>
        public double OAuthRefreshTokenExpire { get; set; }

        /// <summary>
        /// OAuthAccessTokenExpireForConfirmEmail
        /// unit: minute
        /// </summary>
        public int OAuthAccessTokenExpireForConfirmEmail { get; set; }

        /// <summary>
        /// OAuthAccessTokenExpireForResetPassword
        /// unit: minute
        /// </summary>
        public int OAuthAccessTokenExpireForResetPassword { get; set; }

        /// <summary>
        /// EmailSending
        /// </summary>
        public EmailSending EmailSending { get; set; }

        /// <summary>
        /// UploadFolder
        /// </summary>
        public string UploadFolder { get; set; }

        /// <summary>
        /// ArticleMediaUploadFolder
        /// </summary>
        public string ArticleMediaUploadFolder { get; set; }

        /// <summary>
        /// ProfileUploadFolder
        /// </summary>
        public string ProfileUploadFolder { get; set; }

        /// <summary>
        /// NotificationUploadFolder
        /// </summary>
        public string NotificationUploadFolder { get; set; }

        /// <summary>
        /// OtherUploadFolder
        /// </summary>
        public string OtherUploadFolder { get; set; }

        /// <summary>
        /// TemplateUploadFolder
        /// </summary>
        public string TemplateUploadFolder { get; set; }

        /// <summary>
        /// PrintingUploadFolder
        /// </summary>
        public string PrintingUploadFolder { get; set; }

        /// <summary>
        /// GeneralUploadFolder
        /// </summary>
        public string GeneralUploadFolder { get; set; }

        /// <summary>
        /// StatisticReportUploadFolder
        /// </summary>
        public string StatisticReportUploadFolder { get; set; }

        /// <summary>
        /// ODEFailedUploadFolder
        /// </summary>
        public string ODEFailedUploadFolder { get; set; }

        /// <summary>
        /// InventoryUploadFolder
        /// </summary>
        public string InventoryUploadFolder { get; set; }

        /// <summary>
        /// CustomerUploadFolder
        /// </summary>
        public string CustomerUploadFolder { get; set; }

        /// <summary>
        /// ImportEmailFolder
        /// </summary>
        public string ImportEmailFolder { get; set; }

      /// <summary>
        /// PublicFileURL
        /// </summary>
        public string PublicFileURL { get; set; }

        /// <summary>
        /// FileShareUrl
        /// </summary>
        public string BloombergUrl { get; set; }

        /// <summary>
        /// EnableTimeTraceLog
        /// </summary>
        public bool EnableTimeTraceLog { get; set; }

        /// <summary>
        /// TrackingUrl
        /// </summary>
        public string TrackingUrl { get; set; }

        /// <summary>
        /// AppVersion
        /// </summary>
        public string AppVersion { get; set; }

        /// <summary>
        /// ServerConfig
        /// </summary>
        public IList<ServerConfig> ServerConfig { get; set; }

        /// <summary>
        /// EnableLayoutCustomization
        /// </summary>
        public bool EnableLayoutCustomization { get; set; }

        /// <summary>
        /// EnableOrderFailed
        /// </summary>
        public bool EnableOrderFailed { get; set; }

        /// <summary>
        /// ApplyAccessRight
        /// </summary>
        public bool ApplyAccessRight { get; set; }

        /// <summary>
        /// EnableSignalR
        /// </summary>
        public bool EnableSignalR { get; set; }

        /// <summary>
        /// IsSelectionProject
        /// </summary>
        public bool IsSelectionProject { get; set; }

        /// <summary>
        /// ShowDBQuery
        /// </summary>
        public bool ShowDBQuery { get; set; }

        /// <summary>
        /// EnableGSNewWindow
        /// </summary>
        public bool EnableGSNewWindow { get; set; }

        /// <summary>
        /// SupportEmail
        /// </summary>
        public string SupportEmail { get; set; }

        /// <summary>
        /// Image Logo Url
        /// </summary>
        public string ImageLogoUrl { get; set; }

        /// <summary>
        /// Avatar Default
        /// </summary>
        public string AvatarDefault { get; set; }

        /// <summary>
        /// MatchingWeight
        /// </summary>
        public int MatchingWeight { get; set; }

        public ScanningTool ScanningTool { get; set; }

        /// <summary>
        /// MatchingApiUrl
        /// </summary>
        public string MatchingApiUrl { get; set; }

        /// <summary>
        /// WkHtmlToPdfFileExe
        /// </summary>
        public string WkHtmlToPdfFileExe { get; set; }

        public string FileExplorerUrl { get; set; }

        public string APIRunOCRForDOC { get; set; }

        public string ApplicationName { get; set; }

        public CloudSetting Clouds { get; set; }
        public string ImageLogoEmailUrl { get; set; }

        /// <summary>
        /// EnableLogES
        /// </summary>
        public bool EnableLogES { get; set; }

        public bool EnableCloud { get; set; }
        public bool EnableNotificationPopup { get; set; }

        public string ESIndexesFilterByCloud { get; set; }
        public string ESIndexesNoFilterByIdApplicationOwner { get; set; }
        public string ExternalLoginUrl { get; set; }

        public string TypeDocumentsAllowImport { get; set; }
        public string ImportEmail_Authorization { get; set; }
        public bool ImportEmail_DeleteWhenDragFromOutlook { get; set; }

        /// <summary>
        /// WebsiteTitle
        /// </summary>
        public string WebsiteTitle { get; set; }
        public string Platform { get; set; }

        public bool AutoImportDocumentWithUserId { get; set; }

        public string PublicFolder { get; set; }

        public string CustomerFileServer { get; set; }

    }

    /// <summary>
    /// ServerConfig
    /// </summary>
    public class ServerConfig
    {
        /// <summary>
        /// Domain
        /// </summary>
        public string Domain { get; set; }

        /// <summary>
        /// ServerSetting
        /// </summary>
        public ServerSetting ServerSetting { get; set; }
    }

    /// <summary>
    /// ServerSetting
    /// </summary>
    public class ServerSetting
    {
        /// <summary>
        /// ServiceUrl
        /// </summary>
        public string ServiceUrl { get; set; }

        /// <summary>
        /// ElasticSearchServiceUrl
        /// </summary>
        public string ElasticSearchServiceUrl { get; set; }

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
        /// PublicFolder
        /// </summary>
        public string PublicFolder { get; set; }
    }

    public class EmailSending
    {
        public EmailSending()
        {
            this.Domain = "smtp.gmail.com";
        }

        /// <summary>
        /// Sender
        /// </summary>
        public string Sender { get; set; }

        /// <summary>
        /// Email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Domain
        /// default: smtp.gmail.com
        /// </summary>
        public string Domain { get; set; }

        /// <summary>
        /// Port
        /// default: 587
        /// </summary>
        public int Port { get; set; } = 587;

        /// <summary>
        /// Type of Content (html or plain)
        /// </summary>
        public string ContentType { get; set; }

        public string DocumentEmailBody { get; set; }

        public string DocumentEmailSubject { get; set; }
        public EmailTemplateSetting ActivateAccount { get; set; }
        public EmailTemplateSetting ResetPassword { get; set; }
        public EmailTemplateSetting ChangePasswordSuccess { get; set; }
        public EmailTemplateSetting Report { get; set; }
    }
    public class EmailTemplateSetting
    {
        public string Subject { get; set; }

        public string Template { get; set; }
        public string TemplateByAdmin { get; set; }
        public string CssFile { get; set; }

    }
    public class ScanningTool
    {
        /// <summary>
        /// DownloadUrl
        /// </summary>
        public string DownloadUrl { get; set; }

        /// <summary>
        /// Version
        /// </summary>
        public string Version { get; set; }
    }

    public class SentrySettings
    {
        /// <summary>
        /// ClientDsn
        /// </summary>
        public string ClientDsn { get; set; }
    }

    public class OneDrive
    {
        public string ClientId { get; set; }
        public string MyDMEmail { get; set; }
        public string Authority { get; set; }
        public bool ValidateAuthority { get; set; }
        public bool NavigateToLoginRequestUrl { get; set; }
        public string RedirectUri { get; set; }
        public string PostLogoutRedirectUri { get; set; }
        public string CacheLocation { get; set; }
        public string[] ConsentScopes { get; set; }
        public string[] ProtectedResourceMap { get; set; }
        public string[] ExtraQueryParameters { get; set; }
        public string[] UnprotectedResources { get; set; }
        public string TenantId { get; set; }
        public string ClientSecret { get; set; }
        public string UserPassword { get; set; }
        public string RefreshToken { get; set; }
        public string AccessToken { get; set; }
    }
    public class GoogleDrive
    {
        public string ApplicationName { get; set; }
        public string MyDMEmail { get; set; }
        public string ClientId { get; set; }

        public string ClientSecret { get; set; }
        public string ApiKey { get; set; }
        public List<string> DicoveryDocs { get; set; }
        public string Scopes { get; set; }
        public string PermissionRole { get; set; }
        public string PermissionType { get; set; }

        public string ApplicationNameApp { get; set; }
        public string ClientIdApp { get; set; }

        public string ClientSecretApp { get; set; }
    }
    public class MyCloudSetting
    {
        public string AccessToken { get; set; }
        public string ClientId { get; set; }

        public string ClientSecret { get; set; }
        public string RefreshToken { get; set; }


    }
    public class CloudSetting
    {
        public GoogleDrive GoogleDrive { get; set; }

        public OneDrive OneDrive { get; set; }
        public DropboxSetting Dropbox { get; set; }

        public MyCloudSetting MyCloud { get; set; }
        public string OneDriveClientSecret { get; set; }
        public string OneDriveRefreshToken { get; set; }
    }

    public class DropboxSetting
    {
        public string ClientSecret { get; set; }

        public DropboxUrls URLs { get; set; }
    }

    public class DropboxUrls
    {
        public string CreateFolder { get; set; }
        public string GetListFolder { get; set; }
        public string GetListFolderContinue { get; set; }
        public string UploadFile { get; set; }
        public string DeleteFileFolder { get; set; }

        public string GetUsersOnFolder { get; set; }

        public string GetSubFolders { get; set; }
    }

    /// <summary>
    /// FirebaseSettings
    /// </summary>
    public class FirebaseSettings
    {
        /// <summary>
        /// FCM_SERVER_API_KEY
        /// </summary>
        public string FCM_SERVER_API_KEY { get; set; }

        /// <summary>
        /// FCM_SENDER_ID
        /// </summary>
        public string FCM_SENDER_ID { get; set; }

        /// <summary>
        /// TranslationSettings
        /// </summary>
        public FirebaseSettings()
        {
        }
    }
}
