using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using DMS.Constants;

namespace DMS.Utils
{
    /// <summary>
    /// ConverterUtils
    /// </summary>
    public static class ConverterUtils
    {
        #region ToDynamicEnumerable
        /// <summary>
        /// AsDynamicEnumerable
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public static IEnumerable<dynamic> AsDynamicEnumerable(this JArray array)
        {
            if (array == null)
            {
                yield break;
            }

            foreach (var item in array)
            {
                IDictionary<string, object> itemT = new ExpandoObject();

                foreach (JProperty prop in ((JObject)item).Properties())
                {
                    var value = Convert.IsDBNull(prop.Value) ? null : prop.Value;

                    if (value != null && (value + string.Empty) == "{}")
                    {
                        value = null;
                    }

                    itemT[FirstCharacterToLower(prop.Name)] = value;
                }

                yield return itemT;
            }
        }

        public static IEnumerable<dynamic> ToDynamicEnumerable(JArray array, bool isFirstCharacterToLowerForKey = true)
        {
            //https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_Linq_JTokenType.htm
            //https://stackoverflow.com/questions/24066400/checking-for-empty-null-jtoken-in-a-jobject

            IList<IDictionary<string, object>> list = new List<IDictionary<string, object>>();
            foreach (var item in array)
            {
                IDictionary<string, object> itemT = new ExpandoObject();

                foreach (JProperty prop in ((JObject)item).Properties())
                {
                    var key = isFirstCharacterToLowerForKey ? FirstCharacterToLower(prop.Name) : prop.Name;
                    object value = null;

                    if (prop.Value.IsNullOrEmpty())
                    {
                        value = null;
                    }
                    else if (prop.Value.Type == JTokenType.Integer)
                    {
                        value = long.Parse(prop.Value.ToString());
                    }
                    else if (prop.Value.Type == JTokenType.Object && (prop.Value + string.Empty) == "{}")
                    {
                        value = null;
                    }
                    else
                    {
                        value = prop.Value;
                    }

                    //if column name is Id --> keep the DataType
                    itemT[key] = value == null || key == "id" ? value : value + string.Empty;
                }//for

                list.Add(itemT);
            }//for

            return list;
        }


        /// <summary>
        /// FirstCharacterToLower
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string FirstCharacterToLower(string str)
        {
            if (String.IsNullOrEmpty(str) || Char.IsLower(str, 0))
                return str;

            return Char.ToLowerInvariant(str[0]) + str.Substring(1);
        }
        #endregion

        public static Dictionary<string, object> ToWidgetDetailModel(this JArray jArray)
        {
            Dictionary<string, object> model = new Dictionary<string, object>();

            foreach (JToken jToken in jArray)
            {
                JObject jObject = (JObject)jToken;
                /*
                "articleNr": {
                    "displayValue": "ArticleNr",
                    "value": "875600",
                    "originalComlumnName": "ArticleNr"
                }
                */
                JToken columnName = jObject.GetValue("ColumnName");
                JToken originalColumnName = jObject.GetValue("OriginalColumnName");
                JToken value = jObject.GetValue("Value");

                Dictionary<string, object> modelValue = new Dictionary<string, object>();
                var key = columnName + string.Empty;
                modelValue[ConstNameSpace.ModelPropertyDisplayValue] = key;
                modelValue[ConstNameSpace.ModelPropertyOriginalColumnName] = originalColumnName + string.Empty;
                modelValue[ConstNameSpace.ModelPropertyValue] = ConvertJTokenValue(value);

                model[FirstCharacterToLower(key)] = modelValue;
            }

            return model;
        }

        #region JToken
        public static bool IsNullOrEmpty(this JToken token)
        {
            return (token == null) ||
                   (token.Type == JTokenType.Array && !token.HasValues) ||
                   (token.Type == JTokenType.Object && !token.HasValues) ||
                   (token.Type == JTokenType.String && token.ToString() == String.Empty) ||
                   (token.Type == JTokenType.Null);
        }

        public static object ConvertJTokenValue(JToken jToken, string dateFormat = null)
        {
            object value = null;
            if (jToken.IsNullOrEmpty())
            {
                value = null;
            }
            else if (jToken.Type == JTokenType.Integer)
            {
                value = long.Parse(jToken.ToString());
            }
            else if (dateFormat != null && jToken.Type == JTokenType.Date)
            {
                value = ((DateTime)jToken).ToString(dateFormat, CultureInfo.InvariantCulture);
            }
            else if (jToken.Type == JTokenType.Object && (jToken + string.Empty) == "{}")
            {
                value = null;
            }
            else
            {
                value = jToken;
            }
            return value;
        }
        #endregion

        #region Simple Types
        public static bool ToBool(object value, bool defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return Convert.ToBoolean(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        #region ToDate
        public static DateTime? ToDate(object value, string format, DateTime? defaultValue = null)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return DateTime.ParseExact(value.ToString(), format, null);
            }
            catch
            {
                return defaultValue;
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
        #endregion

        public static int ToInt(object value, int defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToInt32(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static int? ToIntWithNull(object value)
        {
            if (value == null || value == System.DBNull.Value)
                return null;

            try
            {
                return System.Convert.ToInt32(value);
            }
            catch
            {
                return null;
            }
        }

        public static long ToLong(object value, long defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToInt64(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static float ToFloat(object value, float defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToSingle(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static double ToDouble(object value, double defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToDouble(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static decimal ToDecimal(object value, decimal defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToDecimal(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static string ToString(object value, string defaultValue)
        {
            if (value == null || value == System.DBNull.Value)
                return defaultValue;

            try
            {
                return System.Convert.ToString(value);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static bool ToBool(object value)
        {
            return ToBool(value, false);
        }

        public static int ToInt(object value)
        {
            return ToInt(value, 0);
        }

        public static long ToLong(object value)
        {
            return ToLong(value, 0);
        }

        public static float ToFloat(object value)
        {
            return ToFloat(value, 0);
        }

        public static double ToDouble(object value)
        {
            return ToDouble(value, 0);
        }

        public static decimal ToDecimal(object value)
        {
            return ToDecimal(value, 0);
        }

        public static string ToString(object value)
        {
            return ToString(value, "");
        }

        public static string BoolToString(bool? value)
        {
            if (value != null && value.Value)
            {
                return "1";
            }
            return "0";
        }
        public static bool IsNumeric(string value, out double val)
        {
            return double.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out val);
        }

        public static bool IsDateTime(string value, out DateTime val)
        {
            return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.NoCurrentDateDefault, out val);
        }
        #endregion
    }
}
