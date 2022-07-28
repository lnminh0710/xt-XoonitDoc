using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SimpleTokenProvider;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using DMS.Constants;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System.Collections.Generic;
using DMS.Models.Authenticate;
using System.Reflection;
using DMS.Models.DMS;
using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using DMS.Cache;
using System.Net;

namespace DMS.Business
{
    /// <summary>
    /// AuthenticateBusiness
    /// </summary>
    public class AuthenticateBusiness : BaseBusiness, IAuthenticateBusiness
    {
        private readonly IUniqueService _uniqueService;
        private readonly JwtIssuerOptions _jwtOptions;
        private readonly AppSettings _appSettings;
        private readonly IUserService _userService;
        private readonly IEmailBusiness _emailBusiness;
        private readonly ICloudService _cloundService;
        private readonly IMapper _mapper;
        private MemoryCache _cache;
        private readonly IDocumentCommonBusiness _docCommonBusiness;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public AuthenticateBusiness(IHttpContextAccessor context, IOptions<JwtIssuerOptions> jwtOptions, IOptions<AppSettings> appSettings,
            ILoggerFactory loggerFactory, IUniqueService uniqueService, IUserService userService, IEmailBusiness emailBusiness, ICloudService cloundService, IMapper mapper,
            MyMemoryCache memoryCache, IDocumentCommonBusiness docCommonBusiness)
            : base(context)
        {
            _uniqueService = uniqueService;
            _jwtOptions = jwtOptions.Value;
            _appSettings = appSettings.Value;
            // check JWT Options at first before do anything else
            ThrowIfInvalidOptions(_jwtOptions);
            _userService = userService;
            _emailBusiness = emailBusiness;
            _cloundService = cloundService;
            _mapper = mapper;
            _cache = memoryCache.Cache;
            _docCommonBusiness = docCommonBusiness;
        }

        #region Private OAuth
        private static void ThrowIfInvalidOptions(JwtIssuerOptions options)
        {
            if (options == null) throw new ArgumentNullException(nameof(options));

            if (options.ValidFor <= TimeSpan.Zero)
            {
                throw new ArgumentException("Must be a non-zero TimeSpan.", nameof(JwtIssuerOptions.ValidFor));
            }

            if (options.SigningCredentials == null)
            {
                throw new ArgumentNullException(nameof(JwtIssuerOptions.SigningCredentials));
            }

            if (options.JtiGenerator == null)
            {
                throw new ArgumentNullException(nameof(JwtIssuerOptions.JtiGenerator));
            }
        }

        /// <returns>Date converted to seconds since Unix epoch (Jan 1, 1970, midnight UTC).</returns>
        private static long ToUnixEpochDate(DateTime date)
          => (long)Math.Round((date.ToUniversalTime() - new DateTimeOffset(1970, 1, 1, 0, 0, 0, TimeSpan.Zero)).TotalSeconds);

        /// <summary>
        /// IMAGINE BIG RED WARNING SIGNS HERE!
        /// You'd want to retrieve claims through your claims provider
        /// in whatever way suits you, the below is purely for demo purposes!
        /// </summary>
        private static Task<ClaimsIdentity> GetClaimsIdentity(User user)
        {
            return Task.FromResult(new ClaimsIdentity(new GenericIdentity(user.Email, "Token"),
                  new Claim[] { }));
        }

        /// <summary>
        /// BuildClaims
        /// </summary>
        /// <param name="userFromService"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        private async Task<OAuthTokens> BuildOAuthTokens(UserFromService userFromService, User user, TimeSpan validFor, Claim[] additionalClaims = null, string message = null, string messageType = null, TimeSpan? validForRefreshToken = null)
        {

            if (string.IsNullOrEmpty(userFromService.UserGuid))
                userFromService.UserGuid = Guid.NewGuid().ToString();

            return await HandleBuildOAuthTokens(userFromService, user, validFor, additionalClaims, message, messageType, validForRefreshToken);
        }

        #endregion

