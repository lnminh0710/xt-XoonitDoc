using AutoMapper;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Models.History;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Business
{
    public partial class HistorytBusiness : BaseBusiness, IHistorytBusiness
    {
        private readonly IHistoryService _historyService;
        private readonly IMapper _mapper;
        public HistorytBusiness(
            IHttpContextAccessor context,
            IHistoryService historyService,
            IMapper mapper
            )
            : base(context)
        {
            _historyService = historyService;
            _mapper = mapper;
        }

        public async Task<HistoryResponseViewModel> GetDocumentHistory()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data)) as Data;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;

            var result = await _historyService.GetDocumentHistory(data);
            if (result.Count() < 2) return null;

            var columnsSetting = GenerateColumnSettingHistory(result[0]);
            var dataResponse = new HistoryResponseViewModel();
            dataResponse.Columns = _mapper.Map<List<ControlGridColumnViewModel>>(columnsSetting);
            var historiesData = JsonConvert.DeserializeObject<List<HistoryModel>>(result[1].ToString());
            dataResponse.Data = _mapper.Map<List<HistoryViewModel>>(historiesData);
            dataResponse.TotalResults = dataResponse.Data.Count();

            return dataResponse;
        }

        private IEnumerable<HistoryColumnPropertiesModel> GenerateColumnSettingHistory(dynamic data)
        {
            var arrayString = (data as JArray).FirstOrDefault().FirstOrDefault().FirstOrDefault()?.ToString();
            var listObject = JArray.Parse(arrayString)[1].FirstOrDefault().FirstOrDefault();
            var result = listObject.ToObject<IEnumerable<HistoryColumnPropertiesModel>>();
            return result;
        }


        public async Task<AgGridHistoryViewModel> GetScanningHistoryList(ScanningHistoryFilter filter)
        {
            GetScanningHistoryListData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetScanningHistoryListData)) as GetScanningHistoryListData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.FromDate = filter.FromDate != null ? DateTime.ParseExact(filter.FromDate, "dd.MM.yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            data.ToDate = filter.ToDate != null ? DateTime.ParseExact(filter.ToDate, "dd.MM.yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            data.FilterIdLogin = int.Parse(this.UserFromService.IdLogin);
            data.IdDocumentTree = filter.IdDocument;
            data.IdSharingCompany = filter.CompanyId;
            data.PageIndex = filter.PageIndex;
            data.PageSize = filter.PageSize;

            var result = await _historyService.GetScanningHistoryList(data);
            var agGridViewModel = new AgGridHistoryViewModel(result.Data, result.ColumnDefinitions, result.TotalRecords, result.TotalSummary);
            return agGridViewModel;
        }

        public async Task<IEnumerable<HistoryUserViewModel>> GetHistoryUsersByFilter(string filter)
        {
            GetHistoryUserData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetHistoryUserData)) as GetHistoryUserData;
            data.FullName = filter;

            var result = await _historyService.GetHistoryUsersByFilter(data);

            if (result == null) return null;

            return result;
        }

        public async Task<AgGridHistoryDetailViewModel> GetScanningHistoryDetail(ScanningHistoryDetailParameters parameters)
        {
            GetScanningHistoryDetailData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetScanningHistoryDetailData)) as GetScanningHistoryDetailData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            data.ScanDate = parameters.Date;
            data.EmailFilter = this.UserFromService.Email;
            data.IdPerson = parameters.CompanyId;
            data.IdDocument = parameters.IdDocument;
            data.FilterIdLogin = int.Parse(this.UserFromService.IdLogin);
            data.IdLoginFilter = int.Parse(this.UserFromService.IdLogin);

            var result = await _historyService.GetScanningHistoryDetail(data);
            var columns = _mapper.Map<IEnumerable<ColumnDefinitionViewModel>>(result.SettingColumnNameListWrappers.FirstOrDefault()?.SettingColumnName.FirstOrDefault()?.ColumnSetting.ColumnsName);
            var agGridViewModel = new AgGridHistoryDetailViewModel(result.Data, columns, result.Data.Count());
            agGridViewModel.FileName = result.FileNames?.FirstOrDefault()?.FileName;
            return agGridViewModel;
        }
    }
}
