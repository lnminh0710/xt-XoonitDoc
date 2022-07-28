using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using Newtonsoft.Json;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.IO;
using System.IO.Compression;

namespace DMS.Business
{
    public class PrintingBusiness : BaseBusiness, IPrintingBusiness
    {
        private readonly IPrintingService _printingService;
        public PrintingBusiness(IHttpContextAccessor context, IPrintingService printingService) : base(context)
        {
            _printingService = printingService;
        }

        public async Task<object> GetCampaigns(string objectName)
        {
            var data = new PrintingGetCampaignData();
            data.Object = objectName;
            WSDataReturn wSDataResponse = await _printingService.GetCampaigns(data);
            if (wSDataResponse != null && wSDataResponse.Data != null)
            {
                Dictionary<string, CampaignData> map = new Dictionary<string, CampaignData>();
                JArray jArray = wSDataResponse.Data;
                return jArray;
            }
            return new JArray();
        }

        public async Task<object> ConfirmGetCampaign(PrintingCampaignConfirmModel model)
        {
            model.DateRecivedFromClient = model.DateRecivedFromClient ?? DateTime.Now;

            var data = (PrintingCampaignConfirmData)ServiceDataRequest.ConvertToRelatedType(typeof(PrintingCampaignConfirmData));
            data.DateRecivedFromClient = model.DateRecivedFromClient.ToString();
            data.IdGPMToolsTypeExport = model.IdGPMToolsTypeExport.ToString();
            data.QtyRecivedFromClient = model.QtyRecivedFromClient.ToString();

            var result = await _printingService.ConfirmGetData(data);
            return result;
        }

        /// <summary>
        /// DownloadTemplates
        /// </summary>
        /// <param name="model"></param>
        /// <param name="zipFileName"></param>
        /// <returns></returns>
        public async Task<PrintingDownloadTemplatesResponse> DownloadTemplates(PrintingDownloadTemplatesModel model, string zipFileName = null)
        {
            var response = new PrintingDownloadTemplatesResponse();

            if (model.Templates.Count > 0)
            {
                var firtItem = model.Templates.First();
                var rootPath = firtItem.Path;
                if (rootPath[rootPath.Length - 1] == '\\')
                {
                    rootPath = rootPath.Substring(0, rootPath.Length - 1);
                }
                rootPath = rootPath + "_Temp";

                // OffLineTemplate_Temp\Year\Month\Day\Guid
                var guid = Guid.NewGuid();
                var tempSubFolder = string.Format("\\{0}\\{1}\\{2}\\", DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
                var rootFullPathTemp = string.Format("{0}{1}", rootPath, tempSubFolder);

                var fullPathTemp = string.Format("{0}{1}\\", rootFullPathTemp, guid);

                zipFileName = string.IsNullOrEmpty(zipFileName) ? string.Format("{0}.zip", guid) : zipFileName + ".zip";
                var zipPath = string.Format("{0}{1}", rootFullPathTemp, zipFileName);

                if (!Directory.Exists(fullPathTemp))
                {
                    Directory.CreateDirectory(fullPathTemp);
                }

                var hasFileToCompress = false;
                foreach (var item in model.Templates)
                {
                    var filename = item.Filename;
                    if (filename[0] == '\\')
                    {
                        filename = filename.Substring(1);
                    }

                    var originalFilename = filename;
                    if (!string.IsNullOrEmpty(item.OriginalFilename))
                    {
                        originalFilename = item.OriginalFilename;
                        if (originalFilename[0] == '\\')
                        {
                            originalFilename = originalFilename.Substring(1);
                        }
                    }

                    var sourceFileName = Path.Combine(item.Path, filename);
                    if (File.Exists(sourceFileName))
                    {
                        var destFileName = Path.Combine(fullPathTemp, originalFilename);
                        File.Copy(sourceFileName, destFileName, true);

                        hasFileToCompress = true;
                    }
                    else if (!string.IsNullOrEmpty(item.Content))
                    {
                        var destFileName = Path.Combine(fullPathTemp, originalFilename);
                        File.WriteAllText(destFileName, item.Content);
                        hasFileToCompress = true;
                    }
                }//for

                if (hasFileToCompress)
                {
                    //https://docs.microsoft.com/en-us/dotnet/standard/io/how-to-compress-and-extract-files
                    ZipFile.CreateFromDirectory(fullPathTemp, zipPath);

                    response.FileName = zipFileName;
                    response.FullFileName = zipPath;
                    response.Content = System.IO.File.ReadAllBytes(response.FullFileName);

                    Directory.Delete(fullPathTemp, true);
                    File.Delete(zipPath);
                }
            }

            return await Task.FromResult(response);
        }

        /// <summary>
        /// DownloadArticleMedia
        /// </summary>
        /// <param name="articleMediaList"></param>
        /// <returns></returns>
        public async Task<PrintingDownloadTemplatesResponse> DownloadArticleMedia(IList<ArticleMedia> articleMediaList, string rootUploadFolderPath, string uploadFolder)
        {
            var response = new PrintingDownloadTemplatesResponse();
            var guid = Guid.NewGuid();
            string fullPathTemp = Path.Combine(uploadFolder, "ArticleMedia_" + guid);
            string articleMediaFullPathTemp = Path.Combine(fullPathTemp, "ArticleMedia");
            string zipFileName = string.Format("{0}.zip", guid);
            var zipPath = Path.Combine(fullPathTemp, zipFileName);

            if (!Directory.Exists(articleMediaFullPathTemp))
            {
                Directory.CreateDirectory(articleMediaFullPathTemp);
            }

            bool hasFileToCompress = false;
            foreach (var articleMedia in articleMediaList)
            {
                if (!string.IsNullOrWhiteSpace(articleMedia.ArticleNr))
                {
                    string articlePath = Path.Combine(articleMediaFullPathTemp, articleMedia.ArticleNr);
                    if (!Directory.Exists(articlePath))
                    {
                        Directory.CreateDirectory(articlePath);
                    }

                    foreach(var path in articleMedia.FilePaths)
                    {
                        if (!String.IsNullOrWhiteSpace(path))
                        {
                            string srcPath = Path.Combine(rootUploadFolderPath, path);
                            if (File.Exists(srcPath))
                            {
                                string fileName = Path.GetFileName(srcPath);
                                string destFileName = Path.Combine(articlePath, fileName);
                                File.Copy(srcPath, destFileName, true);
                                hasFileToCompress = true;
                            }
                        }
                    }
                }               
            }

            if (hasFileToCompress)
            {
                //https://docs.microsoft.com/en-us/dotnet/standard/io/how-to-compress-and-extract-files
                ZipFile.CreateFromDirectory(articleMediaFullPathTemp, zipPath);

                response.FileName = zipFileName;
                response.FullFileName = zipPath;
                response.Content = System.IO.File.ReadAllBytes(response.FullFileName);

                File.Delete(zipPath);
                Directory.Delete(fullPathTemp, true);
            }

            return await Task.FromResult(response);
        }
    }
}
