using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;
using DMS.Models.Authenticate;
using DMS.Constants;

namespace DMS.Business
{
    public interface IAuthenticateBusiness
    {
        /// <summary>
        /// Login by account: loginName, password
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<OAuthTokens> Login(User user, HttpContext context);

        /// <summary>
        /// Login by UserId
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        Task<OAuthTokens> LoginByUserId(string idLogin, HttpContext context);

        /// <summary>
        /// UpdatePassword
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="clientUser"></param>
        /// <returns></returns>
        Task<OAuthTokens> UpdatePassword(string accesstoken, string newPass, HttpContext context);

        /// <summary>
        /// SendNotificationForExpiredUser
        /// </summary>
        /// <param name="loginName"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        Task<bool> SendNotificationForExpiredUser(string loginName, string content);

        /// <summary>
        /// RefreshToken
        /// </summary>
        /// <returns></returns>
        Task<OAuthTokens> RefreshToken();

        /// <summary>
        /// SignUp
        /// </summary>
        /// <returns></returns>
        Task<dynamic> SignUp(SignUpAccount signUpAccount, HttpContext context);
        /// <summary>
        /// NewUser
        /// </summary>
        /// <returns></returns>
        Task<dynamic> NewAccount(NewAccount newAccount, HttpContext context);
        /// <summary>
        /// CheckToken
        /// </summary>
        /// <returns></returns>
        Task<CheckTokenResult> CheckToken(Token token);
        /// <summary>
        /// ResendEmailNewPass
        /// </summary>
        /// <returns></returns>
        Task<dynamic> ResendEmailNewPass(SignUpAccount user, string accesstoken, HttpContext context);
        /// <summary>
        /// ResendActivateEmail
        /// </summary>
        /// <returns></returns>
        Task<dynamic> ResendActivateEmail(User user, HttpContext context);
        /// <summary>
        /// ForgotPassword
        /// </summary>
        /// <param name="user"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        Task<OAuthTokens> ForgotPassword(SignUpAccount user, HttpContext context);

        /// <summary>
        /// ChangePassword
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<OAuthTokens> ChangePassword(User user);

        Task<OAuthTokens> ForceRefreshToken();
        /// <summary>
        /// ChangeStatusUser
        /// </summary>
        /// <returns></returns>
        Task<dynamic> ChangeStatusUser(UserInfo user, HttpContext httpContext);

        string GenrateNewPasswordWithEmailChanged(string email);
        Task<string> GenerateTokenWithNewEmail(UserProfileDetail signUpAccount, string idLogin, HttpContext context);
        string GetUserAvatar(string loginPicture, bool isMobile = false);

        Task<OAuthTokens> GenerateOAuthTokenForSentEmail(HandleAccessTokenModel data);

        Task<bool> SendEmailTemplate(User user, OAuthTokens oAuthTokens, HttpContext context, TargetToken targetToken, string clientDateTime = null, string newPass = "");

        Task<dynamic> ForceActiveUser(string userId);
        Task<object> ResetPasswordUser(ResetPassUser request, HttpContext context);
    }    
}

