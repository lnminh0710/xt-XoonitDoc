using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models
{
    /// <summary>
    /// ParkedItem
    /// </summary>
    public class EditParkedItemModel
    {
        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// ModuleType
        /// </summary>
        public string ModuleType { get; set; }

        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public string IdSettingsModule { get; set; }

    }
}
