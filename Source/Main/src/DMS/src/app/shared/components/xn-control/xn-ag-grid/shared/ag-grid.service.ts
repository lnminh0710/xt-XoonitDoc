import { Injectable } from '@angular/core';
import { ControlGridModel } from '@app/models';
// import { ColDef, CellClassParams, TooltipParams } from 'ag-grid-community';
import { CellClassParams, ColDef, ITooltipParams } from 'ag-grid-community';
import { DatatableService, AccessRightsService } from '@app/services';
import {
    CheckboxReadOnlyCellRenderer,
    CheckboxEditableCellRenderer,
    DropdownCellRenderer,
    CheckboxHeaderCellRenderer,
    DeleteCheckboxHeaderCellRenderer,
    NumericEditableCellRenderer,
    TemplateButtonCellRenderer,
    CountryFlagCellRenderer,
    IconCellRenderer,
    IconTextCellRenderer,
    DateCellRenderer,
    ControlCheckboxCellRenderer,
    CreditCardCellRenderer,
    SelectAllCheckboxHeaderCellRenderer,
    RefTextboxCellRenderer,
    MasterUnmergeCheckboxCellRenderer,
    PriorityDropdownCellRenderer,
    LabelFormatCellRenderer,
    ImageTextCellRenderer,
    DownloadColCellRenderer,
    TagLabelsCellRenderer,
    SearchInlineCellRenderer,
    ArticleSearchInlineCellRenderer,
    HistorySyncStatusRenderer,
    AutoCompleteCellRenderer,
    TableDropdownCellRenderer,
    FileCellRenderer,
    FileSizeCellRenderer,
} from '../components';
import { ColHeaderKey, GridLocale } from './ag-grid-constant';
import isObject from 'lodash-es/isObject';
import isNil from 'lodash-es/isNil';
import { parse, compareAsc, format } from 'date-fns/esm';

import { Uti } from '@app/utilities';
import { AccessRightTypeEnum, HistoryWidget } from '@app/app.constants';
import { TranslateService } from '@ngx-translate/core';

/**
 * GridConfig
 */
export interface IAgGridData {
    columnDefs: Array<ColDef>;
    rowData: Array<any>;
}

@Injectable()
export class AgGridService {
    historyClass = '';
    constructor(
        private datatableService: DatatableService,
        private accessRightService: AccessRightsService,
        private uti: Uti,
        private translateService: TranslateService,
    ) {}

