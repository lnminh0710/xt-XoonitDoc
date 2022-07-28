using System;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Serialization;

namespace MonitorFolderWindowService.Services.Sqlite
{
    /// <summary>
    /// ConvertUtils
    /// </summary>
    public static class ConvertUtils
    {
        public static object ReturnZeroIfNull(this object value)
        {
            if (value == DBNull.Value)
                return 0;
            if (value == null)
                return 0;
            return value;
        }

        public static object ReturnEmptyIfNull(this object value)
        {
            if (value == DBNull.Value)
                return string.Empty;
            if (value == null)
                return string.Empty;
            return value;
        }

        public static object ReturnFalseIfNull(this object value)
        {
            if (value == DBNull.Value)
                return false;
            if (value == null)
                return false;
            return value;
        }

        public static object ReturnDateTimeMinIfNull(this object value)
        {
            if (value == DBNull.Value)
                return DateTime.MinValue;
            if (value == null)
                return DateTime.MinValue;
            return value;
        }

        public static object ReturnNullIfDbNull(this object value)
        {
            if (value == DBNull.Value)
                return '\0';
            if (value == null)
                return '\0';
            return value;
        }

        /// <summary>
        /// ConvertDateFormatString
        /// </summary>
        /// <param name="dateString"></param>
        /// <param name="targetFormat"></param>
        /// <param name="destFormat"></param>
        /// <returns></returns>
        public static string ConvertDateFormatString(this string dateString, string targetFormat, string destFormat)
        {
            try
            {
                DateTime dt = DateTime.ParseExact(dateString, targetFormat, CultureInfo.InvariantCulture);
                return dt.ToString(destFormat);
            }
            catch
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Convert DateTime to string
        /// </summary>
        /// <param name="datetTime"></param>
        /// <param name="excludeHoursAndMinutes">if true it will execlude time from datetime string. Default is false</param>
        /// <returns></returns>
        public static string ConvertDate(this DateTime datetTime, bool excludeHoursAndMinutes = false)
        {
            if (datetTime != DateTime.MinValue)
            {
                if (excludeHoursAndMinutes)
                    return datetTime.ToString("yyyy-MM-dd");
                return datetTime.ToString("yyyy-MM-dd HH:mm:ss.fff");
            }
            return null;
        }

        /// <summary>
        /// ConvertInt
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static int ConvertInt(this string value)
        {
            try
            {
                return int.Parse(value);
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        /// <summary>
        /// ConvertLong
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static long ConvertLong(this string value)
        {
            try
            {
                return long.Parse(value);
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        /// <summary>
        /// DeepClone
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T DeepClone<T>(T obj)
        {
            using (var ms = new MemoryStream())
            {
                var formatter = new BinaryFormatter();
                formatter.Serialize(ms, obj);
                ms.Position = 0;

                return (T)formatter.Deserialize(ms);
            }
        }
    }
}