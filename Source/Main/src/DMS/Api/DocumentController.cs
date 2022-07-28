using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Models;
using DMS.Business;
using System.Reflection;
using System.Linq;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using static DMS.Models.OrderProcessingSaveDocumentsLinkModel;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using System.Collections.Generic;
using DMS.Utils;
using Newtonsoft.Json;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : BaseController
    {
        private readonly IDocumentBusiness _documentBusiness;
        private readonly IDocumentIndexingBusiness _documentIndexingBusiness;
        private readonly IDocumentEmailBusiness _documentEmailBusiness;
        private readonly IDocumentPermissionBusiness _documentPermissionBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        /// <summary>
        /// FileManagerController
        /// </summary>
        /// <param name="appSettings"></param>
        /// <param name="appServerSetting"></param>
        /// <param name="pathProvider"></param>
        public DocumentController(IDocumentBusiness documentBusiness, IDocumentPermissionBusiness documentPermissionBusiness
            , IDocumentIndexingBusiness documentIndexingBusiness , IDocumentEmailBusiness documentEmailBusiness)
        {
            _documentBusiness = documentBusiness;
            _documentPermissionBusiness = documentPermissionBusiness;
            _documentIndexingBusiness = documentIndexingBusiness;
            _documentEmailBusiness = documentEmailBusiness;
        }

        #region Scan
        // POST: api/Document/SaveScanningDocument
        //[HttpPost]
        //[Route("SaveScanningDocument")]
        //public async Task<object> SaveScanningDocument([FromBody]ScanningDocumentItemData model)
        //{
        //    var result = _documentBusiness.SaveScanningDocument(model);
        //    return await result;
        //}

        [HttpGet]
        [Route("GetDocumentContainerPathSetting")]
        public async Task<object> GetDocumentContainerPathSetting()
        {
            var result = await _documentBusiness.GetDocumentContainerPathSetting();
            return result;
        }

        [HttpGet]
        [Route("GetCustomerAssignmentsDetail")]
        public async Task<object> GetCustomerAssignmentsDetail(int idPerson, int idOrderProcessing)
        {
            var result = await _documentBusiness.GetCustomerAssignmentsDetail(idPerson, idOrderProcessing);
            return result;
        }
        #endregion

        [HttpPost]
        [Route("SaveOrderProcessing")]
        public async Task<object> SaveOrderProcessing([FromBody] OrderProcessingModel model)
        {
            return await _documentBusiness.SaveOrderProcessing(model);
        }

        [HttpPost]
        [Route("SaveOrderProcessingDocumentsLink")]
        public async Task<object> SaveOrderProcessingDocumentsLink([FromBody] OrderProcessingSaveDocumentsLinkModel model)
        {
            var result = await _documentBusiness.SaveOrderProcessingDocumentsLink(model);
            return result;
        }

        [HttpPost]
        [Route("SendMailOrderProcessing")]
        public async Task<object> SendMailOrderProcessing([FromBody] OrderProcessingSendMailModel model)
        {
            return await _documentBusiness.SendMailOrderProcessing(model);
        }

        [HttpGet]
        [Route("GetDataOrderProcessingById")]
        public async Task<object> GetDataOrderProcessingById(int idOrderProcessing)
        {
            var result = await _documentBusiness.GetDataOrderProcessingById(idOrderProcessing);
            return result;
        }

        [HttpGet]
        [Route("GetOrderProcessingDocuments")]
        public async Task<object> GetOrderProcessingDocuments(int idRepProcessingType, int idOrderProcessing)
        {
            var result = await _documentBusiness.GetOrderProcessingDocuments(idRepProcessingType, idOrderProcessing);
            return result;
        }

        [HttpGet]
        [Route("GetOrderProcessingEmail")]
        public async Task<object> GetOrderProcessingEmail(int idOrderProcessing, string perType)
        {
            var result = await _documentBusiness.GetOrderProcessingEmail(idOrderProcessing, perType);
            return result;
        }

        [HttpPost]
        [Route("DeleteCancelDocument")]
        public async Task<object> DeleteCancelDocument([FromBody] DeleteCancelDocumentModel model)
        {
            return await _documentBusiness.DeleteCancelDocument(model);
        }

        [HttpGet]
        [Route("DocumentSummary")]
        public async Task<object> GetDocumentSummary()
        {
            return await _documentBusiness.GetDocumentSummary();
        }

        [HttpGet]
        [Route("DocumentTreeByUser")]
        public async Task<object> GetDocumentTreeByUser(GetDocumentTreeOptions options)
        {
            return await _documentBusiness.GetDocumentTreeByUser(options);
        }

        [HttpGet]
        [Route("FavouriteFolderByUser")]
        public async Task<object> GetFavouriteFolderByUser()
        {
            return await _documentBusiness.GetFavouriteFolderByUser();
        }

        [HttpPost]
        [Route("newFolderFavourite")]
        public async Task<object> CreateFolderFavourite([FromBody] DocumentTreeViewModel model)
        {
            return await _documentBusiness.CreateFolderFavourite(model);
        }

        [HttpPost]
        [Route("AddContactToFavourite")]
        public async Task<object> AddContactToFavourite([FromBody] FavouriteContactModel model)
        {
            return await _documentBusiness.AddContactToFavourite(model);
        }

        [HttpGet]
        [Route("DocumentInvoiceDynamicCombobox")]
        public async Task<object> GetDocumentInvoiceDynamicCombobox(int idDocumentTree)
        {
            return await _documentBusiness.GetDocumentInvoiceDynamicCombobox(idDocumentTree);
        }

        [HttpGet]
        [Route("ExtractedDataFromOcr")]
        public async Task<object> GetExtractedDataFromOcr(int idRepDocumentType, int idDocumentContainerOcr, int idDocumentContainerScan, string module)
        {
            return await _documentBusiness.GetExtractedDataFromOcr(idRepDocumentType, idDocumentContainerOcr, idDocumentContainerScan, module);
        }

        [HttpPost]
        [Route("CreateFolder")]
        public async Task<object> CreateFolder([FromBody] DocumentTreeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                if (ModelState.Count() == 1 && ModelState.ContainsKey("Icon"))
                {
                    model.Icon = "user-man-add";
                }
                else
                {
                    return BadRequest(ModelState);
                }
            }

            var result = await _documentBusiness.CreateFolder(model);
            int.TryParse(result.ReturnID, out int id);
            return id;
        }

        [HttpPut]
        [Route("UpdateFolder")]
        public async Task<object> UpdateFolder([FromBody] UpdatedDocumentTreeViewModel model)
        {
            var result = await _documentBusiness.UpdateFolder(model);
            int.TryParse(result.ReturnID, out int id);
            return id;
        }

        [HttpPost]
        [Route("DeleteFolder")]
        public async Task<object> DeleteFolder([FromBody] DocumentTreeViewModel model)
        {
            var result = await _documentBusiness.DeleteFolder(model);
            return model.IdDocument;
        }

        // Use Elastic seach for get attachment list
        //[HttpGet]
        //[Route("AttachmentListByContact")]
        //public async Task<object> GetAttachmentListByContact(AttachmentViewModel model)
        //{
        //    return await _documentBusiness.GetAttachmentListByContact(model);
        //}

        [HttpGet]
        [Route("PathTreeDocument")]
        public async Task<object> GetPathTreeDocument(int? idDocumentContainerScans, int? idMainDocument)
        {
            return await _documentBusiness.GetPathTreeDocument(idDocumentContainerScans, idMainDocument);
        }

        [HttpPost]
        [Route("HandleAfterUpdateImage")]
        [AllowAnonymous]
        public async Task<object> HandleAfterUpdateImage([FromBody] DataCommonDocumentAfterUpdate model)
        {
            await _documentBusiness.HandleAfterUpdateImage(model.idMainDocuments, model.esIndex, model.data);
            return true;
        }

        [HttpPost]
        [Route("SendMailDocument")]
        public async Task<object> SendMailDocument([FromBody] DocumentSendMailModel model)
        {
            await _documentBusiness.SendMailDocument(model);
            return await Task.FromResult(true);
        }

        [HttpGet]
        [Route("FormColumnSettings")]
        public async Task<FormGroupDefinitionViewModel> GetFormColumnSettings([FromQuery] GetFormColumnSettingsQuery model)
        {
            if (!ModelState.IsValid)
            {
                return null;
            }

            var result = await _documentBusiness.GetFormColumnSettings(model);
            return result;
        }

        [HttpGet]
        [Route("FormGroupSettings")]
        public async Task<FormGroupDefinitionV2ViewModel> GetFormGroupSettings([FromQuery] GetFormGroupSettingsQuery query)
        {
            if (!ModelState.IsValid)
            {
                return null;
            }
            var result = await _documentBusiness.GetFormGroupSettings(query);
            return result;
        }

        [HttpPost]
        [Route("SaveFormColumnSettings")]
        public async Task<object> SaveFormColumnSettings([FromBody] SaveFormColumnSettings model)
        {
            if (!ModelState.IsValid)
            {
                return null;
            }

            var result = await _documentBusiness.SaveFormColumnSettings(model);
            return result;
        }

        [HttpPost]
        [Route("ChangeDocumentToOtherTree")]
        public async Task<object> ChangeDocumentToOtherTree([FromBody] Dictionary<string, object> data)
        {
            var result = await _documentBusiness.ChangeDocumentToOtherTree(data);
            return result;
        }

        [HttpPost("Notes")]
        public async Task<object> CRUDNotes([FromBody] Dictionary<string, object> data)
        {
            return await _documentBusiness.CRUDNotes(data);
        }

        [HttpGet("Notes")]
        public async Task<object> GetNotes()
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentBusiness.GetNotes(model);

        }

        #region Indexing Tree
        [HttpGet]
        [Route("DocumentTreeIndexing")]
        public async Task<object> GetDocumentTreeIndexing(GetDocumentTreeOptions options)
        {
            //var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentIndexingBusiness.GetDocumentTreeIndexingByUser(options);
        }

        [HttpPost]
        [Route("FolderTreeIndexing")]
        [AllowAnonymous]
        public async Task<object> CreateFolderIndexing([FromBody] DocumentTreeViewModel model)
        {
            _logger.Debug($"API FolderTreeIndexing submit body:  {JsonConvert.SerializeObject(model)} ");
            if (!string.IsNullOrEmpty(model.IsDeleted) && model.IsDeleted == "1")
            {
                var result = await _documentIndexingBusiness.DeleteFolderIndexingService(model, false);                
                if (result != null)
                {
                    _logger.Debug($"API FolderTreeIndexing result DELETE:  {JsonConvert.SerializeObject(result)}");
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }
            else
            {
                if (string.IsNullOrEmpty(model.oldFolderName) && string.IsNullOrEmpty(model.oldPath))
                {
                    var result = await _documentIndexingBusiness.CreateFolderIndexing(model.Name, model.IdLogin);
                    if (result != null)
                    {
                        _logger.Debug($"API FolderTreeIndexing result CREATE:  {JsonConvert.SerializeObject(result)}");
                        int.TryParse(result.ReturnID, out int id);
                        return id;
                    }
                }
                else
                {
                    var result = await _documentIndexingBusiness.UpdateFolderIndexing(model);
                    if (result != null)
                    {
                        _logger.Debug($"API FolderTreeIndexing result UPDATE:  {JsonConvert.SerializeObject(result)}");
                        int.TryParse(result.ReturnID, out int id);
                        return id;
                    }
                }
            }

            return -1;
        }

        [HttpPost]
        [Route("DocumentIndexing")]
        [AllowAnonymous]
        public async Task<object> DocumentIndexing([FromBody] DocumentModel model)
        {
            if (!string.IsNullOrEmpty(model.IsDeleted) && model.IsDeleted == "1")
            {
                var result = await _documentIndexingBusiness.DeleteDocumentIndexing(model);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }
            else if (!string.IsNullOrEmpty(model.IsRenamed) && model.IsRenamed == "1")
            {
                var result = await _documentIndexingBusiness.UpdateDocumentIndexing(model);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }

            return -1;
        }
        #endregion

        #region Permission
        [HttpGet]
        [Route("Indexing/Permission")]
        public async Task<object> DocumentIndexingPermision(Dictionary<string, object> data)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentPermissionBusiness.GetDocumentIndexingPermission(model);
        }

        [HttpPost]
        [Route("Indexing/Permission")]
        public async Task<object> CRUDDocumentIndexingPermision([FromBody] Dictionary<string, object> data)
        {
            return await _documentPermissionBusiness.CRUDDocumentIndexingPermission(data);
        }

        #endregion

        #region Email Tree
        [HttpPost]
        [Route("DetectFolderTreeEmail")]
        [AllowAnonymous]
        public async Task<object> CheckAndCreateFolderEmail([FromBody] Dictionary<string, object> values)
        {
            return await _documentEmailBusiness.CheckAndCreateFolderEmail(values);
        }        

        [HttpGet]
        [Route("DocumentTreeEmail")]
        public async Task<object> GetDocumentTreeEmail(GetDocumentTreeOptions options)
        {
            return await _documentEmailBusiness.GetDocumentTreeEmailByUser(options);
        }

        [HttpPost]
        [Route("FolderTreeEmail")]
        [AllowAnonymous]
        public async Task<object> CreateFolderEmail([FromBody] DocumentTreeViewModel model)
        {
            if (!string.IsNullOrEmpty(model.IsDeleted) && model.IsDeleted == "1")
            {
                var result = await _documentEmailBusiness.DeleteFolderEmailService(model, false);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }
            else
            {
                if (string.IsNullOrEmpty(model.oldFolderName) && string.IsNullOrEmpty(model.oldPath))
                {
                    var result = await _documentEmailBusiness.CreateFolderEmail(model.Name, model.IdLogin);
                    if (result != null)
                    {
                        int.TryParse(result.ReturnID, out int id);
                        return id;
                    }
                }
                else
                {
                    var result = await _documentEmailBusiness.UpdateFolderEmail(model);
                    if (result != null)
                    {
                        int.TryParse(result.ReturnID, out int id);
                        return id;
                    }
                }
            }

            return -1;
        }

        [HttpPost]
        [Route("DocumentEmail")]
        [AllowAnonymous]
        public async Task<object> DocumentEmail([FromBody] DocumentModel model)
        {
            if (!string.IsNullOrEmpty(model.IsDeleted) && model.IsDeleted == "1")
            {
                var result = await _documentEmailBusiness.DeleteDocumentEmail(model);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }
            else if (!string.IsNullOrEmpty(model.IsRenamed) && model.IsRenamed == "1")
            {
                var result = await _documentEmailBusiness.UpdateDocumentEmail(model);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }
            else if (!string.IsNullOrEmpty(model.IsMoveToOther) && model.IsMoveToOther == "1")
            {
                var result = await _documentEmailBusiness.UpdateDocumentEmail(model);
                if (result != null)
                {
                    int.TryParse(result.ReturnID, out int id);
                    return id;
                }
            }

            return -1;
        }

        [HttpGet]
        [Route("Mail/Permission")]
        public async Task<object> DocumentMailPermision(Dictionary<string, object> data)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentPermissionBusiness.GetDocumentMailPermission(model);
        }

        [HttpPost]
        [Route("Mail/Permission")]
        public async Task<object> CRUDDocumentMailPermision([FromBody] Dictionary<string, object> data)
        {
            return await _documentPermissionBusiness.CRUDDocumentMailPermission(data);
        }

        #endregion

        #region Try Parse Data of agridtable with tree
        [HttpGet("PermissionUserTree")]
        public async Task<object> GetPermissionUserTree(Dictionary<string, object> data)
        {
            var model = Common.ParseQueryStringToDictionary(Request.QueryString.Value);
            return await _documentBusiness.GetPermissionUserTree(model);
        }
        #endregion

        [HttpPost]
        [Route("TreeOfDocuments")]
        public async Task<object> ChangeDocumentTreeOfDocuments([FromBody] Dictionary<string, object> data)
        {
            return await _documentBusiness.ChangeDocumentTreeOfDocuments(data);
        }

        [HttpPost]
        [Route("Remove")]
        public async Task<object> DeleteDocuments([FromBody] Dictionary<string, object> data)
        {
            return await _documentBusiness.DeleteDocuments(data);
        }

    }
}
