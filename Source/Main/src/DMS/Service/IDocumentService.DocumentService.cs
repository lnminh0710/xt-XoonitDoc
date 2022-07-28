using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.ServiceModels;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OrderProcessingPdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    /// <summary>
    /// DocumentService
    /// </summary>
    public class DocumentService : BaseUniqueServiceRequest, IDocumentService
    {
        public DocumentService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) {
            
        }

        /// <summary>
        /// SaveScanningDocument
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveScanningDocument(SavingScanningDocumentItemData data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.Object = "DocumentContainerScans";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// GetDocumentContainerPathSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<IList<DocumentContainerPathSetting>> GetDocumentContainerPathSetting(Data data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "DocumentContainerPathSetting";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<DocumentContainerPathSetting>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }


        /// <summary>
        /// GetDocumentContainerFilesType
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<IList<DocumentContainerFilesType>> GetDocumentContainerFilesType(Data data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "DocumentContainerPathSetting";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<DocumentContainerFilesType>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        /// <summary>
        /// GetCustomerAssignmentsDetail
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idPerson"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetCustomerAssignmentsDetail(Data data, int idPerson, int idOrderProcessing)
        {
            data.MethodName = "SpB05GetCustomerCollections";
            data.Object = "GetCustomerAssignmentsDetail";

            var expandData = Common.ToDictionary(data);
            expandData["IdPerson"] = idPerson;
            expandData["IdOrderProcessing"] = idOrderProcessing;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// Save Order, Invoice, Offer
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveOrderProcessing(SaveOrderProcessingData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = "SpB05CallOrderProcessing";
            data.Object = "SaveOrderProcessing";

            var expandData = Common.ToDictionary(data);

            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = "JSON" + entry.Key;
                expandData[key] = Common.CreateJsonText(entry.Key, entry.Value);
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// Get OrderProcessing For Generating Pdf
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType">999: All</param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<OrderProcessingPdfModel> GetOrderProcessingForGeneratingPdf(Data data, int idRepProcessingType, int idOrderProcessing, int? idOffer = null, int? idOrder = null, int? idInvoice = null)
        {
            data.MethodName = "SpB05GetOrderProcessing";
            data.Object = "GetGenPDF";

            var expandData = Common.ToDictionary(data);
            expandData["IdRepProcessingType"] = idRepProcessingType > 0 ? idRepProcessingType.ToString() : null;
            expandData["IdOrderProcessing"] = idOrderProcessing > 0 ? idOrderProcessing.ToString() : null;
            expandData["IdOffer"] = idOffer > 0 ? idOffer.ToString() : null;
            expandData["IdOrder"] = idOrder > 0 ? idOrder.ToString() : null;
            expandData["IdInvoice"] = idInvoice > 0 ? idInvoice.ToString() : null;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response != null && response.Count >= 4)
            {
                OrderProcessingPdfModel result = new OrderProcessingPdfModel();

                #region Parse Dynamic Values
                //JObject jObject = (JObject)response[1][0];
                //foreach (KeyValuePair<string, JToken> jToken in jObject)
                //{
                //    IDictionary<string, object> valueModel = new Dictionary<string, object>();

                //    JObject jObject2 = (JObject)JArray.Parse(jToken.Value + string.Empty)[0];
                //    foreach (KeyValuePair<string, JToken> jToken2 in jObject2)
                //    {
                //        valueModel[jToken2.Key] = jToken2.Value[0]["Value"];
                //    }
                //    result.OrderValues[jToken.Key] = valueModel;
                //}
                #endregion

                if (response[0].Count() > 0)
                {
                    result.Header = JsonConvert.DeserializeObject<OrderProcessingPdfHeader>(response[0][0] + string.Empty);
                }
                if (response[2].Count() > 0)
                {
                    result.Content = JsonConvert.DeserializeObject<OrderProcessingPdfContent>(response[2][0] + string.Empty);
                }
                result.Content.OrderDetails = JsonConvert.DeserializeObject<IList<OrderProcessingPdfOrderDetail>>(response[1] + string.Empty);
                result.Content.BuildData();

                if (response[3].Count() > 0)
                {
                    result.Footer = JsonConvert.DeserializeObject<OrderProcessingPdfFooter>(response[3][0] + string.Empty);
                }
                return result;
            }
            return null;
        }

        /// <summary>
        /// Save Order Processing Documents Link
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveOrderProcessingDocumentsLink(SaveOrderProcessingDocumentsLinkData saveData)
        {
            Data data = saveData.Data;
            data.MethodName = "SpB05CallOrderProcessing";
            data.Object = "OrderProcessingDocuments";

            var expandData = Common.ToDictionary(data);

            var key = "JSONOrderProcessingDocumentsLink";
            expandData[key] = Common.CreateJsonText("OrderProcessingDocumentsLink", saveData.Files);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// Get Data OrderProcessing By Id
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetDataOrderProcessingById(Data data, int idOrderProcessing)
        {
            data.MethodName = "SpB05GetOrderProcessing";
            data.Object = "GetDataOrderProcessingById";

            var expandData = Common.ToDictionary(data);
            expandData["IdOrderProcessing"] = idOrderProcessing;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<object>(bodyRquest, Constants.EExecuteMappingType.DataFormDetail));
            return response;
        }

        /// <summary>
        /// Get Order Processing Documents
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetOrderProcessingDocuments(Data data, int idRepProcessingType, int idOrderProcessing)
        {
            data.MethodName = "SpB05GetOrderProcessing";
            data.Object = "GetOrderProcessDocument";

            var expandData = Common.ToDictionary(data);
            expandData["idRepProcessingType"] = idRepProcessingType;
            expandData["idOrderProcessing"] = idOrderProcessing;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// GetOrderProcessingEmail
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idOrderProcessing"></param>
        /// <param name="perType"></param>
        /// <returns></returns>
        public async Task<object> GetOrderProcessingEmail(Data data, int idOrderProcessing, string perType = "1")
        {
            data.MethodName = "SpB05GetOrderProcessingEmail";
            data.Object = "OrderProcessingEmailLink";

            var expandData = Common.ToDictionary(data);
            expandData["idOrderProcessing"] = idOrderProcessing;
            expandData["perType"] = perType;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        /// <summary>
        /// Delete/ Cancel OP, Order, Invoice
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> DeleteCancelDocument(DeleteCancelDocumentData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = "SpB05CallOrderProcessing";
            data.Object = "DeleteCancelDocument";

            var expandData = Common.ToDictionary(data);

            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = "JSON" + entry.Key;
                expandData[key] = Common.CreateJsonText(entry.Key, entry.Value);
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<DocumentSummaryModel> GetDocumentSummary(Data data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetDocumentSummary";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<DocumentSummaryModel[]>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response.FirstOrDefault();
        }

        public async Task<IEnumerable<DocumentTreeModel>> GetDocumentTreeByUser(DocumentTreeGetData data)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = string.IsNullOrWhiteSpace(data.IdPerson) ? "GetDocumentTree" : "GetDocumentTreeByIdPerson";
            data.IsDisplayHiddenFieldWithMsg = "1";
            data.WidgetTitle = "New Title....";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<DocumentTreeModel>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, null, null, 1));
            return response;
        }

        public async Task<IEnumerable<FavouriteFolderModel>> GetFavouriteFolderByUser(DocumentTreeGetData data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetMyFavorites";
            data.IsDisplayHiddenFieldWithMsg = "1";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<FavouriteFolderModel>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, null, null, 1));
            return response;
        }

        /// <summary>
        /// Get Document Invoice Dynamic Combobox
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<IEnumerable<DocumentInvoiceDynamicComboboxModel>> GetDocumentInvoiceDynamicCombobox(DocumentInvoiceDynamicData data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetDynamicFieldsEntityName";
            data.LoginLanguage = data.LoginLanguage;
            data.IdDocumentTree = data.IdDocumentTree;

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<DocumentInvoiceDynamicComboboxModel>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response != null ? response.ToList() : new List<DocumentInvoiceDynamicComboboxModel>();
        }

        public async Task<IEnumerable<object>> GetExtractedDataFromOcr(ExtractedDataOcrData data)
        {
            data.MethodName = "SpAppB06DocumentTypeForm";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            return response.ToList();
        }

        public async Task<WSNewReturnValue> CreateFolder(DocumentTreeRootData data, DocumentTreeViewModel model)
        {
            data.MethodName = "SpCallDocumentTree";
            data.Object = "DocumentTree";
            data.CrudType = "Create";
            data.AppModus = "0";
            var JSONDocumentTree = TransformDataJsonDocumentTree(model);

            var expandData = Common.ToDictionary(data);
            expandData[nameof(JSONDocumentTree)] = JsonConvert.SerializeObject(JSONDocumentTree);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, "", "", 0));
            return response?.FirstOrDefault();
        }

        public async Task<object> CreateFolderFavourite(FavouriteFolderData data)
        {
            data.MethodName = "SpCallMyDMS";
            data.Object = "RepMyFavorites";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<object> AddContactToFavourite(FavouriteFolderData data)
        {
            data.MethodName = "SpCallMyDMS";
            data.Object = "MyFavorites";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }


        public async Task<WSEditReturn> UpdateFolder(DocumentTreeRootData data, UpdatedDocumentTreeViewModel model)
        {
            data.MethodName = "SpCallDocumentTree";
            data.Object = "DocumentTree";
            data.CrudType = "Update";
            data.AppModus = "0";
            model.IsDeleted = "0";
            var JSONDocumentTree = TransformDataJsonDocumentTree(model);

            var expandData = Common.ToDictionary(data);
            expandData[nameof(JSONDocumentTree)] = JsonConvert.SerializeObject(JSONDocumentTree);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, "", "", 0));
            return response?.FirstOrDefault();
        }

        public async Task<WSEditReturn> DeleteFolder(DocumentTreeRootData data, DocumentTreeViewModel model)
        {
            data.MethodName = "SpCallDocumentTree";
            data.Object = "DocumentTree";
            data.CrudType = "SoftDelete";
            data.AppModus = "0";

            model.IsDeleted = "1";
            model.IsActive = false;
            var JSONDocumentTree = TransformDataJsonDocumentTree(model);

            var expandData = Common.ToDictionary(data);
            expandData[nameof(JSONDocumentTree)] = JsonConvert.SerializeObject(JSONDocumentTree);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<IEnumerable<object>> GetAttachmentListByContact(AttachmentData data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetAttachementByIdPerson";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<AttachmentModel>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, null, null, 1));
            return response;
        }

        public JObject TransformMainDocumentModelToParametersStored(MainDocumentModel mainDocumentModel)
        {
            if (mainDocumentModel == null) return null;

            JObject jMainDocument = new JObject();

            if (mainDocumentModel.IdMainDocument != null && !string.IsNullOrWhiteSpace(mainDocumentModel.IdMainDocument))
            {
                jMainDocument.Add(nameof(MainDocumentModel.IdMainDocument), new JValue(mainDocumentModel.IdMainDocument));
            }

            if (mainDocumentModel.MainDocumentTree.IdDocumentTree != null && !string.IsNullOrWhiteSpace(mainDocumentModel.MainDocumentTree.IdDocumentTree))
            {
                jMainDocument.Add(nameof(MainDocumentModel.MainDocumentTree.IdDocumentTree), new JValue(mainDocumentModel.MainDocumentTree.IdDocumentTree));
            }

            if (mainDocumentModel.IdDocumentContainerScans != null && !string.IsNullOrWhiteSpace(mainDocumentModel.IdDocumentContainerScans))
            {
                jMainDocument.Add(nameof(MainDocumentModel.IdDocumentContainerScans), new JValue(mainDocumentModel.IdDocumentContainerScans));
            }

            if (mainDocumentModel.ToDoNotes != null && !string.IsNullOrWhiteSpace(mainDocumentModel.ToDoNotes))
            {
                jMainDocument.Add(nameof(MainDocumentModel.ToDoNotes), new JValue(mainDocumentModel.ToDoNotes));
            }

            jMainDocument.Add(nameof(MainDocumentModel.IsToDo), new JValue(mainDocumentModel.IsToDo));
            jMainDocument.Add(nameof(MainDocumentModel.SearchKeyWords), new JValue(mainDocumentModel.SearchKeyWords));
            jMainDocument.Add(nameof(MainDocumentModel.IsActive), new JValue("1"));

            return new JObject
            (
                new JProperty("MainDocument", new JArray(jMainDocument))
            );
        }

        public JObject TransformDocumentTreeMediaModelToParametersStored(DocumentTreeMediaModel documentTreeMediaModel, string idCloudConnection)
        {
            if (documentTreeMediaModel == null) return null;

            JObject jdocumentTreeMediaModel = new JObject();

            if (documentTreeMediaModel.IdDocumentTreeMedia != null && !string.IsNullOrWhiteSpace(documentTreeMediaModel.IdDocumentTreeMedia))
            {
                jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.IdDocumentTreeMedia), new JValue(documentTreeMediaModel.IdDocumentTreeMedia));
            }

            if (documentTreeMediaModel.IdDocumentTree != null && !string.IsNullOrWhiteSpace(documentTreeMediaModel.IdDocumentTree))
            {
                jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.IdDocumentTree), new JValue(documentTreeMediaModel.IdDocumentTree));
            }

            if (idCloudConnection != null && !string.IsNullOrWhiteSpace(idCloudConnection))
            {
                jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.IdCloudConnection), new JValue(idCloudConnection));
            }

            jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.CloudMediaPath), new JValue(documentTreeMediaModel.CloudMediaPath));
            jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.MediaName), new JValue(documentTreeMediaModel.MediaName));
            jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.IdRepTreeMediaType), new JValue("1"));
            jdocumentTreeMediaModel.Add(nameof(DocumentTreeMediaModel.IsActive), new JValue("1"));

            return new JObject
            (
                new JProperty("DocumentTreeMedia", new JArray(jdocumentTreeMediaModel))
            );
        }

        private JObject TransformDataJsonDocumentTree(DocumentTreeViewModel model)
        {
            if (model == null) return null;

            var jDocumentTree = new JObject();
            if (model.IdDocument != null && model.IdDocument.Value > 0)
            {
                jDocumentTree.Add(nameof(B07DocumentTree.IdDocumentTree), new JValue(model.IdDocument.Value.ToString()));
            }
            if (!string.IsNullOrEmpty(model.IdDocuments))
            {
                jDocumentTree.Add(nameof(B07DocumentTree.IdDocumentTree), new JValue(model.IdDocuments.ToString()));
            }

            if (model.IdDocumentParent != null && model.IdDocumentParent > 0)
            {
                jDocumentTree.Add(nameof(B07DocumentTree.IdDocumentTreeParent), new JValue(model.IdDocumentParent.Value.ToString()));
            }

            jDocumentTree.Add(nameof(B07DocumentTree.IdDocumentTreeRoot), new JValue("1")); // default 1 MyDM Documents in B07DocumentTreeRoot
            jDocumentTree.Add(nameof(B07DocumentTree.IdRepDocumentGuiType), new JValue(model.IdDocumentType.ToString()));
            jDocumentTree.Add(nameof(B07DocumentTree.GroupName), new JValue(model.Name));
            jDocumentTree.Add(nameof(B07DocumentTree.SortingIndex), new JValue(model.Order.ToString()));
            jDocumentTree.Add(nameof(B07DocumentTree.IconName), new JValue(model.Icon));
            jDocumentTree.Add(nameof(B07DocumentTree.IsReadOnly), new JValue(model.IsReadOnly));
            jDocumentTree.Add(nameof(B07DocumentTree.IsActive), new JValue(model.IsActive ? "1" : "0"));
            jDocumentTree.Add(nameof(B07DocumentTree.IsDeleted), new JValue(model.IsDeleted));
            jDocumentTree.Add("IdLogin", new JValue(model.IdLogin));

            return new JObject
            (
                new JProperty("DocumentTree", new JArray(jDocumentTree))
            );
        }

        public JObject TransformFolderCapturedDocumentModelToParametersStored(FolderCapturedDocumentModel model)
        {
            if (model == null) return null;

            var jFolderCapturedDocument = new JObject();
            jFolderCapturedDocument.Add(nameof(FolderCapturedDocumentModel.IdDocumentTree), new JValue(model.IdDocumentTree));
            jFolderCapturedDocument.Add(nameof(FolderCapturedDocumentModel.IdMainDocument), new JValue(model.IdMainDocument));

            return new JObject(
                new JProperty("NewDocumentIdentity", new JArray(jFolderCapturedDocument))
            );
        }

        public async Task<DocumentTreePathModel> GetTreePathOfDocument(PathTreeGetData data)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "getTreePath";

            //UniqueBody uniq = new UniqueBody
            //{
            //    ModuleName = "GlobalModule",
            //    ServiceName = "GlobalService",
            //    Data = JsonConvert.SerializeObject(data)
            //};
            //BodyRequest bodyRquest = new BodyRequest
            //{
            //    Request = uniq
            //};
            //var expectedReturn = new Dictionary<int, Type>();
            //expectedReturn.Add(1, typeof(DocumentTreePathModel));
            //var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: expectedReturn, mappingType: Constants.EExecuteMappingType.DynamicType4)))[1];
            //return response != null ? ((IList<DocumentTreePathModel>)response).FirstOrDefault() : null;

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    return JsonConvert.DeserializeObject<DocumentTreePathModel>(array[0].FirstOrDefault().ToString());

                }
            }
            return null;

            //var expandData = Common.ToDictionary(data);

            //BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            //var response = await Execute(() => Service.ExecutePost<DocumentTreePathModel>(bodyRquest, Constants.EExecuteMappingType.Normal, null, null, null, 1));
            //return response;
        }

        public async Task<FormGroupDefinition> GetFormColumnSettings(GetFormColumnSettingsData data)
        {
            FormGroupDefinition formGroup = new FormGroupDefinition();
            //const byte numberOfGroupTableForm = 2;

            data.MethodName = "SpB09GetDocumentData";
            data.Object = "GetMainForms";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));

            // make sure that 1 form group section must have 2 data table
            // the last datatable is for CallSP to save
            //if (response == null || response.Count % numberOfGroupTableForm != 1)
            //{
            //    return formGroup;
            //}

            FormDefinition formDefinition = null;
            ColumnDefaultValueDefinition defaultValueTable = null;
            IEnumerable<ColumnDefinition> controlsTable = null;
            byte indexDatatable = 0;

            while (indexDatatable < response.Count - 1)
            {
                defaultValueTable = response[indexDatatable++].ToObject<IEnumerable<ColumnDefaultValueDefinition>>().FirstOrDefault();
                controlsTable = response[indexDatatable++].ToObject<IEnumerable<ColumnDefinition>>();
                formDefinition = new FormDefinition(defaultValueTable, controlsTable);

                formGroup.FormDefinitions.Add(formDefinition);
            }

            // indexDatatable now is the last index
            //var callSpDef = response[indexDatatable].ToObject<IEnumerable<CallSpDefinition>>().FirstOrDefault();
            //formGroup.MethodName = callSpDef.CallSp;

            return formGroup;
        }

        public async Task<FormGroupDefinitionV2> GetFormGroupSettings(GetFormGroupSettingsData data)
        {
            FormGroupDefinitionV2 formGroup = new FormGroupDefinitionV2();
            //const byte numberOfGroupTableForm = 2;

            //data.MethodName = "SpB09GetDocumentData";
            //data.Object = "GetDynamicReportPage";
            //data.Mode = "ReportPage2";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));

            // make sure that 1 form group section must have 2 data table
            // the last datatable is for CallSP to save
            //if (response == null || response.Count % numberOfGroupTableForm != 1)
            if (response == null)
            {
                return formGroup;
            }

            // variables for form input
            FormDefinition formDefinition = null;
            ColumnDefaultValueDefinition defaultValueTable = null;
            IEnumerable<ColumnDefinition> controlsTable = null;

            // variables for form table
            TableCommonDefinition tableDefinition = null;
            IEnumerable<SettingColumnNameListWrapper> settingTableColumns = null;
            IEnumerable<object> dataTableSource = null;

            byte indexDatatable = 0;

            while (indexDatatable < response.Count - 1)
            {
                var _dataTable = response[indexDatatable].First();
                if (_dataTable == null)
                {
                    continue;
                }

                if (_dataTable.SelectToken("TitleFormSection") != null) // is Data Form Field
                {
                    defaultValueTable = response[indexDatatable++].ToObject<IEnumerable<ColumnDefaultValueDefinition>>().FirstOrDefault();
                    int pos = indexDatatable++;
                    if (response[pos] != null && response[pos].ToString().Contains("WidgetTitle"))
                    {
                        pos = indexDatatable++;
                    }

                    controlsTable = response[pos].ToObject<IEnumerable<ColumnDefinition>>();

                    formDefinition = new FormDefinition(defaultValueTable, controlsTable);

                    if(_dataTable.SelectToken("Setting") != null)
                    {
                        formDefinition.GroupSetting = JsonConvert.DeserializeObject<GroupSettingFormDefinition>((((Newtonsoft.Json.Linq.JValue)_dataTable.SelectToken("Setting")).Value).ToString().Replace("[", "").Replace("]", ""));
                    }
                    
                    formGroup.FormDefinitions.Add(formDefinition);

                    continue;
                }
                else if (_dataTable.SelectToken("SettingColumnName") != null) // is DataTable
                {
                    settingTableColumns = response[indexDatatable++].ToObject<IEnumerable<SettingColumnNameListWrapper>>();
                    dataTableSource = response[indexDatatable++].ToObject<IEnumerable<object>>();
                    tableDefinition = new TableCommonDefinition(dataTableSource, settingTableColumns);
                    formGroup.FormDefinitions.Add(tableDefinition);
                    continue;
                }

                indexDatatable++;
            }

            // indexDatatable now is the last index

            if (indexDatatable < response.Count && response[indexDatatable].HasValues)
            {
                try
                {
                    var callSpDef = response[indexDatatable].ToObject<IEnumerable<CallSpDefinition>>().FirstOrDefault();
                    formGroup.MethodName = callSpDef?.CallSp ?? "";
                    formGroup.Object = callSpDef?.Object ?? "";
                }
                catch (Exception)
                {
                    formGroup.MethodName = "";
                    formGroup.Object = "";
                }
            }

            return formGroup;
        }


        public async Task<WSEditReturn> SaveFormColumnSettings(SaveFormColumnSettingsData data)
        {
            BodyRequest bodyRquest = CreateBodyRequestObject(data.Data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }


        /// <summary>
        /// GetReportNotes
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        public async Task<object> GetReportNotes(Data data, int idMainDocument)
        {
            data.MethodName = "SpB09GetDocumentData";
            data.Object = "GetReportNotes";

            var expandData = Common.ToDictionary(data);
            expandData["IdMainDocument"] = idMainDocument;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));

            return response == null || !response.Any() ? null : response[0];
        }

        /// <summary>
        /// GetReportNotes
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        public async Task<JArray> GetReportNotesForOuput(Data data, int idMainDocument)
        {
            data.MethodName = "SpB09GetDocumentData";
            data.Object = "GetReportNotesForOutput";

            var expandData = Common.ToDictionary(data);
            expandData["IdMainDocument"] = idMainDocument;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));

            return response == null || !response.Any() ? null : response;
        }

        /// <summary>
        /// Save Dynamic Data
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveFormDynamicData(SaveDynamicData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = saveData.SpMethodName;
            data.Object = saveData.SpObject;

            if (string.IsNullOrEmpty(data.AppModus))
            {
                data.AppModus = "0";
            }

            var expandData = Common.ToDictionary(data);
            var types = new List<Type>() { typeof(object), typeof(Array), typeof(JObject), typeof(JArray) };
            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = entry.Key;
                if (entry.Value != null && !entry.Key.StartsWith("JSON") && types.Contains(entry.Value.GetType()))
                {
                    key = "JSON" + entry.Key;
                }
                expandData[key] = entry.Value + string.Empty;
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        /// <summary>
        /// SaveProcessingForm
        /// </summary>
        /// <param name="saveData"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveProcessingForm(SaveDynamicData saveData)
        {
            Data data = saveData.BaseData;
            data.MethodName = saveData.SpMethodName;
            data.Object = saveData.SpObject;

            var expandData = Common.ToDictionary(data);
            var types = new List<Type>() { typeof(object), typeof(Array), typeof(JObject), typeof(JArray) };
            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = entry.Key;
                var type = entry.Value.GetType();
                if (entry.Value != null && !entry.Key.StartsWith("JSON") && types.Contains(type))
                {
                    key = "JSON" + entry.Key;
                }
                expandData[key] = entry.Value + string.Empty;
            }

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<object> GetScannedPathOfDocument(Data data, string IdDocumentContainerScans)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "DocumentScannedPath";

            var expandData = Common.ToDictionary(data);
            expandData["IdDocumentContainerScans"] = IdDocumentContainerScans;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response != null && response.Count > 0 ? response[0] : null;
        }

        public async Task<object> GetDetailTreeNode(Data data, string nodeName)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetDetailTreeNode";

            var expandData = Common.ToDictionary(data);
            expandData["NodeName"] = nodeName;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return response != null && response.Count > 0 ? response[0] : null;
        }

        #region MyRegion
        public async Task<IEnumerable<object>> GetDocumentTreeIndexing(DocumentTreeGetData data)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetDocumentIndexTree";
            data.IsDisplayHiddenFieldWithMsg = "1";
            data.WidgetTitle = "New Title....";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<object>>(bodyRquest, Constants.EExecuteMappingType.None, null, null, null, 1));
            return response;
        }


        public async Task<WSNewReturnValue> CreateFolderIndexing(DocumentTreeRootData data, DocumentTreeViewModel model)
        {
            data.MethodName = "SpCallDocumentTree";
            data.Object = "DocumentTree";
            data.CrudType = "Create";
            data.AppModus = "0";
            var JSONDocumentTree = TransformDataJsonDocumentTree(model);

            var expandData = Common.ToDictionary(data);
            expandData[nameof(JSONDocumentTree)] = JsonConvert.SerializeObject(JSONDocumentTree);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<WSNewReturnValue>>(bodyRquest, Constants.EExecuteMappingType.Normal, null, "", "", 0));
            return response?.FirstOrDefault();
        }

        public async Task<List<DocumentTreeInfo>> GetDetailTreeNodeIndexing(Data data, string nodeName)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetDetailTreeNodeIndexing";

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
        public async Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfIndexing(Data data, string idDocumentTree)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetFolderFirstLevelOfIndexing";

            var expandData = Common.ToDictionary(data);
            expandData["IdDocumentTree"] = idDocumentTree;

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
        public async Task<List<DocumentIndexingInfo>> GetDocumentIndexing(Data data, string filePath, string fileName)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetDocumentContainerScans";
            var expandData = Common.ToDictionary(data);
            expandData["FilePath"] = filePath;
            expandData["FileName"] = fileName;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<DocumentIndexingInfo>>(rs);
                }
            }
            return null;
        }

        public async Task<WSEditReturn> DeleteDocumentIndexing(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpCallMyDMS";
            data.AppModus = "0";
            data.LoginLanguage = "3";

            data.Object = "DeleteDocumentIndexing";

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

        public async Task<WSEditReturn> UpdateDocumentIndexing(DocumentContainerScanCRUD data)
        {
            data.MethodName = "SpB06CallDocumentContainer";
            data.Object = "ChangeDocumentFileName";

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
        #endregion

        public async Task<object> GetTreePath(Data data, string idDocumentTree)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetTreePath";

            var expandData = Common.ToDictionary(data);
            expandData["IdDocumentTree"] = idDocumentTree;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<object>(rs);
                }
            }
            return null;
        }
        
        public async Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(Data data, string idDocumentTree)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetDocumentTreeByIdDocumentTree";
            var expandData = Common.ToDictionary(data);
            expandData["IdDocumentTree"] = idDocumentTree;

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

        #region Email Tree
        public async Task<IEnumerable<object>> GetDocumentTreeEmail(DocumentTreeGetData data)
        {
            data.MethodName = "SpB07AppDocumentTree";
            data.Object = "GetDocumentEmailTree";
            data.IsDisplayHiddenFieldWithMsg = "1";
            data.WidgetTitle = "New Title....";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<object>>(bodyRquest, Constants.EExecuteMappingType.None, null, null, null, 1));
            return response;
        }
        #endregion

        public async Task<object> GetImportFolderOfCompany(Data data, string idSharingCompany)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetImportFolderOfCompany";

            var expandData = Common.ToDictionary(data);
            expandData["IdSharingCompany"] = idSharingCompany;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];

            return response;

            //DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            //dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            //dynamicData.Data.Object = "GetImportFolderOfCompany";

            //dynamicData.AddParams(values);
            //var data = await _dynamicDataService.GetDynamicDataFormTable(dynamicData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
            //return data;
        }

        public async Task<List<DocumentIndexingInfo>> GetDocumentIndexingById(Data data, string idDocumentContainerScan)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetDocumentContainerScansById";
            var expandData = Common.ToDictionary(data);
            expandData["IdDocumentContainerScans"] = idDocumentContainerScan;

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = (await Execute(() => Service.Post(body: bodyRquest, expectedReturn: null, mappingType: Constants.EExecuteMappingType.None)))[0];
            if (response != null)
            {
                var array = (JArray)response;
                if (array.Count > 0)
                {
                    string rs = array[0].ToString();

                    return JsonConvert.DeserializeObject<List<DocumentIndexingInfo>>(rs);
                }
            }
            return null;
        }
    }
}
