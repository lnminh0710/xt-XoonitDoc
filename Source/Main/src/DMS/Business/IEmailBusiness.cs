using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;

namespace DMS.Business
{
    public interface IEmailBusiness
    {
        /// <summary>
        /// SendEmailAsync
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<bool> SendEmail(EmailSimpleModel model);

        /// <summary>
        /// SendEmailWithEmbeddedImage
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<bool> SendEmailWithEmbeddedImage(EmailModel model);

        /// <summary>
        /// SendNotificationEmail: Feedback, SendToAdmin
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        Task<bool> SendNotificationEmail(EmailModel model);

        /// <summary>
        /// ImageToBase64
        /// </summary>
        /// <param name="imagePath"></param>
        /// <returns></returns>
        string ImageToBase64(string imagePath);

        /// <summary>
        /// FixBase64ForImage
        /// </summary>
        /// <param name="imagePath"></param>
        /// <returns></returns>
        string FixBase64ForImage(string imagePath);
        Task<bool> SendEmailActivate(EmailWithTemplateModel model);
        Task<bool> SendEmailChangePasswordSuccess(EmailWithTemplateModel model, string newPass = "");
        Task<bool> SendEmailResetPassword(EmailWithTemplateModel model);
        Task<bool> SendEmailReport(string GroupUuid, bool test = false);
    }
}

