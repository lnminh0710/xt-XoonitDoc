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
        public async Task<object> GetWarehouseMovement()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            return await _backOfficeService.GetWarehouseMovement(data);
        }

        public async Task<object> GetWarehouseMovementForPdf()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            return await _backOfficeService.GetWarehouseMovementForPdf(data);
        }

        public async Task<object> GetWarehouseMovementCosts(int? idWarehouseMovement)
        {
           WareHouseMovementData data = (WareHouseMovementData)ServiceDataRequest.ConvertToRelatedType(typeof(WareHouseMovementData));
           data.IdWarehouseMovement = (idWarehouseMovement ?? 0).ToString();
           return await _backOfficeService.GetWarehouseMovement(data);
        }

        public async Task<object> SortingGoods(int? idWarehouseMovement)
        {
           WareHouseMovementSortingGoodsData data = (WareHouseMovementSortingGoodsData)ServiceDataRequest.ConvertToRelatedType(typeof(WareHouseMovementSortingGoodsData));
           data.IdWarehouseMovement = idWarehouseMovement == null ? "" : idWarehouseMovement.ToString();
           return await _backOfficeService.SortingGoods(data);
        }

        public async Task<object> StockedArticles(int? idWarehouseMovementGoodsIssue)
        {
           WareHouseMovementStockedArticlesData data = (WareHouseMovementStockedArticlesData)ServiceDataRequest.ConvertToRelatedType(typeof(WareHouseMovementStockedArticlesData));
           data.IdWarehouseMovementGoodsIssue = idWarehouseMovementGoodsIssue == null ? "" : idWarehouseMovementGoodsIssue.ToString();
           return await _backOfficeService.StockedArticles(data);
        }

        public async Task<object> SearchArticles(string searchString, int? idPersonFromWarehouse)
        {
           WareHouseMovementSearchArticleData data = (WareHouseMovementSearchArticleData)ServiceDataRequest.ConvertToRelatedType(typeof(WareHouseMovementSearchArticleData));
           data.IdPersonFromWarehouse = idPersonFromWarehouse == null ? "" : idPersonFromWarehouse.ToString();
           data.SearchString = searchString;
           return await _backOfficeService.SearchArticles(data);
        }

        public async Task<WSEditReturn> SaveWarehouseMovement(WareHouseMovementModel model)
        {
           WareHouseMovementData data = (WareHouseMovementData)ServiceDataRequest.ConvertToRelatedType(typeof(WareHouseMovementData));
           data = (WareHouseMovementData)Common.MappModelToData(data, model, true);
           if (model.JSONMovementArticles != null && model.JSONMovementArticles.Count > 0)
           {
               var jSONMovementArticles = JsonConvert.SerializeObject(model.JSONMovementArticles, new JsonSerializerSettings
                                {
                                    NullValueHandling = NullValueHandling.Ignore
                                });
               data.JSONText = string.Format(@"""JSONMovementArticles"":{0}", jSONMovementArticles);
               data.JSONText = "{" + data.JSONText + "}";
           }
           return await _backOfficeService.SaveWarehouseMovement(data);
        }

        public async Task<WSEditReturn> SaveGoodsReceiptPosted(IList<GoodsReceiptPostedModel> model)
        {
           GoodsReceiptPostedData data = (GoodsReceiptPostedData)ServiceDataRequest.ConvertToRelatedType(typeof(GoodsReceiptPostedData));
           if (model != null && model.Count > 0)
           {
               var jSONGoodsReceiptPosted = JsonConvert.SerializeObject(model, new JsonSerializerSettings
                                {
                                    NullValueHandling = NullValueHandling.Ignore
                                });
               data.JSONText = string.Format(@"""JSONGoodsReceiptPosted"":{0}", jSONGoodsReceiptPosted);
               data.JSONText = "{" + data.JSONText + "}";
           }
            return await _backOfficeService.SaveGoodsReceiptPosted(data);
        }

        public async Task<WSEditReturn> ConfirmGoodsReceiptPosted(ConfirmGoodsReceiptPostedModel model)
        {
            ConfirmGoodsReceiptPostedData data = (ConfirmGoodsReceiptPostedData)ServiceDataRequest.ConvertToRelatedType(typeof(ConfirmGoodsReceiptPostedData));
            data = (ConfirmGoodsReceiptPostedData)Common.MappModelToData(data, model, true);
            return await _backOfficeService.ConfirmGoodsReceiptPosted(data);
        }
    }
}
