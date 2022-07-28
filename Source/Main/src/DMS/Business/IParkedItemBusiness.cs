using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IParkedItemBusiness
    {
        /// <summary>
        /// GetParkedItemMenu
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <returns></returns>
        Task<IList<ParkedMenuItemModel>> GetParkedItemMenu(string accesstoken, string objectName);

        /// <summary>
        /// GetListParkedItemByModule
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <returns></returns>
        Task<CollectionParkedItemModel> GetListParkedItemByModule(string accesstoken, string objectName);

        /// <summary>
        /// GetListParkedItemById
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<CollectionParkedItemModel> GetParkedItemById(string accesstoken, string objectName, string id);

        /// <summary>
        /// SaveParkedItemMenu
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<bool> SaveParkedItemMenu(string accesstoken, List<ParkedMenuItemModel> data, string module_name);

        /// <summary>
        /// SaveParkedItemByModule
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<CollectionParkedItemModel> SaveParkedItemByModule(string accesstoken, EditParkedItemModel model);
    }    
}

