using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface INotificationBusiness
    {
        Task<WSDataReturn> GetNotifications(NotificationGetModel model);

        Task<WSEditReturn> CreateNotification(NotificationCreateModel model);

        Task<WSEditReturn> SetArchivedNotifications(IList<NotificationSetArchivedItemModel> items);

        Task<WSEditReturn> CreateNotificationWithSendEmail(EmailModel model, AppSettings appSettings, string domain);

        Task<object> GetApproveInvoices(Dictionary<string, object> values);
        Task<object> ApproveInvoiceCounter(Dictionary<string, object> values);
    }
}

