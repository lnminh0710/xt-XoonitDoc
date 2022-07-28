using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Hangfire.Console;
using System;

namespace DMS.Extensions
{
    public class MyAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
           // var httpContext = context.GetHttpContext();
            var httpContext = context.GetHttpContext();

            // Allow all authenticated users to see the Dashboard (potentially dangerous).
            //return httpContext.User.Identity.IsAuthenticated;
            // Allow all authenticated users to see the Dashboard (potentially dangerous).
            return true;
        }
    }
    public static class MyHangFireExtensions
    {
        public static IServiceCollection AddMyHangFire(this IServiceCollection services, string hfCon)
        {
            services.AddHangfire(config => config.UseSqlServerStorage(hfCon).UseConsole());
            //GlobalJobFilters.Filters.Add(new AutomaticRetryAttribute { Attempts = 5 });
            services.AddHangfireServer();
            return services;
        }

        public static IApplicationBuilder UseMyHangFire(this IApplicationBuilder app)
        {
          //  app.UseHangfireDashboard("/hangfire");
           app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[] { new MyAuthorizationFilter() }
            });
            app.UseHangfireServer(new BackgroundJobServerOptions
            {
                ServerName = String.Format("{0}:sync_cloud", Environment.MachineName),
                WorkerCount = 1,
                Queues = new[] { "mydm_sync_cloud" }

            });
            app.UseHangfireServer(new BackgroundJobServerOptions
            {
                ServerName = String.Format("{0}:sync_cloud_fail", Environment.MachineName),
                WorkerCount = 1,
                Queues = new[] { "mydm_sync_cloud_fail" }

            });
            app.UseHangfireServer(new BackgroundJobServerOptions
            {
                ServerName = String.Format("{0}:DEFAULT", Environment.MachineName),
                WorkerCount = 5,
                Queues = new[] { "DEFAULT" }

            });

            //  app.UseHangfireServer();
            return app;
        }
    }
}
