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
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
namespace DMS.Business.CloudDriveBusiness
{
    public class CloudJobBusiness : BaseBusiness, ICloudJobBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly AppSettings _appSettings;
        private readonly ICloudService _cloudService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        public CloudJobBusiness(IHttpContextAccessor context, IOptions<AppSettings> appSettings,
            ICloudService cloudService, IElasticSearchSyncBusiness elasticSearchSync) : base(context)
        {
            _appSettings = appSettings.Value;
            _cloudService = cloudService;
            _elasticSearchSync = elasticSearchSync;

        }
        private void WriteHangfireLog(PerformContext context, string message, bool isError = false)
        {
            if (context != null)
            {
                if (isError)
                {
                    context.SetTextColor(ConsoleTextColor.Red);
                    message = "Error : " + message;
                }
                context.WriteLine(message);
                context.ResetTextColor();
            }
        }

        public async Task SyncDocumentsFailJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel)
        {
            PerformingContext performContext = SyncCLoudFilter.Context;
            syncModel.IsSyncDocsFail = true;
            await SyncDocumentsToCloud(data, cloudActiveUser, syncModel, performContext);
        }

        public async Task SyncAllDocumentsUserJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel)
        {
            PerformingContext performContext = SyncCLoudFilter.Context;
            syncModel.IsSyncDocsFail = false;
            await SyncDocumentsToCloud(data, cloudActiveUser, syncModel, performContext);
        }
        public async Task SyncDocumentsByIdsJob(string loginName, Data data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel)
        {
            PerformingContext performContext = SyncCLoudFilter.Context;
            syncModel.IsSyncDocsFail = false;
            await SyncDocumentsToCloud(data, cloudActiveUser, syncModel, performContext);
        }
        private async Task SyncDocumentsToCloud(Data _data, CloudActiveUserModel cloudActiveUser, CloudSyncModel syncModel, PerformContext context)
        {
            SyncCloudQueueGetData data = new SyncCloudQueueGetData
            {
                IdLogin = _data.IdLogin,
                IdApplicationOwner = _data.IdApplicationOwner,
                LoginName = _data.LoginName,
                LoginLanguage = _data.LoginLanguage,
                RepeatedTries = syncModel.IsSyncDocsFail ? string.Empty : "0",
                ListIdMainDocument = syncModel.idMainDocuments != null && syncModel.idMainDocuments.Count > 0 ? String.Join(",", syncModel.idMainDocuments.ToArray()) : null,
                GUID = Guid.NewGuid().ToString()
            };

            List<CloudSyncQueueModel> cloudSyncQueueModels = syncModel.idMainDocuments != null && syncModel.idMainDocuments.Count > 0 ?
            await _cloudService.GetSyncCloudQueueByIds(data) : await _cloudService.GetSyncCloudQueue(data);

            WriteHangfireLog(context, String.Format("Get Data total {0} items", cloudSyncQueueModels != null ? cloudSyncQueueModels.Count : 0));
            if (cloudSyncQueueModels != null && cloudSyncQueueModels.Count > 0)
            {
                // CloudSyncQueueModel firstModel = cloudSyncQueueModels.FirstOrDefault();
                string cloudType = cloudActiveUser.ProviderName.Trim();

                CloudConnectionStringModel connectionString = JsonConvert.DeserializeObject<CloudConnectionStringModel>(cloudActiveUser.ConnectionString);
                if (connectionString == null)
                {
                    throw new Exception("ConnectionString Is Empty");
                }
                WriteHangfireLog(context, String.Format("CloudType : {0}", cloudType));
                
                if(string.IsNullOrEmpty(connectionString.UserEmail)) {
                    connectionString.UserEmail = cloudActiveUser.UserEmail;
                }
              //  connectionString.SharedFolder = "Caminada";
                ICloudSyncBusiness _cloudSyncBusiness = GetCloudSyncBusinessImpl(cloudType,connectionString.DriveType);
                _cloudSyncBusiness.Init(_appSettings);
                var obj = await _cloudSyncBusiness.PreSync(connectionString);
                int countSyncSucess = 0, count = 0;
                foreach (CloudSyncQueueModel doc in cloudSyncQueueModels)
                {
                    var syncErrorMessage = "";
                    try
                    {
                        doc.MainDocSynced = false;
                        //list all images (.PNG files) of Doc and sync to cloud
                        SyncCloudQueueGetImagesOfDoc dataRequest = new SyncCloudQueueGetImagesOfDoc {
                            IdLogin = _data.IdLogin,
                            IdApplicationOwner = _data.IdApplicationOwner,
                            LoginName = _data.LoginName,
                            LoginLanguage = _data.LoginLanguage,
                            IdSyncCloudQueue = doc.IdSyncCloudQueue,
                            GUID = Guid.NewGuid().ToString()
                        };
                        try
                        {
                            List<ImageSyncQueueModel> imagesDoc = await _cloudService.GetImagesOfMainDocFromSyncQueue(dataRequest);
                            if (imagesDoc != null && imagesDoc.Count > 0)
                            {
                                ImageSyncQueueModel img = imagesDoc.FirstOrDefault();
                                if (!string.IsNullOrEmpty(img.CloudFilePath))
                                {
                                    ReponseUploadDocToCloud cp = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(img.CloudFilePath);
                                    if (cp != null)
                                    {
                                        if (!string.IsNullOrEmpty(cp.ImagesSynced))
                                        {
                                            //ImagesSynced: list images synced
                                            List<ImageSyncedModel> images = JsonConvert.DeserializeObject<List<ImageSyncedModel>>(cp.ImagesSynced);
                                            images.ForEach(im =>
                                            {
                                                imagesDoc.ForEach(imd =>
                                                {
                                                    if (imd.FileName.ToLower() == im.ImageName.ToLower())
                                                    {
                                                        imd.FileName = "";
                                                    }
                                                });
                                            });
                                        }
                                        /** Check MainDoc Synced => skip syn mainDoc, sync for images of Doc **/
                                        if (!string.IsNullOrEmpty(cp.ViewDocInfo))
                                        {
                                            doc.MainDocSynced = true;
                                        }
                                    }
                                }
                                imagesDoc = imagesDoc.Where(i => !string.IsNullOrEmpty(i.FileName)).ToList();
                                doc.ImageFiles = imagesDoc;
                            }
                            else
                            {
                                doc.ImageFiles = null;
                            }
                        }
                        catch(Exception e)
                        {
                            _logger.Error(e);
                        }
                        
                        
                        ReponseUploadDocToCloud resultSync = await _cloudSyncBusiness.SyncOneDoc(doc, obj);
                        resultSync.ConnectionString = connectionString;
                        doc.CloudFilePath = resultSync != null ? JsonConvert.SerializeObject(resultSync) : "";

                    }
                    catch (Exception e)
                    {
                        syncErrorMessage = e.Message;
                    }
                    finally
                    {
                        count++;
                        var logMsg = String.Format("{0 }UploadDocument {1}: ClouMediaPath : {2} ,FileName : {3}", count,
                         string.IsNullOrEmpty(syncErrorMessage) ? "Success" : "False",
                          doc.CloudMediaPath, doc.FileName);
                        WriteHangfireLog(context, logMsg);
                        if (!string.IsNullOrEmpty(syncErrorMessage))
                        {
                            WriteHangfireLog(context, syncErrorMessage, true);
                        }
                        doc.IsSync = string.IsNullOrEmpty(syncErrorMessage);
                        doc.RepeatedTries = doc.RepeatedTries + 1;
                        doc.SyncErrorLog = syncErrorMessage;
                        List<CloudSyncQueueModel> list = new List<CloudSyncQueueModel>();
                        list.Add(doc);
                        var updateResult = await UpdateSyncCloudQueue(list, data, context);
                        if (updateResult != null && updateResult.IsSuccess&& string.IsNullOrEmpty(syncErrorMessage))
                        {
                            countSyncSucess++;
                            if (!string.IsNullOrEmpty(syncModel.IndexName))
                            {
                                await _elasticSearchSync.SyncESAfterSyncCloud(new ElasticSyncSaveDocument
                                {
                                    IdMainDocument = doc.IdMainDocument,
                                    IndexName = syncModel.IndexName
                                });
                            }
                        }

                    }
                    if (syncModel.IsSyncDocsFail && !string.IsNullOrEmpty(syncErrorMessage))
                    {
                        throw new Exception(syncErrorMessage);
                    }


                }
                //if (countSyncSucess == 0)
                //{
                //    WriteHangfireLog(context, String.Format("No Document Sync Success to ${0}", cloudType), true);
                //    throw new Exception("No Document Sync Success to " + cloudType);
                //}
                //else
                if (syncModel.idMainDocuments != null && syncModel.idMainDocuments.Count > 0 && countSyncSucess < cloudSyncQueueModels.Count)
                {

                    BackgroundJob.Enqueue<ICloudJobBusiness>(x => x.SyncDocumentsFailJob(_data.LoginName, _data, cloudActiveUser, syncModel));
                }
            }
        }

        private async Task<WSEditReturn> UpdateSyncCloudQueue(List<CloudSyncQueueModel> syncQueueModels, Data _data, PerformContext context = null)
        {
            try
            {
                SyncCloudQueueUpdateData data = new SyncCloudQueueUpdateData
                {
                    IdApplicationOwner = _data.IdApplicationOwner,
                    IdLogin = _data.IdLogin,
                    LoginName = _data.LoginName,
                    LoginLanguage = _data.LoginLanguage
                };


                List<SyncCloudQueueUpdateModel> list = new List<SyncCloudQueueUpdateModel>();

                foreach (CloudSyncQueueModel syncModel in syncQueueModels)
                {
                    SyncCloudQueueUpdateModel updateModel = new SyncCloudQueueUpdateModel();
                    updateModel.IdSyncCloudQueue = syncModel.IdSyncCloudQueue;
                    updateModel.CloudMediaPath = syncModel.CloudMediaPath;
                    updateModel.IsSync = syncModel.IsSync != null && syncModel.IsSync.Value ? "1" : "0";
                    updateModel.IsActive = syncModel.IsActive != null && syncModel.IsActive.Value ? "1" : "0";
                    updateModel.RepeatedTries = syncModel.RepeatedTries.ToString();
                    updateModel.CloudFilePath = syncModel.CloudFilePath;
                    updateModel.IdRepTreeMediaType = syncModel.IdRepTreeMediaType;
                    updateModel.IdDocumentTreeMedia = syncModel.IdDocumentTreeMedia;
                    if (syncModel.IsSync == null || !syncModel.IsSync.Value)
                    {
                        updateModel.SyncErrorLog = syncModel.SyncErrorLog;
                    }
                    list.Add(updateModel);
                }
                JsonSyncCloudQueue jsonSyncCloudQueue = new JsonSyncCloudQueue
                {
                    SyncCloudQueue = list
                };
                data.JsonSyncCloudQueue = JsonConvert.SerializeObject(jsonSyncCloudQueue);
                var result = await _cloudService.UpdateSyncCloudQueue(data);
                if (result == null || !result.IsSuccess)
                {
                    WriteHangfireLog(context, String.Format("Error UpdateSyncCloudQueue", result.SQLStoredMessage), true);
                }
                return result;


            }
            catch (Exception ex)
            {
                WriteHangfireLog(context, String.Format("Error UpdateSyncCloudQueue", ex.Message), true);
                _logger.Error("Error UpdateSyncCloudQueue", ex);
                return null;
            }
        }
        public ICloudSyncBusiness GetCloudSyncBusinessImpl(string cloudType, string oneDriveType = null)
        {
            if (string.IsNullOrEmpty(cloudType))
            {
                throw new Exception("CloudType Empty");
            }
            if (cloudType.ToLower() == CloudType.GoogleDrive.ToLower())
            {
                return new CloudSyncBusinessGoogleDrive(_appSettings);
            }
            else if (cloudType.ToLower() == CloudType.Dropbox.ToLower())
            {
                return new CloudSyncBusinessDropBox(_appSettings);
            }
            else if (cloudType.ToLower() == CloudType.MyCloud.ToLower())
            {
                return new CloudSyncBusinessMyCloud(_appSettings);
            }
            else if (cloudType.ToLower() == CloudType.OneDrive.ToLower())
            {
                if (!string.IsNullOrEmpty(oneDriveType) && oneDriveType.ToLower() == OneDriveType.Business.ToLower())
                {
                    return new CloudSyncBusinessOneDriveBusiness(_appSettings);
                }
                return new CloudSyncBusinessOneDriveSignIn(_appSettings);
            }
            else if (cloudType.ToLower() == CloudType.Remote.ToLower()|| cloudType.ToLower() == CloudType.Ftp.ToLower() || cloudType.ToLower() == CloudType.Sftp.ToLower())
            {
                return new CloudSyncBusinessSftp(_appSettings);
            }
            else if (cloudType.ToLower() == CloudType.FileServer.ToLower())
            {
                return new CloudSyncBusinessFileServer(_appSettings);
            }
            return null;
        }

        public async Task ChangeDocJob(string loginName, string actionType, Data _data, CloudChangeDocModel changeDocModel)
        {
            PerformingContext context = SyncCLoudFilter.Context;
            object result = null;

            SyncCloudQueueGetData data = new SyncCloudQueueGetData
            {
                IdLogin = _data.IdLogin,
                IdApplicationOwner = _data.IdApplicationOwner,
                LoginName = _data.LoginName,
                LoginLanguage = _data.LoginLanguage,
                ListIdMainDocument = changeDocModel.IdMainDocument,
                GUID = Guid.NewGuid().ToString()
            };
            List<CloudSyncQueueModel> cloudSyncQueueModels = await _cloudService.GetSyncCloudQueueByIds(data);
            WriteHangfireLog(context, String.Format("ChangeDocJob Get Data total {0} items", cloudSyncQueueModels != null ? cloudSyncQueueModels.Count : 0));
            if (cloudSyncQueueModels != null && cloudSyncQueueModels.Count > 0)
            {
                CloudSyncQueueModel doc = cloudSyncQueueModels.FirstOrDefault();
                if (string.IsNullOrEmpty(doc.CloudFilePath))
                {
                    WriteHangfireLog(context, String.Format("ChangeDocJob Fail for IdMainDocument {0} Fail : CloudFilePath Is Empty", doc.IdMainDocument), true);
                    return;
                }
                CloudConnectionStringModel connectionModel = null;
                try
                {
                    ReponseUploadDocToCloud infoFile = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);
                    connectionModel = infoFile.ConnectionString;
                    ICloudSyncBusiness cloudSyncBusiness = GetCloudSyncBusinessImpl(infoFile.TypeCloud, connectionModel.DriveType);
                    actionType = !string.IsNullOrEmpty(actionType) ? actionType : changeDocModel.ActionType;
                    WriteHangfireLog(context, String.Format("Cloud Type {0} {1} doc {2}", infoFile.TypeCloud, actionType, cloudSyncQueueModels.FirstOrDefault().FileName));
                    if (!string.IsNullOrEmpty(actionType) && actionType == CloudDocChangeAction.Delete)
                    {
                        await cloudSyncBusiness.DeleteDoc(doc, changeDocModel, infoFile);
                    }


                    result = await cloudSyncBusiness.MoveDoc(doc, changeDocModel, infoFile);


                }
                catch (Exception e)
                {
                    var logMsg = String.Format("{0 } Doc {1}: ClouMediaPath : {2} ,FileName : {3}", actionType,
                       "False " + e.Message,
                       doc.CloudMediaPath, doc.FileName);
                    WriteHangfireLog(context, logMsg, true);
                    throw e;
                }
                finally
                {
                    // var logMsg = String.Format("{0 } Doc {1}: ClouMediaPath : {2} ,FileName : {3}", actionType,
                    //                        "Success ",
                    //                        doc.CloudMediaPath, doc.FileName);
                    //  WriteHangfireLog(context, logMsg);
                    if (result != null && !string.IsNullOrEmpty(actionType) && actionType == CloudDocChangeAction.Move)
                    {
                        ReponseUploadDocToCloud resultSync = (ReponseUploadDocToCloud)result;
                        resultSync.ConnectionString = connectionModel;
                        doc.CloudFilePath = resultSync != null ? JsonConvert.SerializeObject(resultSync) : "";
                        //  doc.RepeatedTries = doc.RepeatedTries + 1;
                        //  doc.SyncErrorLog = syncErrorMessage;
                        List<CloudSyncQueueModel> list = new List<CloudSyncQueueModel>();
                        list.Add(doc);
                        var updateResult = await UpdateSyncCloudQueue(list, data, context);
                        if (updateResult != null && updateResult.IsSuccess && !string.IsNullOrEmpty(changeDocModel.IndexName))
                        {
                            try
                            {
                                await _elasticSearchSync.SyncESAfterSyncCloud(new ElasticSyncSaveDocument
                                {
                                    IdMainDocument = doc.IdMainDocument,
                                    IndexName = changeDocModel.IndexName
                                });
                                WriteHangfireLog(context, "SyncESAfterSyncCloud Sucess");
                            }
                            catch (Exception e)
                            {
                                WriteHangfireLog(context, "SyncESAfterSyncCloud Faile " + e.Message, true);
                            }

                        }
                    }
                }
            }


        }

        public async Task<object> ChangePathJob(string loginName, string actionType, Data _data, CloudActiveUserModel cloudActiveUser, CloudChangePathModel changePathModel)
        {
            CloudConnectionStringModel connectionModel = JsonConvert.DeserializeObject<CloudConnectionStringModel>(cloudActiveUser.ConnectionString);
            //   connectionModel.SharedLink = "https://www.mycloud.swisscom.ch/s/S00967E0BA7EE14B6C456B6C2FA8B42115F6809CBB6/";
            // connectionModel.UserEmail = "tuan.nguyen@xoontec.com";
            ICloudSyncBusiness cloudSyncBusiness = GetCloudSyncBusinessImpl(cloudActiveUser.ProviderName,connectionModel.DriveType);
            actionType = !string.IsNullOrEmpty(actionType) ? actionType : changePathModel.ActionType;
            if (!string.IsNullOrEmpty(actionType) && actionType == CloudDocChangeAction.Delete)
            {
                return await cloudSyncBusiness.DeletePath(changePathModel, connectionModel);
            }
            if (!string.IsNullOrEmpty(actionType) && actionType == CloudDocChangeAction.Rename)
            {
                return await cloudSyncBusiness.RenamePath(changePathModel, connectionModel);
            }


            return null; ;
        }

        public async Task SwitchCloudJob(string loginName, CloudActiveUserModel oldCloud, CloudActiveUserModel currentCloud, Data _data)
        {
            PerformingContext context = SyncCLoudFilter.Context;
            WriteHangfireLog(context, String.Format("Move Doc From {0} to {1} , user {2}", oldCloud.ProviderName, currentCloud.ProviderName, loginName));
            SyncCloudQueueGetData data = new SyncCloudQueueGetData
            {
                IdLogin = _data.IdLogin,
                IdApplicationOwner = _data.IdApplicationOwner,
                LoginName = _data.LoginName,
                LoginLanguage = _data.LoginLanguage,
                GUID = Guid.NewGuid().ToString()
            };
            List<CloudSyncQueueModel> cloudSyncQueueModels = await _cloudService.GetSyncCloudQueue(data);

            WriteHangfireLog(context, String.Format("Get Data total {0} items", cloudSyncQueueModels != null ? cloudSyncQueueModels.Count : 0));
            if (cloudSyncQueueModels != null && cloudSyncQueueModels.Count > 0)
            {
                // CloudSyncQueueModel firstModel = cloudSyncQueueModels.FirstOrDefault();
                string oldCloudType = oldCloud.ProviderName.Trim();
                string currentCloudType = currentCloud.ProviderName.Trim();
                CloudConnectionStringModel sourceConnectionString = JsonConvert.DeserializeObject<CloudConnectionStringModel>(oldCloud.ConnectionString);
                CloudConnectionStringModel desConnectionString = JsonConvert.DeserializeObject<CloudConnectionStringModel>(currentCloud.ConnectionString);
                ICloudSyncBusiness _sourceCloudSyncBusiness = GetCloudSyncBusinessImpl(oldCloudType, sourceConnectionString.DriveType);
                ICloudSyncBusiness _desCloudSyncBusiness = GetCloudSyncBusinessImpl(currentCloudType,desConnectionString.DriveType);
                var sourcePreSync = await _sourceCloudSyncBusiness.PreSync(sourceConnectionString);
                var desPreSync = await _desCloudSyncBusiness.PreSync(desConnectionString);
                int countSyncSucess = 0, count = 0;
                foreach (CloudSyncQueueModel doc in cloudSyncQueueModels)
                {
                    var syncErrorMessage = "";
                    try
                    {
                        ReponseUploadDocToCloud infoFile = JsonConvert.DeserializeObject<ReponseUploadDocToCloud>(doc.CloudFilePath);
                        Stream fileStream = await _sourceCloudSyncBusiness.GetFileStream(infoFile);
                        if (fileStream == null)
                        {
                            throw new Exception(String.Format(" {0} GetFileStream {1} {2} is null", oldCloudType, doc.CloudMediaPath, doc.FileName));
                        }
                        ReponseUploadDocToCloud resultSync = await _desCloudSyncBusiness.SyncOneDocStream(doc, fileStream, desPreSync);
                        resultSync.ConnectionString = desConnectionString;
                        doc.CloudFilePath = resultSync != null ? JsonConvert.SerializeObject(resultSync) : "";

                    }
                    catch (Exception e)
                    {
                        syncErrorMessage = e.Message;
                    }
                    finally
                    {
                        count++;
                        var logMsg = String.Format("{0 }UploadDocument {1}: ClouMediaPath : {2} ,FileName : {3}", count,
                         string.IsNullOrEmpty(syncErrorMessage) ? "Success" : "False",
                          doc.CloudMediaPath, doc.FileName);
                        WriteHangfireLog(context, logMsg);
                        if (!string.IsNullOrEmpty(syncErrorMessage))
                        {
                            WriteHangfireLog(context, syncErrorMessage, true);
                        }
                        doc.IsSync = string.IsNullOrEmpty(syncErrorMessage);
                        doc.RepeatedTries = doc.RepeatedTries + 1;
                        doc.SyncErrorLog = syncErrorMessage;
                        List<CloudSyncQueueModel> list = new List<CloudSyncQueueModel>();
                        list.Add(doc);
                        var updateResult = await UpdateSyncCloudQueue(list, data, context);
                        if (updateResult != null && updateResult.IsSuccess)
                        {
                            countSyncSucess++;

                        }

                    }

                }
                if (countSyncSucess < cloudSyncQueueModels.Count)
                {
                    WriteHangfireLog(context, String.Format("No Document Sync Success  "), true);
                    throw new Exception("No Document Sync Success to ");
                }

            }
        }
    }
}
