using DMS.Models.DMS.ViewModels;
using DMS.Models.History;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IHistorytBusiness : IBaseBusiness
    {
        Task<HistoryResponseViewModel> GetDocumentHistory();

        Task<AgGridHistoryViewModel> GetScanningHistoryList(ScanningHistoryFilter filter);
        Task<AgGridHistoryDetailViewModel> GetScanningHistoryDetail(ScanningHistoryDetailParameters parameters);
        Task<IEnumerable<HistoryUserViewModel>> GetHistoryUsersByFilter(string filter);
    }
}
