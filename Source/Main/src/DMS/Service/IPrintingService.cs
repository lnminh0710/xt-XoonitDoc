using System.Threading.Tasks;
using DMS.Utils;

namespace DMS.Service
{
    public interface IPrintingService
    {
        Task<WSDataReturn> GetCampaigns(PrintingGetCampaignData data);

        Task<WSDataReturn> ConfirmGetData(PrintingCampaignConfirmData data);
    }    
}

