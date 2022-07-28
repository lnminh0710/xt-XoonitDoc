namespace DMS.Utils.ElasticSearch
{
    public enum ESFullTextQuery
    {
        None,

        CommonTerms,
        MatchPhrasePrefix,
        MatchPhrase,
        Match,
        MultiMatch,
        QueryString,
        SimpleQueryString
    }
}
