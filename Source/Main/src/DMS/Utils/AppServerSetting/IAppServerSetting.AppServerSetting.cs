using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Reflection;

namespace DMS.Utils
{

    /// <summary>
    /// AppServerSetting
    /// </summary>
    public class AppServerSetting : IAppServerSetting
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        /// <summary>
        /// AppServerSetting
        /// </summary>
        /// <param name="httpContextAccessor"></param>
        /// <param name="appSettings"></param>
        public AppServerSetting(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
        }

        /// <summary>
        /// ServerConfig
        /// </summary>
        public ServerConfig ServerConfig
        {
            get
            {
                string host = "";
                try
                {
                    if(_httpContextAccessor!=null&& _httpContextAccessor.HttpContext!=null
                        && _httpContextAccessor.HttpContext.Request!=null
                        && _httpContextAccessor.HttpContext.Request.Host != null)
                    {
                        host = _httpContextAccessor.HttpContext.Request.Host.Host;
                        ServerConfig serverConfig = _appSettings.ServerConfig.Where(p => p.Domain.Equals(host, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();
                        if (serverConfig == null)  _logger.Error($"ServerConfig host: {host}");
                        
                        return serverConfig;
                    }
                    return _appSettings.ServerConfig.FirstOrDefault();

                }
                catch(Exception)
                {
                    _logger.Error($"ServerConfig host: {host}");
                    return _appSettings.ServerConfig.FirstOrDefault();
                }
            }
        }
    }
}
