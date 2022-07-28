using DMS.Models.DMS;
using DMS.Utils;
using RestSharp;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DMS.Utils.Cloud;
using Microsoft.Graph;
using System;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using DMS.Constants;
using System.Reflection;

namespace DMS.Business
{
    public class CloudSyncBusinessOneDriveSignIn : ICloudSyncBusiness
    {
        // private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "cloud_onedrive");
        private OneDrive oneDriveSetting;
        // private GraphServiceClient graphClient;
        private Token token = null;
        private List<QueryOption> queryOptions = new List<QueryOption>()
            {
                new QueryOption("allowExternal", "true")
            };
        //new QueryOption("allowExternal", "true"),
        //        new QueryOption("expand", "fields(select=ID,Author,Title,DocumentName,Email)")
        private double MAX_FILE_SIZE_IN_MB = 4;
        public CloudSyncBusinessOneDriveSignIn(AppSettings _appSettings)
        {
            oneDriveSetting = _appSettings.Clouds.OneDrive;
            oneDriveSetting.ClientSecret = _appSettings.Clouds.OneDriveClientSecret;
            oneDriveSetting.RefreshToken = _appSettings.Clouds.OneDriveRefreshToken;

        }
        public void Init(AppSettings _appSettings)
        {
            oneDriveSetting = _appSettings.Clouds.OneDrive;
            oneDriveSetting.ClientSecret = _appSettings.Clouds.OneDriveClientSecret;
            oneDriveSetting.RefreshToken = _appSettings.Clouds.OneDriveRefreshToken;

        }
        public async Task<DriveItem> GetDriveItemById(GraphServiceClient graphClient, string shareFolderId)
        {
            try
            {
                var driveItem = await graphClient.Me.Drive.Items[shareFolderId].Request().GetAsync();
                return driveItem;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        public virtual GraphServiceClient AuthenticateOneDrive(CloudConnectionStringModel connectionModel)
        {
            try
            {

                if (token == null || DateTime.Now < token.ExpiredDateTime)
                {
                    if (string.IsNullOrEmpty(oneDriveSetting.ClientId) || string.IsNullOrEmpty(oneDriveSetting.ClientSecret) ||
                string.IsNullOrEmpty(oneDriveSetting.RefreshToken))
                    {
                        throw new Exception("OneDriveClientId , OneDriveClientSecret, RefreshToken IsNullOrEmpty " + JsonConvert.SerializeObject(oneDriveSetting));
                    }
                    token = OneDriveUtils.GetAccessTokenByRefreshToken(oneDriveSetting.ClientId, oneDriveSetting.ClientSecret,
                        token != null && token.RefreshToken != null ? token.RefreshToken : oneDriveSetting.RefreshToken, true);
                    //      }

                }
                GraphServiceClient graphClient = new GraphServiceClient(
                  "https://graph.microsoft.com/v1.0",
                  new DelegateAuthenticationProvider(
                      async (requestMessage) =>
                      {

                          requestMessage.Headers.Authorization = new AuthenticationHeaderValue("bearer", token.AccessToken);
                      }));
                return graphClient;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public virtual async Task<DriveItem> getDriveItemSync(GraphServiceClient graphClient, CloudConnectionStringModel connectionModel)
        {
            if (string.IsNullOrEmpty(connectionModel.SharedFolder) || string.IsNullOrEmpty(connectionModel.UserEmail))
            {
                throw new Exception("SharedFolder , UserEmail IsNullOrEmpty");
            }

            var sharedWithMeList = await graphClient.Me.Drive
                               .SharedWithMe()
                        .Request(queryOptions)
                       .GetAsync();

            if (sharedWithMeList == null || sharedWithMeList.Count == 0)
            {
                throw new Exception("No folder shared from account " + connectionModel.UserEmail);
            }
            try
            {
                if (!string.IsNullOrEmpty(connectionModel.SharedFolderId))
                {

                    var item = sharedWithMeList.Where(x => x.RemoteItem != null && x.RemoteItem.Id == connectionModel.SharedFolderId).FirstOrDefault();
                    if (item != null)
                    {
                        return item;
                    }
                }

            }
            catch (Exception e)
            {

            }
            throw new Exception("No folder shared from account " + connectionModel.UserEmail);
        }
        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            GraphServiceClient graphClient = AuthenticateOneDrive(connectionModel);
            //if (string.IsNullOrEmpty(connectionModel.SharedFolder) || string.IsNullOrEmpty(connectionModel.UserEmail))
            //{
            //    throw new Exception("SharedFolder , UserEmail IsNullOrEmpty");
            //}
            if (graphClient == null)
            {
                throw new Exception("AuthenticateOneDrive Fail");
            }
            DriveItem itemToSync = await getDriveItemSync(graphClient, connectionModel);
            if (itemToSync == null)
            {
                throw new Exception("No folder found  " + connectionModel.UserEmail);
            }
            return new object[] { graphClient, itemToSync };




        }


        private async Task<DriveItem> CreateFolder(string foldername, DriveItemInfo driveItemInfo, GraphServiceClient graphClient)
        {
            foldername = foldername.Replace(@"\", @"/");
            string[] splitted = foldername.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            var f = graphClient.Drives[driveItemInfo.DriveId].
                        Items[driveItemInfo.DriveItemId];
            string p = "";
            IDriveItemRequestBuilder b;
            DriveItem driveItem = null;
            foreach (string folder in splitted)
            {
                p = string.Format("{0}{1}{2}", p, string.IsNullOrEmpty(p) ? "" : "/", folder);

                b = graphClient.Drives[driveItemInfo.DriveId].
                        Items[driveItemInfo.DriveItemId].ItemWithPath(p);
                try
                {
                    driveItem = await b.Request(queryOptions).GetAsync();
                }
                catch
                {
                    driveItem = null;
                }
                if (driveItem == null)
                {
                    var f2 = await f.Children.Request(queryOptions).AddAsync(new DriveItem()
                    {
                        Name = folder,
                        Folder = new Folder()
                    });

                    b = graphClient.Drives[driveItemInfo.DriveId].
                        Items[driveItemInfo.DriveItemId].ItemWithPath(p);
                }
                f = b;
            }
            //var s=await f.Request().GetAsync();
            return driveItem != null ? driveItem : await f.Request(queryOptions).GetAsync();
        }
        private async Task<DriveItem> GetDriveItemByPath(string foldername, DriveItemInfo driveItemInfo, GraphServiceClient graphClient)
        {
            foldername = foldername.Replace(@"\", @"/");
            string[] splitted = foldername.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            var f = graphClient.Drives[driveItemInfo.DriveId].
                        Items[driveItemInfo.DriveItemId];
            string p = "";
            IDriveItemRequestBuilder b;
            DriveItem driveItem = null;
            foreach (string folder in splitted)
            {
                p = string.Format("{0}{1}{2}", p, string.IsNullOrEmpty(p) ? "" : "/", folder);

                b = graphClient.Drives[driveItemInfo.DriveId].
                        Items[driveItemInfo.DriveItemId].ItemWithPath(p);
                try
                {
                    driveItem = await b.Request().GetAsync();
                }
                catch
                {
                    driveItem = null;
                }
                if (driveItem == null)
                {
                    return null;
                }
                f = b;
            }
            //var s=await f.Request().GetAsync();
            return driveItem != null ? driveItem : await f.Request().GetAsync();
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            string fullPath = Path.Combine(doc.ScannedPath, doc.FileName);
            var fileInfo = new FileInfo(fullPath);
            double fileSizeInMb = ConvertBytesToMegabytes(fileInfo.Length);
            GraphServiceClient graphServiceClient = (GraphServiceClient)agrs[0];
            DriveItem driveItemSync = (DriveItem)agrs[1];
            DriveItemInfo driveItemInfo = GetDriveItemInfo(driveItemSync);
            DriveItem uploadFolder = null;
            DriveItem uploadResult = null;
            //   AuthenticateOneDrive();
            if (!string.IsNullOrEmpty(doc.CloudMediaPath))
            {
                uploadFolder = await CreateFolder(doc.CloudMediaPath, driveItemInfo, graphServiceClient);
            }

            DriveItem folder = uploadFolder != null ? uploadFolder : driveItemSync;

            var driveId = folder.ParentReference.DriveId;
            var driveItemId = folder.Id;
            if (fileSizeInMb <= MAX_FILE_SIZE_IN_MB)
            {
                uploadResult = await UploadFile(driveId, driveItemId, fullPath, doc.MediaName, graphServiceClient);
            }
            else
            {
                uploadResult = await UploadLargeFile(driveId, driveItemId, fullPath, doc.MediaName, graphServiceClient);
            }
            if (uploadResult != null)
            {
                ReponseUploadDocOneDrive reponseUploadDocOneDrive = new ReponseUploadDocOneDrive();
                reponseUploadDocOneDrive.DriveId = uploadResult.ParentReference.DriveId;
                reponseUploadDocOneDrive.ItemId = uploadResult.Id;
                string viewDocDataString = JsonConvert.SerializeObject(reponseUploadDocOneDrive);
                ReponseUploadDocToCloud reponseUploadDoc = new ReponseUploadDocToCloud();
                reponseUploadDoc.TypeCloud = CloudType.OneDrive;
                reponseUploadDoc.ViewDocInfo = viewDocDataString;
                return reponseUploadDoc;
            }

            return null;
        }
        private double ConvertBytesToMegabytes(long bytes)
        {
            return (bytes / 1024f) / 1024f;
        }
        private async Task<DriveItem> UploadFile(string driveId, string itemId, string fullPath, string cloudMediaName, GraphServiceClient graphClient)
        {
            var fileName = !string.IsNullOrEmpty(cloudMediaName) ? cloudMediaName : System.IO.Path.GetFileName(fullPath);
            using (var stream = new System.IO.FileStream(fullPath, System.IO.FileMode.Open))
            {
                DriveItem uploadResult = await graphClient.Drives[driveId].
                      Items[itemId].ItemWithPath(fileName).Content
                 .Request()
                 .PutAsync<DriveItem>(stream);
                return uploadResult;

            }

        }
        private async Task<DriveItem> UploadFileStream(string driveId, string itemId, string cloudMediaName, Stream stream, GraphServiceClient graphClient)
        {
            DriveItem uploadResult = await graphClient.Drives[driveId].
                  Items[itemId].ItemWithPath(cloudMediaName).Content
             .Request()
             .PutAsync<DriveItem>(stream);
            return uploadResult;

        }
        public async Task<object> GetFile(string viewDocInfo, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud resUploadDoc)
        {
            GraphServiceClient graphClient = AuthenticateOneDrive(resUploadDoc.ConnectionString);
            // string DriveId = "b!sctvD-ie9ES0cNBIa-LWIke4xqvKZqtCpGQ0RKQLwya_7C6166ihSLSRArL8gtn9";
            // string ItemId = "01HK7UDKQ3YGHEPUZQS5GL57WJU4APEMV4";
            ReponseUploadDocOneDrive reponseUploadDoc = JsonConvert.DeserializeObject<ReponseUploadDocOneDrive>(viewDocInfo);
            Stream stream = await graphClient.Drives[reponseUploadDoc.DriveId].
                        Items[reponseUploadDoc.ItemId].Content
                   .Request().GetAsync();
            CloudDownloadFileReponse data = new CloudDownloadFileReponse();
            data.FileName = cloudMediaName;
            data.stream = stream;
            //  var s=new ByteArrayContent(stream.)
            return data;
        }

        public async Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud reponseUploadDoc, params object[] agrs)
        {
            //ReponseUploadDocToCloud reponseUploadDoc = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);
            ReponseUploadDocOneDrive viewDocInfo = JsonConvert.DeserializeObject<ReponseUploadDocOneDrive>(reponseUploadDoc.ViewDocInfo);
            CloudConnectionStringModel connectionModel = reponseUploadDoc.ConnectionString;
            string sourcePath = changeDocModel.SourcePath;
            string destinationPath = changeDocModel.DesinationPath;
            //   AuthenticateOneDrive();
            var preSyncResult = await PreSync(connectionModel);
            // DriveItem sharedItem = (DriveItem)(preSyncResult[0]);
            GraphServiceClient graphClient = (GraphServiceClient)agrs[0];
            DriveItem driveItemSync = (DriveItem)agrs[1];
            DriveItemInfo driveItemInfo = GetDriveItemInfo(driveItemSync);
            DriveItem destinationItem = await CreateFolder(destinationPath, driveItemInfo, graphClient);
            var driveItem = new DriveItem
            {
                ParentReference = new ItemReference
                {
                    Id = destinationItem.Id
                },
                AdditionalData = new Dictionary<string, object>()
                            {
                                {"@microsoft.graph.conflictBehavior","replace"}
                            }
            };
            DriveItem uploadResult = await graphClient.Drives[viewDocInfo.DriveId].Items[viewDocInfo.ItemId].Request().UpdateAsync(driveItem);
            if (uploadResult != null)
            {
                ReponseUploadDocOneDrive reponseUploadDocOneDrive = new ReponseUploadDocOneDrive();
                reponseUploadDocOneDrive.DriveId = uploadResult.ParentReference.DriveId;
                reponseUploadDocOneDrive.ItemId = uploadResult.Id;
                string viewDocDataString = JsonConvert.SerializeObject(reponseUploadDocOneDrive);
                ReponseUploadDocToCloud reponseU = new ReponseUploadDocToCloud();
                reponseU.TypeCloud = CloudType.OneDrive;
                reponseU.ViewDocInfo = viewDocDataString;
                return reponseU;
            }

            return null;
        }


        public async Task<object> RenamePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            string sourcePath = changePathModel.SourcePath;

            // AuthenticateOneDrive();
            var preSyncResult = await PreSync(connectionModel);
            //DriveItem sharedItem = (DriveItem)(preSyncResult[0]);
            GraphServiceClient graphClient = (GraphServiceClient)agrs[0];
            DriveItem driveItemSync = (DriveItem)agrs[1];
            DriveItemInfo driveItemInfo = GetDriveItemInfo(driveItemSync);
            DriveItem sourceItem = await GetDriveItemByPath(sourcePath, driveItemInfo, graphClient);
            if (sourceItem == null)
            {
                throw new Exception(String.Format("SourcePath {0} NotFound", sourcePath));
            }
            //var driveItem = new DriveItem
            //{
            //    Name = changePathModel.NewName
            //};

            return await renameFolder(sourceItem.Id, changePathModel.NewName, graphClient);
        }
        private async Task<DriveItem> renameFolder(string driveItemId, string newFolderName, GraphServiceClient graphClient)
        {
            var driveItem = new DriveItem
            {
                Name = newFolderName
            };

            return await graphClient.Me.Drive
                            .Items[driveItemId]
                            .Request()
                            .UpdateAsync(driveItem);
        }

        public async Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud reponseUploadDoc, params object[] agrs)
        {
            ReponseUploadDocOneDrive viewDocInfo = JsonConvert.DeserializeObject<ReponseUploadDocOneDrive>(reponseUploadDoc.ViewDocInfo);
            string sourcePath = changeDocModel.SourcePath;
            //   ReponseUploadDocToCloud reponseUploadDoc = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);
            CloudConnectionStringModel connectionModel = reponseUploadDoc.ConnectionString;
            GraphServiceClient graphClient = AuthenticateOneDrive(connectionModel);

            await graphClient.Drives[viewDocInfo.DriveId]
                           .Items[viewDocInfo.ItemId].Request().DeleteAsync();
            return doc.FileName;
        }

        public async Task<bool> TestCloudConnection(CloudConnectionTestModel model)
        {
            GraphServiceClient graphClient = AuthenticateOneDrive(model.CloudToken);
            if (model.IsCheckStatusConnection)
            {
                var preSyncResult = await PreSync(model);
                return preSyncResult != null;
            }
            //Create or return DriveItem (if exist )
            DriveItem driveItem = await GetDriveItemById(graphClient, model.SharedFolderId);
            //   DriveItem driveItem = await CreateFolder(model.SharedFolder, graphClient);
            //if (driveItem == null)
            //{
            //    throw new Exception("TestCloudConnection OneDrive fail");
            //}
            //if (!string.IsNullOrEmpty(model.SharedFolderId) && model.SharedFolder != driveItem.Name)
            //{
            //    await renameFolder(driveItem.Id, model.SharedFolder, graphClient);
            //}
            if (driveItem == null)
            {
                throw new Exception("No folder found !");
            }
            return true;
        }

        public async Task<object> DeletePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            string sourcePath = changeDocModel.SourcePath;
            //   ReponseUploadDocToCloud reponseUploadDoc = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);

            //  AuthenticateOneDrive();
            var preSyncResult = await PreSync(connectionModel);
            GraphServiceClient graphClient = (GraphServiceClient)agrs[0];
            DriveItem driveItemSync = (DriveItem)agrs[1];
            //  DriveItem sharedItem = (DriveItem)(preSyncResult[0]);
            DriveItemInfo driveItemInfo = GetDriveItemInfo(driveItemSync);
            DriveItem sourceItem = await GetDriveItemByPath(sourcePath, driveItemInfo, graphClient);
            if (sourceItem == null)
            {
                throw new Exception(String.Format("SourcePath {0} NotFound", sourcePath));
            }
            await graphClient.Drives[driveItemSync.ParentReference.DriveId]
                            .Items[sourceItem.Id].Request().DeleteAsync();
            return sourceItem.Name;
        }
        public async Task<UploadSession> GetUploadSession(string driveId, string itemId, string cloudMediaName, GraphServiceClient graphClient)
        {
            // AuthenticateOneDrive();
            DriveItemUploadableProperties uploadableProperties = new DriveItemUploadableProperties
            {
                AdditionalData = new Dictionary<string, object>()
                             {
                                {"@microsoft.graph.conflictBehavior","replace"}
                             },
                Name = cloudMediaName
            };
            return await graphClient.Drives[driveId]
                            .Items[itemId].ItemWithPath(cloudMediaName).CreateUploadSession().Request().PostAsync();
        }
        private async Task<DriveItem> UploadLargeFileStream(string driveId, string itemId, string cloudMediaName, Stream stream, GraphServiceClient graphClient)
        {
            var uploadSession = await GetUploadSession(driveId, itemId, cloudMediaName, graphClient);

            // this is the upload manager class that does the magic
            var uploadProvider = new ChunkedUploadProvider(uploadSession, graphClient, stream);

            // these are the chunk requests that will be made
            var chunks = uploadProvider.GetUploadChunkRequests();

            // you can use this to track exceptions, not used in this example
            var exceptions = new List<Exception>();

            // upload the chunks
            foreach (var chunk in chunks)
            {
                var chunkRequestResponse = await uploadProvider.GetChunkRequestResponseAsync(chunk, exceptions);



                // when the chunks are finished...
                if (chunkRequestResponse.UploadSucceeded)
                {
                    Console.WriteLine("Upload is complete", chunkRequestResponse.ItemResponse);
                    return chunkRequestResponse.ItemResponse;
                }
            }
            return null;
        }
        private async Task<DriveItem> UploadLargeFile(string driveId, string itemId, string filePath, string cloudMediaName, GraphServiceClient graphClient)
        {
            try
            {
                var fileName = !string.IsNullOrEmpty(cloudMediaName) ? cloudMediaName : System.IO.Path.GetFileName(filePath);

                using (MemoryStream stream = new MemoryStream(GetFileBytes(filePath)))
                {

                    return await UploadLargeFileStream(driveId, itemId, fileName, stream, graphClient);
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public static byte[] GetFileBytes(string filePath)
        {
            return System.IO.File.ReadAllBytes(filePath);
        }

        public Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {
            throw new Exception();
        }

        public async Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            GraphServiceClient graphClient = AuthenticateOneDrive(infoFile.ConnectionString);

            ReponseUploadDocOneDrive reponseUploadDoc = JsonConvert.DeserializeObject<ReponseUploadDocOneDrive>(infoFile.ViewDocInfo);
            Stream stream = await graphClient.Drives[reponseUploadDoc.DriveId].
                        Items[reponseUploadDoc.ItemId].Content
                   .Request().GetAsync();
            return stream;
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            double fileSizeInMb = ConvertBytesToMegabytes(stream.Length);
            GraphServiceClient graphServiceClient = (GraphServiceClient)agrs[0];
            DriveItem driveItemSync = (DriveItem)agrs[1];
            //  DriveItem sharedItem = (DriveItem)agrs[0];
            DriveItemInfo driveItemInfo = GetDriveItemInfo(driveItemSync);
            DriveItem uploadFolder = null;
            DriveItem uploadResult = null;
            //AuthenticateOneDrive();
            if (!string.IsNullOrEmpty(doc.CloudMediaPath))
            {
                uploadFolder = await CreateFolder(doc.CloudMediaPath, driveItemInfo, graphServiceClient);
            }
            DriveItem folder = uploadFolder != null ? uploadFolder : driveItemSync;
            var driveId = folder.RemoteItem != null ? folder.RemoteItem.ParentReference.DriveId : folder.ParentReference.DriveId;
            var driveItemId = folder.RemoteItem != null ? folder.RemoteItem.Id : folder.Id;
            if (fileSizeInMb <= MAX_FILE_SIZE_IN_MB)
            {
                uploadResult = await UploadFileStream(driveId, driveItemId, doc.MediaName, stream, graphServiceClient);
            }
            else
            {
                uploadResult = await UploadLargeFileStream(driveId, driveItemId, doc.MediaName, stream, graphServiceClient);
            }
            if (uploadResult != null)
            {
                ReponseUploadDocOneDrive reponseUploadDocOneDrive = new ReponseUploadDocOneDrive();
                reponseUploadDocOneDrive.DriveId = uploadResult.ParentReference.DriveId;
                reponseUploadDocOneDrive.ItemId = uploadResult.Id;
                string viewDocDataString = JsonConvert.SerializeObject(reponseUploadDocOneDrive);
                ReponseUploadDocToCloud reponseUploadDoc = new ReponseUploadDocToCloud();
                reponseUploadDoc.TypeCloud = CloudType.OneDrive;
                reponseUploadDoc.ViewDocInfo = viewDocDataString;
                return reponseUploadDoc;
            }

            return null;
        }
        public virtual DriveItemInfo GetDriveItemInfo(DriveItem driveItem)
        {
            //string type = driveItem.RemoteItem.ParentReference.DriveType;
            //if (type.ToLower() == "personal")
            //{
            return new DriveItemInfo
            {
                DriveId = driveItem.RemoteItem.ParentReference.DriveId,
                DriveItemId = driveItem.RemoteItem.Id
            };

            //else
            //{
            //    var driveId = driveItem.RemoteItem != null ? driveItem.RemoteItem.ParentReference.DriveId : driveItem.ParentReference.DriveId;
            //    var driveItemId = driveItem.RemoteItem != null ? driveItem.RemoteItem.Id : driveItem.Id;
            //    return new DriveItemInfo
            //    {
            //        DriveId = driveId,
            //        DriveItemId = driveItemId
            //    };
            //}

        }
        public GraphServiceClient AuthenticateOneDrive(CloudToken token)
        {

            if (token == null || string.IsNullOrEmpty(token.access_token) || string.IsNullOrEmpty(token.refresh_token))
            {
                throw new Exception("Cloud Token info wrong!");
            }
            string accessToken = token.access_token;
            if (DateTime.Now > token.expired_date_time)
            {
                if (string.IsNullOrEmpty(oneDriveSetting.ClientId) || string.IsNullOrEmpty(oneDriveSetting.ClientSecret) ||
            string.IsNullOrEmpty(token.refresh_token))
                {
                    throw new Exception("OneDriveClientId , OneDriveClientSecret, RefreshToken IsNullOrEmpty " + JsonConvert.SerializeObject(oneDriveSetting));
                }
                accessToken = OneDriveUtils.GetAccessTokenByRefreshToken(oneDriveSetting.ClientId, oneDriveSetting.ClientSecret,
                   token.refresh_token);
            }
            GraphServiceClient graphClient = new GraphServiceClient(
            "https://graph.microsoft.com/v1.0",
            new DelegateAuthenticationProvider(
                async (requestMessage) =>
                {

                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("bearer", accessToken);
                }));
            return graphClient;


        }
        private async Task<DriveItem> GetDriveItemByPath(string foldername, GraphServiceClient _graphServiceClient)
        {
            try
            {
                foldername = foldername.Replace(@"\", @"/");
                return await _graphServiceClient.Me.Drive.Root.ItemWithPath(foldername).Request().GetAsync(); ;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        private async Task<object> ShareFolder(string driveItemId, GraphServiceClient _graphServiceClient)
        {
            var recipients = new List<DriveRecipient>()
            {
                new DriveRecipient
                {
                    Email = oneDriveSetting.MyDMEmail
                }
            };

            var message = "";

            var requireSignIn = true;

            var sendInvitation = false;

            var roles = new List<String>()
            {
                "write"
            };

            return await _graphServiceClient.Me.Drive.Items[driveItemId]
                 .Invite(recipients, requireSignIn, roles, sendInvitation, message)
                 .Request()
                 .PostAsync();
        }
        private async Task<DriveItem> CreateFolder(string folderName, GraphServiceClient graphServiceClient)
        {

            var driveItem = new DriveItem
            {
                Name = folderName.Trim(),
                Folder = new Folder
                {
                }
            };

            return await graphServiceClient.Me.Drive.Root.Children
               .Request()
               .AddAsync(driveItem);
        }
        public async Task CreateAndSharingFolder(CloudConnectionModel cloudConnectionModel, bool deleteFolderAfterTest)
        {

            CloudConnectionStringModel cloudConnectionString = cloudConnectionModel.ConnectionString;
            //string cloudToken = cloudConnectionString.CloudToken.access_token;
            bool isShare = string.IsNullOrEmpty(cloudConnectionString.DriveType) || cloudConnectionString.DriveType.ToLower() != OneDriveType.Business.ToLower();
            DriveItem driveItem = null;
            DriveItem driveItemByPath = null;
            GraphServiceClient _graphClient = AuthenticateOneDrive(cloudConnectionString.CloudToken);
            if (cloudConnectionString != null && !string.IsNullOrEmpty(cloudConnectionString.SharedFolder))
            {
                driveItemByPath = await GetDriveItemByPath(cloudConnectionString.SharedFolder, _graphClient);

                if (driveItemByPath == null)
                {
                    if (!string.IsNullOrEmpty(cloudConnectionString.SharedFolderId))
                    {
                        driveItem = await GetDriveItemById(_graphClient, cloudConnectionString.SharedFolderId);
                    }

                    if (driveItem == null)
                    {
                        if (driveItem == null)
                        {
                            driveItem = await CreateFolder(cloudConnectionString.SharedFolder, _graphClient);
                        }
                    }
                    else if (cloudConnectionString.SharedFolder != driveItem.Name)
                    {

                        var driveItemUpdate = new DriveItem
                        {
                            Name = cloudConnectionString.SharedFolder
                        };

                        driveItem = await _graphClient.Me.Drive
                                        .Items[driveItem.Id]
                                        .Request()
                                        .UpdateAsync(driveItemUpdate);
                    }

                    if (isShare)
                    {
                        await ShareFolder(driveItem.Id, _graphClient);
                    }
                }

                else if (cloudConnectionModel.IsChangeEmail)
                {
                    driveItem = driveItemByPath;
                }
                else
                {
                    //throw new Exception("Name Already Exists!");
                    driveItem = driveItemByPath;
                }

                cloudConnectionString = cloudConnectionString != null ? cloudConnectionString : new CloudConnectionStringModel();
                cloudConnectionString.SharedFolderId = driveItem.Id;
            }

        }
    }

}
