using FirebaseNotification;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Utils.Firebase
{
    /// <summary>
    /// IFirebaseNotificationClient
    /// </summary>
    public interface IFirebaseNotificationClient
    {
        /// <summary>
        /// CreateOrUpdateUserGroup
        /// </summary>
        /// <param name="idLogin"></param>
        /// <param name="notificationKey"></param>
        /// <param name="deviceToken"></param>
        /// <returns></returns>
        FirebaseNotifyResponse<ManageGroupResponse> CreateOrUpdateUserGroup(string idLogin, string notificationKey, string deviceToken);

        /// <summary>
        /// SendNotificationToUsers
        /// </summary>
        /// <param name="idLogins"></param>
        /// <param name="title"></param>
        /// <param name="message"></param>
        Task SendNotificationToUsers(List<string> idLogins, string title, string message);
    }
}
