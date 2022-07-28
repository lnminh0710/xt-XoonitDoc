using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DMS.Utils;
using Microsoft.Extensions.Options;
using DMS.Models;
using System.Linq;
using System;
using System.IO;
using System.Collections.Generic;
using WkHtmlToPdf;
using XenaUtils;

namespace DMS.Business
{
    public class FileBusiness : IFileBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly IPathProvider _pathProvider;
        private readonly ServerConfig _serverConfig;

        public FileBusiness(IOptions<AppSettings> appSettings,
            IAppServerSetting appServerSetting,
            IPathProvider pathProvider)
        {
            _pathProvider = pathProvider;
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
        }


        public async Task<UploadFileResult> UploadFile(IFormFileCollection files, UploadMode? mode = null, string subFolder = null)
        {
            string uploadFolder = _pathProvider.GetFullUploadFolderPath(mode, subFolder);
            long size = files.Sum(f => f.Length);
            string fileName = string.Empty;
            string originalFileName = string.Empty;
            string relativePath = "";
            string fullFileName = "";

            if (files.Any())
            {
                var file = files.First();
                fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                originalFileName = Path.GetFileName(file.FileName);
                fullFileName = Path.Combine(uploadFolder, fileName);

                using (var fileStream = new FileStream(fullFileName, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                relativePath = _pathProvider.TrimFolderPath(uploadFolder);
            }

            return new UploadFileResult()
            {
                FileName = fileName,
                OriginalFileName = originalFileName,
                Size = size,
                RelativePath = relativePath,
                FullFileName = fullFileName
            };
        }

        /// <summary>
        /// Upload File
        /// </summary>
        /// <param name="fileData">{name (1.jpg,...), size (in bytes), type (image/jpeg,...), result (base64)}</param>
        /// <param name="mode"></param>
        /// <param name="subFolder"></param>
        /// <returns></returns>
        public async Task<UploadFileResult> UploadFile(IDictionary<string, object> fileData, UploadMode? mode = null, string subFolder = null)
        {
            string uploadFolder = _pathProvider.GetFullUploadFolderPath(mode, subFolder);
            long size = ConverterUtils.ToLong(fileData.GetStringValue("size"));
            string fileName = fileData.GetStringValue("fileNameGuid");
            string originalFileName = fileData.GetStringValue("name");
            string relativePath = "";
            string fullFileName = "";

            if (size > 0)
            {
                if (string.IsNullOrEmpty(fileName))
                    fileName = Guid.NewGuid().ToString() + Path.GetExtension(originalFileName);

                fullFileName = Path.Combine(uploadFolder, fileName);

                ImageUtils.RewriteImageFromBase64(fileData.GetStringValue("result"), fullFileName, isDisposeImage: true);

                relativePath = _pathProvider.TrimFolderPath(uploadFolder);
            }

            var result = new UploadFileResult()
            {
                FileName = fileName,
                OriginalFileName = originalFileName,
                Size = size,
                RelativePath = relativePath,
                FullFileName = fullFileName
            };

            return await Task.FromResult(result);
        }

        /// <summary>
        /// Generate Pdf File
        /// </summary>
        /// <param name="values"></param>
        /// <param name="templateFullFileName"></param>
        /// <param name="saveFullFileName"></param>
        /// <returns></returns>
        public async Task<bool> GeneratePdfFile(IDictionary<string, string> values, string templateFullFileName, string saveFullFileName)
        {
            if (File.Exists(templateFullFileName))
            {
                var fullFolderPath = Path.GetDirectoryName(saveFullFileName);
                if (!Directory.Exists(fullFolderPath))
                {
                    Directory.CreateDirectory(fullFolderPath);
                }

                string html = File.ReadAllText(templateFullFileName);
                foreach (KeyValuePair<string, string> entry in values)
                {
                    html = html.Replace(entry.Key, entry.Value);
                }//for

                //IronHtmlToPdf(html, saveFullFileName);
                WkHtmlToPdf(html, saveFullFileName);

                return await Task.FromResult(true);
            }

            return await Task.FromResult(false);
        }

        /// <summary>
        /// Generate Pdf File
        /// </summary>
        /// <param name="model"></param>
        /// <param name="saveFullFileName"></param>
        /// <returns></returns>
        public async Task<bool> GeneratePdfFile(OrderProcessingPdf.OrderProcessingPdfModel model, string saveFullFileName)
        {
            var fullFolderPath = Path.GetDirectoryName(saveFullFileName);
            if (!Directory.Exists(fullFolderPath))
            {
                Directory.CreateDirectory(fullFolderPath);
            }

            var pdfHelper = new OrderProcessingPdf.PdfHelperOP(saveFullFileName, model);
            pdfHelper.Export();

            return await Task.FromResult(true);
        }

        #region Pdf
        private void IronHtmlToPdf(string html, string saveFullFileName)
        {
            //"IronPdf": "5.2.0.1"
            //var Renderer = new IronPdf.HtmlToPdf();

            //Renderer.PrintOptions.MarginTop = 0;
            //Renderer.PrintOptions.MarginBottom = 0;
            //Renderer.PrintOptions.MarginRight = 0;
            //Renderer.PrintOptions.MarginLeft = 0;

            //Renderer.PrintOptions.PrintHtmlBackgrounds = true;
            //Renderer.PrintOptions.PaperSize = PdfPrintOptions.PdfPaperSize.A4;
            //Renderer.PrintOptions.PaperOrientation = PdfPrintOptions.PdfPaperOrientation.Portrait;

            //var PDF = Renderer.RenderHtmlAsPdf(html);
            //PDF.SaveAs(saveFullFileName);
        }

        private void WkHtmlToPdf(string html, string saveFullFileName)
        {
            WkHtmlToPdfConvert.ConvertHtmlToPdf(_appSettings.WkHtmlToPdfFileExe, html, saveFullFileName);
        }
        #endregion
    }
}
