using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace DMS.Utils
{
    /// <summary>
    /// BaseRestServiceRequest
    /// </summary>
    public abstract class BaseRestServiceRequest
    {
        protected IRestRequestHelper _service;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;

        public BaseRestServiceRequest(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
        }

        protected IRestRequestHelper Service
        {
            get
            {
                if (_service != null) 
                    return _service;

                _service = new RestRequestHelper(_appSettings, _httpContextAccessor) { BaseUrl = Host, ServiceName = ServiceName, AuthString = AuthString };
                return _service;
            }
        }

        /// <summary>
        /// ServiceName
        /// </summary>
        protected abstract string Host { get; }

        /// <summary>
        /// AuthString
        /// </summary>
        protected abstract string AuthString { get; }

        /// <summary>
        /// ServiceName
        /// </summary>
        protected abstract string ServiceName { get; }

        /// <summary>
        /// Execute
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="func"></param>
        /// <returns></returns>
        protected  virtual Task<T> Execute<T>(Func<Task<T>> func)
        {
            try
            {
                return func();
            }
            finally
            {
                if (_service != null)
                {
                    _service.Dispose();
                    _service = null;
                }
            }
        }
    }
}
