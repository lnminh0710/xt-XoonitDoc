using Newtonsoft.Json;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public partial class GlobalBusiness : BaseBusiness, IGlobalBusiness
    {
        public async Task<WSDataReturn> GetTranslateLabelText(string originalText, string widgetMainID, string widgetCloneID, string idRepTranslateModuleType, string idTable, string fieldName, string tableName)
        {
            TranslateLabelGetData data = (TranslateLabelGetData)ServiceDataRequest.ConvertToRelatedType(typeof(TranslateLabelGetData));
            data.OriginalText = originalText;
            data.WidgetMainID = widgetMainID;
            data.WidgetCloneID = widgetCloneID;
            data.IdRepTranslateModuleType = idRepTranslateModuleType;
            data.IdTable = idTable;
            data.FieldName = fieldName;
            data.TableName = tableName;
            var result = await _globalService.GetTranslateLabelText(data);
            return result;
        }

        public async Task<WSEditReturn> SaveTranslateLabelText(TranslationModel model)
        {
            TranslateLabelSaveData data =
                (TranslateLabelSaveData)ServiceDataRequest.ConvertToRelatedType(typeof(TranslateLabelSaveData));
            if (model.Translations != null && model.Translations.Count > 0)
            {
                string modelValue = JsonConvert.SerializeObject(model.Translations, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
                data.JSONText = string.Format(@"""TranslateLabelText"":{0}", modelValue);
                data.JSONText = "{" + data.JSONText + "}";
                var result = await _globalService.SaveTranslateLabelText(data);
                return result;
            }
            return new WSEditReturn();
        }

        public async Task<WSDataReturn> GetTranslateText(string widgetMainID, string widgetCloneID, string fields)
        {
            TranslateTextGetData data = (TranslateTextGetData)ServiceDataRequest.ConvertToRelatedType(typeof(TranslateTextGetData));
            data.WidgetMainID = widgetMainID;
            data.WidgetCloneID = widgetCloneID;
            data.IdRepLanguage = UserFromService.IdRepLanguage;
            data.Fields = fields;
            var result = await _globalService.GetTranslateText(data);
            return result;
        }

        public async Task<object> GetCommonTranslateLabelText(string idRepLanguage = null)
        {
           
            TranslateLabelGetData data = (TranslateLabelGetData)ServiceDataRequest.ConvertToRelatedType(typeof(TranslateLabelGetData));
            if(data == null)
            {
                data = new TranslateLabelGetData();
                data.IdLogin = "0";

            }
            if (string.IsNullOrEmpty(data.IdLogin))
            {
                data.IdLogin = "0";
                data.LoginLanguage = idRepLanguage;
            }
            data.Mode = "GetAll";
            if(string.IsNullOrEmpty(data.IdRepTranslateModuleType))
            {
                data.IdRepTranslateModuleType = "5";
            }
            return await _globalService.GetCommonTranslateLabelText(data);
        }
    }
}
