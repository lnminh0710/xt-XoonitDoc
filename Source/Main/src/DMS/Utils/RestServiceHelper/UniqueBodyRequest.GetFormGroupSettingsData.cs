namespace DMS.Utils.RestServiceHelper
{
    /// <summary>
    /// GetFormGroupSettingsData
    /// </summary>
    public class GetFormGroupSettingsData : Data
    {
        /// <summary>
        /// IdRepDocumentGuiType
        /// </summary>
        public string IdRepDocumentGuiType { get; set; }

        /// <summary>
        /// IdBranches
        /// </summary>
        public int? IdBranches { get; set; }

        /// <summary>
        /// IdMainDocument
        /// </summary>
        public string IdMainDocument { get; set; }

        /// <summary>
        /// IdDocumentContainerScans
        /// </summary>
        public string IdDocumentContainerScans { get; set; }

        public string IdPerson { get; set; }
    }
}
