using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Business;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class ContractController : BaseController
    {
        private readonly IContractBusiness _contractBusiness;

        public ContractController(IContractBusiness contractBusiness)
        {
            _contractBusiness = contractBusiness;
        }

        [HttpGet]
        [Route("DataSettingColumnsContract")]
        public async Task<object> GetDataSettingColumnsOfContact(string addOnFields)
        {
            var columns = await _contractBusiness.GetDataSettingColumnsOfContract(addOnFields);
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

        [HttpPost]
        [Route("SaveContract")]
        public async Task<object> SaveContract(string idMainDocument, [FromBody] SaveContractModel model)
        {
            if (model == null) return null;

            if (idMainDocument == null || String.IsNullOrWhiteSpace(idMainDocument))
            {
                return await _contractBusiness.SaveContract(model);
            }

            return await _contractBusiness.UpdateContract(model, idMainDocument);
        }

        [HttpGet]
        [Route("CapturedContractDocumentDetail")]
        public async Task<object> GetCapturedContractDocumentDetail(string idMainDocument, string addOnFields)
        {
            var contractDetail = await _contractBusiness.GetCapturedContractDocumentDetail(
               idMainDocument,
               // get all columns CONTRACT by condition hidden = false || readonly = false || needForUpdate = true
               (displaySetting) => (displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1"),

               // get all columns PERSON by condition hidden = false || readonly = false || needForUpdate = true
               (displaySetting) => (displaySetting.Hidden == "0" || displaySetting.ReadOnly == "0" || displaySetting.NeedForUpdate == "1")
               , addOnFields
           );

            if (contractDetail == null) return null;

            Func<DocumentColumnSettingViewModel, bool> predicate = (column) =>
            {
                return column.GetSetting().DisplayField.Hidden == "0" || column.GetSetting().DisplayField.ReadOnly == "0" || column.GetSetting().DisplayField.KeyForUpdate == "1";
            };
            //Func<DocumentColumnSettingViewModel, string, DocumentColumnSettingViewModel> funcTransformData = (column, suffix) =>
            //{
            //    column.OriginalColumnName = $"{column.OriginalColumnName}_{suffix}";
            //    return column;
            //};

            // filter again get fields id that needForUpdate = false (field on UI) , KeyForUpdate == true such as id keys for update such as IdMainDocument, IdDocumentTree, IdDocumentContainerScans)
            var data = contractDetail.Contract.Where(predicate);

            if (contractDetail.PersonContractor != null)
            {
                data = data.Concat(
                    contractDetail.PersonContractor
                                  .Where(predicate)
                                  //.Select(columnBeneficiary => funcTransformData(columnBeneficiary, "CONTRACTOR"))
                );
            }
            if (contractDetail.PersonContractingParty != null)
            {
                data = data.Concat(
                    contractDetail.PersonContractingParty
                                  .Where(predicate)
                                  //.Select(columnRemitter => funcTransformData(columnRemitter, "CONTRACTINGPARTY"))
                );
            }


            return data.ToList();
        }
    }
}
