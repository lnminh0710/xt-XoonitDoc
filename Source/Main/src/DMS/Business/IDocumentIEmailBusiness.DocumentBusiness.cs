using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using static DMS.Utils.BuildTreeHelper;

namespace DMS.Business
{
    public class DocumentEmailBusiness : BaseBusiness, IDocumentEmailBusiness
    {
        private readonly IPathProvider _pathProvider;
        private readonly IDocumentService _documentService;
        private readonly IUniqueService _uniqueService;
        private readonly ICommonBusiness _commonBusiness;
        private readonly IDocumentCommonBusiness _documentCommonBusiness;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        private const int _ID_ROOT_TREE = 2;
        private const int _ID_REP_DOCUMENT_GUITYPE = 6;
        private const string _PREFIX_NAME_FOLDER_EMAIL = "Mail";

        public DocumentEmailBusiness(IHttpContextAccessor context,
                              IDocumentService documentService,
                              IPathProvider pathProvider,
                              IUniqueService uniqueService,
                              ICommonBusiness commonBusiness,
                              IDocumentCommonBusiness documentCommonBusiness) : base(context)
        {
            _pathProvider = pathProvider;
            _documentService = documentService;
            _uniqueService = uniqueService;
            _commonBusiness = commonBusiness;
            _documentCommonBusiness = documentCommonBusiness;
        }       

        public async Task<IEnumerable<TreeNode<int, DocumentGroupingTreeModel>>> GetDocumentTreeEmailByUser(GetDocumentTreeOptions options)
        {
            try
            {
                var param = await _documentCommonBusiness.TransformRequestToDocTreeGetData(options);
                var data = await _documentService.GetDocumentTreeEmail(param);
                if (data.Count() != 2)
                {
                    throw new Exception($"Cannot get data from store");
                }
                var nodeData = JArray.FromObject(data.ToList()[1]).ToObject<IEnumerable<DocumentGroupingTreeModel>>();
                var tree = new List<TreeNode<int, DocumentGroupingTreeModel>>();

                
                Dictionary<string, object> values = new Dictionary<string, object>();
                values.Add("IdLogin", options.IdLogin);
                values.Add("PermissionType", _PREFIX_NAME_FOLDER_EMAIL);
                List<TreePermissionModel> treePermission = await _documentCommonBusiness.GetTreePermissionIdLogin(values);
                if (treePermission != null && treePermission.Count > 0)
                {
                    nodeData = _documentCommonBusiness.AddTreePermissionToStructureTreeIndexing(false, options.IdLogin, nodeData, treePermission,
                                    this.UserFromService.IsSuperAdmin.HasValue ? this.UserFromService.IsSuperAdmin.Value : false,
                                    this.UserFromService.IsAdmin.HasValue ? this.UserFromService.IsAdmin.Value : false);
                }
                else
                {
                    nodeData = _documentCommonBusiness.PreSettingDocumentTree(options.IdLogin, nodeData,
                                    this.UserFromService.IsSuperAdmin.HasValue ? this.UserFromService.IsSuperAdmin.Value : false,
                                    this.UserFromService.IsAdmin.HasValue ? this.UserFromService.IsAdmin.Value : false);
                }
                if (this.UserFromService.IsSuperAdmin.Value == true)
                {
                    var comps = BuildTreeEmailCompany(nodeData, _ID_ROOT_TREE);// 2 is id of Email
                    if (comps.Any()) tree.AddRange(comps);
                }
                else
                {
                    var users = BuildTreeEmailMoreUser(nodeData, _ID_ROOT_TREE);// 2 is id of Email
                    if (users.Any()) tree.AddRange(users);
                }

                return tree;
            }
            catch (Exception ex)
            {
                _logger.Error("GetDocumentTreeEmailByUser options:" + JsonConvert.SerializeObject(options), ex);
                throw;
            }
        }
        private List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeEmailCompany(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
        {
            var result = new List<TreeNode<int, DocumentGroupingTreeModel>>();
            var groupCompany = data.GroupBy(x => x.IdSharingCompany);
            if (groupCompany.Any())
            {
                foreach (var comItem in groupCompany)
                {
                    var firstComItem = comItem.FirstOrDefault();
                    var company = new TreeNode<int, DocumentGroupingTreeModel>
                    {
                        Data = new DocumentGroupingTreeModel
                        {
                            CompanyName = firstComItem.CompanyName,
                            DisplayName = firstComItem.CompanyName,
                            GroupName = firstComItem.CompanyName,
                            IdSharingCompany = firstComItem.IdSharingCompany,
                            IconName = "tree-company",
                            IsActive = true,
                            IsReadOnly = true,
                            IsNotModify = true,
                            IsIndexingTree = true,
                            IdDocumentTreeParent = idDocumentTreeParent,
                            IsCompany = true
                        },
                        Children = new List<TreeNode<int, DocumentGroupingTreeModel>>()
                    };
                    company.Children = BuildTreeEmailMoreUser(comItem, firstComItem.IdSharingCompany.Value);
                    result.Add(company);
                }
            }
            return result;
        }

        private List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeEmailMoreUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
        {
            var result = new List<TreeNode<int, DocumentGroupingTreeModel>>();
            var groupUser = data.GroupBy(x => x.IdLogin);
            if (groupUser.Any())
            {
                foreach (var userItem in groupUser)
                {
                    var hasSurfix = userItem.FirstOrDefault()?.IdLogin.Value.ToString() == UserFromService.IdLogin;
                    result.Add(BuildTreeEmailOneUser(userItem.ToList(), idDocumentTreeParent, hasSurfix));
                }
            }
            return result;
        }
        private TreeNode<int, DocumentGroupingTreeModel> BuildTreeEmailOneUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent, bool hasSurfix = false)
        {
            var currentUser = data.FirstOrDefault();
            var permission = (UserFromService.IsSuperAdmin.HasValue && this.UserFromService.IsSuperAdmin.Value || (UserFromService.IdLogin == currentUser.IdLogin.Value.ToString())) ? true :
                                (currentUser.IdSharingCompany.HasValue && currentUser.IdSharingCompany.Value.ToString() == UserFromService.IdSharingCompany && this.UserFromService.IsAdmin.HasValue && this.UserFromService.IsAdmin.Value ? true : false);
            
            var user = new TreeNode<int, DocumentGroupingTreeModel>
            {

                Data = new DocumentGroupingTreeModel
                {
                    CompanyName = currentUser.CompanyName,
                    DisplayName = currentUser.DisplayName,
                    GroupName = hasSurfix ? $"{currentUser.DisplayName} (you)" : currentUser.DisplayName,
                    IdSharingCompany = currentUser.IdSharingCompany,
                    IdLogin = currentUser.IdLogin,
                    IsActive = true,
                    IsReadOnly = true,
                    IsNotModify = currentUser.IdLogin.Value.ToString() != this.UserFromService.IdLogin,
                    IdDocumentTree = currentUser.IdLogin.Value,
                    IdDocumentTreeParent = _ID_ROOT_TREE,
                    IconName = "tree-user",
                    IsIndexingTree = true,
                    IdRepDocumentGuiType = currentUser.IdRepDocumentGuiType,
                    IsUser = true,
                    CanDelete = permission,
                    CanEdit = permission,
                    CanRead = permission,
                    CanShare = permission,
                },
                Children = new List<TreeNode<int, DocumentGroupingTreeModel>>()
            };
            var childList = BuildTreeHelper.BuildTree<int, DocumentGroupingTreeModel>(data, node => node.IdDocumentTree, node => node.IdDocumentTreeParent ?? default(int)).ToList();
            foreach (var item in childList)
            {
                item.Data.IdDocumentParentAfterCallApi = item.Data.IdDocumentTreeParent;
                item.Data.IdDocumentTreeParent = currentUser.IdLogin.Value;
                item.Data.IconName = "tree-folder";
                item.Data.IsIndexingTree = true;
            }
            user.Children = childList;
            return user;
        }
       
