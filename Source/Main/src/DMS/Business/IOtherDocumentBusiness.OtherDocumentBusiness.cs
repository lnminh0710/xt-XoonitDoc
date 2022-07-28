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
    public partial class OtherDocumentBusiness : BaseBusiness, IOtherDocumentBusiness
    {
        private readonly IOtherDocumentService _otherDocumentService;
        private readonly IContactBusiness _contactBusiness;
        //private readonly IElasticSearchSyncBusiness _elasticSearchSync;
        //private readonly ICloudBusiness _cloudBusiness;
        private readonly IDynamicFieldsBusiness _dynamicFieldsBusiness;
        private readonly IDocumentBusiness _documentBusiness;
        private static readonly log4net.ILog _logger = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "api");

        public OtherDocumentBusiness(
            IHttpContextAccessor context
            , IOtherDocumentService otherDocumentService
            , IElasticSearchSyncBusiness elasticSearchSync
            , IContactBusiness contactBusiness
            , ICloudBusiness cloudBusiness
            , IDynamicFieldsBusiness dynamicFieldsBusiness
            , IDocumentBusiness documentBusiness
            ) : base(context)
        {
            this._otherDocumentService = otherDocumentService;
            //this._elasticSearchSync = elasticSearchSync;
            this._contactBusiness = contactBusiness;
            //_cloudBusiness = cloudBusiness;
            _dynamicFieldsBusiness = dynamicFieldsBusiness;
            _documentBusiness = documentBusiness;
        }

        public async Task<object> SaveOtherDocument(SaveOtherDocumentModel model, bool isUpdate = false)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));
            if (!string.IsNullOrEmpty(model.IdLogin) && !string.IsNullOrEmpty(model.IdApplicationOwner))
            {
                baseData.IdLogin = model.IdLogin;
                baseData.IdApplicationOwner = model.IdApplicationOwner;
            }
            SaveOtherDocumentData saveData = new SaveOtherDocumentData
            {
                BaseData = baseData,
                IgnoredKeys = new List<string>() { "CrudType" }
            };

            saveData.Data = new Dictionary<string, object>();

            var data = await _documentBusiness.HandleCommonDocumentBeforeSave(model, model.PersonContact?.PersonNr);
            saveData.IdCloudConnection = data.IdCloudConnection;
            saveData.SharingContact = data.SharingContact;

            var result = await _otherDocumentService.SaveOtherDocument(saveData, model);

            if( result != null && result.ReturnID == "-1")
            {
                _logger.Error("Error SaveOtherDocument " + result.SQLStoredMessage + "  Data: " + JsonConvert.SerializeObject(model));
                return result;
            };

            if (result == null || string.IsNullOrWhiteSpace(result.JsonReturnIds) || result.EventType == null || !"Successfully".Contains(result.EventType))
            {
                _logger.Error("Error SaveOtherDocument : " + result == null ? "NULL" : JsonConvert.SerializeObject(result) + "  Data: " + JsonConvert.SerializeObject(model));
                return result;
            }

            var jsonResult = JsonConvert.DeserializeObject<SaveDocumentResultModel>(result.JsonReturnIds);
            jsonResult.IdDocumentContainerScans = model.MainDocument.IdDocumentContainerScans;
            jsonResult.ElasticSearchIndexName = ElasticSearchIndexName.OtherDocuments;
            jsonResult.IsUpdate = isUpdate;

            try
            {
                await _documentBusiness.HandleCommonDocumentAfterSave(jsonResult, model);
            }
            catch (Exception err)
            {
                _logger.Error("FINAL SaveOtherDocument", err);
            }
            
            _logger.Error("FINAL SaveOtherDocument : " + result == null ? "NULL" : JsonConvert.SerializeObject(result) + "  jsonResult: " + JsonConvert.SerializeObject(jsonResult));
            return result;
        }

        public async Task<object> UpdateOtherDocument(SaveOtherDocumentModel model, string idMainDocument)
        {
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedOtherDocumentDetailData getData = new GetCapturedOtherDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            // get data other document detail
            var otherDocumentDetail = await GetCapturedOtherDocumentDetail(
                idMainDocument,

                // get all columns INVOICE by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1",

                // get all columns PERSON by condition needForUpdate = 1 are Id keys
                (displaySetting) => displaySetting.NeedForUpdate == "1",
                null);

            if (otherDocumentDetail == null) return null;

            SetIdsForOtherDocumentToUpdate(model, otherDocumentDetail.OtherDocument);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonContact, otherDocumentDetail.PersonContact);
            _contactBusiness.SetIdsForPersonContactToUpdate(model.PersonPrivat, otherDocumentDetail.PersonPrivat);

            return await SaveOtherDocument(model, true);
        }

        public async Task<CapturedOtherDocumentDetailViewModel> GetCapturedOtherDocumentDetail(string idMainDocument, Predicate<DisplayFieldSetting> whereDisplaySettingOtherDocument, Predicate<DisplayFieldSetting> whereDisplaySettingPerson, string addOnFields)
        {
            /* GET CAPTURED CONTRACT DETAIL */
            Data baseData = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(Data));

            GetCapturedOtherDocumentDetailData getData = new GetCapturedOtherDocumentDetailData
            {
                IdMainDocument = idMainDocument,
                IdLogin = UserFromService.IdLogin,
                LoginLanguage = UserFromService.IdRepLanguage,
                IdApplicationOwner = UserFromService.IdApplicationOwner,
            };

            var otherDocumentResults = await _otherDocumentService.GetCapturedOtherDocumentDetail(getData, addOnFields);

            if (otherDocumentResults == null) return null;

            var capturedOtherDocumentDetail = new CapturedOtherDocumentDetailViewModel();

            // transform data to IEnumerable<DocumentColumnSettingViewModel>
            var otherDocumentDetail = otherDocumentResults.Where(_col =>
                                                           {
                                                               var displayFieldSetting = _col.Setting.FirstOrDefault()?.DisplayField.DisplayField;
                                                               return whereDisplaySettingOtherDocument(displayFieldSetting);

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
                                                           });

            capturedOtherDocumentDetail.OtherDocument = otherDocumentDetail;
            if (!string.IsNullOrEmpty(addOnFields))
            {
                return capturedOtherDocumentDetail;
            }
            // get idperson of Person Contact, Person Privat
            var objectModes = new Dictionary<string, PersonDataWithSuffix>
            {
                {  PersonContactObjectMode.CONTACT, new PersonDataWithSuffix{ ObjectMode = PersonContactObjectMode.CONTACT, Suffix = PersonContactObjectMode.CONTACT_SUFFIX, IdPerson = 0 } },
                {  PersonContactObjectMode.PRIVATE_CONTACT, new PersonDataWithSuffix { ObjectMode = PersonContactObjectMode.PRIVATE_CONTACT, Suffix = PersonContactObjectMode.PRIVATE_CONTACT_SUFFIX, IdPerson = 0 } },
            };
            var idPersonCols = otherDocumentDetail.Where(invoiceCol =>
            {
                int idPerson = 0;
                PersonDataWithSuffix personDataWithSuffix = null;
                switch (invoiceCol.OriginalColumnName)
                {
                    case "IdPersonContact":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        return true;

                    case "IdPersonPrivat":
                        int.TryParse(invoiceCol.Value, out idPerson);
                        personDataWithSuffix = objectModes[PersonContactObjectMode.PRIVATE_CONTACT];
                        personDataWithSuffix.PersonData = _contactBusiness.GetContactDocumentDetail(idPerson, personDataWithSuffix.ObjectMode);
                        personDataWithSuffix.IdPerson = idPerson;
                        return true;

                    default:
                        return false;
                }
            }).ToArray();

            if (!idPersonCols.Any()) return capturedOtherDocumentDetail;

            capturedOtherDocumentDetail.PersonContact = objectModes[PersonContactObjectMode.CONTACT].PersonData == null ? null :
                                                     (await objectModes[PersonContactObjectMode.CONTACT].PersonData)
                                                     .Where(data => whereDisplaySettingPerson(data.GetSetting().DisplayField))
                                                     .ToArray();
            capturedOtherDocumentDetail.PersonPrivat = objectModes[PersonContactObjectMode.PRIVATE_CONTACT].PersonData == null ? null :
                                                        (await objectModes[PersonContactObjectMode.PRIVATE_CONTACT].PersonData)
                                                        .Where(data => whereDisplaySettingPerson(data.GetSetting().DisplayField))
                                                        .ToArray();

            return capturedOtherDocumentDetail;
        }

        private bool SetIdCloudConnectionToParameterJsonDocumentTreeMedia(string idCloudConnection, SaveOtherDocumentData saveData)
        {
            if (idCloudConnection == null) return false;

            var documentTreeMediaJArray = saveData.Data[nameof(SaveOtherDocumentModel.DocumentTreeMedia)] as JArray;

            if (documentTreeMediaJArray.Count <= 0) return false;

            if ((documentTreeMediaJArray[0] as JObject).ContainsKey("IdCloudConnection"))
            {
                (documentTreeMediaJArray[0] as JObject).Remove("IdCloudConnection");
            }

            (documentTreeMediaJArray[0] as JObject).Add("IdCloudConnection", new JValue(idCloudConnection));
            return true;
        }

        private void SetIdsForOtherDocumentToUpdate(SaveOtherDocumentModel model, IEnumerable<DocumentColumnSettingViewModel> columnIds)
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

                    case nameof(B07OtherDocuments.IdOtherDocuments):
                        if(model.OtherDocuments != null) model.OtherDocuments.IdOtherDocuments = column.Value;
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

        public async Task<IEnumerable<DocumentColumnSettingViewModel>> GetDataSettingColumnsOfOtherDocuments(string addOnFields)
        {
            Data data = (Data)ServiceDataRequest.ConvertToRelatedType(typeof(GetInvoiceData));
            var result = await _otherDocumentService.GetDataSettingColumnsOfOtherDocuments(data, addOnFields);
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
            }).ToList();
        }
    }
}
