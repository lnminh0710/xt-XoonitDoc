using DMS.Business.CloudDriveBusiness;
using DMS.Cache;
using DMS.Constants;
using DMS.Extensions;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Hangfire;
using Hangfire.Console;
using Hangfire.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;

namespace DMS.Business
{
    public class CloudBusiness : BaseBusiness, ICloudBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly AppSettings _appSettings;
        private readonly ICloudService _cloudService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly ICloudJobBusiness _cloudJobBusiness;
        private MemoryCache _cache;
        public CloudBusiness(IHttpContextAccessor context, IOptions<AppSettings> appSettings,
            ICloudService cloudService, IElasticSearchSyncBusiness elasticSearchSync, ICloudJobBusiness cloudJobBusiness, MyMemoryCache memoryCache) : base(context)
        {
            _appSettings = appSettings.Value;
            _cloudService = cloudService;
            _elasticSearchSync = elasticSearchSync;
            _cloudJobBusiness = cloudJobBusiness;
            _cache = memoryCache.Cache;
        }

        public async Task<object> GetCloudActives()
        {
            return await _cloudService.GetCloudActives(ServiceDataRequest);

        }



        public async Task SyncDocumentAAs()
        {
            // ICloudSyncBusiness cloudSyncBusiness = new CloudSyncBusinessMyCloud();
            //  await cloudSyncBusiness.GetFile(null, null);
            //context.WriteLine("Error!");
            Data baseData = ServiceDataRequest;
            baseData.IdLogin = "1";
            baseData.IdApplicationOwner = "1";
            baseData.LoginLanguage = "3";
            SyncCloudQueueGetData data = new SyncCloudQueueGetData
            {
                IdLogin = baseData.IdLogin,
                IdApplicationOwner = baseData.IdApplicationOwner,
                LoginName = baseData.LoginName,
                LoginLanguage = baseData.LoginLanguage,
                //  RepeatedTries = syncModel.IsSyncDocsFail ? string.Empty : "0",
                ListIdMainDocument = "72,73",
                GUID = Guid.NewGuid().ToString()
            };
            await _cloudService.GetSyncCloudQueueByIds(data);

        }


        public async Task SyncDocsToCloud(CloudSyncModel syncModel, Data data = null)
        {
            if (data == null)
            {
                data = ServiceDataRequest;
            }
            //  data.IdApplicationOwner = "2";
            CloudActiveUserModel cloudActiveUser = await _cloudService.GetCloudActiveByUser(data);
            if (cloudActiveUser == null)
            {
                throw new Exception("Cannot find GetCloudActiveByUser");
            }
            if (string.IsNullOrEmpty(cloudActiveUser.ConnectionString) || string.IsNullOrEmpty(cloudActiveUser.ProviderName))
            {
                throw new Exception("GetCloudActiveByUser : ConnectionString or ProviderName Empty");
            }
            var user = string.IsNullOrEmpty(data.LoginName) ? data.Email : data.LoginName;
            if (syncModel.idMainDocuments != null && syncModel.idMainDocuments.Count > 0)
            {
                BackgroundJob.Enqueue<ICloudJobBusiness>(x => x.SyncDocumentsByIdsJob(user, data, cloudActiveUser, syncModel));
            }
            else
            {
                BackgroundJob.Enqueue<ICloudJobBusiness>(x => x.SyncAllDocumentsUserJob(user, data, cloudActiveUser, syncModel));
            }
        }

