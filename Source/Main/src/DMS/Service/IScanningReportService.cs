using DMS.Business;
using DMS.Models;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface IScanningReportService
    {
        Task<object> GetScanningReport(ScanningReportDataModel data);

        Task<object> GetScanningReportx(ScanningReportDataModel data);
    }
}
