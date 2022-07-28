using System;

namespace DMS.Models
{
    public class UploadFileResult
    {
        public long Size { get; set; }
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public string RelativePath { get; set; }
        public string FullFileName { get; set; }
    }
}
