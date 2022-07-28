using DMS.Models;
using DMS.Models.DMS;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Hangfire;
using ImageMagick;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Nest;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using XenaSignalR;

namespace DMS.Business
{
    public class ConvertImageBusiness : BaseBusiness, IConvertImageBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly IDocumentContainerService _documentContainerService;
        private readonly IDocumentBusiness _documentBusiness;
        private readonly ICommonBusiness _commonBusiness;
        private readonly IPathProvider _pathProvider;
        private readonly ISignalRClientHelper _signalRClient;
        private readonly AppSettings _appSettings;
        private readonly ServerConfig _serverConfig;
        public ConvertImageBusiness(IHttpContextAccessor context, IOptions<AppSettings> appSettings, IAppServerSetting appServerSetting, IPathProvider pathProvider,
            IDocumentContainerService documentContainerService, IDocumentBusiness documentBusiness, ICommonBusiness commonBusiness) : base(context)
        {
            _appSettings = appSettings.Value;
            _serverConfig = appServerSetting.ServerConfig;
            _pathProvider = pathProvider;
            _documentContainerService = documentContainerService;
            _documentBusiness = documentBusiness;
            var notifyUrl =  _serverConfig.ServerSetting.SignalRApiUrl;
            _signalRClient = new SignalRClientHelper(notifyUrl);
            _commonBusiness = commonBusiness;
        }
        private string GetUpLoadFolder()
        {
            string path = _pathProvider.FileShare + "\\XenaScan";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            string folderPath = path;
            if (!string.IsNullOrEmpty(data.IdApplicationOwner))
            {
                folderPath = Path.Combine(folderPath, data.IdApplicationOwner);
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }               
            }
            var dateTime = DateTime.Now.ToString("yyyyMMdd-HHmmss.fff");
            folderPath = Path.Combine(folderPath, dateTime);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            return folderPath;
        }
        private List<ImageMultipartModel> sortFilesByPageNr(List<IFormFile> files, List<ImageModel> imageModels)
        {
            List<ImageMultipartModel> list = new List<ImageMultipartModel>();
            if (imageModels == null || imageModels.Count <= 1)
            {
                list.Add(new ImageMultipartModel
                {
                    File = files.FirstOrDefault(),
                    FileName = files.FirstOrDefault().FileName,
                    PageNr = 1
                });
                return list;
            }
            foreach (IFormFile file in files)
            {
                var fileName = file.FileName;
                ImageModel model = imageModels.Where(s => !string.IsNullOrEmpty(s.FileName) && s.FileName.ToLower() == fileName.ToLower()).FirstOrDefault();
                if (model == null)
                {
                    throw new Exception(String.Format("Cannot find PageNr for {0}!!!", fileName));
                }
                list.Add(new ImageMultipartModel
                {
                    File = file,
                    FileName = file.FileName,
                    PageNr = model.PageNr
                });

            }
            list = list.OrderBy(s => s.PageNr).ToList();
            return list;
        }
        public async Task<ConvertImageResult> ConvertImage(List<IFormFile> files, List<ImageModel> imageModels, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Debug(" in ConvertImage ");
                ConvertImageResult convertImageResult = new ConvertImageResult();
                cancellationToken.ThrowIfCancellationRequested();
                var file = files.FirstOrDefault();
                string folderPath = GetUpLoadFolder();
                if (file.FileName.ToLower().EndsWith("pdf") || file.FileName.ToLower().EndsWith("tiff"))
                {
                    var originalFilenam = Path.GetFileName(file.FileName);
                    var fileName = GetTiffFileName(originalFilenam);
                    var tiffFullFileName = Path.Combine(folderPath, fileName);
                    var pngPrefixFileName = Path.Combine(folderPath, fileName);
                    var pdfFullFileName = Path.Combine(folderPath, fileName + ".pdf");
                    if (file.FileName.ToLower().EndsWith("pdf"))
                    {
                        _logger.Debug(" start save file PDF ");
                        await SaveFile(file, pdfFullFileName, cancellationToken);
                        _logger.Debug(" done save PDF ");
                    }
                    else
                    {
                        _logger.Debug(" start save image file");
                        await SaveFile(file, tiffFullFileName, cancellationToken);
                        _logger.Debug(" done save image file ");
                        _logger.Debug(" start convert TIFF to PDF");
                        TiffToPdf(pdfFullFileName, tiffFullFileName);
                        _logger.Debug(" end convert TIFF to PDF");
                    }
                    _logger.Debug(" start ConvertPDFToMultipleImages");
                    convertImageResult = ConvertPDFToMultipleImages(pdfFullFileName, tiffFullFileName, pngPrefixFileName);
                    _logger.Debug(" end ConvertPDFToMultipleImages");
                    convertImageResult.TiffFilename = fileName;
                    convertImageResult.ScannedPath = folderPath;
                    return convertImageResult;
                }
                else
                {
                    List<ImageMultipartModel> images = sortFilesByPageNr(files, imageModels);
                    convertImageResult = await MergeMultiImages(images, folderPath, cancellationToken);
                    convertImageResult.ScannedPath = folderPath;
                }
                return convertImageResult;
            }
            catch (Exception e)
            {
                _logger.Error("Error ConvertImage ", e);
                throw new Exception("ConvertImageBusiness error :" + e);
            }


        }
        private void TiffToPdf(string pdfFullFileName, string tifFullFileName)
        {
            MagickReadSettings settings = new MagickReadSettings();
            // Settings the density to 300 dpi will create an image with a better quality
            settings.Density = new Density(300, 300);

            _logger.Debug(" start RW TIFF to PDF");
            using (MagickImageCollection images = new MagickImageCollection())
            {
                // Add all the pages of the pdf file to the collection

                images.Read(tifFullFileName, settings);
                _logger.Debug(" start W TIFF to PDF");
                images.Write(pdfFullFileName);
            }
            _logger.Debug(" end RW TIFF to PDF");
        }
        private async Task<ConvertImageResult> MergeMultiImages(List<ImageMultipartModel> list, string folderPath, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            ConvertImageResult convertImageResult = new ConvertImageResult();
            List<string> pngImages = new List<string>();
            using (MagickImageCollection collection = new MagickImageCollection())
            {

                string TiffFilename = null, tiffFullFileName = null, pdfFullFileName = null;
                var page = 1;
                foreach (ImageMultipartModel imageMultipartModel in list)
                {
                    var originalFilenam = Path.GetFileName(imageMultipartModel.FileName);
                    if (string.IsNullOrEmpty(tiffFullFileName))
                    {
                        TiffFilename = GetTiffFileName(originalFilenam);
                        tiffFullFileName = Path.Combine(folderPath, TiffFilename);
                        pdfFullFileName = Path.Combine(folderPath, TiffFilename + ".pdf");
                    }
                    string s = originalFilenam.Substring(originalFilenam.LastIndexOf("."));

                    var saveFileName = tiffFullFileName + "." + page + s;
                    await SaveFile(imageMultipartModel.File, saveFileName, cancellationToken);
                    collection.Add(new MagickImage(saveFileName));
                    pngImages.Add(saveFileName);
                    convertImageResult.ResultImageFiles.Add(saveFileName);
                    page++;
                }

                collection.Write(pdfFullFileName);
                MergeImagesToTiff(pngImages, tiffFullFileName);
                convertImageResult.TiffFilename = TiffFilename;
                convertImageResult.ResultImageFiles.Add(tiffFullFileName);
                convertImageResult.ResultImageFiles.Add(pdfFullFileName);
            }
            convertImageResult.TotalPages = pngImages.Count();
            return convertImageResult;
        }
        private void MergeMultiImages(List<string> files, string tiffFullFileName, string pdfFullFileName)
        {

            using (MagickImageCollection collection = new MagickImageCollection())
            {
                foreach (var file in files)
                {
                    collection.Add(new MagickImage(file));
                }
                collection.Write(tiffFullFileName);
                collection.Write(pdfFullFileName);
            }

        }
        private string GetTiffFileName(string originalFileName)
        {

            if (!string.IsNullOrEmpty(originalFileName))
            {
                var originalFileNameLower = originalFileName.ToLower();
                if (originalFileNameLower.Contains(".tiff"))
                {
                    return originalFileName.Substring(0, originalFileNameLower.LastIndexOf(".tiff")) + ".tiff";
                }
                else if (originalFileNameLower.Contains(".pdf"))
                {
                    return originalFileName.Substring(0, originalFileNameLower.LastIndexOf(".pdf")) + ".tiff";
                }
                return originalFileName.Substring(0, originalFileName.LastIndexOf('.')) + ".tiff";
            }
            return null;
        }
        private async Task<string> SaveFile(IFormFile file, string saveFullFileName, CancellationToken cancellationToken)
        {
            _logger.Debug(" function SaveFile ");
            var fileName = Path.GetFileName(file.FileName);
            _logger.Debug(" detected fileName " + fileName);
            using (var fileStream = new FileStream(saveFullFileName, FileMode.Create))
            {
                _logger.Debug(" start copy file " + fileName);
                var task = file.CopyToAsync(fileStream, cancellationToken);
                await task;
                _logger.Debug(" end copy file " + saveFullFileName);
            }
            return fileName;
        }
        private void SaveFileFromStream(Stream stream, string fullFileName, bool isReduceQuality = true)
        {
            //var sizeMb = ImageUtil.ConvertBytesToMegabytes(stream.Length);
            //if (sizeMb > 1 && isReduceQuality)
            //{
            //    ImageUtil.RewriteImage(stream, fullFileName, isDisposeImage: true, encoderValue: 60L);
            //}
            //else
            //{
            Image image = Image.FromStream(stream);
            image.Save(fullFileName);
            //}
        }

        private ConvertImageResult ConvertPDFToMultipleImages(string pdfFullFileName, string tifFullFileName, string pngPrefixFileName)
        {
            _logger.Debug(" start ConvertPDFToMultipleImages");
            ConvertImageResult convertImageResult = new ConvertImageResult();
            MagickReadSettings settings = new MagickReadSettings();
            // Settings the density to 300 dpi will create an image with a better quality
            settings.Density = new Density(300, 300);
            settings.ColorSpace = ColorSpace.sRGB;
            List<string> pngImages = new List<string>();
            using (MagickImageCollection images = new MagickImageCollection())
            {
                _logger.Debug(" start read pdf file");
                images.Read(pdfFullFileName, settings);
                _logger.Debug(" end read pdf file");
                int page = 1;
                foreach (MagickImage image in images)
                {
                    _logger.Debug(" start process Page");
                    image.Alpha(AlphaOption.Remove);
                    string pngFileName = pngPrefixFileName + "." + page + ".png";
                    // image.Compression = CompressionMethod.JPEG;
                    image.Write(pngFileName);
                    // magickImages.Write
                    //  image.ColorSpace = ColorSpace.scRGB;

                    _logger.Debug(" end write Page");
                    page++;
                    convertImageResult.ResultImageFiles.Add(pngFileName);
                    pngImages.Add(pngFileName);
                }
            }
            convertImageResult.TotalPages = pngImages.Count();
            _logger.Debug(" start MergeImagesToTiff");
            MergeImagesToTiff(pngImages, tifFullFileName);
            _logger.Debug(" end MergeImagesToTiff");

            return convertImageResult;
        }
        private void MergeImagesToTiff(List<string> images, string tiffFullFileName)
        {
            using (MagickImageCollection collection = new MagickImageCollection())
            {
                _logger.Debug(" start MergeImagesToTiff");
                foreach (string image in images)
                {
                    MagickImage myMagickImage = new MagickImage(image);
                    myMagickImage.Settings.Compression = CompressionMethod.JPEG;
                    myMagickImage.Settings.Format = MagickFormat.Tiff;
                    myMagickImage.Settings.ColorType = ColorType.Optimize;
                    //     myMagickImage.Alpha(AlphaOption.Remove);
                    collection.Add(myMagickImage);
                }
                collection.Write(tiffFullFileName);
                _logger.Debug(" start write TIIFF");
            }

        }
        public async Task UpdateImages(UpdateImage model)
        {
            var idDocScans = String.Join(", ", model.IdDocumentContainerScans.ToArray());
            BackgroundJob.Enqueue<IConvertImageBusiness>(x => x.UpdateImagesJob(idDocScans));

        }
        public async Task UpdateImagesJob(string IdDocumentContainerScansList)
        {
            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            DocumentContainerScanCRUD data = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
            data.IdDocumentContainerScansList = IdDocumentContainerScansList;
            // data.IdDocumentContainerFileType = model.IdDocumentContainerFileType != null ? model.IdDocumentContainerFileType.ToString() : "4"; ///png
            //data.IdLogin = UserFromService.IdLogin;
            //data.IdApplicationOwner = UserFromService.IdApplicationOwner;

            try
            {
                data.IdLogin = this.UserFromService.IdLogin;
                data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            }
            catch (Exception)
            {
            }
            /**
             * for case: API called from Python service
             */
            if (string.IsNullOrEmpty(data.IdLogin))
            {
                data.IdLogin = "1";
            }
            if (string.IsNullOrEmpty(data.IdApplicationOwner))
            {
                data.IdApplicationOwner = "1";
            }

            object resultFiles = await _documentContainerService.GetDocumentContainerFileByListIds(data);
            if (resultFiles != null)
            {
                string t = resultFiles.ToString();
                files = JsonConvert.DeserializeObject<List<DocumentScanFiles>>(t);
                Dictionary<int, List<DocumentScanFiles>> dic = new Dictionary<int, List<DocumentScanFiles>>();
                foreach (DocumentScanFiles file in files)
                {
                    if (!dic.ContainsKey(file.IdDocumentContainerScans))
                    {
                        dic.Add(file.IdDocumentContainerScans, new List<DocumentScanFiles>());
                    }
                    file.FullFileName = Path.Combine(file.ScannedPath, file.FileName);
                    dic[file.IdDocumentContainerScans].Add(file);
                }
                foreach (int key in dic.Keys)
                {

                    List<DocumentScanFiles> lstFiles = dic[key].OrderBy(s => s.PageNr).ToList();
                    DocumentScanFiles documentScanFirst = lstFiles.FirstOrDefault();
                    List<string> images = new List<string>();
                    string tiffFullFileName = null, pdfFullFileName = null;

                    foreach (DocumentScanFiles documentScanFiles in lstFiles)
                    {
                        if (string.IsNullOrEmpty(pdfFullFileName) && documentScanFiles.FileName.ToLower().EndsWith(".pdf"))
                        {
                            pdfFullFileName = documentScanFiles.FullFileName;
                        }
                        else if (string.IsNullOrEmpty(tiffFullFileName) && documentScanFiles.FileName.ToLower().EndsWith(".tiff"))
                        {
                            tiffFullFileName = documentScanFiles.FullFileName;
                        }
                        else
                        {
                            images.Add(documentScanFiles.FullFileName);
                        }


                    }
                    MergeMultiImages(images, tiffFullFileName, pdfFullFileName);
                    string idMainDocument = documentScanFirst.IdMainDocument;
                    string esIndex = documentScanFirst.EsIndex;
                    if (!string.IsNullOrEmpty(idMainDocument))
                    {
                        Data _data = new Data
                        {
                            IdLogin = documentScanFirst.IdLogin,
                            IdApplicationOwner = documentScanFirst.IdApplicationOwner,
                            LoginName = documentScanFirst.LoginName,
                            LoginLanguage = documentScanFirst.LoginLanguage
                        };
                        await _documentBusiness.HandleAfterUpdateImage(new List<string> { idMainDocument }, esIndex, _data);
                    }
                }
            }
            else
            {
                throw new Exception("UpdateImages : GetData fail");
            }

        }
        public ConvertImageResult ConvertImageByBase64(List<ImageModel> images)
        {
            try
            {
                ConvertImageResult convertImageResult = new ConvertImageResult();
                var file = images.FirstOrDefault();
                file.BuildData();
                string folderPath = GetUpLoadFolder();
                if (file.FileName.ToLower().EndsWith("pdf") || file.FileName.ToLower().EndsWith("tiff"))
                {
                    var originalFilenam = Path.GetFileName(file.FileName);
                    var fileName = GetTiffFileName(originalFilenam);
                    var tiffFullFileName = Path.Combine(folderPath, fileName);
                    var pngPrefixFileName = Path.Combine(folderPath, fileName);
                    var pdfFullFileName = Path.Combine(folderPath, fileName + ".pdf");
                    MemoryStream memoryStream = ImageUtil.ConvertBase64ToStream(file.base64_string);
                    if (file.FileName.ToLower().EndsWith("pdf"))
                    {
                        SaveFileFromStream(memoryStream, pdfFullFileName);

                    }
                    else
                    {
                        SaveFileFromStream(memoryStream, tiffFullFileName);
                        TiffToPdf(pdfFullFileName, tiffFullFileName);
                    }
                    convertImageResult = ConvertPDFToMultipleImages(pdfFullFileName, tiffFullFileName, pngPrefixFileName);
                    convertImageResult.TiffFilename = fileName;
                    convertImageResult.ScannedPath = folderPath;

                }
                else
                {
                    convertImageResult = MergeMultiImagesBase64(images, folderPath);
                    convertImageResult.ScannedPath = folderPath;
                }
                return convertImageResult;
            }
            catch (Exception e)
            {
                throw new Exception("ConvertImageBusiness error :" + e);
            }

        }
        private ConvertImageResult MergeMultiImagesBase64(List<ImageModel> images, string folderPath)
        {
            ConvertImageResult convertImageResult = new ConvertImageResult();
            List<string> pngImages = new List<string>();
            if (images.Count > 1)
            {
                images = images.OrderBy(s => s.PageNr).ToList();
            }
            using (MagickImageCollection collection = new MagickImageCollection())
            {

                string TiffFilename = null, tiffFullFileName = null, pdfFullFileName = null;
                var page = 1;
                foreach (var imageModel in images)
                {
                    imageModel.BuildData();
                    var originalFilenam = Path.GetFileName(imageModel.FileName);
                    if (string.IsNullOrEmpty(tiffFullFileName))
                    {
                        TiffFilename = GetTiffFileName(originalFilenam);
                        tiffFullFileName = Path.Combine(folderPath, TiffFilename);
                        pdfFullFileName = Path.Combine(folderPath, TiffFilename + ".pdf");
                    }
                    string s = originalFilenam.Substring(originalFilenam.LastIndexOf("."));

                    var saveFileName = tiffFullFileName + "." + page + s;
                    MemoryStream stream = ImageUtil.ConvertBase64ToStream(imageModel.base64_string);
                    SaveFileFromStream(stream, saveFileName);
                    collection.Add(new MagickImage(saveFileName));
                    pngImages.Add(saveFileName);
                    convertImageResult.ResultImageFiles.Add(saveFileName);
                    page++;
                }

                collection.Write(pdfFullFileName);
                MergeImagesToTiff(pngImages, tiffFullFileName);
                convertImageResult.TiffFilename = TiffFilename;
                convertImageResult.ResultImageFiles.Add(tiffFullFileName);
                convertImageResult.ResultImageFiles.Add(pdfFullFileName);
            }
            convertImageResult.TotalPages = pngImages.Count();
            return convertImageResult;
        }

        public ConvertImageResult ConvertImages(string file)
        {

            var folderPath = Path.GetDirectoryName(file);
            var originalFilenam = Path.GetFileName(file);
            var fileName = GetTiffFileName(originalFilenam);
            var tiffFullFileName = Path.Combine(folderPath, fileName);
            var pngPrefixFileName = Path.Combine(folderPath, fileName);
            var pdfFullFileName = Path.Combine(folderPath, fileName + ".pdf");
            ConvertImageResult convertImageResult = ConvertPDFToMultipleImages(pdfFullFileName, tiffFullFileName, pngPrefixFileName);
            convertImageResult.TiffFilename = fileName;
            return convertImageResult;
        }

        public void HandleImageBeforeMergeDb(List<DocumentContainerPageScanModel> models)
        {
            string sourceFileName = null, destFileName = null;
            foreach (DocumentContainerPageScanModel model in models)
            {
                sourceFileName = null;
                destFileName = null;
                try
                {
                    if (model.IdDocumentContainerScans != model.OldIdDocumentContainerScans&&model.OldScannedPath!=model.ScannedPath)
                    {
                        sourceFileName = Path.Combine(model.OldScannedPath, model.OldFileName);
                        destFileName = Path.Combine(model.ScannedPath, model.OldFileName);
                        File.Copy(sourceFileName, destFileName, true);
                    }
                }
                catch (Exception e)
                {
                    if (string.IsNullOrEmpty(sourceFileName))
                    {
                        throw new Exception("Copy Image  error : OldScannedPath , OldFileName empty");
                    }
                    if (string.IsNullOrEmpty(destFileName))
                    {
                        throw new Exception("Copy Image  error : ScannedPath , OldFileName empty");
                    }
                    throw new Exception(String.Format("Copy Image from {0} to {1} error {2}", sourceFileName, destFileName, e.Message));
                }
            }
        }
        public string ReadQrCode(ConvertImageResult convertImageResult)
        {
            try
            {
                foreach (string filePath in convertImageResult.ResultImageFiles.Where(x => x.EndsWith(".tiff")))
                {
                    string JsonQRCode = readQrCode(filePath);
                    if (!string.IsNullOrEmpty(JsonQRCode))
                    {
                        return JsonQRCode;
                    }
                }
            }catch(Exception ex)
            {
                _logger.Error("ReadQrCode", ex);
            }
            return null;
        }

            public string readQrCode(string filePath)
        {
            MemoryStream stream = new MemoryStream(System.IO.File.ReadAllBytes(filePath));
            using (var magickImage = new ImageMagick.MagickImage(stream))
            {
                var magickReader = new ZXing.Magick.BarcodeReader();
                var magickResult = magickReader.Decode(magickImage);
                if (magickResult != null && !string.IsNullOrEmpty(magickResult.Text))
                {
                    Dictionary<string, object> data = readText(magickResult.Text);
                    string JsonQRCode = JsonConvert.SerializeObject(data);
                    return JsonQRCode;
                }
                //DocumentContainerQrCodeSaveData  dataSave = (DocumentContainerQrCodeSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerQrCodeSaveData));
                //dataSave.IdDocumentContainerScans = model.IdDocumentContainerScans;
                //dataSave.JsonQRCode = JsonQRCode;
                //return await _documentContainerService.SaveDocumentQrCode(dataSave);
            }
            return null;

        }
        private Dictionary<string, object> readText(string text)
        {
            dynamic MyDynamic = new System.Dynamic.ExpandoObject();
            string[] stringSeparators = new string[] { "\r\n" };
            string[] lines = text.Split(stringSeparators, StringSplitOptions.None);
            var lst = lines.ToList().Where(x => !string.IsNullOrEmpty(x)).ToList();
            //  Dictionary<string, object> data = new Dictionary<string, object>();
           
            Dictionary<string, object> data = deserializeToDictionary(System.IO.File.ReadAllText(_pathProvider.MapContentRootPath("barcode.json")), lst);


            return data;
        }
        private Dictionary<string, object> deserializeToDictionary(string jo, List<string> qrCodes)
        {
            var values = JsonConvert.DeserializeObject<Dictionary<string, object>>(jo);
            var values2 = new Dictionary<string, object>();
            foreach (KeyValuePair<string, object> d in values)
            {
               
                // if (d.Value.GetType().FullName.Contains("Newtonsoft.Json.Linq.JObject"))
                if (d.Value is JObject)
                {
                    values2.Add(d.Key, deserializeToDictionary(d.Value.ToString(), qrCodes));

                }
                else
                {
                    if (d.Key == "QRType" && qrCodes[Int16.Parse(d.Value.ToString())] != "SPC")
                    {
                        return null;
                    }
                    values2.Add(d.Key, qrCodes[Int16.Parse(d.Value.ToString())]);
                }
            }
            return values2;
        }

      
    }


}
