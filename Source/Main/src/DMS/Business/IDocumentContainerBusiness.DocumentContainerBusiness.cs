using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.DMS;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using DMS.Models;
using System.IO;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using XenaEmail;
using System.Net.Mime;
using DMS.ServiceModels;
using Newtonsoft.Json.Linq;

namespace DMS.Business
{
    public class DocumentContainerBusiness : BaseBusiness, IDocumentContainerBusiness
    {
        public static DocumentTreeImportEmailInfo DefaultInfoTreeMailDoc;

        private readonly IDocumentContainerService _documentContainerService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;
        private readonly AppSettings _appSettings;
        private readonly IDynamicDataService _dynamicDataService;

        public DocumentContainerBusiness(IHttpContextAccessor context,
            IDocumentContainerService documentContainerService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness,
                              IOptions<AppSettings> appSettings,
                              IDynamicDataService dynamicDataService
                              ) : base(context)
        {
            _documentContainerService = documentContainerService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
            _appSettings = appSettings.Value;
            _dynamicDataService = dynamicDataService;
        }

        public async Task<object> GetThumbnails(int pageSize, int pageIndex)
        {
            DocumentContainerScansGetData data = new DocumentContainerScansGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
                PageIndex = pageIndex.ToString(),
                PageSize = pageSize.ToString()
            };
            var result = await _documentContainerService.GetThumbnails(data);
            return result;
        }
        public async Task<IEnumerable<dynamic>> GetDoc2OCR(int? numberFile)
        {
            DocumentContainerScansGetData data = new DocumentContainerScansGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
                TopRows = numberFile != null && numberFile > 0 ? numberFile.ToString() : "1"
            };
            var result = await _documentContainerService.GetDoc2OCR(data);
            return result;
        }

        public async Task<object> SaveDocumentContainerOCR(List<DocumentContainerOCRModel> documentContainerOCRs)
        {

            DocumentContainerOCRSaveData data = (DocumentContainerOCRSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerOCRSaveData));
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = "1";
            List<DocumentContainerOCR> oCRs = new List<DocumentContainerOCR>();
            foreach (DocumentContainerOCRModel model in documentContainerOCRs)
            {
                DocumentContainerOCR oCR = new DocumentContainerOCR();
                oCR.IdDocumentContainerOcr = model.IdDocumentContainerOcr != null ? model.IdDocumentContainerOcr.ToString() : null;
                oCR.IdDocumentContainerScans = model.IdDocumentContainerScans != null ? model.IdDocumentContainerScans.ToString() : null;
                oCR.IdRepDocumentContainerOcrType = model.IdRepDocumentContainerOcrType != null ? model.IdRepDocumentContainerOcrType.ToString() : null;
                oCR.IdRepDocumentType = model.IdRepDocumentType.ToString();
                oCR.OCRJson = model.OCRJson;
                oCR.OCRText = model.OCRText;
                oCR.IsActive = model != null && model.IsActive.Value ? "1" : "0";
                oCRs.Add(oCR);
            }
            JSONDocumentContainerOCR JSONDocumentContainerOCR = new JSONDocumentContainerOCR
            {
                DocumentContainerOCR = oCRs
            };
            data.JSONDocumentContainerOCR = JsonConvert.SerializeObject(JSONDocumentContainerOCR);
            var result = await _documentContainerService.SaveDocumentContainerOCR(data);
            return result;
        }

        public async Task<WSEditReturn> SaveDocumentContainerGroup(List<DocumentContainerGroupModel> documentContainerGroupModels)
        {

            DocumentContainerOCRSaveData data = (DocumentContainerOCRSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerOCRSaveData));
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = "1";
            List<DocumentContainerGroup> oCRs = new List<DocumentContainerGroup>();
            string GroupGuiId = Guid.NewGuid().ToString();
            foreach (DocumentContainerGroupModel model in documentContainerGroupModels)
            {
                DocumentContainerGroup oCR = new DocumentContainerGroup();
                oCR.IdDocumentContainerOcr = model.IdDocumentContainerOcr.ToString();
                oCR.PageNr = model.PageNr.ToString();
                oCR.GUID = GroupGuiId;
                oCRs.Add(oCR);
            }
            JSONDocumentContainerGroup JSONDocumentContainerGroup = new JSONDocumentContainerGroup
            {
                DocumentContainerOCR = oCRs
            };
            data.JSONDocumentContainerOCR = JsonConvert.SerializeObject(JSONDocumentContainerGroup);
            var result = await _documentContainerService.SaveDocumentContainerOCR(data);
            return result;
        }

        public async Task<IEnumerable<dynamic>> GetDoc2Group(int pageSize, int? idDocumentContainerOcr)
        {
            DocumentContainerGroupGetData data = new DocumentContainerGroupGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
                IdDocumentContainerFileType = "3",
                PageSize = pageSize.ToString(),
                B06DocumentContainerOcr_IdDocumentContainerOcr = idDocumentContainerOcr != null ? idDocumentContainerOcr.Value.ToString() : ""
            };
            var result = await _documentContainerService.GetDoc2Group(data);
            return result;
        }

        public async Task<IEnumerable<dynamic>> GetDoc2Entry()
        {
            DocumentContainerGroupGetData data = new DocumentContainerGroupGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
            };
            var result = await _documentContainerService.GetDoc2Entry(data);
            return result;
        }


        public async Task<IEnumerable<dynamic>> SaveDocEntry()
        {
            DocumentContainerGroupGetData data = new DocumentContainerGroupGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
            };
            var result = await _documentContainerService.SaveDocEntry(data);
            return result;
        }

        public async Task<IEnumerable<dynamic>> getFieldForEntry()
        {
            DocumentContainerGroupGetData data = new DocumentContainerGroupGetData
            {
                IdLogin = this.UserFromService.IdLogin,
                IdApplicationOwner = this.UserFromService.IdApplicationOwner,
                LoginLanguage = "1",
            };
            var result = await _documentContainerService.getFieldForEntry(data);
            return result;
        }

        public async Task<WSEditReturn> SaveDocumentContainerProcessed(List<DocumentContainerProcessedModel> models)
        {
            DocumentContainerProcessedSaveData data = (DocumentContainerProcessedSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerProcessedSaveData));
            if (string.IsNullOrEmpty(data.IdLogin))
            {
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
                data.LoginLanguage = "1";
            }
            List<DocumentContainerProcessed> documentContainerProcesseds = new List<DocumentContainerProcessed>();

            foreach (DocumentContainerProcessedModel model in models)
            {
                DocumentContainerProcessed processed = new DocumentContainerProcessed();
                processed.IdDocumentContainerOcr = model.IdDocumentContainerOcr.ToString();
                processed.IdDocumentContainerProcessed = model.IdDocumentContainerProcessed != null ? model.IdDocumentContainerProcessed.ToString() : null;
                processed.JsonDocumentModules = JsonConvert.DeserializeObject(model.JsonDocumentModules);
                processed.IsActive = model.IsActive != null && model.IsActive.Value ? "1" : "0";
                processed.IsFromAI = model.IsFromAI != null && model.IsFromAI.Value ? "1" : "0";
                processed.IsDeleted = model.IsDeleted != null && model.IsDeleted.Value ? "1" : "0";
                documentContainerProcesseds.Add(processed);
            }
            JSONDocumentContainerProcessed jSONDocumentContainerProcessed = new JSONDocumentContainerProcessed
            {
                DocumentContainerProcessed = documentContainerProcesseds
            };
            data.JSONDocumentContainerProcessed = JsonConvert.SerializeObject(jSONDocumentContainerProcessed);
            var result = await _documentContainerService.SaveDocumentContainerProcessed(data);
            return result;
        }

        public async Task<WSEditReturn> SaveDocumentContainerFilesLog(DocumentContainerFilesLog documentContainerFilesLog)
        {
            DocumentContainerFilesLogSaveData data = (DocumentContainerFilesLogSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerFilesLogSaveData));

            data.FileName = documentContainerFilesLog.FileName;
            data.JsonLog = JsonConvert.SerializeObject(documentContainerFilesLog.JsonLog);
            return await _documentContainerService.SaveDocumentContainerFilesLog(data);
        }

        public async Task<IEnumerable<dynamic>> getTextEntity(int? IdRepDocumentType)
        {
            DocumentContainerTextEntityGetData data = (DocumentContainerTextEntityGetData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerTextEntityGetData));
            data.IdRepDocumentType = IdRepDocumentType != null ? IdRepDocumentType.ToString() : null;
            return await _documentContainerService.getTextEntity(data);
        }

        public async Task<IEnumerable<dynamic>> GetPagesByDocId(int idDocumentContainerScans, int? idDocumentContainerFileType)
        {
            DocumentContainerScansGetData data = (DocumentContainerScansGetData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScansGetData));
            data.IdDocumentContainerScans = idDocumentContainerScans.ToString();
            data.IdDocumentContainerFileType = idDocumentContainerFileType != null ? idDocumentContainerFileType.ToString() : "4";
            var result = await _documentContainerService.GetPagesByDocId(data);
            return result;
        }

        public async Task<IEnumerable<dynamic>> GetOCRDataByFileId(string idDocumentContainerFile)
        {
            DocumentContainerScansGetData data = (DocumentContainerScansGetData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScansGetData));
            data.IdDocumentContainerFiles = idDocumentContainerFile;
            var result = await _documentContainerService.GetOCRDataByFileId(data);
            return result;
        }

        public async Task<object> DeleteScanDocument(List<int> IdDocumentContainerScans)
        {

            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            List<ResulDeleteDocumentScanFiles> result = new List<ResulDeleteDocumentScanFiles>();
            for (int i = 0; i < IdDocumentContainerScans.Count; i++)
            {

                //*** get all files scane with IdDocumentContainerScans
                //*** execute call delete data
                //*** execute call delete file
                files.AddRange(await DetectFilesScanById(IdDocumentContainerScans.ElementAt(i)));
            }

            for (int i = 0; i < IdDocumentContainerScans.Count; i++)
            {
                int id = IdDocumentContainerScans.ElementAt(i);
                ResulDeleteDocumentScanFiles rs = new ResulDeleteDocumentScanFiles();
                rs.IdDocumentContainerScans = id;
                //rs.TotalFilesDeleted = 0;
                rs.ResultDeleteFiles = "";

                WSEditReturn vr = await DeleteScanDocument(id);
                if (vr.IsSuccess)
                {
                    _elasticSearchSyncBusiness.DeleteFromElasticSearch(new List<string> { id.ToString() }, "document");
                    rs.ResultDeleteFiles = DeleteScanFilesOnFS(files.Where(f => f.IdDocumentContainerScans == id).ToList());
                }
                rs.StatusDeleteOnDB = vr.IsSuccess;

                result.Add(rs);
            }

            return result;
        }


        private async Task<List<DocumentScanFiles>> DetectFilesScanById(int scanId)
        {
            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            DocumentContainerScanCRUD data = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
            data.IdDocumentContainerScans = scanId.ToString();
            //data.IdLogin = UserFromService.IdLogin;
            //data.IdApplicationOwner = UserFromService.IdApplicationOwner;

            object resultFiles = await _documentContainerService.GetDocumentScanById(data);
            if (resultFiles == null)
            {
                return files;
            }
            string t = resultFiles.ToString();
            files = JsonConvert.DeserializeObject<List<DocumentScanFiles>>(t);

            return files;
        }

        private async Task<WSEditReturn> DeleteScanDocument(int IdDocumentContainerScans)
        {
            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            DocumentContainerScanCRUD data = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
            //data.IdLogin = UserFromService.IdLogin;
            //data.IdApplicationOwner = UserFromService.IdApplicationOwner;
            data.IdDocumentContainerScans = IdDocumentContainerScans.ToString();
            WSEditReturn resultDelete = await _documentContainerService.DeleteScanDocument(data);

            return resultDelete;
        }

        private string DeleteScanFilesOnFS(List<DocumentScanFiles> files)
        {
            string statusDelete = "";
            files.ForEach(f =>
            {
                string file = Path.Combine(f.ScannedPath, f.FileName);
                try
                {
                    if (File.Exists(file))
                    {
                        File.Delete(file);
                        statusDelete += "DELETED file: " + file + "; ";
                    }
                    else
                    {
                        statusDelete += "File not exist. (" + file + ")" + "; ";
                    }
                }
                catch (Exception e)
                {
                    statusDelete += "Cannot delete file. (" + file + ") \n Error: " + e.Message + "; ";
                }
            });
            return statusDelete;
        }

        public async Task<DocumentScanFiles> GetDocumentContainerForDownload(int idDocumentContainerScans, int? idDocumentContainerFileType)
        {
            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            DocumentContainerScanCRUD data = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
            data.IdDocumentContainerScans = idDocumentContainerScans.ToString();
            data.IdDocumentContainerFileType = idDocumentContainerFileType != null ? idDocumentContainerFileType.ToString() : "2"; ///pdf
            //data.IdLogin = UserFromService.IdLogin;
            //data.IdApplicationOwner = UserFromService.IdApplicationOwner;

            object resultFiles = await _documentContainerService.GetDocumentContainerForDownload(data);
            if (resultFiles == null)
            {
                return null;
            }
            string t = resultFiles.ToString();
            files = JsonConvert.DeserializeObject<List<DocumentScanFiles>>(t);

            return files != null && files.Count > 0 ? files.FirstOrDefault() : null;
        }
        public async Task<bool> SendEmailDocument(EmailDocumentModel model)
        {
            System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password),
                EnableSsl = true
            };
            string toEmail = model.ToEmail;
            if (string.IsNullOrEmpty(toEmail))
            {
                Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
                if (data != null && !string.IsNullOrEmpty(data.Email))
                {
                    toEmail = data.Email;
                }
            }
            if (string.IsNullOrEmpty(toEmail))
            {
                throw new Exception("EmailTo Address Is Not Defined ");
            }

            MailMessage mailMessage = new MailMessage(
                    _appSettings.EmailSending.Email,
                   toEmail,
                    !string.IsNullOrEmpty(model.Subject) ? model.Subject : _appSettings.EmailSending.DocumentEmailSubject,
                      !string.IsNullOrEmpty(model.Body) ? model.Body : _appSettings.EmailSending.DocumentEmailBody);
            if (model.Attachments.Count == 0 && model.IdDocumentContainerScans != null)
            {
                DocumentScanFiles documentScanFiles = await GetDocumentContainerForDownload(model.IdDocumentContainerScans.Value, null);
                if (documentScanFiles != null)
                {
                    var fullFileName = Path.Combine(documentScanFiles.ScannedPath, documentScanFiles.FileName);
                    model.Attachments.Add(new EmailAttachmentFile
                    {
                        FullName = fullFileName,
                        DisplayName = documentScanFiles.FileName
                    });
                }
            }
            if (model.Attachments.Count == 0)
            {
                throw new Exception("Attachments Is Empty ");
            }
            #region Attachments
            MailMessageAttachment(mailMessage, model.Attachments);
            #endregion

            client.Send(mailMessage);

            return await Task.FromResult(true);
        }
        private void MailMessageAttachment(MailMessage mailMessage, IList<EmailAttachmentFile> attachments)
        {
            if (attachments == null || attachments.Count == 0) return;

            foreach (var attachmentFile in attachments)
            {
                FileInfo fileInfo = new FileInfo(attachmentFile.FullName);
                if (!fileInfo.Exists) continue;

                Attachment attachment = new Attachment(fileInfo.FullName, MediaTypeNames.Application.Octet);
                System.Net.Mime.ContentDisposition disposition = attachment.ContentDisposition;
                disposition.CreationDate = fileInfo.CreationTime;
                disposition.ModificationDate = fileInfo.LastWriteTime;
                disposition.ReadDate = fileInfo.LastAccessTime;
                disposition.FileName = attachmentFile.DisplayName;
                disposition.Size = fileInfo.Length;
                disposition.DispositionType = DispositionTypeNames.Attachment;
                mailMessage.Attachments.Add(attachment);
            }//for
        }

        public async Task<WSEditReturn> SaveDocumentContainerPage(List<DocumentContainerPageScanModel> models)
        {
            DocumentContainerPageScanData data = (DocumentContainerPageScanData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerPageScanData));


            List<DocumentContainerPageScan> documentContainerPageScans = new List<DocumentContainerPageScan>();

            foreach (DocumentContainerPageScanModel model in models)
            {
                DocumentContainerPageScan pageScan = new DocumentContainerPageScan();
                pageScan.IdDocumentContainerOcr = model.IdDocumentContainerOcr != null ? model.IdDocumentContainerOcr.ToString() : null;
                pageScan.IdDocumentContainerScans = model.IdDocumentContainerScans.ToString();
                pageScan.OldIdDocumentContainerScans = model.OldIdDocumentContainerScans.ToString();
                pageScan.PageNr = model.PageNr.ToString();
                documentContainerPageScans.Add(pageScan);
            }
            JSONDocumentContainerPageScan jSONDocumentContainerPageScan = new JSONDocumentContainerPageScan
            {
                DocumentContainerOCR = documentContainerPageScans
            };
            data.JSONDocumentContainerOCR = JsonConvert.SerializeObject(jSONDocumentContainerPageScan);
            var result = await _documentContainerService.SaveDocumentContainerPage(data);
            return result;
        }

        public CreateQueueModel CreateSystemScheduleUpdateImage(List<string> idDocumentContainerScans)
        {
            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = 12
            };
            idDocumentContainerScans.Distinct();
            List<UpdateImageServiceModel> updateImageServiceModels = new List<UpdateImageServiceModel>();
            foreach (string id in idDocumentContainerScans)
            {
                updateImageServiceModels.Add(new UpdateImageServiceModel { IdDocumentContainerScans = id });
            };
            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(updateImageServiceModels);
            var model = new ScheduleQueueCreateData();
            model.IdRepAppSystemScheduleServiceName = 11;
            model.Queues.Add(scheduleQueueData);
            CreateQueueModel createQueueModel = new CreateQueueModel
            {
                IdRepAppSystemScheduleServiceName = 11,
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
        public async Task<object> GetFilesForUpload()
        {
            Data data = new Data
            {
                IdLogin = "1",
                IdApplicationOwner = "1",
                LoginLanguage = "1"
            };
            var result = await _documentContainerService.GetFilesForUpload(data);
            return result;
        }

        public async Task<object> UpdateFilesForUpload(FileUploadModel fileUploadModel)
        {
            FileUploadSaveData data = new FileUploadSaveData
            {
                IdLogin = "1",
                IdApplicationOwner = "1",
                LoginLanguage = "1",
                IdDocumentContainerFilesUpload = fileUploadModel.IdDocumentContainerFilesUpload,
                UploadDuration = fileUploadModel.UploadDuration
            };
            var result = await _documentContainerService.UpdateFilesForUpload(data);
            return result;
        }
        public async Task<List<DocumentScanFiles>> GetDocumentScanFiles(List<string> IdDocumentContainerScansList)
        {
            List<DocumentScanFiles> files = new List<DocumentScanFiles>();
            DocumentContainerScanCRUD data = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
            data.IdDocumentContainerScansList = String.Join(", ", IdDocumentContainerScansList.ToArray());
            object resultFiles = await _documentContainerService.GetDocumentContainerFileByListIds(data);
            if (resultFiles != null)
            {
                string t = resultFiles.ToString();
                files = JsonConvert.DeserializeObject<List<DocumentScanFiles>>(t);
            }
            return files;
        }
        public async Task<WSEditReturn> SaveDocumentContainerUnGroup(List<DocumentScanFiles> models)
        {

            DocumentContainerPageScanData data = (DocumentContainerPageScanData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerPageScanData));


            List<DocumentContainerPageScan> documentContainerPageScans = generateDocumentContainerPageScan(models);


            JSONDocumentContainerPageScan jSONDocumentContainerPageScan = new JSONDocumentContainerPageScan
            {
                DocumentContainerOCR = documentContainerPageScans
            };
            data.JSONDocumentContainerOCR = JsonConvert.SerializeObject(jSONDocumentContainerPageScan);
            var result = await _documentContainerService.SaveDocumentUnGroup(data);
            return result;
        }

        private List<DocumentContainerPageScan> generateDocumentContainerPageScan(List<DocumentScanFiles> files)
        {
            Dictionary<int, List<DocumentScanFiles>> dic = new Dictionary<int, List<DocumentScanFiles>>();
            foreach (DocumentScanFiles file in files)
            {
                int key = file.OldIdDocumentContainerScans != null ? file.OldIdDocumentContainerScans.Value : file.IdDocumentContainerScans;
                if (!dic.ContainsKey(key))
                {
                    dic.Add(key, new List<DocumentScanFiles>());
                }
                dic[key].Add(file);

            }
            List<DocumentContainerPageScan> documentContainerPageScans = new List<DocumentContainerPageScan>();
            int pageNr = 1;
            foreach (int key in dic.Keys)
            {
                pageNr = 1;
                List<DocumentScanFiles> lstFiles = dic[key].OrderBy(s => s.PageNr).ToList();
                foreach (DocumentScanFiles model in lstFiles)
                {
                    DocumentContainerPageScan pageScan = new DocumentContainerPageScan();
                    pageScan.IdDocumentContainerOcr = model.IdDocumentContainerOcr.ToString();
                    pageScan.IdDocumentContainerScans = key.ToString();
                    pageScan.OldIdDocumentContainerScans = null;
                    pageScan.PageNr = pageNr.ToString();
                    documentContainerPageScans.Add(pageScan);
                    pageNr++;
                }
            }
            return documentContainerPageScans;
        }

        public async Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree)
        {
            return await _documentContainerService.GetDocumentTreesDetails(idDocumentTree);
        }

        public async Task<List<DocumentTreeInfo>> GetDetailTreeNode(string nodeName, string userId, string idApplicationOwner)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = this.UserFromService.IdLogin;
            if (!string.IsNullOrEmpty(userId))
            {
                baseData.IdLogin = userId;
            }
            if (!string.IsNullOrEmpty(idApplicationOwner))
            {
                baseData.IdApplicationOwner = idApplicationOwner;
            }
            return await _documentContainerService.GetDetailTreeNode(baseData, nodeName);
        }

        public async Task<List<DocumentTreeInfo>> GetOtherTreeNode(string userId, string idApplicationOwner)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = this.UserFromService.IdLogin;
            if (!string.IsNullOrEmpty(userId))
            {
                baseData.IdLogin = userId;
            }
            if (!string.IsNullOrEmpty(idApplicationOwner))
            {
                baseData.IdApplicationOwner = idApplicationOwner;
            }
            return await _documentContainerService.GetOtherTreeNode(baseData);
        }

        /// <summary>
        /// GetEmailData
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public async Task<object> GetEmailData(Dictionary<string, object> values)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetEmailData";

            dynamicData.AddParams(values);
            return await _dynamicDataService.GetData(dynamicData, returnType: Constants.EDynamicDataGetReturnType.OneRow);
        }

        /// <summary>
        /// GetEmailAttachements
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public async Task<object> GetEmailAttachements(Dictionary<string, object> values)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetEmailAttachements";

            dynamicData.AddParams(values);
            return await _dynamicDataService.GetData(dynamicData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
        }

        /// <summary>
        /// GetDefaultInfoTreeMailDoc
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public async Task<DocumentTreeImportEmailInfo> GetDefaultInfoTreeMailDoc()
        {
            //Get from cache
            if (DefaultInfoTreeMailDoc != null) return await Task.FromResult(DefaultInfoTreeMailDoc);

            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetDefaultInfoTreeMailDoc";

            var response = await _dynamicDataService.GetData(dynamicData, returnType: Constants.EDynamicDataGetReturnType.OneRow);
            if (response != null)
            {
                JObject jObject = (JObject)response;
                DefaultInfoTreeMailDoc =  jObject.ToObject<DocumentTreeImportEmailInfo>();
                return DefaultInfoTreeMailDoc;
            }

            return null;
        }

        public async Task<object> GetDocumentsOfTree(Dictionary<string, object> values)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetFolderFiles";

            dynamicData.AddParams(values);
            return await _dynamicDataService.GetDynamicDataFormTable(dynamicData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
        }

        public async Task<object> GetDocumentsOfEmailTree(Dictionary<string, object> values)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetEmailsByTree";

            dynamicData.AddParams(values);
            var data = await _dynamicDataService.GetDynamicDataFormTable(dynamicData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
            return data;
        }

        public async Task<object> GetImportFolderOfCompany(Dictionary<string, object> values)
        {
            DynamicData dynamicData = new DynamicData(ServiceDataRequest);
            dynamicData.Data.MethodName = "SpB06GetDocumentContainer";
            dynamicData.Data.Object = "GetImportFolderOfCompany";

            dynamicData.AddParams(values);
            var data = await _dynamicDataService.GetDynamicDataFormTable(dynamicData, returnType: Constants.EDynamicDataGetReturnType.Datatable);
            return data;
        }
    }
}
