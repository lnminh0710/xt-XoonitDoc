using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;

namespace DMS.Business
{
    public interface IContactBusiness
    {
        #region Contact 

        /// <summary>
        /// SaveContact
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> UpdateContact(ContactDetailModel model);

        Task<object> CRUDContact(ContactDetailModel model);

        /// <summary>
        /// GetDocumentContact
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfContact(DocumentContactQueryModel model);

        /// <summary>
        /// Get data setting columns of contact type
        /// </summary>
        /// <param name="documentType"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsContactOfDocumentType(string documentType);

        /// <summary>
        /// Get my contact (person) document detail
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetMyContactDetail(int idPerson, int idPersonType);

        /// <summary>
        /// Get contact (person) document detail
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetContactDocumentDetail(int idPerson, string objectMode);

        /// <summary>
        /// GetDocumentCommunication
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<IEnumerable<object>> GetDocumentCommunication(DocumentCommunicationQueryModel model);

        /// <summary>
        /// Sync document contact by IdPerson array
        /// </summary>
        /// <param name="idPersons"></param>
        Task SyncDocumentContactByIdPersons(IEnumerable<IdPersonResult> idPersons);

        /// <summary>
        /// Sync multiple idPersons or one idPerson.
        /// If sync multiple then should pass a string as format "1, 2, 3,..."
        /// </summary>
        /// <param name="idPersons">idPerson key</param>
        /// <returns></returns>
        Task<ElasticSyncResultModel> SyncDocumentContactByIdPerson(string idPersons);

        void SetIdsForPersonContactToUpdate(PersonContactModel person, IEnumerable<DocumentColumnSettingViewModel> dataColumns);

        Task<IEnumerable<SharingContactInformationViewModel>> CheckAndGetCompanyList(string companyName, string personNr, string idLogin, string idApplicationOwner);

        #endregion

    }
}

