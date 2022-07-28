using DMS.ServiceModels;
using DMS.Utils;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface IHeadquarterService
    {
        Task<WSEditReturn> SaveFormDynamicData(SaveDynamicData saveData);
        Task<WSEditReturn> SaveFormData(SaveDynamicData saveData);

        Task<WSEditReturn> SaveProcessingForm(SaveDynamicData saveData);
        Task<WSEditReturn> SaveApprovalUserAutoReleased(SaveApprovalUserAutoReleasedData saveData);
        Task<JArray> SaveApprovalUser(SaveApprovalUserAutoReleasedData saveData);

        Task<JArray> GetDataExtractedAI(DynamicData saveData);
    }
}
