using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Service;
using DMS.Utils;
using System;
using System.Reflection;
using Newtonsoft.Json;
using DMS.Utils.ElasticSearch;

namespace DMS.Business
{
    public partial class BackOfficeBusiness : BaseBusiness, IBackOfficeBusiness
    {
        private readonly IBackOfficeService _backOfficeService;
        private readonly IElasticSearchSyncBusiness _elasticSearchSyncBusiness;

        public BackOfficeBusiness(IHttpContextAccessor context, IBackOfficeService backOfficeService,
                              IElasticSearchSyncBusiness elasticSearchSyncBusiness) : base(context)
        {
            _backOfficeService = backOfficeService;
            _elasticSearchSyncBusiness = elasticSearchSyncBusiness;
        }


        public async Task<object> GetBlockedOrderTextTemplate(int? idRepSalesOrderStatus)
        {
            BlockOrdersData data = (BlockOrdersData)ServiceDataRequest.ConvertToRelatedType(typeof(BlockOrdersData));
            data.IdRepSalesOrderStatus = idRepSalesOrderStatus;
            var result = await _backOfficeService.GetBlockedOrderTextTemplate(data);
            return result;
        }

        public async Task<object> GetMailingListOfPlaceHolder()
        {
            BlockOrdersData data = (BlockOrdersData)ServiceDataRequest.ConvertToRelatedType(typeof(BlockOrdersData));
            var result = await _backOfficeService.GetMailingListOfPlaceHolder(data);
            return result;
        }

        public async Task<WSEditReturn> SaveTextTemplate(BlockOrdersModel model)
        {
            BlockOrdersData data = (BlockOrdersData)ServiceDataRequest.ConvertToRelatedType(typeof(BlockOrdersData));
            data = (BlockOrdersData)Common.MappModelToSimpleData(data, model);
            if(model.MarkAsActive != null)
            {
                data.IsActive = (bool)model.MarkAsActive ? 1 : 0;
            }
            var result = await _backOfficeService.SaveTextTemplate(data);
            return result;
        }
    }
}
