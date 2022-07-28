using DMS.Models;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IOtherDocumentBusiness
    {
        /// <summary>
        /// SaveOtherDocument
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveOtherDocument(SaveOtherDocumentModel model, bool isUpdate = false);

        /// <summary>
        /// Update Other Document
        /// </summary>
        /// <param name="model"></param>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        Task<object> UpdateOtherDocument(SaveOtherDocumentModel model, string idMainDocument);

        /// <summary>
        /// Get captured other document detail
        /// </summary>
        /// <param name="idMainDocument">id main document</param>
        /// <param name="whereDisplaySettingOtherDocument">predicate to get other document</param>
        /// <param name="whereDisplaySettingPerson">predicate to get person document</param>
        /// <returns></returns>
        Task<CapturedOtherDocumentDetailViewModel> GetCapturedOtherDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingOtherDocument, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields);
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfOtherDocuments(string addOnFields);
    }
}
