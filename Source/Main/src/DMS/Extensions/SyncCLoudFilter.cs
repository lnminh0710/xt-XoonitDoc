using Hangfire.Client;
using Hangfire.Common;
using Hangfire.Server;
using Hangfire.States;
using Hangfire.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Extensions
{
    public class SyncCLoudFilter : JobFilterAttribute,
        IClientFilter, IServerFilter, IElectStateFilter, IApplyStateFilter
    { 
        private static PerformingContext _context;
        public static PerformingContext Context { get { return _context; } set { _context = value; } }

        public void OnCreated(CreatedContext filterContext)
        {
           // throw new NotImplementedException();
        }

        public void OnCreating(CreatingContext filterContext)
        {
          // throw new NotImplementedException();
        }

        public void OnPerformed(PerformedContext filterContext)
        {
         //   _context = filterContext;
        }

        public void OnPerforming(PerformingContext filterContext)
        {
            _context = filterContext;
        }

        public void OnStateApplied(ApplyStateContext context, IWriteOnlyTransaction transaction)
        {
           // throw new NotImplementedException();
        }

        public void OnStateElection(ElectStateContext context)
        {
           // throw new NotImplementedException();
        }

        public void OnStateUnapplied(ApplyStateContext context, IWriteOnlyTransaction transaction)
        {
            //throw new NotImplementedException();
        }
    }
}
