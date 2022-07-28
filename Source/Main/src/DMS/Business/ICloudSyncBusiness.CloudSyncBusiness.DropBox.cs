using DMS.Utils;
using Microsoft.Extensions.Options;
using System.Linq;
using System;
using System.IO;
using System.Collections.Generic;
using DMS.Models.DMS;
using RestSharp;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace DMS.Business
{
    public class CloudSyncBusinessDropBox : ICloudSyncBusiness
    {
        private AppSettings _appSettings;
        public CloudSyncBusinessDropBox(AppSettings appSettings)
        {
            this._appSettings = appSettings;
        }
        public void Init(AppSettings appSettings)
        {
            _appSettings = appSettings;
        }

        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            var s = new string[] { connectionModel.SharedFolder, connectionModel.UserEmail };
            return s;
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            string sharedFolder = (string)agrs[0];
            string fromAccount = (string)agrs[1];
            string fullPath = Path.Combine(doc.ScannedPath, string.IsNullOrEmpty(doc.MediaName) ? doc.FileName : doc.MediaName);
            if (!System.IO.File.Exists(fullPath))
            {
                //   _logger.Error("File not found. File: " + fullPath + " \t Account: " + fromAccount);
                throw new Exception("File not found. File: " + fullPath);
            }

            string folderId = (await FindSharedFolderOnDropbox(sharedFolder, fromAccount)).ToString();
            if (string.IsNullOrEmpty(folderId))
            {
                throw new Exception("No folder shared from account " + fromAccount);
            }

            string[] subFolders = !string.IsNullOrEmpty(doc.CloudMediaPath) ? doc.CloudMediaPath.Replace(@"\", @"/").Split('/') : new string[] { };

            string tempFolderId = folderId;
            //foreach (string sub in subFolders)
            //{
            //    if (string.IsNullOrEmpty(sub)) continue;
            //    try
            //    {
            //        tempFolderId = FindChildWithParentId(_driveService, tempFolderId, sub.Trim(), true);
            //    }
            //    catch (Exception excFindSub)
            //    {
            //        throw excFindSub;
            //    }
            //}

            //try
            //{
            //    string id = UploadDocuments(_driveService, fullPath, tempFolderId);
            //    string ss = "https://drive.google.com/file/d/" + id + "/view";
            //    ReponseUploadDocToCloud res = new ReponseUploadDocToCloud();
            //    res.TypeCloud = CloudType.GoogleDrive;
            //    ReponseDetailUploadDocToGD v = new ReponseDetailUploadDocToGD();
            //    v.id = id;
            //    v.urlViewDoc = ss;
            //    res.ViewDocInfo = JsonConvert.SerializeObject(v);
            //    //return JsonConvert.SerializeObject(res);
            //    return res;
            //}
            //catch (Exception e)
            //{
            //    // _logger.Error("Error UploadDocuments GoogleDrive. LocalPath " + fullPath + " for account " + fromAccount, e);
            //    throw e;
            //}
            throw new NotImplementedException();
        }
        public async Task<object> FindSharedFolderOnDropbox(string folderName, string fromAccount)
        {
            if (string.IsNullOrEmpty(folderName))
            {
                return await ListSubFolders("/mydm_001/invoices/bankings", "");
            }
            var restClient = new RestClient(_appSettings.Clouds.Dropbox.URLs.GetListFolder);
            RestRequest request = new RestRequest("/", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + _appSettings.Clouds.Dropbox.ClientSecret);

            FolderMountableRequestModel md = new FolderMountableRequestModel();
            md.limit = 100;
            md.actions = new List<string>();

            request.AddJsonBody(md);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response != null && response.ErrorException != null)
            {
                return response.ErrorException;
            }

            dynamic entries = JsonConvert.DeserializeObject(response.Content);
            ResponseEntryDropboxModel ent = JsonConvert.DeserializeObject<ResponseEntryDropboxModel>(response.Content);

            if (ent.entries == null || ent.entries.Count == 0)
            {
                // _logger.Error("(Dropbox) No folder shared from account " + fromAccount);
                throw new Exception("(Dropbox) No folder shared from account " + fromAccount);
            }
            List<string> sharedFolderIds = new List<string>();
            foreach (ResponseListEntriesDropboxModel re in ent.entries)
            {
                if (re.name.ToLower().StartsWith(folderName.ToLower()))
                {
                    sharedFolderIds.Add(re.shared_folder_id);
                }
            }

            if (sharedFolderIds.Count == 0)
            {
                //  _logger.Error("(Dropbox) No folder shared from account " + fromAccount);
                throw new Exception("(Dropbox) No folder shared from account " + fromAccount);
            }
            string folderIdOfAccount = "";
            foreach (string idd in sharedFolderIds)
            {
                string result = (await FindUserOnFolderShared(idd, fromAccount)).ToString();
                if (!string.IsNullOrEmpty(result))
                {
                    /* found folder shared */
                    folderIdOfAccount = result;
                    break;
                }
            }

            return folderIdOfAccount;
        }

        private async Task<object> FindUserOnFolderShared(string sharedFolderId, string fromAccount)
        {
            var restClient = new RestClient(_appSettings.Clouds.Dropbox.URLs.GetUsersOnFolder);
            RestRequest request = new RestRequest("/", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + _appSettings.Clouds.Dropbox.ClientSecret);

            FolderRequestModel md = new FolderRequestModel();
            md.limit = 100;
            md.actions = new List<string>();
            md.shared_folder_id = sharedFolderId;
            request.AddJsonBody(md);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response != null && response.ErrorException != null)
            {
                return response.ErrorException;
            }

            dynamic entries = JsonConvert.DeserializeObject(response.Content);
            ResponseUsersDropboxModel ent = JsonConvert.DeserializeObject<ResponseUsersDropboxModel>(response.Content);

            if (ent.users == null || ent.users.Count == 0)
            {
                //   _logger.Error("(Dropbox) No folder shared from account " + fromAccount);
                throw new Exception("(Dropbox) No folder shared from account " + fromAccount);
            }

            foreach (ResponseUsersOnFolderDropboxModel re in ent.users)
            {
                if (re.user.email.ToLower() == fromAccount.ToLower())
                {
                    return sharedFolderId;
                }
            }

            return "";
        }

        private async Task<object> ListSubFolders(string path, string fromAccount)
        {
            var restClient = new RestClient(_appSettings.Clouds.Dropbox.URLs.GetSubFolders);
            RestRequest request = new RestRequest("/", Method.POST);
            request.AddHeader("Content-Type", "application/json; charset=utf-8");
            request.AddHeader("Authorization", "Bearer " + _appSettings.Clouds.Dropbox.ClientSecret);

            ListSubFoldersRequestModel md = new ListSubFoldersRequestModel();
            md.limit = 1000;
            md.include_deleted = false;
            md.include_has_explicit_shared_members = false;
            md.include_mounted_folders = true;
            md.include_non_downloadable_files = false;
            md.recursive = false;
            md.path = path;

            request.AddJsonBody(md);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = restClient.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);

            if (response != null && response.ErrorException != null)
            {
                return response.ErrorException;
            }
            if (response.Content.Contains("error"))
            {
                ErrorDropboxModel err = JsonConvert.DeserializeObject<ErrorDropboxModel>(response.Content);
                if (err.error != null && err.error.path != null)
                {
                    throw new Exception();
                }
            }
            dynamic entries = JsonConvert.DeserializeObject(response.Content);
            EntriesSubFoldersReponseModel ent = JsonConvert.DeserializeObject<EntriesSubFoldersReponseModel>(response.Content);

            if (ent.entries == null || ent.entries.Count == 0)
            {
                //   _logger.Error("(Dropbox) No folder shared from account " + fromAccount);
                throw new Exception("(Dropbox) No folder shared from account " + fromAccount);
            }

            foreach (SubFoldersReponseModel re in ent.entries)
            {
                if (re.tag == "folder")
                {

                }
            }

            return "";
        }

        public Task<object> GetFile(string cloudFilePath, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc)
        {
            throw new NotImplementedException();
        }


        public Task<bool> TestCloudConnection(CloudConnectionTestModel model)
        {
            throw new NotImplementedException();
        }

        public Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> RenamePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> DeletePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {
            return FindSharedFolderOnDropbox("mydm_001", "tuannguyenxl@gmail.com");
            //throw new Exception();
        }

        public Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            throw new NotImplementedException();
        }

        public Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest = false)
        {
            throw new NotImplementedException();
        }

        public class ErrorDropboxModel
        {
            public string error_summary { get; set; }
            public ErrorDetailDropboxModel error { get; set; }
        }

        public class ErrorDetailDropboxModel
        {
            [JsonProperty(".tag")]
            public string tag { get; set; }
            public ErrorPathDetailDropboxModel path { get; set; }
        }

        public class ErrorPathDetailDropboxModel
        {
            [JsonProperty(".tag")]
            public string tag { get; set; }
        }

        public class ResponseEntryDropboxModel
        {
            public List<ResponseListEntriesDropboxModel> entries { get; set; }
        }

        public class ResponseListEntriesDropboxModel
        {
            public string is_inside_team_folder { get; set; }
            public string is_team_folder { get; set; }
            public string path_lower { get; set; }
            public string name { get; set; }
            public string preview_url { get; set; }
            public string shared_folder_id { get; set; }
            public string time_invited { get; set; }
        }

        public class ResponseUsersDropboxModel
        {
            public List<ResponseUsersOnFolderDropboxModel> users { get; set; }
        }

        public class ResponseUsersOnFolderDropboxModel
        {
            public ResponseUserDetailDropboxModel user { get; set; }
        }

        public class ResponseUserDetailDropboxModel
        {
            public string account_id { get; set; }
            public string email { get; set; }
            public string display_name { get; set; }
        }

        public class RequestListFolderDropboxModel
        {
            public int limit { get; set; }
            public List<string> actions { get; set; }

            public string path { get; set; }
        }

        public class FolderRequestModel
        {
            public int limit { get; set; }
            public List<string> actions { get; set; }

            public string shared_folder_id { get; set; }
        }

        public class FolderMountableRequestModel
        {
            public int limit { get; set; }
            public List<string> actions { get; set; }

        }


        public class ListSubFoldersRequestModel
        {
            public int limit { get; set; }
            public string path { get; set; }
            public bool recursive { get; set; }
            public bool include_deleted { get; set; }
            public bool include_has_explicit_shared_members { get; set; }
            public bool include_mounted_folders { get; set; }
            public bool include_non_downloadable_files { get; set; }
        }

        public class EntriesSubFoldersReponseModel
        {
            public List<SubFoldersReponseModel> entries { get; set; }

            public string cursor { get; set; }
            public bool has_more { get; set; }
        }

        public class SubFoldersReponseModel
        {
            [JsonProperty(".tag")]
            public string tag { get; set; }
            public string name { get; set; }
            public string path_lower { get; set; }
            public string path_display { get; set; }
            public string parent_shared_folder_id { get; set; }
            public string id { get; set; }
            public long size { get; set; }
        }
    }
}
