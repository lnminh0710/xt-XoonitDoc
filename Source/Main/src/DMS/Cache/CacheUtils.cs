using DMS.Models.DMS;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Cache
{
    public static class CacheUtils
    {
        public static readonly string Key_Cloud_Prefix = "CacheCloud_";
        private static MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions();
                  

        public static CloudActiveUserModel GetCloudInfo(MemoryCache _cache, string IdLogin)
        {
            string key = Key_Cloud_Prefix + IdLogin;
            var cacheEntry = _cache.Get(key);
            
         
                return cacheEntry != null? (CloudActiveUserModel)cacheEntry : null;
        }
        public static void PutCloudInfo(MemoryCache _cache, string IdLogin, CloudActiveUserModel model)
        {
            string key = Key_Cloud_Prefix + IdLogin;
            _cache.Set(key, model);
        }
    }
}
