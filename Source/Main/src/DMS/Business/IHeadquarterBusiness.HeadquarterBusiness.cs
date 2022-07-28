using DMS.Service;
using DMS.ServiceModels;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Business
{
    public class HeadquarterBusiness : BaseBusiness, IHeadquarterBusiness
    {
        private readonly IHeadquarterService _headQuarterService;
        private readonly IDynamicDataService _dynamicDataService;
        private readonly AppSettings _appSettings;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public HeadquarterBusiness(
            IHttpContextAccessor context,
            IOptions<AppSettings> appSettings,
            IHeadquarterService invoiceApprovalService,
            IDynamicDataService dynamicDataService
        ) : base(context)
        {
            _appSettings = appSettings.Value;
            _headQuarterService = invoiceApprovalService;
            _dynamicDataService = dynamicDataService;
        }

        public async Task<object> CreateHeadquarter(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            //DynamicData saveData = new DynamicData
            //{
            //    Data = baseData
            //};

            //values["CrudType"] = "CREATE";
            //values["MethodName"] = "SpCallPerson";
            values["CallAppModus"] = "0";
            //values["B00PersonTypeGw_IdRepPersonType"] = "32";
            values["GUID"] = Guid.NewGuid().ToString();

            //saveData.AddParams(values);

            SaveDynamicData saveDatad = new SaveDynamicData
            {
                BaseData = baseData,
                Data = values,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallPerson"
            };


            return await _headQuarterService.SaveFormData(saveDatad);
            //return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            //return await _dynamicDataService.SaveData(saveData);
        }

        public async Task<object> GetDetailsHeadquarter(string idPerson)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            Dictionary<string, object> values = new Dictionary<string, object>();
            values["MethodName"] = "SpAppB09HeadQuater";
            values["WidgetTitle"] = "Head Quater";
            values["IdPerson"] = idPerson;
            saveData.AddParams(values);
            var response = await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return array[1];
                }
            }
            return null;
        }

        public async Task<object> UpdateHeadquarter(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            //DynamicData saveData = new DynamicData
            //{
            //    Data = baseData
            //};

            //values["CrudType"] = "UPDATE";
            values["MethodName"] = "SpCallPerson";
            values["CallAppModus"] = "0";
            //values["B00PersonTypeGw_IdRepPersonType"] = "32";
            values["GUID"] = Guid.NewGuid().ToString();
            //saveData.AddParams(values);
            //return await _dynamicDataService.SaveData(saveData);

            SaveDynamicData saveDatad = new SaveDynamicData
            {
                BaseData = baseData,
                Data = values,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallPerson"
            };

            return await _headQuarterService.SaveFormData(saveDatad);
        }

        public async Task<object> CreateBranch(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            //DynamicData saveData = new DynamicData
            //{
            //    Data = baseData
            //};

            //values["CrudType"] = "CREATE";
            values["MethodName"] = "SpCallBranches";
            values["CallAppModus"] = "0";
            values["GUID"] = Guid.NewGuid().ToString();
            //saveData.AddParams(values);
            //return await _dynamicDataService.SaveData(saveData);

            SaveDynamicData saveDatad = new SaveDynamicData
            {
                BaseData = baseData,
                Data = values,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallBranches"
            };

            return await _headQuarterService.SaveFormData(saveDatad);
        }

        public async Task<object> GetBranches(string idPerson)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            Dictionary<string, object> values = new Dictionary<string, object>();
            values["Object"] = "GetBrances";
            values["MethodName"] = "SpAppB09Brances";
            values["IdPerson"] = idPerson;
            values["GUID"] = Guid.NewGuid().ToString();
            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            //if (response != null)
            //{
            //    var array = (JArray)response;
            //    if (array.Count > 0)
            //    {
            //        return array[1];
            //    }
            //}
            //return null;
        }

        public async Task<object> GetDetailsBranch(string idBranch)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            Dictionary<string, object> values = new Dictionary<string, object>();
            values["Object"] = "GetBrances";
            values["MethodName"] = "SpAppB09Brances";
            values["IdPerson"] = idBranch;
            values["GUID"] = Guid.NewGuid().ToString();
            saveData.AddParams(values);
            var response = await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return array[1];
                }
            }
            return null;
        }

        public async Task<object> UpdateBranch(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            //DynamicData saveData = new DynamicData
            //{
            //    Data = baseData
            //};

            // values["CrudType"] = "UPDATE";
            values["MethodName"] = "SpCallBranches";
            values["CallAppModus"] = "0";
            // values["B00PersonTypeGw_IdRepPersonType"] = "32";
            values["GUID"] = Guid.NewGuid().ToString();
            //saveData.AddParams(values);
            //return await _dynamicDataService.SaveData(saveData);

            SaveDynamicData saveDatad = new SaveDynamicData
            {
                BaseData = baseData,
                Data = values,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallBranches"
            };

            return await _headQuarterService.SaveFormData(saveDatad);
        }
    }
}
