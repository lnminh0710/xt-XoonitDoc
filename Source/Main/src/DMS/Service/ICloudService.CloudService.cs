using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public class CloudService : BaseUniqueServiceRequest, ICloudService
    {
        public CloudService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
          : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }
        public async Task<object> GetCloudActiveOfSpecificUser(Data data, string idLogin, string idApplicationOwner)
        {
            data.MethodName = "SpB07AppCloud";
            data.Object = "GetCloudActive";
            data.IdLogin = idLogin;
            data.IdApplicationOwner = idApplicationOwner;
            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(data)
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(1, typeof(DynamicCollection));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType4)))[1];
            return response != null ? ((IList<DynamicCollection>)response).FirstOrDefault() : null;
        }
        public async Task<object> GetCloudActives(Data data)
        {
            data.MethodName = "SpB07AppCloud";
            data.Object = "GetCloudActive";
            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(data)
            };
            BodyRequest bodyRquest = new BodyRequest
            {
                Request = uniq
            };
            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(1, typeof(DynamicCollection));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType4)))[1];
            return response != null ? ((IList<DynamicCollection>)response).FirstOrDefault() : null;
        }
        public async Task<List<CloudSyncQueueModel>> GetSyncCloudQueue(SyncCloudQueueGetData data)
        {

            data.MethodName = "SpB07AppCloud";
            data.Object = "GetSyncCloudQueue";
            //data.IdLogin = "1";
            //data.LoginLanguage = "3";
            //data.IdApplicationOwner = "4";
            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<CloudSyncQueueModel>>(rs);
                }
            }
            return null;
        }
        public async Task<List<CloudSyncQueueModel>> GetSyncCloudQueueByIds(SyncCloudQueueGetData data)
        {

            data.MethodName = "SpB07AppCloud";
            data.Object = "GetSyncCloudQueueByListIdMainDocument";
            //data.IdLogin = "1";
            //data.LoginLanguage = "3";
            //data.IdApplicationOwner = "4";
            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);
            //     var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[1].ToString();

                    return JsonConvert.DeserializeObject<List<CloudSyncQueueModel>>(rs);

                }
            }
            return null;
        }
        public async Task<WSEditReturn> UpdateSyncCloudQueue(SyncCloudQueueUpdateData data)
        {
            data.MethodName = "SpCallCloud";
            //   data.AppModus = "0";
            //  data.GUID = Guid.NewGuid().ToString();
            data.Object = "UpdateSyncCloudQueue";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }
        public async Task<WSEditReturn> SaveCloudConnection(CloudConnectionSaveData data)
        {
            data.MethodName = "SpCallCloud";
            //   data.AppModus = "0";
            //  data.GUID = Guid.NewGuid().ToString();
            data.Object = "CloudConnection";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var expectedReturn = new Dictionary<int, Type>();
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<object> GetCloudConnection(CloudConnectionGetData data)
        {
            data.MethodName = "SpB07AppCloud";
            data.Object = "GetCloudConnection";
            //data.IdLogin = "1";
            //data.LoginLanguage = "3";
            //data.IdApplicationOwner = "4";
            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return array[1].FirstOrDefault();


                }
            }
            return null;
        }

        public async Task<CloudActiveUserModel> GetCloudActiveByUser(Data data)
        {
            data.MethodName = "SpB07AppCloud";
            data.Object = "GetCloudActiveByUser";
            //data.IdLogin = "1";
            //data.LoginLanguage = "3";
            //data.IdApplicationOwner = "4";
            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    var list = JsonConvert.DeserializeObject<List<CloudActiveUserModel>>(rs);
                    return list != null && list.Count > 0 ? list[0] : null;
                }
            }
            return null;
        }

        public async Task<List<ImageSyncQueueModel>> GetImagesOfMainDocFromSyncQueue(SyncCloudQueueGetImagesOfDoc data)
        {
            data.MethodName = "SpB07AppCloud";
            data.Object = "GetImageSyncToCloudBySyncQueueId";
            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<ImageSyncQueueModel>>(rs);
                }
            }
            return null;
        }
    }
}
