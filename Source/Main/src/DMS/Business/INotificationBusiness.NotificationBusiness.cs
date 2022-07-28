using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using AutoMapper;
using System.Linq;
using System;
using System.IO;
using System.Drawing;
using Microsoft.Extensions.Options;
using System.Web;
using XenaEmail;
using DMS.ServiceModels;

namespace DMS.Business
{
    public class NotificationBusiness : BaseBusiness, INotificationBusiness
    {
        private IPathProvider _pathProvider;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        private readonly IEmailBusiness _emailBusiness;
        private readonly INotificationService _notificationService;
        private readonly IDynamicDataService _dynamicDataService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;
        private readonly IMapper _mapper;

        public NotificationBusiness(IMapper mapper, IHttpContextAccessor context,
            IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting, IPathProvider pathProvider,
            INotificationService notificationService, IElasticSearchSyncBusiness elasticSearchSyncBusiness,
            IEmailBusiness emailBusiness, IDynamicDataService dynamicDataService) : base(context)
        {
            _mapper = mapper;
            _pathProvider = pathProvider;
            _notificationService = notificationService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _emailBusiness = emailBusiness;
            _dynamicDataService = dynamicDataService;
        }

        public async Task<WSDataReturn> GetNotifications(NotificationGetModel model)
        {
            NotificationGetData data = _mapper.Map<NotificationGetData>(model);

            data = (NotificationGetData)ServiceDataRequest.ConvertToRelatedType(typeof(NotificationGetData), data);

            var result = await _notificationService.GetNotifications(data);
            return result;
        }

        public async Task<WSEditReturn> CreateNotification(NotificationCreateModel model)
        {
            var notification = _mapper.Map<NotificationForCreateData>(model.Notification);
            var notificationItems = _mapper.Map<IList<NotificationItemsForCreateData>>(model.NotificationItems);

            var data = (NotificationCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(NotificationCreateData));
            data.BuildData(notification, notificationItems);

            var result = await _notificationService.CreateNotification(data);

            /*
             * Record sync to ES by SP. Don't need call Sync at here
             */
            // Sync to elastic search
            //if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            //{
            //    await _elasticSearchSyncBusiness.SyncToElasticSearch(ElasticSearchIndexName.Notification, "notification", result.ReturnID);
            //}

            return result;
        }

        public async Task<WSEditReturn> SetArchivedNotifications(IList<NotificationSetArchivedItemModel> model)
        {
            var notificationItems = _mapper.Map<IList<NotificationSetArchivedItem>>(model);

            var data = (NotificationSetArchivedData)ServiceDataRequest.ConvertToRelatedType(typeof(NotificationSetArchivedData));

            data.BuildData(notificationItems);

            var result = await _notificationService.SetArchivedNotifications(data);

            /*
             * Record sync to ES by SP. Don't need call Sync at here
             */
            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                //_elasticSearchSyncBusiness.SyncArchivedNotificationToElasticSearch(model.Select(n => new Utils.ElasticSearch.EsArchivedNotification
                //{
                //    IdNotification = n.IdNotification,
                //    IsActive = false
                //}));
                ///await _elasticSearchSyncBusiness.SyncToElasticSearch(ElasticSearchIndexName.Notification, "notification", model.First().IdNotification);
            }

            return result;
        }

        #region Create Notification: save image to Disk, and db
        public async Task<WSEditReturn> CreateNotificationWithSendEmail(EmailModel model, AppSettings appSettings, string domain)
        {
            NotificationForCreateData notification = new NotificationForCreateData
            {
                Type = model.Type,
                Subject = model.Subject,
                MainComment = model.Body,
                IdLogin = int.Parse(ServiceDataRequest.IdLogin),
                IdRepNotificationType = model.IdRepNotificationType,
                ServerIP = model.BrowserInfo.IP,
                ClientIP = model.BrowserInfo.IP,
                ClientOS = model.BrowserInfo.Os,
                BrowserType = model.BrowserInfo.Browser,
                IsActive = "1",
                IsDeleted = "0"
            };
            List<NotificationItemsForCreateData> notificationItems = new List<NotificationItemsForCreateData>();

            string subFolder = string.Format("{0}\\{1}\\{2}", DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
            string fullFolderPath = _pathProvider.GetFullUploadFolderPath(UploadMode.Notification, subFolder);

            foreach (var item in model.ImageAttached.Select((value, i) => new { i, value }))
            {
                byte[] bitmapData = Convert.FromBase64String(_emailBusiness.FixBase64ForImage(item.value.Source.Split(',')[1]));
                MemoryStream streamBitmap = new MemoryStream(bitmapData);

                using (var ms = new MemoryStream(bitmapData))
                {
                    Image img = Image.FromStream(ms);
                    //save image
                    string fileName = Guid.NewGuid().ToString() + ".jpg";
                    string fullFileName = Path.Combine(fullFolderPath, fileName);
                    img.Save(fullFileName);

                    string dbFileName = Path.Combine(subFolder, fileName);
                    notificationItems.Add(new NotificationItemsForCreateData
                    {
                        IsActive = "1",
                        IsDeleted = "0",
                        Comment = item.value.Text,
                        PicturePath = dbFileName
                    });
                }
            }

            var data = (NotificationCreateData)ServiceDataRequest.ConvertToRelatedType(typeof(NotificationCreateData));
            data.BuildData(notification, notificationItems);

            var result = await _notificationService.CreateNotification(data);

            // Sync to elastic search and send mail
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                _elasticSearchSyncBusiness.SyncNotificationToElasticSearch(result.ReturnID);

                SendNotificationEmail(model);
            }

            return result;
        }

        private void SendNotificationEmail(EmailModel model)
        {
            #region Attach scanning file with 'SendToAdmin' mode 
            if (model.Type == "SendToAdmin" && !string.IsNullOrEmpty(model.FileAttachedUrl))
            {
                model.FileAttachedUrl = HttpUtility.UrlDecode(model.FileAttachedUrl);
                FileInfo fileInfo = new FileInfo(model.FileAttachedUrl);
                if (fileInfo.Exists)
                {
                    var displayFileName = fileInfo.Name;
                    if (displayFileName.Contains(".pdf"))
                    {
                        displayFileName = displayFileName.Split(new char[] { '.' }, StringSplitOptions.RemoveEmptyEntries)[0] + ".pdf";
                    }
                    IList<EmailAttachmentFile> attachments = new List<EmailAttachmentFile>() {
                        new EmailAttachmentFile
                        {
                            FullName = fileInfo.FullName,
                            DisplayName = displayFileName
                        }
                    };
                    model.Attachments = attachments;
                }
            }
            #endregion

            Task.Run(() =>
            {
                _emailBusiness.SendNotificationEmail(model);
            });
        }
        #endregion

        public async Task<object> GetApproveInvoices(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "Notification";
            getData.AddParams(values);
            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
        }

        public async Task<object> ApproveInvoiceCounter(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001InvoiceApproval";
            values["Object"] = "NotificationCounter";
            getData.AddParams(values);
            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.OneRow);
        }
    }
}
