using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils.RestServiceHelper
{

    public class CloudModel
    {
        public string UserName { get; set; }
        public string ClientId { get; set; }
        public string Password { get; set; }
        public string ConnectionString { get; set; }
        public string IdApplicationOwner { get; set; }
        public string IdCloudConnection { get; set; }
        public string IdCloudProviders { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }

    public class JSONCloud
    {
        public List<DocumentContainerOCR> DocumentContainerOCR { get; set; }
    }

    public class CloudSaveData : Data
    {
        public string JSONDocumentContainerOCR { get; set; }
    }
    public class SyncCloudQueueUpdateData : Data
    {
        public string JsonSyncCloudQueue { get; set; }
    }
    public class JsonSyncCloudQueue
    {
        public List<SyncCloudQueueUpdateModel> SyncCloudQueue { get; set; }
    }
    public class SyncCloudQueueUpdateModel
    {
        public string IdSyncCloudQueue { get; set; }
        public string CloudMediaPath { get; set; }
        public string IsSync { get; set; }
        public string RepeatedTries { get; set; }
        public string SyncErrorLog { get; set; }
        public string IsActive { get; set; }
        public string CloudFilePath { get; set; }
        public string IdRepTreeMediaType { get; set; }
        public string IdDocumentTreeMedia { get; set; }

    }
    public class CloudConnectionSaveData : Data
    {
        public string JSONText { get; set; }
    }
    public class CloudConnectionGetData : Data
    {
        public string IdCloudProviders { get; set; }
    }
    public class JsonCloudConnection
    {
        public List<CloudConnectionSaveModel> CloudConnection { get; set; }
    }
    public class CloudConnectionSaveModel
    {
        public string UserName { get; set; }
        public string ClientId { get; set; }
        public string Password { get; set; }
        public string ConnectionString { get; set; }
        public string IdCloudConnection { get; set; }
        public string IdCloudProviders { get; set; }
        public string IdApplicationOwner { get; set; }
        public string UserEmail { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }

    }
    public class SyncCloudQueueGetData : Data
    {
        public string RepeatedTries { get; set; }
        public string ListIdMainDocument { get; set; }
    }

    public class SyncCloudQueueGetImagesOfDoc : Data
    {
        public string IdSyncCloudQueue { get; set; }
    }


}
