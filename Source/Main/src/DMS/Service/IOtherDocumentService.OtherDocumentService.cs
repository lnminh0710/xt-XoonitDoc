using DMS.Models;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
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
    public class OtherDocumentService : BaseUniqueServiceRequest, IOtherDocumentService
    {
        private readonly IContactService _contactService;
        private readonly IDynamicFieldService _dynamicFieldService;
        private readonly IDocumentService _documentService;
        private readonly AppSettings _appSettings;

        public OtherDocumentService(
            IOptions<AppSettings> appSettings
            , IHttpContextAccessor httpContextAccessor
            , IAppServerSetting appServerSetting
            , IContactService contactService
            , IDynamicFieldService dynamicFieldService
            , IDocumentService documentService
            ) : base(appSettings, httpContextAccessor, appServerSetting)
        {
            _contactService = contactService;
            _dynamicFieldService = dynamicFieldService;
            _documentService = documentService;
            _appSettings = appSettings.Value;
        }

        public async Task<WSEditReturn> SaveOtherDocument(SaveOtherDocumentData saveData, SaveOtherDocumentModel model)
        {
            saveData.BaseData.MethodName = "SpCallOtherDocuments";
            saveData.BaseData.Object = "OtherDocuments";
            var expandData = Common.ToDictionary(saveData.BaseData);

            if (_appSettings.EnableCloud)
            {
                if (saveData.IdCloudConnection == null || string.IsNullOrWhiteSpace(saveData.IdCloudConnection))
                {

                    return new WSEditReturn
                    {
                        ReturnID = "-1",
                        EventType = null,
                        SQLStoredMessage = "User need to active at least one cloud"
                    };
                }
            }
            

            SetParametersToOtherDocumentsData(saveData, model);

            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;
                var key = "JSON" + entry.Key;
                expandData[key] = entry.Value == null ? null : JsonConvert.SerializeObject(entry.Value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            }
            expandData[nameof(model.JSONMainDocumentNotes)] = model.JSONMainDocumentNotes == null ? null : JsonConvert.SerializeObject(model.JSONMainDocumentNotes, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<IEnumerable<ColumnDefinition>> GetCapturedOtherDocumentDetail(GetCapturedOtherDocumentDetailData getData, string addOnFields)
        {
            getData.MethodName = "SpAppWg001OtherDocuments";
            getData.Object = "OtherDocuments";
            if(!string.IsNullOrEmpty(addOnFields))
            {
                getData.Object = addOnFields;
            }            

            BodyRequest bodyRequest = CreateBodyRequest(getData);
            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRequest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 2)
            {
                return new List<ColumnDefinition>();
            }

            var columnSettings = response[1].ToObject<IEnumerable<ColumnDefinition>>();
            return columnSettings;
        }

        private void SetParametersToOtherDocumentsData(SaveOtherDocumentData saveData, SaveOtherDocumentModel model)
        {
            // data Other document
            var othereDocumentsData = TransformModelToParametersStored(model.OtherDocuments);
            saveData.Data.Add(nameof(model.OtherDocuments), othereDocumentsData);

            // data Person Contact
            var personContactData = _contactService.TransformPersonContactModelToParametersStored(model.PersonContact, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonContact), personContactData);

            // data Person Contact Communication
            var personContactCommData = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonContact, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonContactComm), personContactCommData);

            // data Person Privat
            // var personPrivatData = _contactService.TransformPersonContactModelToParametersStored(model.PersonPrivat);
            // saveData.Data.Add(nameof(model.PersonPrivat), personPrivatData);

            // data Person Privat Communication
            // var personPrivatDataComm = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonPrivat);
            // saveData.Data.Add(nameof(model.PersonPrivatComm), personPrivatDataComm);

            // data dynamic fields
            var dynamicFieldsData = _dynamicFieldService.TransformDynamicFieldModelToParametersStored(model.DynamicFields);
            saveData.Data.Add(nameof(model.DynamicFields), dynamicFieldsData);

            // data Document Tree Media
            var documentTreeMediaData = _documentService.TransformDocumentTreeMediaModelToParametersStored(model.DocumentTreeMedia, saveData.IdCloudConnection);
            saveData.Data.Add(nameof(model.DocumentTreeMedia), documentTreeMediaData);

            // data main document
            var mainDocumentData = _documentService.TransformMainDocumentModelToParametersStored(model.MainDocument);
            saveData.Data.Add(nameof(model.MainDocument), mainDocumentData);

            // data change document identity
            var changeDocumentIdentity = _documentService.TransformFolderCapturedDocumentModelToParametersStored(model.ChangeDocumentIdentity);
            saveData.Data.Add(nameof(model.ChangeDocumentIdentity), changeDocumentIdentity);
        }

        private JObject TransformModelToParametersStored(OtherDocumentFormViewModel otherDocumnentModel)
        {
            if (otherDocumnentModel == null) return null;

            JObject jOtherDocument = new JObject();
            object value = null;

            foreach (var property in otherDocumnentModel.GetType().GetProperties())
            {
                value = property.GetValue(otherDocumnentModel);
                if (value == null || String.IsNullOrWhiteSpace(value.ToString())) continue;

                jOtherDocument.Add(property.Name, new JValue(value.ToString()));
            }

            jOtherDocument.Add("IsActive", new JValue("1"));
            jOtherDocument.Add("IsDeleted", new JValue("0"));

            return new JObject
            (
                new JProperty("OtherDocuments", new JArray(jOtherDocument))
            );
        }

        public async Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfOtherDocuments(Data data, string addOnFields)
        {
            data.MethodName = "SpAppWg001OtherDocuments";
            if (string.IsNullOrEmpty(addOnFields))
            {
                data.Object = "OtherDocuments";
            } else
            {
                data.Object = addOnFields;
            }

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRequest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRequest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 2)
            {
                return new List<ColumnDefinition>();
            }

            var columnSettings = response[1].ToObject<IEnumerable<ColumnDefinition>>();
            return columnSettings;
        }
    }
}
