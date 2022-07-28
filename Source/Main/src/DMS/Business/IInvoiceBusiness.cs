using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;

namespace DMS.Business
{
    public interface IInvoiceBusiness
    {
        #region Invoice 

        /// <summary>
        /// SaveInvoice
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> SaveInvoice(SaveInvoiceModel model, bool isUpdate = false);

        /// <summary>
        /// Update invoice
        /// </summary>
        /// <param name="model">data save invoice</param>
        /// <param name="idMainDocument">id main document</param>
        /// <returns></returns>
        Task<object> UpdateInvoice(SaveInvoiceModel model, string idMainDocument);

        /// <summary>
        /// Get document invoice
        /// </summary>
        /// <param name="model">get invoice model</param>
        /// <returns></returns>
        Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfInvoice(string addOnFields);

        /// <summary>
        /// Get captured invoice document detail
        /// </summary>
        /// <param name="idMainDocument">id main document</param>
        /// <returns></returns>
        Task<CapturedInvoiceDocumentDetailViewModel> GetCapturedInvoiceDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingInvoice, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields);

        #endregion

    }
}

