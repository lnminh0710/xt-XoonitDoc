using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IPersonService
    {
        /// <summary>
        /// GetCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<Customer> GetCustomer(CustomerData data);

        /// <summary>
        /// PreLoadBusinessLogic
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> PreLoadBusinessLogic(CustomData data);

        /// <summary>
        /// GetPerson
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<PersonModel> GetPerson(PersonData data);

        /// <summary>
        /// CreateCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> CreateCustomer(CustomerCreateData data, int numCommunications);

        /// <summary>
        /// CreatePerson
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> CreatePerson(PersonCreateData data);

        /// <summary>
        /// UpdatePerson
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> UpdatePerson(PersonUpdateData data);

        /// <summary>
        /// UpdateCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> UpdateCustomer(CustomerUpdateData data);


        /// <summary>
        /// DeleteCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> DeleteCustomer(CustomerDeleteData data);

        /// <summary>
        /// LoadCommunication
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> LoadCommunication(PersonData data);

        /// <summary>
        /// GetCustomerHistory
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCustomerHistory(PersonData data);

        /// <summary>
        /// GetMandatoryField
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetMandatoryField(PersonData data);

        /// <summary>
        /// GetPersonData
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetPersonData(PersonData data);

        Task<WSEditReturn> SaveCustomer(SaveCustomerData data);

        /// <summary>
        /// CreatePaymentAccount
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreatePaymentAccount(PaymentCreateData data, int numIdentiferCodes);

        /// <summary>
        /// CreateCCPRN
        /// </summary>
        /// <param name="data"></param>
        /// <param name="numCashProviderContractCreditcardType"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCCPRN(CCPRNCreateData data, int numCashProviderContractCreditcardType);

        /// <summary>
        /// CreateCostProvider
        /// </summary>
        /// <param name="data"></param>
        /// <param name="numProviderCostsItems"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCostProvider(CostProviderCreateData data, int numProviderCostsItems);

        /// <summary>
        /// LoadPaymentAccount
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> LoadPaymentAccount(PaymentData data);

        /// <summary>
        /// LoadCCPRN
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> LoadCCPRN(CCPRNData data);

    }
}
