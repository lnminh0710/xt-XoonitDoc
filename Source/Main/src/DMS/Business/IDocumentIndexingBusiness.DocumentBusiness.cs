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
    public class DocumentIndexingBusiness : BaseBusiness, IDocumentIndexingBusiness
    {
        private readonly IPathProvider _pathProvider;
        private readonly IDocumentService _documentService;
        private readonly IUniqueService _uniqueService;
        private readonly ICommonBusiness _commonBusiness;
        private readonly IDocumentCommonBusiness _documentCommonBusiness;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        private const int _ID_ROOT_TREE = 3;
        private const int _ID_REP_DOCUMENT_GUITYPE = 5;
        private const string _PREFIX_NAME_FOLDER_INDEXING = "Indexing";

        public DocumentIndexingBusiness(IHttpContextAccessor context,
                              IDocumentService documentService,
                              IFileBusiness fileBusiness,
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

        public async Task<IEnumerable<TreeNode<int, DocumentGroupingTreeModel>>> GetDocumentTreeIndexingByUser(GetDocumentTreeOptions options)
        {
            try
            {
                var param = await _documentCommonBusiness.TransformRequestToDocTreeGetData(options);
                var data = await _documentService.GetDocumentTreeIndexing(param);
                if (data.Count() != 2)
                {
                    throw new Exception($"Cannot get data from store");
                }
                var nodeData = JArray.FromObject(data.ToList()[1]).ToObject<IEnumerable<DocumentGroupingTreeModel>>();
                var tree = new List<TreeNode<int, DocumentGroupingTreeModel>>();

                Dictionary<string, object> values = new Dictionary<string, object>();
                values.Add("IdLogin", options.IdLogin);
                values.Add("PermissionType", _PREFIX_NAME_FOLDER_INDEXING);
                List<TreePermissionModel> treePermission = await _documentCommonBusiness.GetTreePermissionIdLogin(values);
                try
                {
                    if (treePermission != null && treePermission.Count > 0)
                    {
                        _logger.Error("GetDocumentTreeIndexingByUser 1.1");
                        nodeData = _documentCommonBusiness.AddTreePermissionToStructureTreeIndexing(true, options.IdLogin, nodeData, treePermission,
                                        this.UserFromService.IsSuperAdmin.HasValue ? this.UserFromService.IsSuperAdmin.Value : false,
                                        this.UserFromService.IsAdmin.HasValue ? this.UserFromService.IsAdmin.Value : false);
                    }
                    else
                    {
                        _logger.Error("GetDocumentTreeIndexingByUser 1.2");
                        nodeData = _documentCommonBusiness.PreSettingDocumentTree(options.IdLogin, nodeData,
                                        this.UserFromService.IsSuperAdmin.HasValue ? this.UserFromService.IsSuperAdmin.Value : false,
                                        this.UserFromService.IsAdmin.HasValue ? this.UserFromService.IsAdmin.Value : false);
                    }
                }
                catch(Exception ex)
                {
                    _logger.Error("GetDocumentTreeIndexingByUser 1: " + JsonConvert.SerializeObject(ex));
                }

                try
                {
                    if (this.UserFromService.IsSuperAdmin.Value == true)
                    {
                        var comps = BuildTreeIndexingCompany(nodeData, _ID_ROOT_TREE);// 3 is id of Indexing
                        if (comps.Any()) tree.AddRange(comps);
                    }
                    else
                    {
                        var users = BuildTreeIndexingMoreUser(nodeData, _ID_ROOT_TREE);// 3 is id of Indexing
                        if (users.Any()) tree.AddRange(users);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Error("GetDocumentTreeIndexingByUser 2 ", ex);
                }
                          

                return tree;
            }
            catch (Exception ex)
            {
                _logger.Error("GetDocumentTreeIndexingByUser options:" + JsonConvert.SerializeObject(options), ex);
                throw;
            }
        }

        private List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeIndexingCompany(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
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
                            IsCompany = true,
                            CanShare = false,
                        },
                        Children = new List<TreeNode<int, DocumentGroupingTreeModel>>()
                    };
                    company.Children = BuildTreeIndexingMoreUser(comItem, firstComItem.IdSharingCompany.Value);
                    result.Add(company);
                }
            }
            return result;
        }

        private List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeIndexingMoreUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
        {
            var result = new List<TreeNode<int, DocumentGroupingTreeModel>>();
            var groupUser = data.GroupBy(x => x.IdLogin);
            if (groupUser.Any())
            {
                foreach (var userItem in groupUser)
                {
                    var hasSurfix = userItem.FirstOrDefault()?.IdLogin.Value.ToString() == UserFromService.IdLogin;
                    result.Add(BuildTreeIndexingOneUser(userItem.ToList(), idDocumentTreeParent, hasSurfix));
                }
            }
            return result;
        }
        private TreeNode<int, DocumentGroupingTreeModel> BuildTreeIndexingOneUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent, bool hasSurfix = false)
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
            //CanEdit = (this.UserFromService.IdLogin == currentUser.IdLogin.Value.ToString() || UserFromService.IsAdmin.Value || UserFromService.IsSuperAdmin.Value),
            //        CanShare = UserFromService.IsSuperAdmin.Value ||
            //                            (UserFromService.IsAdmin.Value && UserFromService.IdSharingCompany == currentUser.IdSharingCompany.Value.ToString()) ||
            //                            (UserFromService.IdLogin == currentUser.IdLogin.Value.ToString())
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
       
        public async Task<WSNewReturnValue> CreateFolderIndexing(string fullPath, string idLogin, string idApplicationOwner = null, string idRepLanguage = null)
        {
            if (string.IsNullOrEmpty(idApplicationOwner))
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"CreateFolderIndexing user not found {idLogin}");
                    return null;
                }
                idApplicationOwner = us.IdApplicationOwner;
                idRepLanguage = us.IdRepLanguage;
            }
            WSNewReturnValue rs = null;
            try
            {
                List<string> folders = fullPath.Replace("\\", "/").Split("/").ToList();

                string idParent = _ID_ROOT_TREE + "";
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

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeIndexing(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR CreateFolderIndexing idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            continue;
                        }
                        idParent = idP;
                        continue;
                    }
                    if (idParent == "-1")
                    {
                        _logger.Debug($"ERROR CreateFolderIndexing idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
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
                    modelx.IdDocumentType = _ID_REP_DOCUMENT_GUITYPE;
                    modelx.Icon = "user-man-add";
                    modelx.IdLogin = idLogin;

                    rs = await _documentService.CreateFolder(data, modelx);
                    _logger.Debug($"CreateFolderIndexing {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
                    int.TryParse(rs.ReturnID, out int id);
                    if (idParent != "-1")
                    {
                        idParent = id + "";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error  CreateFolderIndexing     {fullPath}       idLogin={idLogin}", ex);
                throw ex;
            }
            return rs;
        }

        public async Task<WSNewReturnValue> CreateSubFolderIndexing(string nodeName, string idTreeParent, string idLogin, string idApplicationOwner = null, string idRepLanguage = null)
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
                treePath = treePath.Replace("\\", "/").Replace(_PREFIX_NAME_FOLDER_INDEXING + "//", "").Replace("//", "/").Replace(_PREFIX_NAME_FOLDER_INDEXING, "");
                //string folderWorking = Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine(_PREFIX_NAME_FOLDER_INDEXING, idLogin)), treePath);
                //string folderPath = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(folderWorking, nodeName));

                //if (!Directory.Exists(folderPath))
                //{
                //    _logger.Debug($"CreateSubFolderIndexing create folder (1) - {folderPath} ");
                //    Directory.CreateDirectory(folderPath);
                //}


                /** SAVE document INTO customer's folder **/
                string commonFolder = await _documentCommonBusiness.DetectCommonFolderUser(idLogin, _PREFIX_NAME_FOLDER_INDEXING);
                string folderSharing = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolder), treePath);
                string folderPath = Path.Combine(folderSharing, nodeName);// Path.Combine(_documentCommonBusiness.GetUploadFolder(), );

                if (!Directory.Exists(folderPath))
                {
                    _logger.Debug($"CreateSubFolderIndexing create folder (2) - {folderPath} ");
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
                _logger.Debug($"CreateSubFolderIndexing - {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
            }
            catch (Exception ex)
            {
                _logger.Error($"Error CreateSubFolderIndexing nodeName={nodeName}    idTreeParent={idTreeParent}  idLogin={idLogin}", ex);
                throw ex;
            }
            return rs;
        }

        public async Task<WSNewReturnValue> CheckAndCreateFolderIndexing(string idLogin, string folder, bool autoCreate)
        {
            UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
            if (us == null)
            {
                _logger.Error($"CheckAndCreateFolderIndexing user not found {idLogin}");
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

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeIndexing(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR CheckAndCreateFolderIndexing idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
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
                        _logger.Debug($"CreateFolderIndexing {JsonConvert.SerializeObject(modelx)} \n\t result: {JsonConvert.SerializeObject(rs)} ");
                        int.TryParse(rs.ReturnID, out int id);
                        if (id != -1)
                        {
                            idParent = id + "";
                        }
                        else
                        {
                            _logger.Debug($"ERROR CheckAndCreateFolderIndexing idParent = -1 when path {sub} \n\t idLogin: {idLogin} ");
                            throw new Exception($"Cannot create folder {sub}");
                        }
                    } else
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
                _logger.Error($"Error  CheckAndCreateFolderIndexing   folder={folder}   idLogin={idLogin}", ex);
                throw ex;
            }
            rs = new WSNewReturnValue();
            rs.ReturnID = idParent + "";
            rs.UserErrorMessage = "found";
            rs.EventType = "success";
            return rs;
        }

        public async Task UpdateFolderIndexing(string oldPath, string newFolder, string idLogin, bool changedFromWeb)
        {
            try
            {
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"SaveDocumentIndexing user not found {idLogin}");
                    return;
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
                string prefixFolder = "Indexing";

                string commonFolderUser = Path.Combine(string.IsNullOrEmpty(folderCompany.First().ImportFolder) ? folderCompany.First().Company : folderCompany.First().ImportFolder
                                                           , prefixFolder, idLogin);
                _logger.Debug($"UpdateFolderIndexing path={oldPath} newFolder={newFolder}  idLogin={idLogin} changedFromWeb={changedFromWeb}");
                oldPath = Path.Combine(commonFolderUser, oldPath.Replace("/", "\\"));
                //oldPath = oldPath.Replace("/", "\\");
                //string folderWorking = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine(_PREFIX_NAME_FOLDER_INDEXING, idLogin)), oldPath));
                //                string pr = Directory.GetParent(folderWorking).FullName;
                //string newFolderPath = Path.Combine(pr, newFolder);

                //if (Directory.Exists(folderWorking) && folderWorking != newFolderPath)
                //{
                //    try
                //    {
                //        //Directory.Move(folderWorking, newFolderPath);
                //        DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                //        dataIndexingModel.FolderPath = folderWorking;
                //        dataIndexingModel.NewFolderPath = newFolderPath;
                //        dataIndexingModel.IdLogin = idLogin;
                //        dataIndexingModel.TypeDocument = _PREFIX_NAME_FOLDER_INDEXING.ToUpper();
                //        dataIndexingModel.IdDocumentTree = _ID_ROOT_TREE + "";
                //        dataIndexingModel.ActionOnDocument = "UPDATE-FOLDER-PUBLIC";
                //        await AddQueueDocumentIndexing(dataIndexingModel);
                //    } catch (Exception e)
                //    {
                //        _logger.Error($"ERROR rename folder {folderWorking} to {newFolderPath}. Added this action to Queue of Service. ", e);
                //        //DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                //        //dataIndexingModel.FolderPath = folderWorking;
                //        //dataIndexingModel.NewFolderPath = newFolderPath;
                //        //dataIndexingModel.IdLogin = idLogin;
                //        //dataIndexingModel.TypeDocument = "INDEXING";
                //        //dataIndexingModel.IdDocumentTree = _ID_ROOT_TREE + "";
                //        //dataIndexingModel.ActionOnDocument = "UPDATE-FOLDER-PUBLIC";
                //        //await AddQueueDocumentIndexing(dataIndexingModel);
                //    }
                //}

                if (changedFromWeb)
                {
                    DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                    dataIndexingModel.FolderPath = oldPath;
                    dataIndexingModel.NewFolderPath = newFolder;
                    dataIndexingModel.IdLogin = idLogin;
                    dataIndexingModel.TypeDocument = _PREFIX_NAME_FOLDER_INDEXING.ToUpper();
                    dataIndexingModel.IdDocumentTree = _ID_ROOT_TREE + "";
                    dataIndexingModel.ActionOnDocument = "UPDATE-FOLDER";
                    await AddQueueDocumentIndexing(dataIndexingModel);

                    //string folderSharingCustomer = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, idLogin), oldPath);
                    //pr = Directory.GetParent(folderSharingCustomer).FullName;
                    //newFolderPath = Path.Combine(pr, newFolder);
                    //_logger.Debug($"UpdateFolderIndexing folderSharingCustomer={folderSharingCustomer} IsExist={Directory.Exists(folderSharingCustomer)} newFolder={newFolderPath} changedFromWeb={changedFromWeb}");
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
                    //    //    _logger.Error($"Error UpdateFolderIndexing moveFolder {folderSharingCustomer}    newFolder={newFolderPath}  idLogin={idLogin}. Add Queues", e);
                    //    //    //add to Queues
                    //    //}  
                    //}
                }
                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error UpdateFolderIndexing oldPath={oldPath}    newFolder={newFolder}  idLogin={idLogin}", ex);
                throw ex;
            }
        }

        public async Task<WSEditReturn> UpdateFolderIndexing(DocumentTreeViewModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"UpdateFolderIndexing user not found {JsonConvert.SerializeObject(model)}");
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

                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeIndexing(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";
                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR UpdateFolderIndexing idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            return null;
                        }
                        idParent = string.IsNullOrEmpty(idDocumentTree) ? idParent : idDocumentTree;
                        idDocumentTree = idP;
                        continue;
                    } else
                    {
                        _logger.Debug($"ERROR UpdateFolderIndexing idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                        return null;
                    }
                }
                if (idParent == "-1")
                {
                    _logger.Debug($"ERROR UpdateFolderIndexing idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
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
                _logger.Debug($"UpdateFolderIndexing - {JsonConvert.SerializeObject(modelUpdate)} \n\t result: {JsonConvert.SerializeObject(result)} ");

                //if (result.ReturnID != "-1")
                //{
                //    await UpdateFolderIndexing(model.oldPath, model.Name, idLogin, false);
                //}

                return result;
            }
            catch (Exception e)
            {
                _logger.Error($"UpdateFolderIndexing  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        public async Task<WSEditReturn> DeleteFolderIndexingService(DocumentTreeViewModel model, bool deletedFromWeb)
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

                string idParent = _ID_ROOT_TREE + "";
                string prefixPath = fullCurrentPath.Replace("\\", "/");
                string idDocumentTree = "";

                UpdatedDocumentTreeViewModel modelUpdate = new UpdatedDocumentTreeViewModel();
                if (!string.IsNullOrEmpty(prefixPath))
                {
                    List<DocumentTreeInfo> trees = await GetDetailTreeNodeIndexing(prefixPath, idLogin, idApplicationOwner);
                    string idP = trees != null ? trees.FirstOrDefault().IdDocumentTree : "";

                    if (!string.IsNullOrEmpty(idP))
                    {
                        if (idP == "-1")
                        {
                            _logger.Debug($"ERROR DeleteFolderIndexingService idtree = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                            throw new Exception($"DeleteFolderIndexingService   not found folder {prefixPath} of user {idLogin}");
                        }
                        idParent = string.IsNullOrEmpty(idDocumentTree) ? idParent : idDocumentTree;
                        idDocumentTree = idP;
                    } else
                    {
                        _logger.Debug($"ERROR DeleteFolderIndexingService idtree = -1 with path {prefixPath} \n\t idLogin: {idLogin} ");
                        throw new Exception($"DeleteFolderIndexingService   not found folder {prefixPath} of user {idLogin}");
                    }

                    if (idParent == "-1")
                    {
                        _logger.Debug($"ERROR DeleteFolderIndexingService idParent = -1 when path {prefixPath} \n\t idLogin: {idLogin} ");
                        throw new Exception($"DeleteFolderIndexingService   not found folder {prefixPath} of user {idLogin}");
                    }
                    if (!string.IsNullOrEmpty(idDocumentTree))
                    {
                        try
                        {
                            modelUpdate.IdDocument = int.Parse(idDocumentTree);
                        }
                        catch (Exception err)
                        {
                            _logger.Error($"DeleteFolderIndexingService  idDocumentTree:{idDocumentTree}   prefixPath: {prefixPath}", err);
                            throw err;
                        }
                    }
                } 
                else
                {
                    //delete all folders tree of user
                    List<DocumentTreeInfo> trees = await GetFolderFirstLevelOfIndexing(idParent, model.IdLogin, idApplicationOwner);
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
                        _logger.Debug($"ERROR DeleteFolderIndexingService path {prefixPath} \n\t idLogin: {idLogin}. Cannot detect user's folders ");
                        throw new Exception($"DeleteFolderIndexingService path {prefixPath} \n\t idLogin: {idLogin}. Cannot detect user's folders ");
                    }
                }

                try
                {
                    modelUpdate.IdDocumentParent = int.Parse(idParent);
                } catch(Exception err)
                {
                    _logger.Error($"DeleteFolderIndexingService  idParent:{idParent}", err);
                }                
                if (!modelUpdate.IdDocumentParent.HasValue || (modelUpdate.IdDocumentParent.HasValue && modelUpdate.IdDocumentParent.Value < 1)
                        || !modelUpdate.IdDocument.HasValue || (modelUpdate.IdDocument.HasValue && modelUpdate.IdDocument.Value < 1))
                {
                    _logger.Error($"ERROR DeleteFolderIndexingService - dataSubmit: {JsonConvert.SerializeObject(model)} \n\t dataUpdate: {JsonConvert.SerializeObject(modelUpdate)} ");
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

                _logger.Debug($"DeleteFolderIndexingService - {JsonConvert.SerializeObject(modelUpdate)} \n\t result: {JsonConvert.SerializeObject(result)} ");

                // don't need execute delete folder on customer's folder because this API called from service
                if (result.ReturnID != "-1" && deletedFromWeb)
                {
                    //await RenameFolderDeletedIndexingOnPublicFile(model.Name, idLogin);
                    await DeleteFolderIndexing(model.Name, idLogin, deletedFromWeb);
                }

                return result;
            }
            catch (Exception e)
            {
                _logger.Error($"DeleteFolderIndexingService  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        public async Task RenameFolderDeletedIndexingOnPublicFilexx(string oldPath, string idLogin)
        {
            string folderWorking = "";
            try
            {
                _logger.Debug($"RenameFolderIndexingOnPublicFile path={oldPath}  idLogin={idLogin}");

                oldPath = oldPath.Replace("/", "\\");
                folderWorking = Path.Combine(_documentCommonBusiness.GetUploadFolder(), Path.Combine(Path.Combine(_pathProvider.PublicFolder, Path.Combine(_PREFIX_NAME_FOLDER_INDEXING, idLogin)), oldPath));

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
                        DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                        dataIndexingModel.FolderPath = folderWorking;
                        dataIndexingModel.NewFolderPath = toNewFolder;
                        dataIndexingModel.IdLogin = idLogin;
                        dataIndexingModel.TypeDocument = _PREFIX_NAME_FOLDER_INDEXING.ToUpper();
                        dataIndexingModel.IdDocumentTree = _ID_ROOT_TREE + "";
                        dataIndexingModel.ActionOnDocument = "UPDATE-FOLDER-PUBLIC";
                        await AddQueueDocumentIndexing(dataIndexingModel);
                    }                    
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error RenameFolderDeletedIndexingOnPublicFile path={folderWorking}  idLogin={idLogin}", ex);
            }
            return;
        }

        public async Task DeleteFolderIndexing(string oldPath, string idLogin, bool deleteFromWeb)
        {
            try
            {
                _logger.Debug($"DeleteFolderIndexing path={oldPath}  idLogin={idLogin} deleteFromWeb={deleteFromWeb}");
                oldPath = oldPath.Replace("/", "\\");
                if(oldPath.StartsWith("\\"))
                {
                    oldPath = oldPath.Substring(1);
                }
                string commonFolder = await _documentCommonBusiness.DetectCommonFolderUser(idLogin, _PREFIX_NAME_FOLDER_INDEXING);
                string folderSharingCustomer = Path.Combine(Path.Combine(_pathProvider.CustomerFileServer, commonFolder), oldPath);
                if (deleteFromWeb)
                {
                    DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                    dataIndexingModel.FolderPath = folderSharingCustomer;
                    dataIndexingModel.IdLogin = idLogin;
                    dataIndexingModel.TypeDocument = _PREFIX_NAME_FOLDER_INDEXING.ToUpper();
                    dataIndexingModel.IdDocumentTree = _ID_ROOT_TREE + "";
                    dataIndexingModel.ActionOnDocument = "DELETE-FOLDER";
                    await AddQueueDocumentIndexing(dataIndexingModel);
                }
                //if (Directory.Exists(folderSharingCustomer)) {
                //    try
                //    {
                //        Directory.Delete(folderSharingCustomer, true);
                //    }
                //    catch(Exception e)
                //    {
                //        _logger.Error($"Error DeleteFolderIndexing {folderSharingCustomer} . Add Queues", e);
                //        //add to Queues
                        
                //    }                    
                //}
                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Error DeleteFolderIndexing path={oldPath}  idLogin={idLogin} deleteFromWeb={deleteFromWeb}", ex);
            }
        }

        public async Task<List<DocumentTreeInfo>> GetDetailTreeNodeIndexing(string nodeName, string userId, string idApplicationOwner)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = idApplicationOwner;

            nodeName = nodeName.ToLower() == _PREFIX_NAME_FOLDER_INDEXING.ToLower() ? nodeName : (_PREFIX_NAME_FOLDER_INDEXING + "\\" + nodeName + "\\");
            nodeName = nodeName.Replace("/", "\\");
            return await _documentService.GetDetailTreeNodeIndexing(baseData, nodeName);
        }

        public async Task<List<DocumentTreeInfo>> GetFolderFirstLevelOfIndexing(string idDocumentTree, string userId, string idApplicationOwner)
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

        public async Task<WSEditReturn> DeleteDocumentIndexing(DocumentModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"DeleteDocumentIndexing user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;


                List<DocumentIndexingInfo> trees = await GetDocumentIndexing(idLogin, model.FilePath, model.FileName);
                if (trees == null || trees.Count == 0)
                {
                    _logger.Error($"DeleteDocumentIndexing not found document {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string IdDocumentContainerScans = trees.First().IdDocumentContainerScans;
                if (string.IsNullOrEmpty(IdDocumentContainerScans))
                {
                    _logger.Error($"DeleteDocumentIndexing not found document {JsonConvert.SerializeObject(trees.First())}");
                    return null;
                }

                DocumentContainerScanCRUD dataCRUD = (DocumentContainerScanCRUD)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerScanCRUD));
                dataCRUD.IdLogin = idLogin;
                dataCRUD.IdApplicationOwner = idApplicationOwner;
                dataCRUD.IdDocumentContainerScans = IdDocumentContainerScans;

                WSEditReturn resultDelete = await _documentService.DeleteDocumentIndexing(dataCRUD);

                _logger.Debug($"DeleteDocumentIndexing - {JsonConvert.SerializeObject(dataCRUD)} \n\t result: {JsonConvert.SerializeObject(resultDelete)} ");

                return resultDelete;
            }
            catch (Exception e)
            {
                _logger.Error($"DeleteDocumentIndexing  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        private async Task<List<DocumentIndexingInfo>> GetDocumentIndexing(string userId, string filePath, string fileName)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = "0";

            return await _documentService.GetDocumentIndexing(baseData, filePath, fileName);
        }

        public async Task<WSEditReturn> UpdateDocumentIndexing(DocumentModel model)
        {
            try
            {
                string idLogin = model.IdLogin;
                UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
                if (us == null)
                {
                    _logger.Error($"UpdateDocumentIndexing user not found {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string idApplicationOwner = us.IdApplicationOwner;
                string idRepLanguage = us.IdRepLanguage;

                DocumentTreeRootData data = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeRootData)) as DocumentTreeRootData;
                data.IdLogin = idLogin;
                data.IdApplicationOwner = idApplicationOwner;
                data.LoginLanguage = idRepLanguage;

                List<DocumentIndexingInfo> trees = await GetDocumentIndexing(idLogin, model.FilePath, model.OldFileName);
                if (trees == null || trees.Count == 0)
                {
                    _logger.Error($"UpdateDocumentIndexing not found document {JsonConvert.SerializeObject(model)}");
                    return null;
                }
                string IdDocumentContainerScans = trees.First().IdDocumentContainerScans;
                if (string.IsNullOrEmpty(IdDocumentContainerScans))
                {
                    _logger.Error($"UpdateDocumentIndexing not found document {JsonConvert.SerializeObject(trees.First())}");
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

                _logger.Debug($"UpdateDocumentIndexing 2496 - {JsonConvert.SerializeObject(dataCRUD)} \n\t result: {JsonConvert.SerializeObject(resultUpdate)} ");

                return resultUpdate;
            }
            catch (Exception e)
            {
                _logger.Error($"UpdateDocumentIndexing  {JsonConvert.SerializeObject(model)}", e);
                throw e;
            }
        }

        private async Task<WSEditReturn> AddQueueDocumentIndexing(DocumentIndexingQueueModel dataIndexingModel)
        {
            CreateQueueModel queueModel = _documentCommonBusiness.CreateSystemSchedule(dataIndexingModel, 18);
            return await _commonBusiness.CreateQueue(queueModel);
        }


        public async Task DeleteDocument(DocumentTreeMove item)
        {
            try
            {
                List<DocumentIndexingInfo> docs = await GetDocumentContainerForDownload(item.IdLogin, item.IdDocumentContainerScans);
                if (docs == null || docs.Count == 0)
                {
                    _logger.Error($"DeleteDocument  not found document on DB {JsonConvert.SerializeObject(item)}");
                    return;
                }

                DocumentIndexingQueueModel dataIndexingModel = new DocumentIndexingQueueModel();
                dataIndexingModel.FolderPath = docs.First().ScannedPath;
                dataIndexingModel.IdLogin = item.IdLogin;
                dataIndexingModel.TypeDocument = _PREFIX_NAME_FOLDER_INDEXING.ToUpper();
                dataIndexingModel.IdDocumentTree = docs.First().IdDocumentTree + "";
                dataIndexingModel.ActionOnDocument = "DELETE-DOCUMENT";
                dataIndexingModel.DocumentName = docs.First().ScannedFilename;
                await AddQueueDocumentIndexing(dataIndexingModel);
            }
            catch (Exception e)
            {
                _logger.Error($"DeleteDocument  {JsonConvert.SerializeObject(item)}", e);
            }
        }

        private async Task<List<DocumentIndexingInfo>> GetDocumentContainerForDownload(string userId, string idDocumentContainerScan)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = userId;
            baseData.IdApplicationOwner = "0";

            return await _documentService.GetDocumentIndexingById(baseData, idDocumentContainerScan);

        }

    }
}
