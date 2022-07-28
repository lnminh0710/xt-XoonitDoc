using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using Newtonsoft.Json;
using System.IO;
using System.Dynamic;
using Newtonsoft.Json.Linq;

namespace DMS.Business
{
    public class PersonBusiness : BaseBusiness, IPersonBusiness
    {
        private readonly IPersonService _personService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;
        private readonly IFileBusiness _fileBusiness;

        public PersonBusiness(IHttpContextAccessor context,
                              IPersonService customerService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness,
                              IFileBusiness fileBusiness) : base(context)
        {
            _personService = customerService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
            _fileBusiness = fileBusiness;
        }

        #region Customer
        public async Task<WSCustomerEditReturn> CreateCustomer(CustomerEditModel model)
        {
            CustomerUpdateData data = (CustomerUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(CustomerUpdateData));
            data = (CustomerUpdateData)Common.MappModelToData(data, model);
            if (model.Communications != null)
            {
                var communicationsValue = JsonConvert.SerializeObject(model.Communications);
                data.JSONText = string.Format(@"""Communications"":{0}", communicationsValue);
                data.JSONText = "{" + data.JSONText + "}";
            }
            var createData = (CustomerCreateData)data;
            var result = await _personService.CreateCustomer(createData, model.Communications != null ? model.Communications.Count : 0);
            return result;
        }

        public Task<WSReturn> DeleteCustomer(int idPerson)
        {
            throw new NotImplementedException();
        }

        public async Task<Customer> GetCustomer(int idPerson)
        {
            CustomerData data = (CustomerData)ServiceDataRequest.ConvertToRelatedType(typeof(CustomerData));
            data.B00Person_IdPerson = idPerson.ToString();
            var result = await _personService.GetCustomer(data);
            return result;
        }

        public async Task<object> PreLoadBusinessLogic(string mediaCode)
        {
            CustomData data = (CustomData)ServiceDataRequest.ConvertToRelatedType(typeof(CustomData));
            data.mediaCode = mediaCode;
            var result = await _personService.PreLoadBusinessLogic(data);
            return result;
        }

        public async Task<WSCustomerEditReturn> UpdateCustomer(string model)
        {
            CustomerUpdateData data = JsonConvert.DeserializeObject<CustomerUpdateData>(model);
            data.IdLogin = ServiceDataRequest.IdLogin;
            data.LoginLanguage = ServiceDataRequest.LoginLanguage;
            data.IdApplicationOwner = ServiceDataRequest.IdApplicationOwner;
            var result = await _personService.UpdateCustomer(data);
            return result;
        }

        #endregion

        #region Person
        public async Task<PersonModel> GetPerson(int? idPerson)
        {
            PersonData data = (PersonData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonData));
            data.IdPerson = idPerson.ToString();
            var result = await _personService.GetPerson(data);
            return result;
        }

        public async Task<WSCustomerEditReturn> CreatePerson(PersonEditModel model, string searchIndexKey)
        {
            PersonCreateData data = (PersonCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonCreateData));
            data = (PersonCreateData)Common.MappModelToData(data, model);
            return await SavingPersonAsync(model, searchIndexKey, data);
        }

        public async Task<WSCustomerEditReturn> UpdatePerson(PersonEditModel model, string searchIndexKey)
        {
            PersonUpdateData data = (PersonUpdateData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonUpdateData));
            data = (PersonUpdateData)Common.MappModelToData(data, model);
            return await SavingPersonAsync(model, searchIndexKey, data, "UPDATE");
        }

        private async Task<WSCustomerEditReturn> SavingPersonAsync(PersonEditModel model, string searchIndexKey, dynamic data, string crudType = "")
        {
            if (model.Communications != null && model.Communications.Count > 0)
            {
                var communicationsValue = JsonConvert.SerializeObject(model.Communications);
                data.JSONText = string.Format(@"""Communications"":{0}", communicationsValue);
                data.JSONText = "{" + data.JSONText + "}";
            }
            WSCustomerEditReturn result;
            if (crudType == "UPDATE")
            {
                result = await _personService.UpdatePerson(data);
            }
            else
            {
                result = await _personService.CreatePerson(data);
            }

            // IF save success , then sync to elastic search.
            if (result != null && !string.IsNullOrWhiteSpace(result.IdPerson) &&
                !string.IsNullOrWhiteSpace(searchIndexKey))
            {
                await _elasticSearchSyncBusiness.SyncToElasticSearch(new ElasticSyncModel
                {
                    KeyId = result.IdPerson,
                    SearchIndexKey = searchIndexKey
                });
            }
            return result;
        }

        public async Task<WSEditReturn> CreatePaymentAccount(PaymentEditModel model)
        {
            PaymentCreateData data = (PaymentCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(PaymentCreateData));
            data = (PaymentCreateData)Common.MappModelToData(data, model);
            int numIdentiferCodes = 0;
            if (model.IdentiferCodes != null)
            {
                var identiferCodeValue = JsonConvert.SerializeObject(model.IdentiferCodes);
                data.JSONText = string.Format(@"""CashProvider"":{0}", identiferCodeValue);
                data.JSONText = "{" + data.JSONText + "}";
                numIdentiferCodes = model.IdentiferCodes.Count;
            }
            var result = await _personService.CreatePaymentAccount(data, numIdentiferCodes);
            return result;
        }

        public async Task<object> LoadPaymentAccount(string idCashProviderPaymentTerms)
        {
            PaymentData data = (PaymentData)ServiceDataRequest.ConvertToRelatedType(typeof(PaymentData));
            data.IdCashProviderPaymentTerms = idCashProviderPaymentTerms;
            var result = await _personService.LoadPaymentAccount(data);
            return result;
        }

        public async Task<WSEditReturn> CreateCCPRN(CCPRNEditModel model)
        {
            CCPRNCreateData data = (CCPRNCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CCPRNCreateData));
            data = (CCPRNCreateData)Common.MappModelToData(data, model);
            int numCreditcardTypeContainer = 0;
            if (model.CashProviderContractCreditcardTypeContainer != null)
            {
                var identiferCodeValue = JsonConvert.SerializeObject(model.CashProviderContractCreditcardTypeContainer);
                data.JSONText = string.Format(@"""CashProviderContractCreditcardTypeContainer"":{0}", identiferCodeValue);
                data.JSONText = "{" + data.JSONText + "}";
                numCreditcardTypeContainer = model.CashProviderContractCreditcardTypeContainer.Count;
            }
            var result = await _personService.CreateCCPRN(data, numCreditcardTypeContainer);
            return result;
        }

        public async Task<object> LoadCCPRN(string idCashProviderContract)
        {
            CCPRNData data = (CCPRNData)ServiceDataRequest.ConvertToRelatedType(typeof(CCPRNData));
            data.IdCashProviderContract = idCashProviderContract;
            var result = await _personService.LoadCCPRN(data);
            return result;
        }

        public async Task<WSEditReturn> CreateCostProvider(CCPRNEditModel model)
        {
            CCPRNCreateData data = (CCPRNCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CCPRNCreateData));
            data = (CCPRNCreateData)Common.MappModelToData(data, model);
            int numCreditcardTypeContainer = 0;
            if (model.CashProviderContractCreditcardTypeContainer != null)
            {
                var creditcardTypeContainerValue = JsonConvert.SerializeObject(model.CashProviderContractCreditcardTypeContainer);
                data.JSONText = string.Format(@"""CashProviderContractCreditcardTypeContainer"":{0}", creditcardTypeContainerValue);
                data.JSONText = "{" + data.JSONText + "}";
                numCreditcardTypeContainer = model.CashProviderContractCreditcardTypeContainer.Count;
            }
            var result = await _personService.CreateCCPRN(data, numCreditcardTypeContainer);
            return result;
        }

        public async Task<WSEditReturn> CreateCostProvider(CostProviderEditModel model)
        {
            CostProviderCreateData data = (CostProviderCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(CostProviderCreateData));
            data = (CostProviderCreateData)Common.MappModelToData(data, model);
            int numCreditcardTypeContainer = 0;
            if (model.ProviderCostsItems != null)
            {
                var providerCostsItemValue = JsonConvert.SerializeObject(model.ProviderCostsItems);
                data.JSONText = string.Format(@"""ProviderCostsItems"":{0}", providerCostsItemValue);
                data.JSONText = "{" + data.JSONText + "}";
                numCreditcardTypeContainer = model.ProviderCostsItems.Count;
            }
            var result = await _personService.CreateCostProvider(data, numCreditcardTypeContainer);
            return result;
        }

        public async Task<object> LoadCommunication(int idPersonInterface)
        {
            PersonData data = (PersonData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonData));
            data.IdPersonInterface = idPersonInterface.ToString();
            var result = await _personService.LoadCommunication(data);
            return result;
        }

        public async Task<object> GetCustomerHistory(string idPerson, int? pageIndex, int? pageSize)
        {
            PersonData data = (PersonData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonData));
            data.IdPerson = idPerson;
            data.PageIndex = pageIndex;
            data.PageSize = pageSize;
            var result = await _personService.GetCustomerHistory(data);
            return result;
        }

