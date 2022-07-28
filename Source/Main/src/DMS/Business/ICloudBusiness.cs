using DMS.Constants;
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

namespace DMS.Business
{
    public interface ICloudBusiness
    {
        Task<object> GetCloudActives();


        Task<WSEditReturn> SaveCloudConnection(List<CloudConnectionModel> syncModels);
        Task<object> GetCloudConnection(int IdCloudProviders);
        //void SyncDocumentAAs();


        Task<object> UploadDocumentTestingToGoogleDrive(CloudSyncManually syncModel);

        Task<string> GetActiveIdCloudConnectionOfCurrentUser();

        Task<string> GetActiveIdCloudConnectionOfSpecificUser(string idLogin, string idApplicationOwner);

        //   Task<object> FindSharedFolderOnDropbox(string folderName, string fromAccount);

        //   MemoryStream GetDocumentFileFromCloud();

        Task SyncDocumentAAs();
        Task<object> DownloadFile(CloudViewDocModel viewDocModel);
        Task ChangeDoc(CloudChangeDocModel changeDocModel);
        Task ChangePath(CloudChangePathModel changePathModel);
        Task<CloudConnectionTestResponse> TestCloudConnection(CloudConnectionTestModel model);
        Task SyncDocsToCloud(CloudSyncModel syncModel, Data data = null);

        Task<object> ActionsWithCloud(CloudSyncModelPost syncModel);

        Task<CloudActiveUserModel> GetCloudActive();
        string GetConfigurationCloud(CloudTypeEnum cloudType);

        Task<CloudActiveUserModel> GetCurrentCloudActiveOfUser();

        Task<WSEditReturn> CreateAndSharingFolder(List<CloudConnectionModel> syncModels);

        CloudActiveUserModel GetCloudActiveOfUser();

        Task<CloudConnectionTestResponse> TestSharingFolderOnNewAccount(CloudConnectionTestModel syncModels);
    }
}
