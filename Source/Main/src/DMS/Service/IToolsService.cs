using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IToolsService
    {
        #region Dispatcher
        /// <summary>
        /// GetScanCenter
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanCenter(Data data);

        /// <summary>
        /// GetScanCenterPools
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanCenterPools(ToolScanManagerData data);

        /// <summary>
        /// GetScanDataEntryCenter
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanDataEntryCenter(Data data);

        /// <summary>
        /// GetScanCenterDispatcher
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanCenterDispatcher(ToolScanManagerData data);

        /// <summary>
        /// SaveScanDispatcherPool
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanDispatcherPool(ToolScanManagerData data);

        /// <summary>
        /// SaveScanUndispatch
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanUndispatch(ToolScanManagerData data);

        #endregion

        #region Scan Assignment

        /// <summary>
        /// GetScanAssigned
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanAssigned(Data data);

        /// <summary>
        /// GetScanAssignmentDataEntryCenter
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentDataEntryCenter(Data data);

        /// <summary>
        /// GetScanAssignmentUsers
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentUsers(Data data);

        /// <summary>
        /// GetScanAssignmentSelectPool
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentSelectPool(ToolScanManagerData data);

        /// <summary>
        /// GetScanAssignmentUserLanguageAndCountry
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentUserLanguageAndCountry(ToolScanManagerData data);

        /// <summary>
        /// GetMatchingCountry
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetMatchingPerson(MatchingData data);

        /// <summary>
        /// SaveSAPoolUser
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveSAPoolUser(ToolScanManagerData data);

        /// <summary>
        /// DeleteSAPoolUser
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteSAPoolUser(ToolScanManagerData data);

        #endregion

        #region [Matching Tools]

        /// <summary>
        /// GetMatchingCountry
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetMatchingCountry(MatchingConfigurationData data);

        /// <summary>
        /// GetMatchingColumns
        /// </summary>
        /// <returns></returns>
        Task<object> GetMatchingColumns(MatchingConfigurationData data);

        /// <summary>
        /// GetMatchingConfiguration
        /// </summary>
        /// <returns></returns>
        Task<object> GetMatchingConfiguration(MatchingConfigurationData data);

        /// <summary>
        /// SaveMatchingConfiguration
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveMatchingConfiguration(MatchingConfigurationSavingData data);

        /// <summary>
        /// GetScheduleTime
        /// </summary>
        /// <returns></returns>
        Task<object> GetScheduleTime(MatchingConfigurationData data);

        /// <summary>
        /// SaveScheduleTime
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveScheduleTime(MatchingConfigurationSavingData data);

        #endregion

        #region SystemSchedule
        Task<WSEditReturn> SystemScheduleSave(SystemScheduleSaveData data);
        Task<WSEditReturn> SystemScheduleSaveStatus(SystemScheduleSaveStatusData data);
        Task<object> SystemScheduleGetServiceList(SystemScheduleGetServiceListData data);
        Task<object> GetScheduleServiceStatusByQueueId(SystemScheduleGetServiceListData data);
        Task<object> GetScheduleByServiceId(SystemScheduleGetServiceListData data);
        Task<object> SystemScheduleGetReportFileList(SystemScheduleGetReportFileListData data);
        Task<object> SystemScheduleGetSummayFileResult(SystemScheduleGetSummayFileResultData data);
        Task<WSEditReturn> SavingQueue(DataWithJsonText data);
        Task<WSEditReturn> SavingQueueElastic(SystemScheduleQueueElasticSaveData data);
        #endregion
    }
}

