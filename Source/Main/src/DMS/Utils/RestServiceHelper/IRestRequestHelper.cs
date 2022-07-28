using System;
using System.Collections.Generic;
using RestSharp;
using System.Threading.Tasks;
using DMS.Constants;

namespace DMS.Utils
{
    /// <summary>
    /// IRestRequestHelper
    /// </summary>
    public interface IRestRequestHelper : IDisposable
    {
        string BaseUrl { set; }

        string ServiceName { set; }

        string AuthString { set; }

        //void AddBody(object obj);

        //void AddJsonBody(object obj);

        //void AddParameter(string name, object value, ParameterType parameterType);

        //void AddJsonParameter(string name, object value, ParameterType parameterType = ParameterType.QueryString, bool isIgnoreNullValue = false);

        void AddParameter(RestRequest request, string name, object value, ParameterType parameterType);

        Task<Dictionary<int, object>> Execute(string resource, Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType, Method method, Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<Dictionary<int, object>> Get(Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType = EExecuteMappingType.Normal, string resource = "", Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<Dictionary<int, object>> Post(Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType = EExecuteMappingType.Normal, string resource = "", Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<Dictionary<int, object>> Put(Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType = EExecuteMappingType.Normal, string resource = "", Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<Dictionary<int, object>> Patch(Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType = EExecuteMappingType.Normal, string resource = "", Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<Dictionary<int, object>> Delete(Dictionary<int, Type> expectedReturn, EExecuteMappingType mappingType = EExecuteMappingType.Normal, string resource = "", Dictionary<string, object> parameter = null, object body = null, string version = "");

        Task<T> ExecutePost<T>(object body, EExecuteMappingType mappingType, Dictionary<string, object> parameter = null, string resource = "", string version = "", int resultIndexForParsing = 0) where T : class;
    }
}
