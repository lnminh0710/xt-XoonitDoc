using DMS.Models;
using DMS.Models.DMS;
using DMS.Service;
using DMS.ServiceModels;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace DMS.Business
{
    public class PriceTagBusiness : BaseBusiness, IPriceTagBusiness
    {
        private readonly IDynamicDataService _dynamicDataService;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        private readonly IPathProvider _pathProvider;

        public PriceTagBusiness(IHttpContextAccessor context,   IDynamicDataService dynamicDataService, IPathProvider pathProvider) : base(context)
        {
            _dynamicDataService = dynamicDataService;
            _pathProvider = pathProvider;
        }

        public async Task<object> GetPriceTag(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData getData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpB20GetPriceTag";
            values["Object"] = "GetPriceTag";

            if (values.ContainsKey("IdPriceTag"))
            {
                values["Object"] = "GetPriceTagById";
            }

            getData.AddParams(values);

            return await _dynamicDataService.GetData(getData, returnType: Constants.EDynamicDataGetReturnType.None);
        }

        public async Task<object> CRUDPriceTag(Dictionary<string, object> data)
        {            
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallPriceTag",
                SpObject = "PriceTag"
            };
            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> DeletePriceTag(Dictionary<string, object> data)
        {
            if (data == null || !data.ContainsKey("IdPriceTag"))
            {
                _logger.Error("DeletePriceTag  data request is undefined" );
                throw new Exception("id is undefined");
            }
            try {
                Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
                SaveDynamicData saveData = new SaveDynamicData
                {
                    BaseData = baseData,
                    Data = data,
                    SpMethodName = "SpCallPriceTag",
                    SpObject = "PriceTagDelete"
                };
                return await _dynamicDataService.SaveFormData(saveData);
            } catch(Exception e)
            {
                _logger.Error("DeletePriceTag: " + JsonConvert.SerializeObject(data), e);
                throw e;
            }            
        }

        public async Task<WSEditReturn> SaveDocumentFile(ImportPriceTagDocumentSessionModel sess, List<IFormFile> files, CancellationToken cancellationToken)
        {
            try
            {
                ConvertImageResult convertImageResult = new ConvertImageResult();
                cancellationToken.ThrowIfCancellationRequested();
                var file = files.FirstOrDefault();
                string folderPath = GetUpLoadFolder();
                string userWorking = string.IsNullOrEmpty(_pathProvider.PublicFolder) ? "PriceTag" : Path.Combine(_pathProvider.PublicFolder, "PriceTag");
                                
                string subFolders = Path.Combine(userWorking, !string.IsNullOrEmpty(sess.IdPriceTag) ? sess.IdPriceTag : sess.IdProjects);

                //subFolders = Path.Combine(subFolders, string.IsNullOrEmpty(sess.IdRepDocumentType) ? "-1" : sess.IdRepDocumentType);
                string fullPathDocumentImported = Path.Combine(folderPath, subFolders);

                convertImageResult.ScannedPath = fullPathDocumentImported;

                var newFilename = DateTime.Now.ToString("yyyyMMdd_HHmmss") + "_" + Path.GetFileName(file.FileName);

                string exte = Path.GetExtension(file.FileName).Replace(".", "");
                               

                var documentFullPath = Path.Combine(fullPathDocumentImported, newFilename);

                try
                {
                    Directory.CreateDirectory(fullPathDocumentImported);
                }
                catch (Exception ec)
                {
                    _logger.Error("Cannot create Folder: " + fullPathDocumentImported, ec);
                    throw ec;
                }
                try
                {
                    await SaveFile(file, documentFullPath, cancellationToken);
                }
                catch (Exception errSave)
                {
                    _logger.Error("Cannot save document file : " + documentFullPath, errSave);
                    throw errSave;
                }

                FileInfo fileInfo = new FileInfo(documentFullPath);

                var documentTreeMedia = new Models.DMS.DocumentTreeMediaPriceTagModel()
                {
                    MediaName = newFilename,
                    MediaRelativePath = fullPathDocumentImported.Replace(folderPath,""),
                    MediaOriginalName = file.FileName,
                    MediaSize = fileInfo.Length + "",
                    IdDocumentTree = "35",
                    IdRepTreeMediaType = "1",
                    CloudMediaPath = "",
                    IdCloudConnection = null,
                    IsActive = "1"
                };

                DocumentTreeMediaPriceTagModels models = new DocumentTreeMediaPriceTagModels();
                models.DocumentTreeMedia = new List<DocumentTreeMediaPriceTagModel>();
                models.DocumentTreeMedia.Add(documentTreeMedia);


                Dictionary<string, object> data = new Dictionary<string, object>();
                //var documentTreeMediaJArray = saveData.Data[nameof(SaveOtherDocumentModel.DocumentTreeMedia)] as JArray;
                data.Add("JSONDocumentTreeMedia", JsonConvert.SerializeObject(models));
                data.Add("IdPriceTag", sess.IdPriceTag);
                if (!string.IsNullOrEmpty(sess.IdDocumentTreeMedia))
                {
                    data.Add("IdDocumentTreeMedia", sess.IdDocumentTreeMedia);
                }

                if (!string.IsNullOrEmpty(sess.IdPriceTagMedia))
                {
                    data.Add("IdPriceTagMedia", sess.IdPriceTagMedia);
                }

                var rs = await CRUDDocuments(data);
                WSEditReturn r = (WSEditReturn)rs;
                if (r == null || r.ReturnID == "-1")
                {
                    _logger.Error("Create new priceTag media :" + r.UserErrorMessage);
                    throw new Exception("Cannot save document priceTag to DB error :" + r.UserErrorMessage);
                }
                return r;
            }
            catch (Exception e)
            {
                _logger.Error("SaveDocumentFile", e);
                throw new Exception("SaveDocumentFile error :" + e);
            }
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

        public string GetUpLoadFolder()
        {
            string path = _pathProvider.FileShare;// + "\\XenaScan";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            return path;
        }

        public async Task<object> CRUDDocuments(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallPriceTag",
                SpObject = "PriceTagMedia"
            };

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> GetAttachmentsOfPriceTag(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpB20GetPriceTag";
            values["Object"] = "GetPriceTagMediaById";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }
    }
}
