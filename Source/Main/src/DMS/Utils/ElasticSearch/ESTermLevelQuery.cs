namespace DMS.Utils.ElasticSearch
{
    public enum ESTermLevelQuery
    {
        None,

        DateRange,

        /// <summary>
        /// NumericRange
        /// </summary>
        Range,

        /// <summary>
        /// StringRange
        /// </summary>
        TermRange,

        /// <summary>
        /// Exactly Text
        /// </summary>
        Term
    }
}
