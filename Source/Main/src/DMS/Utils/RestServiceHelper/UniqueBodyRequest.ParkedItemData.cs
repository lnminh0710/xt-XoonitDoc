using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class ParkedItemData : Data
    {
        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }

    }

    public class NewParkedItemData : Data
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

    }

    public class UpdateParkedItemData : NewParkedItemData
    {
        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public string IdSettingsModule { get; set; }

    }

    public class EditParkedMenuItemData : Data
    {
        /// <summary>
        /// IdSettingsWidgetItems
        /// </summary>
        public string IdSettingsWidgetItems { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

    }

    public class DeleteParkedMenuItemData : Data
    {
        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

    }
}
