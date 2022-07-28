using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    /// <summary>
    /// Global Setting model
    /// </summary>
    public class PageSettingModel
    {
        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public string IdSettingsGUI { get; set; }

        /// <summary>
        /// IdSettingsGlobal
        /// </summary>
        public int? IdSettingsPage { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// PageName
        /// </summary>
        public string PageName { get; set; }

        /// <summary>
        /// PageType
        /// </summary>
        public string PageType { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// JsonSettings
        /// </summary>
        public string JsonSettings { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

    }
}
