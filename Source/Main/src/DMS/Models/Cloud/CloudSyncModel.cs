using DMS.Utils;
using System;
using System.Collections.Generic;
using System.IO;

namespace DMS.Models.DMS
{

    public class CloudSyncModel
    {
        public List<string> idMainDocuments { get; set; }
        public string IndexName { get; set; }
        public bool IsSyncDocsFail { get; set; }

    }

    public class CloudSyncModelPost
    {
        public string CloudType { get; set; }

        public string Sync { get; set; }

    }

    public class CloudOneDriveAuthenModel
    {
        public string client_id { get; set; }
        public string TenantId { get; set; }
        public string client_secret { get; set; }
        public string Username { get; set; }

        public string Password { get; set; }

        public string refresh_token { get; set; }
        public string grant_type { get; set; }

        public string scope { get; set; }
        public string redirect_uri { get; set; }
    }
    public class CloudToken
    {
        public string token_type { get; set; }
        public string expires_in { get; set; }
        public string resource { get; set; }
        public string scope { get; set; }
        public string access_token { get; set; }
        public string refresh_token { get; set; }
        public string id_token { get; set; }

        public DateTime expired_date_time { get; set; }

    }
    public class CloudActiveUserModel
    {
        public string ConnectionString { get; set; }
        public string UserEmail { get; set; }
        public string ProviderName { get; set; }
        public int IdCloudProviders { get; set; }

        public int IdCloudConnection { get; set; }

        public string ClientId { get; set; }
    }

    public class CloudSyncQueueModel
    {
        public string CloudMediaPath { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string IdDocumentTreeMedia { get; set; }
        public string IdSyncCloudQueue { get; set; }
        public bool? IsSync { get; set; }
        public int RepeatedTries { get; set; }
        public string ConnectionString { get; set; }
        public string ProviderName { get; set; }
        public int IdCloudProviders { get; set; }
        public string ScannedPath { get; set; }
        public string FileName { get; set; }
        public string ClientId { get; set; }
        public string UserEmail { get; set; }
        public string MyDmEmail { get; set; }
        public bool? IsActive { get; set; }
        public string SyncErrorLog { get; set; }
        public string CloudFilePath { get; set; }
        public string IdMainDocument { get; set; }
        public string MediaName { get; set; }
        public List<ImageSyncQueueModel> ImageFiles { get; set; }

        public bool? MainDocSynced { get; set; }
    }

    public class CloudConnectionModel
    {
        public string UserName { get; set; }

        public bool? IsDeleted { get; set; }

        public int? IdCloudConnection { get; set; }
        public CloudConnectionStringModel ConnectionString { get; set; }
        public string UserEmail { get; set; }
        public string Password { get; set; }
        public int IdCloudProviders { get; set; }

        public string ClientId { get; set; }

        public bool? IsActive { get; set; }

        public string MyDMEmail { get; set; }

        public string CloudType { get; set; }

        public bool IsShare { get; set; }
        public bool IsChangeEmail { get; set; }
    }

    public class SftpConnectionModel
    {
        public string Type { get; set; }
        public string HostName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public int PortNumber { get; set; }
        public string Folder { get; set; }
        public string OldFolder { get; set; }
    }
    public class CloudConnectionStringModel
    {
        public string UserEmail { get; set; }
        public string SharedFolder { get; set; }
        public string SharedLink { get; set; }
        public string SharedFolderId { get; set; }
        public string FileServerFolder { get; set; }
        public SftpConnectionModel SftpConnection { get; set; }
        public SftpConnectionModel FtpConnection { get; set; }
        public string CloudUserId { get; set; }
        public string OneDriveDriveId { get; set; }

        public CloudToken CloudToken { get; set; }

        /// <summary>
        /// OneDrive Type: business or personal 
        /// </summary>
        public string DriveType { get; set; }

        public CloudConnectionStringModel()
        {

        }
     

    }
    public class CloudConnectionTestModel : CloudConnectionStringModel
    {
        // true when call from api Cloud/IsCheckStatusConnection
       public bool IsCheckStatusConnection { get; set; }
       public string CloudType { get; set; }

        public CloudConnectionStringModel ConnectionString { get; set; }

    }
    public class CloudConnectionTestResponse
    {
        public string ErrorMessage { get; set; }
        public bool IsSuccess { get; set; }
    }

    public class CloudSyncManually
    {
        public string CloudType { get; set; }

        public string LocalPath { get; set; }
        public string FileName { get; set; }
        public string CloudPath { get; set; }
        public string AddressMail { get; set; }

    }
    public class CloudSyncManuallyTest
    {
       
        public Data data { get; set; }

        public CloudActiveUserModel cloudActiveUser { get; set; }
        public CloudSyncModel syncModel { get; set; }
       

    }
    public class CloudMoveManually
    {
        public string SourcePath { get; set; }
        public string DesPath { get; set; }

    }

    public class CloudDownloadFileReponse
    {
        public Stream stream { get; set; }

        public string FileName { get; set; }

        public string ErrorDetail { get; set; }
    }

    public class ReponseUploadDocToCloud
    {
        //  public string id { get; set; }
        //   public string urlViewDoc { get; set; }

        public string TypeCloud { get; set; }
        public string ViewDocInfo { get; set; }
        public CloudConnectionStringModel ConnectionString { get; set; }

        public string ImagesSynced { get; set; }

        public List<ImageSyncedModel> ImagesSync { get; set; }
    }
    public class CloudViewDocModel
    {
        //  public string id { get; set; }
        //   public string urlViewDoc { get; set; }

        public string CloudFilePath { get; set; }
        public string CloudMediaPath { get; set; }

        public string CloudMediaName { get; set; }
    }
    public class CloudChangeDocModel
    {

        public string SourcePath { get; set; }
        public string DesinationPath { get; set; }
        public string ActionType { get; set; }
        public string IndexName { get; set; }
        public string IdMainDocument { get; set; }
    }
    public class CloudChangePathModel
    {

        public string SourcePath { get; set; }
        public string DesinationPath { get; set; }
        public string ActionType { get; set; }
        public string NewName { get; set; }
        public string IdDocumentTree { get; set; }
    }

    //public class CloudAutoShareModel :CloudConnectionModel
    //{
      
    //    public string CloudType { get; set; }

    //    public bool IsShare { get; set; }
    //    //  public CloudConnectionStringModel ConnectionString { get; set; }
    //}

    public class ImageSyncQueueModel
    {
        public string IdSyncCloudQueue { get; set; }
        public int RepeatedTries { get; set; }
        public string CloudMediaPath { get; set; }
        public string SubFolderCloud { get; set; }
        public string ScannedPath { get; set; }
        public string FileName { get; set; }
        public string SyncErrorLog { get; set; }
        public string CloudFilePath { get; set; }
    }

    public class ImageSyncedModel
    {
        public string ImageName { get; set; }
        public string DocLink { get; set; }
        public string Id { get; set; }
        public string UrlViewDoc { get; set; }
        public string DriveId { get; set; }
        public string ItemId { get; set; }
    }
    public class ReponseUploadDocOneDrive
    {
        public string DriveId { get; set; }
        public string ItemId { get; set; }
    }

    public class DriveItemInfo
    {
        public string DriveId { get; set; }
        public string DriveItemId { get; set; }
    }

}
