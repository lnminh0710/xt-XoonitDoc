using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;

namespace DMS.Service
{
    public class DocumentContainerService : BaseUniqueServiceRequest, IDocumentContainerService
    {
        public DocumentContainerService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
            : base(appSettings, httpContextAccessor, appServerSetting) { }


        public async Task<object> GetThumbnails(DocumentContainerScansGetData data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetDocumentThumbnails";

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
                    // var totalItems = ConverterUtils.ToDynamicEnumerable(array[0][0], false);
                    dynamic totalRecordObj = JsonConvert.DeserializeObject(array[0][0].ToString());
                    int totalRecords = ConverterUtils.ToInt(totalRecordObj.TotalRecords);
                    var listT = ConverterUtils.ToDynamicEnumerable((JArray)array[2], false);
                    DocumentContainerThumbnailResponse thumbnailResponse = new DocumentContainerThumbnailResponse
                    {
                        TotalRecords = totalRecords,
                        Data = listT
                    };
                    return thumbnailResponse;
                }
            }
            // return null;
            return response;
        }
        public async Task<IEnumerable<dynamic>> GetDoc2OCR(DocumentContainerScansGetData data)
        {
            DocumentContainerScansGetData _data = new DocumentContainerScansGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                Object = "DocumentContainerScansForFile",
                TopRows = data.TopRows,
                IdDocumentContainerFileType = "3"
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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

        public async Task<WSEditReturn> SaveDocumentContainerOCR(DocumentContainerOCRSaveData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentContainerOCR";

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


        public async Task<IEnumerable<dynamic>> GetDoc2Group(DocumentContainerGroupGetData data)
        {
            DocumentContainerGroupGetData _data = new DocumentContainerGroupGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                IdDocumentContainerFileType = data.IdDocumentContainerFileType,
                PageSize = data.PageSize,
                B06DocumentContainerOcr_IdDocumentContainerOcr = data.B06DocumentContainerOcr_IdDocumentContainerOcr,
                Object = "DocumentContainerOCR"
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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

        public async Task<IEnumerable<dynamic>> GetDoc2Entry(DocumentContainerGroupGetData data)
        {
            DocumentContainerGroupGetData _data = new DocumentContainerGroupGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                IdDocumentContainerFileType = "3",
                Object = "DocumentContainerOCRGroup"
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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

        public async Task<IEnumerable<dynamic>> SaveDocEntry(DocumentContainerGroupGetData data)
        {
            DocumentContainerGroupGetData _data = new DocumentContainerGroupGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                IdDocumentContainerFileType = "3",
                Object = "DocumentContainerOCRGroup"
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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



        public async Task<IEnumerable<dynamic>> getFieldForEntry(DocumentContainerGroupGetData data)
        {
            DocumentContainerGroupGetData _data = new DocumentContainerGroupGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                IdDocumentContainerFileType = "3",
                Object = "DocumentContainerOCRGroup"
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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

        public async Task<WSEditReturn> SaveDocumentContainerProcessed(DocumentContainerProcessedSaveData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentContainerProcessed";

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

        public async Task<WSEditReturn> SaveDocumentContainerFilesLog(DocumentContainerFilesLogSaveData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveFilesLog";

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

        public async Task<IEnumerable<dynamic>> getTextEntity(DocumentContainerTextEntityGetData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentContainerTextEntityTypeData";

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
        public async Task<IEnumerable<dynamic>> GetPagesByDocId(DocumentContainerScansGetData data)
        {
            DocumentContainerScansGetData _data = new DocumentContainerScansGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                Object = "DocumentContainerOCRById",
                IdDocumentContainerScans = data.IdDocumentContainerScans,
                IdDocumentContainerFileType = data.IdDocumentContainerFileType
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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

        public async Task<IEnumerable<dynamic>> GetOCRDataByFileId(DocumentContainerScansGetData data)
        {
            DocumentContainerScansGetData _data = new DocumentContainerScansGetData
            {
                MethodName = "SpB06GetDocumentContainer",
                Object = "DocumentContainerOCRByFileId",
                AppModus = "0",
                IdLogin = data.IdLogin,
                LoginLanguage = data.LoginLanguage,
                IdApplicationOwner = data.IdApplicationOwner,
                GUID = Guid.NewGuid().ToString(),
                IsDisplayHiddenFieldWithMsg = "1",
                IdDocumentContainerFiles = data.IdDocumentContainerFiles
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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
        public async Task<WSEditReturn> DeleteScanDocument(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpCallMyDMS";
            data.AppModus = "0";
            data.LoginLanguage = "3";

            data.Object = "DeleteScanDocument";

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

        public async Task<object> GetDocumentScanById(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetPathDocumentById";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                    return array[0];
            }
            return null;
        }

        public async Task<object> GetDocumentContainerForDownload(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "DocumentContainerOCRByIdForDownload";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                    return array[0];
            }
            return null;
        }
        /*
         *
         * api merge 2 docs
         */
        public async Task<WSEditReturn> SaveDocumentContainerPage(DocumentContainerPageScanData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentContainerPageScan";

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
        public async Task<WSEditReturn> SaveDocumentUnGroup(DocumentContainerPageScanData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "DocumentContainerUngroup";

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

        public async Task<IEnumerable<dynamic>> GetDocumentContainerFileByListIds(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "DocumentContainerOCRByListId";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                    return array[0];
            }
            return null;
        }
        public Task<object> GetFilesForUpload(Data data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "GetFilesForUpload";

            return GetDataWithMapTypeIsNone(data);
        }

        public async Task<object> UpdateFilesForUpload(FileUploadSaveData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "UpdateFilesForUpload";

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
            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            return response;
        }

        public async  Task<WSEditReturn> SaveDocumentQrCode(DocumentContainerQrCodeSaveData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveQRCode";

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

        public async Task<WSEditReturn> SaveOCRPositionOnContainerFile(DocumentContainerPageScanData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.AppModus = "0";
            data.GUID = Guid.NewGuid().ToString();
            data.Object = "SaveOCRTextPositionOfDocument";

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


        public async Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree)
        {
            DocumentTreeGetDetails _data = new DocumentTreeGetDetails()
            {
                MethodName = "SpB06GetDocumentContainer",
                Object = "GetDocumentTreeByIdDocumentTree",
                AppModus = "0",
                IdLogin = "1",
                LoginLanguage = "1",
                IdApplicationOwner = "1",
                GUID = Guid.NewGuid().ToString(),
                IdDocumentTree = idDocumentTree
            };

            UniqueBody uniq = new UniqueBody
            {
                ModuleName = "GlobalModule",
                ServiceName = "GlobalService",
                Data = JsonConvert.SerializeObject(_data)
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
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<DocumentTreeInfo>>(rs);
                    //var listT = ConverterUtils.ToDynamicEnumerable((JArray)array[0], false);

                    //return listT;
                }
            }
            return null;
        }

        public async Task<List<DocumentTreeInfo>> GetDetailTreeNode(Data data, string nodeName)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetDetailTreeNode";

            var expandData = Common.ToDictionary(data);
            expandData["NodeName"] = nodeName;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<DocumentTreeInfo>>(rs);
                }
            }
            return null;
        }

        public async Task<List<DocumentTreeInfo>> GetOtherTreeNode(Data data)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetOtherTreeNode";

            var expandData = Common.ToDictionary(data);
            
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<DocumentTreeInfo>>(rs);
                }
            }
            return null;
        }
    }
}
