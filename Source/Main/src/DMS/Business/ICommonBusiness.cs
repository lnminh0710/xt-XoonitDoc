using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface ICommonBusiness
    {
        /// <summary>
        /// GetSystemInfo
        /// </summary>
        /// <returns></returns>
        Task<object> GetSystemInfo();

        Task<List<MatchingPerson>> DedupeCheckPerson(CustomerMatchedModel person);

        /// <summary>
        /// CreateQueue
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateQueue(CreateQueueModel model);

        /// <summary>
        /// DeleteQueues
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteQueues(DeleteQueuesModel model);
        Task<object> GetScanSettings();
        Task<object> SaveScanSettings(SaveScanSettingModel model);
        Task<object> GetDocumentProcessingQueues();
    }
}