        public async Task<WSEditReturn> SaveCloudConnection(List<CloudConnectionModel> syncModels)
        {
            CloudConnectionSaveData data = (CloudConnectionSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(CloudConnectionSaveData));
            List<CloudConnectionSaveModel> models = new List<CloudConnectionSaveModel>();

            foreach (CloudConnectionModel model in syncModels)
            {
                //if (model.ConnectionString != null && model.ConnectionString.SftpConnection != null)
                //{
                //    ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(CloudType.Sftp);

                //    await cloudSyncBusiness.CreateAndSharingFolder(model);
                //    ;
                //}
                CloudConnectionSaveModel cloudConnectionSaveModel = new CloudConnectionSaveModel();
                cloudConnectionSaveModel.IsActive = model.IsActive != null && model.IsActive.Value ? "1" : "0";
                cloudConnectionSaveModel.IsDeleted = model.IsDeleted != null && model.IsDeleted.Value ? "1" : "0";
                cloudConnectionSaveModel.UserName = model.UserName;

                cloudConnectionSaveModel.Password = model.Password;
                cloudConnectionSaveModel.UserEmail = model.UserEmail;
                string clientId = string.Empty;
                if (model.ConnectionString != null)
                {
                    if(model.ConnectionString.SftpConnection != null || model.ConnectionString.FtpConnection != null)
                    {
                        clientId = model.ClientId;
                        if (model.ConnectionString.SftpConnection != null)
                        {
                            cloudConnectionSaveModel.UserEmail = model.ConnectionString.SftpConnection.HostName + "/" + model.ConnectionString.SftpConnection.UserName;
                        }
                        else
                        {
                            cloudConnectionSaveModel.UserEmail = model.ConnectionString.FtpConnection.HostName + "/" + model.ConnectionString.FtpConnection.UserName;
                        }
                    } else
                    {
                        if (string.IsNullOrEmpty(model.ConnectionString.SharedLink))
                        {
                            if (!string.IsNullOrEmpty(model.ConnectionString.SharedFolderId))
                            {
                                clientId = model.ConnectionString.SharedFolderId;
                            }
                            else
                            {
                                clientId = model.ConnectionString.SharedFolder;
                            }
                        }
                        else
                        {
                            var shareCodeArr = model.ConnectionString.SharedLink.Split("/");
                            int idx = model.ConnectionString.SharedLink.EndsWith("/") ? 2 : 1;
                            var shareCode = shareCodeArr[shareCodeArr.Length - idx];
                            clientId = shareCode;
                            cloudConnectionSaveModel.UserEmail = shareCode;
                        }
                    }                    
                }
                cloudConnectionSaveModel.ConnectionString = model.ConnectionString == null ? null : JsonConvert.SerializeObject(model.ConnectionString);
                cloudConnectionSaveModel.IdCloudConnection = model.IdCloudConnection != null ? model.IdCloudConnection.Value.ToString() : string.Empty;
                cloudConnectionSaveModel.IdCloudProviders = model.IdCloudProviders.ToString();
                cloudConnectionSaveModel.IdApplicationOwner = data.IdApplicationOwner;

                clientId = string.IsNullOrEmpty(clientId) ? model.ClientId : clientId;
                if(!string.IsNullOrEmpty(clientId))
                {
                    cloudConnectionSaveModel.ClientId = clientId;
                }                
                models.Add(cloudConnectionSaveModel);
            }
            JsonCloudConnection JsonCloudConnection = new JsonCloudConnection
            {
                CloudConnection = models
            };
            data.JSONText = JsonConvert.SerializeObject(JsonCloudConnection);

            var rs= await _cloudService.SaveCloudConnection(data);
            try
            {
                Data _data = ServiceDataRequest;
                CloudActiveUserModel cloudActiveUser = await _cloudService.GetCloudActiveByUser(_data);
                CacheUtils.PutCloudInfo(_cache, this.UserFromService.IdLogin, cloudActiveUser);
            }
            catch (Exception e)
            {
                CacheUtils.PutCloudInfo(_cache, this.UserFromService.IdLogin, null);
            }
            return rs;
        }


        public async Task<object> GetCloudConnection(int IdCloudProviders)
        {
            CloudConnectionGetData data = (CloudConnectionGetData)ServiceDataRequest.ConvertToRelatedType(typeof(CloudConnectionGetData));
            data.IdCloudProviders = IdCloudProviders.ToString();
            return await _cloudService.GetCloudConnection(data);
        }

        public async Task<object> UploadDocumentTestingToGoogleDrive(CloudSyncManually syncModel)
        {
            List<CloudSyncQueueModel> cloudSyncQueueModels = new List<CloudSyncQueueModel>();
            CloudSyncQueueModel c = new CloudSyncQueueModel();
            c.FileName = syncModel.FileName;
            c.ScannedPath = syncModel.LocalPath;
            c.CloudMediaPath = syncModel.CloudPath;
            cloudSyncQueueModels.Add(c);
            //  return await UploadDocumentToGoogleDrive(c, syncModel.AddressMail, null, false, null);
            return true;
        }

        public async Task<string> GetActiveIdCloudConnectionOfCurrentUser()
        {
            string idCloudConnection = null;
            var data = await GetCloudActives() as DynamicCollection;
            if (data == null || data.CollectionData == null || data.CollectionData.Count <= 0)
            {
                return idCloudConnection;
            }

            var idCloudProviderObj = (data.CollectionData as List<object>).Where((obj) =>
            {
                if (!(obj as JObject).SelectToken("isActive").HasValues) return false;

                var isActiveObj = (obj as JObject).SelectToken("isActive");
                if (!isActiveObj.SelectToken("value").HasValues &&
                (isActiveObj.SelectToken("value").Value<string>().ToLower() == "false" || isActiveObj.SelectToken("value").Value<string>().ToLower() == "")) return false;


                return true;
            }).FirstOrDefault();

            if (idCloudProviderObj == null) return null;

            idCloudConnection = (idCloudProviderObj as JObject).SelectToken("idCloudConnection").SelectToken("value").Value<string>();
            return idCloudConnection;
        }

