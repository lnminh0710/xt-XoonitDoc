using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;

namespace DMS.Service
{
    public interface IInvoiceService
    {
        #region Invoice        

        /// <summary>
        /// SaveInvoice
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveInvoice(SaveInvoiceModel model, SaveInvoiceData data);

        /// <summary>
        /// Get Document Invoice
        /// </summary>
        /// <param name="data">get invoice data model</param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfInvoice(GetInvoiceData data, string addOnFields);

        /// <summary>
        /// Get captured invoice document detail
        /// </summary>
        /// <param name="getData">parameter GetData object</param>
        Task<IEnumerable<ColumnDefinition>> GetCapturedInvoiceDocumentDetail(GetCapturedInvoiceDocumentDetailData getData, string addOnFields);

        #endregion
    }
}

