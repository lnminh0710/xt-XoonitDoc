using DMS.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using DMS.Models.History;
using DMS.Utils.RestServiceHelper;
using DMS.Models;
using AutoMapper;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DMS.DTO;
using DMS.Models.DynamicControlDefinitions;

namespace DMS.Service
{
    public class HistoryService : BaseUniqueServiceRequest, IHistoryService
    {
       // private readonly IMapper _mapper;
        public HistoryService(IOptions<AppSettings> appSettings,
                                 IHttpContextAccessor httpContextAccessor,
                                 IAppServerSetting appServerSetting) : base(appSettings, httpContextAccessor, appServerSetting) { }
        public async Task<IList<object>> GetDocumentHistory(Data data)
        {
            data.MethodName = "SpB07AppMyPDM";
            data.Object = "GetCloudDocumetStatusSync";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            return response;
        }

        public async Task<IEnumerable<HistoryUserViewModel>> GetHistoryUsersByFilter(Data data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetHistoryUser";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response == null || !response.Any())
            {
                return null;
            }

            var jArrayData = response[0] as JArray;
            return jArrayData.ToObject<IEnumerable<HistoryUserViewModel>>();
        }

        public async Task<ScanningHistoryData> GetScanningHistoryList(GetScanningHistoryListData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetHistory";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count < 4)
            {
                return new ScanningHistoryData();
            }

            var jArrayTotalSummary = response[0] as JArray;
            var jArrayTotalRecords = response[1] as JArray;
            var jArraySettingColumns = response[2] as JArray;
            var jArrayDataSource = response[3] as JArray;

            var result = new ScanningHistoryData();
            // statistic total of data
            result.TotalSummary = jArrayTotalSummary.ToObject<IEnumerable<ScanningHistoryTotalSummaryData>>()?.FirstOrDefault();

            // total all records of data source
            var totalRecordsData = jArrayTotalRecords.ToObject<IEnumerable<ScanningHistoryTotalRecordsData>>();
            result.TotalRecords = totalRecordsData?.FirstOrDefault()?.TotalRecords ?? 0;

            // data source of grid
            result.Data = jArrayDataSource.ToObject<IEnumerable<object>>();

            // setting columns for grid
            var settingColumns = jArraySettingColumns.ToObject<IEnumerable<SettingColumnNameListWrapper>>();
            result.ColumnDefinitions = settingColumns.FirstOrDefault()?.SettingColumnName?.FirstOrDefault()?.ColumnSetting?.ColumnsName.Select((column) => new ColumnDefinitionViewModel
            {
                ColumnName = column.ColumnName,
                ColumnHeader = column.ColumnHeader,
                OriginalColumnName = column.OriginalColumnName,
                DataType = column.DataType,
                DataLength = column.DataLength.Value,
                Value = column.Value,
                Setting = new ColumnDefinitionSetting
                {
                    DisplayField = column.Setting.FirstOrDefault()?.DisplayField,
                    ControlType = column.Setting.FirstOrDefault()?.ControlType,
                    CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                    Validators = column.Setting.FirstOrDefault()?.Validators,
                }
            });

            return result;
        }

        public async Task<ScanningHistoryDetailDto> GetScanningHistoryDetail(GetScanningHistoryDetailData data)
        {
            data.MethodName = "SpB06GetDocumentContainer";
            data.Object = "GetReportDataDetail";

            var expandData = Common.ToDictionary(data);
            BodyRequest bodyRquest = CreateBodyRequestObject(expandData);

            var response = await Execute(() => Service.ExecutePost<IList<object>>(bodyRquest, Constants.EExecuteMappingType.None));
            if (response == null || response.Count() < 2)
            {
                return new ScanningHistoryDetailDto();
            }

            var jArraySettingColumns = response[0] as JArray;
            var jArrayDataSource = response[1] as JArray;

            var result = new ScanningHistoryDetailDto();
            // setting columns for grid
            var settingColumns = jArraySettingColumns.ToObject<IEnumerable<SettingColumnNameListWrapper>>();
            result.SettingColumnNameListWrappers = settingColumns;

            // data source of grid
            result.Data = jArrayDataSource.ToObject<IEnumerable<object>>();

            return result;
        }
    }
}
