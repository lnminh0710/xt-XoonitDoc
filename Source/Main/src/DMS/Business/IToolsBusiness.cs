using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IToolsBusiness
    {

        #region Dispatcher

        /// <summary>
        /// GetScanCenter
        /// </summary>
        /// <param name="mode"></param>
        /// <returns></returns>
        Task<object> GetScanCenter(string mode);

        /// <summary>
        /// GetScanCenter
        /// </summary>
        /// <param name="idScanCenter"></param>
        /// <returns></returns>
        Task<object> GetScanCenterPools(int? idScanCenter);

        /// <summary>
        /// GetScanDataEntryCenter
        /// </summary>
        /// <returns></returns>
        Task<object> GetScanDataEntryCenter();

        /// <summary>
        /// GetScanCenterDispatcher
        /// </summary>
        /// <param name="idScanCenter"></param>
        /// <returns></returns>
        Task<object> GetScanCenterDispatcher(int? idScanCenter);

        /// <summary>
        /// SaveScanDispatcherPool
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanDispatcherPool(ScanDispatcherPoolModel model);

        /// <summary>
        /// SaveScanUndispatch
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveScanUndispatch(ScanUndispatcherPoolModel model);

        #endregion

        #region Scan Assignment

        /// <summary>
        /// GetScanAssigned
        /// </summary>
        /// <returns></returns>
        Task<object> GetScanAssigned();

        /// <summary>
        /// GetScanAssignmentDataEntryCenter
        /// </summary>
        /// <returns></returns>
        Task<object> GetScanAssignmentDataEntryCenter();

        /// <summary>
        /// GetScanAssignmentUsers
        /// </summary>
        /// <returns></returns>
        Task<object> GetScanAssignmentUsers();

        /// <summary>
        /// GetScanAssignmentSelectPool
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentSelectPool(int? idPerson);

        /// <summary>
        /// GetScanAssignmentUserLanguageAndCountry
        /// </summary>
        /// <param name="idPerson"></param>
        /// <returns></returns>
        Task<object> GetScanAssignmentUserLanguageAndCountry(ScanAssignmentUserLanguageCountry model);

        /// <summary>
        /// SaveSAPoolUser
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveSAPoolUser(ScanAssignmentPoolUserModel model);

        /// <summary>
        /// DeleteSAPoolUser
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<WSEditReturn> DeleteSAPoolUser(ScanAssignmentPoolUserModel model);

        /// <summary>
        /// GetMatchingPerson
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> GetMatchingPerson(string idRepIsoCountryCode);

        #endregion

        #region [Matching Tools]

        /// <summary>
        /// GetMatchingCountry
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<object> GetMatchingCountry();

        /// <summary>
        /// GetMatchingColumns
        /// </summary>
        /// <returns></returns>
        Task<object> GetMatchingColumns();

        /// <summary>
        /// GetMatchingConfiguration
        /// </summary>
        /// <returns></returns>
        Task<object> GetMatchingConfiguration();

        /// <summary>
        /// SaveMatchingConfiguration
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveMatchingConfiguration(MatchingModel model);

        /// <summary>
        /// GetScheduleTime
        /// </summary>
        /// <returns></returns>
        Task<object> GetScheduleTime();

        /// <summary>
        /// SaveScheduleTime
        /// </summary>
        /// <returns></returns>
        Task<WSEditReturn> SaveScheduleTime(MatchingModel model);

        #endregion

        #region SystemSchedule
        Task<WSEditReturn> SystemScheduleSave(SystemScheduleSaveModel model);
        Task<WSEditReturn> SystemScheduleSaveStatus(SystemScheduleSaveStatusModel data);
        Task<object> SystemScheduleGetServiceList(SystemScheduleGetServiceListModel model);
        Task<object> GetScheduleServiceStatusByQueueId(int idAppSystemScheduleQueue);
        Task<object> GetScheduleByServiceId(int idRepAppSystemScheduleServiceName);
        Task<object> SystemScheduleGetReportFileList(SystemScheduleGetReportFileListModel model);
        Task<object> SystemScheduleGetSummayFileResult(SystemScheduleGetSummayFileResultModel model);
        Task<WSEditReturn> SavingQueue(IList<SystemScheduleQueueModel> model);
        Task<WSEditReturn> SavingQueueElastic(Dictionary<string, object> values);
        #endregion
    }
}

