using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Service
{
    public partial class BackOfficeService : BaseUniqueServiceRequest, IBackOfficeService
    {
        public Task<object> GetWarehouseMovement(Data data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppB00WarehouseMovement", "GetWarehouseMovement");
        }

        public Task<object> GetWarehouseMovementForPdf(Data data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppB00WarehouseMovement", "GetWarehouseMovementForPdf");
        }

        public Task<object> GetWarehouseMovementCosts(WareHouseMovementData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppB00WarehouseMovement", "GetWarehouseMovementCosts");
        }

        public Task<object> SortingGoods(WareHouseMovementSortingGoodsData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg002WarehouseMovement", "SortingGoods");
        }

        public Task<object> StockedArticles(WareHouseMovementStockedArticlesData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg002WarehouseMovement", "StockedArticles");
        }

        public Task<object> SearchArticles(WareHouseMovementSearchArticleData data)
        {
            return GetDataWithMapTypeIsNone(data, "SpAppWg002WarehouseMovement", "SearchArticles");
        }
        
        public Task<WSEditReturn> SaveWarehouseMovement(WareHouseMovementData data)
        {
           return SaveData(data, "SpCallWarehouseMovement", "SaveWarehouseMovement");
        }
    }
}