    /**
     * mapDataSource
     * @param controlGridModel
     */
    public mapDataSource(controlGridModel: ControlGridModel, config): IAgGridData {
        const dataSource: IAgGridData = {
            rowData: [],
            columnDefs: [],
        };
        try {
            if (!controlGridModel || !controlGridModel.columns) {
                return;
            }

            const statusCol = controlGridModel.columns.find((p) => p.data == ColHeaderKey.BorderStatus);

            if (config.masterDetail) {
                dataSource.columnDefs.push(this.createMasterDetailGroupCol());
            }

            if (config.rowDrag) {
                dataSource.columnDefs.push(this.createRowDragCol());
            }

            if (config.rowDragDrop) {
                dataSource.columnDefs.push(this.createRowDragDropCol());
            }

            if (config.rowNumer) {
                dataSource.columnDefs.push(this.createNumberIndexCol());
            }

            if (statusCol) {
                dataSource.columnDefs.push({
                    lockPosition: true,
                    cellClass: 'status-header-col',
                    width: 38,
                    maxWidth: 38,
                    suppressMenu: true,
                    suppressNavigable: true,
                    suppressColumnsToolPanel: true,
                    suppressSizeToFit: true,
                    suppressAutoSize: true,
                    sortable: false,
                    resizable: false,
                    cellRenderer: function (params) {
                        if (
                            params.node.data &&
                            (params.node.data[ColHeaderKey.BorderStatus] == true ||
                                params.node.data[ColHeaderKey.BorderStatus] == 1 ||
                                params.node.data[ColHeaderKey.BorderStatus] == 'true')
                        ) {
                            return '<i class="fa fa-exclamation-circle background-status-red" style="font-size:medium;"></i>';
                        }
                        return '';
                    },
                });
            }

            if (config.hasRowColCheckAll && controlGridModel.columns) {
                controlGridModel.columns.splice(0, 0, {
                    data: 'rowColCheckAll',
                    readOnly: false,
                    title: 'Check All',
                    visible: false,
                    setting: {},
                    headerClass: '',
                });
            }

            if (config.allowSelectAllDefault) {
                dataSource.columnDefs.push({
                    colId: 'chkAll',
                    checkboxSelection: true,
                    suppressMenu: true,
                    headerCheckboxSelection: true,
                });
            }

            controlGridModel = this.datatableService.buildWijmoDataSource(controlGridModel);

            if (controlGridModel.columns)
                controlGridModel.columns.forEach((col) => {
                    const editableFromConfig = !config.readOnly && !col.readOnly;
                    const disableRowByValue = this.datatableService.getDisableRowByValue(col);
                    let colDef: ColDef = {
                        headerName: col.title,
                        field: col.data,
                        editable: this.buildEditable.bind(this, col.readOnly),
                        hide: !col.visible,
                        headerClass: !col.readOnly ? `${col.headerClass} editable-col` : col.headerClass,
                        suppressColumnsToolPanel: !col.visible,
                        enableRowGroup: true,
                        refData: {
                            setting: col.setting,
                            controlType: col.controlType,
                            disableRowByValue: disableRowByValue,
                        },
                        cellClassRules: {
                            'invalid-cell': this.cellValidation.bind(this),
                            'positive-qty': this.quantityCellWithColor.bind(this, true),
                            'negative-qty': this.quantityCellWithColor.bind(this, false),
                            'in-active-cell': this.inActiveCellClassRules.bind(this),
                        },
                        headerTooltip: col.title,
                        tooltipValueGetter: this.buildTooltip.bind(this),
                        cellStyle: this.buildCellStyle.bind(this, col),
                        filter: 'agTextColumnFilter',
                    };
                    if (col.data == 'MediaSize') {
                        col.controlType = '';
                        col.setting.DataLength = '255';
                        col.setting.DataType = 'nvarchar';
                    }
                    switch (col.controlType.toLowerCase()) {
                        case 'checkbox':
                            // Read-only
                            if (!editableFromConfig) {
                                colDef = Object.assign(colDef, {
                                    cellRendererFramework: CheckboxReadOnlyCellRenderer,
                                });
                            } else {
                                if (
                                    col.data == ColHeaderKey.MasterCheckbox ||
                                    col.data == ColHeaderKey.UnMergeCheckbox
                                ) {
                                    colDef = Object.assign(colDef, {
                                        cellRendererFramework: MasterUnmergeCheckboxCellRenderer,
                                        editable: false,
                                    });
                                } else if (col.data == ColHeaderKey.IsSelected) {
                                    colDef = Object.assign(colDef, {
                                        cellRendererFramework: CheckboxEditableCellRenderer,
                                        editable: false,
                                    });
                                } else {
                                    colDef = Object.assign(colDef, {
                                        cellRendererFramework: CheckboxEditableCellRenderer,
                                        headerComponentFramework: CheckboxHeaderCellRenderer,
                                        editable: false,
                                    });
                                }
                            }
                            // colDef.maxWidth = 100;
                            colDef.minWidth = 100;
                            colDef.width = 100;
                            (colDef.valueFormatter = this.boolFormatter.bind(this)), dataSource.columnDefs.push(colDef);
                            break;

                        case 'combobox':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: DropdownCellRenderer,
                                cellEditorFramework: DropdownCellRenderer,
                                comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
                                    if (
                                        isObject(valueA) &&
                                        isObject(valueB) &&
                                        !isNil(valueA.key) &&
                                        !isNil(valueB.key)
                                    ) {
                                        return ('' + valueA.value).localeCompare(valueB.value);
                                    }

                                    return false;
                                },
                            });

                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'autocomplete':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: AutoCompleteCellRenderer,
                                cellEditorFramework: AutoCompleteCellRenderer,
                                comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
                                    if (
                                        isObject(valueA) &&
                                        isObject(valueB) &&
                                        !isNil(valueA.key) &&
                                        !isNil(valueB.key)
                                    ) {
                                        return ('' + valueA.value).localeCompare(valueB.value);
                                    }

                                    return false;
                                },
                            });

                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'tabledropdown':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: TableDropdownCellRenderer,
                                cellEditorFramework: TableDropdownCellRenderer,
                                comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
                                    if (
                                        isObject(valueA) &&
                                        isObject(valueB) &&
                                        !isNil(valueA.key) &&
                                        !isNil(valueB.key)
                                    ) {
                                        return ('' + valueA.value).localeCompare(valueB.value);
                                    }

                                    return false;
                                },
                            });

                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'priority':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: PriorityDropdownCellRenderer,
                                cellEditorFramework: PriorityDropdownCellRenderer,
                                comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
                                    if (
                                        isObject(valueA) &&
                                        isObject(valueB) &&
                                        !isNil(valueA.key) &&
                                        !isNil(valueB.key)
                                    ) {
                                        return ('' + valueA.value).localeCompare(valueB.value);
                                    }

                                    return false;
                                },
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'reftextbox':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: RefTextboxCellRenderer,
                                cellEditorFramework: RefTextboxCellRenderer,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'numeric':
                            colDef = Object.assign(colDef, {
                                cellEditorFramework: NumericEditableCellRenderer,
                                cellClass: 'text-right',
                                valueFormatter: this.numericFormatter.bind(this),
                                refData: {
                                    setting: col.setting,
                                    controlType: col.controlType,
                                    allowNumberSeparator: this.allowNumberSeparator(col),
                                },
                                enableValue: true,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'button':
                            const mode = this.getColButtonMode(col);
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: TemplateButtonCellRenderer,
                                editable: false,
                                cellRendererParams: {
                                    mode: mode,
                                },
                                minWidth: 80,
                                hide: this.buildButtonColumnHideFromAccessRight(col),
                                tooltip: null,
                            });
                            // if (mode !== 'loginActived' || mode !== 'userStatus') {
                            //     colDef.width = 80;
                            //     colDef.pinned = 'right';
                            // }
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'countryflag':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: CountryFlagCellRenderer,
                                editable: false,
                                autoHeight: true,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'icon':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: IconCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'icon-text':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: IconTextCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        //case 'image-text':
                        case 'circleimage':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: ImageTextCellRenderer,
                                editable: false,
                                tooltip: null,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'label-format':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: LabelFormatCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'file':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: FileCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'filesize':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: FileSizeCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'date':
                        case 'datetimepicker':
                            colDef = Object.assign(colDef, {
                                cellEditorFramework: DateCellRenderer,
                                valueFormatter: this.dateFormatter.bind(this),
                                comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
                                    if (
                                        valueA &&
                                        typeof valueA === 'string' &&
                                        valueA.indexOf('/') !== -1 &&
                                        valueB &&
                                        typeof valueB === 'string' &&
                                        valueB.indexOf('/') !== -1
                                    ) {
                                        let aDateObj = parse(valueA, 'MM/dd/yyyy', new Date());
                                        let bDateObj = parse(valueB, 'MM/dd/yyyy', new Date());
                                        if (aDateObj && bDateObj) {
                                            return compareAsc(aDateObj, bDateObj);
                                        }
                                    }

                                    return false;
                                },
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'textarea':
                            colDef = Object.assign(colDef, {
                                cellEditor: 'agLargeTextCellEditor',
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'article-inline-search':
                            colDef = Object.assign(colDef, {
                                cellEditorFramework: ArticleSearchInlineCellRenderer,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'row-index':
                            dataSource.columnDefs.push(this.createNumberIndexCol());
                            break;

                        case 'row-drag':
                            dataSource.columnDefs.push(this.createRowDragCol());
                            break;

                        case 'creditcard':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: CreditCardCellRenderer,
                                editable: false,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;

                        case 'filesdownload':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: DownloadColCellRenderer,
                                editable: false,
                                tooltip: null,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'taglabel':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: TagLabelsCellRenderer,
                                editable: false,
                                tooltip: null,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'htmltext':
                            colDef.cellRenderer = this.cellRendererHandle.bind(this);
                            colDef.editable = false;
                            colDef.tooltipValueGetter = null;
                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'htmltexttooltip':
                            colDef.cellRenderer = this.cellRendererHandle.bind(this);
                            colDef.editable = false;
                            dataSource.columnDefs.push(colDef);
                            break;
                        case 'historysyncstatus':
                            colDef = Object.assign(colDef, {
                                cellRendererFramework: HistorySyncStatusRenderer,
                                editable: false,
                                tooltip: null,
                            });
                            dataSource.columnDefs.push(colDef);
                            break;
                        default:
                            colDef.cellRenderer = this.cellRendererHandle.bind(this);
                            // colDef.cellEditorFramework = SearchInlineCellRenderer;
                            dataSource.columnDefs.push(colDef);
                            break;
                    }
                }); //for

            if (config.allowDelete) {
                dataSource.columnDefs.push({
                    field: ColHeaderKey.Delete,
                    headerClass: 'editable-col',
                    cellClass: 'text-center',
                    cellRendererFramework: ControlCheckboxCellRenderer,
                    editable: false,
                    suppressColumnsToolPanel: true,
                    headerComponentFramework: DeleteCheckboxHeaderCellRenderer,
                    width: 100,
                    //maxWidth: 100,
                    minWidth: 100,
                });
            }

            if (config.allowSelectAll) {
                dataSource.columnDefs.push({
                    field: ColHeaderKey.SelectAll,
                    headerClass: 'editable-col',
                    cellClass: 'text-center',
                    cellRendererFramework: ControlCheckboxCellRenderer,
                    editable: false,
                    suppressColumnsToolPanel: true,
                    headerComponentFramework: SelectAllCheckboxHeaderCellRenderer,
                    width: 100,
                    // maxWidth: 100,
                    minWidth: 100,
                });
            }

            if (config.allowMediaCode) {
                dataSource.columnDefs.push({
                    field: ColHeaderKey.Mediacode,
                    headerName: 'Mediacode price',
                    headerClass: 'editable-col',
                    cellClass: 'text-center',
                    cellRendererFramework: TemplateButtonCellRenderer,
                    editable: false,
                    cellRendererParams: {
                        mode: 'Mediacode',
                    },
                });
            }

            controlGridModel.data.forEach((dt: any) => {
                // Build TreeView data
                if (config.treeViewMode) {
                    dt.children = [];
                }
                // Build data for Mediasize append MB to suffix
                if (dt.MediaSize) {
                    dt.MediaSize = Uti.formatBytesToMb(dt.MediaSize, 3);
                }
            });

            if (config.treeViewMode) {
                this.buildTreeData(controlGridModel);
            }

            dataSource.rowData = controlGridModel.data;
        } catch (e) {
            console.log(e);
        } finally {
            return dataSource;
        }
    }

    /**
     * createRowDragCol
     **/
    private createRowDragCol(): ColDef {
        return {
            lockPosition: true,
            cellClass: 'status-header-col drag-col',
            field: 'RowDrag',
            width: 38,
            maxWidth: 38,
            rowDrag: true,
            suppressMenu: true,
            sortable: true,
            suppressNavigable: true,
            suppressColumnsToolPanel: true,
            resizable: true,
            suppressSizeToFit: true,
            suppressAutoSize: true,
            valueGetter: function (params) {
                return '';
            },
            pinnedRowCellRenderer: function (params) {
                return 'Σ';
            },
        };
    }

    /**
     * createRowDragDropCol
     **/
    private createRowDragDropCol(): ColDef {
        return {
            lockPosition: true,
            cellClass: 'status-header-col',
            field: '',
            width: 38,
            maxWidth: 38,
            suppressMenu: false,
            sortable: false,
            suppressNavigable: false,
            suppressColumnsToolPanel: true,
            resizable: false,
            suppressSizeToFit: true,
            suppressAutoSize: true,
            dndSource: true,
            valueGetter: function (params) {
                return '';
            },
            pinnedRowCellRenderer: function (params) {
                return 'Σ';
            },
        };
    }

    /**
     * createNumberIndexCol
     **/
    private createNumberIndexCol(): ColDef {
        return {
            lockPosition: true,
            field: 'index-col',
            headerName: 'Pos',
            cellClass: 'status-header-col',
            headerClass: 'index-col',
            width: 30,
            maxWidth: 30,
            suppressMenu: true,
            sortable: true,
            suppressNavigable: true,
            suppressColumnsToolPanel: true,
            resizable: true,
            suppressSizeToFit: true,
            suppressAutoSize: true,
            valueGetter: 'node.rowIndex',
            cellRenderer: function (params) {
                return '' + (parseInt(params.value) + 1);
            },
            pinnedRowCellRenderer: function (params) {
                return '';
            },
        };
    }

    private createMasterDetailGroupCol(): ColDef {
        return {
            lockPosition: true,
            headerName: '',
            cellClass: 'status-header-col',
            width: 30,
            maxWidth: 30,
            suppressMenu: true,
            sortable: true,
            suppressNavigable: true,
            suppressColumnsToolPanel: true,
            resizable: true,
            suppressSizeToFit: true,
            suppressAutoSize: true,
            valueGetter: 'node.rowIndex',
            cellRenderer: 'agGroupCellRenderer',
            pinnedRowCellRenderer: function (params) {
                return '';
            },
        };
    }

    /**
     * buildRowClickData
     * @param selectedRow
     */
    public buildRowClickData(selectedRow) {
        const result = [];
        for (const propName in selectedRow) {
            if (propName) {
                result.push({
                    key: propName,
                    value: selectedRow[propName],
                });
            }
        }
        return result;
    }

    /**
     * getColButtonMode
     * @param settingCol
     */
    protected getColButtonMode(settingCol: any) {
        let mode = '';
        if (settingCol) {
            mode = this.datatableService.getControlTypeValue(settingCol);

            if (!mode && settingCol.controlType === 'Button') {
                mode = settingCol.data;
            }
        }
        return mode;
    }

    /**
     * numericFormatter
     * @param params
     */
    public numericFormatter(params) {
        try {
            const globalNumberFormat = params.context.componentParent.globalNumberFormat;
            const allowNumberSeparator = params.colDef.refData.allowNumberSeparator;
            if (allowNumberSeparator) {
                if (globalNumberFormat == 'N') {
                    return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : null;
                }
            }
        } catch {}
        return params.value;
    }

    /**
     * boolFormatter
     * @param params
     */
    public boolFormatter(params) {
        try {
            if (params.value == 'True' || params.value == 'true' || params.value == true || params.value == 1) {
                params.value = true;
            } else if (
                params.value == 'False' ||
                params.value == 'false' ||
                params.value == false ||
                params.value == 0
            ) {
                params.value = false;
            }
        } catch {}
        return params.value;
    }

    /**
     * dateFormatter
     * @param params
     */
    public dateFormatter(params) {
        try {
            const globalDateFormat = params.context.componentParent.globalDateFormat;
            const result = !params.value ? '' : this.uti.formatLocale(new Date(params.value), globalDateFormat);
            return result;
        } catch {}
        return params.value;
    }

    /**
     * allowNumberSeparator
     * @param settingCol
     */
    protected allowNumberSeparator(settingCol) {
        let allowNumberSeparator = true;
        try {
            if (this.datatableService.hasControlType(settingCol)) {
                const controlType = this.datatableService.getSettingContainsControlType(
                    settingCol.setting.Setting,
                ).ControlType;
                return !controlType.AllowNumberSeparator ? true : controlType.AllowNumberSeparator;
            }
        } catch {}
        return true;
    }

    private cellRendererHandle(params: any) {
        if (params.colDef?.refData?.controlType === 'htmltexttooltip') return params.value;

        // process for hightlightKeywords
        if (params.context.componentParent.hightlightKeywords) return this.highLightKeyWord(params);

        // default return this value
        return params.value;
    }

    private highLightKeyWord(params): any {
        try {
            if (!params.value) return params.value;

            let hightlightKeywords = (params.context.componentParent.hightlightKeywords + '').trim();
            let content = isNaN(params.value) ? params.value : params.value + '';
            if (
                (hightlightKeywords && hightlightKeywords !== '*' && typeof content === 'string') ||
                content instanceof String
            ) {
                //hight,light
                const arrKeywords = hightlightKeywords.split(/[,+]/);
                for (var i = 0, length = arrKeywords.length; i < length; i++) {
                    const keywords = arrKeywords[i].trim();
                    if (keywords) {
                        content = this.highLightText(content, keywords);
                    }
                } //for
                content = content.replace(/s____s/g, '<span class="hight-light__keyword">');
                content = content.replace(/e____e/g, '</span>');
                return content;
            }
        } catch (error) {
            console.error(error);
        }
        return params.value;
    }

    private highLightText(content, hightlightKeywords): any {
        hightlightKeywords = hightlightKeywords.split('*').join('');

        let regTxt;
        hightlightKeywords = hightlightKeywords.replace(/\?|\+|\%|\>|\<|\$|/g, '');

        //https://stackoverflow.com/questions/28187300/unterminated-group-in-regexp
        hightlightKeywords = hightlightKeywords
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]');

        if (/ or | and | [&] |[&]| [|] |[|]/i.test(hightlightKeywords)) {
            hightlightKeywords = hightlightKeywords.replace(/OR|AND|&|\|/gi, function (matched) {
                return '|';
            });
            hightlightKeywords = hightlightKeywords.replace(/ +/g, '');
        } else {
            hightlightKeywords = hightlightKeywords.replace(/ +/g, '|');
        }
        if (/ [&&] |[&&]| [||] |[||]|/i.test(hightlightKeywords)) {
            hightlightKeywords = hightlightKeywords.replace(/&&|\|\|/gi, function (matched) {
                return '|';
            });
            hightlightKeywords = hightlightKeywords.replace(/ +/g, '');
        } else {
            hightlightKeywords = hightlightKeywords.replace(/ +/g, '|');
        }
        regTxt = new RegExp(hightlightKeywords, 'gi');
        let result = content.replace(regTxt, function (str) {
            return 's____s' + str + 'e____e';
        });
        return result;
    }

    protected cellValidation(cellClassParams: CellClassParams): boolean {
        if (!cellClassParams.context.componentParent.hasCellStartChange) {
            //init table and no cell change
            return false;
        }

        const itemInEdited = cellClassParams.context.componentParent.itemsEdited.find(
            (x) => x == cellClassParams?.data,
        );
        const itemsAdded = cellClassParams.context.componentParent.itemsAdded.find((x) => x == cellClassParams?.data);
        if (!itemInEdited && !itemsAdded) {
            //Ignore validate field if has not yet edited
            return false;
        }
        if (cellClassParams.node.rowPinned === 'bottom' || cellClassParams.node.rowPinned === 'top') {
            //Ignore total row
            return false;
        }

        if (cellClassParams.context.componentParent.disabledAll) {
            return false;
        }

        if (!cellClassParams.colDef.editable) {
            return false;
        }

        const column: any = cellClassParams.colDef.refData;
        const item = cellClassParams.data;
        const property = cellClassParams.colDef.field;

        if (this.checkValidationOfField(column, item, property)) {
            return true;
        }

        if (this.datatableService.hasValidation(column, 'IsUniqued')) {
            if (!isNil(item[property]) && item[property] !== '') {
                let uniqueList = cellClassParams.context.componentParent
                    .getCurrentNodeItems()
                    .filter((x) => !isNil(x[property]) && (x.DT_RowId != item.DT_RowId || x.id != item.id));
                if (uniqueList.length) {
                    uniqueList = uniqueList.map((dt) => {
                        return dt ? dt.MediaCode.trim() : null;
                    });

                    if (uniqueList.indexOf(item[property]) !== -1) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public checkValidationOfField(refData, data, fieldName) {
        const column: any = refData;
        const item = data || [];
        const property = fieldName;

        let applyClass = false;
        if (this.datatableService.hasValidation(column, 'IsRequired')) {
            if (
                isNil(item[property]) ||
                item[property] === '' ||
                item[property] === 0 ||
                (typeof item[property] === 'object' && !item[property]['key'])
            ) {
                applyClass = true;
            }
        }

        if (this.datatableService.hasValidation(column, 'MaxValue')) {
            const maxValue = this.datatableService.getSettingContainsValidation(column.setting.Setting).Validation
                .MaxValue;
            if (item[property] > maxValue) {
                applyClass = true;
            }
        }

        if (this.datatableService.hasValidation(column, 'RequiredFrom')) {
            let fromFieldName = this.datatableService.getSettingContainsValidation(column.setting.Setting).Validation
                .RequiredFrom;

            if (
                !isNil(item[fromFieldName]) &&
                item[fromFieldName] !== '' &&
                (isNil(item[property]) ||
                    item[property] === '' ||
                    item[property] === 0 ||
                    (typeof item[property] === 'object' && !item[property]['key']))
            ) {
                applyClass = true;
            }
        }

        if (this.datatableService.hasValidation(column, 'Comparison')) {
            let compareThem = {
                '<=': (x, y) => {
                    return x <= y;
                },
                '<': (x, y) => {
                    return x < y;
                },
                '=': (x, y) => {
                    return x == y;
                },
                '>': (x, y) => {
                    return x > y;
                },
                '>=': (x, y) => {
                    return x >= y;
                },
            };

            let comparisonRules = this.datatableService.getSettingContainsValidation(column.setting.Setting).Validation
                .Comparison;
            for (let i = 0; i < comparisonRules.length; i++) {
                let leftData = parseFloat(item[property]) || 0.0;
                let rightData = parseFloat(item[comparisonRules[i].With]) || 0.0;
                if (compareThem[comparisonRules[i].Operator](leftData, rightData) === false) {
                    applyClass = true;
                    break;
                }
            }
        }

        if (this.datatableService.hasValidation(column, 'ValidationRange')) {
            if (
                item['ValidationRangeFrom'] &&
                item['ValidationRangeTo'] &&
                !(item[property] >= item['ValidationRangeFrom'] && item[property] <= item['ValidationRangeTo'])
            ) {
                applyClass = true;
            }
        }

        if (this.datatableService.hasValidation(column)) {
            const regexData = this.datatableService.buildWijmoGridValidationExpression(item, column);
            if (regexData && regexData.Regex) {
                const regex = new RegExp(decodeURIComponent(regexData.Regex), 'g');

                if (!regex.test(item[property])) {
                    applyClass = true;
                }
            }
        }

        return applyClass;
    }

    protected quantityCellWithColor(checkPositiveQuantity: boolean, cellClassParams: CellClassParams) {
        const enableQtyWithColor = cellClassParams.context.componentParent.enableQtyWithColor;
        const property = cellClassParams.colDef.field;
        let applyClass = false;
        if (enableQtyWithColor && property == 'QtyWithColor') {
            const item = cellClassParams.data;
            const value = item[property];
            if (!isNil(value)) {
                if (checkPositiveQuantity && parseInt(value) > 0) {
                    applyClass = true;
                }

                if (!checkPositiveQuantity && parseInt(value) < 0) {
                    applyClass = true;
                }
            }
        }

        return applyClass;
    }

    protected inActiveCellClassRules(cellClassParams: CellClassParams) {
        let applyClass = false;
        //
        if (
            cellClassParams.context.componentParent.allowSelectAll &&
            cellClassParams.context.componentParent.isDisableRowWithSelectAll &&
            cellClassParams.colDef.field != ColHeaderKey.SelectAll &&
            !cellClassParams.data[ColHeaderKey.SelectAll]
        ) {
            applyClass = true;
        }

        if (cellClassParams.context.componentParent.disabledAll) {
            applyClass = true;
        }

        //if (cellClassParams.colDef.field == ColHeaderKey.UnMergeCheckbox
        //    && (cellClassParams.data[ColHeaderKey.MasterCheckbox] || cellClassParams.context.componentParent.isMasterChecked)) {
        //    applyClass = true;
        //}

        //if (cellClassParams.colDef.field == ColHeaderKey.MasterCheckbox && cellClassParams.context.componentParent.isUnMergeChecked) {
        //    applyClass = true;
        //}

        return applyClass;
    }

    private isRootNode(data: any, parentNodeKeyName: string) {
        return !data[parentNodeKeyName];
    }

    private getParentNode(data: any, allData: any[], parentNodeKeyName: string, nodeKeyName: string) {
        return allData.find((x) => x[nodeKeyName] == data[parentNodeKeyName]);
    }

    private buildTooltip(params: ITooltipParams): string {
        if (!params.data) {
            return '';
        }

        if (params.context.componentParent.customTooltip) {
            return (
                params.context.componentParent.customTooltip.preText +
                params.data[params.context.componentParent.customTooltip.fieldName]
            );
        }

        if (typeof params.data[(params.colDef as any).field] !== 'object') {
            let value = params.valueFormatted ? params.valueFormatted : params.value;
            if (!value) {
                value = params.data[(params.colDef as any).field];
            }
            return value;
        } else if (
            params.data[(params.colDef as any).field] &&
            params.data[(params.colDef as any).field].hasOwnProperty('key')
        ) {
            if ((params.colDef as any).field === 'ChartOfAccounts')
                return params.data[(params.colDef as any).field].tooltipValueGetter;
            return params.data[(params.colDef as any).field].value;
        }

        return '';
    }

    private buildCellStyle(col: any) {
        return col.customStyle;
    }

    //#region "Tree Grid"

    /**
     * buildTreeData
     * @param controlGridModel
     */
    private buildTreeData(controlGridModel: ControlGridModel) {
        let parentNodeKeyName = this.datatableService.getNodeKeyName(controlGridModel.columns, true);
        let nodeKeyName = this.datatableService.getNodeKeyName(controlGridModel.columns);
        this.buildTree(controlGridModel.data, null, nodeKeyName, parentNodeKeyName);
        this.buildHierarchyPathTree(controlGridModel.data, null);
        let results = [];
        this.flattenTreeData(controlGridModel.data, results);
        results.forEach((result) => {
            const rs = controlGridModel.data.find((p) => p == result);
            if (!rs) {
                controlGridModel.data.push(result);
            }
        });
    }

    /**
     * buildTree
     * @param tree
     * @param item
     */
    private buildTree(tree, item, idKey, parentIdKey) {
        // If item then have parent
        if (item) {
            for (let i = 0; i < tree.length; i++) {
                // Find the parent
                if (String(tree[i][idKey]) === String(item[parentIdKey])) {
                    tree[i].children.push(item);
                    break;
                } else this.buildTree(tree[i].children, item, idKey, parentIdKey);
            }
        }
        // If no item then is a root item
        else {
            let idx = 0;
            while (idx < tree.length) {
                if (!isObject(tree[idx][parentIdKey]) && tree[idx][parentIdKey])
                    this.buildTree(tree, tree.splice(idx, 1)[0], idKey, parentIdKey);
                // if have parent then remove it from the array to relocate it to the right place
                else idx++;
            }
        }
    }

    /**
     * buildHierarchyPathTree
     **/
    private buildHierarchyPathTree(treeData: Array<any>, orgHierarchyPath: Array<string>) {
        treeData.forEach((data) => {
            const groupName = data.GroupName || data.ModuleName;
            if (!orgHierarchyPath) {
                data[ColHeaderKey.TreeViewPath] = [groupName];
            } else {
                data[ColHeaderKey.TreeViewPath] = orgHierarchyPath.concat([groupName]);
            }
            if (data.children && data.children.length) {
                this.buildHierarchyPathTree(data.children, data[ColHeaderKey.TreeViewPath]);
            }
        });
    }

    /**
     * flattenTreeData
     * @param treeData
     * @param result
     */
    private flattenTreeData(treeData: Array<any>, result: Array<any>) {
        treeData.forEach((data) => {
            result.push(data);
            if (data.children && data.children.length) {
                this.flattenTreeData(data.children, result);
            }
        });
    }

    //#endregion "Tree Grid"

    private buildButtonColumnHideFromAccessRight(col) {
        let accessRight: any;
        switch (col.data) {
            case 'Run':
                accessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, {
                    idSettingsGUIParent: 8,
                    idSettingsGUI: 39,
                    idRepWidgetApp: 122,
                    widgetButtonName: 'Run',
                });
                if (accessRight) {
                    return !accessRight.read;
                }
                break;

            case 'StartStop':
                accessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, {
                    idSettingsGUIParent: 9,
                    idSettingsGUI: 40,
                    idRepWidgetApp: 129,
                    widgetButtonName: 'StartStop',
                });
                if (accessRight) {
                    return !accessRight.read;
                }
                break;

            case 'Setting':
                let accessRight1 = this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, {
                    idSettingsGUIParent: 8,
                    idSettingsGUI: 39,
                    idRepWidgetApp: 122,
                    widgetButtonName: 'Setting',
                });
                let accessRight2 = this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, {
                    idSettingsGUIParent: 9,
                    idSettingsGUI: 40,
                    idRepWidgetApp: 129,
                    widgetButtonName: 'Setting',
                });
                if (accessRight1 && accessRight2) {
                    return !accessRight1.read || !accessRight2.read;
                } else if (accessRight1) {
                    return !accessRight1.read;
                } else if (accessRight2) {
                    return !accessRight2.read;
                }
                break;
        }

        return col.hide || !col.visible;
    }

    private buildEditable(colReadOnly, params) {
        let deleteStatus: boolean = false;
        const enableDeleteForGrid = !params.context.componentParent.readOnly;
        // Enable delete on this grid, then we will consider the other conditions ...
        if (enableDeleteForGrid) {
            // Allow delete at this column from config
            if (!colReadOnly) {
                deleteStatus = true;
                do {
                    // Check if this col depend the other cols.
                    // Case 1: There a cell belongs col 'IsEditable' that value == 0 of current row , then we off editable status.
                    if (params.node.data[ColHeaderKey.IsEditable] == 0) {
                        deleteStatus = false;
                        break;
                    }
                    // Case 2: Check if this cell disabled.
                    // Cell disabled by IsActive Column
                    const inactiveRowWithIsActive =
                        params.node.data &&
                        (params.node.data[ColHeaderKey.IsActive] == false ||
                            params.node.data[ColHeaderKey.IsActive] == 0 ||
                            params.node.data[ColHeaderKey.IsActiveDisableRow] == false ||
                            params.node.data[ColHeaderKey.IsActiveDisableRow] == 0);
                    if (inactiveRowWithIsActive) {
                        deleteStatus = false;
                        break;
                    }

                    let setting = this.inactiveRowByColValueSetting(params);
                    // Cell disabled by other setting column
                    if (setting.inactiveRowByValueSetting) {
                        let ignoreCol;
                        if (setting.ignoreCols && setting.ignoreCols.length) {
                            if (Array.isArray(setting.ignoreCols)) {
                                ignoreCol = setting.ignoreCols.find((p) => p == params.colDef.field);
                            }
                        }
                        if (!ignoreCol) {
                            deleteStatus = false;
                        }
                        break;
                    }
                } while (false);
            }
        }
        return deleteStatus;
    }

    public createToolPanelSidebar(supportPivotMode: boolean, parentContext) {
        let toolPanelParams;
        if (!supportPivotMode) {
            toolPanelParams = {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivots: true,
                suppressPivotMode: true,
            };
        }
        let sideBar = {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: toolPanelParams,
                },
                {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                },
                {
                    id: 'translation',
                    labelDefault: 'Translation',
                    labelKey: 'translation',
                    iconKey: 'translation',
                    toolPanel: 'translationToolPanelRenderer',
                    toolPanelParams: {
                        componentParent: parentContext,
                    },
                },
            ],
        };
        return sideBar;
    }

    public inactiveRowByColValueSetting(params) {
        let inactiveRowByValueSetting;
        let ignoreCols;
        let result;
        if (params.node && params.node.columnApi) {
            const columns = params.node.columnApi.getAllColumns();
            result = this.inactiveRowByColSetting(columns, params.node);
        }
        return {
            inactiveRowByValueSetting: result ? result.inactiveRowByValueSetting : null,
            ignoreCols: result ? result.ignoreCols : null,
        };
    }

    /**
     * inactiveRowByColSetting
     * @param columns
     * @param rowNode
     */
    public inactiveRowByColSetting(columns, rowNode) {
        let inactiveRowByValueSetting;
        let ignoreCols;
        if (columns && columns.length) {
            const colSetting = columns.find((p) => p.colDef && p.colDef.refData && p.colDef.refData.disableRowByValue);
            if (colSetting && colSetting.colDef && colSetting.colDef.refData) {
                const disableRowByValue = colSetting.colDef.refData.disableRowByValue;
                if (disableRowByValue) {
                    ignoreCols = disableRowByValue['IgnoreColumns'];
                    const items = (disableRowByValue['Values'] as Array<any>).filter(
                        (p) => p == rowNode.data[colSetting.colDef.field],
                    );
                    if (items && items.length) {
                        inactiveRowByValueSetting = true;
                    }
                }
            }
        }
        return {
            inactiveRowByValueSetting,
            ignoreCols,
        };
    }

    public buildContextMenuForTranslation(contextMenuItems: Array<any>) {
        if (contextMenuItems && contextMenuItems.length) {
            contextMenuItems.forEach((item) => {
                if (isObject(item)) {
                    let key = item.key;
                    let name: string = item.name;
                    if (!key) {
                        key = name
                            .replace(/(<([^>]+)>)/gi, '')
                            .trim()
                            .replace(/ /g, '_');
                    }
                    if (key) {
                        item.name =
                            '<label-translation keyword="' +
                            key +
                            '" class="ag-menu-option-text">' +
                            this.translateService.instant(key, item.params) +
                            '</label-translation>'; // this.translateService.instant(key, item.params) + ' <span class="hidden key-translation" keyword="' + key + '"></span>';
                    }
                    if (item.subMenu && item.subMenu.length) {
                        this.buildContextMenuForTranslation(item.subMenu);
                    }
                }
            });
        }
    }

    public initLocalText() {
        // let locale = GridLocale;
        const localeKeys = Object.keys(GridLocale);
        let localeText = {};
        localeKeys.forEach((key) => {
            localeText[key] =
                '<label-translation keyword="' +
                key +
                '" class="ag-menu-option-text">' +
                this.translateService.instant(key) +
                '</label-translation>'; //this.translateService.instant(key) + ' <span class="hidden key-translation" keyword="' + key + '"></span>'
        });
        return localeText;
    }
}
