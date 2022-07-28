using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Reflection;
using System.Threading.Tasks;
using XenaEmail;
using DMS.Models;
using DMS.Utils;
using MimeKit.Utils;
using Newtonsoft.Json;

namespace DMS.Business
{
    public class EmailBusiness : BaseBusiness, IEmailBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        public static string XeNaLogoCid = "XeNaLogo";
        // public string Domain { get; set; }
        public string EmailTemplatePath { get; set; }

        private IPathProvider _pathProvider;
        private readonly AppSettings _appSettings;
        private readonly IScanningReportBusiness _scanningReportBusiness;
        public EmailBusiness(IHttpContextAccessor context, IScanningReportBusiness scanningReportBusiness, IPathProvider pathProvider, IOptions<AppSettings> appSettings) : base(context)
        {
            _pathProvider = pathProvider;
            _appSettings = appSettings.Value;
            _scanningReportBusiness = scanningReportBusiness;
            EmailTemplatePath = pathProvider.MapContentRootPath("Email Template");
            //Domain = context.HttpContext.Request.Host.ToString();
        }
        public async Task<bool> SendEmailReport(string GroupUuid, bool test = false)
        {
            ScanningReportForMailing reportModel = await _scanningReportBusiness.GetScanningResultForSendMail(GroupUuid, "");
            var imageFolder = Path.Combine(EmailTemplatePath, _appSettings.ImageLogoEmailUrl);
            var templatePath = Path.Combine(EmailTemplatePath, _appSettings.EmailSending.Report.Template);
            string str = "";
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
                str = SourceReader.ReadToEnd();
            }
            var builder = new BodyBuilder();
            var image = builder.LinkedResources.Add(imageFolder);
            image.ContentId = MimeUtils.GenerateMessageId();
            string reportContentHtml = reportModel.ContentExcelHTMLString.Value.Replace("<h2>Sheet1</h2>", "");
            string subject = String.Format("Report: {0}", reportModel.MainData.ReportName);
            builder.HtmlBody = str;
            builder.Attachments.Add(reportModel.ExcelPath);
            if (test)
            {
                return await SendEmailWithHtml(subject, "dan.dang@xoontec.com", builder);
            }
            return await SendEmailWithHtml(subject, reportModel.MainData.Email, builder);

        }
        public async Task<bool> SendEmailResetPassword(EmailWithTemplateModel model)
        {
            if (string.IsNullOrEmpty(model.ToEmail))
            {
                throw new Exception("ToEmail is Empty");
            }
            if (string.IsNullOrEmpty(model.UrlExprired))
            {
                throw new Exception("UrlExprired is Empty");
            }
            //if (string.IsNullOrEmpty(model.UrlExpriredDateTime))
            //{
            //    throw new Exception("UrlExpriredDateTime is Empty");
            //}
            if (string.IsNullOrEmpty(model.CallbackUrl))
            {
                throw new Exception("CallbackUrl is Null");
            }
            var imageFolder = Path.Combine(EmailTemplatePath, _appSettings.ImageLogoEmailUrl);
            var templatePath = Path.Combine(EmailTemplatePath, _appSettings.EmailSending.ResetPassword.Template);
            string str = "";
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
                str = SourceReader.ReadToEnd();
            }
            var builder = new BodyBuilder();
            var image = builder.LinkedResources.Add(imageFolder);
            image.ContentId = MimeUtils.GenerateMessageId();
            builder.HtmlBody = string.Format(str,
                image.ContentId,
                        model.UrlExprired,
                        model.UrlExpriredDateTime,
                    model.CallbackUrl
                        );
            return await SendEmailWithHtml(_appSettings.EmailSending.ResetPassword.Subject, model.ToEmail, builder);
        }
        public async Task<bool> SendEmailChangePasswordSuccess(EmailWithTemplateModel model, string newPass = "")
        {
            if (string.IsNullOrEmpty(model.ToEmail))
            {
                throw new Exception("ToEmail is Empty");
            }
            if (string.IsNullOrEmpty(model.CallbackUrl))
            {
                throw new Exception("CallbackUrl is Null");
            }
            var imageArtworkFolder = Path.Combine(EmailTemplatePath, "changepass.png");
            var imageFolder = Path.Combine(EmailTemplatePath, _appSettings.ImageLogoEmailUrl);
            var templatePath = Path.Combine(EmailTemplatePath,
                string.IsNullOrWhiteSpace(newPass) ? _appSettings.EmailSending.ChangePasswordSuccess.Template : _appSettings.EmailSending.ChangePasswordSuccess.TemplateByAdmin);
            string str = "";
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
                str = SourceReader.ReadToEnd();
            }
            var builder = new BodyBuilder();
            var image = builder.LinkedResources.Add(imageFolder);
            image.ContentId = MimeUtils.GenerateMessageId();
            var imageArtwork = builder.LinkedResources.Add(imageArtworkFolder);
            imageArtwork.ContentId = MimeUtils.GenerateMessageId();
            builder.HtmlBody = string.IsNullOrWhiteSpace(newPass)
                ? string.Format(str, image.ContentId, model.CallbackUrl, imageArtwork.ContentId)
                : string.Format(str, image.ContentId, model.CallbackUrl, imageArtwork.ContentId, newPass);
            return await SendEmailWithHtml(_appSettings.EmailSending.ChangePasswordSuccess.Subject, model.ToEmail, builder);
        }
        public async Task<bool> SendEmailActivate(EmailWithTemplateModel model)
        {
            if (string.IsNullOrEmpty(model.ToEmail))
            {
                throw new Exception("ToEmail is Empty");
            }
            if (string.IsNullOrEmpty(model.Name))
            {
                throw new Exception("Name is Empty");
            }
            if (string.IsNullOrEmpty(model.CallbackUrl))
            {
                throw new Exception("CallbackUrl is Null");
            }
            var imageFolder = Path.Combine(EmailTemplatePath, _appSettings.ImageLogoEmailUrl);
            var templatePath = Path.Combine(EmailTemplatePath, _appSettings.EmailSending.ActivateAccount.Template);
            string str = "";
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
                str = SourceReader.ReadToEnd();
            }
            var builder = new BodyBuilder();
            var image = builder.LinkedResources.Add(imageFolder);
            image.ContentId = MimeUtils.GenerateMessageId();
            builder.HtmlBody = string.Format(str,
                image.ContentId,
                        model.Name,
                        model.ToEmail,
                       model.ToEmail,
                    model.CallbackUrl
                        );
            return await SendEmailWithHtml(_appSettings.EmailSending.ActivateAccount.Subject, model.ToEmail, builder);
        }
        private async Task<bool> SendEmailWithHtml(string subject, string toEmail, BodyBuilder builder)
        {

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress(
                _appSettings.EmailSending.Email.Split(new string[] { "@" }, StringSplitOptions.None)[0],
                _appSettings.EmailSending.Email));
            emailMessage.To.Add(new MailboxAddress(toEmail.Split(new string[] { "@" }, StringSplitOptions.None)[0], toEmail));
            emailMessage.Subject = subject;
            emailMessage.Body = builder.ToMessageBody();
            emailMessage.XPriority = XMessagePriority.Highest;
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port, SecureSocketOptions.StartTlsWhenAvailable);
                client.AuthenticationMechanisms.Remove("XOAUTH2"); // Must be removed for Gmail SMTP
                client.Authenticate(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password);

                client.Send(emailMessage);
                client.Disconnect(true);
            }
            return await Task.FromResult(true);
        }
        /// <summary>
        /// SendEmailAsync
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<bool> SendEmail(EmailSimpleModel model)
        {
            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress(
                _appSettings.EmailSending.Email.Split(new string[] { "@" }, StringSplitOptions.None)[0],
                _appSettings.EmailSending.Email));
            emailMessage.To.Add(new MailboxAddress(model.ToEmail.Split(new string[] { "@" }, StringSplitOptions.None)[0], model.ToEmail));
            emailMessage.Subject = model.Subject;
            emailMessage.Body = new TextPart(_appSettings.EmailSending.ContentType) { Text = model.Body };
            emailMessage.XPriority = XMessagePriority.Highest;
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port, SecureSocketOptions.StartTlsWhenAvailable);
                client.AuthenticationMechanisms.Remove("XOAUTH2"); // Must be removed for Gmail SMTP
                client.Authenticate(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password);
                client.Send(emailMessage);
                client.Disconnect(true);
            }
            return await Task.FromResult(true);
        }

        /// <summary>
        /// SendEmailWithEmbeddedImage
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<bool> SendEmailWithEmbeddedImage(EmailModel model)
        {
            System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password),
                EnableSsl = true
            };

            MailMessage mailMessage = new MailMessage(
                    _appSettings.EmailSending.Email,
                    model.ToEmail,
                    model.Subject,
                    "");

            #region AlternateView: Embed Resources
            System.Net.Mime.ContentType mimeType = new System.Net.Mime.ContentType("text/html");
            AlternateView alternateView = AlternateView.CreateAlternateViewFromString(model.Body, mimeType);

            foreach (var item in model.ImageAttached)
            {
                byte[] bitmapData = Convert.FromBase64String(FixBase64ForImage(item.Source.Split(',')[1]));
                MemoryStream streamBitmap = new MemoryStream(bitmapData);

                var imageToInline = new LinkedResource(streamBitmap, MediaTypeNames.Image.Jpeg)
                {
                    ContentId = item.EmbeddedId
                };
                // Add the alternate body to the message.
                alternateView.LinkedResources.Add(imageToInline);
            }

            mailMessage.AlternateViews.Add(alternateView);
            #endregion

            #region Attachments
            MailMessageAttachment(mailMessage, model.Attachments);
            #endregion

            client.Send(mailMessage);

            return await Task.FromResult(true);
        }

        #region SendNotificationEmail

        /// <summary>
        /// SendNotificationEmail
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<bool> SendNotificationEmail(EmailModel model)
        {
            IList<MemoryStream> streamBitmaps = new List<MemoryStream>();
            string body = InitImageTableHeader();
            body += CombineImageBodyHeader(model);
            string borderColor = "#3c8dbc";
            foreach (var item in model.ImageAttached.Select((value, i) => new { i, value }))
            {
                byte[] bitmapData = Convert.FromBase64String(FixBase64ForImage(item.value.Source.Split(',')[1]));
                MemoryStream streamBitmap = new MemoryStream(bitmapData);
                streamBitmaps.Add(streamBitmap);

                using (var ms = new MemoryStream(bitmapData))
                {
                    Image img = Image.FromStream(ms);
                    string size = (img.Width >= 1024) ? "100%" : "auto";
                    body += CombineImageBody(item, borderColor,
                            (item.i < model.ImageAttached.Count - 1),
                            size);
                }
            }
            body += "</tbody></table></td></tr></tbody></table></td></tr></table>";

            await SendAttachImageEmail(model, streamBitmaps, body);

            return await Task.FromResult(true);
        }

        private async Task<bool> SendAttachImageEmail(EmailModel model, IList<MemoryStream> streamBitmaps, string body)
        {
            

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress(
                _appSettings.EmailSending.Email.Split(new string[] { "@" }, StringSplitOptions.None)[0],
                _appSettings.EmailSending.Email));
            try
            {
                for(int p = 0; p < model.ToEmail.Split(",").Length; p++)
                {
                    emailMessage.To.Add(new MailboxAddress(model.ToEmail.Split(",")[p].Split(new string[] { "@" }, StringSplitOptions.None)[0], model.ToEmail.Split(",")[p]));
                }                
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                _logger.Error($"SendAttachImageEmail  {JsonConvert.SerializeObject(model)}", e);
            }
            
            emailMessage.Subject = model.Subject;

            var builder = new BodyBuilder();
            try
            {
                var image = builder.LinkedResources.Add(_appSettings.ImageLogoUrl);
                image.ContentId = MimeUtils.GenerateMessageId();
            } catch(Exception e)
            {
                Console.WriteLine(e);
                _logger.Error($"SendAttachImageEmail  {JsonConvert.SerializeObject(model)}", e);
            }            
            
            builder.HtmlBody = body;
                       

            for(int i = 0; i < streamBitmaps.Count; i++)
            {              
                builder.Attachments.Add("image_" + i + ".jpeg", streamBitmaps.ElementAt(i).ToArray(), new MimeKit.ContentType("application", "jpeg"));
            }

            emailMessage.Body = builder.ToMessageBody();
            emailMessage.XPriority = XMessagePriority.Highest;
            try
            {
                using (var clientKit = new MailKit.Net.Smtp.SmtpClient())
                {
                    clientKit.Connect(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port, SecureSocketOptions.StartTlsWhenAvailable);
                    clientKit.AuthenticationMechanisms.Remove("XOAUTH2"); // Must be removed for Gmail SMTP
                    clientKit.Authenticate(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password);

                    clientKit.Send(emailMessage);
                    clientKit.Disconnect(true);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                _logger.Error($"SendAttachImageEmail  {JsonConvert.SerializeObject(model)}", e);
            }
            return await Task.FromResult(true);
        }

        private void MailMessageAttachment(MailMessage mailMessage, IList<EmailAttachmentFile> attachments)
        {
            if (attachments == null || attachments.Count == 0) return;

            foreach (var attachmentFile in attachments)
            {
                FileInfo fileInfo = new FileInfo(attachmentFile.FullName);
                if (!fileInfo.Exists) continue;

                Attachment attachment = new Attachment(fileInfo.FullName, MediaTypeNames.Application.Octet);
                System.Net.Mime.ContentDisposition disposition = attachment.ContentDisposition;
                disposition.CreationDate = fileInfo.CreationTime;
                disposition.ModificationDate = fileInfo.LastWriteTime;
                disposition.ReadDate = fileInfo.LastAccessTime;
                disposition.FileName = attachmentFile.DisplayName;
                disposition.Size = fileInfo.Length;
                disposition.DispositionType = DispositionTypeNames.Attachment;
                mailMessage.Attachments.Add(attachment);
            }//for
        }

        private string InitImageTableHeader()
        {
            return string.Format(@"
                    <meta http-equiv='content-type' content='text/html; charset=UTF-8'>
                    <table style='width:1200px;
                            border: 1px solid #0b6599;
                            line-height: 16px;
                            font-size: 14px;
                            font-family: tahoma;'>
                        <tr><td style='width:1200px;
                                height:50px;
                                background-color:#0b6599'
                                height='50px'>
                            <img style='width:130px;height:50px' height='50px' width='130px' src='cid:{0}'/>
                        </td></tr>
                        <tr><td style='padding:10px 40px 20px 40px; width:1200px;'>
                            <table align='center'
                                border='0'
                                cellpadding='0'
                                cellspacing='0'
                                dir='ltr'
                                style='font-size:16px;width:1024px;'
                                width='1024px'>
                                <tbody>
                                    <tr>
                                        <td align='center' style='margin:0;padding:0 0 79px; width:1024px;' valign='top'>
                                            <table align='center' border='0' cellpadding='0' cellspacing='0' style='width:1024px;' width='1024'>
                                                <tbody>", XeNaLogoCid);
        }
        private string CombineImageBodyHeader(EmailModel model)
        {
            var descriptions = new List<Tuple<string, string>> {
                new Tuple<string, string>("Database Name", model.DatabaseName),
                new Tuple<string, string>("Priority", model.Priority),
                new Tuple<string, string>("Report From", UserFromService.FullName),
                new Tuple<string, string>("Email", UserFromService.Email)
            };
            foreach (PropertyInfo propertyInfo in model.BrowserInfo.GetType().GetProperties())
            {
                var value = propertyInfo.GetValue(model.BrowserInfo);
                if (value == null || string.IsNullOrEmpty(value.ToString())) continue;
                var attribute = (DescriptionAttribute)propertyInfo.GetCustomAttribute(typeof(DescriptionAttribute));
                descriptions.Add(new Tuple<string, string>(attribute.Description, value.ToString()));
            }

            var result = CreateDescriptionLine(descriptions);

            if (!string.IsNullOrEmpty(model.Body))
            {
                result += string.Format(@"
                <tr>
                    <td style='padding:5px; width:1024px; margin:0px;' width='1024px' valign='top'>
                        <span>Description:</span>
                        <p style='font-weight:900;'>{0}</p>
                    </td>
                </tr>
            ", model.Body);
            }
            result += @"
                <tr>
                    <td style='padding:5px; width:1024px; margin:0px; height:20px;' width='1024px' valign='top'></td>
                </tr>";

            return result;
        }

        private string CreateDescriptionLine(IList<Tuple<string, string>> descriptions)
        {
            string result = @"<tr>
                    <td style='padding:5px; width:1024px; margin:0px;' width='1024px' valign='top'>
                        <table width='100%' style='width:100%;border-right: 1px solid #d3cfcf; border-bottom: 1px solid #d3cfcf;' cellspacing='0' cellpadding='5'>";
            foreach (var item in descriptions)
            {
                result += string.Format(@"
                            <tr>
                                <td style='border-left: 1px solid #d3cfcf; border-top: 1px solid #d3cfcf; width: 30%'>
                                    {0}
                                </td>
                                <td style='border-left: 1px solid #d3cfcf; border-top: 1px solid #d3cfcf;'>
                                    <span style='font-weight:900'>{1}</span>
                                </td>
                            </tr>", item.Item1, item.Item2);
            }
            result += "</table></td></tr>";
            return result;
        }

        private string CombineImageBody(dynamic item, string borderColor, bool isAddSeparate, string size)
        {
            var result = string.Format(@"
                <tr>
                    <td align='center' style='padding:5px;
                                        width:1024px;
                                        margin:0px;
                                        border:1px solid {0};
                                        border-bottom-color:{1};'
                                    width='1024px' valign='top'>
                        <img style='width:{2}' width='{2}' src='cid:MyImage{3}'/>
                    </td>
                </tr>
                
            ", borderColor,
            (!string.IsNullOrEmpty(item.value.Text)) ? "#d8d8d8" : borderColor,
            size, item.i);

            if (!string.IsNullOrEmpty(item.value.Text))
            {
                result += string.Format(@"<tr>
                    <td style='padding:5px; width:1024px; margin:0px; border:1px solid {1}; border-top:none;' width='1024px' valign='top'>
                        <p>{0}</p>
                    </td>
                </tr>", item.value.Text, borderColor);
            }

            result += isAddSeparate ? @"<tr>
                    <td align='center' style='padding:5px; width:1024px; margin:0px; height:20px;' width='1024px' valign='top'></td>
                </tr>" : "";
            return result;
        }
        #endregion

        public string FixBase64ForImage(string Image)
        {
            System.Text.StringBuilder sbText = new System.Text.StringBuilder(Image, Image.Length);
            sbText.Replace("\r\n", string.Empty); sbText.Replace(" ", string.Empty);
            return sbText.ToString();
        }

        public string ImageToBase64(string imagePath)
        {
            byte[] b = File.ReadAllBytes(_pathProvider.MapWebRootPath(imagePath));
            return "data:image/png;base64," + Convert.ToBase64String(b);
        }
    }
}
