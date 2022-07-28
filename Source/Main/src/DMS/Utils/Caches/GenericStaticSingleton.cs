using System;

namespace DMS.Utils.Caches
{
    /// <summary>
    /// GenericStaticSingleton
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public static class GenericStaticSingleton<T> where T : class
    {
        //The volatile keyword indicates that a field can be modified in the program by something such as the operating system, the hardware, or a concurrently executing thread.
        static volatile T _instance;
        static readonly object Lock = new object();

        /// <summary>
        /// GenericStaticSingleton
        /// </summary>
        static GenericStaticSingleton()
        {
        }

        /// <summary>
        /// Instance
        /// </summary>
        public static T Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (Lock)
                    {
                        if (_instance == null)
                        {
                            _instance = Activator.CreateInstance<T>();
                        }
                    }
                }

                return _instance;
            }
        }
    }
}
