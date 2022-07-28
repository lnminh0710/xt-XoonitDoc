using System.Net;
using System.Text.RegularExpressions;

namespace DMS.Utils.ElasticSearch
{
    public class EsBaseDocument
    {
        public long Id { get; set; }

        public string RemoveHtml(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";

            text = WebUtility.HtmlDecode(text);
            //You must replace the 'br' tag first and then remove the html tags, otherwise it will lose the trace of 'br' tag
            //text = Regex.Replace(text, @"<\/? ?br ?\/?>", "\r\n");
            text = Regex.Replace(text, @"<(.|\n)*?>", " ");

            return text.Trim();
        }
    }
}