        #region Login
        private async Task<OAuthTokens> CreateTokenFromUserAsync(UserFromService userFromService, User user)
        {
            if (userFromService == null || string.IsNullOrWhiteSpace(userFromService.IdLogin))
            {
                _logger.Error($"Invalid loginName/password - {JsonConvert.SerializeObject(userFromService)}");
                return new OAuthTokens()
                {
                    access_token = null,
                    expires_in = null,
                    token_type = null,
                    refresh_token = null
                };
            }
            if (!string.IsNullOrEmpty(userFromService.Message) && !string.IsNullOrEmpty(userFromService.MessageType))
            {
                _logger.Error(string.Format($"account:{user.Email} - message:{userFromService.Message} - {JsonConvert.SerializeObject(userFromService)}"));
                switch (int.Parse(userFromService.MessageType))
                {
                    case (int)EAuthMessageType.Expired:
                    case (int)EAuthMessageType.Denied:
                        return new OAuthTokens()
                        {
                            access_token = null,
                            expires_in = null,
                            token_type = null,
                            refresh_token = null,
                            message = userFromService.Message,
                            message_type = userFromService.MessageType
                        };
                }
            }
            user.IdLogin = userFromService.IdLogin;
            user.IdApplicationOwner = userFromService.IdApplicationOwner;
            Data data = ServiceDataRequest;
            data.IdApplicationOwner = user.IdApplicationOwner;
            data.IdLogin = user.IdLogin;

            CloudActiveUserModel cl = await _cloundService.GetCloudActiveByUser(data);
            CacheUtils.PutCloudInfo(_cache, user.IdLogin, cl);
            if (cl == null)
            {
                userFromService.IdCloudConnection = null;
                userFromService.InfoCloud = "";
            }
            else
            {
                userFromService.IdCloudConnection = cl.IdCloudConnection + ""; // re-update IdCloudConnection to TokenUser after change Cloud
                userFromService.InfoCloud = JsonConvert.SerializeObject(cl);
            }

            var accessTokenExpire = _appSettings.OAuthAccessTokenExpire;
            var refreshTokenExpire = _appSettings.OAuthRefreshTokenExpire;
            if (user.AccessTokenExpire > 0)
            {
                accessTokenExpire = user.AccessTokenExpire;
                refreshTokenExpire = accessTokenExpire * 2;
            }

            userFromService.AvatarDefault = _appSettings.AvatarDefault;
            return await BuildOAuthTokens(userFromService, user, TimeSpan.FromHours(accessTokenExpire), null, userFromService.Message, userFromService.MessageType, validForRefreshToken: TimeSpan.FromHours(refreshTokenExpire));
        }

        public string GetUserAvatar(string loginPicture, bool isMobile = false)
        {
            var stringApi = isMobile ? "" : "/api/";
            var avatar = string.IsNullOrWhiteSpace(loginPicture)
                    ? _appSettings.AvatarDefault
                    : $"{stringApi}FileManager/GetFile?name={WebUtility.UrlEncode(loginPicture)}&mode={UploadMode.Profile}";
            return avatar;
        }

        private async Task<OAuthTokens> LoginByAccount(User user, HttpContext context)
        {
            var result = await _uniqueService.GetUser(user.Email, user.Password);
            if (result != null)
            {
                result.LoginPicture = GetUserAvatar(result.LoginPicture);
            }
            return await CreateTokenFromUserAsync(result, user);
        }

        public async Task<OAuthTokens> Login(User user, HttpContext context)
        {
            // hash pwd before check
            user.Password = string.IsNullOrEmpty(user.PasswordHash) ? Common.SHA256Hash(user.Password) : user.PasswordHash;

            return await LoginByAccount(user, context);
        }

        public async Task<OAuthTokens> LoginByUserId(string idLogin, HttpContext context)
        {
            string email = "";
            string password = "";

            #region Get loginName and password
            UserProfileGetData data = (UserProfileGetData)ServiceDataRequest.ConvertToRelatedType(typeof(UserProfileGetData));
            data.IdPerson = idLogin;
            var userResult = (WSDataReturn)await _userService.GetUserById(data);
            if (userResult.Data.Count > 1)
            {
                var children = userResult.Data[1].Children<JObject>();
                JObject jEmail = children.FirstOrDefault(o => o["ColumnName"] != null && o["ColumnName"].ToString() == "Email");
                if (jEmail != null)
                {
                    email = jEmail["Value"] + string.Empty;
                }

                JObject jPassword = children.FirstOrDefault(o => o["ColumnName"] != null && o["ColumnName"].ToString() == "Password");
                if (jPassword != null)
                {
                    password = jPassword["Value"] + string.Empty;
                }
            }
            #endregion

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                _logger.Error($"Cannot get the loginName and password by idLogin - {JsonConvert.SerializeObject(idLogin)}");
                return new OAuthTokens()
                {
                    access_token = null,
                    expires_in = null,
                    token_type = null,
                    refresh_token = null
                };
            }

            var user = new User { IdLogin = idLogin, Email = email, Password = password };

            return await LoginByAccount(user, context);
        }

        #endregion

        #region Reset Password

        public async Task<OAuthTokens> ForgotPassword(SignUpAccount userClient, HttpContext context)
        {
            if (userClient == null || string.IsNullOrWhiteSpace(userClient.Email)) return new OAuthTokens
            {
                result = "invalid",
                message = "Invalid email!"
            };

            var userDb = await _uniqueService.GetUserByIdOrEmail(null, userClient.Email);
            if (userDb == null) return new OAuthTokens
            {
                result = "invalid",
                message = "Account does not exist!"
            };
            if (!userDb.IsLoginActived.HasValue || !userDb.IsLoginActived.Value || !userDb.IsBlocked.HasValue || userDb.IsBlocked.Value)
                return new OAuthTokens
                {
                    result = "invalid",
                    message = "Account has not confirmed yet!"
                };

            var userToken = new UserToken
            {
                IdLogin = userDb.IdLogin
            };
            var oAuthToken = await GenerateOAuthTokenForSentEmail(new HandleAccessTokenModel
            {
                UserToken = userToken,
                UserFromDb = userDb,
                UserClient = new User { Email = userDb.Email, Password = userDb.Password },
                TokenTarget = TargetToken.FORGOT_PASSWORD
            });

            var result = await SendEmailTemplate(
                new User { Email = userDb.Email, FirstName = userDb.FirstName, LastName = userDb.LastName },
                oAuthToken, context, TargetToken.FORGOT_PASSWORD, userClient.CurrentDateTime);

            if (!result) return null;

            return await CreateTokenFromUserAsync(userDb, new User { Email = userDb.Email, Password = userDb.Password });
        }

