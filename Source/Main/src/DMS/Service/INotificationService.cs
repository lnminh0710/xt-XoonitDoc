using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface INotificationService
    {
        Task<WSDataReturn> GetNotifications(NotificationGetData data);

        Task<WSEditReturn> CreateNotification(NotificationCreateData data);        

        Task<WSEditReturn> SetArchivedNotifications(NotificationSetArchivedData data);
    }    
}

