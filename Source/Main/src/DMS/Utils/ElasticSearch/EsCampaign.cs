using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsCampaign
    /// </summary>
    public class EsCampaign
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id
        {
            get
            {
                return IdSalesCampaignWizard;
            }
        }

        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int IdSalesCampaignWizard { get; set; }
        
        /// <summary>
        /// CreateDate
        /// </summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// CampaignNr
        /// </summary>
        public string CampaignNr { get; set; }

        /// <summary>
        /// CampaignName
        /// </summary>
        public string CampaignName { get; set; }

        /// <summary>
        /// Mandant
        /// </summary>
        public string Mandant { get; set; }

        /// <summary>
        /// Principal
        /// </summary>
        public string Principal { get; set; }

        /// <summary>
        /// QtyCountrys
        /// </summary>
        public int QtyCountrys { get; set; }

        /// <summary>
        /// IsMaster
        /// </summary>
        public bool IsMaster { get; set; }

        /// <summary>
        /// IsTrack
        /// </summary>
        public bool IsTrack { get; set; }

        /// <summary>
        /// IsInter
        /// </summary>
        public bool IsInter { get; set; }

        /// <summary>
        /// IsAsile
        /// </summary>
        public bool IsAsile { get; set; }

        /// <summary>
        /// PostageDate
        /// </summary>
        public string PostageDate { get; set; }

        /// <summary>
        /// CompletedDate
        /// </summary>
        public string CompletedDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public string UpdateDate { get; set; }


        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }
    }
}