        public async Task<OAuthTokens> ChangePassword(User clientUser)
        {
            try
            {
                if (clientUser == null || string.IsNullOrWhiteSpace(clientUser.Password) || string.IsNullOrWhiteSpace(clientUser.NewPassword)) return null;

                var hashPass = Common.SHA256Hash(clientUser.Password);
                var userDb = await _uniqueService.GetUser(UserFromService.Email, hashPass);
                if (userDb == null)
                    return new OAuthTokens
                    {
                        result = "error-wrong-pass",
                        message = "Current Password is wrong, please try again!"
                    };

                var hashNewPass = Common.SHA256Hash(clientUser.NewPassword);
                LoginData loginDataChangePass = new LoginData
                {
                    IdLogin = userDb.IdLogin,
                    Email = userDb.Email,
                    Password = hashNewPass,
                    IdApplicationOwner = userDb.IdApplicationOwner,
                    LoginLanguage = userDb.IdRepLanguage
                };
                var result = await _uniqueService.ChangePassword(loginDataChangePass);
                if (result == null || result.ReturnID != UserFromService.IdLogin) return null;

                var updatedUserClient = new User
                {
                    Email = userDb.Email,
                    Password = hashNewPass,
                    IdApplicationOwner = userDb.IdApplicationOwner,
                    IdRepLanguage = userDb.IdRepLanguage
                };

                return await CreateTokenFromUserAsync(userDb, updatedUserClient);
            }
            catch (Exception ex)
            {
                _logger.Error($"ChangePassword: {JsonConvert.SerializeObject(clientUser)}", ex);
                return null;
            }
        }
        #endregion

        #region Update Password
        public async Task<OAuthTokens> UpdatePassword(string accesstoken, string newPass, HttpContext context)
        {
            var data = await HandleAccessToken(accesstoken);

            var hashNewPass = Common.SHA256Hash(newPass);
            LoginData loginDataChangePass = new LoginData
            {
                IdLogin = data.UserFromDb.IdLogin,
                Email = data.UserFromDb.Email,
                Password = hashNewPass,
                IdApplicationOwner = data.UserFromDb.IdApplicationOwner,
                LoginLanguage = data.UserFromDb.IdRepLanguage
            };
            var resultUpdatePassword = await _uniqueService.ChangePassword(loginDataChangePass);
            if (resultUpdatePassword == null || resultUpdatePassword.ReturnID != data.UserFromService.IdLogin) return null;

            if (data.TokenTarget.Equals(TargetToken.NEW_PASSWORD) || data.TokenTarget.Equals(TargetToken.RESEND_NEW_PASSWORD))
            {
                LoginData loginDataChangeStatus = new LoginData
                {
                    IdLogin = data.UserFromService.IdLogin,
                    IsLoginActived = true,
                    IdApplicationOwner = data.UserFromDb.IdApplicationOwner,
                    LoginLanguage = data.UserFromDb.IdRepLanguage
                };
                var resultUpdateLoginActive = await _uniqueService.UpdateLoginActive(loginDataChangeStatus);
                if (resultUpdateLoginActive == null || resultUpdateLoginActive.ReturnID != data.UserFromService.IdLogin) return null;
            }

            await SendEmailTemplate(
                new User { Email = data.UserFromDb.Email, FirstName = data.UserFromDb.FirstName, LastName = data.UserFromDb.LastName },
                new OAuthTokens(), context, TargetToken.RESET_PASSWORD_SUCCESS);
            data.UserFromDb.Password = hashNewPass;
            data.UserClient.Password = hashNewPass;

            try
            {
                await _docCommonBusiness.CreateCommonFolderUser(data.UserFromService.IdLogin, "Indexing");
                await _docCommonBusiness.CreateCommonFolderUser(data.UserFromService.IdLogin, "Mail");
            }
            catch (Exception ex)
            {
                _logger.Error($"UpdatePassword.CreateCommonFolderUser: {data.UserFromService.IdLogin}", ex);
            }

            return await CreateTokenFromUserAsync(data.UserFromDb, data.UserClient);
        }
        public async Task<object> ResetPasswordUser(ResetPassUser request, HttpContext context)
        {
            if (!UserFromService.IsAdmin.Value && !UserFromService.IsSuperAdmin.Value) return null;
            if (UserFromService.IsAdmin.Value && !UserFromService.IdSharingCompany.Equals(request.IdPerson.ToString())) return null;

            string newPass = "";
            if (request.IsAutoGenerate) newPass = Common.AutoGenerateNewPassword(9);
            else newPass = request.NewPassword;
            if (string.IsNullOrWhiteSpace(newPass)) return null;

            var userDb = await _uniqueService.GetUserByIdOrEmail(request.IdLogin.ToString(), "");
            if (userDb == null) return null;

            var hashNewPass = Common.SHA256Hash(newPass);
            LoginData loginDataChangePass = new LoginData
            {
                IdLogin = userDb.IdLogin,
                Email = userDb.Email,
                Password = hashNewPass,
                IdApplicationOwner = userDb.IdApplicationOwner,
                LoginLanguage = userDb.IdRepLanguage
            };
            var result = await _uniqueService.ChangePassword(loginDataChangePass);
            if (result == null || result?.ReturnID == "-1") return null;

            await SendEmailTemplate(
                new User { Email = userDb.Email, FirstName = userDb.FirstName, LastName = userDb.LastName },
                new OAuthTokens(), context, TargetToken.RESET_PASS_BY_ADMIN_SUCCESS, null, newPass);

            return request.IsAutoGenerate ? newPass : StatusCodes.Status200OK.ToString();
        }
        #endregion

