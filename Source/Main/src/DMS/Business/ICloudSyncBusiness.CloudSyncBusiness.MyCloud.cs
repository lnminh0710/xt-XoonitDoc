using DMS.Constants;
using DMS.Models.DMS;
using DMS.Utils;
using Hangfire.Console;
using Hangfire.Server;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace DMS.Business
{
    public class CloudSyncBusinessMyCloud : ICloudSyncBusiness
    {
        private static string REST_BASE_URL = "https://storage.prod.mdl.swisscom.ch/";
        private static string REST_GET_METADATA = "metadata/~";
        private static string REST_GET_OBJECT = "object/~";
        private static string REST_GET_PARAM = "?p=";

        private RestClient client = new RestClient(REST_BASE_URL);
        public void Init(AppSettings _appSettings)
        {

        }
        public CloudSyncBusinessMyCloud(AppSettings _appSettings)
        {

        }
        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            var shareCodeArr = connectionModel.SharedLink.Split("/");
            int idx = connectionModel.SharedLink.EndsWith("/") ? 2 : 1;
            var shareCode = shareCodeArr[shareCodeArr.Length - idx];
            return new object[] { shareCode };
        }
        private async Task<string> UploadDoc(string shareCode, string cloudFullPath, byte[] bytes)
        {
            cloudFullPath = cloudFullPath.Replace(@"\", @"/");
            var encodeString = Base64Encode(cloudFullPath);
            var requestString = REST_GET_OBJECT + shareCode + REST_GET_PARAM + encodeString;
            var request = new RestRequest(requestString, Method.PUT);
            request.AddParameter("application/octet-stream", bytes, ParameterType.RequestBody);
            //   request.AddHeader("Content-Type", "application/pdf");

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);
            if (response.StatusCode != HttpStatusCode.OK)
            {
                throw new Exception(shareCode + " " + cloudFullPath + " : " + response.StatusDescription);
            }
            return requestString;
        }
        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            string shareCode = (string)agrs[0];
            string fullPath = Path.Combine(doc.ScannedPath, doc.FileName);
            var drivePath = Path.Combine(doc.CloudMediaPath, !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName);
            drivePath = drivePath.Replace(@"\", @"/");
            byte[] bytes = readBytes(fullPath);
            string responseUrl = await UploadDoc(shareCode, drivePath, bytes);
            ViewDocInfoMyCloud viewDocInfoMyCloud = new ViewDocInfoMyCloud();
            viewDocInfoMyCloud.DocLink = responseUrl;
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(viewDocInfoMyCloud);
            return reponseUpload;

        }
        private byte[] readBytes(string filename)
        {
            using (FileStream fs = new FileStream(filename, FileMode.Open, FileAccess.Read))
            {

                byte[] imageByte = System.IO.File.ReadAllBytes(filename);

                fs.Read(imageByte, 0, System.Convert.ToInt32(fs.Length));
                fs.Close();

                return imageByte;
            }
        }
        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        private async Task<RestResponse> GetFileCloudResponse(string shareCode, string cloudFullPath, bool isFile)
        {
            if (!isFile)
            {
                cloudFullPath = "/~" + shareCode + "/" + cloudFullPath + "/";
            }
            cloudFullPath = cloudFullPath.Replace(@"\", @"/");
            var encodeString = Base64Encode(cloudFullPath);
            var restGet = isFile ? REST_GET_OBJECT : REST_GET_METADATA;
            var requestString = restGet + shareCode + REST_GET_PARAM + encodeString;
            var request = new RestRequest(requestString, Method.GET);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);
            if (response.StatusCode != HttpStatusCode.OK)
            {
                throw new Exception(shareCode + " " + cloudFullPath + " : " + response.StatusDescription);
            }
            return response;
        }
        private async Task<RestResponse> GetFileByLink(string link)
        {


            var request = new RestRequest(link, Method.GET);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);
            if (response.StatusCode != HttpStatusCode.OK)
            {
                throw new Exception(link + " : " + response.StatusDescription);
            }
            return response;
        }
        public async Task<object> GetFile(string cloudFilePath, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc)
        {
            ViewDocInfoMyCloud viewDocInfo = JsonConvert.DeserializeObject<ViewDocInfoMyCloud>(cloudFilePath);
            RestResponse response = await GetFileByLink(viewDocInfo.DocLink);

            CloudDownloadFileReponse data = new CloudDownloadFileReponse();
            data.FileName = cloudMediaName;
            data.stream = new MemoryStream(response.RawBytes);
            return data;
        }
        private string getRestResource(string shareCode, string cloudMediaPath, string cloudMediaName)
        {
            var drivePath = Path.Combine(cloudMediaPath, cloudMediaName);
            drivePath = drivePath.Replace(@"\", @"/");
            var encodeString = Base64Encode(drivePath);
            var requestString = REST_GET_OBJECT + shareCode + REST_GET_PARAM + encodeString;
            return requestString;
        }

        private async Task<object> GetDirectory(string sourcePath, params object[] agrs)
        {
            string shareCode = (string)agrs[0];
            RestResponse response = await GetFileCloudResponse(shareCode, sourcePath, false);
            MyCloudMetaData myCloudMetaData = JsonConvert.DeserializeObject<MyCloudMetaData>(response.Content);
            return myCloudMetaData;
        }

        public async Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            // ReponseUploadDocToCloud infoFile = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);
            CloudConnectionStringModel connectionModel = infoFile.ConnectionString;

            var shareCodeArr = connectionModel.SharedLink.Split("/");
            int idx = connectionModel.SharedLink.EndsWith("/") ? 2 : 1;
            var shareCode = shareCodeArr[shareCodeArr.Length - idx];
            ViewDocInfoMyCloud viewDocInfo = JsonConvert.DeserializeObject<ViewDocInfoMyCloud>(infoFile.ViewDocInfo);
            RestResponse response = await GetFileByLink(viewDocInfo.DocLink);
            var cloudFullPath = Path.Combine(changeDocModel.DesinationPath, !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName);
            string responseUrl = await UploadDoc(shareCode, cloudFullPath, response.RawBytes);
            ViewDocInfoMyCloud viewDocInfoMyCloud = new ViewDocInfoMyCloud();
            viewDocInfoMyCloud.DocLink = responseUrl;
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(viewDocInfoMyCloud);
            reponseUpload.ConnectionString = connectionModel;
            return reponseUpload;
        }

        public Task<object> RenamePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }
        private async Task<RestResponse> getRequestResponse(string requestString)
        {
            var request = new RestRequest(requestString, Method.GET);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);
            return response;
        }


        private async Task<RestResponse> DetectUrl(string requestString)
        {
            var request = new RestRequest("/", Method.GET);
            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = new RestClient(requestString).ExecuteAsync(request, r => taskCompletion.SetResult(r));
            RestResponse response = (RestResponse)(await taskCompletion.Task);
            return response;
        }

       
        public async Task<bool> TestCloudConnection(CloudConnectionTestModel model)
        {
            if (string.IsNullOrEmpty(model.SharedLink))
            {
                throw new Exception("Sharelinks Empty ");
            }
            if (!model.IsCheckStatusConnection)
            {
                RestResponse responseMetadax = await DetectUrl(model.SharedLink);
                if (responseMetadax.StatusCode != HttpStatusCode.OK)
                {
                    throw new Exception("Invalid SharedLink");
                }
            }
            var shareCodeArr = model.SharedLink.Split("/");
            var shareCode = shareCodeArr[shareCodeArr.Length - 1];
            var requestString = "/metadata/~" + shareCode+ "?p=Lw";
            RestResponse responseMetada = await getRequestResponse(requestString);
            if (responseMetada.StatusCode != HttpStatusCode.OK)
            {
                throw new Exception("SharedLink not found ");
            }
            RestResponse responsePermision = await getRequestResponse("/sharing/links/" + shareCode);
            MyCloudShareInfo myCloudShareInfo = JsonConvert.DeserializeObject<MyCloudShareInfo>(responsePermision.Content);
            if (myCloudShareInfo == null || string.IsNullOrEmpty(myCloudShareInfo.Permissions) || myCloudShareInfo.Permissions.Split(",").ToList().Count() <= 1)
            {
                throw new Exception("Permissions error : Recipients cannot add their own content");
            }
            return true;
        }

        public Task<object> DeletePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {
            throw new Exception();
        }

        public async Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            ViewDocInfoMyCloud viewDocInfo = JsonConvert.DeserializeObject<ViewDocInfoMyCloud>(infoFile.ViewDocInfo);
            RestResponse response = await GetFileByLink(viewDocInfo.DocLink);

            return new MemoryStream(response.RawBytes);

        }
        private static byte[] readFully(Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.CopyTo(ms);
                return ms.ToArray();
            }
        }
        public async Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            string shareCode = (string)agrs[0];
            var drivePath = Path.Combine(doc.CloudMediaPath, !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName);
            drivePath = drivePath.Replace(@"\", @"/");
            byte[] bytes = readFully(stream);
            string responseUrl = await UploadDoc(shareCode, drivePath, bytes);
            ViewDocInfoMyCloud viewDocInfoMyCloud = new ViewDocInfoMyCloud();
            viewDocInfoMyCloud.DocLink = responseUrl;
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(viewDocInfoMyCloud);
            return reponseUpload;
        }

        public Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest)
        {
            throw new NotImplementedException();
        }
    }
    public class ViewDocInfoMyCloud
    {
        public string DocLink { get; set; }
    }
    public class GetMyCloudResponse
    {
        public string Identifier { get; set; }
    }
    public class MyCloudMetaData
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public List<MyCloudMetaDataFile> Files { get; set; }
        public List<MyCloudMetaDataFile> Directories { get; set; }
    }
    public class MyCloudMetaDataFile
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public string Mime { get; set; }
        public long Length { get; set; }
        public string Extension { get; set; }

    }
    public class MyCloudShareInfo
    {
        public string Name { get; set; }
        public string Permissions { get; set; }
        public List<string> Items { get; set; }
        public string Type { get; set; }

    }

}
