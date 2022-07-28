using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sentry;
using DMS.Models;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [AllowAnonymous]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PingController : Controller
    {
        // GET: api/Ping/Get
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpGet]
        [Route("Get")]
        public Task<object> Get()
        {
            //Task.Yield();
            var response = new
            {
                ServerNow = DateTime.Now,
                ServerUTCNow = DateTime.UtcNow,
                ServerUTCOffset = TimeZoneInfo.Local.GetUtcOffset(DateTime.UtcNow)
            };
            return Task.FromResult<object>(response);
        }

        #region TestSentryAsync
        [AllowAnonymous]
        [HttpGet]
        [Route("TestSentryAsync")]
        public Task<object> TestSentryAsync(string id = null, string name = null)
        {
            //await Task.Yield();
            var response = new
            {
                ServerUTCNow = DateTime.UtcNow,
                ServerUTCOffset = TimeZoneInfo.Local.GetUtcOffset(DateTime.UtcNow),
                Id = id,
                Name = name + " - Async"
            };

            //SentrySdk.CaptureMessage("CaptureMessage - Hoa Test Debug: " + DateTime.UtcNow, Sentry.Protocol.SentryLevel.Debug);
            //SentrySdk.CaptureMessage("CaptureMessage - Hoa Test Error: " + DateTime.UtcNow, Sentry.Protocol.SentryLevel.Error);
            //SentrySdk.CaptureMessage("CaptureMessage - Hoa Test Fatal: " + DateTime.UtcNow, Sentry.Protocol.SentryLevel.Fatal);
            //SentrySdk.CaptureMessage("CaptureMessage - Hoa Test Info: " + DateTime.UtcNow, Sentry.Protocol.SentryLevel.Info);
            //SentrySdk.CaptureMessage("CaptureMessage - Hoa Test Warning: " + DateTime.UtcNow, Sentry.Protocol.SentryLevel.Warning);

            //SentrySdk.CaptureEvent(new SentryEvent
            //{
            //    Message = "CaptureEvent - Hoa Test: " + DateTime.UtcNow
            //});

            //SentrySdk.CaptureException(new Exception("CaptureException - Hoa Test: " + DateTime.UtcNow));

            var abc = TestSentryAsyncCalculate(10000, 1, new ModuleToPersonTypeModel
            {
                IdSettingsGUI = 1,
                IdRepPersonType = Guid.NewGuid().ToString(),
            });

            return Task.FromResult<object>(response);
        }
        private bool TestSentryAsyncCalculate(int i, int n, ModuleToPersonTypeModel model)
        {
            var c = i / (n - 1);
            return true;
        }
        #endregion
    }
}
