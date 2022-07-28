using System.Linq;
using System.Collections.Generic;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Reflection;
using DMS.Models;
using DMS.Business;

namespace DMS.Utils.Caches
{
    /// <summary>
    /// IUserLoginCache
    /// </summary>
    public interface IUserLoginCache
    {
        /// <summary>
        /// GetUsers
        /// </summary>
        /// <param name="idLogins"></param>
        /// <returns></returns>
        List<UserLoginInfo> GetUsers(List<string> idLogins);        

        /// <summary>
        /// GetUser
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        UserLoginInfo GetUser(string idLogin);

        /// <summary>
        /// Get User Or Add
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        UserLoginInfo GetUserOrAdd(string idLogin);

        /// <summary>
        /// Get User Firebase Tokens
        /// </summary>
        /// <param name="idLogins"></param>
        /// <returns></returns>
        List<UserLoginInfo> GetUserFirebaseTokens(List<string> idLogins);
    }

    /// <summary>
    /// UserLoginCache
    /// </summary>
    public class UserLoginCache : GenericStaticCache<List<UserLoginInfo>>, IUserLoginCache
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "cache");
        static readonly object Lock = new object();
        private readonly IUserBusiness _userBusiness;

        /// <summary>
        /// UserLoginCache
        /// </summary>
        public UserLoginCache(IMemoryCache memoryCache, IUserBusiness userBusiness)
            : base(memoryCache,
                minutesToElapseOrSliding: 525600,//in minutes = 1 year
                supportBackgroundCache: true,
                cacheName: "UserLogin",
                log: _logger)
        {
            _userBusiness = userBusiness;
            _generateObjectMethod = InitData;
            base.Refesh();
        }

        private List<UserLoginInfo> InitData()
        {
            var data = new List<UserLoginInfo>();
            lock (Lock)
            {
                try
                {
                    //call db to get data
                    data = _userBusiness.GetUsersFireBaseGroupToken().Result;
                }
                catch (Exception ex)
                {
                    _logger.Error(ex);
                }
            }
            return data;
        }

        /// <summary>
        /// Get Users
        /// </summary>
        /// <param name="idLogins"></param>
        /// <returns></returns>
        public List<UserLoginInfo> GetUsers(List<string> idLogins)
        {
            return Get().Where(n => idLogins.Contains(n.IdLogin)).ToList();
        }

        /// <summary>
        /// Get User Or Add
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        public UserLoginInfo GetUserOrAdd(string idLogin)
        {
            var list = Get();
            var item = list.Find(n => n.IdLogin == idLogin);
            if (item == null)
            {
                item = new UserLoginInfo() { IdLogin = idLogin };
                lock (Lock)
                {
                    try
                    {
                        list.Add(item);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex);
                    }
                }
            }
            return item;
        }

        /// <summary>
        /// GetUser
        /// </summary>
        /// <param name="idLogin"></param>
        /// <returns></returns>
        public UserLoginInfo GetUser(string idLogin)
        {
            return Get().Find(n => n.IdLogin == idLogin);
        }

        /// <summary>
        /// Get User Firebase Tokens
        /// </summary>
        /// <param name="idLogins"></param>
        /// <returns></returns>
        public List<UserLoginInfo> GetUserFirebaseTokens(List<string> idLogins)
        {
            return Get().Where(n => !string.IsNullOrEmpty(n.FireBaseGroupToken) && idLogins.Contains(n.IdLogin)).ToList();
        }


    }
}
