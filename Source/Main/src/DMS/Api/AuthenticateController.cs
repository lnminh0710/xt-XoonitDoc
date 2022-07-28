using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models;
using DMS.Utils;
using System;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthenticateController : BaseController
    {
        private readonly AppSettings _appSettings;
        private readonly IAuthenticateBusiness _authenticateBusiness;
        private readonly JsonSerializerSettings _serializerSettings;

        public AuthenticateController(IAuthenticateBusiness authenticateBusiness, IOptions<AppSettings> appSettings)
        {
            _authenticateBusiness = authenticateBusiness;
            _appSettings = appSettings.Value;
            _serializerSettings = new JsonSerializerSettings
            {
                //Formatting = Formatting.Indented
            };
        }

        [HttpGet("checkServerOnline")]
        [AllowAnonymous]
        public bool CheckServerOnline()
        {
            return true;
        }

        [HttpGet("ping")]
        [Authorize]
        public bool Ping()
        {
            return true;
        }

        [HttpPost("Hash")]
        [AllowAnonymous]
        public async Task<object> Hash([FromBody] HashData model)
        {
            var result = Common.SHA256Hash(model.Text);
            return await Task.FromResult(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<object> Login([FromBody] User user)
        {
            return await _authenticateBusiness.Login(user, HttpContext);
        }

        /// <summary>
        /// Login by user id. That means the user logged in and we need to login for getting new access_token
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        [HttpGet("LoginByUserId")]
        [Authorize]
        public async Task<object> LoginByUserId(string idLogin)
        {
            return await _authenticateBusiness.LoginByUserId(idLogin, HttpContext);
        }

        [HttpPost("CheckToken")]
        [AllowAnonymous]
        public async Task<object> CheckToken([FromBody] Token token)
        {
            return await _authenticateBusiness.CheckToken(token);
        }

        [HttpPost("updatepassword")]
        public async Task<object> UpdatePassword([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.NewPassword))
            {
                return StatusCode(400);
            }
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            return await _authenticateBusiness.UpdatePassword(accesstoken, user.NewPassword, HttpContext);
        }

        [HttpPost("SendNotification")]
        [AllowAnonymous]
        public async Task<object> SendNotification([FromHeader] string loginName, [FromHeader] string content)
        {
            return await _authenticateBusiness.SendNotificationForExpiredUser(loginName, content);
        }

        [HttpPost("refreshtoken")]
        [Authorize]
        public async Task<object> RefreshToken()
        {
            return await _authenticateBusiness.RefreshToken();
        }

        [HttpPost("signup")]
        [AllowAnonymous]
        public async Task<object> SignUp([FromBody]SignUpAccount signUpAccount)
        {
            if (!ModelState.IsValid)
            {
                return StatusCode(400, string.Join(" | ", ModelState.Values
                                         .SelectMany(v => v.Errors)
                                         .Select(e => e.ErrorMessage)));
            }
            return await _authenticateBusiness.SignUp(signUpAccount, HttpContext);
        }

        [HttpPost("newUser")]
        [AllowAnonymous]
        public async Task<object> AddNewUser([FromBody] NewAccount newAccount)
        {
            if (!ModelState.IsValid)
            {
                return StatusCode(400, string.Join(" | ", ModelState.Values
                                         .SelectMany(v => v.Errors)
                                         .Select(e => e.ErrorMessage)));
            }
            return await _authenticateBusiness.NewAccount(newAccount, HttpContext);
        }

        [HttpPost("resendEmailNewPassword")]
        [AllowAnonymous]
        public async Task<object> ResendEmailNewPass([FromBody] SignUpAccount signUpAccount)
        {
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            return await _authenticateBusiness.ResendEmailNewPass(signUpAccount, accesstoken, HttpContext);
        }

        [HttpPost("resendActivateEmail")]
        [Authorize]
        public async Task<object> ResendActivateEmail([FromBody] User user)
        {
            return await _authenticateBusiness.ResendActivateEmail(user, HttpContext);
        }

        [HttpPost("fogotPassword")]
        [AllowAnonymous]
        public async Task<object> ForgotPassword([FromBody] SignUpAccount user)
        {
            return await _authenticateBusiness.ForgotPassword(user, HttpContext);
        }

        [HttpPost("changepassword")]
        [Authorize]
        public async Task<object> ChangePassword([FromBody] User user)
        {
            return await _authenticateBusiness.ChangePassword(user);
        }

        [HttpPost("changeStatusUser")]
        [Authorize]
        public async Task<object> ChangeStatusUser([FromBody] UserInfo user)
        {
            return await _authenticateBusiness.ChangeStatusUser(user, HttpContext);
        }

        [HttpPost("active/{userId}")]
        [Authorize]
        public async Task<object> ActiveUser(string userId)
        {
            try
            {
                var rs = await _authenticateBusiness.ForceActiveUser(userId);
                return rs;
            }
            catch(Exception e)
            {
                return StatusCode(400, e.Message);
            }            
        }

        [HttpPost("ResetPassUser")]
        [Authorize]
        public async Task<object> ResetPassword([FromBody] ResetPassUser request)
        {
            return await _authenticateBusiness.ResetPasswordUser(request, HttpContext);
        }
    }
}