        public async Task<WSNewReturnValue> CreateFolderEmail(string fullPath, string idLogin, string idApplicationOwner = null, string idRepLanguage = null)
        {
            if (string.IsNullOrEmpty(idApplicationOwner))
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"CreateFolderEmail user not found {idLogin}");
                    return null;
                }
                idApplicationOwner = us.IdApplicationOwner;
                idRepLanguage = us.IdRepLanguage;
            }
            WSNewReturnValue rs = null;
            try
            {
                List<string> folders = fullPath.Replace("\\", "/").Split("/").ToList();

                string idParent = _ID_ROOT_TREE+ "";
                string prefixPath = "";
                foreach (string sub in folders)
                {
                    if (string.IsNullOrEmpty(sub))
                    {
                        continue;
                    }
                    if (string.IsNullOrEmpty(prefixPath))
                    {
                        prefixPath = sub;
                    }
                    else
                    {
                        prefixPath += "\\" + sub;
                    }

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeEmail(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR CreateFolderEmail idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            continue;
                        }
                        idParent = idP;
                        continue;
                    }
                    if (idParent == "-1")
                    {
                        _logger.Debug($"ERROR CreateFolderEmail idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                        continue;
                    }
                    DocumentTreeViewModel modelx = new DocumentTreeViewModel();
                    modelx.IdLogin = idLogin;
                    modelx.Name = sub;
                    modelx.IdDocumentParent = int.Parse(idParent);
                    DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                    data.IdLogin = idLogin;
                    data.IdApplicationOwner = idApplicationOwner;
                    data.LoginLanguage = idRepLanguage;
                    modelx.IsActive = true;
                    modelx.IsDeleted = "0";
                    modelx.IsReadOnly = "0";
                    modelx.IdDocumentType =_ID_REP_DOCUMENT_GUITYPE;
                    modelx.Icon = "user-man-add";
                    modelx.IdLogin = idLogin;

                    rs = await _documentService.CreateFolder(data, modelx);
                    _logger.Debug($"CreateFolderEmail {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
                    int.TryParse(rs.ReturnID, out int id);
                    if (idParent != "-1")
                    {
                        idParent = id + "";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error  CreateFolderEmail     {fullPath}       idLogin={idLogin}", ex);
                throw ex;
            }
            return rs;
        }

        public async Task<WSNewReturnValue> CheckAndCreateFolderEmail(Dictionary<string, object> values)
        {
            string idLogin  = values.GetValue("IdLogin") != null ? values.GetValue("IdLogin").ToString() : "";
            string folder   = values.GetValue("Folder") != null ? values.GetValue("Folder").ToString() : "";
            bool autoCreate = values.GetValue("AutoCreate") != null ? (values.GetValue("AutoCreate").ToString() == "1" ? true : false) : false;
            
            UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
            if (us == null)
            {
                _logger.Error($"CheckAndCreateFolderEmail user not found {idLogin}");
                return null;
            }
            string idApplicationOwner = us.IdApplicationOwner;
            string idRepLanguage = us.IdRepLanguage;
            WSNewReturnValue rs = null;
            string idParent = _ID_ROOT_TREE + "";
            try
            {
                List<string> folders = folder.Replace("\\", "/").Split("/").ToList();

                string prefixPath = "";
                foreach (string sub in folders)
                {
                    if (string.IsNullOrEmpty(sub))
                    {
                        continue;
                    }
                    if (string.IsNullOrEmpty(prefixPath))
                    {
                        prefixPath = sub;
                    }
                    else
                    {
                        prefixPath += "\\" + sub;
                    }

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeEmail(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR CheckAndCreateFolderEmail idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            rs = new WSNewReturnValue();
                            rs.ReturnID = "-1";
                            rs.UserErrorMessage = "not found";
                            rs.EventType = "success";
                            return rs;
                        }
                        idParent = idP;
                        continue;
                    }
                    if (autoCreate)
                    {
                        DocumentTreeViewModel modelx = new DocumentTreeViewModel();
                        modelx.IdLogin = idLogin;
                        modelx.Name = sub;
                        modelx.IdDocumentParent = int.Parse(idParent);
                        modelx.IsActive = true;
                        modelx.IsDeleted = "0";
                        modelx.IsReadOnly = "0";
                        modelx.IdDocumentType = _ID_REP_DOCUMENT_GUITYPE;
                        modelx.Icon = "user-man-add";
                        modelx.IdLogin = idLogin;

                        DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                        data.IdLogin = idLogin;
                        data.IdApplicationOwner = idApplicationOwner;
                        data.LoginLanguage = idRepLanguage;

                        rs = await _documentService.CreateFolder(data, modelx);
                        _logger.Debug($"CreateFolderEmail {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
                        int.TryParse(rs.ReturnID, out int id);
                        if (id != -1)
                        {
                            idParent = id + "";
                        }
                        else
                        {
                            _logger.Debug($"ERROR CheckAndCreateFolderEmail idParent = -1 when path {sub} \n\t idLogin: {idLogin} ");
                            throw new Exception($"Cannot create folder {sub}");
                        }
                    }
                    else
                    {
                        rs = new WSNewReturnValue();
                        rs.ReturnID = "-1";
                        rs.UserErrorMessage = "not found";
                        rs.EventType = "success";
                        return rs;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error  CheckAndCreateFolderEmail   folder={folder}   idLogin={idLogin}", ex);
                throw ex;
            }
            rs = new WSNewReturnValue();
            rs.ReturnID = idParent + "";
            rs.UserErrorMessage = "found";
            rs.EventType = "success";
            return rs;
        }


        public async Task<WSNewReturnValue> CreateSubFolderEmail(string nodeName, string idTreeParent, string idLogin, string idApplicationOwner = null, string idRepLanguage = null)
        {
            if (string.IsNullOrEmpty(idApplicationOwner))
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                idApplicationOwner = us.IdApplicationOwner;
                idRepLanguage = us.IdRepLanguage;
            }
            WSNewReturnValue rs;
            try
            {
                List<DocumentTreeInfo> trees = await _documentCommonBusiness.GetDocumentTreesDetails(idTreeParent, idLogin, idApplicationOwner);
                string treePath = trees.FirstOrDefault() != null ? (trees.FirstOrDefault().DocPath == null ? "" : trees.FirstOrDefault().DocPath) : "";
                treePath = treePath.Replace("\\", "/").Replace(_PREFIX_NAME_FOLDER_EMAIL + "//", "").Replace("//", "/").Replace(_PREFIX_NAME_FOLDER_EMAIL, "");
                //string folderWorking = Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine("ImportEmail", idLogin)), treePath);
                //string folderPath = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(folderWorking, nodeName));

                //if (!Directory.Exists(folderPath))
                //{
                //    _logger.Debug($"CreateSubFolderEmail create folder (1) - {folderPath} ");
                //    Directory.CreateDirectory(folderPath);
                //}

                /** SAVE document INTO customer's folder **/
                string commonFolder = await _documentCommonBusiness.DetectCommonFolderUser(idLogin, _PREFIX_NAME_FOLDER_EMAIL);
                string folderSharing = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolder), treePath);
                string folderPath = Path.Combine(folderSharing, nodeName);

                if (!Directory.Exists(folderPath))
                {
                    _logger.Debug($"CreateSubFolderEmail create folder (2) - {folderPath} ");
                    Directory.CreateDirectory(folderPath);
                }

                DocumentTreeViewModel modelx = new DocumentTreeViewModel();
                modelx.IdLogin = idLogin;
                modelx.Name = nodeName;
                modelx.IdDocumentParent = int.Parse(idTreeParent);
                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;
                modelx.IsActive = true;
                modelx.IsDeleted = "0";
                modelx.IsReadOnly = "0";
                modelx.IdDocumentType = _ID_REP_DOCUMENT_GUITYPE;
                modelx.Icon = "user-man-add";
                modelx.IdLogin = idLogin;
                rs = await _documentService.CreateFolder(data, modelx);
                _logger.Debug($"CreateSubFolderEmail - {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
            }
            catch (Exception ex)
            {
                _logger.Error($"Error CreateSubFolderEmail nodeName={nodeName}    idTreeParent={idTreeParent}  idLogin={idLogin}", ex);
                throw ex;
            }
            return rs;
        }

        public async Task UpdateFolderEmail(string oldPath, string newFolder, string idLogin, bool changedFromWeb)
        {
            try
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"SaveDocumentIndexing user not found {idLogin}");
                    return ;
                }
                                
                List<ImportFolderCompanyInfo> folderCompany = new List<ImportFolderCompanyInfo>();
                Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
                baseData.IdLogin = idLogin;
                baseData.IdApplicationOwner = us.IdApplicationOwner;
                var s = await _documentService.GetImportFolderOfCompany(baseData, us.IdPerson);

                if (s != null)
                {
                    var array = (JArray)s;
                    if (array.Count > 0)
                    {
                        string rs = array[0].ToString();

                        folderCompany = JsonConvert.DeserializeObject<List<ImportFolderCompanyInfo>>(rs);
                    }
                }

                string commonFolderUser = Path.Combine(string.IsNullOrEmpty(folderCompany.First().ImportFolder) ? folderCompany.First().Company : folderCompany.First().ImportFolder
                                                           , _PREFIX_NAME_FOLDER_EMAIL, idLogin);
                //string folderSharing = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolderUser), treePath);
                oldPath = Path.Combine(commonFolderUser, oldPath.Replace("/", "\\"));
                _logger.Debug($"UpdateFolderEmail path={oldPath} newFolder={newFolder}  idLogin={idLogin} changedFromWeb={changedFromWeb}");
                
                //string folderWorking = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine("ImportEmail", idLogin)), oldPath));
                //string pr = Directory.GetParent(folderWorking).FullName;
                //string newFolderPath = Path.Combine(pr, newFolder);

                //if (Directory.Exists(folderWorking) && folderWorking != newFolderPath)
                //{
                //    try
                //    {
                //        //Directory.Move(folderWorking, newFolderPath);
                //        DocumentIndexingQueueModel dataEmailModel = new DocumentIndexingQueueModel();
                //        dataEmailModel.FolderPath = oldPath;
                //        dataEmailModel.NewFolderPath = newFolder;
                //        dataEmailModel.IdLogin = idLogin;
                //        dataEmailModel.TypeDocument = _PREFIX_NAME_FOLDER_EMAIL.ToUpper();
                //        dataEmailModel.IdDocumentTree = _ID_ROOT_TREE + "";
                //        dataEmailModel.ActionOnDocument = "UPDATE-FOLDER-PUBLIC";
                //        await AddQueueDocumentEmail(dataEmailModel);
                //    } catch (Exception e)
                //    {
                //        _logger.Error($"ERROR rename folder {folderWorking} to {newFolderPath}. Added this action to Queue of Service. ", e);
                //        //
                //    }
                //}

                if (changedFromWeb)
                {
                    DocumentIndexingQueueModel dataEmailModel = new DocumentIndexingQueueModel();
                    dataEmailModel.FolderPath = oldPath;
                    dataEmailModel.NewFolderPath = newFolder;
                    dataEmailModel.IdLogin = idLogin;
                    dataEmailModel.TypeDocument = _PREFIX_NAME_FOLDER_EMAIL.ToUpper();
                    dataEmailModel.IdDocumentTree = _ID_ROOT_TREE + "";
                    dataEmailModel.ActionOnDocument = "UPDATE-FOLDER";
                    await AddQueueDocumentEmail(dataEmailModel);

                    //string folderSharingCustomer = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, idLogin), oldPath);
                    //pr = Directory.GetParent(folderSharingCustomer).FullName;
                    //newFolderPath = Path.Combine(pr, newFolder);
                    //_logger.Debug($"UpdateFolderEmail folderSharingCustomer={folderSharingCustomer} IsExist={Directory.Exists(folderSharingCustomer)} newFolder={newFolderPath} changedFromWeb={changedFromWeb}");
                    //if (Directory.Exists(folderSharingCustomer) && folderSharingCustomer != newFolderPath)
                    //{
                    //    if (changedFromWeb)
                    //    {
                            
                    //    }
                    //    //try
                    //    //{
                    //    //    Directory.Move(folderSharingCustomer, newFolderPath);
                    //    //} catch (Exception e)
                    //    //{
                    //    //    _logger.Error($"Error UpdateFolderEmail moveFolder {folderSharingCustomer}    newFolder={newFolderPath}  idLogin={idLogin}. Add Queues", e);
                    //    //    //add to Queues
                    //    //}  
                    //}
                }
                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error UpdateFolderEmail oldPath={oldPath}    newFolder={newFolder}  idLogin={idLogin}", ex);
                throw ex;
            }
        }

        public async Task<WSEditReturn> UpdateFolderEmail(DocumentTreeViewModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"UpdateFolderEmail user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;

                string fullCurrentPath = model.oldPath;
                string oldFolder = model.oldFolderName;

                List<string> folders = fullCurrentPath.Replace("\\", "/").Split("/").ToList();

                string idParent = _ID_ROOT_TREE + "";

                string prefixPath = "";
                string idDocumentTree = "";
                foreach (string sub in folders)
                {
                    if (string.IsNullOrEmpty(sub))
                    {
                        continue;
                    }
                    if (string.IsNullOrEmpty(prefixPath))
                    {
                        prefixPath = sub;
                    }
                    else
                    {
                        prefixPath += "\\" + sub;
                    }

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeEmail(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR UpdateFolderEmail idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            return null;
                        }
                        idParent = string.IsNullOrEmpty(idDocumentTree) ? idParent : idDocumentTree;
                        idDocumentTree = idP;
                        continue;
                    } else
                    {
                        _logger.Debug($"ERROR UpdateFolderEmail idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                        return null;
                    }
                }
                if (idParent == "-1")
                {
                    _logger.Debug($"ERROR UpdateFolderEmail idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                    return null;
                }

                UpdatedDocumentTreeViewModel modelUpdate = new UpdatedDocumentTreeViewModel();
                modelUpdate.IdDocument = int.Parse(idDocumentTree);
                modelUpdate.IdDocumentParent = int.Parse(idParent);
                modelUpdate.Name = model.Name;
                modelUpdate.IsActive = true;
                modelUpdate.IsDeleted = "0";
                modelUpdate.IdDocumentType = _ID_REP_DOCUMENT_GUITYPE;
                modelUpdate.IdLogin = idLogin;
                modelUpdate.IdRepDocumentGuiType = _ID_REP_DOCUMENT_GUITYPE + "";
                modelUpdate.Icon = "user-man-add";
                var result = await _documentService.UpdateFolder(data, modelUpdate);
                _logger.Debug($"UpdateFolderEmail - {JsonConvert.SerializeObject(modelUpdate)} \n\t result: {JsonConvert.SerializeObject(result)} ");

                //if (result.ReturnID != "-1")
                //{
                //    await UpdateFolderEmail(model.oldPath, model.Name, idLogin, false);
                //}

                return result;
            }
            catch (Exception e)
            {
                _logger.Error($"UpdateFolderEmail  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        public async Task<WSEditReturn> DeleteFolderEmailService(DocumentTreeViewModel model, bool deletedFromWeb)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;
                string fullCurrentPath = model.Name;

                string idParent = _ID_ROOT_TREE+ "";
                string prefixPath = fullCurrentPath.Replace("\\", "/");
                string idDocumentTree = "";

                UpdatedDocumentTreeViewModel modelUpdate = new UpdatedDocumentTreeViewModel();
                if (!string.IsNullOrEmpty(prefixPath))
                {
                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeEmail(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";

                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR DeleteFolderEmailService idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            throw new Exception($"DeleteFolderEmailService   not found folder {prefixPath} of user {idLogin}");
                        }
                        idParent = string.IsNullOrEmpty(idDocumentTree) ? idParent : idDocumentTree;
                        idDocumentTree = idP;
                    } else
                    {
                        _logger.Debug($"ERROR DeleteFolderEmailService idtree = -1 with path {prefixPath} \n\t idLogin: {idLogin} ");
                        throw new Exception($"DeleteFolderEmailService   not found folder {prefixPath} of user {idLogin}");
                    }

                    if (idParent == "-1")
                    {
                        _logger.Debug($"ERROR DeleteFolderEmailService idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                        throw new Exception($"DeleteFolderEmailService   not found folder {prefixPath} of user {idLogin}");
                    }
                    if (!string.IsNullOrEmpty(idDocumentTree))
                    {
                        try
                        {
                            modelUpdate.IdDocument = int.Parse(idDocumentTree);
                        }
                        catch (Exception err)
                        {
                            _logger.Error($"DeleteFolderEmailService  idDocumentTree:{idDocumentTree}   prefixPath: {prefixPath}", err);
                            throw err;
                        }
                    }
                } 
                else
                {
                    //delete all folders tree of user
                    List<DocumentTreeInfo> trees = await GetFolderFirstLevelOfEmail(idParent, model.IdLogin, idApplicationOwner);
                    if (trees != null)
                    {
                        List<DocumentTreeInfo> subs = trees.FindAll(f => f.IdDocumentTreeParent == _ID_ROOT_TREE + "");
                        string ids = "";
                        subs.ForEach(sub =>
                        {
                            ids += sub.IdDocumentTree + ",";
                        });
                        if (ids.EndsWith(",")) ids = ids.Substring(0, ids.Length - 1);
                        modelUpdate.IdDocuments = ids;
                    }
                    else
                    {
                        _logger.Debug($"ERROR DeleteFolderEmailService path {prefixPath} \n\t idLogin: {idLogin}. Cannot detect user's folders ");
                        throw new Exception($"DeleteFolderEmailService path {prefixPath} \n\t idLogin: {idLogin}. Cannot detect user's folders ");
                    }
                }

                try
                {
                    modelUpdate.IdDocumentParent = int.Parse(idParent);
                } catch(Exception err)
                {
                    _logger.Error($"DeleteFolderEmailService  idParent:{idParent}", err);
                }                
                if (!modelUpdate.IdDocumentParent.HasValue || (modelUpdate.IdDocumentParent.HasValue && modelUpdate.IdDocumentParent.Value < 1)
                        || !modelUpdate.IdDocument.HasValue || (modelUpdate.IdDocument.HasValue && modelUpdate.IdDocument.Value < 1))
                {
                    _logger.Error($"ERROR DeleteFolderEmailService - dataSubmit: {JsonConvert.SerializeObject(model)} \n\t dataUpdate: {JsonConvert.SerializeObject(modelUpdate)} ");
                    throw new Exception("cannot define Id of folder on System.");
                }

                modelUpdate.Name = model.Name;
                modelUpdate.IsActive = true;
                modelUpdate.IsDeleted = "1";
                modelUpdate.IdDocumentType = _ID_REP_DOCUMENT_GUITYPE;
                modelUpdate.IdLogin = idLogin;
                modelUpdate.IdRepDocumentGuiType = _ID_REP_DOCUMENT_GUITYPE + "";
                modelUpdate.Icon = "user-man-add";
                var result = await _documentService.DeleteFolder(data, modelUpdate);

                _logger.Debug($"DeleteFolderEmailService - {JsonConvert.SerializeObject(modelUpdate)} \n\t result: {JsonConvert.SerializeObject(result)} ");

                // don't need execute delete folder on customer's folder because this API called from service
                if (result.ReturnID != "-1" && deletedFromWeb)
                {
                    //await RenameFolderDeletedEmailOnPublicFile(model.Name, idLogin);
                    await DeleteFolderEmail(model.Name, idLogin, deletedFromWeb);
                }

                return result;
            }
            catch (Exception e)
            {
                _logger.Error($"DeleteFolderEmailService  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        public async Task RenameFolderDeletedEmailOnPublicFilexx(string oldPath, string idLogin)
        {
            string folderWorking = "";
            try
            {
                _logger.Debug($"RenameFolderEmailOnPublicFile path={oldPath}  idLogin={idLogin}");

                oldPath = oldPath.Replace("/", "\\");
                folderWorking = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine("ImportEmail", idLogin)), oldPath));

                if (Directory.Exists(folderWorking))
                {
                    string toNewFolder = Path.Combine(folderWorking, "_DELETED_" + DateTime.Now.Ticks);
                    try
                    {
                        Directory.Move(folderWorking, toNewFolder);
                    }
                    catch (Exception e)
                    {
                        _logger.Error($"ERROR rename folder {folderWorking} to {toNewFolder}. Added this action to Queue of Service. ", e);
                        DocumentIndexingQueueModel dataEmailModel = new DocumentIndexingQueueModel();
                        dataEmailModel.FolderPath = folderWorking;
                        dataEmailModel.NewFolderPath = toNewFolder;
                        dataEmailModel.IdLogin = idLogin;
                        dataEmailModel.TypeDocument = _PREFIX_NAME_FOLDER_EMAIL.ToUpper();
                        dataEmailModel.IdDocumentTree = _ID_ROOT_TREE+ "";
                        dataEmailModel.ActionOnDocument = "UPDATE-FOLDER-PUBLIC";
                        await AddQueueDocumentEmail(dataEmailModel);
                    }                    
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error RenameFolderDeletedEmailOnPublicFile path={folderWorking}  idLogin={idLogin}", ex);
            }
            return;
        }

        public async Task DeleteFolderEmail(string oldPath, string idLogin, bool deleteFromWeb)
        {
            try
            {
                _logger.Debug($"DeleteFolderEmail path={oldPath}  idLogin={idLogin} deleteFromWeb={deleteFromWeb}");
                oldPath = oldPath.Replace("/", "\\");
                string commonFolder = await _documentCommonBusiness.DetectCommonFolderUser(idLogin, _PREFIX_NAME_FOLDER_EMAIL);
                string folderSharingCustomer = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolder), oldPath);
                if (deleteFromWeb)
                {
                    DocumentIndexingQueueModel dataEmailModel = new DocumentIndexingQueueModel();
                    dataEmailModel.FolderPath = folderSharingCustomer;
                    dataEmailModel.IdLogin = idLogin;
                    dataEmailModel.TypeDocument = _PREFIX_NAME_FOLDER_EMAIL.ToUpper();
                    dataEmailModel.IdDocumentTree = _ID_ROOT_TREE+ "";
                    dataEmailModel.ActionOnDocument = "DELETE-FOLDER";
                    await AddQueueDocumentEmail(dataEmailModel);
                }
                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error DeleteFolderEmail path={oldPath}  idLogin={idLogin} deleteFromWeb={deleteFromWeb}", ex);
            }
        }

        public async Task<List<DocumentTreeInfo>> GetDetailTreeNodeEmail(string nodeName, string userId, string idApplicationOwner)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = idApplicationOwner;

            nodeName = nodeName.ToLower() == _PREFIX_NAME_FOLDER_EMAIL.ToLower() ? nodeName : (_PREFIX_NAME_FOLDER_EMAIL + "\\" + nodeName + "\\");
            nodeName = nodeName.Replace("/", "\\");
            return await _documentService.GetDetailTreeNodeIndexing(baseData, nodeName);
        }

        public async Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfEmail(string idDocumentTree, string userId, string idApplicationOwner)
        {
            if (string.IsNullOrEmpty(idApplicationOwner) && !string.IsNullOrEmpty(userId))
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(userId, "");
                idApplicationOwner = us.IdApplicationOwner;
            }
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = idApplicationOwner;

            return await _documentService.GetFolderFirstLevelOfIndexing(baseData, idDocumentTree);
        }

        public async Task<WSEditReturn> DeleteDocumentEmail(DocumentModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"DeleteDocumentEmail user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;


                List<DocumentIndexingInfo> trees = await GetDocumentEmail(idLogin, model.FilePath, model.FileName);
                if (trees == null || trees.Count == 0)
                {
                    _logger.Error($"DeleteDocumentEmail not found document {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string IdDocumentContainerScans = trees.First().IdDocumentContainerScans;
                if (string.IsNullOrEmpty(IdDocumentContainerScans))
                {
                    _logger.Error($"DeleteDocumentEmail not found document {JsonConvert.SerializeObject(trees.First())}");
                    return null;
                }

                DocumentContainerScanCRUD dataCRUD = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
                dataCRUD.IdLogin = idLogin;
                dataCRUD.IdApplicationOwner = idApplicationOwner;
                dataCRUD.IdDocumentContainerScans = IdDocumentContainerScans;

                WSEditReturn resultDelete = await _documentService.DeleteDocumentIndexing(dataCRUD);

                _logger.Debug($"DeleteDocumentEmail - {JsonConvert.SerializeObject(dataCRUD)} \n\t result: {JsonConvert.SerializeObject(resultDelete)} ");

                return resultDelete;
            }
            catch (Exception e)
            {
                _logger.Error($"DeleteDocumentEmail  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        private async Task<List<DocumentIndexingInfo>> GetDocumentEmail(string userId, string filePath, string fileName)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = "0";

            return await _documentService.GetDocumentIndexing(baseData, filePath, fileName);
        }

        public async Task<WSEditReturn> UpdateDocumentEmail(DocumentModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"UpdateDocumentEmail user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;

                List<DocumentIndexingInfo> trees = await GetDocumentEmail(idLogin, model.FilePath, model.OldFileName);
                if (trees == null || trees.Count == 0)
                {
                    _logger.Error($"UpdateDocumentEmail not found document {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string IdDocumentContainerScans = trees.First().IdDocumentContainerScans;
                if (string.IsNullOrEmpty(IdDocumentContainerScans))
                {
                    _logger.Error($"UpdateDocumentEmail not found document {JsonConvert.SerializeObject(trees.First())}");
                    return null;
                }

                DocumentContainerScanCRUD dataCRUD = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
                dataCRUD.IdLogin = idLogin;
                dataCRUD.IdApplicationOwner = idApplicationOwner;
                dataCRUD.IdDocumentContainerScans = IdDocumentContainerScans;
                dataCRUD.FileName = model.FileName;
                dataCRUD.Size = model.SizeOfDocument;
                dataCRUD.OriginalCreateDate = model.CreatedDate;
                dataCRUD.OriginalUpdateDate = model.LastModify;

                WSEditReturn resultUpdate = await _documentService.UpdateDocumentIndexing(dataCRUD);

                _logger.Debug($"UpdateDocumentEmail 2496 - {JsonConvert.SerializeObject(dataCRUD)} \n\t result: {JsonConvert.SerializeObject(resultUpdate)} ");

                return resultUpdate;
            }
            catch (Exception e)
            {
                _logger.Error($"UpdateDocumentEmail  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        public async Task<WSEditReturn> MoveEmailToOtherTree(DocumentModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"MoveEmailToOtherTree user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;


                List<DocumentIndexingInfo> trees = await GetDocumentEmail(idLogin, model.FilePath, model.OldFileName);
                if (trees == null || trees.Count == 0)
                {
                    _logger.Error($"MoveEmailToOtherTree not found document {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string IdDocumentContainerScans = trees.First().IdDocumentContainerScans;
                if (string.IsNullOrEmpty(IdDocumentContainerScans))
                {
                    _logger.Error($"MoveEmailToOtherTree not found document {JsonConvert.SerializeObject(trees.First())}");
                    return null;
                }

                DocumentContainerScanCRUD dataCRUD = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
                dataCRUD.IdLogin = idLogin;
                dataCRUD.IdApplicationOwner = idApplicationOwner;
                dataCRUD.IdDocumentContainerScans = IdDocumentContainerScans;
                dataCRUD.FileName = model.FileName;
                dataCRUD.Size = model.SizeOfDocument;
                dataCRUD.OriginalCreateDate = model.CreatedDate;
                dataCRUD.OriginalUpdateDate = model.LastModify;

                WSEditReturn resultUpdate = await _documentService.UpdateDocumentIndexing(dataCRUD);

                _logger.Debug($"MoveEmailToOtherTree 2496 - {JsonConvert.SerializeObject(dataCRUD)} \n\t result: {JsonConvert.SerializeObject(resultUpdate)} ");

                return resultUpdate;
            }
            catch (Exception e)
            {
                _logger.Error($"MoveEmailToOtherTree  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }


        private async Task<WSEditReturn> AddQueueDocumentEmail(DocumentIndexingQueueModel dataEmailModel)
        {
            CreateQueueModel queueModel = _documentCommonBusiness.CreateSystemSchedule(dataEmailModel, 19);
            return await _commonBusiness.CreateQueue(queueModel);
        }

        public async Task DetectDocumentMoved(DocumentTreeMailMove tree)
        {
            try
            {
                _logger.Debug($"Info DetectDocumentMoved {JsonConvert.SerializeObject(tree)}");
                //string idDocumentTree, string idLogin, string idDocumentTreeOld, string idLoginOld, string idDocumentContainerScans
                //{ "IdDocumentTree": "1562",  "IdLogin": "4",  "IdDocumentTreeOld": 1553,  "IdLoginOld": 4,  "IdDocumentContainerScans": 229,  "IdRepDocumentGuiType": "6"}
                
                string newPath = await GetTree(tree.IdDocumentTree, tree.IdLogin);
                if(newPath.ToLower() == "mail")
                {
                    newPath = "";
                }
                Dictionary<string, object> values = new Dictionary<string, object>();
                values.Add("IdDocumentTree", tree.IdDocumentTreeOld);
                object ss = await _documentCommonBusiness.GetDocumentsOfEmailTree(values);
                if(((JArray)ss).Count < 2)
                {
                    return;
                }
                string documentName = "";
                string pathOfDocument = "";
                List<DocumentScanModel> docs = (JsonConvert.DeserializeObject<List<DocumentScanModel>>((((JArray)ss)[1]).ToString()));
                foreach(DocumentScanModel doc in docs)
                {
                    if (doc.IdDocumentContainerScans == tree.IdDocumentContainerScans)
                    {
                        documentName = doc.ScannedFilename;
                        pathOfDocument = doc.ScannedPath;
                        break;
                    }
                }
                
                //loop find iddocumentContainerScan
                //[  {                    "IdApplicationOwner": 1,    "IdDocumentContainerScans": 229,    "IdDocumentTree": 1562,
                //    "IdTreeRoot": 2,    "ScannedPath": "\\\\file.xena.local\\MyDMS\\SharedFolder\\ImportFolder\\Company\\Xoontec AG\\Mail\\4\\dfafg",    "ScannedFilename": "1c13daea-d328-438c-af42-1b1a89ea7b8b.eml",
                //    "NumberOfImages": 1,    "Notes": null,    "Sender": "auto.notification@xoontec.com",    "SentDate": "2021-08-10T10:19:34",    "RecipientsTo": "tuan.nguyen@xoontec.com",
                //    "RecipientsCc": "",    "RecipientsBcc": "",    "Subject": "[Local] Report MediaCode on 2021-08-10 17:19:12", 
                //    "IsActive": true,    "IsDeleted": false,    "CreateDate": "2022-06-22T16:36:05.823",    "UpdateDate": null,    "FullText": null,    "DocumentName": null,    "DocumentType": null,    "RowNum": 3  }
                //]

                if (newPath.StartsWith(_PREFIX_NAME_FOLDER_EMAIL + "\\"))
                {
                    newPath = newPath.Substring((_PREFIX_NAME_FOLDER_EMAIL + "\\").Length);
                }

                pathOfDocument = pathOfDocument.Replace(_pathProvider.CustomerFileServer, "");
                if (pathOfDocument.StartsWith("\\"))
                {
                    pathOfDocument = pathOfDocument.Substring(1);
                }
                if (newPath.StartsWith("\\"))
                {
                    newPath = newPath.Substring(1);
                }

                string commonFolderNew  = await _documentCommonBusiness.DetectCommonFolderUser(tree.IdLogin, _PREFIX_NAME_FOLDER_EMAIL);

                DocumentIndexingQueueModel dataEmailModel = new DocumentIndexingQueueModel();
                dataEmailModel.FolderPath = pathOfDocument;
                dataEmailModel.NewFolderPath = Path.Combine(commonFolderNew, newPath);
                dataEmailModel.IdLogin = tree.IdLogin;
                dataEmailModel.TypeDocument = _PREFIX_NAME_FOLDER_EMAIL.ToUpper();
                dataEmailModel.IdDocumentTree = _ID_ROOT_TREE + "";
                dataEmailModel.ActionOnDocument = "MOVE-MESSAGES";
                dataEmailModel.DocumentName = documentName;

                await AddQueueDocumentEmail(dataEmailModel);

                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error DetectDocumentMoved {JsonConvert.SerializeObject(tree)}", ex);
            }
        }

        private async Task<string> GetTree(string idDocumentTree, string idLogin)
        {
            try
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"GetTree user not found ");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;
                object ss = await _documentCommonBusiness.GetTreePath(idDocumentTree, idLogin, us.IdApplicationOwner);
                
                return JsonConvert.DeserializeObject<List<DocPathModel>>(ss.ToString()).First().DocPath;
            }
            catch (Exception e)
            {
                _logger.Error($"GetTree  {idDocumentTree}", e);
                throw e;
            }
        }

    }
}
