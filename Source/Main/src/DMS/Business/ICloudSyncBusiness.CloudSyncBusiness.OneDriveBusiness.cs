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
    public class CloudSyncBusinessOneDriveBusiness :CloudSyncBusinessOneDriveSignIn, ICloudSyncBusiness
    {
        // private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "cloud_onedrive");
        private OneDrive oneDriveSetting;
        private GraphServiceClient graphClient;
        private Token token = null;
        private List<QueryOption> queryOptions = new List<QueryOption>()
            {
                new QueryOption("allowExternal", "true")
            };
        //new QueryOption("allowExternal", "true"),
        //        new QueryOption("expand", "fields(select=ID,Author,Title,DocumentName,Email)")
        private double MAX_FILE_SIZE_IN_MB = 4;
        public CloudSyncBusinessOneDriveBusiness(AppSettings _appSettings):base(_appSettings)
        {
            oneDriveSetting = _appSettings.Clouds.OneDrive;
            oneDriveSetting.ClientSecret = _appSettings.Clouds.OneDriveClientSecret;
            oneDriveSetting.RefreshToken = _appSettings.Clouds.OneDriveRefreshToken;

        }
        public override DriveItemInfo GetDriveItemInfo(DriveItem driveItem)
        {
            
            return new DriveItemInfo
            {
                DriveId = driveItem.ParentReference.DriveId,
                DriveItemId = driveItem.Id
            };
        }
        public override GraphServiceClient AuthenticateOneDrive(CloudConnectionStringModel connectionModel)
        {
            try
            {
                    CloudToken token = connectionModel.CloudToken;
                return  AuthenticateOneDrive(token);
                //if (token == null || string.IsNullOrEmpty(token.access_token) || string.IsNullOrEmpty(token.refresh_token))
                //{
                //    throw new Exception("Cloud Token info wrong!");
                //}
                //string accessToken = token.access_token;
                //if (DateTime.Now > token.expired_date_time)
                //{
                //    if (string.IsNullOrEmpty(oneDriveSetting.ClientId) || string.IsNullOrEmpty(oneDriveSetting.ClientSecret) ||
                //string.IsNullOrEmpty(token.refresh_token))
                //    {
                //        throw new Exception("OneDriveClientId , OneDriveClientSecret, RefreshToken IsNullOrEmpty " + JsonConvert.SerializeObject(oneDriveSetting));
                //    }
                //    accessToken = OneDriveUtils.GetAccessTokenByRefreshToken(oneDriveSetting.ClientId, oneDriveSetting.ClientSecret,
                //       token.refresh_token);
                //    //      }
                //    GraphServiceClient graphClient = new GraphServiceClient(
                //    "https://graph.microsoft.com/v1.0",
                //    new DelegateAuthenticationProvider(
                //        async (requestMessage) =>
                //        {

                //            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("bearer", accessToken);
                //        }));
                //    return graphClient;
                //}
            }
            catch (Exception e)
            {
                throw e;
            }
            return null;
        }
        public override Task<DriveItem> getDriveItemSync(GraphServiceClient graphClient, CloudConnectionStringModel connectionModel)
        {
            return GetDriveItemById(graphClient, connectionModel.SharedFolderId);
        }
      

    }

}
