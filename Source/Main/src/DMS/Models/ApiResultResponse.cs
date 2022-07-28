using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models
{
    /// <summary>
    /// ApiResultResponse
    /// </summary>
    public class ApiResultResponse  
    {
        /// <summary>
        /// StatusCode
        /// </summary>
        public ApiMethodResultId StatusCode { get; set; }

        /// <summary>
        /// ResultDescription
        /// </summary>
        public string ResultDescription { get; set; }

        /// <summary>
        /// Item
        /// </summary>
        public object Item { get; set; }
    }
}