        public async Task<object> GetMandatoryField(string mode)
        {
            PersonData data = (PersonData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonData));
            data.Mode = mode;
            var result = await _personService.GetMandatoryField(data);
            return result;
        }

        /// <summary>
        /// GetPersonData
        /// </summary>
        /// <param name="idPersons"></param>
        /// <returns></returns>
        public async Task<object> GetPersonData(string idPersons)
        {
            PersonData data = (PersonData)ServiceDataRequest.ConvertToRelatedType(typeof(PersonData));
            data.IdPerson = idPersons;
            var result = await _personService.GetPersonData(data);
            return result;
        }
        #endregion

        #region Save Customer
        public async Task<object> SaveCustomer(SaveCustomerModel model)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveCustomerData saveData = new SaveCustomerData
            {
                BaseData = baseData,
                Data = model.Data,
                IgnoredKeys = new List<string>() { "AvatarData" }
            };

            #region LogoName/Avatar
            IDictionary<string, object> fileData = null;
            string logoName = string.Empty;
            var avatarData = saveData.Data.GetValue("AvatarData");
            if (avatarData != null)
            {
                fileData = JObject.FromObject(avatarData).ToObject<Dictionary<string, object>>();
                logoName = fileData.GetStringValue("name");
                if (!string.IsNullOrEmpty(logoName))
                {
                    var guid = Guid.NewGuid().ToString();
                    logoName = guid + Path.GetExtension(logoName);
                    fileData["fileNameGuid"] = logoName;
                }
            }
            #endregion

            #region Update CustomerData
            var customerData = saveData.Data.GetValue("CustomerData");
            if (customerData != null)
            {
                var expandCustomerData = JObject.FromObject(customerData).ToObject<Dictionary<string, object>>();

                if (!string.IsNullOrEmpty(logoName))
                {
                    expandCustomerData["B00Person_LogoName"] = logoName;
                    expandCustomerData["B00PersonMasterData_Avatar"] = logoName;
                }

                expandCustomerData["B00PersonTypeGw_IdRepPersonType"] = 28;// Customer->IdRepPersonType: 28
                expandCustomerData["B00PersonInterface_IdRepAddressType"] = "1";//Main Address

                saveData.IdPerson = expandCustomerData.GetStringValue("B00Person_IdPerson");
                saveData.Data["CustomerData"] = expandCustomerData;
            }
            #endregion

            //Save Customer
            var result = await _personService.SaveCustomer(saveData);

            //Success then upload Logo/Avatar
            if (result.IsSuccess && fileData != null && !string.IsNullOrEmpty(logoName))
            {
                await _fileBusiness.UploadFile(fileData, UploadMode.Customer);
            }

            return result;
        }
        #endregion
    }
}

