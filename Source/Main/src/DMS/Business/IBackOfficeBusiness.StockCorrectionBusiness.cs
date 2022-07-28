using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;
using System;
using Newtonsoft.Json;

namespace DMS.Business
{
    public partial class BackOfficeBusiness : BaseBusiness, IBackOfficeBusiness
    {
        public async Task<object> GetStockCorrection()
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            var result = await _backOfficeService.GetStockCorrection(data);
            return result;
        }

        public async Task<object> GetWarehouseArticle(string articleNr, long warehouseId)
        {
            StockCorrectionData data = (StockCorrectionData)ServiceDataRequest.ConvertToRelatedType(typeof(StockCorrectionData));
            data.ArticleNr = articleNr;
            data.WarehouseId = warehouseId;
            var result = await _backOfficeService.GetWarehouseArticle(data);
            return result;
        }

        public async Task<WSEditReturn> SaveStockCorrection(StockCorrectionModel model)
        {
            StockCorrectionData data = (StockCorrectionData)ServiceDataRequest.ConvertToRelatedType(typeof(StockCorrectionData));
            if (model != null && model.StockCorrections != null && model.StockCorrections.Count > 0)
            {
                var jSON = JsonConvert.SerializeObject(model.StockCorrections,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONStockCorrection = string.Format(@"""StockCorrection"":{0}", jSON);
                data.JSONStockCorrection = string.Format("{{{0}}}", data.JSONStockCorrection);
            }

            var result = await _backOfficeService.SaveStockCorrection(data);

            // Sync to elastic search
            if (result != null && !string.IsNullOrWhiteSpace(result.ReturnID))
            {
                //Because the StockCorrection allows to save multiple rows, however the StoreProcedure only returns one ReturnID
                //-> we must sync by Date if there is more than one row need to be inserted
                var elasticSyncModel = new ElasticSyncModel
                {
                    ModuleType = ModuleType.StockCorrection
                };

                //sync by Id
                if (model.StockCorrections.Count == 1)
                {
                    elasticSyncModel.KeyId = result.ReturnID;
                }
                else//sync by Date
                {
                    elasticSyncModel.StartDate = DateTime.Today;
                }
                await _elasticSearchSyncBusiness.SyncToElasticSearch(elasticSyncModel);
            }

            return result;
        }
    }
}
