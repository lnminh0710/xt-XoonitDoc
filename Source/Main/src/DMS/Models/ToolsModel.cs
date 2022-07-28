using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    #region Tools Models
    /// <summary>
    /// ScanDispatcherPoolModel
    /// </summary>
    public class ScanDispatcherPoolModel
    {
        /// <summary>
        /// ScanDispatcherPool
        /// </summary>
        public IList<ScanDispatcherPool> ScanDispatcherPools { get; set; }
    }

    public class ScanAssignmentUserLanguageCountry {
        /// <summary>
        /// IdPerson
        /// </summary>
        public int IdPerson { get; set; }
        /// <summary>
        /// IdScansContainerDispatchers
        /// </summary>
        public int IdScansContainerDispatchers { get; set; }
        /// <summary>
        /// IdScansContainer
        /// </summary>
        public int IdScansContainer { get; set; }
    }

    /// <summary>
    /// ScanUndispatcherPoolModel
    /// </summary>
    public class ScanUndispatcherPoolModel
    {
        /// <summary>
        /// ScanUndispatcherPool
        /// </summary>
        public IList<ScanUndispatcherPool> ScanUndispatcherPool { get; set; }
    }

    /// <summary>
    /// ScanDispatcherPool
    /// </summary>
    public class ScanDispatcherPool
    {
        /// <summary>
        /// IdScansContainer
        /// </summary>
        public int? IdScansContainer { get; set; }

        /// <summary>
        /// IdRepScansContainerType
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// DoneDate
        /// </summary>
        public string DoneDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// MarkActive
        /// </summary>
        public bool? MarkActive { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

    }

    /// <summary>
    /// ScanUndispatcherPool
    /// </summary>
    public class ScanUndispatcherPool
    {
        /// <summary>
        /// IdScansContainerDispatchers
        /// </summary>
        public int? IdScansContainerDispatchers { get; set; }
    }

    /// <summary>
    /// ScanAssignmentPool
    /// </summary>
    public class ScanAssignmentPool
    {
        /// <summary>
        /// IdScansContainerDispatchers
        /// </summary>
        public int? IdScansContainerDispatchers { get; set; }

        /// <summary>
        /// IdRepAssignedMethods
        /// </summary>
        public int? IdRepAssignedMethods { get; set; }

        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public int? IdCountrylanguage { get; set; }

        /// <summary>
        /// IdScansContainerAssignment
        /// </summary>
        public int? IdScansContainerAssignment { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }    
    }

    /// <summary>
    /// ScanAssignmentUserLogin
    /// </summary>
    public class ScanAssignmentUserLogin
    {
        /// <summary>
        /// IdLogin
        /// </summary>
        public int? IdLogin { get; set; }

        /// <summary>
        /// Gets or sets the quantity.
        /// </summary>
        /// <value>The quantity.</value>
        public int? Quantity { get; set; }
    }

    /// <summary>
    /// ScanAssignmentPoolUserModel
    /// </summary>
    public class ScanAssignmentPoolUserModel
    {
        /// <summary>
        /// ScanAssignmentPools
        /// </summary>
        public IList<ScanAssignmentPool> ScanAssignmentPools { get; set; }

        /// <summary>
        /// ScanAssignmentUserLogins
        /// </summary>
        public IList<ScanAssignmentUserLogin> ScanAssignmentUserLogins { get; set; }
    }

    #endregion

    #region [Matching Tools]

    /// <summary>
    /// MatchingModel
    /// </summary>
    public class MatchingModel
    {
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get; set; }
    }

    #endregion

}
