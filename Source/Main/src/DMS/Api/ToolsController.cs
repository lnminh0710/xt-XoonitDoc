using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using DMS.Business;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
namespace DMS.Api
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [Authorize]
    public class ToolsController : BaseController
    {
        private readonly IToolsBusiness _toolsBusiness;

        public ToolsController(IToolsBusiness toolsBusiness)
        {
            _toolsBusiness = toolsBusiness;
        }

        // GET: api/Tools/GetAllScanCenters
        [HttpGet]
        [Route("GetAllScanCenters")]
        public async Task<object> GetAllScanCenters(string mode)
        {
            var result = _toolsBusiness.GetScanCenter(mode);
            
            return await result;
        }

        // GET: api/Tools/GetScanCenterPools
        [HttpGet]
        [Route("GetScanCenterPools")]
        public async Task<object> GetScanCenterPools(int? idScanCenter)
        {
            var result = _toolsBusiness.GetScanCenterPools(idScanCenter);
           
            return await result;
        }

        // GET: api/Tools/GetAllScanDataEntryCenters
        [HttpGet]
        [Route("GetAllScanDataEntryCenters")]
        public async Task<object> GetAllScanDataEntryCenters()
        {
            var result = _toolsBusiness.GetScanDataEntryCenter();
           
            return await result;
        }

        // GET: api/Tools/GetScanCenterDispatcher
        [HttpGet]
        [Route("GetScanCenterDispatcher")]
        public async Task<object> GetScanCenterDispatcher(int? idScanCenter)
        {
            var result = _toolsBusiness.GetScanCenterDispatcher(idScanCenter);
            
            return await result;
        }

        // GET: api/Tools/GetScanAssignedPool
        [HttpGet]
        [Route("GetScanAssignedPool")]
        public async Task<object> GetScanAssignedPool()
        {
            var result = _toolsBusiness.GetScanAssigned();
            
            return await result;
        }

        // GET: api/Tools/GetScanAssignmentDataEntryCenter
        [HttpGet]
        [Route("GetScanAssignmentDataEntryCenter")]
        public async Task<object> GetScanAssignmentDataEntryCenter()
        {
            var result = _toolsBusiness.GetScanAssignmentDataEntryCenter();
            
            return await result;
        }

        // GET: api/Tools/GetScanAssignmentPool
        [HttpGet]
        [Route("GetScanAssignmentPool")]
        public async Task<object> GetScanAssignmentPool(int? idPerson)
        {
            var result = _toolsBusiness.GetScanAssignmentSelectPool(idPerson);
            
            return await result;
        }

        // GET: api/Tools/GetScanAssignmentUsers
        [HttpGet]
        [Route("GetScanAssignmentUsers")]
        public async Task<object> GetScanAssignmentUsers()
        {
            var result = _toolsBusiness.GetScanAssignmentUsers();
            
            return await result;
        }

        // GET: api/Tools/GetScanAssignmentUserLanguageAndCountry
        [HttpGet]
        [Route("GetScanAssignmentUserLanguageAndCountry")]
        public async Task<object> GetScanAssignmentUserLanguageAndCountry([FromQuery]ScanAssignmentUserLanguageCountry model)
        {
            var result = _toolsBusiness.GetScanAssignmentUserLanguageAndCountry(model);
            
            return await result;
        }

        // POST: api/Tools/SaveScanDispatcherPool
        [HttpPost]
        [Route("SaveScanDispatcherPool")]
        public async Task<object> SaveScanDispatcherPool([FromBody]ScanDispatcherPoolModel model)
        {
            var result = _toolsBusiness.SaveScanDispatcherPool(model);
            
            return await result;
        }

        // POST: api/Tools/SaveScanDispatcherPool
        [HttpPost]
        [Route("SaveScanUndispatch")]
        public async Task<object> SaveScanUndispatch([FromBody]ScanUndispatcherPoolModel model)
        {
            var result = _toolsBusiness.SaveScanUndispatch(model);
            
            return await result;
        }

        // POST: api/Tools/ScanAssignmentAssignPoolsToUsers
        [HttpPost]
        [Route("ScanAssignmentAssignPoolsToUsers")]
        public async Task<object> ScanAssignmentAssignPoolsToUsers([FromBody]ScanAssignmentPoolUserModel model)
        {
            var result = _toolsBusiness.SaveSAPoolUser(model);

            return await result;
        }

        // POST: api/Tools/ScanAssignmentUnassignPoolsToUsers
        [HttpPost]
        [Route("ScanAssignmentUnassignPoolsToUsers")]
        public async Task<object> ScanAssignmentUnassignPoolsToUsers([FromBody]ScanAssignmentPoolUserModel model)
        {
            var result = _toolsBusiness.DeleteSAPoolUser(model);
            
            return await result;
        }

        // GET: api/Tools/GetMatchingPerson 
        [HttpGet]
        [Route("GetMatchingPerson")]
        public async Task<object> GetMatchingPerson(string idRepIsoCountryCode)
        {
            var result = _toolsBusiness.GetMatchingPerson(idRepIsoCountryCode);
          
            return await result;
        }

        #region [Matching Tools]

        // GET: api/Tools/GetMatchingCountry
        [HttpGet]
        [Route("GetMatchingCountry")]
        public async Task<object> GetMatchingCountry()
        {
            return await _toolsBusiness.GetMatchingCountry();
        }

        // GET: api/Tools/GetMatchingColumns
        [HttpGet]
        [Route("GetMatchingColumns")]
        public async Task<object> GetMatchingColumns()
        {
            return await _toolsBusiness.GetMatchingColumns();
        }

        // GET: api/Tools/GetMatchingConfiguration
        [HttpGet]
        [Route("GetMatchingConfiguration")]
        public async Task<object> GetMatchingConfiguration()
        {
            return await _toolsBusiness.GetMatchingConfiguration();
        }

        // POST: api/Tools/SaveMatchingConfiguration
        [HttpPost]
        [Route("SaveMatchingConfiguration")]
        public async Task<object> SaveMatchingConfiguration([FromBody]MatchingModel model)
        {
            return await _toolsBusiness.SaveMatchingConfiguration(model);
        }

        // GET: api/Tools/GetScheduleTime
        [HttpGet]
        [Route("GetScheduleTime")]
        public async Task<object> GetScheduleTime()
        {
            return await _toolsBusiness.GetScheduleTime();
        }

        // POST: api/Tools/SaveScheduleTime
        [HttpPost]
        [Route("SaveScheduleTime")]
        public async Task<object> SaveScheduleTime([FromBody]MatchingModel model)
        {
            return await _toolsBusiness.SaveScheduleTime(model);
        }
        #endregion

        #region SystemSchedule
        [HttpPost]
        [Route("SaveSystemSchedule")]
        public async Task<object> SaveSystemSchedule([FromBody]SystemScheduleSaveModel model)
        {
            return await _toolsBusiness.SystemScheduleSave(model);
        }

        [HttpPost]
        [Route("SaveStatusSystemSchedule")]
        public async Task<object> SaveStatusSystemSchedule([FromBody]SystemScheduleSaveStatusModel model)
        {
            return await _toolsBusiness.SystemScheduleSaveStatus(model);
        }

        [HttpGet]
        [Route("ListSystemScheduleService")]
        public async Task<object> ListSystemScheduleService([FromQuery]SystemScheduleGetServiceListModel model)
        {
            return await _toolsBusiness.SystemScheduleGetServiceList(model);
        }

        [HttpGet]
        [Route("GetScheduleServiceStatusByQueueId")]
        public async Task<object> GetScheduleServiceStatusByQueueId(int idAppSystemScheduleQueue)
        {
            return await _toolsBusiness.GetScheduleServiceStatusByQueueId(idAppSystemScheduleQueue);
        }

        [HttpGet]
        [Route("GetScheduleByServiceId")]
        public async Task<object> GetScheduleByServiceId(int idRepAppSystemScheduleServiceName)
        {
            return await _toolsBusiness.GetScheduleByServiceId(idRepAppSystemScheduleServiceName);
        }

        [HttpGet]
        [Route("ListReportFileSystemScheduleService")]
        public async Task<object> ListReportFileSystemScheduleService([FromQuery]SystemScheduleGetReportFileListModel model)
        {
            return await _toolsBusiness.SystemScheduleGetReportFileList(model);
        }

        [HttpGet]
        [Route("GetSummayFileResultSystemSchedule")]
        public async Task<object> GetSummayFileResultSystemSchedule([FromQuery]SystemScheduleGetSummayFileResultModel model)
        {
            return await _toolsBusiness.SystemScheduleGetSummayFileResult(model);
        }

        [HttpPost]
        [Route("SavingQueue")]
        public async Task<object> SavingQueue([FromBody]IList<SystemScheduleQueueModel> model)
        {
            return await _toolsBusiness.SavingQueue(model);
        }
        #endregion
    }
}
