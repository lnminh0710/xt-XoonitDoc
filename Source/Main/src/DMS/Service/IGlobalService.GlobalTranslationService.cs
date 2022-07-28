using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Utils;
using Newtonsoft.Json.Linq;

namespace DMS.Service
{
    public partial class GlobalService : BaseUniqueServiceRequest, IGlobalService
    {
        #region Translation
        public async Task<WSDataReturn> GetTranslateLabelText(TranslateLabelGetData data)
        {
            data.MethodName = "SpAppWidgetTranslate";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }

        public async Task<WSEditReturn> SaveTranslateLabelText(TranslateLabelSaveData data)
        {
            data.MethodName = "SpCallTranslate";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<IList<WSEditReturn>>(bodyRquest, Constants.EExecuteMappingType.Normal));
            return response?.FirstOrDefault();
        }

        public async Task<WSDataReturn> GetTranslateText(TranslateTextGetData data)
        {
            data.MethodName = "SpAppWg001TextTranslate";
            data.Object = "TranslateText";
            BodyRequest bodyRquest = CreateBodyRequest(data);

            var response = await Execute(() => Service.ExecutePost<JArray>(bodyRquest, Constants.EExecuteMappingType.None));
            return new WSDataReturn(response);
        }

        public Task<object> GetCommonTranslateLabelText(TranslateLabelGetData data)
        {
            data.MethodName = "SpAppWidgetTranslate";
            return GetDataWithMapTypeIsNone(data);
        }

        #endregion
    }
}
