using MonitorFolderWindowService.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonitorFolderWindowService.Services.Sqlite
{
   public class MonitorFolderDB:BaseDB
    {
        public long? SaveFileChangedHistory(MonitorFolderModel monitorFolderData)
        {
            DbUtils db = new DbUtils(ConnectionString);
            try
            {
                string sql = @"INSERT INTO MonitorHistory (
                                FullPath, 
                                FileName,
                                OldFullPath,
                                OldFileName,
                                Action, 
                                ChangedTime, 
                                FileInfo
)
                                VALUES (
                                        @FullPath, 
                                        @FileName,
                                        @OldFullPath, 
                                        @OldFileName, 
                                        @Action, 
                                        @ChangedTime, 
                                        @FileInfo)";

                Action<SQLiteCommand> action = (myCommand) =>
                {
                    CreateSqlParameter("@FullPath", monitorFolderData.FullPath, DbType.String, myCommand);
                    CreateSqlParameter("@FileName", monitorFolderData.FileName, DbType.String, myCommand);
                    CreateSqlParameter("@OldFullPath", monitorFolderData.OldFullPath, DbType.String, myCommand);
                    CreateSqlParameter("@OldFileName", monitorFolderData.OldFileName, DbType.String, myCommand);
                    CreateSqlParameter("@Action", monitorFolderData.Action, DbType.String, myCommand);
                    CreateSqlParameter("@ChangedTime", monitorFolderData.ChangedTime, DbType.String, myCommand);
                    CreateSqlParameter("@FileInfo", monitorFolderData.FileInfo, DbType.String, myCommand);
                   
                };

                int rows = db.ExecuteNonQuery(sql, action);

                if (rows > 0)
                {
                    sql = "SELECT last_insert_rowid()";
                    return (long)db.ExecuteScalar(sql);
                }
                return null;
            }
            finally
            {
                db.Dispose();
            }
        }

        public void DeleteFileChangedHistory(long Id)
        {
            DbUtils db = new DbUtils(ConnectionString);
            try
            {
                int rows = db.ExecuteNonQuery("DELETE FROM MonitorHistory Where Id = " + Id);

            }
            finally
            {
                db.Dispose();
            }
        }

        public List<MonitorFolderModel> GetFileChangedSavedFail()
        {
            DbUtils db = new DbUtils(ConnectionString);
            try
            {
                var ds = db.ExecuteQuery(@"SELECT * FROM MonitorHistory Where SaveServerCount > 0 ");
                if (ds != null)
                {
                    return parseData<MonitorFolderModel>(ds).ToList();
                }
                return null;
            }
            finally
            {
                db.Dispose();
            }
        }

        public void MarkSaveServerFail(long id)
        {
            DbUtils db = new DbUtils(ConnectionString);
            try
            {
                var ds = db.ExecuteQuery(@"UPDATE MonitorHistory SET SaveServerCount = SaveServerCount + 1 Where Id = "+id);
              
            }
            finally
            {
                db.Dispose();
            }
        }

    }
}
