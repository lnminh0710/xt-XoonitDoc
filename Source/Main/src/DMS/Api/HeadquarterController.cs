using DMS.Business;
using DMS.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class HeadquarterController : BaseController
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly IHeadquarterBusiness _headQuarterBusiness;

        private readonly AppSettings _appSettings;

        public HeadquarterController(IHeadquarterBusiness headQuarterBusiness,
                        IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting)
        {
            _headQuarterBusiness = headQuarterBusiness;
            _appSettings = appSettings.Value;

        }

        [HttpPost]
        [Route("")]
        public async Task<object> CreateHeadQuarter([FromBody] Dictionary<string, object> sess)
        {
            object rs = await _headQuarterBusiness.CreateHeadquarter(sess);
            return StatusCode(200, rs);
        }

        [HttpGet]
        [Route("details")]
        public async Task<object> GetHeadquarters(string idPerson)
        {
            object rs = await _headQuarterBusiness.GetDetailsHeadquarter(idPerson);
            return StatusCode(200, rs);
        }

        [HttpPatch]
        [Route("")]
        public async Task<object> UpdateHeadQuarter([FromBody] Dictionary<string, object> sess)
        {
            object rs = await _headQuarterBusiness.UpdateHeadquarter(sess);
            return StatusCode(200, rs);
        }



        [HttpPost]
        [Route("branch")]
        public async Task<object> CreateBranch([FromBody] Dictionary<string, object> sess)
        {
            object rs = await _headQuarterBusiness.CreateBranch(sess);
            return StatusCode(200, rs);
        }

        [HttpGet]
        [Route("branch")]
        public async Task<object> GetBranches(string idHeadquarter)
        {
            object rs = await _headQuarterBusiness.GetBranches(idHeadquarter);
            return StatusCode(200, rs);
        }

        [HttpPatch]
        [Route("branch")]
        public async Task<object> UpdateBranch(string idBranch, [FromBody] Dictionary<string, object> sess)
        {
            object rs = await _headQuarterBusiness.UpdateBranch(sess);
            return StatusCode(200, rs);
        }
    }
}
