using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DynamicControlDefinitions;
using DMS.Utils;

namespace DMS.Service
{
    public interface IContractService
    {
        /// <summary>
        /// GetDataSettingColumnsOfContract
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetDataSettingColumnsOfContract(GetContractData data, string addOnFields);

        /// <summary>
        /// SaveContract
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveContract(SaveContractData data, SaveContractModel model);

        /// <summary>
        /// Get captured contract document detail
        /// </summary>
        /// <param name="getData"></param>
        /// <returns></returns>
        Task<IEnumerable<ColumnDefinition>> GetCapturedContractDocumentDetail(GetCapturedContractDocumentDetailData getData, string addOnFields);
    }
}
