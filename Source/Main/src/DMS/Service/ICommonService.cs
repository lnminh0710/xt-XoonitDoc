using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface ICommonService
    {
        /// <summary>
        /// GetSystemInfo
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetSystemInfo(Data data);

        /// <summary>
        /// CreateQueue
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> CreateQueue(CommonCreateQueueData data);

        /// <summary>
        /// DeleteQueues
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteQueues(CommonDeleteQueuesData data);
        Task<WSDataReturn> GetScanSettings(Data data);
        Task<WSEditReturn> SaveScanSettings(ScanSettingsSaveData data);

        Task<WSDataReturn> GetDocumentProcessingQueues(CommonGetQueuesData data);
    }
}

