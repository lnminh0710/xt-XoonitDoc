using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IPrintingBusiness
    {
        Task<object> GetCampaigns(string objectName);

        Task<object> ConfirmGetCampaign(PrintingCampaignConfirmModel model);

        Task<PrintingDownloadTemplatesResponse> DownloadTemplates(PrintingDownloadTemplatesModel model, string zipFileName = null);

        Task<PrintingDownloadTemplatesResponse> DownloadArticleMedia(IList<ArticleMedia> articleMediaList, string rootUploadFolderPath, string uploadFolder);
    }
}

