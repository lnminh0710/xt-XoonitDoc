using System.Collections.Generic;
using System.Linq;

namespace DMS.Utils.ElasticSearch
{
    #region ES Search Field
    /*
    {
        "wildcard": {
            "firstName_lower.keyword": "charles"
        }
    }
    */
    public class ESSearchField
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

        /// <summary>
        /// DateRange, Range(Numeric), TermRange
        /// </summary>
        /// <param name=""></param>
        /// <param name=""></param>
        /// <returns></returns>
        public ESTermLevelQuery TermLevel { get; set; }

        /// <summary>
        /// CommonTerms,MatchPhrasePrefix,MatchPhrase,Match,MultiMatch,QueryString,SimpleQueryString
        /// </summary>
        public ESFullTextQuery FullTextQuery { get; set; }

        /// <summary>
        /// =, <>, >,  <, >=, <=, Contain, NotContain
        /// </summary>
        /// <param name=""></param>
        /// <param name=""></param>
        /// <returns></returns>
        public ESTermLevelQueryOperator TermLevelQueryOperator { get; set; }

    }
    #endregion

    #region ES Search Condition
    /* level Leaf Node
      "should": [
         {
            "wildcard": {
                "firstName_lower.keyword": "charles"
            }
         },
         {
            "wildcard": {
                "lastName_lower.keyword": "charles"
            }
        }
    ]
    */
    public class ESSearchCondition
    {
        public IList<ESSearchField> Fields { get; set; }

        /// <summary>
        /// Used to query
        /// - Should, Must, MustNot
        /// </summary>
        public ESQueryClause QueryClause { get; set; }

        public ESSearchCondition()
        {
            Fields = new List<ESSearchField>();
            QueryClause = ESQueryClause.Should;
        }
    }
    #endregion

    #region ES Search ConditionGroup
    /*"must": [
            {
              "bool": {
                "should": [
                  {
                    "wildcard": {
                      "firstName_lower.keyword": "charles"
                    }
                  },
                  {
                    "wildcard": {
                      "lastName_lower.keyword": "charles"
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "should": [
                  {
                    "wildcard": {
                      "firstName_lower.keyword": "berthoud"
                    }
                  },
                  {
                    "wildcard": {
                      "lastName_lower.keyword": "berthoud"
                    }
                  }
                ]
              }
            }
        ]*/
    public class ESSearchConditionGroup
    {
        public IList<ESSearchCondition> Conditions { get; set; }
        public ESQueryClause? QueryClause { get; set; }
        public bool ForceCreateGroup { get; set; }

        public ESSearchConditionGroup()
        {
            Conditions = new List<ESSearchCondition>();
        }

        public void BuildQueryClause()
        {
            if (Conditions.Count <= 1) return;

            if (Conditions.Any(n => n.QueryClause == ESQueryClause.Should))
                QueryClause = ESQueryClause.Should;
            else
                QueryClause = ESQueryClause.Must;
        }
    }
    #endregion

    #region ES Search ConditionGroups
    /*"should": [
        {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "firstName_lower.keyword": "chung"
                      }
                    }
                  ]
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "lastName_lower.keyword": "lam"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "bool": {
            "should": [
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "firstName_lower.keyword": "chung"
                      }
                    }
                  ]
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "lastName_lower.keyword": "lam"
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]*/
    public class ESSearchConditionGroups
    {
        public IList<ESSearchConditionGroup> Groups { get; set; }
        public ESQueryClause? QueryClause { get; set; }        

        public ESSearchConditionGroups()
        {
            Groups = new List<ESSearchConditionGroup>();
        }

        public void BuildQueryClause()
        {
            if (Groups.Count <= 0) return;

            if (Groups.Any(n => n.QueryClause == ESQueryClause.Should))
                QueryClause = ESQueryClause.Should;
            else
                QueryClause = ESQueryClause.Must;
        }

        public bool HasOrGroup()
        {
            return Groups.Any(n => n.ForceCreateGroup);
        }
    }
    #endregion

    #region ES Search Query Groups
    /*"bool": {
      "must": [],
      "must_not": [],
      "should": [
        {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "firstName_lower.keyword": "chung"
                      }
                    }
                  ]
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "lastName_lower.keyword": "lam"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "bool": {
            "should": [
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "firstName_lower.keyword": "chung"
                      }
                    }
                  ]
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "wildcard": {
                        "lastName_lower.keyword": "lam"
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }*/

    public class ESSearchConditionRootGroups
    {
        public IList<ESSearchConditionGroups> Items { get; set; }
        public ESQueryClause? QueryClause { get; set; }

        public ESSearchConditionRootGroups()
        {
            Items = new List<ESSearchConditionGroups>();
        }

        public void BuildQueryClause()
        {
            if (Items.Count <= 1) return;

            if (Items.Any(n => n.QueryClause == ESQueryClause.Should))
                QueryClause = ESQueryClause.Should;
            else
                QueryClause = ESQueryClause.Must;
        }
    }
    #endregion
}
