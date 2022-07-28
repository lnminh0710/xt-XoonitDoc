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

namespace DMS.Business
{
    public class SignInCloudBusinessGoogleDrive : ISignInCloudBusiness
    {
        static string[] Scopes = { DriveService.Scope.Drive, DriveService.Scope.DriveFile };
        private string _applicationName = "";
        private DriveService _driveService;
        private GoogleDrive _googleDriveSettings;
        private SafeFileHandle fullPath;
        public SignInCloudBusinessGoogleDrive(AppSettings _appSettings)
        {
            _applicationName = _appSettings.Clouds.GoogleDrive.ApplicationNameApp;
            _googleDriveSettings = _appSettings.Clouds.GoogleDrive;
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
            string fileNameOnCloud = string.IsNullOrEmpty(doc.MediaName) ? doc.FileName : doc.MediaName;
            try
            {
                string id = UploadDocuments(_driveService, fullPath, fileNameOnCloud, tempFolderId);
                string ss = "https://drive.google.com/file/d/" + id + "/view";
                ReponseUploadDocToCloud res = new ReponseUploadDocToCloud();
                res.TypeCloud = CloudType.GoogleDrive;
                ReponseDetailUploadDocToGD v = new ReponseDetailUploadDocToGD();
                v.id = id;
                v.urlViewDoc = ss;
                res.ViewDocInfo = JsonConvert.SerializeObject(v);
                //return JsonConvert.SerializeObject(res);
                return res;
            }
            catch (Exception e)
            {
                // _logger.Error("Error UploadDocuments GoogleDrive. LocalPath " + fullPath + " for account " + fromAccount, e);
                throw e;
            }
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
                        Console.WriteLine(ex);
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

        private void SaveCloneStream(MemoryStream stream, Stream final)
        {
            stream.CopyToAsync(final);
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

            string folderId = TestSharedFolderOfAccountGoogleDrive(model.SharedFolder, model.UserEmail);
            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("Folder shared not found.");
            }
            return true;
        }

        private string TestSharedFolderOfAccountGoogleDrive(string folderName, string fromAccount)
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
                    Console.WriteLine(ex);
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
                    catch (Exception)
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

        public Task<CloudConnectionModel> CreateAndSharingFolder(CloudConnectionModel autoShareModel)
        {
            throw new NotImplementedException();
        }
    }


}
