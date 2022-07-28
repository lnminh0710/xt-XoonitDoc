using DMS.Utils;
using DMS.Utils.ElasticSearch;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DMS.Models
{
    public class ESSearchDetailAdvanceModel
    {
        public string SearchIndex { get; set; }
        public string SearchType { get; set; }
        public string Keyword { get; set; }
        public int ModuleId { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public bool IsWithStar { get; set; }
        public string SearchWithStarPattern { get; set; }

        /// <summary>
        /// Conditions
        /// </summary>
        public IList<ESSearchAdvanceConditionItemModel> Conditions { get; set; }

        public ESSearchDetailAdvanceModel()
        {
            Conditions = new List<ESSearchAdvanceConditionItemModel>();
        }

        public ESSearchConditionRootGroups BuildSearchConditionGroups()
        {
            return BuildGroups(Conditions);
        }

        #region Groups
        private ESSearchConditionRootGroups BuildGroups(IList<ESSearchAdvanceConditionItemModel> conditions)
        {
            var conditionRootGroups = new ESSearchConditionRootGroups();

            #region From Data UI -> Build Data Model
            //If there only are conditions -> the second will get condition of the one
            if (conditions.Count >= 2)
            {
                conditions[0].Condition = conditions[1].Condition;
            }

            //1. Build Groups
            var groupsModelTemp = new ESSearchAdvanceConditionGroupsModel();
            var groupIndex = 1;
            for (int i = 0; i < conditions.Count; i++)
            {
                var conditionItem = conditions[i];

                #region Check to create New Group
                var isNeddToCreateNewGroup = false;
                if (conditionItem.Condition == ESSearchAdvanceConditionEnum.Or)
                {
                    //There is the 'Next' item
                    if (i + 1 <= conditions.Count - 1)
                    {
                        //'Next' item
                        var nextConditionItem = conditions[i + 1];
                        if (nextConditionItem.Condition == ESSearchAdvanceConditionEnum.And)
                        {
                            isNeddToCreateNewGroup = true;
                        }
                    }
                    if (!isNeddToCreateNewGroup && i - 1 >= 0)//'Previous' item
                    {
                        if (conditions[i - 1].Condition == ESSearchAdvanceConditionEnum.And)
                        {
                            isNeddToCreateNewGroup = true;
                        }
                    }
                }
                #endregion

                #region Create New Group
                if (isNeddToCreateNewGroup)
                {
                    groupsModelTemp.Items.Add(new ESSearchAdvanceConditionGroupModel() { GroupIndex = groupIndex++ });
                }

                var lastGroup = groupsModelTemp.Items.LastOrDefault();
                if (lastGroup == null)
                {
                    lastGroup = new ESSearchAdvanceConditionGroupModel() { GroupIndex = groupIndex++ };
                    groupsModelTemp.Items.Add(lastGroup);
                }
                #endregion

                lastGroup.Items.Add(conditionItem);
            }

            //2. Set Condition of Groups
            foreach (var item in groupsModelTemp.Items)
            {
                item.BuildCondition();
            }

            //3. Build Root Groups
            var rootGroupsModelTemp = new ESSearchAdvanceConditionRootGroupsModel();
            foreach (var groups in groupsModelTemp.Items.GroupBy(n => n.GroupIndex).ToList())
            {
                var groupsModel = new ESSearchAdvanceConditionGroupsModel() { Items = groups.ToList() };
                groupsModel.BuildCondition();
                rootGroupsModelTemp.Items.Add(groupsModel);
            }
            rootGroupsModelTemp.BuildCondition();
            #endregion

            #region From Data Model -> Build Search Conditions
            //1. Build ConditionGroups
            foreach (var groups in rootGroupsModelTemp.Items)
            {
                var conditionGroups = new ESSearchConditionGroups();
                foreach (var group in groups.Items)
                {
                    var conditionGroup = BuildGroup(group.Items, group.Condition == ESSearchAdvanceConditionEnum.Or ? ESQueryClause.Should : ESQueryClause.Must);
                    conditionGroups.Groups.Add(conditionGroup);
                }

                conditionGroups.BuildQueryClause();
                conditionRootGroups.Items.Add(conditionGroups);
            }
            conditionRootGroups.BuildQueryClause();

            if (rootGroupsModelTemp.Condition == ESSearchAdvanceConditionEnum.Or && conditionRootGroups.QueryClause == ESQueryClause.Must)
            {
                conditionRootGroups.QueryClause = ESQueryClause.Should;
            }
            #endregion

            return conditionRootGroups;
        }

        private ESSearchConditionGroup BuildGroup(IList<ESSearchAdvanceConditionItemModel> conditions, ESQueryClause queryClause)
        {
            var group = new ESSearchConditionGroup() { QueryClause = queryClause };

            var esConditionMust = new ESSearchCondition() { QueryClause = ESQueryClause.Must };
            var esConditionShould = new ESSearchCondition() { QueryClause = ESQueryClause.Should };
            var esConditionMustNot = new ESSearchCondition() { QueryClause = ESQueryClause.MustNot };

            foreach (var item in conditions)
            {
                var esField = new ESSearchField()
                {
                    FieldName = Common.FirstCharacterToLower(item.Field),
                    FieldValue = item.Value,
                    TermLevelQueryOperator = item.Operator
                };

                bool isDateTime = false;
                bool isNumeric = false;

                bool isBool = bool.TryParse(item.Value, out bool b);
                if (!isBool)
                {
                    isNumeric = ConverterUtils.IsNumeric(item.Value, out double n);
                    if (!isNumeric)
                    {
                        isDateTime = ConverterUtils.IsDateTime(item.Value, out DateTime dateTimeTemp);
                        if (isDateTime)
                        {
                            esField.FieldValue = dateTimeTemp.ToString("dd.MM.yyyy");
                        }
                    }
                }

                switch (item.Operator)
                {
                    case ESTermLevelQueryOperator.GreaterThan:
                    case ESTermLevelQueryOperator.GreaterThanOrEquals:
                    case ESTermLevelQueryOperator.LessThan:
                    case ESTermLevelQueryOperator.LessThanOrEquals:
                    case ESTermLevelQueryOperator.Difference:
                        esField.QueryType = ESQueryType.Term;
                        break;
                    case ESTermLevelQueryOperator.Equals:
                    case ESTermLevelQueryOperator.NotEquals:
                        if (isDateTime)
                        {
                            esField.QueryType = ESQueryType.Term;
                        }
                        else if (isBool || isNumeric)
                        {
                            esField.QueryType = ESQueryType.Term;
                            esField.TermLevel = ESTermLevelQuery.Term;
                        }
                        else
                        {
                            esField.QueryType = ESQueryType.Term;
                            esField.TermLevel = ESTermLevelQuery.Term;

                            esField.FieldName += ".keyword";
                        }
                        break;
                    case ESTermLevelQueryOperator.Contains:
                    case ESTermLevelQueryOperator.NotContains:
                        esField.FieldValue = "*" + esField.FieldValue + "*";

                        esField.QueryType = ESQueryType.Wildcard;
                        esField.FieldName += ".keyword";
                        break;
                }

                if (esField.QueryType == ESQueryType.Term)
                {
                    if (isBool)
                    {
                        esField.FieldDataType = ESFieldDataType.Boolean;
                    }
                    else if (isNumeric)
                    {
                        esField.FieldDataType = ESFieldDataType.Numeric;
                    }
                }

                if (esField.QueryType == ESQueryType.Term && esField.TermLevel == ESTermLevelQuery.None)
                {
                    if (isNumeric)
                        esField.TermLevel = ESTermLevelQuery.Range;
                    else if (isDateTime)
                        esField.TermLevel = ESTermLevelQuery.DateRange;
                    else if (isBool)
                        esField.TermLevel = ESTermLevelQuery.Term;
                    else
                        esField.TermLevel = ESTermLevelQuery.TermRange;
                }

                if (item.Operator == ESTermLevelQueryOperator.Difference ||
                    item.Operator == ESTermLevelQueryOperator.NotContains ||
                    item.Operator == ESTermLevelQueryOperator.NotEquals)
                {
                    esConditionMustNot.Fields.Add(esField);
                }
                else
                {
                    switch (item.Condition)
                    {
                        case ESSearchAdvanceConditionEnum.And:
                            esConditionMust.Fields.Add(esField);
                            break;
                        case ESSearchAdvanceConditionEnum.Or:
                            esConditionShould.Fields.Add(esField);
                            break;
                    }
                }
            }//for

            if (esConditionMust.Fields.Count > 0)
            {
                group.Conditions.Add(esConditionMust);
            }
            if (esConditionShould.Fields.Count > 0)
            {
                group.Conditions.Add(esConditionShould);
            }
            if (esConditionMustNot.Fields.Count > 0)
            {
                group.Conditions.Add(esConditionMustNot);

                if (group.Conditions.Count > 1)
                    group.ForceCreateGroup = true;
            }

            return group;
        }
        #endregion
    }
    public class ESSearchAdvanceConditionRootGroupsModel
    {
        public IList<ESSearchAdvanceConditionGroupsModel> Items { get; set; }
        public ESSearchAdvanceConditionEnum? Condition { get; set; }

        public ESSearchAdvanceConditionRootGroupsModel()
        {
            Items = new List<ESSearchAdvanceConditionGroupsModel>();
        }

        public void BuildCondition()
        {
            if (Items.Count <= 1) return;

            if (Items.Any(n => n.Condition == ESSearchAdvanceConditionEnum.Or || n.IsOrWithSiblings))
                Condition = ESSearchAdvanceConditionEnum.Or;
            else
                Condition = ESSearchAdvanceConditionEnum.And;
        }
    }

    public class ESSearchAdvanceConditionGroupsModel
    {
        public IList<ESSearchAdvanceConditionGroupModel> Items { get; set; }
        public ESSearchAdvanceConditionEnum? Condition { get; set; }
        public bool IsOrWithSiblings { get; set; }

        public ESSearchAdvanceConditionGroupsModel()
        {
            Items = new List<ESSearchAdvanceConditionGroupModel>();
        }

        public void BuildCondition()
        {
            IsOrWithSiblings = Items.Any(n => n.IsOrWithSiblings);

            if (Items.Count <= 1) return;

            if (Items.Any(n => n.Condition == ESSearchAdvanceConditionEnum.Or))
                Condition = ESSearchAdvanceConditionEnum.Or;
            else
                Condition = ESSearchAdvanceConditionEnum.And;
        }
    }

    public class ESSearchAdvanceConditionGroupModel
    {
        public IList<ESSearchAdvanceConditionItemModel> Items { get; set; }
        public ESSearchAdvanceConditionEnum? Condition { get; set; }
        public int GroupIndex { get; set; }
        public bool IsOrWithSiblings { get; set; }

        public ESSearchAdvanceConditionGroupModel()
        {
            Items = new List<ESSearchAdvanceConditionItemModel>();
        }

        public void BuildCondition()
        {
            if (Items.Count == 0) return;

            if (Items[0].Condition == ESSearchAdvanceConditionEnum.Or)
            {
                if (Items.Any(n => n.Condition == ESSearchAdvanceConditionEnum.And))
                {
                    IsOrWithSiblings = true;
                    Condition = ESSearchAdvanceConditionEnum.And;
                    foreach (var item in Items)
                    {
                        item.Condition = ESSearchAdvanceConditionEnum.And;
                    }
                }
                else
                {
                    Condition = ESSearchAdvanceConditionEnum.Or;
                }
            }
            else if (Items.All(n => n.Condition == ESSearchAdvanceConditionEnum.And))
                Condition = ESSearchAdvanceConditionEnum.And;
        }
    }

    public class ESSearchAdvanceConditionItemModel
    {
        /// <summary>
        /// And, Or
        /// </summary>
        public ESSearchAdvanceConditionEnum Condition { get; set; }

        /// <summary>
        /// =, <>, >,  <, >=, <=, Contain, NotContain, NotEquals
        /// </summary>
        public ESTermLevelQueryOperator Operator { get; set; }

        public string Field { get; set; }

        public string Value { get; set; }

        public IList<ESSearchAdvanceConditionItemModel> Children { get; set; }

        public ESSearchAdvanceConditionItemModel()
        {
            Children = new List<ESSearchAdvanceConditionItemModel>();
        }

        public int GroupIndex { get; set; }
    }

    public enum ESSearchAdvanceConditionEnum
    {
        And, Or
    }
}
