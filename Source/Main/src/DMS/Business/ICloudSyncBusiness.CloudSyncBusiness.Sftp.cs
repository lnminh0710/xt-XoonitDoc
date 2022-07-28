using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models.DMS;
using DMS.Utils;
using Newtonsoft.Json;
using WinSCP;

namespace DMS.Business
{
    public class CloudSyncBusinessSftp : ICloudSyncBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public void Init(AppSettings _appSettings)
        {

        }
        public CloudSyncBusinessSftp(AppSettings _appSettings)
        {

        }
        private string TEMP_RESOURCE = "Temp_Resource";
        private Session InitSFTP(SftpConnectionModel model)
        {

            if (string.IsNullOrEmpty(model.Type) || (model.Type.ToUpper() != "SFTP"
                && model.Type.ToUpper() != "FTP"))
            {
                throw new Exception("Protocol type must be SFTP or FTP");
            }
            Session session = new WinSCP.Session();
            var path = System.IO.Path.GetFullPath("Logs/WinSCP");
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            var logPath = $"{path}/winscplog-{DateTime.UtcNow.Ticks}.txt";
            session.XmlLogPath = logPath;
            //  session.DebugLogPath = logPath;


            ConnectSftp(session, model);

            return session;
        }
        private void ConnectSftp(Session session, SftpConnectionModel model)
        {

            if (!session.Opened)
            {

                var protocol = model.Type.ToUpper() == "SFTP" ? Protocol.Sftp : Protocol.Ftp;
                SessionOptions sessionOptions = new SessionOptions
                {
                    Protocol = protocol,
                    HostName = model.HostName,
                    UserName = model.UserName,
                    Password = model.Password,
                    PortNumber = model.PortNumber,
                    //  GiveUpSecurityAndAcceptAnySshHostKey = true
                };
                if (protocol == Protocol.Sftp)
                {
                    sessionOptions.GiveUpSecurityAndAcceptAnySshHostKey = true;
                }
                else if (protocol == Protocol.Ftp)
                {
                    sessionOptions.FtpSecure = FtpSecure.None;

                    sessionOptions.FtpMode = FtpMode.Passive;
                    // sessionOptions.GiveUpSecurityAndAcceptAnyTlsHostCertificate = true;
                }
                session.Open(sessionOptions);

            }

        }

