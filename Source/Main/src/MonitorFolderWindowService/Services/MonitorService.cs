using MonitorFolderWindowService.Models;
using MonitorFolderWindowService.Services.Sqlite;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonitorFolderWindowService.Services
{
    public class MonitorService
    {

        private RestClient client;
        private MonitorFolderDB _monitorFolderDB;
        public MonitorService()
        {
            client = new RestClient(ConfigurationManager.AppSettings["ServiceBaseUrl"]);
            _monitorFolderDB = new MonitorFolderDB();
        }
        private int SaveFilesLog(DocumentContainerFilesLog model)
        {
            try
            {
                var request = new RestRequest("DocumentContainer/SaveDocumentContainerFilesLog", Method.POST);

                request.AddParameter(
             "application/json", JsonConvert.SerializeObject(model), ParameterType.RequestBody);


                IRestResponse response = client.Execute(request);
                var content = response.Content; // raw content as string
                if (!string.IsNullOrEmpty(content))
                {
                    WSEditReturn wSEditReturn = JsonConvert.DeserializeObject<WSEditReturn>(content);
                    return int.Parse(wSEditReturn.ReturnID);
                }
                return -1;
            }
            catch
            {
                return -1;
            }


        }

        public void SaveFileChangedUnsaved()
        {
            List<MonitorFolderModel> list = _monitorFolderDB.GetFileChangedSavedFail();
            if (list != null && list.Count > 0)
            {
                foreach(MonitorFolderModel monitorFolderModel in list)
                {
                    try
                    {
                        DocumentContainerFilesLog model = new DocumentContainerFilesLog
                        {
                            FileName = monitorFolderModel.FileName,
                            JsonLog = JsonConvert.SerializeObject(monitorFolderModel)
                        };
                        int returnServerId = SaveFilesLog(model);
                        if (returnServerId > 0)
                        {
                            _monitorFolderDB.DeleteFileChangedHistory(monitorFolderModel.Id.Value);
                        }
                        else
                        {
                            _monitorFolderDB.MarkSaveServerFail(monitorFolderModel.Id.Value);
                        }
                    }
                    catch(Exception e)
                    {
                        _monitorFolderDB.MarkSaveServerFail(monitorFolderModel.Id.Value);
                    }
                }
            }
        }

        public void SaveFileChanged(MonitorFolderModel monitorFolderModel)
        {

            Dictionary<string, string> dic = getFileInfo(monitorFolderModel.FullPath);
            monitorFolderModel.FileInfo = JsonConvert.SerializeObject(dic);
            //long? savedId= _monitorFolderDB.SaveFileChangedHistory(monitorFolderModel);
            //if (savedId != null && savedId > 0)
            //{
                DocumentContainerFilesLog model = new DocumentContainerFilesLog
                {
                    FileName = monitorFolderModel.FileName,
                    JsonLog = JsonConvert.SerializeObject(monitorFolderModel)
                };
              int returnServerId= SaveFilesLog(model);
            //    if (returnServerId > 0)
            //    {
            //        _monitorFolderDB.DeleteFileChangedHistory(savedId.Value);
            //    }
            //    else
            //    {
            //        _monitorFolderDB.MarkSaveServerFail(savedId.Value);
            //    }
            //}

        }
        private Dictionary<string, string> getFileInfo(string file)
        {
            Dictionary<string, string> dic = new Dictionary<string, string>();
            Type t = Type.GetTypeFromProgID("Shell.Application");

            dynamic shell = Activator.CreateInstance(t);

            //This is browse through all the items in the folder
            Shell32.Folder objFolder = shell.NameSpace(System.IO.Path.GetDirectoryName(file));
            Shell32.FolderItem folderItem = objFolder.ParseName(System.IO.Path.GetFileName(file));
            StringBuilder sb = new StringBuilder();
            List<string> arrHeaders = new List<string>();

            for (int i = 0; i < short.MaxValue; i++)
            {
                string header = objFolder.GetDetailsOf(null, i);
                if (String.IsNullOrEmpty(header))
                    break;
                if (!arrHeaders.Contains(header))
                {
                    arrHeaders.Add(header);
                }
            }

    
            for (int i = 0; i < arrHeaders.Count; i++)
            {
                var attrName = arrHeaders[i];
                var attrValue = objFolder.GetDetailsOf(folderItem, i);
                if (!string.IsNullOrEmpty(attrValue))
                {
                    dic.Add(attrName, attrValue);
                } 
            }
            return dic;
        }
    }
}
