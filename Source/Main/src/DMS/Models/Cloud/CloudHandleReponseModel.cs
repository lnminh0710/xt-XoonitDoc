using System.Collections.Generic;
using DMS.Utils;

namespace DMS.Models.DMS.Cloud
{
   
    public class CloudHandleReponseModel
    {
        public string ResponseMessage { get; set; }
                
        public bool IsExpiredToken { get; set; }

        public bool IsSuccessRequest { get; set; }

        public string ContentResponse { get; set; }

        public int StatusCode { get; set; }

        public bool IsInvalidDataRequest { get; set; }

        public bool IsCloudError { get; set; }
    }

    public class StatusChangeCloudReturnModel
    {
        public WSEditReturn WSEditReturn { get; set; }
        public OAuthTokens OAuthTokens { get; set; }
    }
}
