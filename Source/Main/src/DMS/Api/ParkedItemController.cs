using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Service;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using Newtonsoft.Json;
using DMS.Utils;
using Newtonsoft.Json.Serialization;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class ParkedItemController : BaseController
    {
        private readonly IParkedItemBusiness _parkedItemBusiness;

        public ParkedItemController(IParkedItemBusiness parkedItemBusiness)
        {
            _parkedItemBusiness = parkedItemBusiness;
        }

        // GET: api/parkeditem/GetParkedItemMenu
        [HttpGet]
        [Route("GetParkedItemMenu")]
        public async Task<object> GetParkedItemMenu(string module_name)
        {
            //throw new Exception("GetParkedItemMenu - Hoa Test: " + DateTime.Now);

            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            var result = _parkedItemBusiness.GetParkedItemMenu(accesstoken, module_name);

            return await result;
        }

        // GET: api/parkeditem/GetListParkedItemByModule
        /// <summary>
        /// GetListParkedItemByModule
        /// </summary>
        /// <param name="module_name">name of module</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetListParkedItemByModule")]
        public async Task<object> GetListParkedItemByModule(string module_name)
        {
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            var result = _parkedItemBusiness.GetListParkedItemByModule(accesstoken, module_name);

            return await result;
        }

        // GET: api/parkeditem/GetParkedItemById
        /// <summary>
        /// GetParkedItemById
        /// </summary>
        /// <param name="module_name">name of module</param>
        /// <param name="id">id of parked item</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetParkedItemById")]
        public async Task<object> GetParkedItemById(string module_name, string id)
        {
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            var result = _parkedItemBusiness.GetParkedItemById(accesstoken, module_name, id);

            return await result;
        }

        // Post: api/parkeditem/SaveParkedItemByModule
        /// <summary>
        /// SaveParkedItemByModule
        /// </summary>
        /// <param name="data">
        /// Edit Parked Item Data
        /// pass properties such as: ObjectNr(33), ModuleName(Parked Customer), ModuleType(44), 
        /// Description, JsonSettings((5489,5,6547,4586,2145)), IsActive(1 or 0)
        /// </param>
        /// <returns></returns>
        [HttpPost]
        [Route("SaveParkedItemByModule")]
        public async Task<object> SaveParkedItemByModule([FromBody]EditParkedItemModel model)
        {
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            var result = _parkedItemBusiness.SaveParkedItemByModule(accesstoken, model);

            return await result;
        }

        // Post: api/parkeditem/SaveParkedMenuItem
        /// <summary>
        /// SaveParkedMenuItem
        /// </summary>
        /// <param name="data">
        /// Edit Parked Menu Item Data
        /// pass properties such as: IdSettingsWidgetItems(38), IsActive("true" for active or "false" for inactive)
        /// </param>
        /// <returns></returns>
        [HttpPost]
        [Route("SaveParkedMenuItem")]
        public async Task<object> SaveParkedMenuItem([FromBody]List<ParkedMenuItemModel> model, string module_name)
        {
            string authorization = Request.Headers["Authorization"];
            string accesstoken = authorization.Replace("Bearer ", "");
            var result = _parkedItemBusiness.SaveParkedItemMenu(accesstoken, model, module_name);

            return await result;
        }
    }
}
