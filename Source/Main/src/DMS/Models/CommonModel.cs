using System;
using System.Collections.Generic;
using DMS.Models.DMS.ViewModels;

namespace DMS.Models
{
    /// <summary>
    /// CustomerMatchedModel
    /// </summary>
    public class CustomerMatchedModel
    {
        public long IdPerson { get; set; }

        /// <summary>
        /// FirstName
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// LastName
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public string Zip { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }
    }

    /// <summary>
    /// CreateQueueModel
    /// </summary>
    public class CreateQueueModel
    {
        /// <summary>
        /// IdRepAppSystemScheduleServiceName
        /// </summary>
        public int IdRepAppSystemScheduleServiceName { get; set; }

        /// <summary>
        /// JsonText
        /// </summary>
        public string JsonText { get; set; }
    }

    /// <summary>
    /// DeleteQueuesModel
    /// </summary>
    public class DeleteQueuesModel
    {
        /// <summary>
        /// QueuesId
        /// </summary>
        public string QueuesId { get; set; }
    }

    public class IdMainDocumentResult
    {
        public string IdMainDocument { get; set; }
    }

    public class IdMainDocumentPersonResult
    {
        public string IdMainDocumentPerson { get; set; }
    }

    public class IdPersonResult
    {
        public int? IdPerson;
    }

    public class SaveScanSettingModel
    {
        public bool IsActive { get; set; }
        public string JSONScanSettings { get; set; }
        public string IdSettingsScans { get; set; }

    }

    public class SaveDocumentResultModel
    {
        public bool IsUpdate { get; set; }
        public string IdDocumentContainerScans { get; set; }
        public string ElasticSearchIndexName { get; set; }
        public IEnumerable<IdPersonResult> IdPersons { get; set; }
        public IEnumerable<IdMainDocumentResult> IdMainDocuments { get; set; }
        public IEnumerable<IdMainDocumentPersonResult> IdPersonsFormat { get; set; }
    }

    public class AgGridViewModel<T> where T : class
    {
        public IEnumerable<T> Data { get; set; }

        public IEnumerable<ColumnDefinitionViewModel> Columns { get; set; }

        public int TotalResults { get; set; }

        public AgGridViewModel(IEnumerable<T> data, IEnumerable<ColumnDefinitionViewModel> columnDefinitions, int totalRecords)
        {
            Data = data;
            Columns = columnDefinitions;
            TotalResults = totalRecords;
        }
    }
    public class ScheduleQueue
    {
        /// <summary>
        /// IdRepAppSystemScheduleServiceName
        /// </summary>
        public int IdRepAppSystemScheduleServiceName { get; set; }

        /// <summary>
        /// IdAppSystemScheduleQueue
        /// </summary>
        public long IdAppSystemScheduleQueue { get; set; }

        ///// <summary>
        ///// IdAppSystemSchedule
        ///// </summary>
        //public long IdAppSystemSchedule { get; set; }

        /// <summary>
        /// JsonLog
        /// </summary>
        public string JsonLog { get; set; }

        /// <summary>
        /// StartDateTime
        /// </summary>
        public DateTime? StartDateTime { get; set; }

        public object Result { get; set; }

        public bool IsSuccess { get; set; }

        public string IdLogin { get; set; }
    }


}
