using System.Collections.Generic;

namespace DMS.Models.DMS
{
   
    public class FileExplorerModel
    {
        public string Path { get; set; }
                
        public string Value { get; set; }

        public string Extension { get; set; }

        public bool IsFile { get; set; }

        public List<FileExplorerModel> Children { get; set; }

        public bool IsEmpty { get; set; }
    }

    public class FolderInputModel
    {
        public string Action { get; set; }
        public string ParentFolder { get; set; }
        public string FromFolder { get; set; }

        public string NewFolder { get; set; }
        public string OrginalFile { get; set; }
        public string NewFile { get; set; }

    }

}
