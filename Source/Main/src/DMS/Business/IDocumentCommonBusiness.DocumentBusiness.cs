using DMS.Models;
using DMS.Models.DMS;
using DMS.Service;
using DMS.ServiceModels;
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
    public class DocumentCommonBusiness : BaseBusiness, IDocumentCommonBusiness
    {
        private readonly IPathProvider _pathProvider;
        private readonly IDocumentService _documentService;
        private readonly IUniqueService _uniqueService;
        private readonly IDynamicDataService _dynamicDataService;

        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");
        public DocumentCommonBusiness(IHttpContextAccessor context,
                              IDocumentService documentService,
                              IPathProvider pathProvider,
                              IUniqueService uniqueService,
                              IDynamicDataService dynamicDataService) : base(context)
        {
            _pathProvider = pathProvider;
            _documentService = documentService;
            _uniqueService = uniqueService;
            _dynamicDataService = dynamicDataService;
        }

        public async Task<DocumentTreeGetData> TransformRequestToDocTreeGetData(GetDocumentTreeOptions options)
        {
            try
            {
                DocumentTreeGetData @params = ServiceDataRequest.ConvertToRelatedType(typeof(DocumentTreeGetData)) as DocumentTreeGetData;
                @params.IdLogin = string.IsNullOrEmpty(options.IdLogin) ? this.UserFromService.IdLogin : options.IdLogin;
                if (!string.IsNullOrEmpty(options.IdLogin))
                {
                    UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(@params.IdLogin, "");
                    if (us == null)
                    {
                        throw new Exception("User (Id:" + @params.IdLogin + ") not found");
                    }
                    @params.IdApplicationOwner = us.IdApplicationOwner;
                }
                else
                {
                    @params.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
                }

                @params.LoginLanguage = this.UserFromService.IdRepLanguage;
                @params.ShouldGetDocumentQuantity = false;

                return @params;
            }
            catch (Exception ex)
            {
                _logger.Error("GetDocumentTreeByUser (Indexing || EMAIL) options:" + JsonConvert.SerializeObject(options), ex);
                throw;
            }
        }

       
        public List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeGroupCompany(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
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
                    company.Children = BuildTreeMoreUser(comItem, firstComItem.IdSharingCompany.Value);
                    result.Add(company);
                }
            }
            return result;
        }

        private List<TreeNode<int, DocumentGroupingTreeModel>> BuildTreeMoreUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
        {
            var result = new List<TreeNode<int, DocumentGroupingTreeModel>>();
            var groupUser = data.GroupBy(x => x.IdLogin);
            if (groupUser.Any())
            {
                foreach (var userItem in groupUser)
                    result.Add(BuildTreeOneUser(userItem.ToList(), idDocumentTreeParent));
            }
            return result;
        }

        private TreeNode<int, DocumentGroupingTreeModel> BuildTreeOneUser(IEnumerable<DocumentGroupingTreeModel> data, int idDocumentTreeParent)
        {
            var currentUser = data.FirstOrDefault();
            var user = new TreeNode<int, DocumentGroupingTreeModel>
            {
                Data = new DocumentGroupingTreeModel
                {
                    CompanyName = currentUser.CompanyName,
                    DisplayName = currentUser.DisplayName,
                    GroupName = currentUser.DisplayName,
                    IdSharingCompany = currentUser.IdSharingCompany,
                    IdLogin = currentUser.IdLogin,
                    IsActive = true,
                    IsReadOnly = true,
                    IsNotModify = currentUser.IdLogin.Value.ToString() != this.UserFromService.IdLogin,
                    IdDocumentTree = currentUser.IdLogin.Value,
                    IdDocumentTreeParent = 2,// 2 is id of Email
                    IconName = "tree-user",
                    IsIndexingTree = true,
                    IdRepDocumentGuiType = currentUser.IdRepDocumentGuiType,
                    IsUser = true,
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
  
        public async Task<object> GetTreePath(string idDocumentTree, string userId, string idApplicationOwner)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            baseData.IdLogin = string.IsNullOrEmpty(userId) ? this.UserFromService.IdLogin : userId;
            baseData.IdApplicationOwner = string.IsNullOrEmpty(idApplicationOwner) ? this.UserFromService.IdApplicationOwner : idApplicationOwner;

            return await _documentService.GetTreePath(baseData, idDocumentTree);
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

        public string GetUploadFolder()
        {
            string path = _pathProvider.FileShare;
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            return path;
        }

        public CreateQueueModel CreateSystemSchedule(object dataQueue, int IdRepAppSystemScheduleServiceName)
        {

            var scheduleQueueData = new SystemScheduleQueueData
            {
                IdRepAppSystemScheduleServiceName = IdRepAppSystemScheduleServiceName
            };

            scheduleQueueData.JsonLog = JsonConvert.SerializeObject(dataQueue);
            scheduleQueueData.JsonLogJsonType = JsonConvert.SerializeObject(dataQueue);
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

        public string CreateJsonText(string key, object value, string startString = "{", string endString = "}")
        {
            var modelValue = JsonConvert.SerializeObject(value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            var jsonText = $@"""{key}"":{modelValue}";
            jsonText = startString + jsonText + endString;
            return jsonText;
        }

        public async Task<List<TreePermissionModel>> GetTreePermissionIdLogin(Dictionary<string, object> values)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            DynamicData saveData = new DynamicData
            {
                Data = baseData
            };
            values["MethodName"] = "SpAppWg002UserPermission";
            values["Object"] = "GetTreePermissionIdLogin";

            saveData.AddParams(values);
            var response = await _dynamicDataService.GetData(saveData, returnType: Constants.EDynamicDataGetReturnType.None);
            try
            {
                if (response != null)
                {
                    var array = (JArray)response;
                    if (array.Count > 0)
                    {
                        string rs = array[0].ToString();

                        return JsonConvert.DeserializeObject<List<TreePermissionModel>>(rs);
                    }
                }
            } catch(Exception e)
            {
                _logger.Error("error GetTreePermissionIdLogin", e);
            }
            
            return null;
        }


        public IEnumerable<DocumentGroupingTreeModel> PreSettingDocumentTree(string idLogin, IEnumerable<DocumentGroupingTreeModel> tree, bool isSuperAdmin, bool isAdmin)
        {
            List<DocumentGroupingTreeModel> treeModels = tree.ToList();
            foreach (DocumentGroupingTreeModel t in treeModels)
            {
                t.CanDelete = false;
                t.CanEdit = false;
                t.CanRead = false;
                t.CanShare = false;
                if (t.IsUser.HasValue && t.IsUser.Value == true)
                {
                    t.CanEdit = true;
                }
                if ((t.IdLogin.HasValue && (t.IdLogin.Value + "") == idLogin) || isSuperAdmin || isAdmin)
                {
                    t.CanDelete = true;
                    t.CanEdit = true;
                    t.CanRead = true;
                    t.CanShare = true;
                    continue;
                }
            }
            return treeModels.AsEnumerable();
        }

        public IEnumerable<DocumentGroupingTreeModel> AddTreePermissionToStructureTreeIndexing(bool isIndexing, string idLogin, IEnumerable<DocumentGroupingTreeModel> tree,
                                        List<TreePermissionModel> treePermission, bool isSuperAdmin, bool isAdmin)
        {
            string prefix = isIndexing ? "Indexing" : "Mail";
            int idRootTree = isIndexing ? 3 : 2;
            int idRepGuiType = isIndexing ? 5 : 6;

            tree = PreSettingDocumentTree(idLogin, tree, isSuperAdmin, isAdmin);
            List<DocumentGroupingTreeModel> treeModels = tree.ToList();            

            var permissions = treePermission.Where((p) => { return p.IdLogin == idLogin; });
            if (permissions != null || permissions.ToList().Count > 0)
            {
                var permissionsx = JsonConvert.DeserializeObject<List<TreePermissionModel>>(JsonConvert.SerializeObject(permissions));
                foreach (TreePermissionModel tt in permissionsx)
                {
                    treePermission.Remove(treePermission.Where((s) => { return s.IdMain == tt.IdMain;}).FirstOrDefault());
                }                
            }            

            List<DocumentGroupingTreeModel> sharedTreeModels = new List<DocumentGroupingTreeModel>();
            foreach (TreePermissionModel permission in treePermission)
            {
                DocumentGroupingTreeModel treeModel = JsonConvert.DeserializeObject<DocumentGroupingTreeModel>(JsonConvert.SerializeObject(permission));
                treeModel.IdDocumentTree = int.Parse(permission.IdMain);
                treeModel.IdDocumentRoot = 1;
                treeModel.IconName = "user-man-add";
                treeModel.IdDocumentTreeParent = idRootTree;
                treeModel.IdRepDocumentGuiType = idRepGuiType;
                treeModel.GroupName = permission.GroupName;
                treeModel.CanShare = (isSuperAdmin == true || isAdmin == true) ? true : false;
               
                string namePath     = permission.Path;
                string idTreePath   = permission.IdTreePath;
                if (namePath.StartsWith(prefix + "\\"))
                {
                    namePath = namePath.Substring((prefix + "\\").Length);
                }
                if (idTreePath.StartsWith(idRootTree + "\\"))
                {
                    idTreePath = idTreePath.Substring((idRootTree + "\\").Length);
                }
                List<string> arrSubPath = namePath.Split("\\").ToList();
                List<string> arrIdPath  = idTreePath.Split("\\").ToList();
                if (string.IsNullOrEmpty(arrSubPath.Last())) 
                    arrSubPath.RemoveAt(arrSubPath.Count - 1);
                if (string.IsNullOrEmpty(arrIdPath.Last()))
                    arrIdPath.RemoveAt(arrIdPath.Count - 1);

                if (arrSubPath.Count == 1)
                {
                    CheckUpdateRemoveItemTree(sharedTreeModels, treeModel, true);
                    continue;
                } else
                {
                    treeModel.IdDocumentTreeParent = int.Parse(arrIdPath.ElementAt(arrIdPath.Count-2));
                }

                int idTreeParent = idRootTree;
                for (int pos = 0; pos < arrSubPath.Count; pos++)
                {
                    DocumentGroupingTreeModel newTree = JsonConvert.DeserializeObject<DocumentGroupingTreeModel>(JsonConvert.SerializeObject(treeModel));                    
                    newTree.IdDocumentTree          = int.Parse(arrIdPath.ElementAt(pos));
                    newTree.IdDocumentTreeParent    = idTreeParent;                    
                    newTree.GroupName               = arrSubPath.ElementAt(pos);
                    newTree.CanDelete               = false;
                    newTree.CanEdit                 = false;
                    newTree.CanRead                 = false;
                    newTree.IdTreePermissionLogin   = "-1";
                    newTree.CanShare                = (isSuperAdmin == true || isAdmin == true) ? true : false;
                    CheckUpdateRemoveItemTree(sharedTreeModels, newTree, false);

                    idTreeParent = int.Parse(arrIdPath.ElementAt(pos));
                }
                
                CheckUpdateRemoveItemTree(sharedTreeModels, treeModel, true);
            }
            foreach(DocumentGroupingTreeModel t in sharedTreeModels)
            {
                var items = treeModels.Where((s) => { return s.IdDocumentTree == t.IdDocumentTree; });                
                if (items == null || items.ToList().Count == 0)
                {
                    t.CanShare = (isSuperAdmin == true || isAdmin == true) ? true : false;
                    treeModels.Add(t);
                }
            }
            
            return treeModels.AsEnumerable();
        }

        private void CheckUpdateRemoveItemTree(List<DocumentGroupingTreeModel> sharedTreeModels, DocumentGroupingTreeModel item, bool updateWhenExist)
        {
            var dupItems = sharedTreeModels.Where((t) => { return t.IdDocumentTree == item.IdDocumentTree; });
            if (dupItems == null || dupItems.ToList().Count == 0)
            {
                sharedTreeModels.Add(item);
                return;
            }
            if (updateWhenExist)
            {
                sharedTreeModels.Remove(dupItems.FirstOrDefault());
                sharedTreeModels.Add(item);
            }
            return;
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

        public async Task<string> DetectCommonFolderUser(string idLogin, string prefixTypeDocument)
        {
            UserFromService us = await _uniqueService.GetAllUserByIdOrEmail(idLogin, "");
            if (us == null)
            {
                _logger.Error($"Error (DetectCommonFolder) not found idLogin {idLogin}");
                throw new Exception($"not found idLogin {idLogin}");
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
                                                       , prefixTypeDocument, idLogin);
            return commonFolderUser;
        }

        public async Task<string> CreateCommonFolderUser(string idLogin, string prefixTypeDocument)
        {
            string commonFolderUser = await DetectCommonFolderUser(idLogin, prefixTypeDocument);
            string folderSharing = Path.Combine(_pathProvider.CustomerFileServer, commonFolderUser);
            
            if (!Directory.Exists(folderSharing))
            {
                Directory.CreateDirectory(folderSharing);
            }
            return folderSharing;
        }
    }
}
