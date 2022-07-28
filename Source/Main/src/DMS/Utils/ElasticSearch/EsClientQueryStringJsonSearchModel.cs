namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// Es Client Query String Json Search Model
    /// </summary>
    public class EsClientQueryStringJsonSearchModel
    {
        public string Name { get; set; }
        public string Val { get; set; }
        public ESQueryType QType { get; set; }
    }
}
