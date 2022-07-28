using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using DMS.Models.DMS;
using Newtonsoft.Json.Linq;
using DMS.Models.DMS.ViewModels;
using Newtonsoft.Json;
using Microsoft.Extensions.Caching.Memory;
using System.Linq;
using Hangfire;
using DMS.Utils.RestServiceHelper;
using DMS.Constants;
using System;
using AutoMapper;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Business
{
    public partial class ContactBusiness : BaseBusiness, IContactBusiness
    {
        private readonly IContactService _contactService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly IMapper _mapper;

        public ContactBusiness(
            IHttpContextAccessor context,
            IContactService contactService,
            IElasticSearchSyncBusiness elasticSearchSyncBusiness,
            IMapper mapper
            ) : base(context)
        {
            _contactService = contactService;
            _elasticSearchSync = elasticSearchSyncBusiness;
            _mapper = mapper;
        }

        public async Task<IEnumerable<object>> GetDocumentCommunication(DocumentCommunicationQueryModel model)
        {
            GetCommunicationData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetCommunicationData)) as GetCommunicationData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;

            var result = await _contactService.GetDocumentCommunication(data);
            return result;
        }

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfContact(DocumentContactQueryModel model)
        {
            GetContactData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetContactData)) as GetContactData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.Object = model.Object;

            var result = await _contactService.GetDataSettingColumnsOfContact(data);
            if (!result.Any() || result.Count() <= 1) return null;
            return result.Select(column => new DocumentColumnSettingViewModel
            {
                ColumnName = column.ColumnName,
                OriginalColumnName = column.OriginalColumnName,
                DataType = column.DataType,
                DataLength = column.DataLength,
                Value = column.Value,
                Setting = new ColumnDefinitionSetting
                {
                    DisplayField = column.Setting.FirstOrDefault()?.DisplayField?.DisplayField,
                    ControlType = column.Setting.FirstOrDefault()?.ControlType?.ControlType,
                    CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                    Validators = column.Setting.FirstOrDefault()?.Validators?.Validators,
                }
            });
        }

        public async Task<object> UpdateContact(ContactDetailModel model)
        {
            //if (string.IsNullOrEmpty(model.B00Person_IdPerson))
            //{
            //    return CRUDContact(model);
            //}
            var contact = (await GetContactDocumentDetail(Int32.Parse(model.B00Person_IdPerson), ""));
            if (contact.Count() <= 0)
            {
                return null;
            }

            foreach (var item in contact)
            {
                switch (item.OriginalColumnName)
                {
                    case "B00SharingCompany_IdSharingCompany":
                        model.B00SharingCompany_IdSharingCompany = item.Value; break;
                    case "B00SharingName_IdSharingName":
                        model.B00SharingName_IdSharingName = item.Value; break;
                    case "B00SharingAddress_IdSharingAddress":
                        model.B00SharingAddress_IdSharingAddress = item.Value; break;
                    case "B00PersonInterface_IdPersonInterface":
                        model.B00PersonInterface_IdPersonInterface = item.Value; break;
                    case "B00SharingCommunication_TelOfficeIdSharingCommunication":
                        model.B00SharingCommunication_TelOfficeIdSharingCommunication = item.Value; break;
                    default:
                        break;
                }
            }

            SaveContactData data = ServiceDataRequest.ConvertToRelatedType(typeof(SaveContactData)) as SaveContactData;
            data.IdLogin = UserFromService.IdLogin;
            data.IdApplicationOwner = UserFromService.IdApplicationOwner;
            data.LoginLanguage = UserFromService.IdRepLanguage;
            data.IdPerson = model.B00Person_IdPerson;

            //for call 2 function transform
            model.IdPerson = model.B00Person_IdPerson;
            var personContactModel = _mapper.Map<PersonContactFormModel>(model);

            data.JSONPersonData = JsonConvert.SerializeObject(_contactService.TransformPersonContactModelToParametersStored(personContactModel));
            data.JSONPersonComms = JsonConvert.SerializeObject(_contactService.TransformPersonContactCommunicationModelToParametersStored(personContactModel));

            var saveResult = await _contactService.SaveContact(data) ?? new WSEditReturn();

            if (saveResult.IsSuccess)
            {
                await SyncDocumentContactByIdPerson(model.B00Person_IdPerson);
            }
            return saveResult;
        }

        public async Task<object> CRUDContact(ContactDetailModel contactDetail)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            SaveNewContactData saveData = new SaveNewContactData
            {
                BaseData = baseData,
                IgnoredKeys = new List<string>() { "CrudType" }
            };

            saveData.Data = new Dictionary<string, object>();

            SaveNewContactData model = new SaveNewContactData();
            model.PersonBeneficiary = JsonConvert.DeserializeObject<PersonContactFormModel>(JsonConvert.SerializeObject(contactDetail));

            if (model.PersonBeneficiary == null)
            {
                throw new Exception("Cannot dectect data PersonContact.");
            }

            var rsCreate = await _contactService.CreateContact(model, saveData);

            if (rsCreate == null || string.IsNullOrWhiteSpace(rsCreate.JsonReturnIds)
                    || rsCreate.EventType == null || !"Successfully".Contains(rsCreate.EventType))
            {
                return new WSEditReturn
                {
                    ReturnID = "-1",
                    EventType = null,
                };
            }

            SaveDocumentResultModel jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(rsCreate.JsonReturnIds);

            await SyncDocumentContactByIdPersons(jsonResult.IdPersons);

            return rsCreate;
        }

        /// <summary>
        /// Sync multiple idPersons or one idPerson.
        /// If sync multiple then should pass a string as format "1, 2, 3,..."
        /// </summary>
        /// <param name="idPersons">idPerson key</param>
        /// <returns></returns>
        public async Task<ElasticSyncResultModel> SyncDocumentContactByIdPerson(string idPersons)
        {
            if (string.IsNullOrWhiteSpace(idPersons)) return null;
            var elSyncModel = new ElasticSyncModel
            {
                ModuleType = ModuleType.Contact,
                SearchIndexKey = ElasticSearchIndexName.Contact,
                KeyId = idPersons
            };

            return await _elasticSearchSync.SyncToElasticSearch(elSyncModel);
        }

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetMyContactDetail(int idPerson, int idPersonType)
        {
            string objMode = Enum.GetName(typeof(RepPersonTypeEnum), idPersonType);

            return await GetContactDocumentDetail(idPerson, objMode);
        }

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetContactDocumentDetail(int idPerson, string objectMode)
        {
            //if (idPerson <= 0) return null;

            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedContactDocumentDetail getData = new GetCapturedContactDocumentDetail
            {
                IdPerson = idPerson,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
                Object = objectMode
            };

            var result = await _contactService.GetCapturedContactDocumentDetail(getData);
            return result.Select(column => new DocumentColumnSettingViewModel
            {
                ColumnName = column.ColumnName,
                OriginalColumnName = column.OriginalColumnName,
                DataType = column.DataType,
                DataLength = column.DataLength,
                Value = column.Value,
                Setting = new ColumnDefinitionSetting
                {
                    DisplayField = column.Setting.FirstOrDefault()?.DisplayField?.DisplayField ?? new DisplayFieldSetting(true, true, 0, false, false, ""),
                    ControlType = column.Setting.FirstOrDefault()?.ControlType?.ControlType,
                    CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                    Validators = column.Setting.FirstOrDefault()?.Validators?.Validators,
                }
            }).ToList();
        }

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsContactOfDocumentType(string documentType)
        {
            IDictionary<string, string> objectModes = null;
            switch (documentType.ToLower())
            {
                case "invoice":
                    objectModes = new Dictionary<string, string>
                    {
                        {  PersonContactObjectMode.BENEFICIARY_CONTACT, PersonContactObjectMode.BENEFICIARY_CONTACT_SUFFIX },
                        {  PersonContactObjectMode.REMITTER_CONTACT, PersonContactObjectMode.REMITTER_CONTACT_SUFFIX }
                    };
                    break;

                case "contract":
                    objectModes = new Dictionary<string, string>
                    {
                        {  PersonContactObjectMode.CONTRACTOR_CONTACT, PersonContactObjectMode.CONTRACTOR_CONTACT_SUFFIX },
                        {  PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT, PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT_SUFFIX }
                    };
                    break;

                case "otherdocuments":
                    objectModes = new Dictionary<string, string>
                    {
                        {  PersonContactObjectMode.CONTACT, PersonContactObjectMode.CONTACT_SUFFIX },
                        {  PersonContactObjectMode.PRIVATE_CONTACT, PersonContactObjectMode.PRIVATE_CONTACT_SUFFIX }
                    };
                    break;

                default:
                    return null;
            }

            IDictionary<string, Task<IEnumerable<ColumnDefinition>>> dicTasks = new Dictionary<string, Task<IEnumerable<ColumnDefinition>>>();
            List<DocumentColumnSettingViewModel> columns = new List<DocumentColumnSettingViewModel>();

            foreach (var objectMode in objectModes)
            {
                GetContactData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetContactData)) as GetContactData;
                data.IdLogin = this.UserFromService.IdLogin;
                data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
                data.LoginLanguage = this.UserFromService.IdRepLanguage;
                data.Object = objectMode.Key;

                dicTasks.Add(objectMode.Value, _contactService.GetDataSettingColumnsOfContact(data));
            }

            var results = await Task.WhenAll(dicTasks.Values);

            foreach (var dicKey in dicTasks)
            {
                var result = await dicKey.Value;
                if (!result.Any() || result.Count() <= 1) return null;
                var contactColumns = result.Select(column => new DocumentColumnSettingViewModel
                {
                    ColumnName = column.ColumnName,
                    Value = column.Value,
                    DataType = column.DataType,
                    DataLength = column.DataLength,
                    OriginalColumnName = column.OriginalColumnName + dicKey.Key,
                    Setting = new ColumnDefinitionSetting
                    {
                        DisplayField = column.Setting.FirstOrDefault()?.DisplayField?.DisplayField,
                        ControlType = column.Setting.FirstOrDefault()?.ControlType?.ControlType,
                        CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                        Validators = column.Setting.FirstOrDefault()?.Validators?.Validators,
                    }
                }).ToArray();
                columns.AddRange(contactColumns);
            }

            return columns;
        }

        public async Task SyncDocumentContactByIdPersons(IEnumerable<IdPersonResult> idPersonResults)
        {
            if (!idPersonResults.Any()) return;

            var idPersonsList = idPersonResults.Where(idPerson => idPerson.IdPerson != null)
                                               .Select(idPerson => idPerson.IdPerson.Value.ToString());

            await SyncDocumentContactByIdPerson(string.Join(", ", idPersonsList));
        }

        public void SetIdsForPersonContactToUpdate(PersonContactModel person, IEnumerable<DocumentColumnSettingViewModel> dataColumns)
        {
            if (person == null || dataColumns == null || !dataColumns.Any()) return;

            string value;

            foreach (var column in dataColumns)
            {
                value = string.IsNullOrEmpty(column.Value) ? null : column.Value;
                switch (column.OriginalColumnName)
                {
                    case nameof(B00Person) + "_" + nameof(B00Person.IdPerson):
                        person.IdPerson = value;
                        break;

                    case nameof(B07MainDocumentPerson) + "_" + nameof(B07MainDocumentPerson.IdMainDocumentPerson):
                        person.IdMainDocumentPerson = value;
                        break;

                    case nameof(PersonContactModel.B00PersonTypeGw_IdPersonTypeGw):
                        person.B00PersonTypeGw_IdPersonTypeGw = value;
                        break;

                    case nameof(PersonContactModel.B00PersonMasterData_IdPersonMasterData):
                        person.B00PersonMasterData_IdPersonMasterData = value;
                        break;

                    case nameof(PersonContactModel.B00SharingCommunication_TelOfficeIdSharingCommunication):
                        person.B00SharingCommunication_TelOfficeIdSharingCommunication = value;
                        break;

                    case nameof(PersonContactModel.B00SharingCommunication_EmailIdSharingCommunication):
                        person.B00SharingCommunication_EmailIdSharingCommunication = value;
                        break;

                    case nameof(PersonContactModel.B00SharingCommunication_InternetIdSharingCommunication):
                        person.B00SharingCommunication_InternetIdSharingCommunication = value;
                        break;

                    case nameof(PersonContactModel.B00PersonInterface_IdPersonInterface):
                        person.B00PersonInterface_IdPersonInterface = value;
                        break;

                    case nameof(PersonContactModel.B00SharingName_IdSharingName):
                        person.B00SharingName_IdSharingName = value;
                        break;

                    case nameof(PersonContactModel.B00SharingAddress_IdSharingAddress):
                        person.B00SharingAddress_IdSharingAddress = value;
                        break;

                    case nameof(PersonContactModel.B00SharingCompany_IdSharingCompany):
                        person.B00SharingCompany_IdSharingCompany = value;
                        break;

                    default:
                        break;
                }
            }
        }

        public async Task<IEnumerable<SharingContactInformationViewModel>> CheckAndGetCompanyList(string companyName, string personNr, string idLogin, string idApplicationOwner)
        {
            GetSharingContactInformationData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetSharingContactInformationData)) as GetSharingContactInformationData;

            data.Company = companyName;
            data.PersonNr = personNr;
            if (!string.IsNullOrEmpty(idLogin) && !string.IsNullOrEmpty(idApplicationOwner)) {
                /* for case call update from DocumentProcessing Service */
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
            }

            var sharingContactInfoList = await _contactService.GetSharingContactInformation(data);
            var companyInfoList = new List<SharingContactInformationViewModel>();
            if (sharingContactInfoList == null || !sharingContactInfoList.Any())
            {
                return companyInfoList;
            }
            foreach (var sharingContact in sharingContactInfoList)
            {
                companyInfoList.Add(new SharingContactInformationViewModel
                {
                    PersonNr = sharingContact.PersonNr,
                    B00SharingAddress_Place = sharingContact.Place,
                    B00SharingAddress_Street = sharingContact.Street,
                    B00SharingAddress_Zip = sharingContact.Zip,
                    B00SharingCommunication_TelOffice = sharingContact.TelOffice,
                    B00SharingCompany_Company = sharingContact.Company,
                    B00SharingName_FirstName = sharingContact.FirstName,
                    B00SharingName_LastName = sharingContact.LastName,

                    IdPerson = sharingContact.IdPerson,
                    IdPersonTypeGw = sharingContact.IdPersonTypeGw,
                    IdSharingName = sharingContact.IdSharingName,
                    IdSharingAddress = sharingContact.IdSharingAddress,
                    IdSharingCompany = sharingContact.IdSharingCompany,
                    IdPersonInterface = sharingContact.IdPersonInterface,
                    IdPersonMasterData = sharingContact.IdPersonMasterData,
                    TelOffice_IdSharingCommunication = sharingContact.TelOffice_IdSharingCommunication,
                });
            }
            return companyInfoList;
        }

    }
}
