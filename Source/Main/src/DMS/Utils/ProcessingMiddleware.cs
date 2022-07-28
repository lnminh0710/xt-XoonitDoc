using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class ProcessingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly AppSettings _appSettings;

        public ProcessingMiddleware(RequestDelegate next, IOptions<AppSettings> appSettings)
        {
            _next = next;
            _appSettings = appSettings.Value;
        }

        public async Task Invoke(HttpContext context)
        {
            if (_appSettings.EnableTimeTraceLog)
            {
                // start log time for Xena API_appSettings
                var watch = new Stopwatch();
                watch.Start();
                //To add Headers AFTER everything you need to do this
                context.Response.OnStarting(state =>
                {
                    // stop log time for Xena API
                    watch.Stop();
                    var httpContext = (HttpContext)state;
                    if (string.IsNullOrEmpty(httpContext.Response.Headers[Constants.ConstAuth.LogTimeUniqueService]))
                    {
                        var now = DateTime.Now;
                        string log = string.Format("start: {0} - end: {1} - total: {2}ms",
                            now.Subtract(watch.Elapsed).ToString("dd/MM/yyyy HH:mm:ss:fff"),
                            now.ToString("dd/MM/yyyy HH:mm:ss:fff"),
                            watch.ElapsedMilliseconds);
                        httpContext.Response.Headers.Add(Constants.ConstAuth.LogTimeXenaAPI, new[] { log });
                    }
                    return Task.FromResult(0);
                }, context);
            }

            await _next(context);
        }
    }
}
