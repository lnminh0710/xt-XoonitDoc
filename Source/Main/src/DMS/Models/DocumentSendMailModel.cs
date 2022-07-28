using System.Collections.Generic;

namespace DMS.Models
{
    public class DocumentSendMailModel
    {
        public string ToEmail { get; set; }

        public string Subject { get; set; }

        public string Body { get; set; }

        public List<string> Attachments { get; set; }
    }
}
