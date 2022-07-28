using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using DMS.Constants;
using DMS.Models;
using DMS.Utils;
using Sentry;
using System.Threading.Tasks;

namespace DMS.Business
{
    /// <summary>
    /// BaseBusiness
    /// </summary>
    public class BaseBusiness : IBaseBusiness
    {
        protected readonly IHttpContextAccessor _context;

        public BaseBusiness()
        {
            SetEmptyData();
        }

        public BaseBusiness(IHttpContextAccessor context)
        {
            _context = context;

            Init();
        }

        public string AccessToken
        {
            get;
            private set;
        }

        public Data ServiceDataRequest
        {
            get;
            private set;
        }

        public UserFromService UserFromService
        {
            get;
            private set;
        }

        private void Init(string authorization = null)
        {
            //string authorization = string.Empty;
            if(authorization == null)
            {
                try
                {
                    if (_context != null && _context.HttpContext != null)
                        authorization = _context.HttpContext.Request.Headers["Authorization"];
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }

            if (string.IsNullOrEmpty(authorization))
            {
                SetEmptyData();
                return;
            }

            AccessToken = authorization.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(AccessToken))
            {
                SetEmptyData();
                return;
            }

            try
            {
                string idRepLanguage = _context.HttpContext.Request.Headers["IdRepLanguage"];
                string translateModuleType = _context.HttpContext.Request.Headers["TranslateModuleType"];
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(AccessToken) as JwtSecurityToken;
                UserFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);

                string idLoginDefault = "";
                string languageDefault = "";
                string idApplicationOwner = "";
                string email = "";
                if (UserFromService != null)
                {
                    idLoginDefault = UserFromService.IdLogin;
                    languageDefault = UserFromService.IdRepLanguage;
                    idApplicationOwner = UserFromService.IdApplicationOwner;
                    email = UserFromService.Email;
                }
                string language = !string.IsNullOrWhiteSpace(idRepLanguage) ? idRepLanguage : languageDefault;
                ServiceDataRequest = new Data
                {
                    IdLogin = idLoginDefault,
                    IdApplicationOwner = idApplicationOwner,
                    LoginLanguage = language,
                    IdRepTranslateModuleType = translateModuleType,
                    Email = email
                };
            }
            catch (Exception ex)
            {
                //var data = new Dictionary<string, string>();
                //data.Add("Authorization", authorization);
                //SentrySdk.AddBreadcrumb("BaseBusiness-Init-Parse Jwt", category: "Jwt", data: data);
                throw ex;
            }
        }

        public void ReInit(string authorization)
        {
            Init(authorization);
        }

        private void SetEmptyData()
        {
            AccessToken = string.Empty;
            ServiceDataRequest = new Data();
            UserFromService = new UserFromService();
        }

        public User GetUserInfoFromToken()
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(AccessToken) as JwtSecurityToken;
            string strUser = Common.Decrypt(jsonToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
            return JsonConvert.DeserializeObject<User>(strUser);
        }

        public async Task<bool> Execute(Func<Task<bool>> action)
        {
            bool rs = false;
            try
            {
                rs = await action();
            }
            catch (Exception ex)
            {
                SentrySdk.CaptureException(ex);
            }
            return rs;
        }

        public static T ReadAccessToken<T>(IHttpContextAccessor httpContextAccessor, string key)
        {
            string authorization = string.Empty;
            try
            {
                authorization = httpContextAccessor.HttpContext.Request.Headers["Authorization"];
            }
            catch (Exception)
            {

            }
            if (string.IsNullOrEmpty(authorization))
            {
                return default(T);
            }

            string accessToken = authorization.Replace("Bearer ", "");

            if (string.IsNullOrEmpty(accessToken))
            {
                return default(T);
            }

            try
            {
                string idRepLanguage = httpContextAccessor.HttpContext.Request.Headers["IdRepLanguage"];
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(accessToken) as JwtSecurityToken;
                var value = JsonConvert.DeserializeObject<T>(jsonToken.Claims.First(c => c.Type == key).Value);

                return value;
            }
            catch (Exception ex)
            {
                var data = new Dictionary<string, string>();
                data.Add("Authorization", authorization);
                SentrySdk.AddBreadcrumb("BaseBusiness-Init-Parse Jwt", category: "Jwt", data: data);
                throw ex;
            }
        }
    }
}