        #region Send Notification
        /// <summary>
        /// SendNotificationForExpiredUser
        /// </summary>
        /// <param name="loginName"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        public async Task<bool> SendNotificationForExpiredUser(string loginName, string content)
        {
            var resultSendEmail = await _uniqueService.SendNotificationForExpiredUser(loginName, content);

            return resultSendEmail;
        }
        #endregion

        #region Refresh token
        public async Task<OAuthTokens> RefreshToken()
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(AccessToken) as JwtSecurityToken;
            var isRefreshToken = jsonToken.Claims.FirstOrDefault(c => c.Type == ConstAuth.IsRefreshToken);
            if (isRefreshToken == null || isRefreshToken.Value != "true")
                return new OAuthTokens()
                {
                    access_token = null,
                    expires_in = null,
                    token_type = null,
                    refresh_token = null,
                    message = null,
                    message_type = null
                };
            return await BuildOAuthTokens(UserFromService, GetUserInfoFromToken(), TimeSpan.FromHours(_appSettings.OAuthAccessTokenExpire), validForRefreshToken: TimeSpan.FromHours(_appSettings.OAuthRefreshTokenExpire));
        }
        #endregion

        #region signup
        public async Task<dynamic> SignUp(SignUpAccount signUpAccount, HttpContext context)
        {
            signUpAccount.Password = Common.SHA256Hash(GenrateNewPassword(signUpAccount.Email));
            var user = new User
            {
                Email = signUpAccount.Email,
                Password = signUpAccount.Password
            };

            var idApplicationOwner = UserFromService.IdApplicationOwner ?? "1"; // user signup not has owner
            var idLoginCurrentUser = signUpAccount.IdAppUser ?? "1"; // user signup not has current idLogin
            if (string.IsNullOrEmpty(signUpAccount.IdLoginRoles))
                signUpAccount.IdLoginRoles = UserEncrypted.GetIdUserRole(signUpAccount.IdLoginRoles ?? UserEncrypted.PERSONAL_USER.ToString()) + "";

            var response = await _uniqueService.CreateUserAccount(signUpAccount, idApplicationOwner, idLoginCurrentUser);
            if (response.Count == 0
                || (response.Count > 0 && response[0].ReturnID == "-1")) return new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = response[0].UserErrorMessage };

            // if account is block will be not send email
            if (signUpAccount.IsBlocked) return new ApiResultResponse { StatusCode = ApiMethodResultId.Success, ResultDescription = response[0].UserErrorMessage };

            var userToken = new UserToken
            {
                IdLogin = response[0].ReturnID
            };

            var oAuthTokens = await GenerateOAuthTokenForSentEmail(new HandleAccessTokenModel
            {
                UserToken = userToken,
                UserClient = user,
                TokenTarget = TargetToken.NEW_PASSWORD
            });
            if (oAuthTokens == null) new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = "System error, cannot create token!" };

            var sendEmailResult = await SendEmailTemplate(new User { Email = signUpAccount.Email, FirstName = signUpAccount.FirstName, LastName = signUpAccount.LastName },
                oAuthTokens, context, TargetToken.NEW_PASSWORD, signUpAccount.CurrentDateTime);
            if (!sendEmailResult) return new ApiResultResponse { StatusCode = ApiMethodResultId.InvalidMethod, ResultDescription = "User is created but cannot send activation email to email user!" };

            return new ApiResultResponse { StatusCode = ApiMethodResultId.Success, ResultDescription = response[0].UserErrorMessage };
        }
        public async Task<dynamic> NewAccount(NewAccount newAccount, HttpContext context)
        {
            //if (string.IsNullOrWhiteSpace(UserFromService.Encrypted)
            //    || (!string.IsNullOrWhiteSpace(UserFromService.Encrypted)
            //        && (UserFromService.Encrypted.Equals(UserEncrypted.PERSONAL_USER) || UserFromService.Encrypted.Equals(UserEncrypted.USER)))) return null;
            int idUserRole = UserEncrypted.GetIdUserRole(newAccount.Encrypted);
            if (idUserRole == 0)
                return null;

            newAccount.Password = Common.SHA256Hash(GenratePasswordDefault(newAccount.Email));
            newAccount.IsBlocked = newAccount.IsBlocked;
            newAccount.IdRepLanguage = UserFromService.IdRepLanguage ?? "1";
            newAccount.IdAppUser = UserFromService.IdAppUser ?? "1";
            newAccount.IdLoginRoles = idUserRole.ToString();

            TrimNewAccount(newAccount);

            var signUpAcc = _mapper.Map<SignUpAccount>(newAccount);
            return await SignUp(signUpAcc, context);
        }

        private void TrimNewAccount(NewAccount newAccount)
        {
            if (newAccount.LastName != null) newAccount.LastName = newAccount.LastName.Trim();
            if (newAccount.FirstName != null) newAccount.FirstName = newAccount.FirstName.Trim();
            if (newAccount.PhoneNr != null) newAccount.PhoneNr = newAccount.PhoneNr.Trim();
            if (newAccount.Company != null) newAccount.Company = newAccount.Company.Trim();
            if (newAccount.Initials != null) newAccount.Initials = newAccount.Initials.Trim();
        }

        private string GenratePasswordDefault(string email)
        {
            return $"{ConstAuth.PASSWORD_DEFAULT}_{email}_{ConstAuth.WEBSITE}";
        }
        #endregion

        #region Helper
        private string GenrateNewPassword(string email)
        {
            var currentDateTime = DateTime.Now.Ticks.ToString();
            var currentYear = DateTime.Now.Year;
            return $"X@@N{currentYear}_{email}_{currentDateTime}";
        }
        #endregion

        #region Email
        public async Task<bool> SendEmailTemplate(
            User user, OAuthTokens oAuthTokens, HttpContext context, TargetToken targetToken, string clientDateTime = null, string newPass = "")
        {
            try
            {
                var emailTemplate = new EmailWithTemplateModel
                {
                    Name = $"{user.FirstName} {user.LastName}",
                    ToEmail = user.Email
                };

                var result = false;
                switch (targetToken)
                {
                    case TargetToken.NEW_PASSWORD:
                    case TargetToken.RESEND_NEW_PASSWORD:
                        emailTemplate.CallbackUrl = $"{Common.GetFullDomainUrl(context)}/auth/login?token={oAuthTokens.access_token}";
                        emailTemplate.UrlExprired = $"{_appSettings.OAuthAccessTokenExpireForConfirmEmail} Minutes";
                        //emailTemplate.UrlExpriredDateTime = expriredTime;
                        result = await _emailBusiness.SendEmailActivate(emailTemplate);
                        break;
                    case TargetToken.FORGOT_PASSWORD:
                        emailTemplate.CallbackUrl = $"{Common.GetFullDomainUrl(context)}/auth/login?token={oAuthTokens.access_token}";
                        emailTemplate.UrlExprired = $"{_appSettings.OAuthAccessTokenExpireForConfirmEmail} Minutes";
                        //emailTemplate.UrlExpriredDateTime = expriredTime;
                        result = await _emailBusiness.SendEmailResetPassword(emailTemplate);
                        break;
                    case TargetToken.RESET_PASSWORD_SUCCESS:
                    case TargetToken.RESET_PASS_BY_ADMIN_SUCCESS:
                        emailTemplate.CallbackUrl = $"{Common.GetFullDomainUrl(context)}/module";
                        result = await _emailBusiness.SendEmailChangePasswordSuccess(emailTemplate, newPass);
                        break;
                    default:
                        break;
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.Error($"SendEmailTemplate: {JsonConvert.SerializeObject(user)}", ex);
                return false;
            }
        }
        public async Task<dynamic> ResendEmailNewPass(SignUpAccount signUpAccount, string accesstoken, HttpContext context)
        {
            try
            {
                var data = await HandleAccessToken(accesstoken);
                if (data == null) return null;
                var user = new User
                {
                    Email = data.UserFromDb.Email,
                    FirstName = data.UserFromDb.FirstName,
                    LastName = data.UserFromDb.LastName
                };

                var oAuthTokens = await GenerateOAuthTokenForSentEmail(data);
                return await SendEmailTemplate(user, oAuthTokens, context, TargetToken.RESEND_NEW_PASSWORD, signUpAccount.CurrentDateTime);
            }
            catch (Exception ex)
            {
                _logger.Error($"ResendEmailNewPass: {JsonConvert.SerializeObject(signUpAccount)}", ex);
                return null;
            }
        }

        public async Task<dynamic> ResendActivateEmail(User clientUser, HttpContext context)
        {
            try
            {
                var userDb = await _uniqueService.GetUserByIdOrEmail(clientUser.IdLogin, null);
                if (userDb == null) return null;

                var userToken = new UserToken
                {
                    IdLogin = userDb.IdLogin
                };
                var data = new HandleAccessTokenModel
                {
                    UserClient = new User
                    {
                        Email = userDb.Email,
                        Password = userDb.Password,
                        FirstName = userDb.FirstName,
                        LastName = userDb.LastName
                    },
                    UserFromDb = userDb,
                    UserToken = userToken,
                    TokenTarget = TargetToken.RESEND_NEW_PASSWORD
                };

                var oAuthTokens = await GenerateOAuthTokenForSentEmail(data);
                var result = await SendEmailTemplate(data.UserClient, oAuthTokens, context, TargetToken.RESEND_NEW_PASSWORD, clientUser.CurrentDateTime);
                if (!result) return null;

                return _mapper.Map<UserInfo>(userDb);
            }
            catch (Exception ex)
            {
                _logger.Error($"ResendActivateEmail: {JsonConvert.SerializeObject(clientUser)}", ex);
                return null;
            }
        }
        #endregion

        #region TOKEN
        public async Task<OAuthTokens> GenerateOAuthTokenForSentEmail(HandleAccessTokenModel data)
        {
            try
            {
                var secretKeyClaim = new Claim(ConstAuth.NewSecretKey,
                Common.SHA256Hash(_appSettings.OAuthSecretKey + DateTime.Now.ToString("yyyyddMM")));
                var tokenTargetClaim = new Claim(AuthenticateConstant.TokenTarget, data.TokenTarget.ToString());

                var oAuthTokens = await HandleBuildOAuthTokens(data.UserToken, data.UserClient, TimeSpan.FromMinutes(_appSettings.OAuthAccessTokenExpireForConfirmEmail), new[] { secretKeyClaim, tokenTargetClaim });

                if (oAuthTokens == null && string.IsNullOrWhiteSpace(oAuthTokens.access_token)) return null;
                return oAuthTokens;
            }
            catch (Exception ex)
            {
                _logger.Error($"GenerateOAuthTokenForSentEmail: {JsonConvert.SerializeObject(data)}", ex);
                return null;
            }
        }

        private async Task<OAuthTokens> HandleBuildOAuthTokens(
            dynamic userFromService,
            User user,
            TimeSpan validFor,
            Claim[] additionalClaims = null,
            string message = null,
            string messageType = null,
            TimeSpan? validForRefreshToken = null)
        {
            var identity = await GetClaimsIdentity(user);
            if (identity == null)
            {
                _logger.Error($"Invalid loginName ({user.Email}) or password ({user.Password})");
                return new OAuthTokens()
                {
                    access_token = null,
                    expires_in = null,
                    token_type = null,
                    refresh_token = null,
                    message = message,
                    message_type = messageType
                };
            }

            // convert user object to string and encrypt it to hide from client
            // before assign to Claim Sub
            var strUser = JsonConvert.SerializeObject(user);

            var strResult = JsonConvert.SerializeObject(userFromService, Formatting.Indented);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, Common.Encrypt(strUser)),
                new Claim(JwtRegisteredClaimNames.Jti, await _jwtOptions.JtiGenerator()),
                new Claim(JwtRegisteredClaimNames.Iat, ToUnixEpochDate(_jwtOptions.IssuedAt).ToString(), ClaimValueTypes.Integer64),
                new Claim(ConstAuth.AppInfoKey, strResult, ClaimValueTypes.String),
                identity.FindFirst(ConstAuth.RoleKey)
            };

            // add additionalClaims to claims
            if (additionalClaims != null)
            {
                int originalClaimsSize = claims.Length;
                Array.Resize(ref claims, originalClaimsSize + additionalClaims.Length);
                additionalClaims.CopyTo(claims, originalClaimsSize - 1);
            }
            ///----------refresh token------------------
            string refreshToken = string.Empty;
            if (validForRefreshToken != null)
            {
                _jwtOptions.ValidFor = (TimeSpan)validForRefreshToken;
                var _claims = new[]
                {
                    new Claim(ConstAuth.IsRefreshToken, "true", ClaimValueTypes.String),
                };
                int originalClaimsSize = claims.Length;
                Array.Resize(ref claims, originalClaimsSize + 1);
                _claims.CopyTo(claims, originalClaimsSize - 1);
                // Create the JWT security token and encode it.
                var _jwt = new JwtSecurityToken(
                    issuer: _jwtOptions.Issuer,
                    audience: _jwtOptions.Audience,
                    claims: claims,
                    notBefore: _jwtOptions.NotBefore,
                    expires: _jwtOptions.Expiration,
                    signingCredentials: _jwtOptions.SigningCredentials);

                refreshToken = new JwtSecurityTokenHandler().WriteToken(_jwt);
                claims[originalClaimsSize - 1] = null;
            }

            //----------access token------------------
            _jwtOptions.ValidFor = validFor;
            // Create the JWT security token and encode it.
            var jwt = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                notBefore: _jwtOptions.NotBefore,
                expires: "TEST_TOKEN".Equals(user.IdRepLanguage) ? DateTime.UtcNow.AddMinutes(1) : _jwtOptions.Expiration,
                signingCredentials: _jwtOptions.SigningCredentials);

            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            return new OAuthTokens()
            {
                access_token = encodedJwt,
                expires_in = _jwtOptions.ValidFor.TotalSeconds.ToString(),
                token_type = ConstAuth.TokenType,
                refresh_token = refreshToken,
                result = "Successfully",
                message = message,
                message_type = messageType,
            };
        }
        private JwtSecurityToken ReadToken(string accessToken)
        {
            JwtSecurityToken data = null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                data = handler.ReadToken(accessToken) as JwtSecurityToken;
                return data;
            }
            catch (Exception ex)
            {
                _logger.Error($"ReadToken: {JsonConvert.SerializeObject(accessToken)}", ex);
                return data;
            }
        }
        public async Task<CheckTokenResult> CheckToken(Token token)
        {
            var result = new CheckTokenResult();
            result.IsValid = false;

            var jsonToken = ReadToken(token.AccessToken);
            if (jsonToken == null) return result;

            if (jsonToken.ValidTo < DateTime.UtcNow)
            {
                result.IsValid = true;
                result.IsExpired = true;
                return result;
            }
            var jsonCurrentUser = jsonToken.Claims.Where(x => x.Type.Equals(ConstAuth.AppInfoKey)).FirstOrDefault();
            var currentUser = jsonCurrentUser != null ? JsonConvert.DeserializeObject<UserFromService>(jsonCurrentUser.Value) : null;
            if (currentUser == null || string.IsNullOrWhiteSpace(currentUser.IdLogin))
            {
                _logger.Error($"CheckToken: Token don't have user info {JsonConvert.SerializeObject(currentUser)}");
                return result;
            }

            var userFromDb = await _uniqueService.GetUserByIdOrEmail(currentUser.IdLogin, null);
            if (userFromDb == null || (userFromDb.IsBlocked.HasValue && userFromDb.IsBlocked == true))
            {
                _logger.Error($"CheckToken: Db don't have user info {JsonConvert.SerializeObject(currentUser)}");
                return result;
            }

            var typeTokenString = jsonToken.Claims.FirstOrDefault(x => x.Type.Equals(AuthenticateConstant.TokenTarget))?.Value;
            Enum.TryParse(typeTokenString, out TargetToken typeToken);
            switch (typeToken)
            {
                case TargetToken.SIGN_IN:
                    result.IsValid = userFromDb.IsLoginActived.HasValue && userFromDb.IsLoginActived.Value;
                    break;
                case TargetToken.NEW_PASSWORD:
                case TargetToken.RESEND_NEW_PASSWORD:
                    result.IsValid = !(userFromDb.IsLoginActived.HasValue && userFromDb.IsLoginActived == true);
                    result.IsConfirmEmail = true;
                    break;
                case TargetToken.FORGOT_PASSWORD:
                    result.IsValid = userFromDb.IsLoginActived.HasValue && userFromDb.IsLoginActived == true;
                    result.IsForgot = true; break;
                default:
                    result.IsValid = false; break;
            }

            return result;
        }
        private async Task<HandleAccessTokenModel> HandleAccessToken(string accesstoken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(accesstoken)) return null;

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
                var userClient = JsonConvert.DeserializeObject<User>(Common.Decrypt(jsonToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value));
                var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
                var tokenTargetClient = jsonToken.Claims.FirstOrDefault(c => c.Type == AuthenticateConstant.TokenTarget)?.Value;

                if (userFromService == null) return null;
                var userFromDb = await _uniqueService.GetUserByIdOrEmail(userFromService.IdLogin, null);

                if (userFromDb == null || userClient == null || string.IsNullOrWhiteSpace(tokenTargetClient) || userFromService == null) return null;

                var isInvalid = false;
                Enum.TryParse(tokenTargetClient, out TargetToken typeToken);
                switch (typeToken)
                {
                    case TargetToken.NEW_PASSWORD:
                    case TargetToken.RESEND_NEW_PASSWORD:
                        isInvalid = !userFromDb.Email.Equals(userClient.Email);
                        break;
                    case TargetToken.FORGOT_PASSWORD:
                        isInvalid = !userFromDb.Email.Equals(userClient.Email);
                        break;
                    default:
                        break;
                }
                if (isInvalid) return null;

                return new HandleAccessTokenModel
                {
                    UserFromDb = userFromDb,
                    UserClient = userClient,
                    TokenTarget = typeToken,
                    UserFromService = userFromDb,
                    UserToken = new UserToken { IdLogin = userFromService.IdLogin }
                };
            }
            catch (Exception ex)
            {
                _logger.Error($"HandleAccessToken: {JsonConvert.SerializeObject(accesstoken)}", ex);
                return null;
            }
        }
        #endregion

        public async Task<OAuthTokens> ForceRefreshToken()
        {
            if (UserFromService == null)
            {
                return new OAuthTokens()
                {
                    access_token = null,
                    expires_in = null,
                    token_type = null,
                    refresh_token = null,
                    message = null,
                    message_type = null
                };
            }
            Data data = ServiceDataRequest;
            CloudActiveUserModel cl = await _cloundService.GetCloudActiveByUser(data);
            CacheUtils.PutCloudInfo(_cache, data.IdLogin, cl);
            if (cl == null)
            {
                UserFromService.IdCloudConnection = null;
                UserFromService.InfoCloud = "";
            }
            else
            {
                UserFromService.IdCloudConnection = cl.IdCloudConnection + ""; // re-update IdCloudConnection to TokenUser after change Cloud
                UserFromService.InfoCloud = JsonConvert.SerializeObject(cl);
            }

            return await BuildOAuthTokens(UserFromService, GetUserInfoFromToken(), TimeSpan.FromHours(_appSettings.OAuthAccessTokenExpire), validForRefreshToken: TimeSpan.FromHours(_appSettings.OAuthRefreshTokenExpire));
        }

        public async Task<dynamic> ChangeStatusUser(UserInfo user, HttpContext httpContext)
        {
            try
            {
                if (user == null || string.IsNullOrWhiteSpace(user.IdLogin)) return null;
                var userDb = await _uniqueService.GetAllUserByIdOrEmail(user.IdLogin, null);
                if (userDb == null) return null;

                LoginData loginDataChangeStatus = new LoginData
                {
                    IdLogin = user.IdLogin,
                    IsBlocked = user.Active.HasValue ? !user.Active.Value : user.Active,
                    IdApplicationOwner = user.IdApplicationOwner
                };


                var uerToken = new UserToken
                {
                    IdLogin = userDb.IdLogin
                };
                var dataGenrateToken = new HandleAccessTokenModel
                {
                    UserClient = new User
                    {
                        Email = userDb.Email,
                        Password = userDb.Password,
                        FirstName = userDb.FirstName,
                        LastName = userDb.LastName
                    },
                    UserFromDb = userDb,
                    UserToken = uerToken,
                    TokenTarget = TargetToken.RESEND_NEW_PASSWORD
                };
                var oAuthTokensAsync = GenerateOAuthTokenForSentEmail(dataGenrateToken);

                var resultUpdateStatus = await _uniqueService.UpdateUserStatus(loginDataChangeStatus);
                if (resultUpdateStatus == null || resultUpdateStatus.ReturnID != user.IdLogin) return null;

                if (loginDataChangeStatus.IsBlocked.HasValue && loginDataChangeStatus.IsBlocked.Value)
                {
                    user.IsLoginActived = false;
                    return user;
                }

                var result = await SendEmailTemplate(dataGenrateToken.UserClient, await oAuthTokensAsync, httpContext, TargetToken.RESEND_NEW_PASSWORD, user.CurrentDateTime);
                if (!result) return null;

                userDb.IsBlocked = false;
                user.IsLoginActived = true;
                try
                {
                    await _docCommonBusiness.CreateCommonFolderUser(user.IdLogin, "Indexing");
                    await _docCommonBusiness.CreateCommonFolderUser(user.IdLogin, "Mail");
                }
                catch (Exception ex)
                {
                    _logger.Error($"ChangeStatusUser.CreateCommonFolderUser: {user.IdLogin}", ex);
                }
                return _mapper.Map<UserInfo>(userDb);
            }
            catch (Exception ex)
            {
                _logger.Error($"ChangeStatusUser: {JsonConvert.SerializeObject(user)}", ex);
                return null;
            }
        }

        public string GenrateNewPasswordWithEmailChanged(string email)
        {
            return Common.SHA256Hash(GenrateNewPassword(email));
        }
        public async Task<string> GenerateTokenWithNewEmail(UserProfileDetail signUpAccount, string idLogin, HttpContext context)
        {
            var user = new User
            {
                Email = signUpAccount.Email,
                Password = signUpAccount.Password
            };

            var userToken = new UserToken
            {
                IdLogin = idLogin
            };

            var oAuthTokens = await GenerateOAuthTokenForSentEmail(new HandleAccessTokenModel
            {
                UserToken = userToken,
                UserClient = user,
                TokenTarget = TargetToken.NEW_PASSWORD
            });
            if (oAuthTokens == null)
            {
                throw new Exception("System error, cannot create token!");
            }

            var sendEmailResult = await SendEmailTemplate(new User { Email = signUpAccount.Email, FirstName = signUpAccount.FirstName, LastName = signUpAccount.LastName },
              oAuthTokens, context, TargetToken.NEW_PASSWORD, signUpAccount.CurrentDateTime);

            if (!sendEmailResult)
            {
                throw new Exception("User is created but cannot send activation email to email user!");
            }

            return "DONE";

        }

        public async Task<dynamic> ForceActiveUser(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId)) return null;
                var userDb = await _uniqueService.GetAllUserByIdOrEmail(userId, null);
                if (userDb == null)
                {
                    throw new Exception($"Not found user on DB. UserId: {userId}");
                }

                LoginData loginDataChangeStatus = new LoginData
                {
                    IdLogin = userId,
                    IsBlocked = false,
                    IsLoginActived = true
                };

                var uerToken = new UserToken
                {
                    IdLogin = userDb.IdLogin
                };

                var resultUpdateStatus = await _uniqueService.UpdateUserStatus(loginDataChangeStatus);
                if (resultUpdateStatus == null || resultUpdateStatus.ReturnID != userId)
                {
                    _logger.Error($"ForceActiveUser: {userId} cannot active user. result update: {(resultUpdateStatus != null ? JsonConvert.SerializeObject(resultUpdateStatus) : null)}");
                    throw new Exception($"error system.");
                }
                userDb.IsBlocked = false;
                userDb.IsLoginActived = true;
                try
                {
                    await _docCommonBusiness.CreateCommonFolderUser(userId, "Indexing");
                    await _docCommonBusiness.CreateCommonFolderUser(userId, "Mail");
                } catch (Exception ex) {
                    _logger.Error($"ForceActiveUser.CreateCommonFolderUser: {userId}", ex);
                }
                return _mapper.Map<UserInfo>(userDb);
            }
            catch (Exception ex)
            {
                _logger.Error($"ForceActiveUser: {userId}", ex);
                throw ex;
            }
        }

    }
}
