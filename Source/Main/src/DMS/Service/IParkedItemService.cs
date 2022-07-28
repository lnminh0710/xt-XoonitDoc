using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public interface IParkedItemService
    {
        /// <summary>
        /// GetParkedItemMenu
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<ParkedMenuItemModel>> GetParkedItemMenu(ParkedItemData data);

        /// <summary>
        /// GetListParkedItemByModule
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<CollectionParkedItemModel> GetListParkedItem(ParkedItemData data);


        /// <summary>
        /// SaveParkedItemByModule
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> SaveParkedItemByModule(UpdateParkedItemData data);

        /// <summary>
        /// SaveParkedMenuItem
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<bool> SaveParkedMenuItem(List<EditParkedMenuItemData> data, string moduleName);
    }    
}

