using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DMS.Constants;
using DMS.Models;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Hangfire;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DMS.Business
{
    public partial class ContractBusiness : BaseBusiness, IContractBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        private readonly IContractService _contractService;
        private readonly IContactBusiness _contactBusiness;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly ICloudBusiness _cloudBusiness;
        private readonly IDynamicFieldsBusiness _dynamicFieldsBusiness;
        private readonly IDocumentBusiness _documentBusiness;
        private readonly IDocumentContainerService _documentContainerService;

        public ContractBusiness(
            IHttpContextAccessor context
            , IContractService contractService
            , IElasticSearchSyncBusiness elasticSearchSync
            , IContactBusiness contactBusiness
            , ICloudBusiness cloudBusiness
            , IDynamicFieldsBusiness dynamicFieldsBusiness
            , IDocumentBusiness documentBusiness
            , IDocumentContainerService documentContainerService
            ) : base(context)
        {
            this._contractService = contractService;
            this._elasticSearchSync = elasticSearchSync;
            this._contactBusiness = contactBusiness;
            _cloudBusiness = cloudBusiness;
            _dynamicFieldsBusiness = dynamicFieldsBusiness;
            _documentBusiness = documentBusiness;
            _documentContainerService = documentContainerService;
        }

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfContract(string addOnFields)
        {
            GetContractData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetContractData)) as GetContractData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;

            var result = await _contractService.GetDataSettingColumnsOfContract(data, addOnFields);
            return result.Select(column => new DocumentColumnSettingViewModel
            {
                ColumnName = column.ColumnName,
                OriginalColumnName = column.OriginalColumnName,
                DataType = column.DataType,
                DataLength = column.DataLength,
                Value = column.Value,
                Setting = new ColumnDefinitionSetting
                {
                    DisplayField = column.Setting.FirstOrDefault()?.DisplayField?.DisplayField,
                    ControlType = column.Setting.FirstOrDefault()?.ControlType?.ControlType,
                    CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                    Validators = column.Setting.FirstOrDefault()?.Validators?.Validators,
                }
            });
        }


        public async Task<object> SaveContract(SaveContractModel model, bool isUpdate = false)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            if (!string.IsNullOrEmpty(model.IdLogin) && !string.IsNullOrEmpty(model.IdApplicationOwner))
            {
                baseData.IdLogin = model.IdLogin;
                baseData.IdApplicationOwner = model.IdApplicationOwner;
            }

            SaveContractData saveData = new SaveContractData
            {
                BaseData = baseData,
                IgnoredKeys = new List<string>() { "CrudType" }
            };


            DocumentContainerPageScanData dataOCR = (DocumentContainerPageScanData)ServiceDataRequest.ConvertToRelatedType(typeof(DocumentContainerPageScanData));

            if (model.OCRJsonTextPositions != null)
            {
                JSONDocumentContainerTextPosition jSONDocumentContainerPageScan = new JSONDocumentContainerTextPosition
                {
                    DocumentContainerOCRTextPosition = model.OCRJsonTextPositions
                };

                dataOCR.JSONDocumentContainerOCR = JsonConvert.SerializeObject(jSONDocumentContainerPageScan);
                model.OCRJsonTextPositions = null;
            }


            saveData.Data = new Dictionary<string, object>();

            var data = await _documentBusiness.HandleCommonDocumentBeforeSave(model, model.PersonContractingParty?.PersonNr);

            saveData.IdCloudConnection = data.IdCloudConnection;
            saveData.SharingContact = data.SharingContact;
            var result = await _contractService.SaveContract(saveData, model);

            if (result != null && result.ReturnID == "-1")
            {
                _logger.Error("Error SaveContract " + result.SQLStoredMessage + "  Data: " + JsonConvert.SerializeObject(model));
                return result;
            };

            if (result == null || string.IsNullOrWhiteSpace(result.JsonReturnIds) || result.EventType == null || !"Successfully".Contains(result.EventType))
            {
                return result;
            }

            if (string.IsNullOrEmpty(dataOCR.JSONDocumentContainerOCR))
            {
                var resultSaveOCRPosition = await _documentContainerService.SaveOCRPositionOnContainerFile(dataOCR);
                if (resultSaveOCRPosition == null || string.IsNullOrWhiteSpace(resultSaveOCRPosition.JsonReturnIds)
                            || resultSaveOCRPosition.EventType == null || !"Successfully".Contains(resultSaveOCRPosition.EventType))
                {
                    _logger.Error("_error save data OCR Postiion: " + resultSaveOCRPosition.ToString());
                }
            }            

            var jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(result.JsonReturnIds);
            jsonResult.IdDocumentContainerScans = model.MainDocument.IdDocumentContainerScans;
            jsonResult.ElasticSearchIndexName = ElasticSearchIndexName.Contract;
            jsonResult.IsUpdate = isUpdate;

           
            await _documentBusiness.HandleCommonDocumentAfterSave(jsonResult, model);
            return result;
        }

        public async Task<CapturedContractDocumentDetailViewModel> GetCapturedContractDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingContract, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields)
        {
            /* GET CAPTURED CONTRACT DETAIL */
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedContractDocumentDetailData getData = new GetCapturedContractDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            var contractResults = await _contractService.GetCapturedContractDocumentDetail(getData, addOnFields);

            if (contractResults == null) return null;

            var capturedContractDetail = new CapturedContractDocumentDetailViewModel();

            // transform data to IEnumerable<DocumentColumnSettingViewModel>
            var contractDetail = contractResults.Where(_col =>
                                                {
                                                    var displayFieldSetting = _col.Setting.FirstOrDefault()?.DisplayField.DisplayField;
                                                    return whereDisplaySettingContract(displayFieldSetting);

                                                    //// get all columns but hidden = true & readonly = true & needForUpdate = false, we don't need that. Because of UI don't have these fields
                                                    //if (displayFieldSetting.Hidden == "1" && displayFieldSetting.ReadOnly == "1" && displayFieldSetting.NeedForUpdate == "0") return false;

                                                    //return true;
                                                })
                                                .Select(column =>
                                                {
                                                    var columnViewModel = new DocumentColumnSettingViewModel
                                                    {
                                                        ColumnName = column.ColumnName,
                                                        OriginalColumnName = column.OriginalColumnName,
                                                        DataType = column.DataType,
                                                        DataLength = column.DataLength,
                                                        Value = column.Value,
                                                        Setting = new ColumnDefinitionSetting
                                                        {
                                                            DisplayField = column.Setting.FirstOrDefault()?.DisplayField?.DisplayField,
                                                            ControlType = column.Setting.FirstOrDefault()?.ControlType?.ControlType,
                                                            CustomStyle = column.Setting.FirstOrDefault()?.CustomStyle,
                                                            Validators = column.Setting.FirstOrDefault()?.Validators?.Validators,
                                                        }
                                                    };
                                                    if (columnViewModel.Setting.DisplayField.Hidden == "1" && columnViewModel.Setting.DisplayField.ReadOnly == "0") return columnViewModel;

                                                    columnViewModel.OriginalColumnName = column.OriginalColumnName.Substring(column.OriginalColumnName.LastIndexOf('_') + 1);
                                                    return columnViewModel;
                                                }).ToList();

            capturedContractDetail.Contract = contractDetail;
            if (!string.IsNullOrEmpty(addOnFields))
            {
                return capturedContractDetail;
            }
            // get idperson of Person Contractor, Person Contracting Party
            var objectModes = new Dictionary<string, PersonDataWithSuffix>
            {
                {  PersonContactObjectMode.CONTRACTOR_CONTACT, new PersonDataWithSuffix{ ObjectMode = PersonContactObjectMode.CONTRACTOR_CONTACT, Suffix = PersonContactObjectMode.CONTRACTOR_CONTACT_SUFFIX, IdPerson = 0 } },
                {  PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT, new PersonDataWithSuffix { ObjectMode = PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT, Suffix = PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT_SUFFIX, IdPerson = 0 } },
            };
            var idPersonCols = contractDetail.Where(invoiceCol =>
            {
                int idPerson = 0;
                PersonDataWithSuffix personDataWithSuffix = null;
                switch (invoiceCol.OriginalColumnName)
                {
                    case "IdPersonContractor":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.CONTRACTOR_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        //if (idPerson == 0) return false;
                        return true;

                    case "IdPersonContractingParty":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        //if (idPerson == 0) return false;
                        return true;

                    default:
                        return false;
                }
            }).ToList();

            if (!idPersonCols.Any()) return capturedContractDetail;

            capturedContractDetail.PersonContractor = objectModes[PersonContactObjectMode.CONTRACTOR_CONTACT].PersonData == null ? null :
                                                    (await objectModes[PersonContactObjectMode.CONTRACTOR_CONTACT].PersonData)
                                                    .Where(data => whereDisplaySettingPerson(data.GetSetting().DisplayField))
                                                    .ToArray();
            capturedContractDetail.PersonContractingParty = objectModes[PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT].PersonData == null ? null :
                                                            (await objectModes[PersonContactObjectMode.CONTRACTOR_PARTY_CONTACT].PersonData)
                                                            .Where(data => whereDisplaySettingPerson(data.GetSetting().DisplayField))
                                                            .ToArray();

            return capturedContractDetail;
        }

        public async Task<object> UpdateContract(SaveContractModel model, string idMainDocument)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedContractDocumentDetailData getData = new GetCapturedContractDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            // get data contract detail
            var contractDetail = await GetCapturedContractDocumentDetail(
                idMainDocument,

                // get all columns INVOICE by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1",

                // get all columns PERSON by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1"
                , null);

            if (contractDetail == null) return null;

            SetIdsForContractToUpdate(model, contractDetail.Contract);            
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonContractor, contractDetail.PersonContractor);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonContractingParty, contractDetail.PersonContractingParty);

            return await SaveContract(model, true);
        }

        private void SetIdsForContractToUpdate(SaveContractModel model, IEnumerable<DocumentColumnSettingViewModel> columnIds)
        {
            foreach (var column in columnIds)
            {
                switch (column.OriginalColumnName)
                {
                    case nameof(B07MainDocument.IdMainDocument):
                        model.MainDocument.IdMainDocument = column.Value;
                        break;

                    case nameof(B07MainDocument.IdDocumentTree):
                        model.MainDocument.MainDocumentTree.IdDocumentTree = column.Value;
                        break;

                    case nameof(B07MainDocument.IdDocumentContainerScans):
                        model.MainDocument.IdDocumentContainerScans = column.Value;
                        break;

                    case nameof(B07Contract.IdContract):
                        if(model.Contract != null) model.Contract.IdContract = column.Value;
                        break;

                    case nameof(B07DocumentTreeMedia.IdDocumentTreeMedia):
                        if(model.DocumentTreeMedia != null) model.DocumentTreeMedia.IdDocumentTreeMedia = column.Value;
                        break;

                    case "JsonDynamicFields":
                        if (string.IsNullOrWhiteSpace(column.Value)) break;
                        _dynamicFieldsBusiness.SetIdsForDynamicFields(model.DynamicFields, column.Value);
                        break;

                    default:
                        break;
                }
            }
        }
    }
}
