using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using DMS.Utils;
using Newtonsoft.Json.Serialization;
using RestSharp;
using Microsoft.Extensions.Options;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [Authorize]
    public class BloombergController : BaseController
    {
        private readonly AppSettings _appSettings;
        private static string _bloomberg = string.Empty;

        /// <summary>
        /// BloombergURL
        /// </summary>
        public string BloombergURL
        {
            get
            {
                if (string.IsNullOrEmpty(_bloomberg))
                {
                    _bloomberg = _appSettings.BloombergUrl;
                }
                return _bloomberg;
            }
        }

        public BloombergController(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        // GET: api/bloomberg/GetExchangeMoney
        [HttpGet]
        [Route("GetExchangeMoney")]
        public async Task<object> GetExchangeMoney(string baseCurrency, string exchangeStr)
        {
            JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            RestClient restClient = new RestClient(string.Format("{0}&f={1}&iso={2}", BloombergURL, baseCurrency, exchangeStr));

            RestRequest request = new RestRequest("", Method.GET);
            request.AddHeader("Accept", "application/json");

            // string jsonObject = JsonConvert.SerializeObject(foo, Formatting.Indented, jsonSerializerSettings);
            // request.AddParameter("application/json", jsonObject, ParameterType.RequestBody);

            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();

            RestRequestAsyncHandle handle = restClient.ExecuteAsync(
                request, r => taskCompletion.SetResult(r));

            RestResponse response = (RestResponse)(await taskCompletion.Task);
            return JsonConvert.DeserializeObject<object>(response.Content.ToLower());
        }
    }
}
