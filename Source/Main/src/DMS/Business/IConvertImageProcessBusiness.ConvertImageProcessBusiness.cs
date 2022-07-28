using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Service;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using WebServicesData = Microsoft.Exchange.WebServices.Data;

namespace DMS.Business
{
    public class ConvertImageProcessBusiness : BaseBusiness, IConvertImageProcessBusiness
    {
        private readonly int IdRepAppSystemScheduleServiceName_Update = 12;//Update/Group Image Service
        private readonly int IdRepAppSystemScheduleServiceName_UnGroup = 13;//Ungroup  Image Service

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly ICommonBusiness _commonBusiness;
        private readonly IDocumentContainerBusiness _documentContainerBusiness;
        private readonly IPathProvider _pathProvider;
        private readonly AppSettings _appSettings;
        private readonly IUniqueService _uniqueService;
        private readonly IOrderDataEntryService _orderDataEntryService;

        public ConvertImageProcessBusiness(IHttpContextAccessor context, IOptions<AppSettings> appSettings, IPathProvider pathProvider,
                                                ICommonBusiness commonBusiness, IDocumentContainerBusiness documentContainerBusiness,
                                                IUniqueService uniqueService, IOrderDataEntryService orderDataEntryService) : base(context)
        {
            _appSettings = appSettings.Value;
            _pathProvider = pathProvider;
            _commonBusiness = commonBusiness;
            _documentContainerBusiness = documentContainerBusiness;
            _uniqueService = uniqueService;
            _orderDataEntryService = orderDataEntryService;
        }

        public UserFromService CurrentUser()
        {
            return UserFromService;
        }

        public async Task<UserFromService> GetUserInfo(string idLogin)
        {
            return await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
        }

