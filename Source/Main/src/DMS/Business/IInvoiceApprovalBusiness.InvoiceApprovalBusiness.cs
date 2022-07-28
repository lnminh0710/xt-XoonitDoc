using DMS.Service;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Utils;
using DMS.ServiceModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Models;
using Newtonsoft.Json.Linq;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;
using System.Collections;
using System.Reflection;
using Newtonsoft.Json;
using DMS.Models.DMS;
using XenaSignalR;
using DMS.Models.Approval;
using System.Text;
using Microsoft.Extensions.Options;
using DMS.Utils.Firebase;
using DMS.Constants;

namespace DMS.Business
{
    public class InvoiceApprovalBusiness : BaseBusiness, IInvoiceApprovalBusiness
    {
        private readonly IInvoiceApprovalService _invoiceApprovalService;
        private readonly IDynamicDataService _dynamicDataService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly ICloudBusiness _cloudBusiness;
        private readonly IConvertImageProcessBusiness _documentProcessBusiness;
        private ISignalRClientHelper _signalRClient;
        private IFirebaseNotificationClient _firebaseNotificationClient;
        private readonly AppSettings _appSettings;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public InvoiceApprovalBusiness(
            IHttpContextAccessor context,
            IOptions<AppSettings> appSettings,
            IInvoiceApprovalService invoiceApprovalService, IDynamicDataService dynamicDataService,
            IElasticSearchSyncBusiness elasticSearchSync,
            ICloudBusiness cloudBusiness,
            IConvertImageProcessBusiness documentProcessBusiness,
            ISignalRClientHelper signalRClient,
            IFirebaseNotificationClient firebaseNotificationClient
        ) : base(context)
        {
            _appSettings = appSettings.Value;
            _invoiceApprovalService = invoiceApprovalService;
            _dynamicDataService = dynamicDataService;
            _elasticSearchSync = elasticSearchSync;
            _cloudBusiness = cloudBusiness;
            _documentProcessBusiness = documentProcessBusiness;
            _signalRClient = signalRClient;
            _firebaseNotificationClient = firebaseNotificationClient;
        }

