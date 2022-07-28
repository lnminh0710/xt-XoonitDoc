using System.IO;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Utils;

namespace DMS.Business
{
    public interface ICloudSyncBusiness
    {
        void Init(AppSettings _appSettings);
        Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs);
        Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs);

        Task<object> GetFile(string viewDocInfo, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc);
        Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs);
        Task<object> RenamePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs);
        Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs);
        Task<object> DeletePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs);
        Task<bool> TestCloudConnection(CloudConnectionTestModel model);

        Task<object> TestActionsWithCloud(CloudSyncModelPost model);
        Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile);

        Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs);
        Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest);
    }
}
