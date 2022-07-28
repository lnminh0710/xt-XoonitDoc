using DMS.Service;
using DMS.ServiceModels;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Business
{
    public class DocumentPermissionBusiness : BaseBusiness, IDocumentPermissionBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly IPathProvider _pathProvider;
        private readonly IDocumentService _documentService;
        private readonly IDynamicDataService _dynamicDataService;
        private readonly IUniqueService _uniqueService;
        private readonly ICommonBusiness _commonBusiness;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        public DocumentPermissionBusiness(IHttpContextAccessor context,
                              IDocumentService documentService,
                              IPathProvider pathProvider,
                              IOptions<AppSettings> appSettings,
                              IDynamicDataService dynamicDataService,
                              IUniqueService uniqueService,
                              ICommonBusiness commonBusiness ) : base(context)
        {
            _appSettings = appSettings.Value;
            _pathProvider = pathProvider;
            _documentService = documentService;
            _dynamicDataService = dynamicDataService;
            _uniqueService = uniqueService;
            _commonBusiness = commonBusiness;
        }
               
        public async Task<object> GetDocumentIndexingPermission(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionByTree";
            values["PermissionType"] = "Indexing";
            getData.AddParams(values);

            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetDocumentMailPermission(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionByTree";
            values["PermissionType"] = "Mail";
            getData.AddParams(values);

            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDDocumentIndexingPermission(Dictionary<string, object> data)
        {
            data["PermissionType"] = "Indexing";
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SavePermission"
            };
            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> CRUDDocumentMailPermission(Dictionary<string, object> data)
        {
            data["PermissionType"] = "Mail";
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallUserPermission",
                SpObject = "SavePermission"
            };
            return await _dynamicDataService.SaveFormData(saveData);
        }

    }
}
