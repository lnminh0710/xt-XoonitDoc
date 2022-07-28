/**
 * ColHeaderKey
 **/
export class ColHeaderKey {
    static Delete = '_DeleteCol_';
    static IsDeleted = 'IsDeleted';
    static Mediacode = "_Mediacode_";
    static IsActive = 'IsActive';
    static Id = 'DT_RowId';
    static SelectAll = 'selectAll';
    static MasterCheckbox = 'IsMaster';
    static UnMergeCheckbox = 'UnMerge';
    static TreeViewPath = 'TreeViewPath';
    static BorderStatus = 'BorderStatus';
    static IsEditable = 'IsEditable';
    static IsActiveDisableRow = 'isActiveDisableRow';
    static Priority = 'Priority';
    static noExport = 'noExport';
    static RowDrag = 'RowDrag';
    static IsSelected = 'IsSelected';
}

export class GridLocale {
    // standard menu
    static copy = 'copy';
    static copyWithHeaders = 'copyWithHeaders';
    //static ctrlC = 'ctrlC';
    static paste = 'paste';
    //static ctrlV = 'ctrlV';

    // enterprise menu
    static pinColumn = 'pinColumn';
    static valueAggregation = 'valueAggregation';
    static autosizeThiscolumn = 'autosizeThiscolumn';
    static autosizeAllColumns = 'autosizeAllColumns';
    static groupBy = 'groupBy';
    static ungroupBy = 'ungroupBy';
    static resetColumns = 'resetColumns';
    static expandAll = 'expandAll';
    static collapseAll = 'collapseAll';
    static toolPanel = 'toolPanel';
    static export = 'export';
    static csvExport = 'csvExport';
    static excelExport = 'excelExport';
    static excelXmlExport = 'excelXmlExport';

    // the header of the default group column
    // static group = 'group';

    // tool panel
    static columns = 'columns';
    static filters = 'filters';
    static rowGroupColumns = 'rowGroupColumns';
    static rowGroupColumnsEmptyMessage = 'rowGroupColumnsEmptyMessage';
    static valueColumns = 'valueColumns';
    static pivotMode = 'pivotMode';
    static groups = 'groups';
    static values = 'values';
    static pivots = 'pivots';
    static valueColumnsEmptyMessage = 'valueColumnsEmptyMessage';
    static pivotColumnsEmptyMessage = 'pivotColumnsEmptyMessage';
    static toolPanelButton = 'toolPanelButton';

    // enterprise menu pinning
    static pinLeft = 'pinLeft';
    static pinRight = 'pinRight';
    static noPin = 'noPin';

    // enterprise menu aggregation and status bar
    // static sum = 'sum';
    // static min = 'min';
    // static max = 'max';
    static none = 'none';
    // static count = 'count';
    static average = 'average';
    static filteredRows = 'filteredRows';
    static selectedRows = 'selectedRows';
    static totalRows = 'totalRows';
    static totalAndFilteredRows = 'totalAndFilteredRows';
    static noRowsToShow = 'noRowsToShow';
}



export class SearchType {
    static Begin = 'Begin_*X';
    static End = 'End_X*';
    static Both = 'Both_*X*'
}
