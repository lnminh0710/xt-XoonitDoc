using Newtonsoft.Json;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Service;
using DMS.Utils;

namespace DMS.Business
{
    public class ParkedItemBusiness : IParkedItemBusiness
    {
        private readonly IParkedItemService _parkedItemService;

        public ParkedItemBusiness(IParkedItemService parkedItemService)
        {
            _parkedItemService = parkedItemService;
        }

        /// <summary>
        /// GetListParkedItemByModule
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <returns></returns>
        public async Task<CollectionParkedItemModel> GetListParkedItemByModule(string accesstoken, string objectName)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
            ParkedItemData data = new ParkedItemData
            {
                Object = objectName,
                IdLogin = userFromService.IdLogin,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                LoginLanguage = userFromService.IdRepLanguage
            };
            var result = await _parkedItemService.GetListParkedItem(data);
            return result;
        }

        /// <summary>
        /// GetListParkedItemById
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<CollectionParkedItemModel> GetParkedItemById(string accesstoken, string objectName, string id)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
            ParkedItemData data = new ParkedItemData
            {
                Object = objectName,
                IdLogin = userFromService.IdLogin,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                LoginLanguage = userFromService.IdRepLanguage,
                Mode= "FilterByID",
                GUID = id
            };
            var result = await _parkedItemService.GetListParkedItem(data);
            return result;
        }

        /// <summary>
        /// GetParkedItemMenu
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="objectName"></param>
        /// <returns></returns>
        public async Task<IList<ParkedMenuItemModel>> GetParkedItemMenu(string accesstoken, string objectName)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
            ParkedItemData data = new ParkedItemData
            {
                Object = objectName,
                IdLogin = userFromService.IdLogin,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                LoginLanguage = userFromService.IdRepLanguage
            };
            var result = await _parkedItemService.GetParkedItemMenu(data);
            if (result != null)
            {
                // check if there is any available item or not
                var availableParkedMenuItems = result.FirstOrDefault(p => p.IsAvailable);
                // if not, check default items
                if (availableParkedMenuItems == null)
                {
                    var defaultParkedMenuItems = result.Where(p => p.IsDefault || p.FieldName == "IdPerson");
                    // in case there are default items, then save them to DB
                    if (defaultParkedMenuItems != null && defaultParkedMenuItems.Count() > 0)
                    {
                        List<EditParkedMenuItemData> updateData = new List<EditParkedMenuItemData>();
                        foreach (var item in defaultParkedMenuItems)
                        {
                            updateData.Add(new EditParkedMenuItemData
                            {
                                IdApplicationOwner = userFromService.IdApplicationOwner,
                                IdLogin = userFromService.IdLogin,
                                LoginLanguage = userFromService.IdRepLanguage,
                                IdSettingsWidgetItems = item.IdSettingsWidgetItems.ToString(),
                                IsActive = true.ToString()
                            });
                        }

                        var resultUpdate = await _parkedItemService.SaveParkedMenuItem(updateData, objectName);
                        if (resultUpdate)
                        {
                            defaultParkedMenuItems.Select(c => { c.IsAvailable = true; c.IsChecked = true; return c; }).ToList();
                            return result;
                        }
                        else
                            return null;
                    }
                }
                else
                    result.ToList().ForEach(p => { p.IsChecked = p.IsAvailable; });
            }
            return result;
        }

        public async Task<CollectionParkedItemModel> SaveParkedItemByModule(string accesstoken, EditParkedItemModel model)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
            UpdateParkedItemData data = new UpdateParkedItemData
            {
                IdLogin = userFromService.IdLogin,
                LoginLanguage = userFromService.IdRepLanguage,
                IdApplicationOwner = userFromService.IdApplicationOwner,
                JsonSettings = model.JsonSettings,
                IsActive = model.IsActive,
                ObjectNr = model.ObjectNr,
                Description = model.Description,
                ModuleName = model.ModuleName,
                ModuleType = model.ModuleType,
                IdSettingsModule = model.IdSettingsModule
            };
            
            var result = await _parkedItemService.SaveParkedItemByModule(data);
            CollectionParkedItemModel returnObj = new CollectionParkedItemModel();
            if (result != null && result.ReturnValue > 0 && result.SQLMessage.Contains("Successfully"))
                returnObj.IdSettingsModule = result.ReturnValue.ToString();
            return returnObj;
        }

        public async Task<bool> SaveParkedItemMenu(string accesstoken, List<ParkedMenuItemModel> model, string module_name)
        {
            if (model == null || model.Count <= 0)
                return false;
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken) as JwtSecurityToken;
            var userFromService = JsonConvert.DeserializeObject<UserFromService>(jsonToken.Claims.First(c => c.Type == ConstAuth.AppInfoKey).Value);
            List<EditParkedMenuItemData> data = new List<EditParkedMenuItemData>();
            model.ForEach(p => {
                data.Add(new EditParkedMenuItemData {
                    IdLogin = userFromService.IdLogin,
                    LoginLanguage = userFromService.IdRepLanguage,
                    IdApplicationOwner = userFromService.IdApplicationOwner,
                    IdSettingsWidgetItems = p.IdSettingsWidgetItems.ToString(),
                    IsActive = p.IsChecked.ToString().ToLower()
                });
            });
            var result = await _parkedItemService.SaveParkedMenuItem(data, module_name);
            return result;
        }
    }
}
