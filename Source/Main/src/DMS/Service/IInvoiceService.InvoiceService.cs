using DMS.Models;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;
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
    public partial class InvoiceService : BaseUniqueServiceRequest, IInvoiceService
    {
        private readonly IContactService _contactService;
        private readonly IDynamicFieldService _dynamicFieldService;
        private readonly IDocumentService _documentService;
        private readonly AppSettings _appSettings;

        public InvoiceService(IOptions<AppSettings> appSettings,
                                 IHttpContextAccessor httpContextAccessor,
                                 IAppServerSetting appServerSetting,
                                 IContactService contactService,
                                 IDynamicFieldService dynamicFieldService,
                                 IDocumentService documentService
        ) : base(appSettings, httpContextAccessor, appServerSetting)
        {
            _contactService = contactService;
            _dynamicFieldService = dynamicFieldService;
            _documentService = documentService;
            _appSettings = appSettings.Value;
        }

        /// <summary>
        /// Get Document Invoice
        /// </summary>
        /// <param name="data">get invoice data model</param>
        /// <returns></returns>
        public async Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfInvoice(GetInvoiceData data, string addOnFields)
        {
            data.MethodName = "SpAppWg001Invoice";
            data.Object = "Invoice";
            if (!string.IsNullOrEmpty(addOnFields))
            {
                data.Object = "AddOnFields";
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

        public async Task<WSEditReturn> SaveInvoice(SaveInvoiceModel model, SaveInvoiceData saveData)
        {
            saveData.BaseData.MethodName = "SpCallInvoice";
            saveData.BaseData.Object = "Invoice";
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

            SetParametersToInvoiceData(model, saveData);

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

        public async Task<IEnumerable<ColumnDefinition>> GetCapturedInvoiceDocumentDetail(GetCapturedInvoiceDocumentDetailData getData, string addOnFields)
        {
            getData.MethodName = "SpAppWg001Invoice";
            getData.Object = "Invoice";
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
            return columnSettings;
        }

        private void SetParametersToInvoiceData(SaveInvoiceModel model, SaveInvoiceData saveData)
        {
            // data Invoice
            var invoiceData = TransformModelToParametersStored(model.Invoice);
            saveData.Data.Add(nameof(model.Invoice), invoiceData);

            // data Person Bank
            // var personBankData = _contactService.TransformPersonContactModelToParametersStored(model.PersonBank);
            // saveData.Data.Add(nameof(model.PersonBank), personBankData);

            // data Person Bank Communication
            // var personBankCommData = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonBank);
            // saveData.Data.Add(nameof(model.PersonBankComm), personBankCommData);

            // data person Beneficiary            
            var personBeneficiaryData = _contactService.TransformPersonContactModelToParametersStored(model.PersonBeneficiary, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonBeneficiary), personBeneficiaryData);

            // data person Beneficiary Communication
            var personBeneficiaryComm = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonBeneficiary, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonBeneficiaryComm), personBeneficiaryComm);

            // data person Remitter
            // var personRemitterData = _contactService.TransformPersonContactModelToParametersStored(model.PersonRemitter);
            // saveData.Data.Add(nameof(model.PersonRemitter), personRemitterData);

            // data person Remitter Communication
            // var personRemitterComm = _contactService.TransformPersonContactCommunicationModelToParametersStored(model.PersonRemitter);
            // saveData.Data.Add(nameof(model.PersonRemitterComm), personRemitterComm);

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

            saveData.Data.Add(nameof(model.TaxAmount), null);
        }

        private JObject TransformModelToParametersStored(InvoiceFormViewModel invoice)
        {
            if (invoice == null) return null;

            JObject jInvoice = new JObject();
            object value = null;

            foreach (var property in invoice.GetType().GetProperties())
            {
                value = property.GetValue(invoice);
                if (value == null || String.IsNullOrWhiteSpace(value.ToString())) continue;

                jInvoice.Add(property.Name, new JValue(value.ToString()));
            }

            jInvoice.Add("IdRepCurrencyCode", new JValue(invoice.Currency));
            jInvoice.Add("IsActive", new JValue("1"));
            jInvoice.Add("IsDeleted", new JValue("0"));

            return new JObject
            (
                new JProperty("Invoice", new JArray(jInvoice))
            );
        }


    }
}
