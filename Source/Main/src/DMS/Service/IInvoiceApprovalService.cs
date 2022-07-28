using System.Threading.Tasks;
using DMS.ServiceModels;
using DMS.Utils;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    public interface IInvoiceApprovalService
    {
        Task<WSEditReturn> SaveFormDynamicData(SaveDynamicData saveData);
        Task<WSEditReturn> SaveFormData(SaveDynamicData saveData);

        Task<WSEditReturn> SaveProcessingForm(SaveDynamicData saveData);
        Task<WSEditReturn> SaveApprovalUserAutoReleased(SaveApprovalUserAutoReleasedData saveData);
        Task<JArray> SaveApprovalUser(SaveApprovalUserAutoReleasedData saveData);

        Task<JArray> GetDataExtractedAI(DynamicData saveData);
    }
}
