using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;

namespace DMS.Utils
{
    /// <summary>
    /// ResultActionFilter
    /// </summary>
    public class ResultActionFilter : ActionFilterAttribute
    {
        ///// <summary>
        ///// OnActionExecuting
        ///// </summary>
        ///// <param name="context"></param>
        //public override void OnActionExecuting(ActionExecutingContext context)
        //{
        //    base.OnActionExecuting(context);
        //}

        /// <summary>
        /// OnActionExecuted
        /// </summary>
        /// <param name="context"></param>
        public override void OnActionExecuted(ActionExecutedContext context)
        {
            var response = new ApiResultResponse();

            if (context.Result != null)
            {
                try
                {
                    if(((ObjectResult)(context.Result)).StatusCode.HasValue
                        && ((ObjectResult)(context.Result)).StatusCode.Value >= 400
                        && ((ObjectResult)(context.Result)).StatusCode.Value < 500)
                    {
                        response.StatusCode = ApiMethodResultId.InvaldRequest;
                    } else
                    {
                        response.StatusCode = ApiMethodResultId.Success;
                    }
                }
                catch(Exception)
                {
                    response.StatusCode = ApiMethodResultId.Success;
                }
                response.Item = ((ObjectResult)(context.Result)).Value;
            }
            else
            {
                response.StatusCode = ApiMethodResultId.UnexpectedError;
            }
            context.Result = new ObjectResult(response);
            base.OnActionExecuted(context);
        }

        ///// <summary>
        ///// OnResultExecuting
        ///// </summary>
        ///// <param name="context"></param>
        //public override void OnResultExecuting(ResultExecutingContext context)
        //{
        //    base.OnResultExecuting(context);
        //}

        ///// <summary>
        ///// OnResultExecuted
        ///// </summary>
        ///// <param name="context"></param>
        //public override void OnResultExecuted(ResultExecutedContext context)
        //{           
        //    base.OnResultExecuted(context);
        //}
    }
}
