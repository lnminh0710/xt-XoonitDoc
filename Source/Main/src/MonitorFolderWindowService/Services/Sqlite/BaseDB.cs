
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SQLite;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace MonitorFolderWindowService.Services.Sqlite
{
    /// <summary>
    /// BaseDB
    /// </summary>
    public class BaseDB
    {
        private string _defaultLocalDB = @"DB/aTest.sqlite";
        protected string _conntectionString;
        protected string _sqlLitePath;

        /// <summary>
        /// ConnectionString
        /// </summary>
        public string ConnectionString
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_conntectionString))
                {
                    string connection = "Data Source={0};Version=3;Journal Mode=Off;";
                    _conntectionString = string.Format(connection, SqlLitePath);
                }
                return _conntectionString;
            }
        }

        /// <summary>
        /// SqlLitePath
        /// </summary>
        public string SqlLitePath
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_sqlLitePath))
                {
                    _sqlLitePath = @"DB/monitorFolder.sqlite";

                    if(!File.Exists(_sqlLitePath))
                    {
                        _sqlLitePath = this._defaultLocalDB;
                    }
                }
                return _sqlLitePath;
            }
        }

        /// <summary>
        /// CreateSqlParameter
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="dbType"></param>
        /// <returns></returns>
        protected SQLiteParameter CreateSqlParameter(string key, object value, DbType dbType, SQLiteCommand myCommand)
        {
            SQLiteParameter param = new SQLiteParameter(key, value);
            param.DbType = dbType;
            myCommand.Parameters.Add(param);
            return param;
        }

        /// <summary>
        /// parseData
        /// </summary>
        protected IEnumerable<T> parseData<T>(DataSet ds) where T : new()
        {
            if (ds != null && ds.Tables.Count > 0)
            {
                //Define what attributes to be read from the class
                const BindingFlags flags = BindingFlags.Public | BindingFlags.Instance;

                //Read Attribute Names and Types
                var objFieldNames = typeof(T).GetProperties(flags).Cast<PropertyInfo>().
                    Select(item => new
                    {
                        Name = item.Name,
                        Type = Nullable.GetUnderlyingType(item.PropertyType) ?? item.PropertyType
                    }).ToList();

                // Read Datatable column names and types
                var dtlFieldNames = ds.Tables[0].Columns.Cast<DataColumn>().
                    Select(item => new {
                        Name = item.ColumnName,
                        Type = item.DataType
                    }).ToList();

                if (ds.Tables[0].Rows.Count == 0)
                {
                    yield break;
                }

                foreach (DataRow dataRow in ds.Tables[0].Rows)
                {
                    var classObj = new T();

                    foreach (var dtField in dtlFieldNames)
                    {
                        PropertyInfo propertyInfos = classObj.GetType().GetProperty(dtField.Name);

                        var field = objFieldNames.Find(x => x.Name == dtField.Name);

                        if (field != null)
                        {
                            if (propertyInfos.PropertyType == typeof(DateTime))
                            {
                                propertyInfos.SetValue(classObj, convertToDateTime(dataRow[dtField.Name]), null);
                            }
                            else if (propertyInfos.PropertyType == typeof(int) || propertyInfos.PropertyType == typeof(int?))
                            {
                                propertyInfos.SetValue(classObj, ConvertToInt(dataRow[dtField.Name]), null);
                            }
                            else if (propertyInfos.PropertyType == typeof(long) || propertyInfos.PropertyType == typeof(long?))
                            {
                                propertyInfos.SetValue(classObj, ConvertToLong(dataRow[dtField.Name]), null);
                            }
                            else if (propertyInfos.PropertyType == typeof(decimal))
                            {
                                propertyInfos.SetValue(classObj, ConvertToDecimal(dataRow[dtField.Name]), null);
                            }
                            else if (propertyInfos.PropertyType == typeof(bool))
                            {
                                propertyInfos.SetValue(classObj, ConvertToBoolean(dataRow[dtField.Name]), null);
                            }
                            else if (propertyInfos.PropertyType == typeof(String))
                            {
                                if (dataRow[dtField.Name].GetType() == typeof(DateTime))
                                {
                                    propertyInfos.SetValue(classObj, ConvertToDateString(dataRow[dtField.Name]), null);
                                }
                                else
                                {
                                    propertyInfos.SetValue(classObj, ConvertToString(dataRow[dtField.Name]), null);
                                }
                            }
                        }
                    }
                    yield return classObj;
                }
            }
        }

        private string ConvertToDateString(object date)
        {
            if (date == null)
                return string.Empty;

            return ConvertUtils.ConvertDate(Convert.ToDateTime(date));
        }

        private string ConvertToString(object value)
        {
            return Convert.ToString(ConvertUtils.ReturnEmptyIfNull(value));
        }

        private int ConvertToInt(object value)
        {
            return Convert.ToInt32(ConvertUtils.ReturnZeroIfNull(value));
        }

        private long ConvertToLong(object value)
        {
            return Convert.ToInt64(ConvertUtils.ReturnZeroIfNull(value));
        }

        private decimal ConvertToDecimal(object value)
        {
            return Convert.ToDecimal(ConvertUtils.ReturnZeroIfNull(value));
        }

        private bool ConvertToBoolean(object value)
        {
            return Convert.ToBoolean(ConvertUtils.ReturnFalseIfNull(value));
        }

        private DateTime convertToDateTime(object date)
        {
            return Convert.ToDateTime(ConvertUtils.ReturnDateTimeMinIfNull(date));
        }

    }
}
