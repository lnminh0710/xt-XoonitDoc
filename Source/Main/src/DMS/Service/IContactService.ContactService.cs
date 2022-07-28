using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;
using DMS.Constants;
using DMS.Models.DMS.DTO.B00Sharing;
using DMS.Utils.RestServiceHelper;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Service
{
    public partial class ContactService : BaseUniqueServiceRequest, IContactService
    {
        public ContactService(IOptions<AppSettings> appSettings,
                                 IHttpContextAccessor httpContextAccessor,
                                 IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        public async Task<IEnumerable<object>> GetDocumentCommunication(GetCommunicationData data)
        {
            data.MethodName = "SpAppWg002GetGridCommunication";
            data.Mode = "BillingAndDelivery";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IEnumerable<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        public async Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfContact(GetContactData data)
        {
            data.MethodName = "SpAppWg001Person";

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
        public async Task<WSEditReturn> SaveContact(SaveContactData data)
        {
            data.MethodName = "SpCallPerson";
            data.CallAppModus = "0";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<IEnumerable<ColumnDefinition>> GetCapturedContactDocumentDetail(GetCapturedContactDocumentDetail getData)
        {
            getData.MethodName = "SpAppWg001Person";
            //getData.Object = getData.Object;
            getData.Object = "Contact";

            BodyRequest bodyRequest = CreateBodyRequest(getData);
            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRequest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 2)
            {
                return new List<ColumnDefinition>();
            }

            var columnSettings = response[1].ToObject<IEnumerable<ColumnDefinition>>();
            return columnSettings;
        }

        public JObject TransformPersonContactModelToParametersStored(PersonContactModel person, PersonContactModel sharingContact = null)
        {
            if (person == null) return null;

            if (sharingContact != null)
            {
                person.IdPerson = sharingContact.IdPerson;
                person.B00PersonTypeGw_IdPersonTypeGw = sharingContact.B00PersonTypeGw_IdPersonTypeGw;
                person.B00SharingName_IdSharingName = sharingContact.B00SharingName_IdSharingName;
                person.B00SharingAddress_IdSharingAddress = sharingContact.B00SharingAddress_IdSharingAddress;
                person.B00SharingCompany_IdSharingCompany = sharingContact.B00SharingCompany_IdSharingCompany;
                person.B00PersonInterface_IdPersonInterface = sharingContact.B00PersonInterface_IdPersonInterface;
                person.B00PersonMasterData_IdPersonMasterData = sharingContact.B00PersonMasterData_IdPersonMasterData;
                person.PersonNr = sharingContact.PersonNr;
            }

            // FIX in case user don't input CompanyName && **NOT HAS IdSharingCompany** => it will be empty string but cause error underlying database
            // so if CompanyName is empty string then set it to null
            if (string.IsNullOrWhiteSpace(person.B00SharingCompany_IdSharingCompany) && string.IsNullOrWhiteSpace(person.B00SharingCompany_Company))
            {
                person.B00SharingCompany_Company = null;
            }

            JObject jPerson = new JObject();
            object value = null;

            foreach (var property in person.GetType().GetProperties())
            {
                value = property.GetValue(person);
                if (value == null) continue;

                jPerson.Add(property.Name, new JValue(value.ToString()));
            }

            if (jPerson.ContainsKey("IdPerson"))
            {
                var idPerson = jPerson.GetValue("IdPerson").Value<string>();
                jPerson.Remove("IdPerson");
                jPerson.Add("B00Person_IdPerson", new JValue(idPerson));
            }
            jPerson.Add("B00Person_IsMatch", new JValue("0"));
            jPerson.Add("B00Person_IsActive", new JValue("1"));
            jPerson.Add("B00PersonTypeGw_IsShortCut", new JValue("0"));
            jPerson.Add("B00PersonTypeGw_IsBlocked", new JValue("0"));
            jPerson.Add("B00PersonInterface_IdRepAddressType", new JValue("1"));
            jPerson.Add("B00PersonInterface_IsMainRecord", new JValue("1"));
            jPerson.Add("B00PersonMasterData_IsActive", new JValue("1"));
            jPerson.Add("B00PersonStatus_IsActive", new JValue("1"));
            jPerson.Add("B00SharingName_IdRepTitle", new JValue("1"));
            jPerson.Add("B00SharingAddress_IdRepLanguage", new JValue("1"));
            jPerson.Add("B00SharingAddress_IdRepIsoCountryCode", new JValue("204"));
            jPerson.Add("B00SharingAddress_IdRepPoBox", new JValue("1"));

            return new JObject
            (
                new JProperty("CustomerData", new JArray(jPerson))
            );
        }

        public JObject TransformPersonContactCommunicationModelToParametersStored(PersonContactModel person, PersonContactModel sharingContact = null)
        {
            if (person == null) return null;

            JArray jCommunications = new JArray();
            JObject jCommunication = null;

            if (sharingContact != null)
            {
                person.B00SharingCommunication_TelOfficeIdSharingCommunication = sharingContact.B00SharingCommunication_TelOfficeIdSharingCommunication;
            }

            if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_TelOffice) || person.B00SharingCommunication_TelOfficeIdSharingCommunication != null)
            {
                jCommunication = new JObject();

                if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_TelOfficeIdSharingCommunication))
                {
                    jCommunication.Add(nameof(B00SharingCommunication.IdSharingCommunication), new JValue(person.B00SharingCommunication_TelOfficeIdSharingCommunication));
                    person.B00SharingCommunication_TelOffice = person.B00SharingCommunication_TelOffice == null ? "" : person.B00SharingCommunication_TelOffice;
                }
                jCommunication.Add(nameof(B00SharingCommunication.IdRepCommunicationType), new JValue(RepCommunicationTypeEnum.Phone));
                jCommunication.Add(nameof(B00SharingCommunication.CommValue1), new JValue(person.B00SharingCommunication_TelOffice));

                jCommunications.Add(jCommunication);
            }

            if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_Email) || person.B00SharingCommunication_EmailIdSharingCommunication != null)
            {
                jCommunication = new JObject();

                if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_EmailIdSharingCommunication))
                {
                    jCommunication.Add(nameof(B00SharingCommunication.IdSharingCommunication), new JValue(person.B00SharingCommunication_EmailIdSharingCommunication));
                    person.B00SharingCommunication_Email = person.B00SharingCommunication_Email == null ? "" : person.B00SharingCommunication_Email;
                }
                jCommunication.Add(nameof(B00SharingCommunication.IdRepCommunicationType), new JValue(RepCommunicationTypeEnum.Emails));
                jCommunication.Add(nameof(B00SharingCommunication.CommValue1), new JValue(person.B00SharingCommunication_Email));

                jCommunications.Add(jCommunication);
            }

            if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_Internet) || person.B00SharingCommunication_InternetIdSharingCommunication != null)
            {
                jCommunication = new JObject();

                if (!string.IsNullOrWhiteSpace(person.B00SharingCommunication_InternetIdSharingCommunication))
                {
                    jCommunication.Add(nameof(B00SharingCommunication.IdSharingCommunication), new JValue(person.B00SharingCommunication_InternetIdSharingCommunication));
                    person.B00SharingCommunication_Internet = person.B00SharingCommunication_Internet == null ? "" : person.B00SharingCommunication_Internet;
                }
                jCommunication.Add(nameof(B00SharingCommunication.IdRepCommunicationType), new JValue(RepCommunicationTypeEnum.Internet));
                jCommunication.Add(nameof(B00SharingCommunication.CommValue1), new JValue(person.B00SharingCommunication_Internet));

                jCommunications.Add(jCommunication);
            }

            if (!jCommunications.HasValues || jCommunications.Count <= 0)
            {
                return null;
            } 

            return new JObject
            (
                new JProperty("Communications", jCommunications)
            );
        }

        public async Task<IEnumerable<SharingContactInformationDto>> GetSharingContactInformation(GetSharingContactInformationData data)
        {
            data.MethodName = "SpGetPerson";
            data.Object = "GetCompany";

            var expandData = Common.ToDictionary(data);

            BodyRequest bodyRequest = CreateBodyRequestObject(expandData);
            var response = await Execute(() => Service.ExecutePost<IEnumerable<SharingContactInformationDto>>(bodyRequest, Constants.EExecuteMappingType.Normal));
            return response;
        }

        public async Task<WSEditReturn> CreateContact(SaveNewContactData model, SaveNewContactData saveData)
        {
            saveData.BaseData.MethodName = "SpCallInvoice";
            saveData.BaseData.Object = "Contact";

            var expandData = Common.ToDictionary(saveData.BaseData);

            SetParametersToContactData(model, saveData);

            foreach (KeyValuePair<string, object> entry in saveData.Data)
            {
                if (saveData.IgnoredKeys.Contains(entry.Key)) continue;

                var key = "JSON" + entry.Key;
                expandData[key] = entry.Value == null ? null : JsonConvert.SerializeObject(entry.Value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            }
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }
        private void SetParametersToContactData(SaveNewContactData model, SaveNewContactData saveData)
        {
            // data person Beneficiary            
            var personBeneficiaryData = TransformPersonContactModelToParametersStored(model.PersonBeneficiary, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonBeneficiary), personBeneficiaryData);

            // data person Beneficiary Communication
            var personBeneficiaryComm = TransformPersonContactCommunicationModelToParametersStored(model.PersonBeneficiary, saveData.SharingContact);
            saveData.Data.Add(nameof(model.PersonBeneficiaryComm), personBeneficiaryComm);

        }
    }
}
