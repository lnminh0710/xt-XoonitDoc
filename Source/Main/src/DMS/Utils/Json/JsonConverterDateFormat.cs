using Newtonsoft.Json.Converters;

namespace DMS.Utils.Json
{
    public class JsonConverterDateFormat : IsoDateTimeConverter
    {
        public JsonConverterDateFormat(string format)
        {
            DateTimeFormat = format;
        }
    }
}
