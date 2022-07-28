using DMS.Extensions;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using Hangfire;
using Hangfire.Server;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
namespace DMS.Business.CloudDriveBusiness
{
    public interface ICloudJobBusiness
    {
        [Queue("mydm_sync_cloud_fail")]
        [DisplayName("Sync Documents Fail User: {0}")]
        [SyncCLoudFilter]
        Task SyncDocumentsFailJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel);
        [Queue("mydm_sync_cloud")]
        [DisplayName("Sync Documents User: {0}")]
        [SyncCLoudFilter]
        Task SyncDocumentsByIdsJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel);
        [Queue("mydm_sync_cloud")]
        [DisplayName("Sync Documents User: {0}")]
        [SyncCLoudFilter]
        Task SyncAllDocumentsUserJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel);
        [DisplayName("User {0} : {1} Doc  ")]
        [SyncCLoudFilter]
        Task ChangeDocJob(string loginName, string actionType, Data _data, CloudChangeDocModel changeDocModel);
        [DisplayName("User {0} : {1} Path  ")]
        [SyncCLoudFilter]
        Task<object> ChangePathJob(string loginName, string actionType, Data _data, CloudActiveUserModel cloudActiveUser, CloudChangePathModel changePathModel);
        ICloudSyncBusiness GetCloudSyncBusinessImpl(string cloudType,string oneDriveType=null);
        Task SwitchCloudJob(string loginName, CloudActiveUserModel oldCloud, CloudActiveUserModel currentCloud, Data _data);


    }
}