        public async Task<object> GetHistoryApproval(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "Approval";
            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        #region Groups - Users
        public async Task<object> GetApprovalGroups(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetApprovalGroups";
            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetApprovalGroupsUser(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetApprovalGroupsUser";
            getData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetApprovalGroupsAssignedUsers(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetApprovalGroupsAssignedUsers";
            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDGroupApproval(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallB07InvoiceApprovalGroup",
                SpObject = "SaveInvoiceApprovalGroup"
            };

            return await _invoiceApprovalService.SaveFormData(saveData);
        }

        #endregion Groups - Users

        #region Invoice
        public async Task<object> GetInvoiceItems(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "InvoiceItems";
            saveData.AddParams(values);
            var response = await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            return response;
        }

        public async Task<object> GetInvoiceInformation(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "InvoiceSupplierInformation";
            saveData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetInvoiceMainApproval(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "InvoiceMainApproval";
            saveData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        #endregion  Invoice

        #region Suppliers
        public async Task<object> GetSearchSupplier(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetSearchSupplier";
            getData.AddParams(values);
            var response = await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
            return response;
        }

        public async Task<object> GetSupplierDynamicForm(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetSupplierDynForm";
            getData.AddParams(values);
            var response = await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
            return response;
        }

        #endregion Suppliers

        #region Mandant
        public async Task<object> GetSearchMandant(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetSearchMandant";
            getData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetMandantOverview(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "MandantOverview";
            getData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> GetMandantDynamicForm(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "GetMandantDynForm";
            getData.AddParams(values);
            var response = await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
            getData = null;
            return response;
        }

        public async Task<object> CRUDMandant(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallInvoiceApproval",
                SpObject = "InvoiceMandant"
            };

            return await _invoiceApprovalService.SaveFormData(saveData);
        }


        #endregion Mandant

        #region Notes
        public async Task<object> GetNotes(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "InvoiceNote";
            getData.AddParams(values);
            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDNotes(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = values,
                SpMethodName = "SpCallB07InvoiceApprovalNotes",
                SpObject = "SaveInvoiceApprovalNotes"
            };
            return await _invoiceApprovalService.SaveFormDynamicData(saveData);
        }

        #endregion Notes

        #region Payment
        public async Task<object> GetPaymentInformation(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "PaymentInformation";
            getData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> SearchDropdownTableInvoiceApproval(Dictionary<string, object> values, string objName)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = objName;
            getData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        #endregion Payment

        #region CRUD Form
        public async Task<object> SaveProcessingForm(Dictionary<string, object> data, UserFromService userFromService = null)
        {
            var spObject = data.GetStringValue("SpObject");
            if (string.IsNullOrEmpty(spObject))
            {
                spObject = "InvoiceAppoval";
            }
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallInvoiceApproval",
                SpObject = spObject
            };

            if (userFromService != null)
            {
                baseData.IdLogin = userFromService.IdLogin;
                baseData.IdApplicationOwner = userFromService.IdApplicationOwner;
            }

            string IdDocumentTree = null;
            string IdDocumentContainerScans = null;
            string IdMainDocument = null;
            string MediaName = null;
            string IsToDo = null;
            string IsKeepApprovalProcessing = null;

            #region Detect value of key fields
            if (data.ContainsKey("MainDocument") || data.ContainsKey("JSONMainDocument"))
            {
                IEnumerable v;
                if (data.ContainsKey("MainDocument"))
                {
                    v = ((IEnumerable)data.GetValue("MainDocument"));
                }
                else
                {
                    v = ((IEnumerable)data.GetValue("JSONMainDocument"));
                }
                foreach (object element in v)
                {
                    IdDocumentTree = GetValueAttributeInJSONDynamic(element, "IdDocumentTree");
                    IdDocumentContainerScans = GetValueAttributeInJSONDynamic(element, "IdDocumentContainerScans");
                    IdMainDocument = GetValueAttributeInJSONDynamic(element, "IdMainDocument");
                    MediaName = GetValueAttributeInJSONDynamic(element, "MediaName");
                    IsToDo = GetValueAttributeInJSONDynamic(element, "IsToDo");
                    break;
                }
            }
            #endregion

            if (data.ContainsKey("IsKeepApprovalProcessing"))
            {
                IsKeepApprovalProcessing = data.GetValue("IsKeepApprovalProcessing").ToString();
            }

            bool IsCreateNewManDoc = false;
            if (string.IsNullOrEmpty(IdMainDocument))
            {
                IsCreateNewManDoc = true;
            }
            List<string> ignoredKeys = data.GetValue("IgnoredKeys") as List<string>;
            if (ignoredKeys != null && ignoredKeys.Count > 0)
            {
                saveData.IgnoredKeys.AddRange(ignoredKeys);
            }

            #region Create new Object data
            DocumentTreeInfo tree = null;
            if (!string.IsNullOrEmpty(IdDocumentTree))
            {
                try
                {
                    tree = await _documentProcessBusiness.GetDocumentTreesDetails(IdDocumentTree);
                }
                catch (Exception ex)
                {
                    _logger.Error("Error GetDocumentTreesDetails documentTypeId: " + IdDocumentTree, ex);
                    throw ex;
                }
            }
            var documentTreeMedia = new Models.DMS.DocumentTreeMediaModel()
            {
                MediaName = MediaName,
                IdDocumentTree = IdDocumentTree,
                IdRepTreeMediaType = "1",
                CloudMediaPath = tree.DocPath.Replace("\\\\", "\\"),
                IdCloudConnection = UserFromService != null ? UserFromService.IdCloudConnection : null,
                IsActive = "1"
            };

            var changeDocumentIdentity = new Models.DMS.Capture.FolderCapturedDocumentModel()
            {
                IdDocumentTree = IdDocumentTree,
                IdMainDocument = IdMainDocument
            };

            saveData.Data["JSONChangeDocumentIdentity"] = JsonConvert.SerializeObject(changeDocumentIdentity);
            saveData.Data["JSONDocumentTreeMedia"] = JsonConvert.SerializeObject(documentTreeMedia);
            #endregion

            saveData.IgnoredKeys = saveData.IgnoredKeys.Distinct().ToList();

            _logger.Debug("Request save SaveDynamicData: " + JsonConvert.SerializeObject(saveData));
            var result = await _invoiceApprovalService.SaveProcessingForm(saveData);

            _logger.Debug("Result save SaveDynamicData: " + JsonConvert.SerializeObject(result));
            if (result == null || (string.IsNullOrWhiteSpace(result.JsonReturnIds) && string.IsNullOrWhiteSpace(result.ReturnID)) || result.EventType == null || !"Successfully".Contains(result.EventType))
            {
                return new WSEditReturn
                {
                    ReturnID = "-1",
                    EventType = null,
                };
            }

            //_logger.Debug($"BEFORE  IdMainDocument {IdMainDocument} {IdDocumentContainerScans}");
            string IdInvoiceMainApproval = "";
            if (!string.IsNullOrWhiteSpace(result.ReturnID))
            {
                IdInvoiceMainApproval = result.ReturnID;
                //_logger.Debug($"0. SET  IdInvoiceMainApproval - {IdInvoiceMainApproval} -");
            }

            if (string.IsNullOrWhiteSpace(result.JsonReturnIds))
            {
                IdInvoiceMainApproval = result.ReturnID;
                //_logger.Debug($"1. SET  IdInvoiceMainApproval {IdInvoiceMainApproval} {IdDocumentContainerScans}");
            }
            else
            {
                _logger.Debug($"JsonReturnIds {result.JsonReturnIds}");
                var jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(result.JsonReturnIds);
                IdMainDocument = jsonResult.IdMainDocuments.FirstOrDefault().IdMainDocument;
                //_logger.Debug($"2. SET  IdMainDocument {IdMainDocument} {IdDocumentContainerScans}");
            }

            bool IsKeepAP = false;

            if (!string.IsNullOrEmpty(IsKeepApprovalProcessing) && IsKeepApprovalProcessing == "1")
            {
                IsKeepAP = true;
            }
            //_logger.Debug($"AFTER  IdMainDocument {IdMainDocument} {IdDocumentContainerScans}");
            if (!string.IsNullOrEmpty(IsToDo) && IsToDo == "1")
            {
                await SyncData(IsCreateNewManDoc, IdMainDocument, IdDocumentContainerScans, IsKeepAP, true);
            }
            else
            {
                await SyncData(IsCreateNewManDoc, IdMainDocument, IdDocumentContainerScans, IsKeepAP, false);
            }

            // Save Approval User Auto Released
            var saveApprovalUserAutoReleased = GetSaveApprovalUserAutoReleasedData(data, IdInvoiceMainApproval);
            if (saveApprovalUserAutoReleased != null)
            {
                saveApprovalUserAutoReleased.MethodName = "SpCallInvoiceApprovalLogic";
                saveApprovalUserAutoReleased.Object = "SaveApprovalUserAutoReleased";
                await _invoiceApprovalService.SaveApprovalUserAutoReleased(saveApprovalUserAutoReleased);
            }

            if (string.IsNullOrEmpty(IsKeepApprovalProcessing) || IsKeepApprovalProcessing == "0")
            {
                await NotifyToUser(data);
            }

            return result;
        }

        private SaveApprovalUserAutoReleasedData GetSaveApprovalUserAutoReleasedData(Dictionary<string, object> data, string IdInvoiceMainApproval = null)
        {
            var confirmInvoiceApproval = data.FirstOrDefault(x => x.Key == "JSONConfirmInvoiceApproval").Value;
            if (confirmInvoiceApproval == null) return null;

            var approvalUserAutoReleased = JsonConvert.DeserializeObject<ApprovalUserAutoReleased>(confirmInvoiceApproval.ToString())?.ConfirmInvoiceApproval?.FirstOrDefault();
            if (approvalUserAutoReleased == null) return null;

            return new SaveApprovalUserAutoReleasedData
            {
                IdInvoiceMainApproval = string.IsNullOrWhiteSpace(IdInvoiceMainApproval) ? approvalUserAutoReleased.IdInvoiceMainApproval : IdInvoiceMainApproval,
                IdInvoiceApproval = approvalUserAutoReleased.IdInvoiceApproval,
                IdInvoiceApprovalPerson = approvalUserAutoReleased.IdInvoiceApprovalPerson,
                IsInvoiceReleased = approvalUserAutoReleased.IsInvoiceReleased == "1" ? "true" : "false",
                IsInvoiceRejected = approvalUserAutoReleased.IsInvoiceRejected == "1" ? "true" : "false",
                Notes = approvalUserAutoReleased?.Notes,
                IdLogin = UserFromService.IdLogin,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
                LoginLanguage = UserFromService.IdRepLanguage
            };
        }

        private async Task SyncData(bool IsCreateNewManDoc, string IdMainDocument, string IdDocumentContainerScans, bool IsKeepCurrentIndex, bool SyncToDoIndex = false)
        {
            if (IsCreateNewManDoc)
            {
                try
                {
                    await _cloudBusiness.SyncDocsToCloud(new CloudSyncModel()
                    {
                        IndexName = ElasticSearchIndexName.InvoiceApproval,
                        idMainDocuments = new List<string> { IdMainDocument }
                    }, new Data()
                    {
                        IdApplicationOwner = UserFromService.IdApplicationOwner,
                        IdLogin = UserFromService.IdLogin
                    });
                }
                catch (Exception ex)
                {
                    _logger.Error("Error sync Document-SyncDocsToCloud to ES", ex);
                }
            } 
            if (SyncToDoIndex)
            {
                try
                {
                    await _elasticSearchSync.SyncToElasticSearch(ElasticSearchIndexName.TodoDocument, "ToDoDocumentsSearch", IdMainDocument);

                    if (IsCreateNewManDoc)
                    {
                        _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { IdDocumentContainerScans }), ElasticSearchIndexName.InvoiceApprovalProcessing);
                    }

                    _logger.Debug($"Sync ToDoDocuments with IdMainDocument: {IdMainDocument} ");
                }
                catch (Exception ex)
                {
                    _logger.Error("Error sync Document-Approval to ES ToDoDocumentsSearch", ex);
                }
            }

            if (!IsKeepCurrentIndex)
            {
                try
                {
                    if (IsCreateNewManDoc)
                    {
                        _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { IdDocumentContainerScans }), ElasticSearchIndexName.InvoiceApprovalProcessing);
                    } else
                    {
                        _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { IdMainDocument }), ElasticSearchIndexName.InvoiceApproval);
                        _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { IdMainDocument }), ElasticSearchIndexName.InvoiceApprovalRejected);
                    }
                    await _elasticSearchSync.SyncToElasticSearch(ElasticSearchIndexName.InvoiceApproval, "ApprovalSearch", IdMainDocument);
                    await _elasticSearchSync.SyncToElasticSearch(ElasticSearchIndexName.InvoiceApprovalRejected, "ApprovalRejectedSearch", IdMainDocument);
                    
                    _logger.Debug($"Sync Approval with IdMainDocument: {IdMainDocument} ");
                }
                catch (Exception ex)
                {
                    _logger.Error("Error sync Document-Approval to ES", ex);
                }
            }

        }

        private async Task<bool> NotifyToUser(Dictionary<string, object> data)
        {
            //Turn on/ off Notification Popup
            if (!_appSettings.EnableNotificationPopup)
            {
                return await Task.FromResult(true);
            }

            var sbLog = new StringBuilder();
            try
            {
                sbLog.AppendLine($"**Approval - Notify to user:");

                var spObject = data.GetStringValue("SpObject");
                var spMethodName = data.GetStringValue("SpMethodName");
                if (spObject == "ConfirmInvoiceApproval" && spMethodName == "SpCallInvoiceApproval")
                {
                    var idLogins = new List<string> { UserFromService.IdLogin };
                    //idLogins.Add("434");
                    sbLog.AppendLine($"- [Case Approve] - IdLogins: {string.Join(",", idLogins)}");
                    var message = new SignalRMessageModel
                    {
                        Type = ESignalRMessageType.Approval,
                        Job = ESignalRMessageJob.Approval_Invite,
                        Action = SignalRActionEnum.Approval_Invite_Approve.ToString(),
                        Data = idLogins
                    };
                    _ = _signalRClient.SendMessage(message, receiveWithType: false);
                }
                else
                {
                    sbLog.AppendLine($"* [Case Invite]:");
                    var JSONApprovalUser = data.GetValue("JSONApprovalUser");

                    if (JSONApprovalUser == null)
                    {
                        sbLog.AppendLine($"- Can not get JSONApprovalUser");
                        return await Task.FromResult(true);
                    }

                    var jObject = (JObject)JSONApprovalUser;
                    JsonApprovalUser model = jObject.ToObject<JsonApprovalUser>();
                    if (model.ApprovalUser != null && model.ApprovalUser.Count > 0)
                    {
                        var idLogins = model.GetIdLogins();
                        if (idLogins != null && idLogins.Count > 0)
                        {
                            if (data.GetStringValue("IsPriority") == "1")
                            {
                                idLogins = new List<string>() { idLogins.First() };
                            }
                            sbLog.AppendLine($"- IdLogins: {string.Join(",", idLogins)}");
                            var message = new SignalRMessageModel
                            {
                                Type = ESignalRMessageType.Approval,
                                Job = ESignalRMessageJob.Approval_Invite,
                                Action = SignalRActionEnum.Approval_Invite_Request.ToString(),
                                Data = idLogins
                            };
                            _ = _signalRClient.SendMessage(message, receiveWithType: false);
                            _ = _firebaseNotificationClient.SendNotificationToUsers(idLogins, "DMS Approval", "You have a new invoice need to approve");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                sbLog.AppendLine($"- Exception: {ex}");
            }
            _logger.Debug(sbLog);
            return await Task.FromResult(true);
        }
        #endregion

        #region CRUD Dynamic Form
        public async Task<object> SaveDynamicForm(Dictionary<string, object> data)
        {
            WSEditReturn result;
            var spObject = data.GetStringValue("SpObject");
            var spMethodName = data.GetStringValue("SpMethodName");
            if (string.IsNullOrEmpty(spObject) || string.IsNullOrEmpty(spMethodName))
            {
                throw new Exception("Data invalid");
            }

            // for approval user
            if (spObject == "SaveApprovalUser" && spMethodName == "SpCallInvoiceApprovalLogic")
            {
                var saveApprovalUserAutoReleased = GetSaveApprovalUserAutoReleasedData(data);
                if (saveApprovalUserAutoReleased == null)
                {
                    throw new Exception("Data invalid");
                }
                string IdMainDocument = data.GetStringValue("IdMainDocument");
                saveApprovalUserAutoReleased.MethodName = spMethodName;
                saveApprovalUserAutoReleased.Object = spObject;
                var response = await _invoiceApprovalService.SaveApprovalUser(saveApprovalUserAutoReleased);

                if (response.Count < 2)
                {
                    return new WSEditReturn
                    {
                        ReturnID = "-1",
                        EventType = null,
                    };
                }

                result = JsonConvert.DeserializeObject<WSEditReturn>(response[1][0] + string.Empty);
                if (result == null || string.IsNullOrWhiteSpace(result.ReturnID) || result.EventType == null || !"Successfully".Contains(result.EventType))
                {
                    return new WSEditReturn
                    {
                        ReturnID = "-1",
                        EventType = null,
                    };
                }

                if (!string.IsNullOrEmpty(IdMainDocument)){
                    await SyncData(false, IdMainDocument, "", false, false);
                }                

                var approvalUsers = JsonConvert.DeserializeObject<List<SaveApprovalUser>>(response[0] + string.Empty);
                if (approvalUsers.Any())
                {
                    var idLogins = approvalUsers.Select(x => x.IdLogin).ToList();
                    _logger.Debug($"IdLogin need approval: {JsonConvert.SerializeObject(idLogins)}");

                    NotifyUsersApproval(idLogins, SignalRActionEnum.Approval_Invite_Request.ToString());
                }
                NotifyUsersApproval(new List<string>() { UserFromService.IdLogin }, SignalRActionEnum.Approval_Invite_Approve.ToString());
            }
            else
            {
                Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
                SaveDynamicData saveData = new SaveDynamicData
                {
                    BaseData = baseData,
                    Data = data,
                    IgnoredKeys = new List<string>() { "SpObject", "SpMethodName" },
                    SpMethodName = spMethodName,
                    SpObject = spObject
                };

                List<string> ignoredKeys = data.GetValue("IgnoredKeys") as List<string>;
                if (ignoredKeys != null && ignoredKeys.Count > 0)
                {
                    saveData.IgnoredKeys.AddRange(ignoredKeys);
                }
                saveData.IgnoredKeys = saveData.IgnoredKeys.Distinct().ToList();

                result = await _invoiceApprovalService.SaveProcessingForm(saveData);

                _logger.Debug($"Result save SaveDynamicData: {data}       {JsonConvert.SerializeObject(result)}");
                if (result == null || string.IsNullOrWhiteSpace(result.ReturnID) || result.EventType == null || !"Successfully".Contains(result.EventType))
                {
                    return new WSEditReturn
                    {
                        ReturnID = "-1",
                        EventType = null,
                    };
                }
                await NotifyToUser(data);
            }
            return result;
        }
        #endregion

        private void NotifyUsersApproval(object idLogin, string actionType)
        {
            var message = new SignalRMessageModel
            {
                Type = ESignalRMessageType.Approval,
                Job = ESignalRMessageJob.Approval_Invite,
                Action = actionType,
                Data = idLogin
            };
            _ = _signalRClient.SendMessage(message, receiveWithType: false);
        }

        private string GetValueAttributeInJSONDynamic(object element, string key)
        {
            if (element == null)
            {
                return null;
            }
            return ((JObject)((Newtonsoft.Json.Linq.JContainer)((Newtonsoft.Json.Linq.JContainer)element).First()).First()).GetValue(key)?.ToString();
        }

        private object ParseDataToFormGroup(object response)
        {
            FormGroupDefinitionV2 formGroup = new FormGroupDefinitionV2();
            JArray arrayResponse = (JArray)response;
            // variables for form input
            FormDefinition formDefinition = null;
            ColumnDefaultValueDefinition defaultValueTable = null;
            IEnumerable<ColumnDefinition> controlsTable = null;

            // variables for form table
            TableCommonDefinition tableDefinition = null;
            IEnumerable<SettingColumnNameListWrapper> settingTableColumns = null;
            IEnumerable<object> dataTableSource = null;

            byte indexDatatable = 0;

            while (indexDatatable < arrayResponse.Count - 1)
            {
                var _dataTable = arrayResponse[indexDatatable].First();
                if (_dataTable == null)
                {
                    continue;
                }

                if (_dataTable.SelectToken("TitleFormSection") != null) // is Data Form Field
                {
                    defaultValueTable = arrayResponse[indexDatatable++].ToObject<IEnumerable<ColumnDefaultValueDefinition>>().FirstOrDefault();
                    controlsTable = arrayResponse[indexDatatable++].ToObject<IEnumerable<ColumnDefinition>>();
                    formDefinition = new FormDefinition(defaultValueTable, controlsTable);
                    formGroup.FormDefinitions.Add(formDefinition);

                    continue;
                }
                else if (_dataTable.SelectToken("SettingColumnName") != null) // is DataTable
                {
                    settingTableColumns = arrayResponse[indexDatatable++].ToObject<IEnumerable<SettingColumnNameListWrapper>>();
                    dataTableSource = arrayResponse[indexDatatable++].ToObject<IEnumerable<object>>();
                    tableDefinition = new TableCommonDefinition(dataTableSource, settingTableColumns);
                    formGroup.FormDefinitions.Add(tableDefinition);
                    continue;
                }

                indexDatatable++;
            }

            // indexDatatable now is the last index

            if (indexDatatable < arrayResponse.Count && arrayResponse[indexDatatable].HasValues)
            {
                try
                {
                    var callSpDef = arrayResponse[indexDatatable].ToObject<IEnumerable<CallSpDefinition>>().FirstOrDefault();
                    formGroup.MethodName = callSpDef?.CallSp ?? "";
                    formGroup.Object = callSpDef?.Object ?? "";
                }
                catch (Exception)
                {
                    formGroup.MethodName = "";
                    formGroup.Object = "";
                }
            }

            var formGroupViewModel = new FormGroupDefinitionV2ViewModel();
            formGroupViewModel.MethodName = formGroup.MethodName;
            formGroupViewModel.Object = formGroup.Object;
            var groupOfForm = formGroup.FormDefinitions
                                       .Select(form => form.ParseViewModel())
                                       .GroupBy(form => form.GroupSetting?.GroupId)
                                       .Select(g => new GroupOfFormModel
                                       {
                                           GroupId = g.Key,
                                           Forms = g.ToList()
                                       });

            var formDefinitions = new List<AbstractGroupControlDefinitionViewModel>();

            foreach (var group in groupOfForm)
            {
                if (group.GroupId == null)
                {
                    formDefinitions.AddRange(group.Forms);
                    continue;
                }

                formDefinitions.Add(new GroupFormDefinitionViewModel(group.Forms));
            }
            formGroupViewModel.FormDefinitions = formDefinitions;

            return formGroupViewModel;
        }

        public async Task<object> GetAIDataExtracted(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpB06GetDocumentProcessedAi";
            values["Object"] = "GetDataProcessedAi";
            saveData.AddParams(values);
            var res = await _dynamicDataService.GetDynamicDataFormTable(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            
            if (res == null)
            {
                return null;
            }

            JArray response = (JArray)res;
            List<object> f = new List<object>();

            DataExtractedModel invoiceInfo = new DataExtractedModel();
            invoiceInfo.TypeDataSet = "Json";
            invoiceInfo.WidgetType = "InvoiceInfo";
            invoiceInfo.Data = response.First();
            f.Add(invoiceInfo);

            if(response.Count == 1 || (((JArray)response[1]).Count == 0))
            {
               return f;
            }

            DataExtractedModel dataContacts = new DataExtractedModel();
            dataContacts.WidgetType = "Contacts";
            dataContacts.Data = response[1];
            f.Add(dataContacts);

            values.Remove("MethodName");
            values.Remove("Object");

            var resMandantForm = await GetMandantDynamicForm(values);
            if(resMandantForm != null)
            {
                DataExtractedModel dataMandantModel = ParseDataRaw((JArray)resMandantForm);
                dataMandantModel.WidgetType = "Mandant";
                f.Add(dataMandantModel);
            }

            values.Remove("MethodName");
            values.Remove("Object");
            var resSupplierForm = await GetSupplierDynamicForm(values);
            if(resSupplierForm != null)
            {
                DataExtractedModel dataSupplierModel = ParseDataRaw((JArray)resSupplierForm);
                dataSupplierModel.WidgetType = "Supplier";
                f.Add(dataSupplierModel);
            }

            return f;
        }

        private DataExtractedModel ParseDataRaw(JArray response)
        {
            DataExtractedModel dm = new DataExtractedModel();
            int indexDatatable = 0;
            while (indexDatatable < response.Count - 1)
            {
                var _dataTable = response[indexDatatable].First();
                if (_dataTable == null)
                {
                    continue;
                }
                if (_dataTable.SelectToken("SettingColumnName") != null) // is DataTable
                {
                    JArray tb = new JArray();
                    tb.Add(response[indexDatatable]);
                    indexDatatable++;
                    
                    indexDatatable++;
                    tb.Add(response[indexDatatable]);
                    dm.Data = tb;
                    dm.TypeDataSet = "DataTable";
                    return dm;
                }
                else if (_dataTable.SelectToken("TitleFormSection") != null) // is Data Form Field
                {
                    //indexDatatable++;
                    //int pos = indexDatatable;
                    //if (response[pos] != null && response[pos].ToString().Contains("WidgetTitle"))
                    //{                        
                    //    indexDatatable++;
                    //    pos = indexDatatable;
                    //}

                    ColumnDefaultValueDefinition defaultValueTable = null;// response[indexDatatable].ToObject<IEnumerable<ColumnDefaultValueDefinition>>().FirstOrDefault();

                    defaultValueTable = response[indexDatatable++].ToObject<IEnumerable<ColumnDefaultValueDefinition>>().FirstOrDefault();
                    int pos = indexDatatable++;
                    if (response[pos] != null && response[pos].ToString().Contains("WidgetTitle"))
                    {
                        pos = indexDatatable++;
                    }

                    IEnumerable<ColumnDefinition>  controlsTable = response[pos].ToObject<IEnumerable<ColumnDefinition>>();
                    FormDefinition formDefinition = new FormDefinition(defaultValueTable, controlsTable);
                    if (_dataTable.SelectToken("Setting") != null)
                    {
                        formDefinition.GroupSetting = JsonConvert.DeserializeObject<GroupSettingFormDefinition>((((Newtonsoft.Json.Linq.JValue)_dataTable.SelectToken("Setting")).Value).ToString().Replace("[", "").Replace("]", ""));
                    }
                    FormGroupDefinitionV2 formGroup = new FormGroupDefinitionV2();
                    formGroup.FormDefinitions.Add(formDefinition);
                    var formDefinitions = new List<AbstractGroupControlDefinitionViewModel>();
                    var groupOfForm = formGroup.FormDefinitions
                                   .Select(form => form.ParseViewModel())
                                   .GroupBy(form => form.GroupSetting?.GroupId)
                                   .Select(g => new GroupOfFormModel
                                   {
                                       GroupId = g.Key,
                                       Forms = g.ToList()
                                   });
                    foreach (var group in groupOfForm)
                    {
                        formDefinitions.AddRange(group.Forms);
                    }
                    try
                    {
                        if (response[indexDatatable].HasValues)
                        {
                            var callSpDef = response[indexDatatable].ToObject<IEnumerable<CallSpDefinition>>().FirstOrDefault();
                            formGroup.MethodName = callSpDef?.CallSp ?? "";
                            formGroup.Object = callSpDef?.Object ?? "";
                        }
                    }
                    catch (Exception e)
                    {
                        formGroup.MethodName = "";
                        formGroup.Object = "";
                    }
                    
                    FormGroupDefinitionV2ViewModel dynamicForm = new FormGroupDefinitionV2ViewModel();
                    dynamicForm.FormDefinitions = formDefinitions;
                    dynamicForm.MethodName = formGroup.MethodName;
                    dynamicForm.Object = formGroup.Object;
                    dm.Data = dynamicForm;
                    dm.TypeDataSet = "DynamicForm";
                    return dm;
                }
                indexDatatable++;
            }

            return dm;
        }

    }
}
