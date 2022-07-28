using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IScanningReportBusiness
    {

        Task<object> GetScanningResult(string GroupUuid, string userEmail);
        Task<ScanningReportForMailing> GetScanningResultForSendMail(string GroupUuid, string userEmail);
        Task<bool> SendEmailReport(string GroupUuid, bool test = false);
    }
}

