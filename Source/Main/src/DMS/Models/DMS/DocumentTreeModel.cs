using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentTreeModel
    {
        public int IdDocumentTree { get; set; }

        public int? IdDocumentTreeParent { get; set; }

        public int? IdRepDocumentGuiType { get; set; }

        public string GroupName { get; set; }

        public int SortingIndex { get; set; }

        public string IconName { get; set; }

        public int Quantity { get; set; }
        public int QuantityParent { get; set; }

        public bool IsActive { get; set; }

        public bool IsReadOnly { get; set; }
    }

    public class DocumentGroupingTreeModel : DocumentTreeModel
    {
        public int? IdDocumentParentAfterCallApi { get; set; }
        
        public int IdDocumentRoot { get; set; }
        public int? IdLogin { get; set; }
        public string DisplayName { get; set; }
        public int? IdSharingCompany { get; set; }
        public string CompanyName { get; set; }
        public bool IsNotModify { get; set; }
        public bool IsIndexingTree {get; set;}
        public bool? IsCompany { get; set;}
        public bool? IsUser { get; set; }

        public bool? CanRead { get; set; }
        public bool? CanEdit { get; set; }
        public bool? CanDelete { get; set; }

        public bool CanShare { get; set; }

        public string IdTreePermissionLogin { get; set; }

        public DocumentGroupingTreeModel()
        {
            CanRead = false;
            CanEdit = false;
            CanDelete = false;
            CanShare = false;
        }
    }

    public class GetDocumentTreeOptions
    {
        public bool ShouldGetDocumentQuantity { get; set; }
        public string IdPerson { get; set; }
        public string IsSearchForEmail { get; set; }
        public string IdLogin { get; set; }
        public string IsProcessingModule { get; set; }
    }

    public class DeleteDocumentResultModel
    {
        public IEnumerable<IdMainDocumentResult> MainDocument { get; set; }
        public IEnumerable<IdMainDocumentPersonResult> MainDocumentPerson { get; set; }
    }

    public class DocumentTreeModelViewModel
    {
        public int IdDocument { get; set; }

        public int? IdDocumentParent { get; set; }

        public int IdDocumentType { get; set; }

        public string Name { get; set; }

        public int Order { get; set; }

        public string IconName { get; set; }

        public string Path { get; set; }

    }

    public class DocumentTreePathModel
    {
        public string DocPath { get; set; }
    }

    public class DocumentTreeInfo
    {
        public string IdDocumentTree { get; set; }
        public string IdDocumentTreeParent { get; set; }
        public string GroupName { get; set; }
        public string DocPath { get; set; }
        public string IdRepDocumentGuiType { get; set; }
        public string FullTreePath { get; set; }

    }

    public class ChangeDocumentTreeModel
    {
        public int IdDocumentTree { get; set; }

        public int? IdDocumentTreeParent { get; set; }

        public int? IdRepDocumentGuiType { get; set; }

        public int? IdDocumentContainerScans { get; set; }
    }

    public class DocumentIndexingInfo
    {
        public string IdDocumentContainerScans { get; set; }
        public string IdDocumentTree { get; set; }
        public string IdRepDocumentGuiType { get; set; }
        public string ScannedPath { get; set; }
        public string ScannedFilename { get; set; }
        
    }

    public class TreePermissionModel
    {
        public string IdTreePermissionLogin { get; set; }
        public string PermissionType { get; set; }
        public string IdPermission { get; set; }
        public string IdMain { get; set; }
        public int CanRead { get; set; }
        public int CanEdit { get; set; }
        public int CanDelete { get; set; }

        public string GroupName { get; set; }
        public string Path { get; set; }

        public string IdLogin { get; set; }
        public string DisplayName { get; set; }
        public string IdSharingCompany { get; set; }
        public string CompanyName { get; set; }

        public string IdTreePath { get; set; }
    }

    public class ImportFolderCompanyInfo
    {
        public string IdSharingCompany { get; set; }
        public string Company { get; set; }
        public string ImportFolder { get; set; }
    }

    public class DocumentTreeMailMove
    {
        public string IdDocumentTree { get; set; }
        public string IdDocumentTreeOld { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdLogin { get; set; }
        public string IdLoginOld { get; set; }
        public string IdRepDocumentGuiType { get; set; }

    }

    public class JSONDocumentTreeMailMove
    {
        public List<DocumentTreeMailMove> DocumentTree { get; set; }        
    }

    public class DocPathModel
    {
        public string DocPath { get; set; }
    }

    public class JSONDocumentTreeMove
    {
        public List<DocumentTreeMove> DocumentContainerScans { get; set; }
    }

    public class DocumentTreeMove
    {
        public string IsDeleted { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string IdLogin { get; set; }
        public string IdRepDocumentGuiType { get; set; }

    }
}
