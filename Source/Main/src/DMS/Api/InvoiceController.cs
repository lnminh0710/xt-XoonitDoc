using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using DMS.Models;
using DMS.Models.DMS;
using Microsoft.AspNetCore.Mvc.Formatters;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using System.Buffers;
using DMS.Models.DMS.ViewModels;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    /// <summary>
    /// InvoiceController
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class InvoiceController : BaseController
    {
        private readonly IInvoiceBusiness _invoiceBusiness;

        public InvoiceController(IInvoiceBusiness invoiceBusiness)
        {
            _invoiceBusiness = invoiceBusiness;
        }

        [HttpPost]
        [Route("SaveInvoice")]
        public async Task<object> SaveInvoice(string idMainDocument, [FromBody] SaveInvoiceModel model)
        {
            if (model == null) return null;

            if (idMainDocument == null || String.IsNullOrWhiteSpace(idMainDocument))
            {
                return await _invoiceBusiness.SaveInvoice(model);
            }

            return await _invoiceBusiness.UpdateInvoice(model, idMainDocument);
        }

        /// <summary>
        /// Update invocie
        /// </summary>
        /// <param name="model">post data</param>
        /// <param name="idMainDocument">id main document</param>
        /// <returns></returns>
        [HttpPut]
        [Route("UpdateInvoice/{idMainDocument}")]
        public async Task<object> SaveInvoice([FromBody] SaveInvoiceModel model, string idMainDocument)
        {
            return await _invoiceBusiness.UpdateInvoice(model, idMainDocument);
        }

        [HttpGet]
        [Route("DataSettingColumnsInvoice")]
        public async Task<object> GetDataSettingColumnsOfInvoice(string addOnFields)
        {
            var columns = await _invoiceBusiness.GetDataSettingColumnsOfInvoice(addOnFields);
            return columns.Where(col =>
            {
                var setting = col.Setting;
                if ((setting.DisplayField.Hidden == "0" || setting.DisplayField.Hidden == "1") &&
                        setting.DisplayField.ReadOnly == "0")
                {
                    if (setting.DisplayField.KeepOriginialColumnName == "0")
                    {
                        col.OriginalColumnName = col.OriginalColumnName.Substring(col.OriginalColumnName.LastIndexOf('_') + 1);
                    }
                    return true;
                }

                return false;
            });
        }

        [HttpGet]
        [Route("CapturedInvoiceDocumentDetail")]
        public async Task<object> GetCapturedInvoiceDocumentDetail(string idMainDocument, string addOnFields)
        {
            var invoiceDetail = await _invoiceBusiness.GetCapturedInvoiceDocumentDetail(
                idMainDocument,
                // get all columns INVOICE by condition hidden = false || readonly = false || needForUpdate = true
                (displaySetting) => (displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1"),

                // get all columns PERSON by condition hidden = false || readonly = false || needForUpdate = true
                (displaySetting) =>
                {
                    return displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1";
                },
                addOnFields
            );

            if (invoiceDetail == null) return null;

            Func<DocumentColumnSettingViewModel, bool> predicate = (column) =>
            {
                return column.Setting.DisplayField.Hidden == "0" || column.Setting.DisplayField.ReadOnly == "0" || column.Setting.DisplayField.KeyForUpdate == "1";
            };
            //Func<DocumentColumnSettingViewModel, string, DocumentColumnSettingViewModel> funcTransformData = (column, suffix) =>
            //{
            //    column.OriginalColumnName = $"{column.OriginalColumnName}_{suffix}";
            //    return column;
            //};

            // filter again get fields id that needForUpdate = false (field on UI) , KeyForUpdate == true such as id keys for update such as IdMainDocument, IdDocumentTree, IdDocumentContainerScans)
            var data = invoiceDetail.Invoice.Where(predicate);

            if (invoiceDetail.PersonBank != null)
            {
                data = data.Concat(invoiceDetail.PersonBank.Where(predicate));
            }

            if (invoiceDetail.PersonBeneficiary != null)
            {
                data = data.Concat(
                    invoiceDetail.PersonBeneficiary
                                 .Where(predicate)
                                 //.Select(columnBeneficiary => funcTransformData(columnBeneficiary, "BENEFICIARY"))
                );
            }

            if (invoiceDetail.PersonRemitter != null)
            {
                data = data.Concat(
                    invoiceDetail.PersonRemitter
                                 .Where(predicate)
                                 //.Select(columnRemitter => funcTransformData(columnRemitter, "REMITTER"))
                );
            }

            return data.ToList();
        }
    }
}
