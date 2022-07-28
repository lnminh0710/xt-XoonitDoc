using DMS.Models;
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
    public class ScanningReportService : BaseUniqueServiceRequest, IScanningReportService
    {
        public ScanningReportService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
          : base(appSettings, httpContextAccessor, appServerSetting)
        {
        }
        public async Task<object> GetScanningReport(ScanningReportDataModel data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetReportData";
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
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return new List<string> { array[0][0].ToString(), array[1].ToString() };
                }
            }
            return null;
        }

        public async Task<object> GetScanningReportx(ScanningReportDataModel data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetReportData";
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
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return new List<string> { array[0].ToString(), array[1].ToString() };
                }
            }
            return null;
        }
    }
}
