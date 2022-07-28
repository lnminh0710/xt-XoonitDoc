namespace DMS.Utils.ElasticSearch
{
    public class ESSearchFieldBasic
    {
        /// <summary>
        /// FieldName
        /// - firstName.keyword: .keyword only used for Wildcard
        /// </summary>
        public string FieldName { get; set; }
        public string FieldValue { get; set; }

        /// <summary>
        /// Used to create QueryContainer List for Fields
        /// - Term, QueryString, Wildcard
        /// </summary>
        public ESQueryType QueryType { get; set; }

        /// <summary>
        /// Text, Keyword, Boolean, Numeric, Date
        /// </summary>
        public ESFieldDataType? FieldDataType { get; set; }

        public double? Boost { get; set; }

        public bool IsIgnoreSearch { get; set; }

        /// <summary>
        /// Not append subffix for Wildcard search
        /// </summary>
        public bool NotAppendSubffix { get; set; }

        public void Build()
        {
            try
            {
                FieldValue = FieldValue.Trim();
                if (FieldDataType.HasValue)
                {
                    switch (FieldDataType.Value)
                    {
                        case ESFieldDataType.Numeric:
                            var isNumeric = ConverterUtils.IsNumeric(FieldValue, out double n);
                            if (isNumeric != true) IsIgnoreSearch = true;
                            break;
                        case ESFieldDataType.Boolean:
                            var isBool = bool.TryParse(FieldValue, out bool b);
                            if (isBool != true) IsIgnoreSearch = true;
                            break;
                    }
                }

                if (!IsIgnoreSearch && QueryType == ESQueryType.Match)
                {
                    FieldValue = FieldValue.Replace("*", " ").Trim();
                    if (FieldValue.Length >= 2 && FieldValue[0] == '"' && FieldValue[FieldValue.Length - 1] == '"')
                        QueryType = ESQueryType.MatchPhrase;
                }
            }
            catch { }
        }
    }
}