        public bool CheckTypeDocumentImport(IFormFileCollection listFiles)
        {
            List<string> extensionAllowImport = _appSettings.TypeDocumentsAllowImport.Split(",").ToList();

            List<IFormFile> files = listFiles.ToList();
            foreach (IFormFile f in files)
            {
                string fileName = f.FileName;
                foreach (string ext in extensionAllowImport)
                {
                    if (fileName.ToLower().EndsWith(ext))
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        private UserUploadInfo GetUploadInfo(bool isEmailPath = false)
        {
            UserUploadInfo userUploadInfo = new UserUploadInfo();
            userUploadInfo.IdApplicationOwner = ServiceDataRequest.IdApplicationOwner;
            userUploadInfo.IdLogin = ServiceDataRequest.IdLogin;
            userUploadInfo.FolderPath = GetUploadPath(ServiceDataRequest.IdApplicationOwner, isEmailPath);
            return userUploadInfo;
        }

        private string GetUploadPath(string idApplicationOwner, bool isEmailPath = false)
        {
            string folderPath;
            if (isEmailPath)
                folderPath = _appSettings.ImportEmailFolder; //Path.Combine(_pathProvider.FileShare, "ImportEmail");
            else
                folderPath = Path.Combine(_pathProvider.FileShare, "XenaScan", idApplicationOwner);

            var dateTime = DateTime.Now.ToString("yyyyMMdd-HHmmss.fff");
            folderPath = Path.Combine(folderPath, dateTime);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            return folderPath;
        }

        private List<ImageMultipartModel> SortFilesByPageNr(List<IFormFile> files, List<ImageModel> imageModels)
        {
            List<ImageMultipartModel> list = new List<ImageMultipartModel>();
            if (imageModels == null || imageModels.Count <= 1)
            {
                var file = files.FirstOrDefault();
                list.Add(new ImageMultipartModel
                {
                    File = file,
                    FileName = file.FileName,
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

        public async Task<UploadImageProcessModel> ConvertImage(List<IFormFile> files, List<ImageModel> imageModels, ScanningLotItemData scanningLotItemData)
        {
            try
            {
                IFormFile file = files.FirstOrDefault();

                var uploadImageProcessModel = new UploadImageProcessModel();
                ConvertImageResult convertImageResult = new ConvertImageResult();
                string folderPath = GetUploadPath(ServiceDataRequest.IdApplicationOwner);
                var fileNameLower = file.FileName.ToLower();
                if (fileNameLower.EndsWith("msg") || fileNameLower.EndsWith("eml"))
                {
                    folderPath = GetUploadPath(ServiceDataRequest.IdApplicationOwner, isEmailPath: true);
                    string fileName = file.FileName;
                    string fullFileName = Path.Combine(folderPath, fileName);
                    await SaveFile(file, fullFileName);
                    uploadImageProcessModel.Images.Add(new ImageProcessModel
                    {
                        FilePath = fullFileName,
                        FileName = fileName
                    });
                    uploadImageProcessModel.IsMsgOutlookFile = true;
                    scanningLotItemData.IsSendToCapture = "0";
                }
                else if (fileNameLower.EndsWith("pdf"))
                {
                    string fileName = GetTiffFileName(Path.GetFileName(file.FileName));
                    string pdfFullFileName = Path.Combine(folderPath, fileName + ".pdf");
                    await SaveFile(file, pdfFullFileName);
                    uploadImageProcessModel.Images.Add(new ImageProcessModel
                    {
                        FilePath = pdfFullFileName,
                        FileName = Path.GetFileName(pdfFullFileName)
                    });
                }
                else if (fileNameLower.EndsWith("tiff") || fileNameLower.EndsWith("tif"))
                {
                    string fileName = GetTiffFileName(Path.GetFileName(file.FileName));
                    string tiffFullFileName = Path.Combine(folderPath, fileName);
                    await SaveFile(file, tiffFullFileName);
                    uploadImageProcessModel.Images.Add(new ImageProcessModel
                    {
                        FilePath = tiffFullFileName,
                        FileName = Path.GetFileName(tiffFullFileName)
                    });
                }
                else // .jpg, .png
                {
                    List<ImageMultipartModel> images = SortFilesByPageNr(files, imageModels);
                    uploadImageProcessModel = await SaveMultiImages(images, folderPath);
                }

                uploadImageProcessModel.ScannedPath = folderPath;
                uploadImageProcessModel.ScanningLotItemData = scanningLotItemData;
                uploadImageProcessModel.IdLogin = ServiceDataRequest.IdLogin;
                uploadImageProcessModel.IdApplicationOwner = ServiceDataRequest.IdApplicationOwner;
                return uploadImageProcessModel;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error ConvertImage: {ex}");
                throw new Exception($"ConvertImageBusiness error: {ex}");
            }
        }

        public async Task<UploadImageProcessModel> ImportEmail(string accessToken, string itemId)
        {
            try
            {
                #region GetDefaultInfoTreeMailDoc
                var defaultInfoTreeMailDoc = await _documentContainerBusiness.GetDefaultInfoTreeMailDoc();
                if (defaultInfoTreeMailDoc == null)
                {
                    _logger.Error($"Can't get DefaultInfoTreeMailDoc");
                    throw new Exception($"ConvertImageBusiness-ImportEmail can't get DefaultInfoTreeMailDoc");
                }

                var idRepScansContainerType = defaultInfoTreeMailDoc.IdRepScansContainerType;
                var idDocumentTree = defaultInfoTreeMailDoc.IdDocumentTree;
                var cloudMediaPath = defaultInfoTreeMailDoc.CloudMediaPath;
                var idRepScanDeviceType = defaultInfoTreeMailDoc.IdRepScanDeviceType;
                var idRepTreeMediaType = defaultInfoTreeMailDoc.IdRepTreeMediaType;
                #endregion

                //ExchangeService
                var ewsClient = new WebServicesData.ExchangeService
                {
                    Url = new Uri("https://outlook.office365.com/EWS/Exchange.asmx"),
                    Credentials = new WebServicesData.OAuthCredentials(accessToken)
                };

                WebServicesData.EmailMessage message = WebServicesData.EmailMessage.Bind(ewsClient, itemId, new WebServicesData.PropertySet(WebServicesData.ItemSchema.Attachments));
                message.Load(new WebServicesData.PropertySet(WebServicesData.ItemSchema.MimeContent));
                var mimeContent = message.MimeContent;

                var idLogin = ServiceDataRequest.IdLogin;
                var idApplicationOwner = ServiceDataRequest.IdApplicationOwner;


                string folderPath = GetUploadPath(idApplicationOwner, isEmailPath: true);
                var fileName = $"{Guid.NewGuid()}.eml";
                var fullFileName = Path.Combine(folderPath, fileName);
                using (var fileStream = new FileStream(fullFileName, FileMode.Create))
                {
                    fileStream.Write(mimeContent.Content, 0, mimeContent.Content.Length);
                }

                var model = new UploadImageProcessModel
                {
                    ScannedPath = folderPath,
                    IdLogin = idLogin,
                    IdApplicationOwner = idApplicationOwner,
                    IsMsgOutlookFile = true
                };
                model.Images.Add(new ImageProcessModel
                {
                    FilePath = fullFileName,
                    FileName = fileName
                });
                model.ScanningLotItemData = new ScanningLotItemData
                {
                    IsActive = "1",
                    CustomerNr = "1",
                    MediaCode = "1",
                    CoordinatePageNr = "0",
                    NumberOfImages = "1",
                    IsSendToCapture = "0",
                    GUID = Guid.NewGuid().ToString(),

                    ScannedDateUTC = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                    SourceScanGUID = Guid.NewGuid().ToString(),
                    IdRepScansContainerType = idRepScansContainerType,
                    IdDocumentTree = idDocumentTree,
                    IdRepScanDeviceType = idRepScanDeviceType
                };
                model.OtherDocumentData = new SaveOtherDocumentModel
                {
                    MainDocument = new MainDocumentModel
                    {
                        MainDocumentTree = new MainDocumentTreeModel
                        {
                            IdDocumentTree = idDocumentTree
                        }
                    },
                    DocumentTreeMedia = new DocumentTreeMediaModel
                    {
                        IdDocumentTree = idDocumentTree,
                        CloudMediaPath = cloudMediaPath,
                        IdRepTreeMediaType = idRepTreeMediaType,
                        MediaName = fileName
                    }
                };

                return await Task.FromResult(model);
            }
            catch (Exception ex)
            {
                _logger.Error($"Error ImportEmail: {ex}");
                throw new Exception($"ConvertImageBusiness-ImportEmail error: {ex}");
            }
        }

        private CreateQueueModel CreateSystemScheduleUploadImage(UploadImageProcessModel uploadImageProcess)
        {
            int IdRepAppSystemScheduleServiceName = uploadImageProcess.IsMsgOutlookFile ? 15 : 11;//15: Import Outlook Message, 11: Upload Image Service

            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };

            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(uploadImageProcess);
            scheduleQueueData.JsonLogJsonType = JsonConvert.SerializeObject(uploadImageProcess);
            var model = new ScheduleQueueCreateData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };
            model.Queues.Add(scheduleQueueData);
            CreateQueueModel createQueueModel = new CreateQueueModel
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName,
                JsonText = CreateJsonText("SystemScheduleQueue", model.Queues)
            };
            return createQueueModel;
        }

        private string CreateJsonText(string key, object value, string startString = "{", string endString = "}")
        {
            var modelValue = JsonConvert.SerializeObject(value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            var jsonText = $@"""{key}"":{modelValue}";
            jsonText = startString + jsonText + endString;
            return jsonText;
        }
        public async Task<WSEditReturn> AddQueue(UploadImageProcessModel uploadImageProcess)
        {
            CreateQueueModel queueModel = CreateSystemScheduleUploadImage(uploadImageProcess);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        private async Task<UploadImageProcessModel> SaveMultiImages(List<ImageMultipartModel> list, string folderPath)
        {
            UploadImageProcessModel uploadImageProcess = new UploadImageProcessModel();
            var page = 1;
            string tiffFilename = null, tiffFullFileName = null, pdfFullFileName = null;
            foreach (ImageMultipartModel imageMultipartModel in list)
            {
                var originalFilenam = Path.GetFileName(imageMultipartModel.FileName);
                if (string.IsNullOrEmpty(tiffFullFileName))
                {
                    tiffFilename = GetTiffFileName(originalFilenam);
                    tiffFullFileName = Path.Combine(folderPath, tiffFilename);
                    pdfFullFileName = Path.Combine(folderPath, tiffFilename + ".pdf");
                }
                string extensionFile = originalFilenam.Substring(originalFilenam.LastIndexOf("."));

                if (extensionFile.ToLower() == ".jpeg")
                {
                    extensionFile = ".jpg";
                }
                var saveFileName = tiffFullFileName + "." + page + extensionFile;
                await SaveFile(imageMultipartModel.File, saveFileName);
                uploadImageProcess.Images.Add(new ImageProcessModel
                {
                    FilePath = saveFileName,
                    FileName = Path.GetFileName(saveFileName),
                    PageNr = page
                });

                page++;

            }
            return uploadImageProcess;
        }

        private string GetTiffFileName(string originalFileName)
        {
            if (string.IsNullOrEmpty(originalFileName)) return null;

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

        private async Task<string> SaveFile(IFormFile file, string saveFullFileName)
        {
            var fileName = Path.GetFileName(file.FileName);

            using (var fileStream = new FileStream(saveFullFileName, FileMode.Create))
            {
                var task = file.CopyToAsync(fileStream);
                await task;
            }
            return fileName;
        }

        private void SaveFileFromStream(Stream stream, string fullFileName, bool isReduceQuality = true)
        {
            Image image = Image.FromStream(stream);
            image.Save(fullFileName);
            image.Dispose();
        }

        private void SaveFileIndexing(string fromFile, string saveFullFileName)
        {
            File.Copy(fromFile, saveFullFileName);
        }

        public UploadImageProcessModel ConvertImageByBase64(List<ImageModel> images, ScanningLotItemData scanningLotItemData)
        {
            try
            {
                UploadImageProcessModel uploadImageProcessModel = null;
                var file = images.FirstOrDefault();
                file.BuildData();
                string folderPath = GetUploadPath(ServiceDataRequest.IdApplicationOwner);
                if (file.FileName.ToLower().EndsWith("pdf") || file.FileName.ToLower().EndsWith("tiff"))
                {
                    uploadImageProcessModel = new UploadImageProcessModel();
                    var originalFilenam = Path.GetFileName(file.FileName);
                    var fileName = GetTiffFileName(originalFilenam);
                    var tiffFullFileName = Path.Combine(folderPath, fileName);
                    var pngPrefixFileName = Path.Combine(folderPath, fileName);
                    var pdfFullFileName = Path.Combine(folderPath, fileName + ".pdf");
                    using (MemoryStream memoryStream = ImageUtil.ConvertBase64ToStream(file.base64_string))
                    {
                        if (file.FileName.ToLower().EndsWith("pdf"))
                        {
                            SaveFileFromStream(memoryStream, pdfFullFileName);
                            uploadImageProcessModel.Images.Add(new ImageProcessModel
                            {
                                FilePath = pdfFullFileName,
                                FileName = Path.GetFileName(pdfFullFileName),
                            });
                        }
                        else
                        {
                            SaveFileFromStream(memoryStream, tiffFullFileName);
                            uploadImageProcessModel.Images.Add(new ImageProcessModel
                            {
                                FilePath = tiffFullFileName,
                                FileName = Path.GetFileName(tiffFullFileName),
                            }
                          );
                        }
                        uploadImageProcessModel.ScannedPath = folderPath;
                    }
                }
                else
                {
                    uploadImageProcessModel = SaveMultiImagesBase64(images, folderPath);
                    uploadImageProcessModel.ScannedPath = folderPath;
                }
                uploadImageProcessModel.ScanningLotItemData = scanningLotItemData;
                uploadImageProcessModel.IdApplicationOwner = ServiceDataRequest.IdApplicationOwner;
                uploadImageProcessModel.IdLogin = ServiceDataRequest.IdLogin;
                return uploadImageProcessModel;
            }
            catch (Exception e)
            {
                throw new Exception("ConvertImageBusiness error :" + e);
            }

        }
        private UploadImageProcessModel SaveMultiImagesBase64(List<ImageModel> images, string folderPath)
        {
            UploadImageProcessModel uploadImageProcess = new UploadImageProcessModel();
            List<string> pngImages = new List<string>();
            if (images.Count > 1)
            {
                images = images.OrderBy(s => s.PageNr).ToList();
            }
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
                using (MemoryStream stream = ImageUtil.ConvertBase64ToStream(imageModel.base64_string))
                {
                    SaveFileFromStream(stream, saveFileName);
                    uploadImageProcess.Images.Add(new ImageProcessModel
                    {
                        FilePath = saveFileName,
                        FileName = Path.GetFileName(saveFileName),
                        PageNr = page
                    });
                }
                page++;
            }
            return uploadImageProcess;
        }

        private CreateQueueModel CreateSystemScheduleUpdateImage(List<string> idDocumentContainerScans, int IdRepAppSystemScheduleServiceName)
        {
            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };
            idDocumentContainerScans.Distinct();
            UpdateImageServiceModel updateImageServiceModel = new UpdateImageServiceModel { IdDocumentContainerScans = String.Join(", ", idDocumentContainerScans) };
            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(updateImageServiceModel);
            var model = new ScheduleQueueCreateData();
            model.IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName;
            model.Queues.Add(scheduleQueueData);
            CreateQueueModel createQueueModel = new CreateQueueModel
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName,
                JsonText = CreateJsonText("SystemScheduleQueue", model.Queues)
            };
            return createQueueModel;
        }

        public async Task<WSEditReturn> AddQueueUpdateImage(List<string> idDocumentContainerScans)
        {
            CreateQueueModel queueModel = CreateSystemScheduleUpdateImage(idDocumentContainerScans, IdRepAppSystemScheduleServiceName_Update);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        public async Task<WSEditReturn> AddQueueUnGroupImage(List<string> idDocumentContainerScans)
        {
            CreateQueueModel queueModel = CreateSystemScheduleUpdateImage(idDocumentContainerScans, IdRepAppSystemScheduleServiceName_UnGroup);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        public async Task<DocumentTreeInfo> GetDocumentTreesDetails(string idDocumentTree)
        {
            List<DocumentTreeInfo> rs = await _documentContainerBusiness.GetDocumentTreesDetails(idDocumentTree);
            if (rs == null)
            {
                return null;
            }
            //string t = rs.ToString();
            //List<DocumentTreeInfo>  info = JsonConvert.DeserializeObject<List<DocumentTreeInfo>>(t);

            //string fullTreePath = "";
            //foreach (DocumentTreeInfo tree in info) {
            //    if (string.IsNullOrEmpty(fullTreePath))
            //    {
            //        fullTreePath = tree.GroupName.Trim();
            //    } else
            //    {
            //        fullTreePath += "\\" +  tree.GroupName.Trim();
            //    }
            //}
            //DocumentTreeInfo r = new DocumentTreeInfo();
            //r.IdRepDocumentGuiType = info.First().IdRepDocumentGuiType;
            //r.FullTreePath = fullTreePath;
            return rs.First();
        }

        public async Task<DocumentTreeInfo> GetDetailTreeNode(string nodeName, string userId, string idApplicationOwner)
        {
            List<DocumentTreeInfo> rs = await _documentContainerBusiness.GetDetailTreeNode(nodeName, userId, idApplicationOwner);
            if (rs == null)
            {
                return null;
            }
            return rs.First();
        }

        public async Task<DocumentTreeInfo> GetOtherTreeNode(string userId, string idApplicationOwner)
        {
            List<DocumentTreeInfo> rs = await _documentContainerBusiness.GetOtherTreeNode(userId, idApplicationOwner);
            if (rs == null)
            {
                return null;
            }
            return rs.First();
        }

        public async Task<WSEditReturn> ImportDocumentToDB(ScanningLotItemData model)
        {
            ScanningLotItemData data = (ScanningLotItemData)ServiceDataRequest.ConvertToRelatedType(typeof(ScanningLotItemData), model);
            var result = await _orderDataEntryService.SaveScanningOrder(data);
            return result;
        }

        public async Task<WSEditReturn> AddQueueDocumentIndexing(UploadImageProcessModel uploadImageProcess)
        {
            CreateQueueModel queueModel = CreateSystemScheduleDocumentIndexing(uploadImageProcess);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        public async Task<WSEditReturn> AddQueueReadContentDocumentIndexing(UploadImageProcessModel uploadImageProcess)
        {
            CreateQueueModel queueModel = CreateSystemScheduleReadContentDocumentIndexing(uploadImageProcess);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        private CreateQueueModel CreateSystemScheduleDocumentIndexing(UploadImageProcessModel uploadImageProcess)
        {
            int IdRepAppSystemScheduleServiceName = 16;

            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };

            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(uploadImageProcess);
            scheduleQueueData.JsonLogJsonType = JsonConvert.SerializeObject(uploadImageProcess);
            var model = new ScheduleQueueCreateData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };
            model.Queues.Add(scheduleQueueData);
            CreateQueueModel createQueueModel = new CreateQueueModel
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName,
                JsonText = CreateJsonText("SystemScheduleQueue", model.Queues)
            };
            return createQueueModel;
        }

        private CreateQueueModel CreateSystemScheduleReadContentDocumentIndexing(UploadImageProcessModel uploadImageProcess)
        {
            int IdRepAppSystemScheduleServiceName = 17;

            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };

            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(uploadImageProcess);
            scheduleQueueData.JsonLogJsonType = JsonConvert.SerializeObject(uploadImageProcess);
            var model = new ScheduleQueueCreateData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };
            model.Queues.Add(scheduleQueueData);
            CreateQueueModel createQueueModel = new CreateQueueModel
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName,
                JsonText = CreateJsonText("SystemScheduleQueue", model.Queues)
            };
            return createQueueModel;
        }

        public string GetUploadFolder()
        {
            string path = _pathProvider.FileShare;
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            return path;
        }

        public async Task<UploadImageProcessModel> SaveDocumentEmailIndexing(List<IFormFile> files, ScanningLotItemData scanningLotItemData, string treePath)
        {
            try
            {
                _logger.Debug($"SaveDocumentEmailIndexing: {JsonConvert.SerializeObject(scanningLotItemData)}        treePath: {treePath}");
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(scanningLotItemData.IdLogin, "");
                if (us == null)
                {
                    _logger.Error($"SaveDocumentIndexing user not found {scanningLotItemData.IdLogin}");
                    return null;
                }
                
                var model = Common.ParseQueryStringToDictionary("");
                model.Add("IdSharingCompany", us.IdPerson);

                List<ImportFolderCompanyInfo> folderCompany = new List<ImportFolderCompanyInfo>();
                var s = await _documentContainerBusiness.GetImportFolderOfCompany(model);

                if (s != null)
                {
                    var array = (JArray)s;
                    if (array.Count > 0)
                    {
                        string rs = array[0].ToString();

                        folderCompany =  JsonConvert.DeserializeObject<List<ImportFolderCompanyInfo>>(rs);
                    }
                }
                string prefixFolder = "Indexing";
                if (scanningLotItemData.IdRepDocumentGuiType == "6")
                {
                    if (scanningLotItemData.IdDocumentTree == "2")
                    {
                        treePath = "";
                    }
                    prefixFolder = "Mail";
                }
                string commonFolderUser = Path.Combine(string.IsNullOrEmpty(folderCompany.First().ImportFolder) ? folderCompany.First().Company : folderCompany.First().ImportFolder
                                                            , prefixFolder, scanningLotItemData.IdLogin);

                //  Indexing\\002\\tuanna
                treePath = treePath.Replace("\\", "/").Replace(prefixFolder + "//", "").Replace("//", "/");
                string folderWorking = Path.Combine(Path.Combine(_pathProvider.PublicFolder, commonFolderUser), treePath);
                string folderPath = Path.Combine(GetUploadFolder(), folderWorking);

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                IFormFile file = files.FirstOrDefault();

                string documentFullPath = Path.Combine(folderPath, file.FileName);
                if (File.Exists(documentFullPath))
                {
                    documentFullPath = Path.Combine(folderPath, DateTime.Now.ToString("yyyyMMdd-HHmmss") + "_" + file.FileName);
                }
                //await SaveFile(file, documentFullPath);

                /** SAVE document INTO customer's folder **/
                string folderSharing = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolderUser), treePath);
                if (!Directory.Exists(folderSharing))
                    Directory.CreateDirectory(folderSharing);
                //SaveFileIndexing(documentFullPath, Path.Combine(folderSharing, Path.GetFileName(documentFullPath)));
                string documentName = file.FileName;
                if (File.Exists(Path.Combine(folderSharing, documentName))) {
                    documentName = Path.GetFileNameWithoutExtension(documentName) + "_" + DateTime.Now.Ticks + Path.GetExtension(documentName);
                }

                await SaveFile(file, Path.Combine(folderSharing, documentName));// Path.GetFileName(documentFullPath)););

                string documentNamePublic = file.FileName;
                if (File.Exists(Path.Combine(folderWorking, documentNamePublic)))
                {
                    documentNamePublic = Path.GetFileNameWithoutExtension(documentNamePublic) + "_" + DateTime.Now.Ticks + Path.GetExtension(documentNamePublic);
                }
                
                /** **/
                var uploadImageProcessModel = new UploadImageProcessModel();
                ConvertImageResult convertImageResult = new ConvertImageResult();

                uploadImageProcessModel.Images.Add(new ImageProcessModel
                {
                    FilePath = folderPath,
                    FileName = documentNamePublic
                });
                scanningLotItemData.ScannedPath = folderSharing;
                scanningLotItemData.ScannedFilename = documentName;
                scanningLotItemData.FilePath = folderPath;
                scanningLotItemData.FileName = documentNamePublic;

                uploadImageProcessModel.ScannedPath = folderPath;
                uploadImageProcessModel.ScanningLotItemData = scanningLotItemData;
                uploadImageProcessModel.IdLogin = scanningLotItemData.IdLogin;
                uploadImageProcessModel.IdApplicationOwner = ServiceDataRequest.IdApplicationOwner;
                return uploadImageProcessModel;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error SaveDocumentEmailIndexing: {ex}");
                throw new Exception($"SaveDocumentEmailIndexing error: {ex}");
            }
        }

        /// <summary>
        /// ImportImage
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public async Task<ImageProcessModel> ImportImage(IFormFile file)
        {
            try
            {
                UserUploadInfo userUploadInfo = GetUploadInfo();
                string folderPath = userUploadInfo.FolderPath;
                string fullPath = Path.Combine(folderPath, file.FileName);
                await SaveFile(file, fullPath);
                return new ImageProcessModel
                {
                    FilePath = fullPath,
                    FileName = Path.GetFileName(fullPath)
                };
            }
            catch (Exception e)
            {
                _logger.Error("Error ImportImage ", e);
                throw new Exception("ConvertImageBusiness error :" + e);
            }
        }

        /// <summary>
        /// ImportImage
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        public ImageProcessModel ImportImage(string filePath)
        {
            try
            {
                UserUploadInfo userUploadInfo = GetUploadInfo();
                string folderPath = userUploadInfo.FolderPath;
                string originalFilename = Path.GetFileName(filePath);
                string fullPath = Path.Combine(folderPath, originalFilename);

                File.Copy(filePath, fullPath, true);

                return new ImageProcessModel
                {
                    FilePath = fullPath,
                    FileName = Path.GetFileName(fullPath)
                };
            }
            catch (Exception e)
            {
                _logger.Error($"Error ImportImage: {filePath}. Exception: {e}");
                throw new Exception("ConvertImageBusiness.ImportImage error :" + e);
            }
        }

        /// <summary>
        /// CompleteImportProcess
        /// </summary>
        /// <param name="importProcessModel"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> CompleteImportProcess(ImportProcessModel importProcessModel)
        {
            try
            {
                ScanningLotItemData scanningLotItemData = new ScanningLotItemData()
                {
                    BranchNr = importProcessModel.BranchNr,
                    IdBranches = importProcessModel.IdBranches,
                    GroupUuid = importProcessModel.GroupUuid,
                    IdRepScansContainerType = "1",
                    IsActive = "1",
                    SourceScanGUID = importProcessModel.GroupUuid,
                    IdRepScanDeviceType = "3",
                    IsSendToCapture = "1",
                    IdDocumentTree = importProcessModel.IdDocumentTree
                };
                UserUploadInfo userUploadInfo = GetUploadInfo();
                UploadImageProcessModel uploadImageProcessModel = new UploadImageProcessModel()
                {
                    Images = importProcessModel.Images,
                    IdLogin = userUploadInfo.IdLogin,
                    IdApplicationOwner = userUploadInfo.IdApplicationOwner,
                    ScanningLotItemData = scanningLotItemData,
                    ScannedPath = userUploadInfo.FolderPath
                };
                var result = await AddQueue(uploadImageProcessModel);
                return result;
            }
            catch (Exception e)
            {
                _logger.Error("Error CompleteImportProcess ", e);
                throw new Exception("CompleteImportProcess error :" + e);
            }
        }
    }
}
