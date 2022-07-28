using DMS.Business;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class ImportController : BaseController
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly IConvertImageProcessBusiness _documentProcessBusiness;
        private readonly IDocumentBusiness _documentBusiness;
        private readonly IDocumentIndexingBusiness _documentIndexingBusiness;
        private readonly IDocumentEmailBusiness _documentEmailBusiness;
        private readonly AppSettings _appSettings;

        public ImportController(IOptions<AppSettings> appSettings,
            IConvertImageProcessBusiness convertImageProcessBusiness,
            IDocumentBusiness documentBusiness, IDocumentIndexingBusiness documentIndexingBusiness, IDocumentEmailBusiness documentEmailBusiness)
        {
            _appSettings = appSettings.Value;
            _documentProcessBusiness = convertImageProcessBusiness;
            _documentBusiness = documentBusiness;
            _documentIndexingBusiness = documentIndexingBusiness;
            _documentEmailBusiness = documentEmailBusiness;
        }

        [HttpPost]
        [Route("ImportEmail")]
        [AllowAnonymous]
        public async Task<object> ImportEmail([FromBody] ImportEmailModel model)
        {
            //import from Outlook - extensions
            var watch = Stopwatch.StartNew();

            var authorization = _appSettings.ImportEmail_Authorization;
            Request.Headers["Authorization"] = authorization;
            _documentProcessBusiness.ReInit(authorization);

            UploadImageProcessModel uploadImageProcess = await _documentProcessBusiness.ImportEmail(model.AccessToken, model.ItemId);

            watch.Stop();
            var result = await _documentProcessBusiness.AddQueue(uploadImageProcess);

            return Ok(new
            {
                UploadSpeed = watch.ElapsedMilliseconds,
                Result = result
            });
        }

        [HttpPost]
        [Route("DocumentIndexing")]
        [AllowAnonymous]
        public async Task<object> ImportDocument([FromBody] ImportDocumentModel model)
        {
            _logger.Debug("call API ImportDocument");            
            var watch = Stopwatch.StartNew();
            
            _logger.Debug("call API ImportDocument - Parameter: " + JsonConvert.SerializeObject(model));

            UserFromService us = await _documentProcessBusiness.GetUserInfo(model.IdLogin);
            string idApplicationOwner = us.IdApplicationOwner;

            ScanningLotItemData scanningLotItemData = new ScanningLotItemData();

            scanningLotItemData.IdRepScansContainerType = "1";
            scanningLotItemData.IdRepScanDeviceType = "1";
            scanningLotItemData.ScannedDateUTC = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
            scanningLotItemData.CoordinatePageNr = "0";
            scanningLotItemData.NumberOfImages = "1";

            scanningLotItemData.SourceScanGUID = Guid.NewGuid().ToString();
            scanningLotItemData.IsActive = "1";

            scanningLotItemData.IdApplicationOwner = idApplicationOwner;
            scanningLotItemData.IdLogin = model.IdLogin;
            scanningLotItemData.IdRepDocumentGuiType = model.IdRepDocumentGuiType;
            scanningLotItemData.FilePath = model.FilePath;
            scanningLotItemData.FileName = model.FileName;
            scanningLotItemData.ScannedPath = model.ScannedPath;
            scanningLotItemData.ScannedFilename = model.ScannedFilename;
            scanningLotItemData.Size = model.SizeOfDocument;
            scanningLotItemData.OriginalCreateDate = model.CreatedDate;
            scanningLotItemData.OriginalUpdateDate = model.LastModify;

            watch.Stop();
                        
            if (string.IsNullOrEmpty(model.FilePath))
            {
                _logger.Error("Error fullFromFolder is undefined");
                throw new Exception("fullFromFolder is undefined");
            }
            string documentTypeId = "";
            try
            {
                string treePath = model.PathTree.Replace("/", "\\");
                if(treePath.StartsWith("\\"))
                {
                    treePath = treePath.Substring(1);
                }
                List<DocumentTreeInfo> trees = (await _documentIndexingBusiness.GetDetailTreeNodeIndexing(treePath, model.IdLogin, idApplicationOwner));
                DocumentTreeInfo tree = (trees == null || trees.Count == 0) ? null : trees.FirstOrDefault();
                if (tree == null)
                {
                    var rsC =  await _documentIndexingBusiness.CreateFolderIndexing(treePath, model.IdLogin, us.IdApplicationOwner, us.IdRepLanguage);
                    int.TryParse(rsC.ReturnID, out int id);
                    documentTypeId = id + "";
                } else
                {
                    documentTypeId = tree.IdDocumentTree;
                }
            }
            catch (Exception ex)
            {
                _logger.Error("Error GetDocumentTreesDetails  fullFromFolder: " + model.FilePath, ex);
                throw ex;
            }
            if (string.IsNullOrEmpty(documentTypeId))
            {
                _logger.Error("Error cannot detect documentTree of document");
                throw new Exception("Cannot detect documentTree of document");
            }

            scanningLotItemData.IdDocumentTree = documentTypeId;

            UploadImageProcessModel uploadImageProcess = new UploadImageProcessModel();

            uploadImageProcess.IdApplicationOwner = scanningLotItemData.IdApplicationOwner;
            uploadImageProcess.IdLogin = scanningLotItemData.IdLogin;

            uploadImageProcess.Images.Add(new ImageProcessModel
            {
                FilePath = Path.Combine(scanningLotItemData.FilePath, scanningLotItemData.FileName),
                FileName = scanningLotItemData.FileName
            });
            uploadImageProcess.ScannedPath = scanningLotItemData.FilePath;
            uploadImageProcess.ScanningLotItemData = scanningLotItemData;
            try
            {
                //var rsAddQueueReadContent = await _documentProcessBusiness.AddQueueReadContentDocumentIndexing(uploadImageProcess);
                //_logger.Debug("call API ImportDocument - added document to queue ReadContent : " + JsonConvert.SerializeObject(rsAddQueueReadContent));
                //var result = await _documentProcessBusiness.AddQueueDocumentIndexing(uploadImageProcess);
                //_logger.Debug("call API ImportDocument - added document to queue Convert Officefile : " + JsonConvert.SerializeObject(result));

                //await Task.CompletedTask;

                WSEditReturn rs = await _documentProcessBusiness.ImportDocumentToDB(scanningLotItemData);
                if (rs == null)
                {
                    throw new Exception();
                }

                return Ok(new
                {
                    UploadSpeed = watch.ElapsedMilliseconds,
                    Result = rs
                });
            }
            catch (Exception ex)
            {
                _logger.Error("Error AddQueue    documentTypeId: " + JsonConvert.SerializeObject(uploadImageProcess), ex);
                throw ex;
            }
        }

        [HttpPost]
        [Route("Email")]
        [AllowAnonymous]
        public async Task<object> Import_Email([FromBody] ImportEmailMessageModel model)
        {
            _logger.Debug("call API Import Email");
            var watch = Stopwatch.StartNew();

            _logger.Debug("call API Import Email - Parameter: " + JsonConvert.SerializeObject(model));

            UserFromService us = await _documentProcessBusiness.GetUserInfo(model.IdLogin);
            string idApplicationOwner = us.IdApplicationOwner;

            ScanningLotItemData scanningLotItemData = new ScanningLotItemData();

            scanningLotItemData.IdRepScansContainerType = "1";
            scanningLotItemData.IdRepScanDeviceType = "1";
            scanningLotItemData.ScannedDateUTC = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
            scanningLotItemData.CoordinatePageNr = "0";
            scanningLotItemData.NumberOfImages = "1";

            scanningLotItemData.SourceScanGUID = Guid.NewGuid().ToString();
            scanningLotItemData.IsActive = "1";

            scanningLotItemData.IdApplicationOwner = idApplicationOwner;
            scanningLotItemData.IdLogin = model.IdLogin;
            scanningLotItemData.IdRepDocumentGuiType = model.IdRepDocumentGuiType;
            scanningLotItemData.FilePath = model.FilePath;
            scanningLotItemData.FileName = model.FileName;
            scanningLotItemData.ScannedPath = model.ScannedPath;
            scanningLotItemData.ScannedFilename = model.ScannedFilename;
            scanningLotItemData.Size = model.SizeOfDocument;
            scanningLotItemData.OriginalCreateDate = model.CreatedDate;
            scanningLotItemData.OriginalUpdateDate = model.LastModify;

            watch.Stop();

            if (string.IsNullOrEmpty(model.FilePath))
            {
                _logger.Error("Error fullFromFolder is undefined");
                throw new Exception("fullFromFolder is undefined");
            }
            string documentTypeId = "";
            try
            {
                string treePath = model.PathTree.Replace("/", "\\");
                if (treePath.StartsWith("\\"))
                {
                    treePath = treePath.Substring(1);
                }
                List<DocumentTreeInfo> trees = (await _documentEmailBusiness.GetDetailTreeNodeEmail(treePath, model.IdLogin, idApplicationOwner));
                DocumentTreeInfo tree = (trees == null || trees.Count == 0) ? null : trees.FirstOrDefault();
                if (tree == null)
                {
                    var rsC = await _documentIndexingBusiness.CreateFolderIndexing(treePath, model.IdLogin, us.IdApplicationOwner, us.IdRepLanguage);
                    int.TryParse(rsC.ReturnID, out int id);
                    documentTypeId = id + "";
                }
                else
                {
                    documentTypeId = tree.IdDocumentTree;
                }
            }
            catch (Exception ex)
            {
                _logger.Error("Error GetDocumentTreesDetails  fullFromFolder: " + model.FilePath, ex);
                throw ex;
            }
            if (string.IsNullOrEmpty(documentTypeId))
            {
                _logger.Error("Error cannot detect documentTree of document");
                throw new Exception("Cannot detect documentTree of document");
            }

            scanningLotItemData.IdDocumentTree = documentTypeId;

            UploadImageProcessModel uploadImageProcess = new UploadImageProcessModel();

            uploadImageProcess.IdApplicationOwner = scanningLotItemData.IdApplicationOwner;
            uploadImageProcess.IdLogin = scanningLotItemData.IdLogin;

            uploadImageProcess.Images.Add(new ImageProcessModel
            {
                FilePath = Path.Combine(scanningLotItemData.FilePath, scanningLotItemData.FileName),
                FileName = scanningLotItemData.FileName
            });
            uploadImageProcess.ScannedPath = scanningLotItemData.FilePath;
            uploadImageProcess.ScanningLotItemData = scanningLotItemData;
            try
            {
                //var rsAddQueueReadContent = await _documentProcessBusiness.AddQueueReadContentDocumentIndexing(uploadImageProcess);
                //_logger.Debug("call API ImportDocument - added document to queue ReadContent : " + JsonConvert.SerializeObject(rsAddQueueReadContent));
                //var result = await _documentProcessBusiness.AddQueueDocumentIndexing(uploadImageProcess);
                //_logger.Debug("call API ImportDocument - added document to queue Convert Officefile : " + JsonConvert.SerializeObject(result));

                //await Task.CompletedTask;

                WSEditReturn rs = await _documentProcessBusiness.ImportDocumentToDB(scanningLotItemData);
                if (rs == null)
                {
                    throw new Exception();
                }

                return Ok(new
                {
                    UploadSpeed = watch.ElapsedMilliseconds,
                    Result = rs
                });
            }
            catch (Exception ex)
            {
                _logger.Error("Error AddQueue    documentTypeId: " + JsonConvert.SerializeObject(uploadImageProcess), ex);
                throw ex;
            }
        }

        private List<ImageModel> GetImageModel(HttpRequest request)
        {
            try
            {
                var s = Uri.UnescapeDataString(request.Form["Images"].First());
                List<ImageModel> imageModels = JsonConvert.DeserializeObject<List<ImageModel>>(s);
                return imageModels;
            }
            catch (Exception ex)
            {
                //_logger.Error($"GetImageModel: {ex}");
                return null;
            }
        }
    }
}
