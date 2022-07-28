using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS.DTO.B00Sharing;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    public interface IContactService
    {
        #region Contact        

        /// <summary>
        /// SaveContact
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveContact(SaveContactData data);

        Task<WSEditReturn> CreateContact(SaveNewContactData model, SaveNewContactData saveData);

        /// <summary>
        /// GetDocumentContact
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfContact(GetContactData data);

        /// <summary>
        /// GetDocumentCommunication
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<object>> GetDocumentCommunication(GetCommunicationData data);

        /// <summary>
        /// Get captured contact (person) document detail
        /// </summary>
        /// <param name="getData"></param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetCapturedContactDocumentDetail(GetCapturedContactDocumentDetail getData);

        JObject TransformPersonContactModelToParametersStored(PersonContactModel person, PersonContactModel sharingContact = null);

        JObject TransformPersonContactCommunicationModelToParametersStored(PersonContactModel person, PersonContactModel sharingContact = null);

        Task<IEnumerable<SharingContactInformationDto>> GetSharingContactInformation(GetSharingContactInformationData data);
    
        #endregion
    }
}

