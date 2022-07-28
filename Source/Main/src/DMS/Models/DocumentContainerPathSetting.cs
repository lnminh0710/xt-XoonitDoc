using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace DMS.Models
{
    /// <summary>
    /// DocumentContainerPathSetting
    /// </summary>
    public class DocumentContainerPathSetting
    {
        /// <summary>
        /// IdDocumenstPathSettings
        /// </summary>
        public int IdDocumenstPathSettings { get; set; }

        /// <summary>
        /// IdRepDocumentContainerFilesType
        /// </summary>
        public int IdRepDocumentContainerFilesType { get; set; }

        /// <summary>
        /// DriveName
        /// </summary>
        public string DriveName { get; set; }

        /// <summary>
        /// PathFolder
        /// </summary>
        public string PathFolder { get; set; }

        /// <summary>
        /// IsMainDocument
        /// </summary>
        public bool IsMainDocument { get; set; }
    }
    
}
