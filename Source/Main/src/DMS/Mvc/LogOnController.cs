using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Utils;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Options;
using SimpleTokenProvider;
using DMS.Constants;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api.mvc
{
    [Route("[controller]")]
    public class LogOnController : Controller
    {
        private readonly AppSettings _appSettings;
        private readonly JwtIssuerOptions _jwtOptions;

        public LogOnController(IOptions<JwtIssuerOptions> jwtOptions, IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
            _jwtOptions = jwtOptions.Value;
        }

        // GET: /<controller>/
        [Route("ResetPassword")]
        [AllowAnonymous]
        [HttpGet]
        public IActionResult ResetPassword(string accesstoken)
        {
            var handler = new JwtSecurityTokenHandler();

            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            
            if (jsonToken.ValidTo < DateTime.UtcNow ||
                jsonToken.Claims.Where(c =>
                    c.Type == ConstAuth.NewSecretKey &&
                    c.Value == Common.SHA256Hash(_appSettings.OAuthSecretKey + DateTime.Now.ToString("yyyyddMM"))).Count() <= 0)
            {
                return Redirect(string.Format("{0}/auth/invalid", Common.GetFullDomainUrl(HttpContext)));
            }

            return Redirect(string.Format("{0}/auth/resetpassword?accesstoken={1}", Common.GetFullDomainUrl(HttpContext), accesstoken));
        }
    }
}
