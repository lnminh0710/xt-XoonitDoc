using DMS.Models;
using DMS.Utils.Caches;
using FirebaseNotification;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.Firebase
{
    /// <summary>
    /// FirebaseNotificationClient
    /// </summary>
    public class FirebaseNotificationClient : IFirebaseNotificationClient
    {
        private readonly FirebaseSettings _firebaseSettings;
        private static readonly FirebasePushNotification Notification = FirebasePushNotification.GetPushNotification();
        private static readonly log4net.ILog _log = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "Firebase");
        private readonly IUserLoginCache _userLoginCache;

        /// <summary>
        /// FirebaseNotificationClient
        /// </summary>
        /// <param name="firebaseSettings"></param>
        /// <param name="userLoginCache"></param>
        public FirebaseNotificationClient(IOptions<FirebaseSettings> firebaseSettings, IUserLoginCache userLoginCache)
        {
            _firebaseSettings = firebaseSettings.Value;
            _userLoginCache = userLoginCache;

            Notification.Config.YOUR_FCM_SERVER_API_KEY = _firebaseSettings.FCM_SERVER_API_KEY;
            Notification.Config.YOUR_FCM_SENDER_ID = _firebaseSettings.FCM_SENDER_ID;
            Notification.Config.UserGroupNamePrefix = "dmsuser_";
        }

        /// <summary>
        /// CreateOrUpdateUserGroup
        /// </summary>
        /// <param name="idLogin"></param>
        /// <param name="notificationKey"></param>
        /// <param name="deviceToken"></param>
        /// <returns></returns>
        public FirebaseNotifyResponse<ManageGroupResponse> CreateOrUpdateUserGroup(string idLogin, string notificationKey, string deviceToken)
        {
            return Notification.CreateOrUpdateUserGroup(idLogin, notificationKey, deviceToken);
        }

        public async Task SendNotificationToUsers(List<string> idLogins, string title, string message)
        {
            var sbLog = new StringBuilder();
            try
            {
                sbLog.AppendLine($"** SendNotificationToUsers:");
                if (idLogins == null || idLogins.Count == 0)
                {
                    sbLog.AppendLine($" -> IdLogins is empty");
                    return;
                }

                var list = _userLoginCache.GetUserFirebaseTokens(idLogins);
                if (list.Count > 0)
                {
                    List<Task> tasks = new List<Task>();
                    foreach (var item in list)
                    {
                        tasks.Add(SendNotificationAsyn(sbLog, item, title, message));
                    }//for
                    Task.WaitAll(tasks.ToArray());
                }
            }
            catch (Exception ex)
            {
                sbLog.AppendLine($" -> Exception: {ex}");
            }
            finally
            {
                _log.Info(sbLog);
                await Task.CompletedTask;
            }
        }

        private async Task SendNotificationAsyn(StringBuilder sbLog, UserLoginInfo user, string title, string message)
        {
            try
            {
                sbLog.Append($"* SendNotification: UserId: {user.IdLogin}");

                var response = Notification.SendNotification(user.FireBaseGroupToken, title, message);
                if (response.data != null && response.data.IsSuccess())
                    sbLog.AppendLine($" -> Success");
                else
                    sbLog.AppendLine($" -> Error: {response.GetMessage()}");
            }
            catch (Exception ex)
            {
                sbLog.AppendLine($" -> Exception: {ex}");
            }
            await Task.CompletedTask;
        }
    }
}
