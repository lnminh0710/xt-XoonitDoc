using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface ICloudService
    {
        Task<object> GetCloudActives(Data data);
        Task<List<CloudSyncQueueModel>> GetSyncCloudQueue(SyncCloudQueueGetData data);
        Task<List<CloudSyncQueueModel>> GetSyncCloudQueueByIds(SyncCloudQueueGetData data);
        Task<WSEditReturn> UpdateSyncCloudQueue(SyncCloudQueueUpdateData data);
        Task<WSEditReturn> SaveCloudConnection(CloudConnectionSaveData data);
        Task<object> GetCloudConnection(CloudConnectionGetData data);
        Task<CloudActiveUserModel> GetCloudActiveByUser(Data data);
        Task<List<ImageSyncQueueModel>> GetImagesOfMainDocFromSyncQueue(SyncCloudQueueGetImagesOfDoc data);

        Task<object> GetCloudActiveOfSpecificUser(Data data, string idLogin, string idApplicationOwner);
    }
}
