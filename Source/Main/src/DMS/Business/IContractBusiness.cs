using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IContractBusiness
    {
        /// <summary>
        /// GetDocumentContact
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfContract(string addOnFields);

        /// <summary>
        /// SaveContract
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveContract(SaveContractModel model, bool isUpdate = false);

        /// <summary>
        /// Update Contract
        /// </summary>
        /// <param name="model"></param>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        Task<object> UpdateContract(SaveContractModel model, string idMainDocument);

        /// <summary>
        /// Get captured contract document detail
        /// </summary>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        Task<CapturedContractDocumentDetailViewModel> GetCapturedContractDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingContract, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields);
    }
}
