using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// EsCampaignMediaCode
    /// </summary>
    public class EsCampaignMediaCode
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id
        {
            get
            {
                return IdSalesCampaignMediaCode;
            }
        }

        /// <summary>
        /// IdSalesCampaignMediaCode
        /// </summary>
        public int IdSalesCampaignMediaCode { get; set; }

        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// IdSalesCampaignWizard
        /// </summary>
        public int IdSalesCampaignWizard { get; set; }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }
    }
}
