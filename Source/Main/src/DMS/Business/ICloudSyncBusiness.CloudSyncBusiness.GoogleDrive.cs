using DMS.Utils;
using System.Linq;
using System;
using System.IO;
using System.Collections.Generic;
using DMS.Models.DMS;
using Google.Apis.Drive.v3;
using Google.Apis.Auth.OAuth2;
using System.Threading;
using Google.Apis.Util.Store;
using Google.Apis.Services;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Google.Apis.Download;
using Microsoft.Win32.SafeHandles;
using DMS.Constants;
using DMS.Models;
using RestSharp;
using System.Reflection;
using ZXing;

namespace DMS.Business
{
    public class CloudSyncBusinessGoogleDrive : ICloudSyncBusiness
    {
        static string[] Scopes = { DriveService.Scope.Drive, DriveService.Scope.DriveFile };
        private string _applicationName = "";
        private DriveService _driveService;
        private GoogleDrive _googleDriveSettings;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public CloudSyncBusinessGoogleDrive(AppSettings _appSettings)
        {
            _applicationName = _appSettings.Clouds.GoogleDrive.ApplicationNameApp;
            _googleDriveSettings = _appSettings.Clouds.GoogleDrive;
            AuthenticateAccountGoogle();
        }
        public void Init(AppSettings _appSettings)
        {
            _applicationName = _appSettings.Clouds.GoogleDrive.ApplicationNameApp;
            _googleDriveSettings = _appSettings.Clouds.GoogleDrive;
        }

        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            var s = new string[] { connectionModel.SharedFolder, connectionModel.UserEmail };
            return s;
        }
        #region Functions working Folders by user's token
        private async Task<string> CreateFolderForInitCloud(string userEmail, string folderName, string token)
        {
            var restClient = new RestClient("https://www.googleapis.com/drive/v3/files");
            RestRequest request = new RestRequest(Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + token);

            BodyRequestCreateFolderGoogleDrive md = new BodyRequestCreateFolderGoogleDrive();
            md.name = folderName;
            md.mimeType = "application/vnd.google-apps.folder";

            request.AddJsonBody(md);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response == null)
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive. Not received response . email {0} folder {1}", userEmail, folderName));
                throw new Exception("Error create Folder on GoogleDrive.");
            }
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive. Unauthorized. email {0} folder {1}", userEmail, folderName));
                throw new Exception("Unauthorized");
            }
            if (response.ErrorException != null)
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive. email {0} folder {1}", userEmail, folderName), response.ErrorException);
                throw new Exception(response.ErrorException.Message);
            }
            if (string.IsNullOrEmpty(response.Content))
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive.Not received content response. email {0} folder {1}", userEmail, folderName));
                throw new Exception("Cannot create Folder.");
            }
            ResponseCreateFolderGoogleDrive ent = JsonConvert.DeserializeObject<ResponseCreateFolderGoogleDrive>(response.Content);
            if (ent != null && !string.IsNullOrEmpty(ent.id))
            {
                return ent.id;
            }
            else
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive.Cannot parse content response. email {0} folder {1} - content: {2} ", userEmail, folderName, response.Content));
                throw new Exception("Cannot create Folder. Error parsing....");
            }
        }

        private async Task<string> FindFolderOnGoogleDrive(string userEmail, string folderName, string token, bool isCreateWhenNotFound)
        {
            if (string.IsNullOrEmpty(folderName))
            {
                throw new Exception("FolderName is undefined");
            }
            var restClient = new RestClient("https://www.googleapis.com/drive/v3/files?q=name='" + folderName + "'");
            RestRequest request = new RestRequest(Method.GET);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + token);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response == null)
            {
                _logger.Error(String.Format("Error search Folder on GoogleDrive. Not received response . email {0} folder {1}", userEmail, folderName));
                throw new Exception("Error call API to search.");
            }
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.Error(String.Format("Error create Folder on GoogleDrive. Unauthorized. email {0} folder {1}", userEmail, folderName));
                throw new Exception("Unauthorized");
            }
            if (response.ErrorException != null)
            {
                _logger.Error(String.Format("Error search Folder on GoogleDrive. email {0} folder {1}", userEmail, folderName), response.ErrorException);
                throw new Exception(response.ErrorException.Message);
            }
            if (string.IsNullOrEmpty(response.Content))
            {
                _logger.Error(String.Format("Error search Folder on GoogleDrive.Not received content response. email {0} folder {1}", userEmail, folderName));
                throw new Exception("No response received.");
            }
            ResponseFindFolderGoogleDrive ent = JsonConvert.DeserializeObject<ResponseFindFolderGoogleDrive>(response.Content);
            if (ent == null || ent.files.Count == 0)
            {
                if (isCreateWhenNotFound)
                {
                    string folderId = "";
                    try
                    {
                        folderId = await CreateFolderForInitCloud(userEmail, folderName, token);
                    }
                    catch (Exception exCreateFolder)
                    {
                        throw exCreateFolder;
                    }
                    if (folderId == null) folderId = "";
                    return "NEW_" + folderId;
                }
                return "";
            }

            return ent.files.FirstOrDefault().id;
        }

        private async Task<string> RenameFolderOnGoogleDrive(string userEmail, string newFolderName, string token, string idFolder)
        {
            if (string.IsNullOrEmpty(newFolderName))
            {
                throw new Exception("FolderName is undefined");
            }

            if (string.IsNullOrEmpty(idFolder))
            {
                throw new Exception("IdFolder is undefined");
            }
            var restClient = new RestClient("https://www.googleapis.com/drive/v3/files/" + idFolder + "");
            restClient.Timeout = -1;
            RestRequest request = new RestRequest(Method.PATCH);
            request.AddHeader("Authorization", "Bearer " + token);
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Accept", "application/vnd.api+json");

            BodyRequestCreateFolderGoogleDrive md = new BodyRequestCreateFolderGoogleDrive();
            md.name = newFolderName;
            md.mimeType = "application/vnd.google-apps.folder";
            //request.AddParameter("application/json", "{\r\n    \"name\":\"xoonit_tuan222\",\r\n    \"mimeTypex\":\"application/vnd.google-apps.folder\"\r\n}", ParameterType.RequestBody);
            request.AddJsonBody(md);
            // request.AddParameter("application/json", JsonConvert.SerializeObject(md), ParameterType.RequestBody);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response == null)
            {
                _logger.Error(String.Format("Error rename Folder on GoogleDrive. Not received response . email {0} folder {1}", userEmail, idFolder));
                throw new Exception("Error call API to search.");
            }
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.Error(String.Format("Error rename Folder on GoogleDrive. Unauthorized. email {0} folder {1}", userEmail, newFolderName));
                throw new Exception("Unauthorized");
            }

            if (response.ErrorException != null)
            {
                _logger.Error(String.Format("Error rename Folder on GoogleDrive. email {0} folder {1}", userEmail, newFolderName), response.ErrorException);
                throw new Exception(response.ErrorException.Message);
            }
            if (string.IsNullOrEmpty(response.Content))
            {
                _logger.Error(String.Format("Error rename Folder on GoogleDrive.Not received content response. email {0} folder {1}", userEmail, idFolder));
                throw new Exception("No response received.");
            }
            ResponseCreateFolderGoogleDrive ent = JsonConvert.DeserializeObject<ResponseCreateFolderGoogleDrive>(response.Content);
            if (ent != null)
            {
                return ent.id;
            }

            return null;
        }

        private async Task<bool> SharingFolderOnGoogleDrive(string userEmail, string token, string idFolder)
        {
            if (string.IsNullOrEmpty(idFolder))
            {
                throw new Exception("IdFolder is undefined");
            }
            var restClient = new RestClient("https://www.googleapis.com/drive/v3/files/" + idFolder + "/permissions");
            RestRequest request = new RestRequest("/", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + token);

            BodyRequestSharingFolder md = new BodyRequestSharingFolder();
            md.role = "writer";
            md.type = "user";
            md.emailAddress = _googleDriveSettings.MyDMEmail;

            request.AddJsonBody(md);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response == null)
            {
                _logger.Error(String.Format("Error sharing Folder on GoogleDrive. Not received response . email {0} folder {1}", userEmail, idFolder));
                throw new Exception("Error call API to search.");
            }
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.Error(String.Format("Error sharing Folder on GoogleDrive. Unauthorized. email {0} folder {1}", userEmail, idFolder));
                throw new Exception("Unauthorized");
            }

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return true;
            }

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.Error(String.Format("Error sharing Folder on GoogleDrive. Folder Not Found. email {0} folder {1}", userEmail, idFolder));
                throw new Exception("File not foud");
            }

            if (response.ErrorException != null)
            {
                _logger.Error(String.Format("Error sharing Folder on GoogleDrive. email {0} folder {1}", userEmail, idFolder), response.ErrorException);
                throw new Exception(response.ErrorException.Message);
            }
            if (string.IsNullOrEmpty(response.Content))
            {
                _logger.Error(String.Format("Error sharing Folder on GoogleDrive.Not received content response. email {0} folder {1}", userEmail, idFolder));
                throw new Exception("No response received.");
            }

            return false;
        }

        #endregion Functions working Folders by user's token

        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();
            string sharedFolder = (string)agrs[0];
            string fromAccount = (string)agrs[1];
            string fullPath = Path.Combine(doc.ScannedPath, doc.FileName);
            if (!System.IO.File.Exists(fullPath))
            {
                //   _logger.Error("File not found. File: " + fullPath + " \t Account: " + fromAccount);
                throw new Exception("File not found. File: " + fullPath);
            }

            string folderId = FindSharedFolderOfAccountGoogleDrive(sharedFolder, fromAccount);
            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("No folder shared from account " + fromAccount);
            }
            //string drivePath = Path.Combine(doc.CloudMediaPath, doc.MediaName);
            //drivePath = drivePath.Replace(@"\", @"/");
            string[] subFolders = !string.IsNullOrEmpty(doc.CloudMediaPath) ? doc.CloudMediaPath.Replace(@"\", @"/").Split('/') : new string[] { };

            string tempFolderId = folderId;
            foreach (string sub in subFolders)
            {
                if (string.IsNullOrEmpty(sub)) continue;
                try
                {
                    tempFolderId = FindChildWithParentId(_driveService, tempFolderId, sub.Trim(), true);
                }
                catch (Exception excFindSub)
                {
                    throw excFindSub;
                }
            }
            ReponseUploadDocToCloud res = new ReponseUploadDocToCloud();
            res.TypeCloud = CloudType.GoogleDrive;

            if (!doc.MainDocSynced.Value)
            {
                /** Sync MainDoc to Cloud */
                string fileNameOnCloud = string.IsNullOrEmpty(doc.MediaName) ? doc.FileName : doc.MediaName;
                try
                {
                    string id = UploadDocuments(_driveService, fullPath, fileNameOnCloud, tempFolderId);
                    string ss = "https://drive.google.com/file/d/" + id + "/view";

                    ReponseDetailUploadDocToGD v = new ReponseDetailUploadDocToGD();
                    v.id = id;
                    v.urlViewDoc = ss;
                    res.ViewDocInfo = JsonConvert.SerializeObject(v);
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
            if (doc.ImageFiles != null && doc.ImageFiles.Count > 0)
            {
                try
                {
                    tempFolderId = FindChildWithParentId(_driveService, tempFolderId, doc.ImageFiles.FirstOrDefault().SubFolderCloud, true);
                }
                catch (Exception excFindSub)
                {
                    throw excFindSub;
                }
                List<ImageSyncedModel> images = new List<ImageSyncedModel>();
                doc.ImageFiles.ForEach(img =>
                {
                    try
                    {
                        string fullPathImageLocal = Path.Combine(img.ScannedPath, img.FileName);
                        string id = UploadDocuments(_driveService, fullPathImageLocal, img.FileName, tempFolderId);
                        string ss = "https://drive.google.com/file/d/" + id + "/view";

                        ImageSyncedModel ism = new ImageSyncedModel();
                        ism.Id = id;
                        ism.UrlViewDoc = ss;
                        images.Add(ism);
                    }
                    catch (Exception e)
                    {
                        //   _logger.Error("File not found. File: " + fullPath + " \t Account: " + fromAccount);
                        throw e;
                    }
                });

                //res.ImagesSync = ImageS
            }
            //if (string.IsNullOrEmpty(res.ViewDocInfo)){
            //    //this time, only sync images of MainDoc
            //    //res.ImagesSync = ImageS
            //}
            return res;
        }

        private void AuthenticateAccountGoogle()
        {
            ClientSecrets clientSecrets = new ClientSecrets();
            clientSecrets.ClientId = _googleDriveSettings.ClientIdApp;
            clientSecrets.ClientSecret = _googleDriveSettings.ClientSecretApp;

            string credPath = "google_drive_token.json";
            try
            {
                UserCredential credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    clientSecrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;

                // Create Drive API service.
                _driveService = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _applicationName,
                });
            }
            catch (Exception ex)
            {
                //   _logger.Error("Error create connection to Google drive API.", ex);
                throw ex;
            }

        }

        private string FindSharedFolderOfAccountGoogleDrive(string folderName, string fromAccount)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();

            FilesResource.ListRequest listRequest = _driveService.Files.List();
            listRequest.PageSize = 100;
            listRequest.Fields = "nextPageToken, files(id, name, owners)";
            listRequest.Q = "mimeType = 'application/vnd.google-apps.folder' and sharedWithMe";

            IList<Google.Apis.Drive.v3.Data.File> files = null;
            try
            {
                files = listRequest.Execute().Files;
            }
            catch (Exception)
            {
                AuthenticateAccountGoogle();
                files = listRequest.Execute().Files;
            }

            if (files != null && files.Count > 0)
            {
                /** Priority search FolderShared **/
                if (!string.IsNullOrEmpty(folderName))
                {
                    foreach (var file in files)
                    {
                        if (!file.Name.ToLower().Equals(folderName.ToLower())) continue;
                        if (file.Owners != null)
                        {
                            List<Google.Apis.Drive.v3.Data.User> users = file.Owners.ToList();
                            if (users.Count == 0)
                            {
                                continue;
                            }
                            foreach (Google.Apis.Drive.v3.Data.User user in users)
                            {
                                if (!string.IsNullOrEmpty(user.EmailAddress) && user.EmailAddress.ToLower() == fromAccount)
                                {
                                    return file.Id;
                                }
                            }
                        }
                    }
                }
                /** Search owner when FolderShared = '' or not found above **/
                foreach (var file in files)
                {
                    if (file.Owners != null)
                    {
                        List<Google.Apis.Drive.v3.Data.User> users = file.Owners.ToList();
                        if (users.Count == 0)
                        {
                            continue;
                        }
                        foreach (Google.Apis.Drive.v3.Data.User user in users)
                        {
                            if (!string.IsNullOrEmpty(user.EmailAddress) && user.EmailAddress.ToLower() == fromAccount)
                            {
                                return file.Id;
                            }
                        };
                    }
                }
            }
            else
            {
                throw new Exception("(GoogleDrive) No folder shared from account " + fromAccount);
            }
            return "";
        }

        private string FindChildWithParentId(DriveService _driveService, string parentFolderId, string subFolderName, bool createSubFolderWhenNotExist)
        {
            FilesResource.ListRequest listRequest = _driveService.Files.List();
            listRequest.Fields = "files(id,name,parents)";
            listRequest.Q = string.Format("mimeType = 'application/vnd.google-apps.folder' and parents in '{0}'", parentFolderId);

            IList<Google.Apis.Drive.v3.Data.File> files = null;
            try
            {
                files = listRequest.Execute().Files;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                AuthenticateAccountGoogle();
                files = listRequest.Execute().Files;
            }
            string subFolderId = "";
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    if (file.Name != subFolderName) continue;
                    subFolderId = file.Id;
                    break;
                }
            }
            if (subFolderId == "" && createSubFolderWhenNotExist)
            {
                subFolderId = CreateSubFolder(_driveService, parentFolderId, subFolderName);
            }
            return subFolderId;
        }

        private string CreateSubFolder(DriveService _driveService, string parentFolderId, string subFolderName)
        {
            Google.Apis.Drive.v3.Data.File body = new Google.Apis.Drive.v3.Data.File();
            body.Description = "documents from MyDM application";
            body.Parents = new List<string>() { parentFolderId };

            try
            {
                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Parents = new List<string>() { parentFolderId },
                    Name = subFolderName,
                    MimeType = "application/vnd.google-apps.folder"
                };
                var request = _driveService.Files.Create(fileMetadata);
                request.Fields = "id";
                var file = request.Execute();
                //Console.WriteLine("Folder ID: " + file.Id);
                return file.Id;
            }
            catch (Exception e)
            {
                //    _logger.Error("Error CreateSubFolder to GoogleDrive.", e);
                throw e;
            }
        }

        private string UploadDocuments(DriveService _driveService, string _uploadFile, string fileNameOnCloud, string folderId)
        {
            string mimeType = GetMimeType(_uploadFile);
            Google.Apis.Drive.v3.Data.File body = new Google.Apis.Drive.v3.Data.File();
            body.Name = fileNameOnCloud;
            body.Description = "documents from MyDM application";
            body.Parents = new List<string>() { folderId };

            FilesResource.CreateMediaUpload requests;
            Google.Apis.Upload.IUploadProgress progress;
            try
            {
                using (var streams = new System.IO.FileStream(_uploadFile, System.IO.FileMode.Open))
                {
                    try
                    {
                        requests = _driveService.Files.Create(body, streams, mimeType);
                    }
                    catch (Exception ex)
                    {
                        AuthenticateAccountGoogle();
                        requests = _driveService.Files.Create(body, streams, mimeType);
                    }
                    requests.Alt = FilesResource.CreateMediaUpload.AltEnum.Json;
                    requests.Fields = "id";
                    progress = requests.Upload();

                    if (progress.Exception != null)
                    {
                        throw progress.Exception;
                    }
                    else
                    {
                        return requests.ResponseBody.Id;
                    }
                }
            }
            catch (Exception e)
            {
                // _logger.Error("Error sync document to GoogleDrive.", e);
                throw e;
            }
        }

        private static string GetMimeType(string fileName)
        {
            string mimeType = "application/unknown";
            string ext = System.IO.Path.GetExtension(fileName).ToLower();
            Microsoft.Win32.RegistryKey regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (regKey != null && regKey.GetValue("Content Type") != null)
                mimeType = regKey.GetValue("Content Type").ToString();
            System.Diagnostics.Debug.WriteLine(mimeType);
            return mimeType;
        }

        public async Task<object> GetFile(string info, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc)
        {
            ReponseDetailUploadDocToGD v = JsonConvert.DeserializeObject<ReponseDetailUploadDocToGD>(info);
            string idFile = v.id;

            var data = new CloudDownloadFileReponse();
            Stream filePath = new MemoryStream();
            try
            {
                filePath = DownloadGoogleFileToStream(idFile);

            }
            catch (Google.GoogleApiException ee)
            {
                if (ee.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    data.ErrorDetail = "File not found";
                    return data;
                }
                else
                {
                    throw ee;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            //FileStream fileStream = new FileStream(filePath, FileMode.Open);
            data.FileName = Path.GetFileName(cloudMediaName);
            data.stream = new MemoryStream();
            filePath.Position = 0;
            filePath.CopyTo(data.stream);
            filePath.Close();

            return data;
        }

        private string DownloadGoogleFile(string fileId)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();

            //string folderSaveFile = "TempCloud";
            Google.Apis.Drive.v3.FilesResource.GetRequest request = _driveService.Files.Get(fileId);

            string fileName = "";
            try
            {
                fileName = request.Execute().Name;
            }
            catch (Google.GoogleApiException ee)
            {
                if (ee.HttpStatusCode == System.Net.HttpStatusCode.NetworkAuthenticationRequired
                    || ee.HttpStatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    AuthenticateAccountGoogle();
                    request = _driveService.Files.Get(fileId);
                    fileName = request.Execute().Name;
                }
                else
                {
                    throw ee;
                }
            }
            //string fileDownloaded = System.IO.Path.Combine(folderSaveFile, fileName);
            string fileDownloaded = fileName;
            MemoryStream stream1 = new MemoryStream();

            // Add a handler which will be notified on progress changes.    
            // It will notify on each chunk download and when the    
            // download is completed or failed.    
            request.MediaDownloader.ProgressChanged += (Google.Apis.Download.IDownloadProgress progress) =>
            {
                switch (progress.Status)
                {
                    case DownloadStatus.Downloading:
                        {
                            Console.WriteLine(progress.BytesDownloaded);
                            break;
                        }
                    case DownloadStatus.Completed:
                        {
                            SaveStream(stream1, fileDownloaded);
                            break;
                        }
                    case DownloadStatus.Failed:
                        {
                            break;
                        }
                }
            };
            request.Download(stream1);
            return fileDownloaded;
        }

        private Stream DownloadGoogleFileToStream(string fileId)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();

            //string folderSaveFile = "TempCloud";
            Google.Apis.Drive.v3.FilesResource.GetRequest request = _driveService.Files.Get(fileId);

            string fileName = "";
            try
            {
                fileName = request.Execute().Name;
            }
            catch (Google.GoogleApiException ee)
            {
                if (ee.HttpStatusCode == System.Net.HttpStatusCode.NetworkAuthenticationRequired
                    || ee.HttpStatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    AuthenticateAccountGoogle();
                    request = _driveService.Files.Get(fileId);
                    fileName = request.Execute().Name;
                }
                else
                {
                    throw ee;
                }
            }
            //string fileDownloaded = System.IO.Path.Combine(folderSaveFile, fileName);
            Stream fileDownloaded = new MemoryStream();
            MemoryStream stream1 = new MemoryStream();

            // Add a handler which will be notified on progress changes.    
            // It will notify on each chunk download and when the    
            // download is completed or failed.    
            request.MediaDownloader.ProgressChanged += (Google.Apis.Download.IDownloadProgress progress) =>
            {
                switch (progress.Status)
                {
                    case DownloadStatus.Downloading:
                        {
                            Console.WriteLine(progress.BytesDownloaded);
                            break;
                        }
                    case DownloadStatus.Completed:
                        {
                            stream1.Position = 0;
                            stream1.CopyTo(fileDownloaded);
                            //SaveCloneStream(stream1, fileDownloaded);
                            break;
                        }
                    case DownloadStatus.Failed:
                        {
                            break;
                        }
                }
            };
            request.Download(stream1);
            return fileDownloaded;
        }

        // file save to server path    
        private void SaveStream(MemoryStream stream, string FilePath)
        {
            using (System.IO.FileStream file = new FileStream(FilePath, FileMode.Create, FileAccess.ReadWrite))
            {
                stream.WriteTo(file);
            }
        }

        public async Task<bool> TestCloudConnection(CloudConnectionTestModel model)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();
            if (string.IsNullOrEmpty(model.SharedFolder))
            {
                throw new Exception("SharedFolder is undefined");
            }
            if (string.IsNullOrEmpty(model.UserEmail))
            {
                throw new Exception("UserMail is undefined");
            }
            if((string.IsNullOrEmpty(model.SharedFolderId) && model.ConnectionString != null) && model.SharedFolder == model.ConnectionString.SharedFolder)
            {
                model.SharedFolderId = model.ConnectionString.SharedFolderId;
            }
            string folderId = TestSharedFolderOfAccountGoogleDrive(model.SharedFolder, model.UserEmail, model.SharedFolderId);
            if (string.IsNullOrEmpty(folderId))
            {
                _logger.Debug("Google-Drive: cannot find folder '" + model.SharedFolder + "'. Info Cloud: " + JsonConvert.SerializeObject(model));
                throw new Exception("Folder shared not found.");
            }
            return true;
        }

        private string TestSharedFolderOfAccountGoogleDrive(string folderName, string fromAccount, string sharedFolderId)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();
            FilesResource.ListRequest listRequest = _driveService.Files.List();
            listRequest.PageSize = 100;
            listRequest.Fields = "nextPageToken, files(id, name, owners)";
            listRequest.Q = "mimeType = 'application/vnd.google-apps.folder' and sharedWithMe";

            IList<Google.Apis.Drive.v3.Data.File> files = null;
            try
            {
                files = listRequest.Execute().Files;
            }
            catch (Exception)
            {
                AuthenticateAccountGoogle();
                files = listRequest.Execute().Files;
            }


            if (files != null && files.Count > 0)
            {
                /** Priority search FolderShared **/
                if (!string.IsNullOrEmpty(folderName))
                {
                    foreach (var file in files)
                    {
                        if (!string.IsNullOrEmpty(sharedFolderId))
                        {
                            if (!string.IsNullOrEmpty(file.Id) && file.Id == sharedFolderId)
                            {
                                return file.Id;
                            }
                        }
                        if (!file.Name.ToLower().Equals(folderName.ToLower())) continue;
                        if (file.Permissions != null
                            && file.Permissions.Where(p => p.EmailAddress.ToLower() == fromAccount && (p.Role.ToLower() == "owner" || p.Role.ToLower() == "writer")).FirstOrDefault() != null)
                        {
                            return file.Id;
                        }
                        if (file.Owners != null)
                        {
                            List<Google.Apis.Drive.v3.Data.User> users = file.Owners.ToList();
                            if (users.Count == 0)
                            {
                                continue;
                            }
                            foreach (Google.Apis.Drive.v3.Data.User user in users)
                            {
                                if (!string.IsNullOrEmpty(user.EmailAddress) && user.EmailAddress.ToLower() == fromAccount)
                                {
                                    return file.Id;
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                throw new Exception("(GoogleDrive) No folder shared from account " + fromAccount);
            }
            return "";
        }


        public async Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            /** mean: change parentId of DOC **/
            //1. parentId, id of SourcePath on Cloud
            //2. Find id of destination on Cloud
            //3. update parentId by id from (2) and remove Parentid(1)
            CloudConnectionStringModel connectionModel = JsonConvert.DeserializeObject<CloudConnectionStringModel>(doc.ConnectionString);
            ReponseDetailUploadDocToGD viewDocInfo = JsonConvert.DeserializeObject<ReponseDetailUploadDocToGD>(infoFile.ViewDocInfo);

            if (connectionModel == null || string.IsNullOrEmpty(connectionModel.SharedFolder) || string.IsNullOrEmpty(connectionModel.UserEmail))
            {
                throw new Exception("Cannot detect connection string to Cloud (" + doc.ConnectionString + ")");
            }

            if (viewDocInfo == null || string.IsNullOrEmpty(viewDocInfo.id))
            {
                throw new Exception("Cannot detect information of DOC on Cloud (" + infoFile.ViewDocInfo + ")");
            }

            string sharedFolderOfEndUser = connectionModel.SharedFolder;
            string emailOfEndUser = connectionModel.UserEmail;
            string oldPathOfDoc = changeDocModel.SourcePath;
            string newPathOfDoc = changeDocModel.DesinationPath;

            string fileId = viewDocInfo.id;//FindIdFolder(oldPathOfDoc, rootFolderId, false);

            if (string.IsNullOrEmpty(fileId))
            {
                throw new Exception("id of document is undefined ");
            }

            string rootFolderId = FindSharedFolderOfAccountGoogleDrive(sharedFolderOfEndUser, emailOfEndUser);
            if (string.IsNullOrEmpty(rootFolderId))
            {
                throw new Exception("Not found folder shared from account " + emailOfEndUser);
            }

            string newFolderId = FindIdFolder(newPathOfDoc, rootFolderId, true);

            if (string.IsNullOrEmpty(newFolderId))
            {
                throw new Exception("Not found folder: '" + newPathOfDoc + "' shared from account " + emailOfEndUser);
            }

            MoveFiles(fileId, newFolderId);

            return infoFile;
        }

        public async Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();

            ReponseDetailUploadDocToGD viewDocInfo = JsonConvert.DeserializeObject<ReponseDetailUploadDocToGD>(infoFile.ViewDocInfo);

            if (viewDocInfo == null || string.IsNullOrEmpty(viewDocInfo.id))
            {
                throw new Exception("Cannot detect information of DOC on Cloud (" + infoFile.ViewDocInfo + ")");
            }

            return DeleteFile(_driveService, viewDocInfo.id);
        }

        public async Task<object> RenamePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            /**
             *  rename 1 subfolder
             * **/
            //1. find id of subFolder rename
            //2. find parentId of subFolder
            if (connectionModel == null || string.IsNullOrEmpty(connectionModel.SharedFolder) || string.IsNullOrEmpty(connectionModel.UserEmail))
            {
                throw new Exception("Cannot detect connection to Cloud from parameter input");
            }

            if (changeDocModel == null || string.IsNullOrEmpty(changeDocModel.SourcePath) || string.IsNullOrEmpty(changeDocModel.DesinationPath))
            {
                throw new Exception("Cannot detect information of DOC changed from parameter input");
            }
            string sharedFolderOfEndUser = connectionModel.SharedFolder;
            string emailOfEndUser = connectionModel.UserEmail;
            string oldPath = changeDocModel.SourcePath;
            string newPath = changeDocModel.DesinationPath;

            if (_driveService == null)
                AuthenticateAccountGoogle();

            string rootFolderId = FindSharedFolderOfAccountGoogleDrive(sharedFolderOfEndUser, emailOfEndUser);
            if (string.IsNullOrEmpty(rootFolderId))
            {
                throw new Exception("Not found folder shared from account " + emailOfEndUser);
            }

            string folderId = FindIdFolder(oldPath, rootFolderId, false);

            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("Folder not found: '" + changeDocModel.SourcePath + "' from account " + emailOfEndUser);
            }

            string[] tmp = (!string.IsNullOrEmpty(newPath) ? newPath.Replace(@"\", @"/").Split('/') : new string[] { });
            string folderRename = tmp[tmp.Length - 1];

            bool resultRename = await RenameFile(_driveService, folderId, folderRename);

            return resultRename;
        }

        public async Task<object> DeletePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            if (connectionModel == null || string.IsNullOrEmpty(connectionModel.SharedFolder) || string.IsNullOrEmpty(connectionModel.UserEmail))
            {
                throw new Exception("Cannot detect connection to Cloud from parameter input");
            }

            if (changeDocModel == null || string.IsNullOrEmpty(changeDocModel.SourcePath))
            {
                throw new Exception("Cannot detect information of DOC changed from parameter input");
            }

            if (_driveService == null)
                AuthenticateAccountGoogle();

            string sharedFolderOfEndUser = connectionModel.SharedFolder;
            string emailOfEndUser = connectionModel.UserEmail;
            string oldPath = changeDocModel.SourcePath;

            if (_driveService == null)
                AuthenticateAccountGoogle();

            string rootFolderId = FindSharedFolderOfAccountGoogleDrive(sharedFolderOfEndUser, emailOfEndUser);
            if (string.IsNullOrEmpty(rootFolderId))
            {
                throw new Exception("Not found folder shared from account " + emailOfEndUser);
            }

            string folderId = FindIdFolder(oldPath, rootFolderId, false);

            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("Folder not found: '" + changeDocModel.SourcePath + "' from account " + emailOfEndUser);
            }

            return DeleteFile(_driveService, folderId);
        }

        private string MoveFiles(string fileId, string folderId)
        {
            // Retrieve the existing parents to remove    
            Google.Apis.Drive.v3.FilesResource.GetRequest getRequest = _driveService.Files.Get(fileId);
            getRequest.Fields = "parents";
            Google.Apis.Drive.v3.Data.File file = getRequest.Execute();
            string previousParents = String.Join(",", file.Parents);

            // Move the file to the new folder    
            Google.Apis.Drive.v3.FilesResource.UpdateRequest updateRequest = _driveService.Files.Update(new Google.Apis.Drive.v3.Data.File(), fileId);
            updateRequest.Fields = "id, parents";
            updateRequest.AddParents = folderId;
            updateRequest.RemoveParents = previousParents;

            file = updateRequest.Execute();
            if (file != null)
            {
                return "Success";
            }
            else
            {
                return "Fail";
            }
        }

        private string CopyFiles(string fileId, string folderId)
        {
            // Retrieve the existing parents to remove    
            Google.Apis.Drive.v3.FilesResource.GetRequest getRequest = _driveService.Files.Get(fileId);
            getRequest.Fields = "parents";
            Google.Apis.Drive.v3.Data.File file = getRequest.Execute();

            // Copy the file to the new folder    
            Google.Apis.Drive.v3.FilesResource.UpdateRequest updateRequest = _driveService.Files.Update(new Google.Apis.Drive.v3.Data.File(), fileId);
            updateRequest.Fields = "id, parents";
            updateRequest.AddParents = folderId;
            //updateRequest.RemoveParents = previousParents;    
            file = updateRequest.Execute();
            if (file != null)
            {
                return "Success";
            }
            else
            {
                return "Fail";
            }
        }

        private string FindIdFolder(string sourcePath, string folderId, bool isCreateFolderWhenNotExist)
        {
            string[] subFolders = !string.IsNullOrEmpty(sourcePath) ? sourcePath.Replace(@"\", @"/").Split('/') : new string[] { };

            string tempFolderId = folderId;
            foreach (string sub in subFolders)
            {
                if (string.IsNullOrEmpty(sub)) continue;
                try
                {
                    tempFolderId = FindChildWithParentId(_driveService, tempFolderId, sub.Trim(), isCreateFolderWhenNotExist);
                    if (string.IsNullOrEmpty(tempFolderId))
                    {
                        throw new Exception("Not found subfolder " + sub);
                    }
                }
                catch (Exception excFindSub)
                {
                    throw excFindSub;
                }
            }
            return tempFolderId;
        }

        private async Task<bool> RenameFile(DriveService driveService, string fileId, string newFilename)
        {
            try
            {
                Google.Apis.Drive.v3.Data.File file = driveService.Files.Get(fileId).Execute();
                file.Id = null;
                file.Name = newFilename;
                // Send the request to the API.
                FilesResource.UpdateRequest request = driveService.Files.Update(file, fileId);
                request.Fields = "name";
                Google.Apis.Drive.v3.Data.File uploadedFile = request.Execute();

                if (uploadedFile != null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private string DeleteFile(DriveService driveService, string fileId)
        {
            string rs = driveService.Files.Delete(fileId).Execute();
            return rs;
        }

        private List<string> FindChildWithParentId(DriveService _driveService, string parentFolderId)
        {
            FilesResource.ListRequest listRequest = _driveService.Files.List();
            listRequest.Fields = "files(id,name,parents)";
            listRequest.Q = string.Format("mimeType = 'application/vnd.google-apps.folder' and parents in '{0}'", parentFolderId);

            IList<Google.Apis.Drive.v3.Data.File> files = null;
            try
            {
                files = listRequest.Execute().Files;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                AuthenticateAccountGoogle();
                files = listRequest.Execute().Files;
            }
            List<string> subFolderId = new List<string>();
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    subFolderId.Add(file.Id);
                }
            }

            return subFolderId;
        }

        public async Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();
            //return await RenameFile(_driveService, "16xWhlo20GHPOUGO_nFnvrPBvIPkoTnRD", "natuan");

            return MoveFiles("1tpVtjCk78yvyY6vnQgOABAaUsBVAw_-t", "1B883ML3U0s0qjTqANCySZO4QB56LF6La");

        }

        public async Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            ReponseDetailUploadDocToGD v = JsonConvert.DeserializeObject<ReponseDetailUploadDocToGD>(infoFile.ViewDocInfo);
            string idFile = v.id;

            var data = new CloudDownloadFileReponse();
            string filePath = "";
            try
            {
                filePath = DownloadGoogleFile(idFile);

            }
            catch (Google.GoogleApiException ee)
            {
                if (ee.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    data.ErrorDetail = "File not found";
                    return null;
                }
                else
                {
                    throw ee;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            FileStream fileStream = new FileStream(filePath, FileMode.Open);
            data.FileName = Path.GetFileName(filePath);
            data.stream = new MemoryStream();
            fileStream.CopyTo(data.stream);
            fileStream.Close();
            try
            {
                File.Delete(filePath);
            }
            catch (Exception del)
            {
                Console.WriteLine(del);
            }

            return data.stream;
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            if (_driveService == null)
                AuthenticateAccountGoogle();
            string sharedFolder = (string)agrs[0];
            string fromAccount = (string)agrs[1];

            string folderId = FindSharedFolderOfAccountGoogleDrive(sharedFolder, fromAccount);
            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("No folder shared from account " + fromAccount);
            }
            //string drivePath = Path.Combine(doc.CloudMediaPath, doc.FileName);
            //drivePath = drivePath.Replace(@"\", @"/");
            string[] subFolders = !string.IsNullOrEmpty(doc.CloudMediaPath) ? doc.CloudMediaPath.Replace(@"\", @"/").Split('/') : new string[] { };

            string tempFolderId = folderId;
            foreach (string sub in subFolders)
            {
                if (string.IsNullOrEmpty(sub)) continue;
                try
                {
                    tempFolderId = FindChildWithParentId(_driveService, tempFolderId, sub.Trim(), true);
                }
                catch (Exception excFindSub)
                {
                    throw excFindSub;
                }
            }

            try
            {
                string id = UploadStream(_driveService, string.IsNullOrEmpty(doc.MediaName) ? doc.FileName : doc.MediaName, stream, tempFolderId);
                string ss = "https://drive.google.com/file/d/" + id + "/view";
                ReponseUploadDocToCloud res = new ReponseUploadDocToCloud();
                res.TypeCloud = CloudType.GoogleDrive;
                ReponseDetailUploadDocToGD v = new ReponseDetailUploadDocToGD();
                v.id = id;
                v.urlViewDoc = ss;
                res.ViewDocInfo = JsonConvert.SerializeObject(v);
                return res;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private string UploadStream(DriveService _driveService, string _uploadFile, Stream stream, string folderId)
        {
            string mimeType = GetMimeType(_uploadFile);
            Google.Apis.Drive.v3.Data.File body = new Google.Apis.Drive.v3.Data.File();
            body.Name = System.IO.Path.GetFileName(_uploadFile);
            body.Description = "documents from MyDM application";
            body.Parents = new List<string>() { folderId };

            FilesResource.CreateMediaUpload requests;
            Google.Apis.Upload.IUploadProgress progress;
            try
            {
                try
                {
                    requests = _driveService.Files.Create(body, stream, mimeType);
                }
                catch (Exception ex)
                {
                    AuthenticateAccountGoogle();
                    requests = _driveService.Files.Create(body, stream, mimeType);
                }
                requests.Alt = FilesResource.CreateMediaUpload.AltEnum.Json;
                requests.Fields = "id";
                progress = requests.Upload();

                if (progress.Exception != null)
                {
                    throw progress.Exception;
                }
                else
                {
                    return requests.ResponseBody.Id;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private string UpdateContentDocument(DriveService driveService, string _uploadFile, string fileId)
        {
            string mimeType = GetMimeType(_uploadFile);
            Google.Apis.Drive.v3.Data.File body = new Google.Apis.Drive.v3.Data.File();
            body.Name = System.IO.Path.GetFileName(_uploadFile);
            body.Description = "documents from MyDM application";

            FilesResource.UpdateMediaUpload requests;
            Google.Apis.Upload.IUploadProgress progress;
            try
            {
                using (var stream = new System.IO.FileStream(_uploadFile, System.IO.FileMode.Open))
                {
                    try
                    {
                        requests = _driveService.Files.Update(body, fileId, stream, mimeType);
                    }
                    catch (Exception ex)
                    {
                        AuthenticateAccountGoogle();
                        requests = _driveService.Files.Update(body, fileId, stream, mimeType);
                    }
                    requests.Alt = FilesResource.UpdateMediaUpload.AltEnum.Json;
                    requests.Fields = "id";
                    progress = requests.Upload();

                    if (progress.Exception != null)
                    {
                        throw progress.Exception;
                    }
                    else
                    {
                        return requests.ResponseBody.Id;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest)
        {
            string folderId = "";
            if (!string.IsNullOrEmpty(connectionModel.ConnectionString.SharedFolderId))
            {
                folderId = await RenameFolderOnGoogleDrive(connectionModel.ConnectionString.UserEmail, connectionModel.ConnectionString.SharedFolder,
                                        connectionModel.ConnectionString.CloudToken.access_token, connectionModel.ConnectionString.SharedFolderId);
                bool shared = await SharingFolderOnGoogleDrive(connectionModel.ConnectionString.UserEmail, connectionModel.ConnectionString.CloudToken.access_token, folderId);
                if (shared)
                {
                    connectionModel.ConnectionString.SharedFolderId = folderId;
                }
                else
                {
                    throw new Exception("Cannot shared folder.");
                }
            }
            else
            {
                folderId = await FindFolderOnGoogleDrive(connectionModel.ConnectionString.UserEmail, connectionModel.ConnectionString.SharedFolder,
                                            connectionModel.ConnectionString.CloudToken.access_token, true);
                bool isCreatedNew = false;
                if (folderId.StartsWith("NEW_"))
                {
                    folderId = folderId.Replace("NEW_", "");
                    isCreatedNew = true;
                }
                bool shared = await SharingFolderOnGoogleDrive(connectionModel.ConnectionString.UserEmail, connectionModel.ConnectionString.CloudToken.access_token, folderId);
                if (shared)
                {
                    connectionModel.ConnectionString.SharedFolderId = folderId;
                }
                else
                {
                    throw new Exception("Cannot shared folder.");
                }
                if (isCreatedNew && deleteFolderAfterTest)
                {
                    try
                    {
                        //if (_driveService == null)
                        //    AuthenticateAccountGoogle();
                        //DeleteFile(_driveService, folderId);
                        /** Disable on 22-03-2021. Because Permission on GoogleDrive **/
                    }
                    catch (Exception excepDelete)
                    {
                        _logger.Error("Error delete folder after testing with Cloud. folderId: + " + folderId + "   " + JsonConvert.SerializeObject(connectionModel), excepDelete);
                    }
                }
            }
            connectionModel.ConnectionString.SharedFolderId = folderId;
        }
    }

    public class ReponseDetailUploadDocToGD
    {
        public string id { get; set; }
        public string urlViewDoc { get; set; }
    }

    public class BodyRequestCreateFolderGoogleDrive
    {
        public string name { get; set; }
        public string mimeType { get; set; }
    }

    public class ResponseCreateFolderGoogleDrive
    {
        public string kind { get; set; }
        public string id { get; set; }
        public string name { get; set; }
        public string mimeType { get; set; }
    }

    public class ResponseFindFolderGoogleDrive
    {
        public List<ResponseCreateFolderGoogleDrive> files { get; set; }
    }

    public class BodyRequestSharingFolder
    {
        public string role { get; set; }
        public string type { get; set; }
        public string emailAddress { get; set; }

    }

}
