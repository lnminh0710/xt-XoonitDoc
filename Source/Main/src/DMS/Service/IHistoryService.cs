using DMS.Models.DMS.DTO;
using DMS.Models.History;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface IHistoryService
    {
        /// <summary>
        /// GetDocumentHistory
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<object>> GetDocumentHistory(Data data);
        Task<ScanningHistoryData> GetScanningHistoryList(GetScanningHistoryListData data);
        Task<ScanningHistoryDetailDto> GetScanningHistoryDetail(GetScanningHistoryDetailData data);
        Task<IEnumerable<HistoryUserViewModel>> GetHistoryUsersByFilter(Data data);
    }
}
