using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.Extensions.Options;
using DMS.Models;
using System.Diagnostics;
using Newtonsoft.Json;
using DMS.Business;
using System.Collections.Generic;
using System.Threading;
using System.IO.Compression;
using System.Net;
using System.Reflection;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class FileManagerController : Controller
    {
        private readonly IPathProvider _pathProvider;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        private readonly IImageResizer _imageResizer;
        private readonly IDocumentBusiness _documentBusiness;
        private readonly IUniqueBusiness _uniqueBusiness;
        private readonly IOrderDataEntryBusiness _orderDataEntryBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        /// <summary>
        /// FileManagerController
        /// </summary>
        /// <param name="appSettings"></param>
        /// <param name="appServerSetting"></param>
        /// <param name="pathProvider"></param>
        public FileManagerController(IOptions<AppSettings> appSettings,
            IAppServerSetting appServerSetting,
            IPathProvider pathProvider,
            IImageResizer imageResizer,
            IDocumentBusiness documentBusiness,
            IUniqueBusiness uniqueBusiness,
            IOrderDataEntryBusiness orderDataEntryBusiness)
        {
            _pathProvider = pathProvider;
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _orderDataEntryBusiness = orderDataEntryBusiness;
            _imageResizer = imageResizer;
            _documentBusiness = documentBusiness;
            _uniqueBusiness = uniqueBusiness;
        }

        #region ScanFile

        /// <summary>
        /// UploadScanFile
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("UploadScanFile")]
        [AllowAnonymous]
        public async Task<IActionResult> UploadScanFile()
        {
            var request = HttpContext.Request;
            IFormFileCollection files = request.Form.Files;
            long size = files.Sum(f => f.Length);
            string uploadScanFolder = _pathProvider.FileShare + "\\XenaScan";
            string fileName = string.Empty;
            if (files.Any())
            {
                if (!Directory.Exists(uploadScanFolder))
                {
                    Directory.CreateDirectory(uploadScanFolder);
                }

                // 
                if (request.Form["OrderScanning"].Any())
                {
                    var watch = Stopwatch.StartNew();
                    var s = Uri.UnescapeDataString(request.Form["OrderScanning"].First());
                    ScanningLotItemData scanningLotItemData = JsonConvert.DeserializeObject<ScanningLotItemData>(s);
                    string lotIdFolder = Path.Combine(uploadScanFolder, "LotID" + scanningLotItemData.IdScansContainer);

                    if (!Directory.Exists(lotIdFolder))
                    {
                        Directory.CreateDirectory(lotIdFolder);
                    }

                    foreach (var file in files)
                    {
                        if (file.Length > 0)
                        {
                            fileName = Path.GetFileName(file.FileName);
                            using (var fileStream = new FileStream(Path.Combine(lotIdFolder, fileName), FileMode.Create))
                            {
                                // SentrySdk.CaptureMessage("file.CopyToAsync(fileStream)");
                                await file.CopyToAsync(fileStream);
                            }
                        }
                    }
                    scanningLotItemData.ScannedPath = lotIdFolder;
                    var result = _orderDataEntryBusiness.SaveScanningOrder(scanningLotItemData);
                    watch.Stop();

                    return Ok(new
                    {
                        UploadSpeed = watch.ElapsedMilliseconds,
                        Result = result.Result
                    });
                    //return Ok(result.Result);
                }
            }
            return Ok();
        }
        #endregion

        #region File

        /// <summary>
        /// UploadFile
        /// </summary>
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2097152000)]
        [RequestSizeLimit(2097152000)]
        [Route("UploadFile")]
        [AllowAnonymous]
        public async Task<IActionResult> UploadFile(CancellationToken ct, UploadMode? mode = null, string subFolder = null, string saveFileName = null)
        {
            var request = HttpContext.Request;
            IFormFileCollection files = request.Form.Files;
            long size = files.Sum(f => f.Length);
            string uploadFolder = _pathProvider.GetFullUploadFolderPath(mode, subFolder);
            string fileName = string.Empty;
            string originalFileName = string.Empty;
            string path = "";
            if (files.Any())
            {
                var file = files.First();
                fileName = string.IsNullOrEmpty(saveFileName) ? Guid.NewGuid().ToString() + Path.GetExtension(file.FileName) : saveFileName;
                originalFileName = Path.GetFileName(file.FileName);

                using (var fileStream = new FileStream(Path.Combine(uploadFolder, fileName), FileMode.Create))
                {
                    ct.ThrowIfCancellationRequested();
                    await file.CopyToAsync(fileStream, ct);
                }

                path = _pathProvider.TrimFolderPath(uploadFolder);
            }
            return Ok(new { fileName, originalFileName, size, path });
        }

        [HttpGet]
        [Route("GetFile")]
        [AllowAnonymous]
        public IActionResult GetFile(string name, string returnName, UploadMode? mode = null, string subFolder = null, string contentType = null)
        {
            if (string.IsNullOrEmpty(name)) return BadRequest(HttpStatusCode.BadRequest);

            var fileInfoItem = _pathProvider.GetFileInfoItem(name, returnName: returnName, mode: mode, subFolder: subFolder);
            _logger.Debug("fileInfoItem.FullFileName: " + fileInfoItem.FullFileName + "     exist:" + System.IO.File.Exists(fileInfoItem.FullFileName));
            if (!string.IsNullOrEmpty(fileInfoItem.FullFileName) && System.IO.File.Exists(fileInfoItem.FullFileName))
            {
                Stream stream = null;
                var query = HttpContext.Request.Query;
                if (fileInfoItem.IsImage && (query.ContainsKey("w") || query.ContainsKey("h")))
                {
                    var fileBytes = _imageResizer.ResizeImage(fileInfoItem, HttpContext.Request.Query);
                    stream = new MemoryStream(fileBytes);
                }
                else
                {
                    //fileBytes = System.IO.File.ReadAllBytes(fileInfoItem.FullFileName);
                    stream = new FileStream(fileInfoItem.FullFileName, FileMode.Open, FileAccess.Read);
                }

                stream.Seek(0, SeekOrigin.Begin);
                Stream streamClone = new MemoryStream(ReadFully(stream));
                stream.Close();
                stream.Dispose();


                var fileResult = new FileStreamResult(streamClone, XenaUtils.MIMEAssistant.GetMIMETypeByExtension(fileInfoItem.Extension));

                if (!string.IsNullOrEmpty(returnName))
                    fileResult.FileDownloadName = fileInfoItem.ReturnName;

                return fileResult;

                //return File(fileBytes, "application/octet-stream", fileInfoItem.ReturnName);
            }
            return BadRequest(HttpStatusCode.NotFound);
        }

        [HttpGet]
        [Route("thumbnail")]
        [AllowAnonymous]
        public IActionResult GetThumbnailOfFile(string name, string returnName, UploadMode? mode = null)
        {
            if (string.IsNullOrEmpty(name)) return StatusCode(404);

            string path_png = name;
            if (name.ToLower().EndsWith(".tiff") || name.ToLower().EndsWith(".tif") || name.ToLower().EndsWith(".pdf"))
            {
                path_png = DetectImageFileForThumbnailOfDocument(name);
                if (string.IsNullOrEmpty(path_png))
                {
                    return StatusCode(404);
                }
            }
            else if (!System.IO.File.Exists(path_png))
            {
                return StatusCode(404);
            }

            var fileInfoItem = _pathProvider.GetFileInfoItem(path_png, returnName: returnName, mode: mode);

            if (!string.IsNullOrEmpty(fileInfoItem.FullFileName) && System.IO.File.Exists(fileInfoItem.FullFileName))
            {
                Stream stream = null;
                var query = HttpContext.Request.Query;
                if (fileInfoItem.IsImage && (query.ContainsKey("w") || query.ContainsKey("h")))
                {
                    var fileBytes = _imageResizer.ResizeImage(fileInfoItem, HttpContext.Request.Query);
                    stream = new MemoryStream(fileBytes);
                }
                else
                {
                    //fileBytes = System.IO.File.ReadAllBytes(fileInfoItem.FullFileName);
                    stream = new FileStream(fileInfoItem.FullFileName, FileMode.Open, FileAccess.Read);
                }

                stream.Seek(0, SeekOrigin.Begin);
                Stream streamClone = new MemoryStream(ReadFully(stream));
                stream.Close();
                stream.Dispose();


                var fileResult = new FileStreamResult(streamClone, XenaUtils.MIMEAssistant.GetMIMETypeByExtension(fileInfoItem.Extension));

                if (!string.IsNullOrEmpty(returnName))
                    fileResult.FileDownloadName = fileInfoItem.ReturnName;

                return fileResult;
            }
            return StatusCode(404);
        }

        [HttpGet]
        [Route("CheckFileExisted")]
        [AllowAnonymous]
        public bool CheckFileExisted(string fileName, UploadMode? mode, string subFolder = null)
        {
            var fileInfoItem = _pathProvider.GetFileInfoItem(fileName, mode: mode, subFolder: subFolder);
            return System.IO.File.Exists(fileInfoItem.FullFileName);
        }
        #endregion

        #region Private
        private byte[] ReadFully(Stream input)
        {
            input.Position = 0;
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

        private string DetectImageFileForThumbnailOfDocument(string pathDocument)
        {
            string path_png = pathDocument + ".1.png";
            if (!System.IO.File.Exists(path_png))
            {
                path_png = pathDocument + ".png";
                if (!System.IO.File.Exists(path_png))
                {
                    path_png = pathDocument + ".2.png";
                    if (!System.IO.File.Exists(path_png))
                    {
                        path_png = pathDocument + ".1.jpg";
                        if (!System.IO.File.Exists(path_png))
                        {
                            path_png = pathDocument + ".jpg";
                            if (!System.IO.File.Exists(path_png))
                            {
                                path_png = pathDocument + ".2.jpg";
                                if (!System.IO.File.Exists(path_png))
                                {
                                    return "";
                                }
                            }
                        }
                    }
                }
            }
            return path_png;
        }
        #endregion

        [HttpGet]
        [Route("GetDocumentZipFile")]
        [AllowAnonymous]
        public IActionResult GetDocumentZipFile(string path)
        {
            if (string.IsNullOrEmpty(path)) return StatusCode(404);

            try
            {
                var dir = new DirectoryInfo(path);
                if (!dir.Exists) return StatusCode(404);

                var dirName = dir.Name;
                var zipFileName = $"{dir.Name}.zip";
                var zipFullFileName = Path.Combine(dir.FullName, zipFileName);

                //Return the existing zip file
                if (System.IO.File.Exists(zipFullFileName))
                {
                    return GetFile(zipFullFileName, zipFileName, UploadMode.Path);
                }

                //Create new Zip File

                //Get list files
                List<FileInfo> fileInfos = Directory.GetFiles(dir.FullName)
                                                        .Where(n => !n.EndsWith(".msg", StringComparison.OrdinalIgnoreCase))
                                                        .Select(n => new FileInfo(n)).ToList();

                if (fileInfos.Count == 0) return StatusCode(404);

                // Create FileStream for output ZIP archive
                using (FileStream zipFile = (System.IO.File.Open(zipFullFileName, FileMode.Create)))
                {
                    using (ZipArchive archive = new ZipArchive(zipFile, ZipArchiveMode.Create))
                    {
                        foreach (FileInfo fileInfo in fileInfos)
                        {
                            archive.CreateEntryFromFile(fileInfo.FullName, fileInfo.Name);
                        }
                    }
                }//using

                return GetFile(zipFullFileName, zipFileName, UploadMode.Path);
            }
            catch (Exception ex)
            {
            }
            return StatusCode(404);
        }
    }
}
