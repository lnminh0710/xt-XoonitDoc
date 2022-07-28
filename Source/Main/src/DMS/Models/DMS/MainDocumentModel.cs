using DMS.Models.DMS;

namespace DMS.Models
{
    public class MainDocumentModel
    {
        public string IdMainDocument { get; set; }
        public MainDocumentTreeModel MainDocumentTree { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string SearchKeyWords { get; set; }
        public string ToDoNotes { get; set; }
        public string IsActive { get; set; }
        public string IsToDo { get; set; }
    }

    public class MainDocumentTreeModel
    {
        public string IdDocumentTree { get; set; }
        public DocumentTreeModelViewModel OldFolder { get; set; }
        public DocumentTreeModelViewModel NewFolder { get; set; }
    }

    public class MainDocumentNotesModel
    {
        public string IdMainDocument { get; set; }
        public string IdMainDocumentNotes { get; set; }
        public string LoginName { get; set; }
        public string Notes { get; set; }
        public string Date { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string IdLogin { get; set; }
        public string Editing { get; set; }
        public string Removeable { get; set; }
        public string Cancelable { get; set; }

    }
}
