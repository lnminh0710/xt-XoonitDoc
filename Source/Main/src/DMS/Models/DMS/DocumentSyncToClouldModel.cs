using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class DocumentSyncToClouldModel
    {
        public string Id { get; set; }
                
        public string FileName { get; set; }
        public string Folder { get; set; }
        public dynamic Category { get; set; }
        public dynamic CreatedDate { get; set; }

        public int UserId { get; set; }

        public bool IsSyncToGoogleDrive { get; set; }

        public bool IsSyncToDropbox { get; set; }

        public bool IsSyncToMyCoud { get; set; }

        public bool IsSyncToOneDrive { get; set; }

        public string ErrorSync { get; set; }
    }
}
