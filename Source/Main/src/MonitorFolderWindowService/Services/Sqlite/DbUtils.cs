using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Globalization;

namespace MonitorFolderWindowService.Services.Sqlite
{
    /// <summary>
    /// DbUtils
    /// </summary>
    public class DbUtils : IDisposable
    {
        private string _ConnectionString = "";

        private SQLiteConnection _Connection = null;

        /// <summary>
        /// ConnectionString
        /// </summary>
        public string ConnectionString
        {
            get
            {
                return _ConnectionString;
            }
            set
            {
                _ConnectionString = value;
                _Connection = new SQLiteConnection(_ConnectionString,true);
                _Connection.Open();
            }
        }

        /// <summary>
        /// Connection
        /// </summary>
        public SQLiteConnection Connection
        {
            get
            {
                if (_Connection.State == System.Data.ConnectionState.Closed)
                {
                    _Connection.Open();
                }
                return _Connection;
            }
        }

        /// <summary>
        /// DbUtils
        /// </summary>
        /// <param name="connectionString"></param>
        public DbUtils(string connectionString)
        {
            this.ConnectionString = connectionString;
        }

        /// <summary>
        /// DbUtils
        /// </summary>
        ~DbUtils()
        {
            Dispose(false);
        }

        /// <summary>
        /// Dispose
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Dispose
        /// </summary>
        /// <param name="disposing"></param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_Connection != null && _Connection.State == System.Data.ConnectionState.Open)
                {
                    _Connection.Close();
                }
                _Connection = null;
            }
        }

        /// <summary>
        /// ExecuteQuery
        /// </summary>
        /// <param name="strProcedureName"></param>
        /// <param name="paramColl"></param>
        /// <returns></returns>
        public DataSet ExecuteQuery(string sqlQuery)
        {  
            SQLiteCommand myCommand = this.Connection.CreateCommand();

            using (DataSet ds = new DataSet())
            {
                ds.Locale = CultureInfo.InvariantCulture;
                myCommand.CommandText = sqlQuery;
                myCommand.CommandType = CommandType.Text;
                
                using (SQLiteDataAdapter adap = new SQLiteDataAdapter(myCommand))
                {
                    adap.Fill(ds);
                }
                return ds;
            }
        }

        /// <summary>
        /// ExecuteNonQuery
        /// </summary>
        /// <param name="sqlQuery"></param>
        /// <returns></returns>
        public int ExecuteNonQuery(string sqlQuery, Action<SQLiteCommand> action = null)
        {
            SQLiteCommand myCommand = this.Connection.CreateCommand();
            myCommand.CommandText = sqlQuery;
            myCommand.CommandType = CommandType.Text;
            action?.Invoke(myCommand);
            return myCommand.ExecuteNonQuery();
        }

        /// <summary>
        /// ExecuteScalar
        /// </summary>
        /// <param name="sqlQuery"></param>
        /// <returns></returns>
        public object ExecuteScalar(string sqlQuery)
        {
            SQLiteCommand myCommand = this.Connection.CreateCommand();
            myCommand.CommandText = sqlQuery;
            myCommand.CommandType = CommandType.Text;
            return myCommand.ExecuteScalar();
        }

        /// <summary>
        /// IsTableExists
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public bool IsTableExists(string tableName)
        {
            SQLiteCommand myCommand = this.Connection.CreateCommand();
            myCommand.CommandText = @"SELECT COUNT(*) FROM sqlite_master WHERE name=@TableName";
            myCommand.CommandType = CommandType.Text;
            var param = myCommand.CreateParameter();
            param.DbType = DbType.String;
            param.ParameterName = "TableName";
            param.Value = tableName;
            myCommand.Parameters.Add(param);
            var result = myCommand.ExecuteScalar();
            return ((long)result) == 1;
        }
    }
}
