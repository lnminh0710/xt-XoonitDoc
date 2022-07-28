using DMS.Models;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface IOtherDocumentService
    {
        /// <summary>
        /// SaveOtherDocument
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveOtherDocument(SaveOtherDocumentData data, SaveOtherDocumentModel model);

        /// <summary>
        /// Get captured other document detail
        /// </summary>
        /// <param name="getData"></param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetCapturedOtherDocumentDetail(GetCapturedOtherDocumentDetailData getData, string addOnFields);
        Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfOtherDocuments(Data data, string addOnFields);
    }
}
