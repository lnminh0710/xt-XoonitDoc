using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    /// <summary>
    /// IUniqueService
    /// </summary>
    public interface IUniqueService
    {
        /// <summary>
        /// GetMainLanguages
        /// </summary>
        /// <returns></returns>
        Task<object> GetMainLanguages(Data data);

        /// <summary>
        /// GetColumnSetting
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        Task<object> GetColumnSetting(string moduleId, UserFromService userFromService, bool isMobileSearch = false);

        /// <summary>
        /// GetAllModules
        /// </summary>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetAllModules(UserFromService userFromService);

        /// <summary>
        /// GetAllGlobalModule
        /// </summary>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetAllGlobalModule(UserFromService userFromService);

        /// <summary>
        /// GetDetailSubModule
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        Task<IList<GlobalModule>> GetDetailSubModule(int moduleId, UserFromService userFromService);

        /// <summary>
        /// GetModuleSetting
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        Task<IList<ModuleSettingModel>> GetModuleSetting(ModuleSettingData data);

        /// <summary>
        /// GetSettingModule
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetSettingModule(ModuleSettingData data);

        /// <summary>
        /// GetUser
        /// </summary>
        /// <returns></returns>
        Task<UserFromService> GetUser(string email, string password);
        /// <summary>
        /// GetUserById
        /// </summary>
        /// <param name="idLogin"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        Task<UserFromService> GetUserByIdOrEmail(string idLogin, string email);

        /// <summary>
        /// GetUserById
        /// </summary>
        /// <param name="idLogin"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        Task<UserFromService> GetAllUserByIdOrEmail(string idLogin, string email);

        /// <summary>
        /// ResetPassword
        /// </summary>
        /// <param name="loginName"></param>
        /// <returns></returns>
        Task<UserFromService> ResetPassword(string loginName);

        /// <summary>
        /// ChangePassword
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSNewReturnValue> ChangePassword(LoginData data);
        /// <summary>
        /// UpdateLoginActive
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSNewReturnValue> UpdateLoginActive(LoginData data);

        /// <summary>
        /// SendNotificationForExpiredUser
        /// </summary>
        /// <param name="loginName"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        Task<bool> SendNotificationForExpiredUser(string loginName, string content);
        
        /// <summary>
        /// GetTabSummaryInformation
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<TabSummaryModel>> GetTabSummaryInformation(TabData data);

        /// <summary>
        /// GetTabWithDocumentType
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<IList<TabSummaryModel>> GetTabByIdDocumentType(TabData data);

        /// <summary>
        /// GetCustomerColumnsSetting
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetCustomerColumnsSetting(Data data);

        /// <summary>
        /// GetComboBoxInformation
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetComboBoxInformation(Data data, string extraData = null);

        /// <summary>
        /// CreateContact
        /// </summary>
        /// <param name="data"></param>
        /// <param name="numCommunications"></param>
        /// <returns></returns>
        Task<WSContactEditReturn> CreateContact(ContactCreateData data, int numCommunications);

        /// <summary>
        /// GetModuleToPersonType
        /// </summary>
        /// <returns></returns>
        Task<IList<ModuleToPersonTypeModel>> GetModuleToPersonType(Data data);

        /// <summary>
        /// UpdateSettingsModule
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSReturn> UpdateSettingsModule(UpdateModuleSettingData data);

        /// <summary>
        /// GetDynamicRulesType
        /// </summary>
        /// <returns></returns>
        Task<object> GetDynamicRulesType(UserFromService userFromService);

        /// <summary>
        /// GetWidgetAppById
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<object> GetWidgetAppById(WidgetAppGetData data);

        /// <summary>
        /// UpdateWidgetApp
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSEditReturn> UpdateWidgetApp(UpdateWidgetAppData data);

        /// <summary>
        /// Signup Account
        /// </summary>
        /// <returns></returns>
        Task<IList<WSNewReturnValue>> CreateUserAccount(SignUpAccount signUpAccount, string idApplicationOwner, string idLoginCurrentUser);
        /// <summary>
        /// GetUsersByIdLogin
        /// </summary>
        /// <returns></returns>
        Task<dynamic> GetUsersByIdLogin(ListUserData listUserData);
        /// <summary>
        /// GetOptionsListFilter
        /// </summary>
        /// <returns></returns>
        Task<dynamic> GetFilterOptionsUser(LoginData loginData);
        /// <summary>
        /// UpdateUserStatus
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        Task<WSNewReturnValue> UpdateUserStatus(LoginData data);
    }
}