        private string CreateDirectories(string path, Session session, SftpConnectionModel sftpConnectionModel)
        {
            try
            {
                ConnectSftp(session, sftpConnectionModel);
                // Consistent forward slashes
                path = path.Replace(@"\\", "/").Replace(@"\", "/");
                //path = path.Replace(@"\", "/");
                string tmp = "";
                foreach (string dir in path.Split('/'))
                {
                    // Ignoring leading/ending/multiple slashes
                    if (!string.IsNullOrWhiteSpace(dir))
                    {

                        tmp = tmp + "/" + dir;
                        if (!session.FileExists(tmp))
                        {

                            session.CreateDirectory(tmp);

                        }


                    }
                }

                return tmp;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        public async Task<object[]> PreSync(CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            SftpConnectionModel settingConn = JsonConvert.DeserializeObject<SftpConnectionModel>(JsonConvert.SerializeObject(connectionModel.SftpConnection != null ? connectionModel.SftpConnection : connectionModel.FtpConnection));
            Session session = InitSFTP(settingConn);
            string remotePath = string.Empty;
            if (!string.IsNullOrEmpty(connectionModel.SftpConnection.Folder))
            {
                remotePath = connectionModel.SftpConnection.Folder;
                remotePath = CreateDirectories(remotePath, session, connectionModel.SftpConnection);
            }
            TransferOptions transferOptions = new TransferOptions()
            {
                TransferMode = TransferMode.Binary,
                OverwriteMode = OverwriteMode.Overwrite,
                PreserveTimestamp = false,
            };
            return new object[] { session, connectionModel.SftpConnection, remotePath, transferOptions };
        }
        public SftpUploadResult UploadFileToServer(CloudSyncQueueModel doc, string localPath, Session session, SftpConnectionModel sftpConnectionModel, string remotePath, TransferOptions transferOptions)
        {
            SftpUploadResult uploadResult = new SftpUploadResult();
            try
            {
                ConnectSftp(session, sftpConnectionModel);
                var watch = Stopwatch.StartNew();
                localPath = string.IsNullOrEmpty(localPath) ? Path.Combine(doc.ScannedPath, doc.FileName) : localPath;
                string remoteFilePath = remotePath;
                if (!string.IsNullOrEmpty(doc.CloudMediaPath))
                {
                    remoteFilePath += "/" + doc.CloudMediaPath;
                    CreateDirectories(remoteFilePath, session, sftpConnectionModel);
                }
                remoteFilePath += "/";
                CreateDirectories(remoteFilePath, session, sftpConnectionModel);
                remoteFilePath = remoteFilePath.Replace(@"\\", "/").Replace(@"\", "/");
                remoteFilePath += !string.IsNullOrEmpty(doc.MediaName) ? doc.MediaName : doc.FileName;

                session.PutFiles(localPath, remoteFilePath, false, transferOptions).Check();

                watch.Stop();
                uploadResult.UploadDuration = watch.ElapsedMilliseconds;
                uploadResult.FullPath = remoteFilePath;

            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                session.Dispose();

            }
            return uploadResult;
        }
        private void deleteXmlLog(string xmlLogPath)
        {
            try
            {

            }
            catch (Exception e)
            {

            }
        }

        public async Task<ReponseUploadDocToCloud> SyncOneDoc(CloudSyncQueueModel doc, params object[] agrs)
        {
            Session session = (Session)agrs[0];
            SftpConnectionModel sftpConnectionModel = (SftpConnectionModel)agrs[1];
            string remotePath = (string)agrs[2];
            TransferOptions transferOptions = (TransferOptions)agrs[3];
            SftpUploadResult sftpUploadResult = UploadFileToServer(doc, string.Empty, session, sftpConnectionModel, remotePath, transferOptions);
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.Remote;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(sftpUploadResult);
            try
            {
                session.Dispose();
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.SyncOneDoc Cannot close Session. ", e);
            }
            return reponseUpload;
        }

        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        private string GenerateTempFileName(string fileName)
        {
            var dateTime = DateTime.Now.ToString("yyyyMMdd-HHmmss.fff");
            var tmpFileName = dateTime + "_" + Path.GetFileName(fileName);
            return tmpFileName;
        }

        private async Task<byte[]> DownloadFile(ReponseUploadDocToCloud infoFile)
        {
            SftpUploadResult sftpUploadResult = JsonConvert.DeserializeObject<SftpUploadResult>(infoFile.ViewDocInfo);
            SftpConnectionModel sftpConnectionModel = new SftpConnectionModel();

            Session session = InitSFTP(sftpConnectionModel);

            string localTempPath = Path.Combine(TEMP_RESOURCE, GenerateTempFileName(sftpUploadResult.FullPath));
            TransferOperationResult transferResult = session.GetFiles(sftpUploadResult.FullPath, localTempPath);
            transferResult.Check();
            // Read the file contents
            byte[] contents = File.ReadAllBytes(localTempPath);

            // Delete the temporary file
            try
            {
                File.Delete(localTempPath);
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.DownloadFile Cannot delete temp file. {localTempPath}", e);
            }
            try
            {
                session.Dispose();
            }catch(Exception e)
            {
                _logger.Error($"SFTP.DownloadFile Cannot close Session. ", e);
            }
            return contents;
        }
        public async Task<object> GetFile(string cloudFilePath, string cloudMediaPath, string cloudMediaName, ReponseUploadDocToCloud reponseUploadDoc)
        {
            byte[] contents = await DownloadFile(reponseUploadDoc);
            CloudDownloadFileReponse data = new CloudDownloadFileReponse();
            data.FileName = cloudMediaName;
            data.stream = new MemoryStream(contents);
            return data;
        }

        public async Task<object> MoveDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public async Task<object> RenamePath(CloudChangePathModel changePathModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            string sourcePath = changePathModel.SourcePath;
            var preSyncResult = await PreSync(connectionModel);
            Session session = (Session)agrs[0];
            SftpConnectionModel sftpConnectionModel = (SftpConnectionModel)agrs[1];
            string remotePath = (string)agrs[2];
            TransferOptions transferOptions = (TransferOptions)agrs[3];
            string soureRemotePath = remotePath + "/" + sourcePath + "/";
            string descRemotePath = remotePath + "/" + changePathModel.DesinationPath + "/";
            session.MoveFile(soureRemotePath, descRemotePath);
            try
            {
                session.Dispose();
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.RenamePath Cannot close Session. ", e);
            }
            return descRemotePath;
        }
        private void moveDoc(string soureRemotePath, string descRemotePath, Session session)
        {

        }



        public Task<object> DeleteDoc(CloudSyncQueueModel doc, CloudChangeDocModel changeDocModel, ReponseUploadDocToCloud infoFile, params object[] agrs)
        {
            throw new NotImplementedException();
        }
        private string CreateDirectoriesForSave(string path, Session session, SftpConnectionModel sftpConnectionModel)
        {
            bool hasCreate = false;
            try
            {
                ConnectSftp(session, sftpConnectionModel);
                // Consistent forward slashes
                path = path.Replace(@"\", "/");
                string tmp = "";
                foreach (string dir in path.Split('/'))
                {
                    // Ignoring leading/ending/multiple slashes
                    if (!string.IsNullOrWhiteSpace(dir))
                    {

                        tmp = tmp + "/" + dir;
                        if (!session.FileExists(tmp))
                        {

                            session.CreateDirectory(tmp);
                            hasCreate = true;
                        }


                    }
                }
                if (!hasCreate || string.IsNullOrEmpty(path))
                {
                    var dateTime = DateTime.Now.ToString("yyyyMMdd-HHmmss");
                    var folderTmp = "Temp_" + dateTime;
                    tmp = tmp + "/" + folderTmp;
                    session.CreateDirectory(tmp);
                    session.RemoveFiles(tmp);
                }
                return tmp;
            }
            catch (Exception e)
            {
                session.Dispose();
                throw e;
            }
        }
        public async Task<bool> TestCloudConnection(CloudConnectionTestModel connectionModel)
        {
            SftpConnectionModel settingConn = connectionModel.SftpConnection != null ? connectionModel.SftpConnection : connectionModel.FtpConnection;
            Session session = InitSFTP(settingConn);
            if (!connectionModel.IsCheckStatusConnection)
            {

                CreateDirectoriesForSave(connectionModel.SftpConnection.Folder, session, connectionModel.SftpConnection);

            }
            try
            {
                session.Dispose();
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.TestCloudConnection Cannot close Session. ", e);
            }

            return true;
        }

        public Task<object> DeletePath(CloudChangePathModel changeDocModel, CloudConnectionStringModel connectionModel, params object[] agrs)
        {
            throw new NotImplementedException();
        }

        public Task<object> TestActionsWithCloud(CloudSyncModelPost model)
        {

            throw new Exception();
        }

        public async Task<Stream> GetFileStream(ReponseUploadDocToCloud infoFile)
        {
            byte[] contents = await DownloadFile(infoFile);
            return new MemoryStream(contents);

        }
        private static byte[] readFully(Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.CopyTo(ms);
                return ms.ToArray();
            }
        }
        public async Task<ReponseUploadDocToCloud> SyncOneDocStream(CloudSyncQueueModel doc, Stream stream, params object[] agrs)
        {
            string localTempPath = Path.Combine(TEMP_RESOURCE, GenerateTempFileName(doc.MediaName));
            CopyStream(stream, localTempPath);
            Session session = (Session)agrs[0];
            SftpConnectionModel sftpConnectionModel = (SftpConnectionModel)agrs[1];
            string remotePath = (string)agrs[2];
            TransferOptions transferOptions = (TransferOptions)agrs[3];
            SftpUploadResult sftpUploadResult = UploadFileToServer(doc, localTempPath, session, sftpConnectionModel, remotePath, transferOptions);
            ReponseUploadDocToCloud reponseUpload = new ReponseUploadDocToCloud();
            reponseUpload.TypeCloud = CloudType.MyCloud;
            reponseUpload.ViewDocInfo = JsonConvert.SerializeObject(sftpUploadResult);
            // Delete the temporary file
            try
            {
                File.Delete(localTempPath);
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.SyncOneDocStream Cannot delete temp file {localTempPath} ", e);
            }
            try
            {
                session.Dispose();
            }
            catch (Exception e)
            {
                _logger.Error($"SFTP.SyncOneDocStream Cannot close Session. ", e);
            }
            return reponseUpload;
        }
        private void CopyStream(Stream stream, string destPath)
        {
            using (var fileStream = new FileStream(destPath, FileMode.Create, FileAccess.Write))
            {
                stream.CopyTo(fileStream);
            }
        }

        public async Task CreateAndSharingFolder(CloudConnectionModel connectionModel, bool deleteFolderAfterTest)
        {
            if (!string.IsNullOrEmpty(connectionModel.ConnectionString.SharedFolder))
            {
                CloudConnectionStringModel cloudConnectionStringModel = connectionModel.ConnectionString;
                SftpConnectionModel settingConn = cloudConnectionStringModel.SftpConnection != null ? cloudConnectionStringModel.SftpConnection : cloudConnectionStringModel.FtpConnection;

                Session session = InitSFTP(settingConn);
                CreateDirectoriesForSave(cloudConnectionStringModel.SharedFolder, session, cloudConnectionStringModel.SftpConnection);
                try
                {
                    session.Dispose();
                }
                catch (Exception e)
                {
                    _logger.Error($"SFTP.CreateAndSharingFolder Cannot close Session. ", e);
                }
            }
            //return autoShareModel.cloudConnectionModel;
            // return connectionModel;
        }
    }

    public class SftpUploadResult
    {
        public string ErrorMessage { get; set; }
        public long UploadDuration { get; set; }

        public string FullPath { get; set; }
    }

}
