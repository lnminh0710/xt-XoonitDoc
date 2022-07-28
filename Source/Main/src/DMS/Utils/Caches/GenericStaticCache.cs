using log4net;
using Microsoft.Extensions.Caching.Memory;
using System;

namespace DMS.Utils.Caches
{
    /// <summary>
    /// - Quản lý cache theo 2 cách:
    /// 1. có support Background Cache: lưu dạng absoluteExpiration và sẽ tự động lấy data khi cache bị expire hoặc phụ thuộc vào dependency
    ///     + ex: absoluteExpiration = 20 phút -> thời gian expire = thời điểm tạo cache + 20 phút
    /// 2. không support background cache: lưu dạng slidingExpiration
    ///     + ex: slidingExpiration = 20 phút -> thời gian expire = thời điểm truy cập + 20 phút
    /// - Lần đầu tiên khởi tạo sẽ gọi hàm Refresh để lấy dữ liệu và gán vô cache
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class GenericStaticCache<T> where T : class
    {
        private readonly IMemoryCache _memoryCache;
        private readonly string _cacheName = string.Empty;
        //private readonly Func<T> _generateObjectMethod = null;
        public Func<T> _generateObjectMethod = null;
        private readonly int _minutesToElapseOrSliding = 0;
        private readonly bool _supportBackgroundCache = false;
        private readonly ILog _log;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="memoryCache"></param>
        /// <param name="minutesToElapseOrSliding">Thời gian dùng cho absoluteExpiration, slidingExpiration</param>
        /// <param name="generateObjectMethod">Hàm lấy data</param>
        /// <param name="supportBackgroundCache"></param>
        /// <param name="cacheName"></param>
        /// <param name="log"></param>
        public GenericStaticCache(IMemoryCache memoryCache, int minutesToElapseOrSliding, Func<T> generateObjectMethod = null, bool supportBackgroundCache = false, string cacheName = null, ILog log = null)
        {
            _memoryCache = memoryCache;
            _log = log;

            this._minutesToElapseOrSliding = minutesToElapseOrSliding > 0 ? minutesToElapseOrSliding : 10;//default is 10 minutes
            this._cacheName = cacheName ?? string.Format("{0}-{1}", typeof(T).Name, Guid.NewGuid());
            this._generateObjectMethod = generateObjectMethod;
            this._supportBackgroundCache = supportBackgroundCache;

            Refesh();
        }

        private string GetBackgroundCacheKey()
        {
            return string.Format("{0}-{1}", "BG", this._cacheName);
        }

        /// <summary>
        /// Exists
        /// </summary>
        /// <returns></returns>
        public bool Exists()
        {
            var val = Get();
            return val != null;
        }

        /// <summary>
        /// Get
        /// </summary>
        /// <returns></returns>
        public T Get()
        {
            var cachName = _supportBackgroundCache ? GetBackgroundCacheKey() : this._cacheName;
            _memoryCache.TryGetValue<T>(cachName, out T val);
            return val;
        }

        /// <summary>
        /// Pushes the value.
        /// </summary>
        /// <param name="value">The value.</param>
        /// <returns></returns>
        public void Push(T value)
        {
            SetValue(value);
        }

        /// <summary>
        /// Clears the value.
        /// </summary>
        public void Clear()
        {
            try
            {
                //remove cache
                _memoryCache.Remove(_cacheName);
                //remove bk Cache
                _memoryCache.Remove(GetBackgroundCacheKey());
            }
            catch { }
        }

        /// <summary>
        /// Refesh
        /// </summary>
        public void Refesh()
        {
            //Nếu không truyền method để lấy dữ liệu thì sẽ gán object rỗng vô cache
            if (_generateObjectMethod != null)
            {
                T obj = _generateObjectMethod(); // heavy load    
                if (obj != null)
                {
                    SetValue(obj);
                }
            }
        }

        private void SetValue(T value)
        {
            if (_supportBackgroundCache)
            {
                var cacheEntryOptions = new MemoryCacheEntryOptions();
                //cacheEntryOptions.SetAbsoluteExpiration(TimeSpan.FromDays(3650));//10 years
                //cacheEntryOptions.SetSlidingExpiration(TimeSpan.FromDays(3650));//10 years
                cacheEntryOptions.Priority = CacheItemPriority.NeverRemove;

                //1. đối tượng cache này chứa dữ liệu thật sự
                _memoryCache.Set<T>(GetBackgroundCacheKey(), value ?? default(T), cacheEntryOptions);

                //2. đối tượng cache này chỉ dùng cho việc refresh lại cache và obj luôn luôn rỗng
                if (_minutesToElapseOrSliding > 0)
                {
                    cacheEntryOptions = new MemoryCacheEntryOptions();
                    cacheEntryOptions.SetAbsoluteExpiration(DateTime.Now.AddMinutes(_minutesToElapseOrSliding));//in minutes
                    cacheEntryOptions.Priority = CacheItemPriority.Normal;
                    cacheEntryOptions.RegisterPostEvictionCallback((key, value2, reason, substate) =>
                    {
                        OnCacheRemove(key, value2, reason);
                    });

                    _memoryCache.Set<T>(this._cacheName, default(T), cacheEntryOptions);
                }
            }
            else
            {
                var cacheEntryOptions = new MemoryCacheEntryOptions();
                cacheEntryOptions.SetSlidingExpiration(TimeSpan.FromMinutes(_minutesToElapseOrSliding));//in minutes
                cacheEntryOptions.Priority = CacheItemPriority.Normal;
                _memoryCache.Set<T>(this._cacheName, default(T), cacheEntryOptions);
            }
        }

        private void OnCacheRemove(object key, object cacheItem, EvictionReason reason)
        {
            try
            {
                if (_log != null)
                {
                    _log.Error($"OK-OnCacheRemove: key: {key}, reason: {reason}");
                }

                if ((string)key == _cacheName)// && (reason == CacheItemRemovedReason.Expired || reason == CacheItemRemovedReason.DependencyChanged || reason == CacheItemRemovedReason.Underused))//we must reload Cache
                {
                    Refesh();
                }
            }
            catch (Exception ex)
            {
                if (_log != null)
                {
                    _log.Error($"Error-OnCacheRemove: key: {key}, reason: {reason}. Exception: {ex}");
                }

                var cacheEntryOptions = new MemoryCacheEntryOptions();
                cacheEntryOptions.SetAbsoluteExpiration(DateTime.Now.AddMinutes(_minutesToElapseOrSliding));//in minutes
                cacheEntryOptions.Priority = CacheItemPriority.Normal;
                cacheEntryOptions.RegisterPostEvictionCallback((key2, value, reason2, substate) =>
                {
                    OnCacheRemove(key2, value, reason2);
                });

                _memoryCache.Set<T>(this._cacheName, default(T), cacheEntryOptions);
            }
        }
    }
}
