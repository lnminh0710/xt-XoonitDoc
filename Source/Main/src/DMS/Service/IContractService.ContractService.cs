using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    public class ContractService : BaseUniqueServiceRequest, IContractService
    {
        private readonly IContactService _contactService;
        private readonly IDynamicFieldService _dynamicFieldService;
        private readonly IDocumentService _documentService;
        private readonly AppSettings _appSettings;

        public ContractService(
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

        public async Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfContract(GetContractData data, string addOnFields)
        {
            data.MethodName = "SpAppWg001Contract";
            data.Object = "Contract";
            if(!string.IsNullOrEmpty(addOnFields))
            {
                data.Object = addOnFields;
            }
            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 2)
            {
                return new List<ColumnDefinition>();
            }

            var columnSettings = response[1].ToObject<IEnumerable<ColumnDefinition>>();
            return columnSettings;
        }

        public async Task<WSEditReturn> SaveContract(SaveContractData saveData, SaveContractModel model)
        {
            saveData.BaseData.MethodName = "SpCallContract";
            saveData.BaseData.Object = "Contract";
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

            SetParametersToContractData(saveData, model);

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

        public async Task<IEnumerable<ColumnDefinition>> GetCapturedContractDocumentDetail(GetCapturedContractDocumentDetailData getData, string addOnFields)
        {
            getData.MethodName = "SpAppWg001Contract";
            getData.Object = "Contract";
            if (!string.IsNullOrEmpty(addOnFields))
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
            //if (columnSettings.Any(data =>
            //    data.ColumnName == nameof(B07MainDocument.IdMainDocument) && String.IsNullOrEmpty(data.Value) ||
            //    data.ColumnName == nameof(B07Contract.IdContract) && String.IsNullOrEmpty(data.Value)))
            //{
            //    return new List<ColumnDefinition>();
            //}
            return columnSettings;
        }

        private void SetParametersToContractData(SaveContractData saveData, SaveContractModel model)
        {
            // data Contract
            var contractData = TransformModelToParametersStored(model.Contract);
            saveData.Data.Add(nameof(model.Contract), contractData);

            // data Person Contractor
            // var personContractorData = _contactService.TransformPersonContactModelToParametersStored(model.PersonContractor);
            // saveData.Data.Add(nameof(model.PersonContractor), personContractorData);

            // data Person Contractor Communication
            // var personContractorCommData = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonContractor);
            // saveData.Data.Add(nameof(model.PersonContractorComm), personContractorCommData);

            // data Person Contracting Party
            var personContractingPartyData = _contactService.TransformPersonContactModelToParametersStored(model.PersonContractingParty, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonContractingParty), personContractingPartyData);

            // data Person Contracting Party Communication
            var personContractingPartyCommData = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonContractingParty, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonContractingPartyComm), personContractingPartyCommData);

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

        private JObject TransformModelToParametersStored(ContractFormViewModel contract)
        {
            if (contract == null) return null;

            JObject jContract = new JObject();
            object value = null;

            foreach (var property in contract.GetType().GetProperties())
            {
                value = property.GetValue(contract);
                if (value == null || String.IsNullOrWhiteSpace(value.ToString())) continue;

                jContract.Add(property.Name, new JValue(value.ToString()));
            }

            jContract.Add("IsActive", new JValue("1"));
            jContract.Add("IsDeleted", new JValue("0"));

            return new JObject
            (
                new JProperty("Contract", new JArray(jContract))
            );
        }
    }
}
