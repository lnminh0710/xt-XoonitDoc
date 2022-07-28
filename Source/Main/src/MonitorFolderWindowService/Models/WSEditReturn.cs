using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonitorFolderWindowService.Models
{
    /// <summary>
    /// WSEditReturn
    /// </summary>
    public class WSEditReturn
    {
        private string _returnID = "";

        /// <summary>
        /// ReturnID
        /// </summary>
        public string ReturnID
        {
            get
            {
                return _returnID;
            }
            set
            {
                if (!string.IsNullOrEmpty(value))
                    _returnID = value;
            }
        }

        /// <summary>
        /// StoredName
        /// </summary>
        public string StoredName { get; set; }

        /// <summary>
        /// Message 
        /// </summary>
        public string EventType { get; set; }

        /// <summary>
        /// SQLStoredMessage
        /// </summary>
        public string SQLStoredMessage { get; set; }
    }
}
