using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System;
using System.Net;
using DMS.Models;
using Microsoft.AspNetCore.Connections;

namespace DMS.Utils
{
    public class CustomExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            HttpStatusCode status = HttpStatusCode.InternalServerError;
            HttpResponse response = context.HttpContext.Response;
            string message = "Server error occurred.";

            var exceptionType = context.Exception.GetType();
            var content = context.Exception.StackTrace;
            if (exceptionType == typeof(UnauthorizedAccessException))
            {
                message = "Unauthorized Access";
                status = HttpStatusCode.Unauthorized;
            }
            else if (exceptionType == typeof(NotImplementedException))
            {
                message = "A server error occurred: NotImplementedException.";
                status = HttpStatusCode.NotImplemented;
            }
            else if (exceptionType == typeof(OperationCanceledException) || exceptionType == typeof(ConnectionResetException))
            {
                message = "Request was cancelled";
                status = HttpStatusCode.BadRequest;
                response.WriteAsync(message);
                return;
            }
            else
            {
                message = context.Exception.Message;
                content = context.Exception.Data["content"] + string.Empty;
            }

            context.ExceptionHandled = true;
            response.StatusCode = (int)status;
            response.ContentType = "application/json";

            var apiResultResponse = new ApiResultResponse()
            {
                StatusCode = ApiMethodResultId.UnexpectedError,
                ResultDescription = message + " " + content
            };
            var result = JsonConvert.SerializeObject(apiResultResponse);

            response.WriteAsync(result);
        }
    }
}
