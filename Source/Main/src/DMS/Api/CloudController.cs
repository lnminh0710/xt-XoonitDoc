using DMS.Business;
using DMS.Business.CloudDriveBusiness;
using DMS.Constants;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.Cloud;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using DMS.Models.DMS.Cloud;
using System;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CloudController : BaseController
    {
        private readonly ICloudBusiness _cloudBusiness;
        private readonly IAuthenticateBusiness _authenticateBusiness;
        private readonly AppSettings _appSettings;
        //private readonly ServerConfig _serverConfig;
        public CloudController(ICloudBusiness cloudBusiness, IAuthenticateBusiness authenticateBusiness, IOptions<AppSettings> appSettings)
        {
            _cloudBusiness = cloudBusiness;
            _authenticateBusiness = authenticateBusiness;
            _appSettings = appSettings.Value;

        }

        [HttpGet]
        [Route("GetCloudActives")]
        public async Task<object> GetAllSearchModules()
        {

            var result = await _cloudBusiness.GetCloudActives();
            return result;
        }

        [HttpPost]
        [Route("SyncDocumentManually")]
        [AllowAnonymous]
        public async Task<object> SyncDocumentsxx([FromBody] CloudSyncModel syncModel)
        {
            //if (syncModel == null) return "Data undefined";

            await _cloudBusiness.SyncDocsToCloud(syncModel);
            return true;
            //return await _cloudBusiness.FindSharedFolderOnDropbox("tuan","tuannguyenxl@gmail.com");
        }

        [HttpPost]
        [Route("SyncDocuments")]
        public async Task<object> SyncDocuments([FromBody] CloudSyncModelPost syncModel)
        {


            return true;
        }

        [HttpPost]
        [Route("check/foldershared")]
        public async Task<object> DetectFolderShared([FromBody] CloudFolderSharedModel syncModel)
        {
            //sync documents to User's clouds

            return 0;
        }

        [HttpPost]
        [Route("SaveCloudConnection")]
        public async Task<object> SaveCloudConnection([FromBody] List<CloudConnectionModel> syncModels)
        {
            return await _cloudBusiness.SaveCloudConnection(syncModels);
        }

        [HttpPost]
        [Route("CloudConnection")]
        public async Task<object> ChangeCloudConnection([FromBody] List<CloudConnectionModel> syncModels)
        {
            StatusChangeCloudReturnModel rs = new StatusChangeCloudReturnModel();
            rs.WSEditReturn = await _cloudBusiness.SaveCloudConnection(syncModels);
            if (rs.WSEditReturn == null)
            {
                return rs;
            }
            else if (!string.IsNullOrEmpty(rs.WSEditReturn.ReturnID) && rs.WSEditReturn.ReturnID != "-1" && rs.WSEditReturn.IsSuccess)
            {
                rs.OAuthTokens = await _authenticateBusiness.ForceRefreshToken();
            }
            return rs;
        }

        [HttpPost]
        [Route("CreateAndSaveCloudConnection")]
        public async Task<object> CreateAndSaveCloudConnection([FromBody] List<CloudConnectionModel> syncModels)
        {
            StatusChangeCloudReturnModel rs = new StatusChangeCloudReturnModel();
            rs.WSEditReturn = await _cloudBusiness.CreateAndSharingFolder(syncModels);
            if (rs.WSEditReturn == null)
            {
                return rs;
            }
            else if (!string.IsNullOrEmpty(rs.WSEditReturn.ReturnID) && rs.WSEditReturn.ReturnID != "-1" && rs.WSEditReturn.IsSuccess)
            {
                rs.OAuthTokens = await _authenticateBusiness.ForceRefreshToken();
            }
            return rs;
        }

        [HttpGet]
        [Route("GetCloudConnection")]
        public async Task<object> GetCloudConnection(int idCloudProviders)
        {
            var result = await _cloudBusiness.GetCloudConnection(idCloudProviders);
            return result;
        }

        [HttpPost]
        [Route("TestCloudConnection")]
        [AllowAnonymous]
        public async Task<object> TestCloudConnection([FromBody] CloudConnectionTestModel model)
        {
            if (model.ConnectionString == null)
            {
                CloudActiveUserModel cloudActiveUser = await _cloudBusiness.GetCurrentCloudActiveOfUser();
                if (cloudActiveUser != null)
                {
                    CloudConnectionTestModel modelO = JsonConvert.DeserializeObject<CloudConnectionTestModel>(cloudActiveUser.ConnectionString);
                    modelO.CloudType = cloudActiveUser.ProviderName;
                    if (model.CloudType.ToLower() == modelO.CloudType.ToLower())
                    {
                        model.SharedFolderId = modelO.SharedFolderId;
                        model.CloudToken = modelO.CloudToken;
                        model.DriveType = modelO.DriveType;
                        //model.SftpConnection = modelO.SftpConnection;
                    }
                }
                var result = await _cloudBusiness.TestCloudConnection(model);
                return result;
            }
            else
            {
                CloudConnectionTestResponse response = new CloudConnectionTestResponse();
                if (string.IsNullOrEmpty(model.CloudType))
                {
                    response.IsSuccess = true;
                    return response;
                }
                if (model.CloudType.ToLower() == CloudType.OneDrive.ToLower())
                {
                    response = await _cloudBusiness.TestSharingFolderOnNewAccount(model);
                    return response;
                }
                if (model.CloudType.ToLower() == CloudType.GoogleDrive.ToLower())
                {
                    if (model.ConnectionString != null && !string.IsNullOrEmpty(model.ConnectionString.SharedFolderId))
                    {
                        response = await _cloudBusiness.TestCloudConnection(model);
                    }
                    else if (model.ConnectionString != null)
                    {
                        response = await _cloudBusiness.TestSharingFolderOnNewAccount(model);
                    }
                    return response;
                }
                response.IsSuccess = true;
                return response;
            }
        }

        [HttpPost]
        [Route("MoveDocumentManually")]
        [AllowAnonymous]
        public async Task<object> MoveDocumentManually([FromBody] CloudChangeDocModel changeDocModel)
        {
            await _cloudBusiness.ChangeDoc(changeDocModel);
            return Ok();
        }

        [HttpPost]
        [Route("TestingActionsWithCould")]
        [AllowAnonymous]
        public async Task<object> TestingActionsWithCould([FromBody] CloudSyncModelPost syncModel)
        {
            await _cloudBusiness.ActionsWithCloud(syncModel);
            return true;
        }

        [HttpGet]
        [Route("StatusCloudConnection")]
        public async Task<int> DetectConnectionToCloud()
        {
            CloudActiveUserModel cloudActiveUser = await _cloudBusiness.GetCloudActive();
            if (cloudActiveUser == null)
            {
                return -1;
            }
            if (string.IsNullOrEmpty(cloudActiveUser.ConnectionString) || string.IsNullOrEmpty(cloudActiveUser.ProviderName))
            {
                return -1;
            }

            CloudConnectionTestModel model = JsonConvert.DeserializeObject<CloudConnectionTestModel>(cloudActiveUser.ConnectionString);
            model.CloudType = cloudActiveUser.ProviderName;

            CloudConnectionTestResponse result = await _cloudBusiness.TestCloudConnection(model);

            if (result == null)
            {
                return 0;
            }

            if (result.IsSuccess)
            {
                return 1;
            }

            return 0;
        }

        [HttpGet]
        [Route("StatusConnection")]
        public async Task<object> DetectConnection()
        {
            CloudActiveUserModel cloudActiveUser;
            cloudActiveUser = await _cloudBusiness.GetCurrentCloudActiveOfUser();
            if (cloudActiveUser == null)
            {
                return -1;
            }
            if (string.IsNullOrEmpty(cloudActiveUser.ConnectionString) || string.IsNullOrEmpty(cloudActiveUser.ProviderName))
            {
                return -1;
            }


            CloudConnectionTestModel model = JsonConvert.DeserializeObject<CloudConnectionTestModel>(cloudActiveUser.ConnectionString);
            model.CloudType = cloudActiveUser.ProviderName;
            model.IsCheckStatusConnection = true;
            CloudConnectionTestResponse result = await _cloudBusiness.TestCloudConnection(model);

            if (result == null)
            {
                return 0;
            }

            if (result.IsSuccess)
            {
                return 1;
            }

            return 0;
        }

        [HttpGet]
        [Route("GetConfigurationCloud")]
        [AllowAnonymous]
        public string GetConfigurationCloud(CloudTypeEnum cloudType)
        {
            return _cloudBusiness.GetConfigurationCloud(cloudType); ;
        }

        [HttpGet]
        [Route("GetExternalLoginUrl")]
        [AllowAnonymous]
        public ActionResult GetExternalLoginUrl(string provider)
        {
            return Redirect(_appSettings.ExternalLoginUrl
                            + "?provider=" + provider);
            //+ "&callBackUrl=" + LiuLoConfiguration.CungMua.DomainFO + "/Customer/ExternalLogin");
        }
    }
}
