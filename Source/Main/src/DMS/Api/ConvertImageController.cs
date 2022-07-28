using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class ConvertImageController : BaseController
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly IConvertImageBusiness _convertImageBusiness;
        private readonly IConvertImageProcessBusiness _documentProcessBusiness;
        private readonly AppSettings _appSettings;
        private readonly IOrderDataEntryBusiness _orderDataEntryBusiness;
        private readonly IDocumentBusiness _documentBusiness;

        public ConvertImageController(IOptions<AppSettings> appSettings, IOrderDataEntryBusiness orderDataEntryBusiness, IConvertImageBusiness convertImageBusiness,
             IConvertImageProcessBusiness convertImageProcessBusiness,
             IDocumentBusiness documentBusiness)
        {
            _appSettings = appSettings.Value;
            _convertImageBusiness = convertImageBusiness;
            _documentProcessBusiness = convertImageProcessBusiness;
            _orderDataEntryBusiness = orderDataEntryBusiness;
            _documentBusiness = documentBusiness;
        }

        private bool CheckIsError(IFormFileCollection listFiles, List<ImageModel> imageModels)
        {
            if (listFiles != null && listFiles.Count > 1 && listFiles.FirstOrDefault().FileName.ToLower().EndsWith(".png"))
            {
                if (imageModels == null || imageModels.Count != listFiles.Count)
                {
                    return true;
                }
            }
            return false;
        }

        [HttpPost]
        [Route("ImportDocument")]
        public async Task<Object> ImportDocument()
        {
            var request = HttpContext.Request;
            IFormFileCollection listFiles = request.Form.Files;
            if (!listFiles.Any())
            {
                return StatusCode(400, "File Empty");
            }
            if (!_documentProcessBusiness.CheckTypeDocumentImport(listFiles))
            {
                return StatusCode(400, "Type document not accept to import");
            }

            string IdRepDocumentContainerFilesContentType = null;
            try
            {
                request.Form["IdRepDocumentContainerFilesContentType"].First().ToString();
            }
            catch (Exception ex)
            {
            }

            string IsApproval = null;
            try
            {
                IsApproval = request.Form["isApproval"].ToString() != null ? request.Form["isApproval"].First().ToString() : "";
                if (string.IsNullOrEmpty(IsApproval))
                {
                    IsApproval = request.Form["IsApproval"].ToString() != null ? request.Form["IsApproval"].First().ToString() : "";
                }
            }
            catch (Exception ex)
            {
            }

            var watch = Stopwatch.StartNew();
            ImageProcessModel imageProcessModel = await _documentProcessBusiness.ImportImage(listFiles.FirstOrDefault());
            watch.Stop();
            imageProcessModel.IdRepDocumentContainerFilesContentType = IdRepDocumentContainerFilesContentType;
            if (!string.IsNullOrEmpty(IsApproval) && IsApproval == "1")
            {
                ImportProcessModel importProcessModel = new ImportProcessModel();
                importProcessModel.BranchNr = request.Form["BranchNr"].First().ToString();
                importProcessModel.GroupUuid = request.Form["GroupUuid"].First().ToString();
                importProcessModel.IdBranches = request.Form["IdBranches"].First().ToString();
                importProcessModel.IdDocumentTree = request.Form["IdDocumentTree"].First().ToString();
                importProcessModel.Images = new List<ImageProcessModel>() { imageProcessModel };

                var result = await _documentProcessBusiness.CompleteImportProcess(importProcessModel);
                return Ok(new
                {
                    Result = result
                });
            }
            else
            {
                return Ok(new
                {
                    UploadSpeed = watch.ElapsedMilliseconds,
                    Result = imageProcessModel
                });
            }
        }

        [HttpPost]
        [Route("ImportDocumentFromPath")]
        public async Task<Object> ImportDocumentFromPath([FromBody] ImportProcessModel importProcessModel)
        {
            var watch = Stopwatch.StartNew();
            if (importProcessModel == null)
            {
                throw new Exception("No data submit");
            }

            ImageProcessModel imageProcessModel = _documentProcessBusiness.ImportImage(importProcessModel.Path);
            watch.Stop();
            imageProcessModel.IdRepDocumentContainerFilesContentType = importProcessModel.IdRepDocumentContainerFilesContentType;

            if (!string.IsNullOrEmpty(importProcessModel.IsApproval) && importProcessModel.IsApproval == "1")
            {
                importProcessModel.Images = new List<ImageProcessModel>() { imageProcessModel };

                var result = await _documentProcessBusiness.CompleteImportProcess(importProcessModel);
                return Ok(new
                {
                    Result = result
                });
            }
            else
            {
                return Ok(new
                {
                    UploadSpeed = watch.ElapsedMilliseconds,
                    Result = imageProcessModel
                });
            }
        }

        [HttpPost]
        [Route("UploadImages")]
        public async Task<Object> ConvertImage(CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var request = HttpContext.Request;
            IFormFileCollection listFiles = request.Form.Files;
            if (!listFiles.Any())
            {
                return StatusCode(400, "File Empty");
            }
            if (!request.Form["OrderScanning"].Any())
            {
                return StatusCode(400, "OrderScanning Data Empty");
            }
            var files = listFiles.OrderBy(f => f.FileName).ToList();

            var orderScanning = Uri.UnescapeDataString(request.Form["OrderScanning"].First());
            ScanningLotItemData scanningLotItemData = JsonConvert.DeserializeObject<ScanningLotItemData>(orderScanning);

            if (!string.IsNullOrEmpty(scanningLotItemData.IdRepDocumentGuiType) &&
                            (scanningLotItemData.IdRepDocumentGuiType == "5" || scanningLotItemData.IdRepDocumentGuiType == "6"))
            {
                var watchProcess = Stopwatch.StartNew();
                //List<string> treePath = await _documentBusiness.GetTreePath(scanningLotItemData.IdDocumentTree, null, null);
                List<DocumentTreeInfo> treePath = await _documentBusiness.GetDocumentTreesDetails(scanningLotItemData.IdDocumentTree, scanningLotItemData.IdLogin, null);
                if (treePath == null || treePath.Count == 0)
                {
                    return StatusCode(400, "cannot detect IdDocumentTree " + scanningLotItemData.IdDocumentTree);
                }

                UploadImageProcessModel docProcess = await _documentProcessBusiness.SaveDocumentEmailIndexing(files, scanningLotItemData, treePath.FirstOrDefault().DocPath);

                watchProcess.Stop();

                //WSEditReturn rs = await _documentProcessBusiness.ImportDocumentToDB(scanningLotItemData);
                WSEditReturn rs = new WSEditReturn();
                rs.ReturnID = "1";
                rs.EventType = "Successfully";

                if (rs == null)
                {
                    throw new Exception();
                }
                
                //var resultAdd = await _documentProcessBusiness.AddQueueReadContentDocumentIndexing(docProcess);

                return Ok(new
                {
                    UploadSpeed = watchProcess.ElapsedMilliseconds,
                    Result = rs
                });
            }

            if (!_documentProcessBusiness.CheckTypeDocumentImport(listFiles))
            {
                return StatusCode(400, "Type document not accept to import");
            }

            List<ImageModel> imageModels = GetImageModel(request);
                        
            var watch = Stopwatch.StartNew();

            string OtherDocumentData = request.Form["OtherDocumentData"].FirstOrDefault();
            OtherDocumentData = string.IsNullOrEmpty(OtherDocumentData) ? "" : Uri.UnescapeDataString(OtherDocumentData);

            string InvoiceData = request.Form["InvoiceData"].FirstOrDefault();
            InvoiceData = string.IsNullOrEmpty(InvoiceData) ? "" : Uri.UnescapeDataString(InvoiceData);

            string ContractData = request.Form["ContractData"].FirstOrDefault();
            ContractData = string.IsNullOrEmpty(ContractData) ? "" : Uri.UnescapeDataString(ContractData);

            
            UploadImageProcessModel uploadImageProcess = await _documentProcessBusiness.ConvertImage(files, imageModels, scanningLotItemData);

            watch.Stop();

            uploadImageProcess.OtherDocumentData = string.IsNullOrEmpty(OtherDocumentData) ? null : JsonConvert.DeserializeObject<SaveOtherDocumentModel>(OtherDocumentData);

            uploadImageProcess.InvoiceData = string.IsNullOrEmpty(InvoiceData) ? null : JsonConvert.DeserializeObject<SaveInvoiceModel>(InvoiceData);

            uploadImageProcess.ContractData = string.IsNullOrEmpty(ContractData) ? null : JsonConvert.DeserializeObject<SaveContractModel>(ContractData);

            var result = await _documentProcessBusiness.AddQueue(uploadImageProcess);

            return Ok(new
            {
                UploadSpeed = watch.ElapsedMilliseconds,
                Result = result
            });
        }

        [HttpPost]
        [Route("UploadImagesService")]
        public async Task<object> UploadImagesService(CancellationToken cancellationToken)
        {
            _logger.Debug("call API UploadImagesService");
            cancellationToken.ThrowIfCancellationRequested();
            var request = HttpContext.Request;
            IFormFileCollection listFiles = request.Form.Files;
            if (!listFiles.Any())
            {
                _logger.Error("call API UploadImagesService - File Empty");
                return StatusCode(400, "File Empty");
            }

            var watch = Stopwatch.StartNew();
            //Upload is here
            var file = listFiles[0];
            var isSendToCapture = request.Form["isSendToCapture"] + string.Empty;
            var userId = request.Form["userId"] + string.Empty;
            var documentTypeId = request.Form["documentTypeId"] + string.Empty;
            var fromFolder = request.Form["fromFolder"] + string.Empty;
            var fullFromFolder = request.Form["fullFromFolder"] + string.Empty;
            var fromUserFolder = request.Form["fromUserFolder"] + string.Empty;

            _logger.Debug("call API UploadImagesService - Parameter: isSendToCapture=" + isSendToCapture
                    + "     userId=" + userId
                    + "     fromFolder=" + fromFolder
                    + "     fullFromFolder=" + fullFromFolder);

            //if (string.IsNullOrEmpty(userId) )
            //{
            //    _logger.Error("Call API UploadImagesService with userId");
            //    throw new Exception("userId, documentTypeId EMPTY");
            //}


            //if(string.IsNullOrEmpty(userId))
            //{
            //    us = _documentProcessBusiness.CurrentUser();
            //    userId = string.IsNullOrEmpty(us.IdLogin) ? "0" : us.IdLogin;
            //} else
            //{
            //    if (userId.Contains("@"))
            //    {
            //        us = await _orderDataEntryBusiness.GetDetailUserByEmail(userId);
            //    }
            //    else
            //    {
            //        us = await _orderDataEntryBusiness.GetDetailUserById(userId);
            //    }

            //    if (us == null || string.IsNullOrEmpty(us.IdApplicationOwner))
            //    {
            //        _logger.Debug("call API UploadImagesService - UserId invalid");
            //        throw new Exception("UserId invalid");
            //    }
            //}
            string idApplicationOwner = "1";
            UserFromService us = null;
            if (fromUserFolder == "1")
            {                
                string tmpFolder = string.IsNullOrEmpty(fullFromFolder) ? fromFolder : fullFromFolder;
                string[] tmpSubs = tmpFolder.Split("\\");
                bool isNumeric = int.TryParse(tmpSubs[0], out int n);
                if (isNumeric)
                {
                    userId = tmpSubs[0];
                    us = await _documentProcessBusiness.GetUserInfo(userId);
                    idApplicationOwner = us.IdApplicationOwner;
                    tmpSubs = tmpSubs.Where((val, idx) => idx != 0).ToArray();
                    if (!string.IsNullOrEmpty(fullFromFolder))
                    {
                        if (tmpSubs.Length == 0)
                            fullFromFolder = "";
                        else
                            fullFromFolder  = String.Join('\\',tmpSubs);
                    } else
                    {
                        if (tmpSubs.Length == 0)
                            fromFolder = "";
                        else
                            fromFolder = String.Join('\\', tmpSubs);
                    }
                }
                if (us == null)
                {
                    _logger.Error("Error IdPerson not found from folder  tmpFolder: " + tmpFolder);
                    throw new Exception("IdPerson not found from folder.");
                }
            } else
            {
                us = _documentProcessBusiness.CurrentUser();
                userId = string.IsNullOrEmpty(us.IdLogin) ? "1" : us.IdLogin;
            }

            ScanningLotItemData scanningLotItemData = new ScanningLotItemData();

            scanningLotItemData.IdRepScansContainerType = "1";
            scanningLotItemData.IdRepScanDeviceType = "1";
            scanningLotItemData.IsSendToCapture = isSendToCapture;
            scanningLotItemData.CustomerNr = "1";
            scanningLotItemData.MediaCode = "1";
            scanningLotItemData.ScannedDateUTC = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
            scanningLotItemData.CoordinatePageNr = "0";
            scanningLotItemData.NumberOfImages = "1";

            scanningLotItemData.SourceScanGUID = Guid.NewGuid().ToString();
            scanningLotItemData.IsActive = "1";

            scanningLotItemData.IdApplicationOwner = idApplicationOwner;
            scanningLotItemData.IdLogin = userId;

            List<ImageModel> imageModels = GetImageModel(request);

            var files = listFiles.OrderBy(f => f.FileName).ToList();

            UploadImageProcessModel uploadImageProcess = await _documentProcessBusiness.ConvertImage(files, imageModels, scanningLotItemData);

            uploadImageProcess.IdApplicationOwner = idApplicationOwner;
            uploadImageProcess.IdLogin = userId;

            watch.Stop();

            string fileName = files.First().FileName;
            string fileNameWithOutExtension = Path.GetFileNameWithoutExtension(fileName);

            DocumentTreeInfo tree = null;
            if (!string.IsNullOrEmpty(fullFromFolder))
            {
                try
                {
                    tree = await _documentProcessBusiness.GetDetailTreeNode(fullFromFolder, userId, idApplicationOwner);
                    if (tree == null && !string.IsNullOrEmpty(fromFolder))
                    {
                        tree = await _documentProcessBusiness.GetDetailTreeNode(fromFolder, userId, idApplicationOwner);
                    }
                    if (tree == null)
                    {
                        tree = await _documentProcessBusiness.GetOtherTreeNode(userId, idApplicationOwner);
                        if (isSendToCapture == "0")
                            uploadImageProcess.ScanningLotItemData.IsSendToCapture = "1";
                        _logger.Debug($"Cannot detect TreeNode {fullFromFolder} - Deteced Other TreeNode");
                    }
                    documentTypeId = tree != null ? tree.IdDocumentTree : null;
                }
                catch (Exception ex)
                {
                    _logger.Error("Error GetDocumentTreesDetails  fullFromFolder: " + fullFromFolder, ex);
                    throw ex;
                }
            }
            else if (!string.IsNullOrEmpty(fromFolder))
            {
                try
                {
                    //tree = await _documentProcessBusiness.GetDocumentTreesDetails(documentTypeId);
                    //if (!fromFolder.StartsWith("\\"))
                    //{
                    //    fromFolder = "\\" + fromFolder;
                    //}
                    //tree = await _documentProcessBusiness.GetDetailTreeNode(fromFolder.EndsWith("\\") ? fromFolder : fromFolder + "\\", userId, idApplicationOwner);
                    tree = await _documentProcessBusiness.GetDetailTreeNode(fromFolder, userId, idApplicationOwner);
                    if (tree == null )
                    {
                        tree = await _documentProcessBusiness.GetOtherTreeNode(userId, idApplicationOwner);
                        if (isSendToCapture == "0")
                            uploadImageProcess.ScanningLotItemData.IsSendToCapture = "1";
                        _logger.Debug($"Cannot detect TreeNode {fromFolder} - Deteced Other TreeNode" );
                    }
                    documentTypeId = tree != null ? tree.IdDocumentTree : null;
                }
                catch (Exception ex)
                {
                    _logger.Error("Error GetDocumentTreesDetails  fromFolder: " + fromFolder, ex);
                    throw ex;
                }
            }

            uploadImageProcess.ScanningLotItemData.IdDocumentTree = documentTypeId;
            if (tree == null)
            {
                uploadImageProcess.ScanningLotItemData.IsSendToCapture = "1";
            }
            else
            {
                string idRepDocumentGuiType = tree.IdRepDocumentGuiType;
                _logger.Debug("call API UploadImagesService - IdRepDocumentGuiType " + idRepDocumentGuiType);
                if (fileName.ToLower().EndsWith(".pdf"))
                {
                    fileName = fileNameWithOutExtension + ".tiff.pdf";
                }
                else if (fileName.ToLower().EndsWith(".png"))
                {
                    fileName = fileNameWithOutExtension + ".tiff.1.png";
                }
                else if (fileName.ToLower().EndsWith(".jpg"))
                {
                    fileName = fileNameWithOutExtension + ".tiff.1.jpg";
                }
                else if (fileName.ToLower().EndsWith(".tif"))
                {
                }

                if (idRepDocumentGuiType == "1")
                {
                    SaveInvoiceModel inv = new SaveInvoiceModel();
                    inv.MainDocument = new MainDocumentModel();
                    inv.MainDocument.MainDocumentTree = new MainDocumentTreeModel()
                    {
                        IdDocumentTree = documentTypeId,
                    };

                    inv.DocumentTreeMedia = new Models.DMS.DocumentTreeMediaModel()
                    {
                        MediaName = fileName,
                        IdDocumentTree = inv.MainDocument.MainDocumentTree.IdDocumentTree,
                        IdRepTreeMediaType = "1",
                        CloudMediaPath = tree.DocPath.Replace("\\\\", "\\")
                    };

                    inv.Invoice = new InvoiceFormViewModel()
                    {
                        IsPaid = "0",
                        IsTaxRelevant = "0",
                        IsGuarantee = "0"
                    };
                    uploadImageProcess.InvoiceData = inv;
                }

                if (idRepDocumentGuiType == "2")
                {
                    SaveContractModel contract = new SaveContractModel();
                    contract.MainDocument = new MainDocumentModel();
                    contract.MainDocument.MainDocumentTree = new MainDocumentTreeModel()
                    {
                        IdDocumentTree = documentTypeId,
                    };
                    contract.DocumentTreeMedia = new Models.DMS.DocumentTreeMediaModel()
                    {
                        MediaName = fileName,
                        IdDocumentTree = contract.MainDocument.MainDocumentTree.IdDocumentTree,
                        IdRepTreeMediaType = "1",
                        CloudMediaPath = tree.DocPath.Replace("\\\\", "\\")
                    };
                    contract.Contract = new ContractFormViewModel();

                    uploadImageProcess.ContractData = contract;
                }

                if (idRepDocumentGuiType == "3")
                {
                    SaveOtherDocumentModel other = new SaveOtherDocumentModel();
                    other.MainDocument = new MainDocumentModel();
                    other.MainDocument.MainDocumentTree = new MainDocumentTreeModel()
                    {
                        IdDocumentTree = documentTypeId,
                    };
                    other.DocumentTreeMedia = new Models.DMS.DocumentTreeMediaModel()
                    {
                        MediaName = fileName,
                        IdDocumentTree = other.MainDocument.MainDocumentTree.IdDocumentTree,
                        IdRepTreeMediaType = "1",
                        CloudMediaPath = tree.DocPath.Replace("\\\\", "\\")
                    };
                    other.OtherDocuments = new OtherDocumentFormViewModel();

                    uploadImageProcess.OtherDocumentData = other;
                }

                if (string.IsNullOrEmpty(idRepDocumentGuiType) || idRepDocumentGuiType == "4")
                {
                    uploadImageProcess.ScanningLotItemData.IsSendToCapture = "1";
                }
            }

            try
            {
                var result = await _documentProcessBusiness.AddQueue(uploadImageProcess);
                _logger.Debug("call API UploadImagesService - added document to queue : " + JsonConvert.SerializeObject(uploadImageProcess));
                await Task.CompletedTask;
                return Ok(new
                {
                    UploadSpeed = watch.ElapsedMilliseconds,
                    Result = result
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

        [HttpPost]
        [Route("UpdateImage")]
        [AllowAnonymous]
        public async Task<ActionResult> UpdateImage([FromBody] UpdateImage model)
        {
            if (model != null && model.IdDocumentContainerScans != null && model.IdDocumentContainerScans.Count > 0)
            {
                var result = await _documentProcessBusiness.AddQueueUpdateImage(model.IdDocumentContainerScans);
                return Ok(new
                {
                    result
                });
            }
            return StatusCode(400, "IdDocumentContainerScans  Empty");
        }

        [HttpPost]
        [Route("UploadImageByBase64")]
        public async Task<IActionResult> UploadOrderImageBase64([FromBody] UploadImageModel model, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (model.ScanningLotItemData == null)
            {
                return BadRequest(new { Exception = "ScanningLotItemData not detected!" });
            }
            if (model.Images == null || model.Images.Count == 0)
            {
                return BadRequest(new { Exception = "Images Empty!" });
            }
            string fileName = string.Empty;
            var watch = Stopwatch.StartNew();
            ScanningLotItemData scanningLotItemData = model.ScanningLotItemData;

            SaveOtherDocumentModel OtherDocumentData = model.OtherDocumentData;

            SaveInvoiceModel InvoiceData = model.InvoiceData;

            SaveContractModel ContractData = model.ContractData;

            var listFiles = model.Images.OrderBy(f => f.FileName).ToList();
            UploadImageProcessModel uploadImageProcess = _documentProcessBusiness.ConvertImageByBase64(listFiles, scanningLotItemData);
            watch.Stop();
            if (OtherDocumentData != null)
            {
                uploadImageProcess.OtherDocumentData = OtherDocumentData;
            }
            if (InvoiceData != null)
            {
                uploadImageProcess.InvoiceData = InvoiceData;
            }
            if (ContractData != null)
            {
                uploadImageProcess.ContractData = ContractData;
            }
            var result = await _documentProcessBusiness.AddQueue(uploadImageProcess);
            return Ok(new
            {
                UploadSpeed = watch.ElapsedMilliseconds,
                Result = result
            });
        }

        [HttpPost]
        [Route("ConvertImage")]
        [AllowAnonymous]
        public async Task<ActionResult> ConvertImage([FromBody] ImageModel model)
        {
            var watch = Stopwatch.StartNew();
            _convertImageBusiness.ConvertImages(model.FileName);
            watch.Stop();
            await Task.CompletedTask;
            return Ok(new
            {
                UploadSpeed = watch.ElapsedMilliseconds,
            });
        }
    }
}
