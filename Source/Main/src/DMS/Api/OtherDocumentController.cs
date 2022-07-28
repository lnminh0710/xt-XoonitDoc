using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models;
using DMS.Models.DMS.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class OtherDocumentController : BaseController
    {
        private readonly IOtherDocumentBusiness _otherDocumentBusiness;
        public OtherDocumentController(IOtherDocumentBusiness otherDocumentBusiness)
        {
            _otherDocumentBusiness = otherDocumentBusiness;
        }

        [HttpPost]
        [Route("SaveOtherDocument")]
        public async Task<object> SaveOtherDocument(string idMainDocument, [FromBody] SaveOtherDocumentModel model)
        {
            if (model == null) return null;

            if (idMainDocument == null || String.IsNullOrWhiteSpace(idMainDocument))
            {
                return await _otherDocumentBusiness.SaveOtherDocument(model);
            }

            return await _otherDocumentBusiness.UpdateOtherDocument(model, idMainDocument);
        }

        [HttpGet]
        [Route("DataSettingColumnsOtherDocuments")]
        public async Task<object> GetDataSettingColumnsOfOtherDocuments(string addOnFields)
        {
            var columns = await _otherDocumentBusiness.GetDataSettingColumnsOfOtherDocuments(addOnFields);
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
        [Route("CapturedOtherDocumentDetail")]
        public async Task<object> GetCapturedOtherDocumentDetail(string idMainDocument, string addOnFields)
        {
            var otherDocumentDetail = await _otherDocumentBusiness.GetCapturedOtherDocumentDetail(
              idMainDocument,
              // get all columns OTHER DOCUMENT by condition hidden = false || readonly = false || needForUpdate = true
              (displaySetting) => (displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1"),

              // get all columns PERSON by condition hidden = false || readonly = false & || needForUpdate = true
              (displaySetting) => (displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1"),
              addOnFields
            );

            if (otherDocumentDetail == null) return null;

            Func<DocumentColumnSettingViewModel, bool> predicate = (column) =>
            {
                return column.GetSetting().DisplayField.Hidden == "0" || column.GetSetting().DisplayField.ReadOnly == "0" || column.GetSetting().DisplayField.KeyForUpdate == "1";
            };

            // filter again get fields id that needForUpdate = false (field on UI) , KeyForUpdate == true such as id keys for update such as IdMainDocument, IdDocumentTree, IdDocumentContainerScans)
            var data = otherDocumentDetail.OtherDocument.Where(predicate);

            if (otherDocumentDetail.PersonContact != null)
            {
                data = data.Concat(
                    otherDocumentDetail.PersonContact
                                       .Where(predicate)
                //.Select(columnBeneficiary => funcTransformData(columnBeneficiary, "BENEFICIARY"))
                );
            }

            if (otherDocumentDetail.PersonPrivat != null)
            {
                data = data.Concat(
                    otherDocumentDetail.PersonPrivat
                                       .Where(predicate)
                //.Select(columnRemitter => funcTransformData(columnRemitter, "REMITTER"))
                );
            }

            return data.ToList();
        }
    }
}
