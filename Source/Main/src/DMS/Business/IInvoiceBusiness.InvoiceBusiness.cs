using DMS.Constants;
using DMS.Models;
using DMS.Models.DMS.ViewModels;
using DMS.Models.DynamicControlDefinitions;
using DMS.Service;
using DMS.Utils;
using DMS.Utils.RestServiceHelper;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace DMS.Business
{
    public partial class InvoiceBusiness : BaseBusiness, IInvoiceBusiness
    {
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        private readonly IUniqueBusiness _uniqueBusiness;
        private readonly IInvoiceService _invoiceService;
        private readonly IContactBusiness _contactBusiness;
        private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        private readonly ICloudBusiness _cloudBusiness;
        private readonly IDynamicFieldsBusiness _dynamicFieldsBusiness;
        private readonly IDocumentBusiness _documentBusiness;

        public InvoiceBusiness(
            IHttpContextAccessor context,
            IInvoiceService invoiceService,
            IUniqueBusiness uniqueBusiness,
            IContactBusiness contactBusiness,
            IElasticSearchSyncBusiness elasticSearchSync,
            ICloudBusiness cloudBusiness,
            IDynamicFieldsBusiness dynamicFieldsBusiness,
            IDocumentBusiness documentBusiness) : base(context)
        {
            _invoiceService = invoiceService;
            _uniqueBusiness = uniqueBusiness;
            _elasticSearchSync = elasticSearchSync;
            _contactBusiness = contactBusiness;
            _cloudBusiness = cloudBusiness;
            _dynamicFieldsBusiness = dynamicFieldsBusiness;
            _documentBusiness = documentBusiness;
        }

        /// <summary>
        /// Get data setting column of invoice
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfInvoice(string addOnFields)
        {
            GetInvoiceData data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetInvoiceData)) as GetInvoiceData;
            data.IdLogin = this.UserFromService.IdLogin;
            data.IdApplicationOwner = this.UserFromService.IdApplicationOwner;
            data.LoginLanguage = this.UserFromService.IdRepLanguage;
            var result = await _invoiceService.GetDataSettingColumnsOfInvoice(data, addOnFields);

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

        public async Task<object> SaveInvoice(SaveInvoiceModel model, bool isUpdate = false)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            if (!string.IsNullOrEmpty(model.IdLogin) && !string.IsNullOrEmpty(model.IdApplicationOwner))
            {
                baseData.IdLogin = model.IdLogin;
                baseData.IdApplicationOwner = model.IdApplicationOwner;
            }

            SaveInvoiceData saveData = new SaveInvoiceData
            {
                BaseData = baseData,
                IgnoredKeys = new List<string>() { "CrudType" }
            };

            saveData.Data = new Dictionary<string, object>();

            var data = await _documentBusiness.HandleCommonDocumentBeforeSave(model, model.PersonBeneficiary?.PersonNr);
            saveData.IdCloudConnection = data.IdCloudConnection;
            saveData.SharingContact = data.SharingContact;
            var result = await _invoiceService.SaveInvoice(model, saveData);

            if (result != null && result.ReturnID == "-1")
            {
                _logger.Error("Error SaveInvoice " + result.SQLStoredMessage + "  Data: " + JsonConvert.SerializeObject(model));
                return result;
            };

            if (result == null || string.IsNullOrWhiteSpace(result.JsonReturnIds) || result.EventType == null || !"Successfully".Contains(result.EventType))
            {
                return new WSEditReturn
                {
                    ReturnID = "-1",
                    EventType = null,
                };
            }

            var jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(result.JsonReturnIds);
            jsonResult.IdDocumentContainerScans = model.MainDocument.IdDocumentContainerScans;
            jsonResult.ElasticSearchIndexName = ElasticSearchIndexName.InvoicePdm;
            jsonResult.IsUpdate = isUpdate;

            await _documentBusiness.HandleCommonDocumentAfterSave(jsonResult, model);
            return result;
        }

        public async Task<object> UpdateInvoice(SaveInvoiceModel model, string idMainDocument)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            if (!string.IsNullOrEmpty(model.IdLogin) && !string.IsNullOrEmpty(model.IdApplicationOwner))
            {
                baseData.IdLogin = model.IdLogin;
                baseData.IdApplicationOwner = model.IdApplicationOwner;
            }

            GetCapturedInvoiceDocumentDetailData getData = new GetCapturedInvoiceDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            // get data invoice detail
            var invoiceDetail = await GetCapturedInvoiceDocumentDetail(
                idMainDocument,

                // get all columns INVOICE by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1",

                // get all columns PERSON by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1", null);

            if (invoiceDetail == null) return null;

            SetIdsForInvoiceToUpdate(model, invoiceDetail.Invoice);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonBank, invoiceDetail.PersonBank);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonBeneficiary, invoiceDetail.PersonBeneficiary);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonRemitter, invoiceDetail.PersonRemitter);

            return await SaveInvoice(model, true);
        }

        public async Task<CapturedInvoiceDocumentDetailViewModel> GetCapturedInvoiceDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingInvoice, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedInvoiceDocumentDetailData getData = new GetCapturedInvoiceDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            // get data invoice detail
            var invoiceResult = await _invoiceService.GetCapturedInvoiceDocumentDetail(getData, addOnFields);
            
            if (invoiceResult == null) return null;

            var capturedInvoiceDetail = new CapturedInvoiceDocumentDetailViewModel();

            // transform data to IEnumerable<DocumentColumnSettingViewModel>
            var invoiceData = invoiceResult.Where(_col =>
                                            {
                                                var displayFieldSetting = _col.Setting.FirstOrDefault()?.DisplayField.DisplayField;

                                                return whereDisplaySettingInvoice(displayFieldSetting);
                                                // get all columns but hidden = true & readonly = true & needForUpdate = false, we don't need that. Because of UI don't have these fields
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

            capturedInvoiceDetail.Invoice = invoiceData;
            if (!string.IsNullOrEmpty(addOnFields))
            {
                return capturedInvoiceDetail;
            }
            // get idperson of PersonBank, PersonBeneficiary and PersonRemitter
            var objectModes = new Dictionary<string, PersonDataWithSuffix>
            {
                {  PersonContactObjectMode.BANK_CONTACT, new PersonDataWithSuffix { ObjectMode = PersonContactObjectMode.BANK_CONTACT, Suffix = PersonContactObjectMode.BANK_CONTACT_SUFFIX, IdPerson = 0 } },
                {  PersonContactObjectMode.BENEFICIARY_CONTACT, new PersonDataWithSuffix{ ObjectMode = PersonContactObjectMode.BENEFICIARY_CONTACT, Suffix = PersonContactObjectMode.BANK_CONTACT_SUFFIX, IdPerson = 0 } },
                {  PersonContactObjectMode.REMITTER_CONTACT, new PersonDataWithSuffix { ObjectMode = PersonContactObjectMode.REMITTER_CONTACT, Suffix = PersonContactObjectMode.REMITTER_CONTACT_SUFFIX, IdPerson = 0 } },
            };
            var idPersonCols = invoiceData.Where(invoiceCol =>
            {
                int idPerson = 0;
                PersonDataWithSuffix personDataWithSuffix = null;
                switch (invoiceCol.OriginalColumnName)
                {
                    case "IdPersonBank":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.BANK_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        return true;

                    case "IdPersonBeneficiary":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.BENEFICIARY_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        return true;

                    case "IdPersonRemitter":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.REMITTER_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        return true;

                    default:
                        return false;
                }
            }).ToList();

            if (!idPersonCols.Any()) return capturedInvoiceDetail;

            capturedInvoiceDetail.PersonBank = objectModes[PersonContactObjectMode.BANK_CONTACT].PersonData == null ? null :
                                                (await objectModes[PersonContactObjectMode.BANK_CONTACT].PersonData)
                                                .Where(data => whereDisplaySettingPerson(data.Setting.DisplayField))
                                                .ToArray();
            capturedInvoiceDetail.PersonBeneficiary = objectModes[PersonContactObjectMode.BENEFICIARY_CONTACT].PersonData == null ? null :
                                                        (await objectModes[PersonContactObjectMode.BENEFICIARY_CONTACT].PersonData)
                                                        .Where(data => whereDisplaySettingPerson(data.Setting.DisplayField))
                                                        .ToArray();
            capturedInvoiceDetail.PersonRemitter = objectModes[PersonContactObjectMode.REMITTER_CONTACT].PersonData == null ? null :
                                                    (await objectModes[PersonContactObjectMode.REMITTER_CONTACT].PersonData)
                                                    .Where(data => whereDisplaySettingPerson(data.Setting.DisplayField))
                                                    .ToArray();

            return capturedInvoiceDetail;
        }

        private void SetIdsForInvoiceToUpdate(SaveInvoiceModel model, IEnumerable<DocumentColumnSettingViewModel> columnIds)
        {
            foreach (var column in columnIds)
            {
                switch (column.OriginalColumnName)
                {
                    case nameof(B07MainDocument.IdMainDocument):
                        model.MainDocument.IdMainDocument = column.Value;
                        break;

                    case nameof(B07MainDocument.IdDocumentTree):
                        // model.MainDocument.IdDocumentTree = column.Value;
                        break;

                    case nameof(B07MainDocument.IdDocumentContainerScans):
                        model.MainDocument.IdDocumentContainerScans = column.Value;
                        break;

                    case nameof(B07InvoicePdm.IdInvoicePdm):
                        model.Invoice.IdInvoicePdm = column.Value;
                        break;

                    case nameof(B07DocumentTreeMedia.IdDocumentTreeMedia):
                        model.DocumentTreeMedia.IdDocumentTreeMedia = column.Value;
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