        public async Task<string> GetActiveIdCloudConnectionOfSpecificUser(string idLogin, string idApplicationOwner)
        {
            string idCloudConnection = null;
            var data = await GetCloudActiveOfSpecifiUser(idLogin, idApplicationOwner) as DynamicCollection;
            if (data == null || data.CollectionData == null || data.CollectionData.Count <= 0)
            {
                return idCloudConnection;
            }

            var idCloudProviderObj = (data.CollectionData as List<object>).Where((obj) =>
            {
                if (!(obj as JObject).SelectToken("isActive").HasValues) return false;

                var isActiveObj = (obj as JObject).SelectToken("isActive");
                if (!isActiveObj.SelectToken("value").HasValues &&
                (isActiveObj.SelectToken("value").Value<string>().ToLower() == "false" || isActiveObj.SelectToken("value").Value<string>().ToLower() == "")) return false;


                return true;
            }).FirstOrDefault();

            if (idCloudProviderObj == null) return null;

            idCloudConnection = (idCloudProviderObj as JObject).SelectToken("idCloudConnection").SelectToken("value").Value<string>();
            return idCloudConnection;
        }

        private async Task<object> GetCloudActiveOfSpecifiUser(string idLogin, string idApplicationOwner)
        {
            return await _cloudService.GetCloudActiveOfSpecificUser(ServiceDataRequest, idLogin, idApplicationOwner);
        }

        public async Task ChangeDoc(CloudChangeDocModel changeDocModel)
        {

            Data data = ServiceDataRequest;

            if (string.IsNullOrEmpty(changeDocModel.ActionType))
            {
                throw new Exception("ActionType is Empty");
            }
            var user = string.IsNullOrEmpty(data.LoginName) ? data.Email : data.LoginName;
            BackgroundJob.Enqueue<ICloudJobBusiness>(x => x.ChangeDocJob(user, changeDocModel.ActionType, data, changeDocModel));
        }


        public async Task<object> DownloadFile(CloudViewDocModel viewDocModel)
        {
            try
            {
                ReponseUploadDocToCloud infoFile = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(viewDocModel.CloudFilePath);
                ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(infoFile.TypeCloud,
                    infoFile.ConnectionString != null ? infoFile.ConnectionString.DriveType : null);

                cloudSyncBusiness.Init(_appSettings);
                return await cloudSyncBusiness.GetFile(infoFile.ViewDocInfo, viewDocModel.CloudMediaPath, viewDocModel.CloudMediaName, infoFile);
            }
            catch (Exception e)
            {
                _logger.Error("Error download file from Cloud.", e);
                throw e;
            }
        }

        public async Task<CloudConnectionTestResponse> TestCloudConnection(CloudConnectionTestModel model)
        {

            CloudConnectionTestResponse response = new CloudConnectionTestResponse();
            try
            {
                ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(model.CloudType, model.DriveType);
                bool IsSuccess = await cloudSyncBusiness.TestCloudConnection(model);
                response.IsSuccess = IsSuccess;
            }
            catch (Exception e)
            {
                if(model != null)
                {
                    _logger.Error("TestCloudConnection " + JsonConvert.SerializeObject(model), e);
                } else
                {
                    _logger.Error("TestCloudConnection model cloud is NULL", e);
                }
                
                response.IsSuccess = false;
                response.ErrorMessage = e.Message;
            }
            return response;

        }

        public async Task ChangePath(CloudChangePathModel changePathModel)
        {
            Data data = ServiceDataRequest;

            if (string.IsNullOrEmpty(changePathModel.ActionType))
            {
                throw new Exception("ActionType is Empty");
            }
            CloudActiveUserModel cloudActiveUser = await _cloudService.GetCloudActiveByUser(data);
            if (cloudActiveUser == null)
            {
                throw new Exception("Cannot find GetCloudActiveByUser");
            }
            if (string.IsNullOrEmpty(cloudActiveUser.ConnectionString) || string.IsNullOrEmpty(cloudActiveUser.ProviderName))
            {
                throw new Exception("GetCloudActiveByUser : ConnectionString or ProviderName Empty");
            }
            var user = string.IsNullOrEmpty(data.LoginName) ? data.Email : data.LoginName;
            BackgroundJob.Enqueue<ICloudJobBusiness>(x => x.ChangePathJob(user, changePathModel.ActionType, data, cloudActiveUser, changePathModel));
        }

