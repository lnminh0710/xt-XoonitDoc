using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;

namespace DMS.Service
{
    public class DocumentSystemService : BaseUniqueServiceRequest, IDocumentSystemService
    {
        public DocumentSystemService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
            : base(appSettings, httpContextAccessor, appServerSetting) { }

        public async Task<WSEditReturn> SaveDocumentSystemDocumentType(DocumentSystemDocumentTypeSaveData data)
        {
            data.MethodName = "SpB06CallDocumentSystem";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentType";

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
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> SaveDocumentSystemField(DocumentSystemFieldSaveData data)
        {
            data.MethodName = "SpB06CallDocumentSystem";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentModuleEntityTemplate";

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
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<WSEditReturn> SaveDocumentSystemModule(DocumentSystemModuleSaveData data)
        {
            data.MethodName = "SpB06CallDocumentSystem";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentModuleTemplateName";

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
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }
        public async Task<WSEditReturn> SaveDocumentSystemContainer(DocumentSystemContainerSaveData data)
        {
            data.MethodName = "SpB06CallDocumentSystem";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentTableModuleContainer";

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
            expectedReturn.Add(0, typeof(WSEditReturn));
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn)))[0];
            return response != null ? ((IList<WSEditReturn>)response).FirstOrDefault() : null;
        }

        public async Task<IEnumerable<dynamic>> GetAllModules(DocumentSystemModuleGetData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetAllModules";

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
                    var listT = ConverterUtils.ToDynamicEnumerable((JArray)array[0], false);

                    return listT;
                }
            }
            return null;
        }

        public async Task<IEnumerable<dynamic>> GetAllFields(DocumentSystemFieldGetData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetAllFields";

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
                    var listT = ConverterUtils.ToDynamicEnumerable((JArray)array[0], false);

                    return listT;
                }
            }
            return null;
        }

        public async  Task<IEnumerable<dynamic>> GetAllDoctypes(Data data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetAllDocumentTypes";

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
                    var listT = ConverterUtils.ToDynamicEnumerable((JArray)array[0], false);

                    return listT;
                }
            }
            return null;
        }
    }
}
