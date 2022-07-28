using System;
using System.Collections.Generic;

namespace DMS.Models
{
    public class PrintingCampaignConfirmModel
    {
        public DateTime? DateRecivedFromClient { get; set; }
        public int QtyRecivedFromClient { get; set; }
        public int IdGPMToolsTypeExport { get; set; }
    }

    #region DownloadTemplates
    public class PrintingDownloadTemplatesModel
    {
        public string IdFolder { get; set; }
        public IList<PrintingTemplateItem> Templates { get; set; }

        public PrintingDownloadTemplatesModel()
        {
            Templates = new List<PrintingTemplateItem>();
        }
    }

    public class PrintingTemplateItem
    {
        public string OriginalFilename { get; set; }
        public string Filename { get; set; }
        public string Path { get; set; }
        public string Content { get; set; }
    }

    public class PrintingDownloadTemplatesResponse
    {
        public string FullFileName { get; set; }
        public string FileName { get; set; }
        public byte[] Content { get; set; }
    }
    #endregion

    #region PrintingCampaignResponse
    public class PrintingCampaignResponse
    {
        public List<PrintingCampaignItem> CampaignDatas { get; set; }

        public dynamic JsonDataExport { get; set; }

        public string QueueName { get; set; }
        public int IdGPMToolsQueue { get; set; }
        public int IdGPMToolsTypeExport { get; set; }

        public PrintingCampaignResponse()
        {
            CampaignDatas = new List<PrintingCampaignItem>();
        }
    }

    public class PrintingCampaignItem
    {
        public int Id { get; set; }
        public string CampaignNr { get; set; }

        public int IdSalesCampaignWizardItems { get; set; }
        public int IdSalesCampaignWizard { get; set; }
        public int IdPerson_Provider { get; set; }
        public int IdPerson_Warehouse { get; set; }
        public List<PrintingCampaignDetailItem> Details { get; set; }

        public PrintingCampaignItem()
        {
            Details = new List<PrintingCampaignDetailItem>();
        }
    }

    public class PrintingCampaignDetailItem
    {
        public dynamic Data { get; set; }

        public dynamic Templatefilename { get; set; }
    }
    #endregion

    /// <summary>
    /// ArticleMedia
    /// </summary>
    public class ArticleMedia
    {
        /// <summary>
        /// ArticleNr
        /// </summary>
        public string ArticleNr { get; set; }

        /// <summary>
        /// FilePaths
        /// </summary>
        public IList<string> FilePaths { get; set; }
    }

}