        public async Task<object> ActionsWithCloud(CloudSyncModelPost model)
        {
            try
            {
                ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(model.CloudType);
                await cloudSyncBusiness.TestActionsWithCloud(model);
            }
            catch (Exception e)
            {
                throw e;
            }
            return "";

        }

        public async Task<CloudActiveUserModel> GetCloudActive()
        {
            Data data = ServiceDataRequest;

            CloudActiveUserModel cloudActiveUser = await _cloudService.GetCloudActiveByUser(data);

            return cloudActiveUser;

        }

        public string GetConfigurationCloud(CloudTypeEnum cloudType)
        {
            dynamic result = new { };
            switch (cloudType)
            {
                case CloudTypeEnum.MY_CLOUD:
                    result = _appSettings.Clouds.MyCloud;
                    break;
                case CloudTypeEnum.GG_DRIVE:
                    result = _appSettings.Clouds.GoogleDrive;
                    result.ClientSecret = null;
                    break;
                case CloudTypeEnum.ONE_DRIVE:
                    result = _appSettings.Clouds.OneDrive;
                    result.ClientSecret = null;
                    result.UserPassword = null;
                    result.AccessToken = null;
                    result.RefreshToken = null;
                    break;
                case CloudTypeEnum.DROP_BOX:
                    result = _appSettings.Clouds.Dropbox;
                    break;
                default:
                    break;
            }

            var resultString = JsonConvert.SerializeObject(result);
            //return Common.SHA256Hash(resultString);
            return resultString;
        }

        public async Task<CloudActiveUserModel> GetCurrentCloudActiveOfUser()
        {
            if (string.IsNullOrEmpty(this.UserFromService.IdCloudConnection))
            {
                return null;
            }
            CloudActiveUserModel model = CacheUtils.GetCloudInfo(_cache, this.UserFromService.IdApplicationOwner);
            if (model == null)
            {
                Data data = ServiceDataRequest;
                CloudActiveUserModel cloudActiveUser = await _cloudService.GetCloudActiveByUser(data);
                CacheUtils.PutCloudInfo(_cache, this.UserFromService.IdLogin, cloudActiveUser);
                  return cloudActiveUser;
            }
             return model;
            //if (!string.IsNullOrEmpty(this.UserFromService.IdCloudConnection)
            //    && (string.IsNullOrEmpty(this.UserFromService.InfoCloud) || this.UserFromService.InfoCloud == "null"))
            //{
            //    throw new UnauthorizedAccessException("Invalid Token");
            //}

            //else
            //{
            //    ActiveCloudOfUser cl = null;
            //    try
            //    {
            //        cl = JsonConvert.DeserializeObject<ActiveCloudOfUser>(this.UserFromService.InfoCloud);
            //        if (cl != null && string.IsNullOrEmpty(cl.CloudName))
            //        {
            //            cl.CloudName = cl.ProviderName;
            //        }
            //        if (cl == null)
            //        {
            //            throw new Exception();
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        _logger.Error($"Cannot get the parse info cloud to model of User ", ex);
            //        Data data = ServiceDataRequest;
            //        CloudActiveUserModel cloudActiveUserxx = await _cloudService.GetCloudActiveByUser(data);
            //        return cloudActiveUserxx;
            //    }
            //    CloudActiveUserModel cloudActiveUser = new CloudActiveUserModel()
            //    {
            //        ConnectionString = cl.ConnectionString,
            //        ProviderName = cl.CloudName,
            //        UserEmail = cl.UserEmail,
            //        IdCloudProviders = cl.IdCloudProviders,
            //        ClientId = cl.ClientId
            //    };

            //    return cloudActiveUser;
            //}
        }

