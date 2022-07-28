using System;

namespace DMS.Models
{
    /// <summary>
    /// GlobalModule
    /// </summary>
    public class ModuleSettingModel
    {
        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public int IdSettingsModule { get; set; }

        /// <summary>
        /// IdLogin
        /// </summary>
        public int IdLogin { get; set; }

        /// <summary>
        /// ObjectNr
        /// </summary>
        public string ObjectNr { get; set; }

        /// <summary>
        /// ModuleName
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// ModuleType
        /// </summary>
        public string ModuleType { get; set; }

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
        public bool IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public DateTime CreateDate { get; set; }
    }

    /// <summary>
    /// ModuleToPersonTypeModel
    /// </summary>
    public class ModuleToPersonTypeModel
    {
        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public int? IdSettingsGUI { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public string IdRepPersonType { get; set; }

    }
}
