using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using DMS.Utils;

namespace DMS.Service
{
    public class NotificationService : BaseUniqueServiceRequest, INotificationService
    {
        public NotificationService(IOptions<AppSettings> appSettings, IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }

        /// <summary>
        /// If all fields = 0 : IdLoginNotification, MainNotificationType, NotificationStatus -> Get All
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<WSDataReturn> GetNotifications(NotificationGetData data)
        {
            data.MethodName = "SpAppWg002NotificationList";
            data.Object = "GetNotificationList";
            data.WidgetTitle = "Notification";
            data.IsDisplayHiddenFieldWithMsg = "1";

            if (data.IdNotification <= 0) data.IdNotification = null;

            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }

        public async Task<WSEditReturn> CreateNotification(NotificationCreateData data)
        {
            data.MethodName = "SpCallNotification";
            data.Object = "Notification";
            data.AppModus = "0";
            return await SaveData(data);
        }

        public async Task<WSEditReturn> SetArchivedNotifications(NotificationSetArchivedData data)
        {
            data.MethodName = "SpCallNotification";
            data.Object = "Notification";
            data.AppModus = "0";
            return await SaveData(data);
        }
    }
}
