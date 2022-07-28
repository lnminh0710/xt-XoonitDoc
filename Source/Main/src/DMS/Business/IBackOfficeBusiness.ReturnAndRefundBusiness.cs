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
        public async Task<object> GetWidgetInfoByIds(string personNr, string invoiceNr, string mediaCode)
        {
            ReturnRefundData data = (ReturnRefundData)ServiceDataRequest.ConvertToRelatedType(typeof(ReturnRefundData));
            data.PersonNr = personNr;
            data.InvoiceNr = invoiceNr;
            data.MediaCode = mediaCode;
            var result = await _backOfficeService.GetWidgetInfoByIds(data);
            return result;
        }

        public async Task<WSEditReturn> SaveWidgetData(ReturnRefundSaveModel model)
        {
            ReturnRefundSaveData data = (ReturnRefundSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(ReturnRefundSaveData));
            data = (ReturnRefundSaveData) Common.MappModelToSimpleData(data, model);

            if (model != null && model.OrderReturnArticles != null && model.OrderReturnArticles.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.OrderReturnArticles,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONOrderReturnArticles = string.Format(@"""OrderReturnArticles"":{0}", _jSON);
                data.JSONOrderReturnArticles = string.Format("{{{0}}}", data.JSONOrderReturnArticles);
            }

            if (model != null && model.ReturnAndRefundOrderPayments != null && model.ReturnAndRefundOrderPayments.Count > 0)
            {
                var _jSON = JsonConvert.SerializeObject(model.ReturnAndRefundOrderPayments,
                                        Newtonsoft.Json.Formatting.None,
                                        new JsonSerializerSettings
                                        {
                                            //Formatting = Formatting.Indented,
                                            NullValueHandling = NullValueHandling.Ignore
                                        });
                data.JSONOrderPayments = string.Format(@"""JSONOrderPayments"":{0}", _jSON);
                data.JSONOrderPayments = string.Format("{{{0}}}" ,data.JSONOrderPayments);
            }
            var result = await _backOfficeService.SaveWidgetData(data);
            return result;
        }


        public async Task<WSEditReturn> SaveUnblockOrder(string idSalesOrder, bool? isDeleted)
        {
            ReturnRefundData data = (ReturnRefundData)ServiceDataRequest.ConvertToRelatedType(typeof(ReturnRefundData));
            data.IdSalesOrder = idSalesOrder;

            var result = await _backOfficeService.SaveUnblockOrder(data, isDeleted);

            return result;
        }
    }
}
