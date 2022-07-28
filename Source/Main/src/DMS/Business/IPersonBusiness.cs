using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IPersonBusiness
    {
        /// <summary>
        /// CreateCustomer
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> CreateCustomer(CustomerEditModel model);

        /// <summary>
        /// UpdateCustomer
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> UpdateCustomer(string model);


        /// <summary>
        /// DeleteCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> DeleteCustomer(int idPerson);

        /// <summary>
        /// GetCustomer
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<Customer> GetCustomer(int idPerson);

        /// <summary>
        /// PreLoadBusinessLogic
        /// </summary>
        /// <param name="mediaCode"></param>
        /// <returns></returns>
        Task<object> PreLoadBusinessLogic(string mediaCode);

        /// <summary>
        /// GetPerson
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<PersonModel> GetPerson(int? idPerson);

        /// <summary>
        /// CreatePerson
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> CreatePerson(PersonEditModel model, string searchIndexKey);

        /// <summary>
        /// UpdatePerson
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSCustomerEditReturn> UpdatePerson(PersonEditModel model, string searchIndexKey);

        /// <summary>
        /// CreatePaymentAccount
        /// </summary>
        /// <param name="model">PaymentEditModel</param>
        /// <returns></returns>
        Task<WSEditReturn> CreatePaymentAccount(PaymentEditModel model);

        /// <summary>
        /// LoadPaymentAccount
        /// </summary>
        /// <param name="idCashProviderPaymentTerms">idCashProviderPaymentTerms</param>
        /// <returns></returns>
        Task<object> LoadPaymentAccount(string idCashProviderPaymentTerms);

        /// <summary>
        /// CreateCCPRN
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCCPRN(CCPRNEditModel model);

        /// <summary>
        /// LoadCCPRN
        /// </summary>
        /// <param name="idCashProviderContract"></param>
        /// <returns></returns>
        Task<object> LoadCCPRN(string idCashProviderContract);

        /// <summary>
        /// CreateCostProvider
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateCostProvider(CostProviderEditModel model);

        /// <summary>
        /// LoadCommunication
        /// </summary>
        /// <param name="idPersonInterface"></param>
        /// <returns></returns>
        Task<object> LoadCommunication(int idPersonInterface);

        /// <summary>
        /// GetCustomerHistory
        /// </summary>
        /// <param name="idPerson"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        Task<object> GetCustomerHistory(string idPerson, int? pageIndex, int? pageSize);

        /// <summary>
        /// GetMandatoryField
        /// </summary>
        /// <param name="mode"></param>
        /// <returns></returns>
        Task<object> GetMandatoryField(string mode);

        /// <summary>
        /// GetPersonData
        /// </summary>
        /// <param name="mode"></param>
        /// <returns></returns>
        Task<object> GetPersonData(string idPersons);

        Task<object> SaveCustomer(SaveCustomerModel model);
    }
}
