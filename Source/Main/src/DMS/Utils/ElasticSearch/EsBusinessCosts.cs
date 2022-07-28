using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsBusinessCost
    /// </summary>
    public class EsBusinessCost
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id
        {
            get
            {
                return IdBusinessCosts;
            }
        }

        /// <summary>
        /// IdBusinessCosts
        /// </summary>
        public int IdBusinessCosts { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        /// BusinessCosts
        /// </summary>
        public string BusinessCosts { get; set; }

        /// <summary>
        /// CurrencyCode
        /// </summary>
        public string CurrencyCode { get; set; }

        /// <summary>
        /// InvoiceNr
        /// </summary>
        public string InvoiceNr { get; set; }

        /// <summary>
        /// InvoiceDate
        /// </summary>
        public string InvoiceDate { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public string Amount { get; set; }

        /// <summary>
        /// VAT1
        /// </summary>
        public string VAT1 { get; set; }

        /// <summary>
        /// VatAmount1
        /// </summary>
        public string VatAmount1 { get; set; }

        /// <summary>
        /// VAT2
        /// </summary>
        public string VAT2 { get; set; }

        /// <summary>
        /// VatAmount2
        /// </summary>
        public string VatAmount2 { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// DoneDate
        /// </summary>
        public string DoneDate { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public string UpdateDate { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }
}
