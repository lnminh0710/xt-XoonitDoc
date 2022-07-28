
using DMS.Models.DMS;
using DMS.Models.DMS.Cloud;
using Microsoft.Graph;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace DMS.Utils.Cloud
{
    public static class DropboxHandleErrors
    {        
        public static bool IsScuccessStatusCode(this HttpStatusCode responseCode)
        {
            var numericResponse = (int)responseCode;

            const int statusCodeOk = (int)HttpStatusCode.OK;

            const int statusCodeBadRequest = (int)HttpStatusCode.BadRequest;

            return numericResponse >= statusCodeOk &&
                   numericResponse < statusCodeBadRequest;
        }

        public static bool IsSuccessful(this IRestResponse response)
        {
            if (response == null) return false;
            return IsScuccessStatusCode(response.StatusCode) && response.ResponseStatus == RestSharp.ResponseStatus.Completed;
        }

        public static CloudHandleReponseModel DetectResponseMessage(this IRestResponse response)
        {
            CloudHandleReponseModel handleModel = new CloudHandleReponseModel();
            handleModel.IsExpiredToken = false;
            handleModel.IsInvalidDataRequest = false;
            handleModel.IsCloudError = false;
            handleModel.IsSuccessRequest = false;
            if (response.ErrorException != null)
            {
                //response.i
            }
            string contentType = response.ContentType;
            if (string.IsNullOrEmpty(contentType))
            {
                contentType = response.Content;
            }
            handleModel.ContentResponse = contentType;
            handleModel.StatusCode = (int)response.StatusCode;

            if (handleModel.StatusCode >= 400 && handleModel.StatusCode < 500)
            {
                handleModel.IsSuccessRequest = false;
            }
            else if (handleModel.StatusCode >= 500)
            {
                handleModel.IsCloudError = true;
            } else
            {
                handleModel.IsSuccessRequest = true;
            }

            if ((int)response.StatusCode == (int)HttpStatusCode.BadRequest)
            {
                handleModel.IsInvalidDataRequest = true;
                return handleModel;
            }

            if ((int)response.StatusCode == (int)HttpStatusCode.Unauthorized)
            {                
                if (contentType.IndexOf("expired_access_token") > -1 || contentType.IndexOf("expired_access_token") > -1)
                {
                    handleModel.IsExpiredToken = true;
                }
            }            

            return handleModel;
        }

    }
}
