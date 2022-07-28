using MonitorFolderWindowService.Models;
using MonitorFolderWindowService.Services;
using MonitorFolderWindowService.toolsforimpersonations;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Permissions;
using System.ServiceProcess;
using System.Text;
using System.Timers;

namespace MonitorFolderWindowService
{
    public partial class MonitorFolderWindowService : ServiceBase
    {
       
         List<String> _changedFiles=new List<string>();
        private MonitorService _monitorService;
        private  Timer aTimer;
        public MonitorFolderWindowService()
        {
            try
            {
                InitializeComponent();
                if (!EventLog.SourceExists("MySource"))
                {
                    EventLog.CreateEventSource(
                        "MySource", "MyNewLog");
                }
                eventLog1.Source = "MySource";
                eventLog1.Log = "MyNewLog";
               

                ///TImer
                string intervalStr = ConfigurationManager.AppSettings["TimerInterval"];
                int timerInterval = 5 * 60 * 1000;
                if (!string.IsNullOrEmpty(intervalStr))
                {
                    timerInterval = int.Parse(intervalStr) * 60 * 1000;
                }
                //aTimer = new Timer();
                //aTimer.Interval = timerInterval;
                //aTimer.Elapsed += OnTimedEvent;
                //aTimer.AutoReset = true;
                //aTimer.Enabled = true;
                _monitorService = new MonitorService();
            }catch(Exception e)
            {
                eventLog1.WriteEntry("In OnStop." + e.Message);
                throw e;
            }
        }
      
        protected void InitFileSystemWatcher()
        {
           
         
           var fileSystemWatcher1 = new FileSystemWatcher(ConfigurationManager.AppSettings["MonitorPath"], "*.*");

            fileSystemWatcher1.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.LastAccess
                                    | NotifyFilters.FileName;
            fileSystemWatcher1.IncludeSubdirectories = true;
            // Add event handlers.
            fileSystemWatcher1.Changed += OnChanged;
            // fileSystemWatcher1.Created += OnChanged;
            fileSystemWatcher1.Deleted += OnChanged;
            fileSystemWatcher1.Renamed += OnRenamed;
            fileSystemWatcher1.Error += OnError;
            fileSystemWatcher1.EnableRaisingEvents = true;
        }

        protected override void OnStart(string[] args)
        {
            eventLog1.WriteEntry("Begin Start" );
           // System.Diagnostics.Debugger.Launch();
            InitFileSystemWatcher();
            eventLog1.WriteEntry("Start Success");

            // aTimer.Start();

        }

        protected override void OnStop()
        {
            eventLog1.WriteEntry("Onstop");
        }

        [PermissionSet(SecurityAction.Demand, Name = "FullTrust")]


        // Define the event handlers.
        private void OnChanged(object source, FileSystemEventArgs e)
        {
            eventLog1.WriteEntry($"File OnChanged: {e.FullPath} {e.ChangeType}");

           actionHandler(e.ChangeType.ToString(), e.FullPath);
           


        }

        private static void OnError(object source, ErrorEventArgs e)
        {
            Console.WriteLine("Error!");
            Console.WriteLine(e.GetException());
        }
        private void OnRenamed(object source, RenamedEventArgs e)
        {
            eventLog1.WriteEntry($"File OnRenamed: {e.FullPath} {e.ChangeType}");
            actionHandler(e.ChangeType.ToString(), e.FullPath, e.OldFullPath, e.OldName);
            
        }
        private void actionHandler(string Action,string FullPath,string OldFullPath=null, string OldFileName = null)
        {
            string fileExtension = Path.GetExtension(FullPath);
            if (!string.IsNullOrEmpty(fileExtension))
            {
                lock (_changedFiles)
                {
                    if (_changedFiles.Contains(FullPath))
                    {
                        return;
                    }
                    _changedFiles.Add(FullPath);
                }


                MonitorFolderModel monitorFolderModel = new MonitorFolderModel
                {
                    FullPath = FullPath,
                    OldFullPath = OldFullPath,
                    FileName = Path.GetFileName(FullPath),
                    OldFileName = OldFileName,
                    Action = Action,
                    ChangedTime = DateTime.Now.ToString()

                };

                _monitorService.SaveFileChanged(monitorFolderModel);
                System.Timers.Timer timer = new Timer(1000) { AutoReset = false };
                timer.Elapsed += (timerElapsedSender, timerElapsedArgs) =>
                {
                    lock (_changedFiles)
                    {
                        _changedFiles.Remove(FullPath);
                    }
                };
                timer.Start();
            }
        }
        //private  void OnTimedEvent(Object source, System.Timers.ElapsedEventArgs e)
        //{
        //    _monitorService.SaveFileChangedUnsaved();
        //}
    }
}
