using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsSaleOrder
    /// </summary>
    public class EsSaleOrder
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// IdSalesOrder
        /// </summary>
        public int IdSalesOrder { get; set; }

        /// <summary>
        /// FirstName
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// LastName
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        /// GrossAmount
        /// </summary>
        public string GrossAmount { get; set; }

        /// <summary>
        /// PaidAmount
        /// </summary>
        public string PaidAmount { get; set; }

        /// <summary>
        /// OpenAmount
        /// </summary>
        public string OpenAmount { get; set; }

        /// <summary>
        /// IsPaid
        /// </summary>
        public bool? IsPaid { get; set; }

        /// <summary>
        /// MEDIACODE
        /// </summary>
        public string MEDIACODE { get; set; }

        /// <summary>
        /// OrderDate
        /// </summary>
        public string OrderDate { get; set; }

        /// <summary>
        /// InvoiceNr
        /// </summary>
        public string InvoiceNr { get; set; }

        /// <summary>
        /// LoginName
        /// </summary>
        public string LoginName { get; set; }

        /// <summary>
        /// CurrencyCode
        /// </summary>
        public string CurrencyCode { get; set; }

        /// <summary>
        /// CurrencyCode
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// PDF
        /// </summary>
        public string PDF { get; set; }

        /// <summary>
        /// Track
        /// </summary>
        public string Track { get; set; }

        /// <summary>
        /// Blocked
        /// </summary>
        public string Blocked { get; set; }

        /// <summary>
        /// SolicitLevel
        /// </summary>
        public string SolicitLevel { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }
    }
}