        public CloudActiveUserModel GetCloudActiveOfUser()
        {
            if (string.IsNullOrEmpty(this.UserFromService.IdCloudConnection))
            {
                return null;
            }
            if (!string.IsNullOrEmpty(this.UserFromService.IdCloudConnection)
                && (string.IsNullOrEmpty(this.UserFromService.InfoCloud) || this.UserFromService.InfoCloud == "null"))
            {
                throw new UnauthorizedAccessException("Invalid Token");
            }
            CloudActiveUserModel model = CacheUtils.GetCloudInfo(_cache, this.UserFromService.IdLogin);
            if (model == null)
            {
                _logger.Error($"Cannot get the parse info cloud to model of User ");
                return null;

            }
            return model;
            //if (string.IsNullOrEmpty(this.UserFromService.InfoCloud))
            //{
            //    return null;
            //}
            //else
            //{
            //    ActiveCloudOfUser cl = null;
            //    try
            //    {
            //        cl = JsonConvert.DeserializeObject<ActiveCloudOfUser>(this.UserFromService.InfoCloud);
            //        if (cl != null && string.IsNullOrEmpty(cl.CloudName))
            //        {
            //            cl.CloudName = cl.ProviderName;
            //        }
            //        if (cl == null)
            //        {
            //            throw new Exception();
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        _logger.Error($"Cannot get the parse info cloud to model of User ", ex);
            //        return null;
            //    }
            //    CloudActiveUserModel cloudActiveUser = new CloudActiveUserModel()
            //    {
            //        ConnectionString = cl.ConnectionString,
            //        ProviderName = cl.CloudName,
            //        UserEmail = cl.UserEmail,
            //        IdCloudProviders = cl.IdCloudProviders,
            //        ClientId = cl.ClientId
            //    };

            //    return cloudActiveUser;
            //}
        }

        public async Task<WSEditReturn> CreateAndSharingFolder(List<CloudConnectionModel> syncModels)
        {
            try
            {
                foreach(CloudConnectionModel connectionModel in syncModels)
                {
                    if (connectionModel.ConnectionString != null)
                    {
                        // && ((connectionModel.IsActive != null && connectionModel.IsActive.Value)
                        //                                                || (connectionModel.IsChangeEmail) ))
                        bool isCreateFolder = checkIsCreateFolder(connectionModel.CloudType);
                        if (isCreateFolder)
                        {
                            ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(connectionModel.CloudType, connectionModel.ConnectionString.DriveType);

                            await cloudSyncBusiness.CreateAndSharingFolder(connectionModel, true);
                        }
                    }
                }              

                var result = await SaveCloudConnection(syncModels);
               
                return result;
            }
            catch (Exception e)
            {
                _logger.Error("CreateAndSharingFolder ", e);
                return new WSEditReturn
                {
                    UserErrorMessage = e.Message
                };
            }
        }

        public async Task<CloudConnectionTestResponse> TestSharingFolderOnNewAccount(CloudConnectionTestModel connectionModel)
        {
            try
            {
                CloudConnectionModel cloudConnectModel = new CloudConnectionModel();
                cloudConnectModel.ConnectionString = connectionModel.ConnectionString;
                cloudConnectModel.CloudType = connectionModel.CloudType;

                ICloudSyncBusiness cloudSyncBusiness = _cloudJobBusiness.GetCloudSyncBusinessImpl(connectionModel.CloudType, connectionModel.ConnectionString.DriveType);

                await cloudSyncBusiness.CreateAndSharingFolder(cloudConnectModel, true);

                CloudConnectionTestResponse response = new CloudConnectionTestResponse();
                response.IsSuccess = true;

                return response;
            }
            catch (Exception e)
            {
                _logger.Error("TestSharingFolderOnNewAccount : " + JsonConvert.SerializeObject(connectionModel), e);
                throw e;
            }
        }
        private async  Task GetCurrentCloudSharedFolderId(CloudConnectionModel connectionModel)
        {
            if (connectionModel.CloudType.ToLower() == CloudType.GoogleDrive.ToLower() ||
                connectionModel.CloudType.ToLower() == CloudType.OneDrive.ToLower())
            {
                try
                {
                    CloudActiveUserModel cloudActiveUserModel = await GetCurrentCloudActiveOfUser();
                    if (cloudActiveUserModel.ProviderName.ToLower() == connectionModel.CloudType.ToLower())
                    {
                        CloudConnectionStringModel connectionString = JsonConvert.DeserializeObject<CloudConnectionStringModel>(cloudActiveUserModel.ConnectionString);
                        if (connectionString != null && !string.IsNullOrEmpty(connectionString.SharedFolderId))
                        {
                            connectionModel.ConnectionString.SharedFolderId = connectionString.SharedFolderId;
                        }
                    }
                }
                catch (Exception e)
                {
                    _logger.Error("Cloud GetCurrentCloudSharedFolderId  " + JsonConvert.SerializeObject(connectionModel).ToLower(), e);
                }
            }
        }
        private bool checkIsCreateFolder(string cloudType)
        {
            return !string.IsNullOrEmpty(cloudType) &&
                (cloudType.ToLower() == CloudType.Ftp ||
                cloudType.ToLower() == CloudType.Remote ||
                cloudType.ToLower() == CloudType.Sftp ||
                cloudType.ToLower() == CloudType.OneDrive ||
                cloudType.ToLower() == CloudType.GoogleDrive
                );
        }
    }
}
