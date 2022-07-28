using System;
using System.Collections.Generic;

namespace DMS.Models
{
    /*
    declare @p1 dbo.udtt_ObjectParameters
    insert into @p1 values(N'CrudType',N'')
    insert into @p1 values(N'Object',N'SavingQueue')
    insert into @p1 values(N'IdLogin',N'3')
    insert into @p1 values(N'LoginLanguage',N'3')
    insert into @p1 values(N'IdApplicationOwner',N'1')
    insert into @p1 values(N'GUID',N'cd9a6f92-fb86-410c-9719-6b65be43d578')
    insert into @p1 values(N'JSONText',N'{"SystemScheduleQueue":[{
    "IdAppSystemSchedule":"1"
    ,"IdRepAppSystemScheduleServiceName":"1"
    ,"StartDateTime":"02/21/2019 05:05:05"
    ,"StopDateTime":"02/21/2019 05:05:05"
    ,"JsonLog":"1"
    ,"IsActive":"1"
    ,"IsDeleted":"0"
    }]}')
 
    exec SpCallSystemScheduleQueue  @_ObjectParameters=@p1
     */

    public class ScheduleQueueCreateData
    {
        public int IdRepAppSystemScheduleServiceName { get; set; }
        public IList<SystemScheduleQueueData> Queues { get; set; }

        public ScheduleQueueCreateData()
        {
            Queues = new List<SystemScheduleQueueData>();
        }
    }

    public class SystemScheduleQueueData
    {
        public int IdRepAppSystemScheduleServiceName { get; set; }
        public long? IdAppSystemSchedule { get; set; }        
        public string JsonLog { get; set; }
        public string JsonLogJsonType { get; set; }
        public string StartDateTime { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public SystemScheduleQueueData()
        {
            IsActive = "1";
            IsDeleted = "0";
            StartDateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
        }
    }
}
