using AutoMapper;
using DMS.Constants;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;
using DMS.Models.DynamicControlDefinitions;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using DMS.Service;
using DMS.ServiceModels;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OrderProcessingPdf;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using XenaEmail;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    public class DocumentBusiness : BaseBusiness, IDocumentBusiness
    {
        private readonly AppSettings _appSettings;
        private readonly IPathProvider _pathProvider;
        private readonly IDocumentService _documentService;
        private readonly IFileBusiness _fileBusiness;
        private readonly IContactBusiness _contactBusiness;
        private readonly IMapper _mapper;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly ICloudBusiness _cloudBusiness;
        private readonly IDynamicDataService _dynamicDataService;
        private readonly IUniqueService _uniqueService;
        private readonly ICommonBusiness _commonBusiness;
        private readonly IDocumentIndexingBusiness _documentIndexingBusiness;
        private readonly IDocumentEmailBusiness _documentEmailBusiness;
        private readonly IDocumentCommonBusiness _documentCommonlBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        public DocumentBusiness(IHttpContextAccessor context,
                              IDocumentService documentService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness,
                              IFileBusiness fileBusiness,
                              IPathProvider pathProvider,
                              IOptions<AppSettings> appSettings,
                              IContactBusiness contactBusiness,
                              IElasticSearchSyncBusiness elasticSearchSync,
                              ICloudBusiness cloudBusiness,
                              IMapper mapper,
                              IDynamicDataService dynamicDataService,
                              IUniqueService uniqueService,
                              ICommonBusiness commonBusiness,
                              IDocumentIndexingBusiness documentIndexingBusiness,
                              IDocumentEmailBusiness documentEmailBusiness,
                              IDocumentCommonBusiness documentCommonlBusiness) : base(context)
        {
            _appSettings = appSettings.Value;
            _pathProvider = pathProvider;
            _documentService = documentService;
            _fileBusiness = fileBusiness;
            _contactBusiness = contactBusiness;
            _mapper = mapper;
            _elasticSearchSync = elasticSearchSync;
            _cloudBusiness = cloudBusiness;
            _dynamicDataService = dynamicDataService;
            _uniqueService = uniqueService;
            _commonBusiness = commonBusiness;
            _documentIndexingBusiness = documentIndexingBusiness;
            _documentEmailBusiness = documentEmailBusiness;
            _documentCommonlBusiness = documentCommonlBusiness;
        }

        /// <summary>
        /// SaveScanningDocument
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<WSEditReturn> SaveScanningDocument(SavingScanningDocumentItemData model)
        {
            SavingScanningDocumentItemData data = (SavingScanningDocumentItemData)ServiceDataRequest.ConvertToRelatedType(typeof(SavingScanningDocumentItemData), model);
            var result = await _documentService.SaveScanningDocument(data);
            return result;
        }

        /// <summary>
        /// GetDocumentContainerPathSetting
        /// </summary>
        /// <returns></returns>
        public async Task<IList<DocumentContainerPathSetting>> GetDocumentContainerPathSetting()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetDocumentContainerPathSetting(data);
            return result;
        }

        /// <summary>
        /// GetDocumentContainerFilesType
        /// </summary>
        /// <returns></returns>
        public async Task<IList<DocumentContainerFilesType>> GetDocumentContainerFilesType()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetDocumentContainerFilesType(data);
            return result;
        }

        /// <summary>
        /// GetCustomerAssignmentsDetail
        /// </summary>
        /// <param name="idPerson"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetCustomerAssignmentsDetail(int idPerson, int idOrderProcessing)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetCustomerAssignmentsDetail(data, idPerson, idOrderProcessing);
            return result;
        }

        #region Save Order, Invoice, Offer
        public async Task<object> SaveOrderProcessing(OrderProcessingModel model)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveOrderProcessingData saveData = new SaveOrderProcessingData
            {
                BaseData = baseData,
                Data = model.Data,
                IgnoredKeys = new List<string>() { "SavingMode", "IsForInvoice", "IsForOffer", "IsForOrder" }
            };

            //Save Order Processing
            var resultOP = await _documentService.SaveOrderProcessing(saveData);

            if (resultOP.IsSuccess && !string.IsNullOrEmpty(resultOP.ReturnID))
            {
                int idOrderProcessing = ConverterUtils.ToInt(resultOP.ReturnID, 0);
                if (idOrderProcessing <= 0) return resultOP;

                var savingMode = ConverterUtils.ToInt(saveData.Data.GetStringValue("SavingMode"), 0);
                switch (savingMode)
                {
                    case (int)OrderProcessingRequestSavingMode.OPSaveAndRunAsPrint:
                    case (int)OrderProcessingRequestSavingMode.OPSaveAndRunAsEmail:
                        #region Save And Run As Print
                        var isForInvoice = ConverterUtils.ToBool(saveData.Data.GetStringValue("IsForInvoice"), false);
                        var isForOffer = ConverterUtils.ToBool(saveData.Data.GetStringValue("IsForOffer"), false);
                        var isForOrder = ConverterUtils.ToBool(saveData.Data.GetStringValue("IsForOrder"), false);

                        // Export Pdf Files and Save Files
                        IList<int> idRepProcessingTypes = new List<int>();
                        if (isForOffer) idRepProcessingTypes.Add((int)ERepProcessingType.Offer);
                        if (isForOrder) idRepProcessingTypes.Add((int)ERepProcessingType.Order);
                        if (isForInvoice) idRepProcessingTypes.Add((int)ERepProcessingType.Invoice);

                        if (idRepProcessingTypes.Count > 0)
                        {
                            int? idOffer = null;
                            int? idOrder = null;
                            int? idInvoice = null;

                            if (isForOffer)
                            {
                                var offerData = saveData.Data.GetValue("OfferData");
                                if (offerData != null)
                                    idOffer = ConverterUtils.ToIntWithNull(JObject.FromObject(offerData).ToObject<Dictionary<string, object>>().GetStringValue("B05Offer_IdOffer"));
                            }
                            if (isForOrder)
                            {
                                var orderData = saveData.Data.GetValue("OrderData");
                                if (orderData != null)
                                    idOrder = ConverterUtils.ToIntWithNull(JObject.FromObject(orderData).ToObject<Dictionary<string, object>>().GetStringValue("B05Order_IdOrder"));
                            }
                            if (isForInvoice)
                            {
                                var invoiceData = saveData.Data.GetValue("InvoiceData");
                                if (invoiceData != null)
                                    idInvoice = ConverterUtils.ToIntWithNull(JObject.FromObject(invoiceData).ToObject<Dictionary<string, object>>().GetStringValue("B05Invoice_IdInvoice"));
                            }

                            var saveDocumentsLinkModel = new OrderProcessingSaveDocumentsLinkModel()
                            {
                                IdRepProcessingTypes = idRepProcessingTypes,
                                IdOrderProcessing = idOrderProcessing,
                                IdOffer = idOffer,
                                IdOrder = idOrder,
                                IdInvoice = idInvoice
                            };
                            var pdfFiles = await SaveOrderProcessingDocumentsLink(saveDocumentsLinkModel);
                            resultOP.Payload = pdfFiles;
                        }
                        #endregion
                        break;
                }
            }

            return resultOP;
        }
        #endregion

        #region Generate OrderProcessing Pdf
        /// <summary>
        /// Generate Order Processing Pdf
        /// </summary>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<OrderProcessingPdfFileInfo> GenerateOrderProcessingPdf(int idRepProcessingType, int idOrderProcessing, int? idOffer = null, int? idOrder = null, int? idInvoice = null)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetOrderProcessingForGeneratingPdf(data, idRepProcessingType, idOrderProcessing, idOffer, idOrder, idInvoice);

            if (result != null)
            {
                string saveFullFileName = CreateFullFileNameOrderProcessing();

                //var templateFolder = Path.Combine(_pathProvider.GetFullUploadFolderPath(UploadMode.Template), UploadMode.OrderProcessing.ToString());
                //string templateFullFileName = Path.Combine(templateFolder, "Template1.html");
                //IDictionary<string, string> htmlValues = BuildPdfValuesHtml(result);
                //var generateSuccess = await _fileBusiness.GeneratePdfFile(htmlValues, templateFullFileName, saveFullFileName);

                BuildPdfValues(result);
                var generateSuccess = await _fileBusiness.GeneratePdfFile(result, saveFullFileName);
                if (generateSuccess)
                {
                    FileInfo fileInfo = new FileInfo(saveFullFileName);
                    var fullFolderPath = fileInfo.DirectoryName;

                    string originalFileNamePrefix = string.IsNullOrEmpty(result.Header.OP_Number) ? GetRepProcessingTypeName(idRepProcessingType) : result.Header.OP_Number;
                    var originalFileName = string.Format("{0}_{1}.pdf", originalFileNamePrefix, DateTime.Now.ToString("yyyy-MM-dd_HH:mm:ss", CultureInfo.InvariantCulture));

                    return new OrderProcessingPdfFileInfo()
                    {
                        IdRepProcessingType = idRepProcessingType,
                        IdOrderProcessing = idOrderProcessing,

                        FileType = "PDF",
                        FileName = Path.GetFileName(saveFullFileName),
                        FullFileName = saveFullFileName,
                        FullFolderPath = fullFolderPath,
                        RelativeFolderPath = _pathProvider.GetRelativePath(fullFolderPath),
                        OriginalFileName = originalFileName,
                        MediaSize = fileInfo.Length
                    };
                }
            }

            return await Task.FromResult(new OrderProcessingPdfFileInfo());
        }

        private IDictionary<string, string> BuildPdfValuesHtml(OrderProcessingPdfModel model)
        {
            IDictionary<string, string> htmlValues = new Dictionary<string, string>();

            string companyLogo = "";
            var fullFileName = Path.Combine(_pathProvider.FileShare, model.Header.CompanyLogo);
            if (File.Exists(fullFileName))
            {
                byte[] bytes = File.ReadAllBytes(fullFileName);
                companyLogo = string.Format("data:image/{1};base64,{0}", Convert.ToBase64String(bytes), Path.GetExtension(fullFileName).Replace(".", ""));
            }

            htmlValues["[Header_Logo]"] = companyLogo;
            htmlValues["[Header_CompanyInfo]"] = FixPdfHtmlEmpty(model.Header.CompanyAddress);
            htmlValues["[Header_ReceiverInfo]"] = FixPdfHtmlEmpty(model.Header.ReceiverInfo);
            htmlValues["[Header_DeliveryInfo]"] = FixPdfHtmlEmpty(model.Header.OrderInfo);

            htmlValues["[Content_SKUs]"] = BuildPdfHtmlOrderDetails(model.Content.OrderDetails);
            htmlValues["[Content_TotalAmount]"] = model.Content.TotalAmount.ToNumberString();
            htmlValues["[Content_TotalTaxAmount]"] = model.Content.TotalTaxAmount.ToNumberString();
            htmlValues["[Content_TaxOrganizer]"] = model.Content.OrganizerTax.ToNumberString();

            htmlValues["[Footer_ScanNumber]"] = model.Footer.ScanNr + string.Empty;
            htmlValues["[Footer_PaymentFor]"] = model.Footer.PaymentFor + string.Empty;
            htmlValues["[Footer_InfavourOf]"] = model.Footer.InfavourOf + string.Empty;
            htmlValues["[Footer_AccountNr]"] = model.Footer.AccountNr + string.Empty;
            htmlValues["[Footer_CReferenceNr]"] = model.Footer.CReferenceNr + string.Empty;
            htmlValues["[Footer_PaidInBy]"] = model.Footer.PaidBy + string.Empty;

            htmlValues["[Footer_TotalAmount_IntPart]"] = model.Content.TotalAmount_IntPart;
            htmlValues["[Footer_TotalAmount_FractionalPart]"] = model.Content.TotalAmount_FractionalPart;

            return htmlValues;
        }

        private string BuildPdfHtmlOrderDetails(IList<OrderProcessingPdfOrderDetail> orderDetails)
        {
            string htmlOrderDetails = "";
            if (orderDetails != null && orderDetails.Count > 0)
            {
                const string templateOrderDetail = "<tr> <td class=\"ticket\">[OD_ticket]</td> <td class=\"code\">[OD_code]</td> <td class=\"CHF-exklMwSt\">[OD_CHF-exklMwSt]</td> <td class=\"MwSt-percent\">[OD_MwSt-percent]</td> <td class=\"MwSt\">[OD_MwSt]</td> <td class=\"qty\">[OD_qty]</td> <td class=\"CHF-inklMwSt\">[OD_CHF-inklMwSt]</td> </tr>";
                htmlOrderDetails = string.Empty;
                foreach (var item in orderDetails)
                {
                    string htmlItem = templateOrderDetail;

                    htmlItem = htmlItem.Replace("[OD_ticket]", item.ArticleNameShort + string.Empty)
                                       .Replace("[OD_code]", item.SerialNr + string.Empty)
                                       .Replace("[OD_CHF-exklMwSt]", item.PriceExclVat.ToNumberString())
                                       .Replace("[OD_MwSt-percent]", item.VatRate.ToNumberString())
                                       .Replace("[OD_MwSt]", item.TaxAmount.ToNumberString())
                                       .Replace("[OD_qty]", item.Quantity + string.Empty)
                                       .Replace("[OD_CHF-inklMwSt]", item.Amount.ToNumberString());

                    htmlOrderDetails += htmlItem;
                }//for
            }

            return htmlOrderDetails;
        }

        private string FixPdfHtmlEmpty(string content)
        {
            if (string.IsNullOrEmpty(content)) return "&nbsp";

            return content;
        }

        private void BuildPdfValues(OrderProcessingPdfModel dataModel)
        {
            var fullFileName = Path.Combine(_pathProvider.FileShare, dataModel.Header.CompanyLogo);
            if (File.Exists(fullFileName))
            {
                byte[] bytes = File.ReadAllBytes(fullFileName);
                dataModel.Header.CompanyLogoBase64 = bytes;
            }
        }

        private string GetRepProcessingTypeName(int idRepProcessingType)
        {
            switch (idRepProcessingType)
            {
                case (int)ERepProcessingType.Offer:
                    return "Offer";
                case (int)ERepProcessingType.Order:
                    return "Order";
                case (int)ERepProcessingType.Invoice:
                    return "Invoice";
                case (int)ERepProcessingType.AllDocuments:
                    return "AllDocuments";
                default:
                    return "OP";
            }
        }

        private string CreateFullFileNameOrderProcessing()
        {
            var saveFolder = _pathProvider.GetFullUploadFolderPath(UploadMode.OrderProcessing);
            saveFolder = Path.Combine(saveFolder, string.Format(@"{0}\{1}\{2}", DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day));

            var fileName = string.Format("{0}.pdf", Guid.NewGuid().ToString());
            string saveFullFileName = Path.Combine(saveFolder, fileName);

            return saveFullFileName;
        }
        #endregion

        #region Save Order Processing Documents Link
        /// <summary>
        /// Save Order Processing Documents Link
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<IList<OrderProcessingPdfFileInfo>> SaveOrderProcessingDocumentsLink(OrderProcessingSaveDocumentsLinkModel model)
        {
            #region Export Pdf Files
            IList<OrderProcessingPdfFileInfo> pdfFiles = new List<OrderProcessingPdfFileInfo>();
            foreach (int idRepProcessingType in model.IdRepProcessingTypes)
            {
                if (idRepProcessingType == (int)ERepProcessingType.AllDocuments) continue;

                var pdfFileInfo = await GenerateOrderProcessingPdf(idRepProcessingType, model.IdOrderProcessing, model.IdOffer, model.IdOrder, model.IdInvoice);
                if (!string.IsNullOrEmpty(pdfFileInfo.FileName))
                {
                    pdfFiles.Add(pdfFileInfo);
                }
            }
            #endregion

            #region Create File AllDocuments
            var allDocumentsType = (int)ERepProcessingType.AllDocuments;
            OrderProcessingPdfFileInfo allDocumentsFile = null;
            if (model.IdRepProcessingTypes.Contains(allDocumentsType))
            {
                var currentAllFileInfo = model.AllFileInfos.FirstOrDefault(n => n.IdRepProcessingType == allDocumentsType);

                string saveFullFileName = currentAllFileInfo != null ? currentAllFileInfo.FullFileName : CreateFullFileNameOrderProcessing();
                if (!saveFullFileName.StartsWith(_pathProvider.FileShare))
                    saveFullFileName = Path.Combine(_pathProvider.FileShare, saveFullFileName);

                //If merge files not exist from allFiles -> add them
                List<string> mergeListFiles = new List<string>();
                mergeListFiles = pdfFiles.Select(n => n.FullFileName).ToList();
                foreach (var item in model.AllFileInfos)
                {
                    if (!pdfFiles.Any(n => n.IdRepProcessingType == item.IdRepProcessingType))
                    {
                        if (!item.FullFileName.StartsWith(_pathProvider.FileShare))
                            mergeListFiles.Add(Path.Combine(_pathProvider.FileShare, item.FullFileName));
                    }
                }

                //Merge PDFs
                OrderProcessingPdf.Utils.PdfUtils.MergePDFs(mergeListFiles, saveFullFileName);

                #region Only save AllDocuments file into DB when file is not exist
                if (currentAllFileInfo == null)
                {
                    FileInfo fileInfo = new FileInfo(saveFullFileName);
                    var fullFolderPath = fileInfo.DirectoryName;
                    var originalFileName = string.Format("AllDocuments_{0}.pdf", DateTime.Now.ToString("yyyy-MM-dd_HH:mm:ss", CultureInfo.InvariantCulture));

                    pdfFiles.Insert(0, new OrderProcessingPdfFileInfo()
                    {
                        IdRepProcessingType = allDocumentsType,
                        IdOrderProcessing = model.IdOrderProcessing,

                        FileType = "PDF",
                        FileName = Path.GetFileName(saveFullFileName),
                        FullFileName = saveFullFileName,
                        FullFolderPath = fullFolderPath,
                        RelativeFolderPath = _pathProvider.GetRelativePath(fullFolderPath),
                        OriginalFileName = originalFileName,
                        MediaSize = fileInfo.Length
                    });
                }
                else
                {
                    //Keep data to return to Client for showing All Pdf
                    allDocumentsFile = new OrderProcessingPdfFileInfo()
                    {
                        IdRepProcessingType = allDocumentsType,
                        IdOrderProcessing = model.IdOrderProcessing,

                        FileName = Path.GetFileName(saveFullFileName),
                        FullFileName = saveFullFileName,
                        FullFolderPath = Path.GetDirectoryName(saveFullFileName),
                        RelativeFolderPath = _pathProvider.GetRelativePath(saveFullFileName),
                        OriginalFileName = currentAllFileInfo.OriginalFileName
                    };
                }
                #endregion
            }

            #endregion

            #region Save DB
            if (pdfFiles.Count > 0)
            {
                IList<OrderProcessingDocumentsLink> documents = new List<OrderProcessingDocumentsLink>();
                foreach (var pdfFile in pdfFiles)
                {
                    documents.Add(new OrderProcessingDocumentsLink
                    {
                        IdOrderProcessing = pdfFile.IdOrderProcessing,
                        IdRepProcessingType = pdfFile.IdRepProcessingType,
                        MediaName = pdfFile.FileName,
                        MediaRelativePath = pdfFile.RelativeFolderPath,
                        MediaOriginalName = pdfFile.OriginalFileName,
                        FileType = pdfFile.FileType,
                        MediaSize = pdfFile.MediaSize,

                        IdOffer = model.IdOffer,
                        IdOrder = model.IdOrder,
                        IdInvoice = model.IdInvoice,
                    });
                }

                Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
                SaveOrderProcessingDocumentsLinkData documentsLinkData = new SaveOrderProcessingDocumentsLinkData
                {
                    Data = baseData,
                    Files = documents
                };

                var saveDocumentsLinkResult = await _documentService.SaveOrderProcessingDocumentsLink(documentsLinkData);

                if (saveDocumentsLinkResult.IsSuccess)
                {
                    if (allDocumentsFile != null) pdfFiles.Add(allDocumentsFile);

                    return pdfFiles;
                }
            }
            #endregion

            return await Task.FromResult(new List<OrderProcessingPdfFileInfo>());
        }
        #endregion

        #region Send Mail Order Processing
        /// <summary>
        /// Send Mail Order Processing
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<object> SendMailOrderProcessing(OrderProcessingSendMailModel model)
        {
            IXenaEmailService emailService = new XenaEmailService
            {
                SmtpMailSettings = new SmtpMailSettings()
                {
                    From = _appSettings.EmailSending.Email,
                    Host = _appSettings.EmailSending.Domain,
                    Port = _appSettings.EmailSending.Port,
                    UserName = _appSettings.EmailSending.Email,
                    Password = _appSettings.EmailSending.Password,
                }
            };

            foreach (var item in model.Items)
            {
                IList<EmailAttachmentFile> attachments =
                    item.AttachmentFiles.Select(n => new EmailAttachmentFile
                    {
                        FullName = AppendFileShare(n.FullFileName),
                        DisplayName = n.OriginalFileName,
                    }).ToList();

                emailService.SendEmail(model: new XenaEmailModel
                {
                    ToEmail = item.ToEmails,
                    Subject = item.Subject,
                    Body = item.Content,
                    Attachments = attachments
                }).Wait();
            }

            return await Task.FromResult(true);
        }

        private string AppendFileShare(string fullFileName)
        {
            if (fullFileName.StartsWith(_pathProvider.FileShare)) return fullFileName;

            return Path.Combine(_pathProvider.FileShare, fullFileName);
        }
        #endregion

        /// <summary>
        /// Get Data OrderProcessing By Id
        /// </summary>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetDataOrderProcessingById(int idOrderProcessing)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetDataOrderProcessingById(data, idOrderProcessing);

            return result;
        }

        /// <summary>
        /// Get Order Processing Documents
        /// </summary>
        /// <param name="data"></param>
        /// <param name="idRepProcessingType"></param>
        /// <param name="idOrderProcessing"></param>
        /// <returns></returns>
        public async Task<object> GetOrderProcessingDocuments(int idRepProcessingType, int idOrderProcessing)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetOrderProcessingDocuments(data, idRepProcessingType, idOrderProcessing);

            return result;
        }

        /// <summary>
        /// GetOrderProcessingEmail
        /// </summary>
        /// <param name="idOrderProcessing"></param>
        /// <param name="perType"></param>
        /// <returns></returns>
        public async Task<object> GetOrderProcessingEmail(int idOrderProcessing, string perType)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _documentService.GetOrderProcessingEmail(data, idOrderProcessing, perType);

            return result;
        }

        #region Delete/Cancel Document
        /// <summary>
        /// Delete/ Cancel OP, Order, Invoice
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<object> DeleteCancelDocument(DeleteCancelDocumentModel model)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DeleteCancelDocumentData saveData = new DeleteCancelDocumentData
            {
                BaseData = baseData,
                Data = model.Data
            };

            return await _documentService.DeleteCancelDocument(saveData);
        }

        public async Task<DocumentSummaryModel> GetDocumentSummary()
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = this.UserFromService.IdLogin;

            return await _documentService.GetDocumentSummary(baseData);
        }

        public async Task<IEnumerable<TreeNode<int, DocumentTreeModel>>> GetDocumentTreeByUser(GetDocumentTreeOptions options)
        {
            try
            {
                if (string.IsNullOrEmpty(options.IsProcessingModule) || (options.IsProcessingModule == "0"))
                    options.IsProcessingModule = "0";
                else
                {
                    options.IsProcessingModule = "1";
                }

                DocumentTreeGetData @params = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeGetData)) as DocumentTreeGetData;
                @params.IdLogin = this.UserFromService.IdLogin;
                @params.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
                @params.LoginLanguage = this.UserFromService.IdRepLanguage;
                @params.ShouldGetDocumentQuantity = options.ShouldGetDocumentQuantity;
                @params.IdPerson = options.IdPerson;
                @params.IsSearchForEmail = options.IsSearchForEmail;
                @params.IsProcessingModule = options.IsProcessingModule == "0" ? 0 : 1;

                var data = await _documentService.GetDocumentTreeByUser(@params);
                var tree = BuildTreeHelper.BuildTree<int, DocumentTreeModel>(data, node => node.IdDocumentTree, node => node.IdDocumentTreeParent ?? default(int));
                return tree;
            }
            catch (Exception ex)
            {
                _logger.Error("GetDocumentTreeByUser", ex);
                throw;
            }
        }

        public async Task<IEnumerable<TreeNode<int, FavouriteFolderModel>>> GetFavouriteFolderByUser()
        {
            try
            {
                DocumentTreeGetData @params = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeGetData)) as DocumentTreeGetData;
                @params.IdLogin = this.UserFromService.IdLogin;
                @params.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
                @params.LoginLanguage = this.UserFromService.IdRepLanguage;

                var data = await _documentService.GetFavouriteFolderByUser(@params);

                var tree = BuildTreeHelper.BuildTree<int, FavouriteFolderModel>(data, node => node.IdRepMyFavorites, node => node.IdDocumentTreeParent ?? default(int));
                return tree;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<DocumentInvoiceDynamicComboboxModel>> GetDocumentInvoiceDynamicCombobox(int idDocumentTree)
        {
            DocumentInvoiceDynamicData baseData = (DocumentInvoiceDynamicData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentInvoiceDynamicData));
            baseData.IdLogin = this.UserFromService.IdLogin;
            baseData.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            baseData.LoginLanguage = this.UserFromService.IdRepLanguage;
            baseData.IdDocumentTree = idDocumentTree.ToString();

            return await _documentService.GetDocumentInvoiceDynamicCombobox(baseData);
        }
        #endregion

        #region MyDM business
        public async Task<IEnumerable<object>> GetExtractedDataFromOcr(int idRepDocumentType, int idDocumentContainerOcr, int idDocumentContainerScan, string module)
        {
            ExtractedDataOcrData data = ServiceDataRequest.ConvertToRelatedType(typeof(ExtractedDataOcrData)) as ExtractedDataOcrData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.IdRepDocumentType = idRepDocumentType;
            data.IdDocumentContainerOcr = idDocumentContainerOcr;
            data.IdDocumentContainerScan = idDocumentContainerScan;
            data.FromModule = module;

            var result = await _documentService.GetExtractedDataFromOcr(data);
            return result;
        }

        public async Task<WSNewReturnValue> CreateFolder(DocumentTreeViewModel model)
        {
            DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
            if (!string.IsNullOrEmpty(model.IdLogin) && model.IdLogin != this.UserFromService.IdLogin)
            {
                data.IdLogin = model.IdLogin;
            }
            else
            {
                data.IdLogin = this.UserFromService.IdLogin;
            }

            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            model.IsActive = true;
            model.IsDeleted = "0";
            model.IsReadOnly = "0";
            model.IdLogin = data.IdLogin;

            if (model.IdDocumentType == 5)
            {
                return await _documentIndexingBusiness.CreateSubFolderIndexing(model.Name, model.IdDocumentParent + "", data.IdLogin, data.IdApplicationOwner, data.LoginLanguage);
            } else if (model.IdDocumentType == 6)
            {
                return await _documentEmailBusiness.CreateSubFolderEmail(model.Name, model.IdDocumentParent + "", data.IdLogin, data.IdApplicationOwner, data.LoginLanguage);
            }
            var rs = await _documentService.CreateFolder(data, model);
            _logger.Debug($"CreateFolder - {JsonConvert.SerializeObject(model)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
            return rs;
        }

        public async Task<object> CreateFolderFavourite(DocumentTreeViewModel model)
        {
            var jsonObject = new
            {
                RepMyFavorites = new List<FavouriteFolderViewModel> {
                    new FavouriteFolderViewModel
                    {
                        IdRepMyFavorites = null,
                        DefaultValue = model.Name,
                        IsBlocked = "0",
                        IsDeleted = "0",
                        IsReadOnly = "0",
                    }
                }
            };
            FavouriteFolderData data = ServiceDataRequest.ConvertToRelatedType(typeof(FavouriteFolderData)) as FavouriteFolderData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.JSONText = JsonConvert.SerializeObject(jsonObject);

            return await _documentService.CreateFolderFavourite(data);
        }

        public async Task<object> AddContactToFavourite(FavouriteContactModel model)
        {
            var jsonObject = new
            {
                MyFavorites = new List<FavouriteContactModel> {
                    new FavouriteContactModel
                    {
                        IdMyFavorites = null,
                        IdPerson = model.IdPerson,
                        IdRepMyFavorites = model.IdRepMyFavorites,
                        IsActive = "0",
                        IsDeleted = "0",
                    }
                }
            };
            FavouriteFolderData data = ServiceDataRequest.ConvertToRelatedType(typeof(FavouriteFolderData)) as FavouriteFolderData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.JSONText = JsonConvert.SerializeObject(jsonObject);

            var result = await _documentService.AddContactToFavourite(data);

            await _contactBusiness.SyncDocumentContactByIdPerson(model.IdPerson);
            return result;
        }

        public async Task<WSEditReturn> UpdateFolder(UpdatedDocumentTreeViewModel model)
        {
            DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
            data.IdLogin = model.IdLogin != null ? model.IdLogin : this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;

            string treePath = "";
            if (model.IdDocumentType == 5)
            {
                List<DocumentTreeInfo> trees = await GetDocumentTreesDetails(model.IdDocument + "", data.IdLogin, data.IdApplicationOwner);
                treePath = trees.FirstOrDefault() != null ? trees.FirstOrDefault().DocPath : "";
                treePath = treePath.Replace("\\", "/").Replace("Indexing//", "").Replace("//", "/").Replace("Indexing", "");
            }
            else if (model.IdDocumentType == 6)
            {
                List<DocumentTreeInfo> trees = await GetDocumentTreesDetails(model.IdDocument + "", data.IdLogin, data.IdApplicationOwner);
                treePath = trees.FirstOrDefault() != null ? trees.FirstOrDefault().DocPath : "";
                treePath = treePath.Replace("\\", "/").Replace("Mail//", "").Replace("//", "/").Replace("Mail", "");
            }

            var result = await _documentService.UpdateFolder(data, model);
            if (result.IsSuccess && result.ReturnID != "-1")
            {
                if (model.OldFolderName != model.Name)
                {
                    await RenameFolder(model);
                }
            }
            if (model.IdDocumentType == 5)
            {
               await _documentIndexingBusiness.UpdateFolderIndexing(treePath, model.Name, data.IdLogin, true);
            }
            else if (model.IdDocumentType == 6)
            {
                await _documentEmailBusiness.UpdateFolderEmail(treePath, model.Name, data.IdLogin, true);
            }
            return result;
        }

        public async Task<WSEditReturn> DeleteFolder(DocumentTreeViewModel model)
        {
            DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
            data.IdLogin = model.IdLogin != null ? model.IdLogin : this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;

            string treePath = "";
            if (model.IdDocumentType == 5)
            {
                List<DocumentTreeInfo> trees = await GetDocumentTreesDetails(model.IdDocument + "", data.IdLogin, data.IdApplicationOwner);
                treePath = trees.FirstOrDefault() != null ? (string.IsNullOrEmpty(trees.FirstOrDefault().DocPath) ? "" : trees.FirstOrDefault().DocPath) : "";
                treePath = treePath.Replace("\\", "/").Replace("Indexing//", "").Replace("//", "/").Replace("Indexing", "");
            }
            else if (model.IdDocumentType == 6)
            {
                List<DocumentTreeInfo> trees = await GetDocumentTreesDetails(model.IdDocument + "", data.IdLogin, data.IdApplicationOwner);
                treePath = trees.FirstOrDefault() != null ? (string.IsNullOrEmpty(trees.FirstOrDefault().DocPath) ? "" : trees.FirstOrDefault().DocPath) : "";
                treePath = treePath.Replace("\\", "/").Replace("Mail//", "").Replace("//", "/").Replace("Mail", "");
            }

            var result = await _documentService.DeleteFolder(data, model);
            _logger.Debug("DeleteFolder result:" + JsonConvert.SerializeObject(result));
            if (!string.IsNullOrWhiteSpace(result.JsonReturnIds))
            {
                var idMainDocumentResultList = JsonConvert.DeserializeObject<DeleteDocumentResultModel>(result.JsonReturnIds);
                SyncToDeleteOnElasticSearch(model.IdDocumentType, idMainDocumentResultList);

                //await _cloudBusiness.ChangePath(new CloudChangePathModel
                //{
                //    SourcePath = $"{model.OldPath}/{model.OldName}",
                //    DesinationPath = "",
                //    NewName = "",
                //    ActionType = CloudDocChangeAction.Delete,
                //    IdDocumentTree = model.IdDocument.ToString()
                //});
            }
            if (result != null && !string.IsNullOrEmpty(result.ReturnID) && result.ReturnID != "-1")
            {
                if (model.IdDocumentType == 5)
                {
                    //await _documentIndexingBusiness.RenameFolderDeletedIndexingOnPublicFile(treePath, data.IdLogin);
                    await _documentIndexingBusiness.DeleteFolderIndexing(treePath, data.IdLogin, true);
                }
                else if (model.IdDocumentType == 6)
                {
                    //await _documentEmailBusiness.RenameFolderDeletedEmailOnPublicFile(treePath, data.IdLogin);
                    await _documentEmailBusiness.DeleteFolderEmail(treePath, data.IdLogin, true);
                }
            }
            return result;
        }

        public async Task<IEnumerable<object>> GetAttachmentListByContact(AttachmentViewModel model)
        {
            AttachmentData data = ServiceDataRequest.ConvertToRelatedType(typeof(AttachmentData)) as AttachmentData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.IdPerson = model.IdPerson;

            var responseData = await _documentService.GetAttachmentListByContact(data);
            var result = _mapper.Map<IEnumerable<AttachmentViewModel>>(responseData);

            return result;
        }

        public async Task<DataCommonDocumentBeforeSave> HandleCommonDocumentBeforeSave(CapturedBaseDocumentModel model, string sharingContactPersonNr)
        {
            Task<IEnumerable<SharingContactInformationViewModel>> sharingContactInfoListTask = null;
            if (!string.IsNullOrWhiteSpace(sharingContactPersonNr))
            {
                sharingContactInfoListTask = _contactBusiness.CheckAndGetCompanyList(null, sharingContactPersonNr, model.IdLogin, model.IdApplicationOwner);
            }

            var data = new DataCommonDocumentBeforeSave();
            if (_appSettings.EnableCloud)
            {
                if (!string.IsNullOrEmpty(model.IdLogin) && !string.IsNullOrEmpty(model.IdApplicationOwner))
                {
                    data.IdCloudConnection = await _cloudBusiness.GetActiveIdCloudConnectionOfSpecificUser(model.IdLogin, model.IdApplicationOwner);
                }
                else
                {
                    data.IdCloudConnection = await _cloudBusiness.GetActiveIdCloudConnectionOfCurrentUser();
                }
            }

            // in case of move document to another folder (change folder) => model.ChangeDocumentIdentity will be not null
            // and model.MainDocument (exists underlying database) but why it's IdMainDocument is null
            // because we set it is null for avoid misunderstanding that this case is update document on UI
            // so now we need to set value again for business underlying stored procedure
            if (model.ChangeDocumentIdentity != null && model.ChangeDocumentIdentity.IdMainDocument != null && model.ChangeDocumentIdentity.IdMainDocument != null)
            {
                model.MainDocument.IdMainDocument = model.ChangeDocumentIdentity.IdMainDocument;
            }

            if (sharingContactInfoListTask != null)
            {
                data.SharingContact = new PersonContactModel();
                MapPersonContactModel(data.SharingContact, await sharingContactInfoListTask);
            }

            return data;
        }

        public async Task HandleCommonDocumentAfterSave(SaveDocumentResultModel saveResult, CapturedBaseDocumentModel document)
        {
            //_logger.Error("HandleCommonDocumentAfterSave saveResult : " + JsonConvert.SerializeObject(saveResult));
            // _logger.Error("HandleCommonDocumentAfterSave document   : " + JsonConvert.SerializeObject(document));
            // Loop to sync data IdMainDocument for model.ElasticSearchIndexName to Elastic Search
            if (!saveResult.IdMainDocuments.Any())
            {
                return;
            }


            var idMainDocumentResult = saveResult.IdMainDocuments.FirstOrDefault();
            if (idMainDocumentResult == null)
            {
                return;
            }

            // is new document (isUpdate = false)            
            if (_appSettings.EnableCloud && saveResult.IsUpdate == false && document.ChangeDocumentIdentity == null)
            {
                //execute when create DOC fist time
                await _cloudBusiness.SyncDocsToCloud(new CloudSyncModel
                {
                    IndexName = saveResult.ElasticSearchIndexName,
                    idMainDocuments = new List<string> { idMainDocumentResult.IdMainDocument }
                });
            }
            // update on existed document
            else if (document.ChangeDocumentIdentity != null)
            {
                //execute when change DOC to another Folder
                if (document.MainDocument.MainDocumentTree.OldFolder == null || document.MainDocument.MainDocumentTree.NewFolder == null ||
                    document.MainDocument.MainDocumentTree.OldFolder.Path == document.MainDocument.MainDocumentTree.NewFolder.Path ||
                    document.MainDocument.MainDocumentTree.OldFolder.IdDocument == document.MainDocument.MainDocumentTree.NewFolder.IdDocument)
                {
                    return;
                }
                var mainDocumentTree = document.MainDocument.MainDocumentTree;

                DeleteOldDataOnElasticSearch(saveResult, document);
                if (_appSettings.EnableCloud)
                {
                    await _cloudBusiness.ChangeDoc(new CloudChangeDocModel
                    {
                        SourcePath = $"{mainDocumentTree.OldFolder.Path}/{document.DocumentTreeMedia.MediaName}",
                        DesinationPath = mainDocumentTree.NewFolder.Path,
                        ActionType = CloudDocChangeAction.Move,
                        IdMainDocument = idMainDocumentResult.IdMainDocument,
                        IndexName = saveResult.ElasticSearchIndexName,
                    });
                }

            }

            await _contactBusiness.SyncDocumentContactByIdPersons(saveResult.IdPersons);
            await SyncAttachmentToES(idMainDocumentResult.IdMainDocument, saveResult.IdPersons);
            await _elasticSearchSync.SyncESAfterSaveDocument(new ElasticSyncSaveDocument
            {
                IndexName = saveResult.ElasticSearchIndexName,
                IdMainDocument = idMainDocumentResult.IdMainDocument,
                IdDocumentContainerScans = saveResult.IdDocumentContainerScans
            });

            /// has input toDo => isToDo = 1
            if (!string.IsNullOrWhiteSpace(document.MainDocument.IsToDo) && document.MainDocument.IsToDo == "1")
            {
                await _elasticSearchSync.SyncESAfterSaveDocument(new ElasticSyncSaveDocument
                {
                    IndexName = ElasticSearchIndexName.TodoDocument,
                    IdMainDocument = idMainDocumentResult.IdMainDocument,
                });
            }
            else
            {
                _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { idMainDocumentResult.IdMainDocument }), ElasticSearchIndexName.TodoDocument);
                _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { idMainDocumentResult.IdMainDocument }), ElasticSearchIndexName.MainDocument);
                await _elasticSearchSync.SyncESAfterSaveDocument(new ElasticSyncSaveDocument
                {
                    IndexName = ElasticSearchIndexName.MainDocument,
                    IdMainDocument = idMainDocumentResult.IdMainDocument,
                });
            }

            // BackgroundJob.Enqueue<ICloudBusiness>(x => x.SyncDocuments(baseData.LoginName, baseData.IdLogin, baseData.IdApplicationOwner, baseData.LoginLanguage));
        }
        public async Task HandleAfterUpdateImage(List<string> idMainDocuments, string esIndex, Data data)
        {
            if (_appSettings.EnableCloud && idMainDocuments != null && idMainDocuments.Count > 0)
            {
                await _cloudBusiness.SyncDocsToCloud(new CloudSyncModel
                {
                    IndexName = esIndex,
                    idMainDocuments = idMainDocuments
                }, data);
            }
        }
        private void SyncToDeleteOnElasticSearch(int idDocumentType, DeleteDocumentResultModel deleteDocumentResults)
        {

            var idMainDocumentList = deleteDocumentResults.MainDocument.Select(item => item.IdMainDocument).ToList();
            if (deleteDocumentResults.MainDocumentPerson != null)
            {
                var idMainDocumentPersonList = deleteDocumentResults.MainDocumentPerson
                                                                    .Where(item => item != null)
                                                                    .Select(item => item.IdMainDocumentPerson).ToList();
                _elasticSearchSync.DeleteFromElasticSearch(idMainDocumentPersonList, ElasticSearchIndexName.Contact);
            }

            _elasticSearchSync.DeleteFromElasticSearch(idMainDocumentList, ElasticSearchIndexName.MainDocument);


            switch (idDocumentType)
            {
                case (int)Constants.IdRepDocumentGuiTypeEnum.Invoice:
                    _elasticSearchSync.DeleteFromElasticSearch(idMainDocumentList, ElasticSearchIndexName.InvoicePdm);
                    break;

                case (int)Constants.IdRepDocumentGuiTypeEnum.Contract:
                    _elasticSearchSync.DeleteFromElasticSearch(idMainDocumentList, ElasticSearchIndexName.Contract);
                    break;

                case (int)Constants.IdRepDocumentGuiTypeEnum.OtherDocuments:
                    _elasticSearchSync.DeleteFromElasticSearch(idMainDocumentList, ElasticSearchIndexName.OtherDocuments);
                    break;

                default:
                    throw new NotSupportedException($"SyncToDeleteOnElasticSearch not supported this document type equal to ${idDocumentType}");
            }
        }

        private async Task RenameFolder(UpdatedDocumentTreeViewModel model)
        {
            if (!_appSettings.EnableCloud) return;
            await _cloudBusiness.ChangePath(new CloudChangePathModel
            {
                SourcePath = model.FilePath,
                DesinationPath = "",
                NewName = model.Name,
                ActionType = CloudDocChangeAction.Rename,
                IdDocumentTree = model.IdDocument.ToString()
            });
        }

        private void DeleteOldDataOnElasticSearch(SaveDocumentResultModel result, CapturedBaseDocumentModel document)
        {
            SyncToDeleteOnElasticSearch(
                document.MainDocument.MainDocumentTree.OldFolder.IdDocumentType,
                new DeleteDocumentResultModel
                {
                    MainDocument = result.IdMainDocuments,
                    MainDocumentPerson = result.IdPersonsFormat,
                }
            );
        }
        private async Task SyncAttachmentToES(string idMainDocument, IEnumerable<IdPersonResult> idPersonResults)
        {

            if (!idPersonResults.Any()) return;

            var idPersonsList = idPersonResults.Where(idPerson => idPerson.IdPerson != null)
                                               .Select(idPerson => idPerson.IdPerson.Value.ToString());
            foreach (var idPerson in idPersonsList)
            {
                await _elasticSearchSync.SyncAttachmentsToElasticSearch(idPerson, idMainDocument);
            }
        }

        private void MapPersonContactModel(PersonContactModel personContact, IEnumerable<SharingContactInformationViewModel> sharingContactLists)
        {
            if (!sharingContactLists.Any())
            {
                return;
            }
            var sharingContact = sharingContactLists.FirstOrDefault();

            personContact.IdPerson = sharingContact.IdPerson;
            personContact.B00PersonTypeGw_IdPersonTypeGw = sharingContact.IdPersonTypeGw;
            personContact.B00SharingName_IdSharingName = sharingContact.IdSharingName;
            personContact.B00SharingAddress_IdSharingAddress = sharingContact.IdSharingAddress;
            personContact.B00SharingCompany_IdSharingCompany = sharingContact.IdSharingCompany;
            personContact.B00PersonInterface_IdPersonInterface = sharingContact.IdPersonInterface;
            personContact.B00PersonMasterData_IdPersonMasterData = sharingContact.IdPersonMasterData;
            personContact.B00SharingCommunication_TelOfficeIdSharingCommunication = sharingContact.TelOffice_IdSharingCommunication;
            personContact.PersonNr = sharingContact.PersonNr;
        }
        #endregion

        public async Task<DocumentTreePathModel> GetPathTreeDocument(int? IdDocumentContainerScans, int? IdMainDocument)
        {
            PathTreeGetData @params = ServiceDataRequest.ConvertToRelatedType(typeof(PathTreeGetData)) as PathTreeGetData;
            @params.IdLogin = this.UserFromService.IdLogin;
            @params.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            @params.LoginLanguage = this.UserFromService.IdRepLanguage;
            @params.IdDocumentContainerScans = IdDocumentContainerScans;
            @params.IdMainDocument = IdMainDocument;

            var data = await _documentService.GetTreePathOfDocument(@params);
            return data;
        }

        public async Task SendMailDocument(DocumentSendMailModel model)
        {
            IXenaEmailService emailService = new XenaEmailService
            {
                SmtpMailSettings = new SmtpMailSettings()
                {
                    From = _appSettings.EmailSending.Email,
                    Host = _appSettings.EmailSending.Domain,
                    Port = _appSettings.EmailSending.Port,
                    UserName = _appSettings.EmailSending.Email,
                    Password = _appSettings.EmailSending.Password,
                }
            };

            var emailModel = new XenaEmailModel
            {
                ToEmail = model.ToEmail,
                Subject = model.Subject,
                Body = model.Body,
                Attachments = new List<EmailAttachmentFile>()
            };

            if (model.Attachments != null && model.Attachments.Count > 0)
            {
                foreach (var fullFileName in model.Attachments)
                {
                    emailModel.Attachments.Add(new EmailAttachmentFile
                    {
                        FullName = fullFileName,
                        DisplayName = Path.GetFileName(fullFileName)
                    });
                }//for
            }

            await emailService.SendEmail(emailModel);
        }

        public async Task<FormGroupDefinitionViewModel> GetFormColumnSettings(GetFormColumnSettingsQuery model)
        {
            GetFormColumnSettingsData @params = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetFormColumnSettingsData)) as GetFormColumnSettingsData;
            @params.IdMainDocument = model.IdMainDocument;
            @params.IdBranches = model.IdBranch;

            var formGroup = await _documentService.GetFormColumnSettings(@params);

            var formGroupViewModel = new FormGroupDefinitionViewModel();
            formGroupViewModel.MethodName = formGroup.MethodName;
            formGroupViewModel.FormDefinitions = formGroup.FormDefinitions.Select(form => new FormDefinitionViewModel
            {
                Title = form.Title,
                CustomStyle = form.CustomStyle,
                CustomClass = form.CustomClass,
                ColumnDefinitions = form.ColumnDefinitions.Select(column =>
                {
                    var colDefView = new ColumnFieldDefinitionViewModel
                    {
                        ColumnName = column.ColumnName,
                        OriginalColumnName = column.OriginalColumnName,
                        DataType = column.DataType,
                        DataLength = column.DataLength.HasValue ? column.DataLength.Value : 0,
                        Value = column.Value,
                    };
                    var setting = column.Setting?.FirstOrDefault();
                    if (setting == null)
                    {
                        return colDefView;
                    }

                    colDefView.Setting = new ColumnDefinitionSetting
                    {
                        DisplayField = setting.DisplayField?.DisplayField,
                        ControlType = setting.ControlType?.ControlType,
                        CustomStyle = setting.CustomStyle,
                        CustomClass = setting.CustomClass,
                        Validators = setting.Validators?.Validators,
                        CallConfigs = setting.CallConfig?.CallConfig,
                    };

                    return colDefView;
                })
            });

            return formGroupViewModel;
        }

        public async Task<FormGroupDefinitionV2ViewModel> GetFormGroupSettings(GetFormGroupSettingsQuery query)
        {
            GetFormGroupSettingsData @params = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetFormGroupSettingsData)) as GetFormGroupSettingsData;
            @params.IdRepDocumentGuiType = query.IdRepDocumentGuiType;
            @params.IdMainDocument = query.IdMainDocument;
            @params.IdDocumentContainerScans = query.IdDocumentContainerScans;
            @params.IdBranches = query.IdBranch;
            @params.MethodName = query.MethodName;
            @params.Object = query.Object;
            @params.Mode = query.Mode;
            @params.IdPerson = query.IdPerson;

            var formGroup = await _documentService.GetFormGroupSettings(@params);

            var formGroupViewModel = new FormGroupDefinitionV2ViewModel();
            formGroupViewModel.MethodName = formGroup.MethodName;
            formGroupViewModel.Object = formGroup.Object;
            //formGroupViewModel.FormDefinitions = formGroup.FormDefinitions.Select(form => form.ParseViewModel());

            var groupOfForm = formGroup.FormDefinitions
                                       .Select(form => form.ParseViewModel())
                                       .GroupBy(form => form.GroupSetting?.GroupId)
                                       .Select(g => new GroupOfFormModel
                                       {
                                           GroupId = g.Key,
                                           Forms = g.ToList()
                                       });

            var formDefinitions = new List<AbstractGroupControlDefinitionViewModel>();

            foreach (var group in groupOfForm)
            {
                if (group.GroupId == null)
                {
                    formDefinitions.AddRange(group.Forms);
                    continue;
                }

                formDefinitions.Add(new GroupFormDefinitionViewModel(group.Forms));
            }
            formGroupViewModel.FormDefinitions = formDefinitions;
            return formGroupViewModel;
        }

        public async Task<WSEditReturn> SaveFormColumnSettings(SaveFormColumnSettings model)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            SaveFormColumnSettingsData @params = new SaveFormColumnSettingsData
            {
                BaseData = baseData,
                IgnoredKeys = new List<string>() { "CrudType" },
            };

            @params.BaseData.MethodName = model.FormGroupDefinition.MethodName;
            @params.BaseData.Object = "Contact";
            @params.Data = Common.ToDictionary(@params.BaseData);
            this._BuildJsonData(@params.Data, model.FormGroupDefinition);

            var result = await _documentService.SaveFormColumnSettings(@params);
            return result;
        }

        private void _BuildJsonData(IDictionary<string, object> @params, FormGroupDefinitionViewModel model)
        {
            var jsonData = new Dictionary<string, JToken>();

            foreach (var formDef in model.FormDefinitions)
            {
                foreach (var colDef in formDef.ColumnDefinitions)
                {
                    SetValue(jsonData, colDef);
                }
            }

            foreach (var keyValue in jsonData)
            {
                @params.Add(keyValue.Key, keyValue.Value.ToString());
            }
        }

        private void SetValue(Dictionary<string, JToken> jsonData, ColumnFieldDefinitionViewModel colDef)
        {
            // this column field definition don't have CallConfigSettings
            if (colDef.Setting == null || colDef.Setting.CallConfigs == null || !colDef.Setting.CallConfigs.Any())
            {
                return;
            }

            foreach (var callConfig in colDef.Setting.CallConfigs)
            {
                if (callConfig.JsonText == null) continue;

                this._SetJsonValue(jsonData, callConfig);
            }
        }

        private void _SetJsonValue(IDictionary<string, JToken> jsonData, CallConfigSetting callConfig)
        {
            if (jsonData.TryGetValue(callConfig.JsonText.Name, out JToken jParamObject) == false)
            {
                _InsertValueIntoJsonArray(jsonData, callConfig);
            }
            else
            {
                _AppendValueIntoJsonArray(jParamObject as JObject, callConfig);
            }

            _AppendValueIntoJsonObject(jsonData, callConfig);
        }

        private void _AppendValueIntoJsonObject(IDictionary<string, JToken> jsonData, CallConfigSetting callConfig)
        {
            if (callConfig.IsExtParam == false)
            {
                return;
            }

            if (jsonData.TryGetValue(callConfig.Alias, out JToken jExtParamObject) == false)
            {
                jsonData.Add(callConfig.Alias, callConfig.Value);
            }
            else
            {
                jExtParamObject[callConfig.Alias].Value<object>(callConfig.Value);
            }
        }

        private void _InsertValueIntoJsonArray(IDictionary<string, JToken> jsonData, CallConfigSetting callConfig)
        {
            if (jsonData == null) return;
            if (callConfig.IsExtParam == true) return;

            var firstParam = new JObject();
            firstParam.Add(callConfig.Alias, new JValue(callConfig.Value));

            var jArrayParams = new JArray();
            jArrayParams.Add(firstParam);

            var jsonObject = new JObject();
            jsonObject.Add(callConfig.JsonText.Path, jArrayParams);

            jsonData.Add(callConfig.JsonText.Name, jsonObject);
        }

        private void _AppendValueIntoJsonArray(JObject jParamObject, CallConfigSetting callConfig)
        {
            if (callConfig.IsExtParam == true) return;

            var jParam = new JProperty(callConfig.Alias, new JValue(callConfig.Value));

            if (jParamObject.TryGetValue(callConfig.JsonText.Path, out JToken jArrayParams) == false)
            {
                jParamObject.Add(jParam);
                return;
            }

            var jsonTextPathObject = (jArrayParams as JArray).First() as JObject;

            // if this property has not existed in jsonTextPath object
            if (jsonTextPathObject.TryGetValue(callConfig.Alias, out JToken existedProperty) == false)
            {
                jsonTextPathObject.Add(jParam);
            }
            else // has existed then update new value
            {
                (existedProperty as JValue).Value = callConfig.Value;
            }
        }

        /// <summary>
        /// GetReportNotes
        /// </summary>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        public async Task<object> GetReportNotes(int idMainDocument)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            return await _documentService.GetReportNotes(data, idMainDocument);
        }

        /// <summary>
        /// GetReportNotes
        /// </summary>
        /// <param name="idMainDocument"></param>
        /// <returns></returns>
        public async Task<JArray> GetReportNotesForOuput(int idMainDocument)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            return await _documentService.GetReportNotesForOuput(data, idMainDocument);
        }

        /// <summary>
        /// SaveProcessingForm
        /// </summary>
        /// <param name="data"></param>
        /// <param name="userFromService"></param>
        /// <returns></returns>
        public async Task<object> SaveProcessingForm(Dictionary<string, object> data, UserFromService userFromService = null)
        {
            var spObject = data.GetStringValue("SpObject");
            if (string.IsNullOrEmpty(spObject))
            {
                spObject = "ReportFormContact";
            }
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                IgnoredKeys = new List<string>() { "SpObject" },
                SpMethodName = "SpCallReportForms",
                SpObject = spObject
            };

            //Used for the 'Hangefire Job' case 
            if (userFromService != null)
            {
                baseData.IdLogin = userFromService.IdLogin;
                baseData.IdApplicationOwner = userFromService.IdApplicationOwner;
            }

            MainDocumentSaving documentModel = new MainDocumentSaving();
            if (data.ContainsKey("MainDocument"))
            {
                IEnumerable v = ((IEnumerable)data.GetValue("MainDocument"));
                foreach (JToken element in v)
                {
                    var jMainDocumentObject = ((element as JProperty)?.FirstOrDefault() as JArray)?.FirstOrDefault();
                    if (jMainDocumentObject == null)
                    {
                        return new WSEditReturn
                        {
                            ReturnID = "-1",
                            EventType = null,
                        };
                    }

                    documentModel = jMainDocumentObject.ToObject<MainDocumentSaving>();
                    break;
                }
            }
            if (data.ContainsKey("DynamicReportFields"))
            {
                await this.SetParseDynamicReportFields(data, baseData, documentModel);
            }

            string idBranches = "";
            if (data.ContainsKey("ReportContact"))
            {
                try
                {
                    IEnumerable v = ((IEnumerable)data.GetValue("ReportContact"));
                    foreach (object element in v)
                    {
                        idBranches = ((JObject)((Newtonsoft.Json.Linq.JContainer)((Newtonsoft.Json.Linq.JContainer)element).First()).First()).GetValue("IdBranches").ToString();
                        break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.Error("(SavingDocument)Error detect IdBranches \n " + JsonConvert.SerializeObject(data), ex);
                }

            }

            List<string> ignoredKeys = data.GetValue("IgnoredKeys") as List<string>;
            if (ignoredKeys != null && ignoredKeys.Count > 0)
            {
                saveData.IgnoredKeys.AddRange(ignoredKeys);
            }

            saveData.IgnoredKeys = saveData.IgnoredKeys.Distinct().ToList();

            var result = await _documentService.SaveProcessingForm(saveData);

            _logger.Debug("Result save SaveDynamicData: " + JsonConvert.SerializeObject(result));
            if (result == null || string.IsNullOrWhiteSpace(result.JsonReturnIds) || result.EventType == null || !"Successfully".Contains(result.EventType))
            {
                return new WSEditReturn
                {
                    ReturnID = "-1",
                    EventType = null,
                };
            }

            var jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(result.JsonReturnIds);


            string IdMainDocument = jsonResult.IdMainDocuments.FirstOrDefault().IdMainDocument;

            ElasticSyncSaveDocument ss = new ElasticSyncSaveDocument
            {
                IndexName = ElasticSearchIndexName.MainDocument,
                IdMainDocument = IdMainDocument,
                IdDocumentContainerScans = documentModel.IdDocumentContainerScans
            };
            await _elasticSearchSync.SyncESAfterSaveDocument(ss);
            _logger.Debug("Sync ElasticSyncSaveDocument: " + JsonConvert.SerializeObject(ss));

            //if (!string.IsNullOrEmpty(idBranches))
            //{
            //    await _elasticSearchSync.SyncToElasticSearch(ElasticSearchIndexName.History, ElasticSearchSQLObject.History, idBranches);
            //    _logger.Debug("Sync IdBranches to Index History " + idBranches);
            //    await _elasticSearchSync.SyncToElasticSearch(ElasticSearchIndexName.HistoryDetail, ElasticSearchSQLObject.HistoryDetail, idBranches);
            //    _logger.Debug("Sync IdBranches to Index HistoryDetails " + idBranches);
            //}
            //else
            //{
            //    _logger.Debug("No Sync IdBranches to Index History ");
            //}

            return result;
        }

        /// <summary>
        /// SaveSupportNotes
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task<object> SaveSupportNotes(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCall07SupportNotes",
                SpObject = "SaveSupportNotes"
            };

            return await _documentService.SaveFormDynamicData(saveData);
        }

        private void SaveImageFromBase64(string base64_string, string fullFileName)
        {
            MemoryStream memoryStream = ImageUtil.ConvertBase64ToStream(base64_string.Replace("data:image/jpeg;base64,", ""));
            Image image = Image.FromStream(memoryStream);
            image.Save(fullFileName);
        }

        private async Task SetParseDynamicReportFields(Dictionary<string, object> data, Data baseData, MainDocumentSaving documentModel)
        {
            List<DynamicReportFields> fields = new List<DynamicReportFields>();
            JObject dynamicReportFieldsObj = data.GetValue("DynamicReportFields") as JObject;

            if (dynamicReportFieldsObj == null)
            {
                return;
            }

            JArray dynamicReportFields = dynamicReportFieldsObj.SelectToken("DynamicReportFields") as JArray;
            if (dynamicReportFields == null)
            {
                return;
            }

            foreach (JObject dynamicField in dynamicReportFields)
            {
                var fieldValueToken = dynamicField.SelectToken("FieldValue");
                string value = null;

                if (fieldValueToken == null) continue;

                value = fieldValueToken.Value<string>();
                if (string.IsNullOrEmpty(value)) continue;

                if (value.StartsWith("data:image/jpeg;base64"))
                {
                    value = fieldValueToken.Value<string>();
                    var s = await _documentService.GetScannedPathOfDocument(baseData, documentModel.IdDocumentContainerScans);
                    ScannedPathModel pathScanned = (JsonConvert.DeserializeObject<List<ScannedPathModel>>(s.ToString())).FirstOrDefault();
                    string pathSaveImage = Path.Combine(pathScanned.ScannedPath, "Signatures");
                    if (!Directory.Exists(pathSaveImage))
                    {
                        Directory.CreateDirectory(pathSaveImage);
                    }

                    string pathSigImage = Path.Combine(pathScanned.ScannedPath, documentModel.IdDocumentContainerScans + DateTime.UtcNow.Millisecond.ToString() + "_signature" + ".jpg");
                    SaveImageFromBase64(value, pathSigImage);
                    dynamicField["FieldValue"] = pathSigImage;
                }
            }
        }

        public async Task<WSEditReturn> ChangeDocumentToOtherTree(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpB06CallDocumentContainer",
                SpObject = "ChangeDocumentTree"
            };

            WSEditReturn rs = await _documentService.SaveFormDynamicData(saveData);

            if (rs == null || string.IsNullOrWhiteSpace(rs.ReturnID) || rs.EventType == null || !"Successfully".Contains(rs.EventType))
            {
                return new WSEditReturn
                {
                    ReturnID = "-1",
                    EventType = null,
                };
            }
            if (data.ContainsKey("IdRepDocumentGuiType") && data.GetValue("IdRepDocumentGuiType").ToString() == "4")
            {
                _elasticSearchSync.DeleteFromElasticSearch(new List<string>(new string[] { data.GetValue("IdDocumentContainerScan").ToString() }), ElasticSearchIndexName.InvoiceApprovalProcessing);

                await _elasticSearchSync.SyncToElasticSearch(new ElasticSyncModel
                {
                    SearchIndexKey = ElasticSearchIndexName.InvoiceApprovalProcessing,
                    KeyId = data.GetValue("IdDocumentContainerScan").ToString()
                });
            }
            return rs;
        }

        public async Task<object> GetDetailTreeNode(string nodeName)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = this.UserFromService.IdLogin;

            return await _documentService.GetDetailTreeNode(baseData, nodeName);
        }

        public async Task<object> CRUDNotes(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpCallB07MainDocumentNotes",
                SpObject = "SaveMainDocumentNotes"
            };

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<object> GetNotes(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg001Invoice";
            values["Object"] = "MainDocumentNotes";

            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }
            

        public async Task<List<DocumentTreeInfo>> GetDocumentTreesDetails(string idDocumentTree, string userId, string idApplicationOwner)
        {
            if (string.IsNullOrEmpty(idApplicationOwner) && !string.IsNullOrEmpty(userId))
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(userId, "");
                if (us == null)
                {
                    _logger.Error($"GetDocumentTreesDetails user not found {userId}");
                    return null;
                }
                idApplicationOwner = us.IdApplicationOwner;
            }
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = idApplicationOwner;

            return await _documentService.GetDocumentTreesDetails(baseData, idDocumentTree);
        }

        #region build tree for ag-grid
        public async Task<object> GetPermissionUserTree(Dictionary<string, object> values)
        {
            //if (!values.ContainsKey("PermissionType"))
            //{
            //    values["PermissionType"] = "Indexing";
            //}
            //var param = await _documentCommonlBusiness.TransformRequestToDocTreePermissionGetData(options);
            //var dataTree = await _documentService.GetDocumentTreePermissionIndexing(param);
            //return dataTree;
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetPermissionTreeByIdLogin";
            
            saveData.AddParams(values);
            return await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
        }
        #endregion

        public async Task<object> ChangeDocumentTreeOfDocuments(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpB06CallDocumentContainer",
                SpObject = "ChangeDocumentTreeOfDocuments"
            };

            string ss = data.GetStringValue("JSONDocumentTree");
            if (!string.IsNullOrEmpty(ss))
            {
                JSONDocumentTreeMailMove d = JsonConvert.DeserializeObject<JSONDocumentTreeMailMove>(data.GetStringValue("JSONDocumentTree"));
                if (d != null && d.DocumentTree.Count > 0)
                {
                    foreach (DocumentTreeMailMove item in d.DocumentTree)
                    {
                        if (item.IdRepDocumentGuiType == "6")
                        {
                            await _documentEmailBusiness.DetectDocumentMoved(item);
                        }                        
                    }
                }
            }

            return await _dynamicDataService.SaveFormData(saveData);
        }

        public async Task<WSEditReturn> DeleteDocuments(Dictionary<string, object> data)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            SaveDynamicData saveData = new SaveDynamicData
            {
                BaseData = baseData,
                Data = data,
                SpMethodName = "SpB06CallDocumentContainer",
                SpObject = "DocumentContainerScans"
            };
            string ss = data.GetStringValue("JSONDocumentContainerScans");
            if (!string.IsNullOrEmpty(ss))
            {
                JSONDocumentTreeMove d = JsonConvert.DeserializeObject<JSONDocumentTreeMove>(data.GetStringValue("JSONDocumentContainerScans"));
                if (d != null && d.DocumentContainerScans.Count > 0)
                {
                    foreach (DocumentTreeMove item in d.DocumentContainerScans)
                    {
                        if (item.IdRepDocumentGuiType == "5")
                        {
                            await _documentIndexingBusiness.DeleteDocument(item);
                        }
                    }
                }
            }

            return await _dynamicDataService.SaveFormData(saveData);
        }

    }
}
