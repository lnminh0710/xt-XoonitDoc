import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    ViewContainerRef,
    AfterViewInit,
    ElementRef,
    ChangeDetectorRef,
    ViewChild,
    Renderer2,
    TemplateRef,
} from '@angular/core';
import { ControlGridModel, GlobalSettingModel } from '@app/models';
import { AgGridService, IAgGridData } from '../../shared/ag-grid.service';
import {
    DatatableService,
    PropertyPanelService,
    AccessRightsService,
    GlobalSettingService,
    AppErrorHandler,
    ResourceTranslationService,
} from '@app/services';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import mapKeys from 'lodash-es/mapKeys';
import map from 'lodash-es/map';
import cloneDeep from 'lodash-es/cloneDeep';
import camelCase from 'lodash-es/camelCase';
import isEmpty from 'lodash-es/isEmpty';
import toSafeInteger from 'lodash-es/toSafeInteger';
import ceil from 'lodash-es/ceil';
import max from 'lodash-es/max';
import { ColHeaderKey } from '../../shared/ag-grid-constant';
import { Module } from '@app/models';
import 'ag-grid-enterprise';
import { TranslationToolPanelRenderer, DetailCellRenderer } from '../../components';
import { Uti } from '@app/utilities/uti';
import { IPageChangedEvent } from '@app/shared/components/xn-pager';
import { AccessRightTypeEnum } from '@app/app.constants';
import { XnAgGridHeaderComponent } from '@app/shared/components/xn-control/xn-ag-grid/components/xn-ag-grid-header/xn-ag-grid-header.component';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ProcessDataActions } from '@app/state-management/store/actions';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import {
    CellPosition,
    ColDef,
    Column,
    ColumnApi,
    GetDataPath,
    GridApi,
    GridOptions,
    GridReadyEvent,
    NavigateToNextCellParams,
    RowDropZoneParams,
    RowNode,
} from 'ag-grid-community';

const BUTTON_COLUMNS = {
    rowColCheckAll: 'rowColCheckAll',
};

const CONTROL_COLUMNS = {
    Priority: 'Priority',
};

@Component({
    selector: 'xn-ag-grid',
    templateUrl: './xn-ag-grid.component.html',
    styleUrls: ['./xn-ag-grid.component.scss'],
    providers: [AgGridService],
    host: { '(contextmenu)': 'rightClicked($event)' },
})
export class XnAgGridComponent implements OnInit, OnDestroy, AfterViewInit {
    // Core API of Ag Grid
    public api: GridApi;
    public columnApi: ColumnApi;
    public gridOptions: GridOptions;

    // Custom propeties to handle edited items
    public itemsAdded: Array<any> = [];
    public itemsRemoved: Array<any> = [];
    public itemsEdited: Array<any> = [];
    public itemsHasCellInvalid: Array<any> = [];
    public dropZoneList: Array<{ key: any; dropZone: RowDropZoneParams }> = [];
    public hasCellStartChange = false;

    // variable for business logic
    public selectedNode: RowNode;
    public globalDateFormat: string = null;
    public globalNumberFormat: string = null;
    public pinnedBottomRowData: Array<any>;
    public pinnedTopRowData: Array<any>;
    public sideBar;
    public popupParent;

    // Used for paging
    public totalResults: number;
    public currentPage = 1;

    private _contextMenuItems: any;
    private isDragging = false;
    private _selectingCell: { rowIndex: number; colDef: ColDef } = { rowIndex: -1, colDef: null };
    private isColumnsLayoutChanged: boolean = false;
    private currentColumnLayoutData: GlobalSettingModel;

    public colResizeDefault: string;
    // public isMasterChecked: boolean = false;
    // public isUnMergeChecked: boolean = false;
    public isMarkedAsDelete: boolean = false;
    public hasValidationErrorLocal: boolean = false;
    public isSearching: boolean = false;
    public priorities: any[] = [];

    public contextMenuItemsSubject: BehaviorSubject<any> = new BehaviorSubject(null);
    public detailRowHeight: number = 150;
    public localeText = {};

    @Input() dontShowCheckBoxHeader = false;
    @Input() preventAutoSelectFirstRow = false;
    @Input() disableCheckBoxWhenInActive = false;

    @Input() masterDetail: boolean;
    @Input() rowDetailTemplateRef: TemplateRef<any>;

    // Input
    @Input() enterMovesDown: boolean;
    @Input() isUsedSearchTextboxInside = false;
    @Input() allowAddNew = false;
    @Input() allowDelete = false;
    @Input() allowMediaCode = false;
    @Input() treeViewMode = false;
    @Input() hasRowColCheckAll = false;
    @Input() currentModule: Module;
    @Input() readOnly = true;
    @Input() hightlightKeywords: string = '';
    @Input() enableQtyWithColor = false;
    @Input() parentInstance: any = null;
    @Input() allowSetColumnState: boolean = true;
    @Input() allowSelectAll = false;
    @Input() allowSelectAllDefault = false;
    @Input() isDisableRowWithSelectAll: boolean = false;
    @Input() disabledAll = false;
    @Input() pageSize: number;
    @Input() pageIndex: number;
    @Input() paginationFromPopup: any;
    @Input() serverPaging = false;
    @Input() customTooltip: any;
    @Input() autoSelectFirstRow = false;
    @Input() rowSelection: string = 'single';
    @Input() suppressRowClickSelection: boolean = true;
    @Input() rowDragEntireRow: boolean = false;
    @Input() rowDragMultiRow: boolean = false;
    @Input() dropZoneElementText: string = '';
    @Input() suppressMoveWhenRowDragging: boolean = true;
    @Input() sheetName: string = 'Data Export';
    @Input() redRowOnDelete = false;
    @Input() totalRowMode: string = 'top'; // 'top' - 'bottom' - 'both'
    @Input() autoSaveColumnsLayout: boolean = true;
    @Input() id: string;

    // tree
    @Input() treeData: boolean = false;
    @Input() groupDefaultExpanded = -1;
    @Input() autoGroupColumnDef: ColDef;
    @Input() getDataPath: GetDataPath;

    // Default true
    @Input() autoSelectCurrentRowAfterChangingData = true;

    /*Grid Header*/
    @Input() isShowedHeader = false;
    @Input() hasHeaderBorder = true;
    @Input() headerTitle: string;
    @Input() hasSearch = false;
    @Input() hasFilterBox = false;
    @Input() isShowedEditButtons = false;
    @Input() allowUploadFile = false;
    @Input() canExport: boolean = true;
    @Input() hasPriorityColumn: boolean = false;
    /*Grid Header*/
    @Input() headerHeight: number = 40; // same design

    /* Allow Drag */
    @Input() allowDrag = false;
    @Input() customDragContent: any;

    @Input() rowDrag;
    @Input() rowDragDrop;
    @Input() rowNumer;
    @Input() autoCollapse;
    @Input() rowHeight = 28;
    @Input() domLayout: 'normal' | 'autoHeight' | 'print' = 'normal';

    private fitWidth = false;
    isStartEditing: boolean;

    @Input() set selectedRow(index: number) {
        this.gridOptions?.api?.forEachNode((node, i) => {
            if (index === i) {
                node.setSelected(true);
                this.api?.ensureIndexVisible(index);
            }
        });
    }

    @Input() set fitWidthColumn(fitWidth) {
        if (!isNil(fitWidth)) {
            this.fitWidth = fitWidth;

            this.colResizeDefault = this.fitWidth ? 'shift' : null;

            if (this.columnApi) {
                if (this.fitWidth) {
                    this.sizeColumnsToFit();
                } else {
                    this.loadColumnLayout();
                }
            }
        }
    }
    @Input() suppressContextMenu: boolean = false;

    private _isShowToolPanels: boolean = false;
    @Input() set isShowToolPanels(status) {
        this._isShowToolPanels = status;
        if (status) {
            if (this.sideBar) {
                this.showToolPanel(status);
                return;
            } else {
                this.sideBar = this.agGridService.createToolPanelSidebar(false, this);
            }
        }
        this.showToolPanel(status);
    }

    get isShowToolPanels() {
        return this._isShowToolPanels;
    }

    private _columnsLayoutSettings: any;
    @Input() set columnsLayoutSettings(data: any) {
        this._columnsLayoutSettings = data;
    }

    get columnsLayoutSettings() {
        return this._columnsLayoutSettings;
    }

    // Used for translation
    public translateData: any = {};

    @Input() set widgetDetail(data: any) {
        if (data) {
            this.translateData = data;
            this.assignSelectedRowForTranslateData();
        }
    }

    private _isEditting: boolean;
    @Input() set isEditting(status: boolean) {
        this._isEditting = status;
        this.updateHeaderCellEditable(status);

        this.toggleRowColCheckAllColumn();
    }

    get isEditting() {
        return this._isEditting;
    }

    private _gridStyle;
    @Input() set gridStyle(gridStyle: any) {
        this._gridStyle = gridStyle;
        this.updateHeaderStyle();
        if (this.api) this.api.redrawRows();
    }

    get gridStyle() {
        return this._gridStyle;
    }

    private _filter: string;
    get filter(): string {
        return this._filter;
    }
    set filter(value: string) {
        if (this._filter !== value) {
            this._filter = value;
            this.applyFilter();
        }
    }

    public rowGroupPanelShow: string = 'never';
    private _rowGrouping = false;
    @Input() set rowGrouping(rowGrouping: boolean) {
        this._rowGrouping = rowGrouping;
        this.rowGroupPanelShow = 'never';
        if (rowGrouping) {
            this.rowGroupPanelShow = 'always';
        } else {
            if (this.columnApi) {
                const rowGroupCols = this.columnApi.getRowGroupColumns();
                if (rowGroupCols && rowGroupCols.length) {
                    const colIds = rowGroupCols.map((p) => p.getColId());
                    for (let i = 0; i < colIds.length; i++) {
                        this.columnApi.removeRowGroupColumn(colIds[i]);
                    }
                    this.updateColumnState();
                }
            }
        }
        setTimeout(() => {
            this.toggleRowGroupHeader();
        });
    }

    get rowGrouping() {
        return this._rowGrouping;
    }

    private _pivoting = false;
    @Input() set pivoting(pivoting: boolean) {
        this._pivoting = pivoting;
        if (pivoting) {
            this.sideBar = this.agGridService.createToolPanelSidebar(true, this);
            if (this.columnsLayoutSettings) {
                this.columnsLayoutSettings.isShowToolPanels = true;
            }
            //this.isShowToolPanels = true;
        } else {
            this.sideBar = this.agGridService.createToolPanelSidebar(false, this);
            if (this.columnsLayoutSettings) {
                this.columnsLayoutSettings.isShowToolPanels = false;
            }
            //this.isShowToolPanels = false;
        }
    }
    get pivoting() {
        return this._pivoting;
    }

    private _columnFilter = false;
    @Input() set columnFilter(columnFilter: boolean) {
        this._columnFilter = columnFilter;
        setTimeout(() => {
            if (this.api) {
                this.api.refreshHeader();
            }
        });
    }
    get columnFilter() {
        return this._columnFilter;
    }

    @Input() set dataSource(data: ControlGridModel) {
        if (!data) return;

        this.onDataChange.emit(data);

        // this.isMasterChecked = this.isUnMergeChecked = false;

        const config = {
            allowDelete: this.allowDelete,
            allowMediaCode: this.allowMediaCode,
            allowSelectAll: this.allowSelectAll,
            allowSelectAllDefault: this.allowSelectAllDefault,
            treeViewMode: this.treeViewMode,
            readOnly: this.readOnly,
            hasRowColCheckAll: this.hasRowColCheckAll,
            rowDrag: this.rowDrag,
            rowDragDrop: this.rowDragDrop,
            rowNumer: this.rowNumer,
            masterDetail: this.masterDetail,
        };
        const agGridDataSource: IAgGridData = this.agGridService.mapDataSource(data, config);

        if (data.totalResults) {
            this.totalResults = data.totalResults;
        }

        const isColumnsChanged =
            !this.gridOptions ||
            this._isColumnsChanged(this.gridOptions.columnDefs, agGridDataSource.columnDefs, 'field');
        if (isColumnsChanged) {
            this.initGrid();
            this.gridOptions.columnDefs = agGridDataSource.columnDefs;
        } else {
            this.initGrid(false);
        }

        this.dataSourceChanged.emit(agGridDataSource);

        this.gridOptions.defaultColDef = {
            sortable: true,
            resizable: true,
            filter: true,
        };
        this.gridOptions.rowData = agGridDataSource.rowData;
        this.gridOptions.getRowStyle = this.getRowStyle.bind(this);
        this.gridOptions.overlayNoRowsTemplate = '<span class="no-entry-data-block"> No entry data </span>';
        this.gridOptions.frameworkComponents = {
            translationToolPanelRenderer: TranslationToolPanelRenderer,
            templateDetailCellRenderer: DetailCellRenderer,
        };
        this.gridOptions.navigateToNextCell = this.navigateToNextCellFunc.bind(this);

        this.gridOptions.rowClassRules = {
            'deleted-row-text': function (params) {
                return params.node.data && params.node.data[ColHeaderKey.IsDeleted] == true;
            },
            'in-active-cell': function (params) {
                const inactiveRowWithIsActive =
                    params.node.data &&
                    (params.node.data[ColHeaderKey.IsActive] == false ||
                        params.node.data[ColHeaderKey.IsActive] == 0 ||
                        params.node.data[ColHeaderKey.IsActiveDisableRow] == false ||
                        params.node.data[ColHeaderKey.IsActiveDisableRow] == 0);
                const inactiveRowWithSelectAll =
                    params.node.data &&
                    (params as any).isDisableRowWithSelectAll &&
                    (params.node.data[ColHeaderKey.SelectAll] == false ||
                        params.node.data[ColHeaderKey.SelectAll] == 0);
                const setting = params.context.componentParent.agGridService.inactiveRowByColValueSetting(params);
                return inactiveRowWithIsActive || inactiveRowWithSelectAll || setting.inactiveRowByValueSetting;
            },
            'background-status-red': function (params) {
                return params.node.data && params.node.data[ColHeaderKey.BorderStatus] == true;
            },
            'master-background': function (params) {
                return params.node.data && params.node.data[ColHeaderKey.MasterCheckbox] == true;
            },
        };

        // When chaging new datasource, we need to remove all data rows of previous datasource.
        this.removeAllRowNodes();

        if (this.showTotalRow) {
            this.calculatePinnedRowBottomData();
        }

        // Tree view
        if (this.treeViewMode) {
            this.gridOptions.treeData = true;
            this.gridOptions.animateRows = true;
            this.gridOptions.groupDefaultExpanded = -1;
            this.gridOptions.getDataPath = function (data) {
                return data[ColHeaderKey.TreeViewPath];
            };
            this.gridOptions.autoGroupColumnDef = {
                headerName: 'Tree View',
                cellRendererParams: {
                    suppressCount: true,
                },
            };
        } else {
            // Grouping feature
            // this.gridOptions.groupUseEntireRow = true;
            this._buildGroupByColumn(this.gridOptions.columnDefs);
        }

        setTimeout(() => {
            if (this.fitWidth) {
                if (isColumnsChanged) {
                    this.sizeColumnsToFit();
                }
            } else {
                this.loadColumnLayout();
            }

            this.autoSelectRow();
            this.updateHeaderStyle();

            if (isColumnsChanged && this.api) {
                this.filter = null;
            }

            this.toggleRowColCheckAllColumn();

            if (this.hasPriorityColumn) {
                this.initPriorityList();
            }
        });
    }

    private _globalProperties: any;
    @Input() set globalProperties(globalProperties: any[]) {
        this._globalProperties = globalProperties;
        let globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
        let globalNumberFormat = this.propertyPanelService.buildGlobalNumberFormatFromProperties(globalProperties);
        const autoCollapseProp = this.propertyPanelService.getItemRecursive(this.globalProperties, 'AutoCollapse');

        if (autoCollapseProp) {
            this.autoCollapse = autoCollapseProp.value;
        }

        if (this.globalDateFormat != globalDateFormat || this.globalNumberFormat != globalNumberFormat) {
            this.globalDateFormat = globalDateFormat;
            this.globalNumberFormat = globalNumberFormat;
            if (this.api) this.api.redrawRows();
        }
    }

    get globalProperties() {
        return this._globalProperties;
    }

    private _isActivated: boolean = true;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        } else {
            this.ref.reattach();
        }
    }

    get isActivated() {
        return this._isActivated;
    }

    private _showTotalRow: boolean = false;

    @Input() set showTotalRow(showTotalRow: boolean) {
        this._showTotalRow = showTotalRow;
        if (showTotalRow) {
            this.calculatePinnedRowBottomData();
        } else {
            this.pinnedBottomRowData = [];
        }
    }

    get showTotalRow() {
        return this._showTotalRow;
    }

    @ViewChild('agGrid', { read: ViewContainerRef }) public agGridViewContainerRef;
    @ViewChild('xnAgGridHeader') xnAgGridHeader: XnAgGridHeaderComponent;

    @Output() rowRightClicked = new EventEmitter<any>();
    @Output() rowDoubleClicked = new EventEmitter<any>();
    @Output() rowEditingStarted = new EventEmitter<any>();
    @Output() rowEditingStopped = new EventEmitter<any>();
    @Output() rowClick = new EventEmitter<any>();
    @Output() cellEditingStarted = new EventEmitter<any>();
    @Output() cellEditingStopped = new EventEmitter<any>();
    @Output() cellEditting = new EventEmitter<any>();
    @Output() cellValueChanged = new EventEmitter<any>();
    @Output() onRowMarkedAsDelete = new EventEmitter<any>();
    @Output() onDeleteChecked = new EventEmitter<any>();
    @Output() hasValidationError = new EventEmitter<any>();
    @Output() mediacodeClick = new EventEmitter<any>();
    @Output() deleteClick = new EventEmitter<any>();
    @Output() archiveClick = new EventEmitter<any>();
    @Output() sendLetterClick = new EventEmitter<any>();
    @Output() resendEmailActivationClick = new EventEmitter<any>();
    @Output() unblockClick = new EventEmitter<any>();
    @Output() startStopClick = new EventEmitter<any>();
    @Output() runClick = new EventEmitter<any>();
    @Output() downloadClick = new EventEmitter<any>();
    @Output() settingClick = new EventEmitter<any>();
    @Output() pdfClick = new EventEmitter<any>();
    @Output() editRowClick = new EventEmitter<any>();
    @Output() editClick = new EventEmitter<any>();
    @Output() forceActiveClick = new EventEmitter<any>();
    @Output() changeColumnLayout = new EventEmitter<any>();
    @Output() onMarkedAsSelectedAll = new EventEmitter<any>();
    @Output() onSelectedAllChecked = new EventEmitter<any>();
    @Output() cellContextMenuAction = new EventEmitter<any>();
    @Output() onTableSearch = new EventEmitter<any>();
    @Output() onUploadFileClick = new EventEmitter<any>();
    @Output() pageChanged = new EventEmitter<IPageChangedEvent>();
    @Output() pageNumberChanged = new EventEmitter<number>();
    @Output() onDeletedRows = new EventEmitter<boolean>();
    @Output() keyDown = new EventEmitter<any>();
    @Output() onCheckAllChecked = new EventEmitter<any>();
    @Output() onDataChange = new EventEmitter<any>();
    @Output() onPriorityEditEnded = new EventEmitter<any>();
    @Output() saveColumnsLayoutAction = new EventEmitter<any>();
    @Output() dataSourceChanged = new EventEmitter<IAgGridData>();
    @Output() deleteUser = new EventEmitter<any>();
    @Output() editUser = new EventEmitter<any>();
    @Output() cellClick = new EventEmitter<any>();
    @Output() update1ForAll = new EventEmitter<any>();
    @Output() gridOnReady = new EventEmitter<any>();
    @Output() addRowClick = new EventEmitter<any>();
    @Output() resetPass = new EventEmitter<any>();
    @Output() moreAction = new EventEmitter<any>();
    @Output() dropAction = new EventEmitter<any>();

    public detailCellRenderer;
    private successSavedSubscription: Subscription;

    constructor(
        private _eref: ElementRef,
        private agGridService: AgGridService,
        private ref: ChangeDetectorRef,
        private datatableService: DatatableService,
        private propertyPanelService: PropertyPanelService,
        private processDataActions: ProcessDataActions,
        private store: Store<AppState>,
        private renderer: Renderer2,
        private accessRightService: AccessRightsService,
        private _globalSettingService: GlobalSettingService,
        private _toasterService: ToasterService,
        private _appErrorHandler: AppErrorHandler,
        private resourceTranslationService: ResourceTranslationService,
    ) {
        this.detailCellRenderer = 'templateDetailCellRenderer';
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        this.buildContextMenuItems = this.buildContextMenuItems.bind(this);
        this.popupParent = document.querySelector('body');

        this.successSavedSubscription = this.resourceTranslationService.successSaved$.subscribe((status) => {
            this.initLocalText();
            this.ref.detectChanges();
        });
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        if (this.gridOptions) {
            this.gridOptions.columnDefs = null;
            this.gridOptions.rowData = null;
            this.gridOptions = null;
        }
        if (this.api) {
            this.api.destroy();
        }
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
        setTimeout(() => {
            if (this.agGridViewContainerRef && this.agGridViewContainerRef.element.nativeElement) {
                this.agGridViewContainerRef.element.nativeElement.addEventListener(
                    'keydown',
                    this.onGridKeydown.bind(this),
                );
            }
        });
        this.initLocalText();
    }

    public initLocalText() {
        this.localeText = this.agGridService.initLocalText();
        if (this.api) {
            const rowCount = this.api.getDisplayedRowCount();
            if (!rowCount) {
                // To refresh new value for no row text
                setTimeout(() => {
                    this.api.showNoRowsOverlay();
                });
            }
        }
    }

    public doSearch(text: string) {
        this.xnAgGridHeader.doSearch(text);
    }

    /**
     * onGridKeydown
     * @param evt
     */
    private onGridKeydown(evt) {
        if (evt.key === 'Enter') {
            if (!this.enterMovesDown) {
                this.api.stopEditing();

                if (this.readOnly) {
                    this.api.tabToNextCell();
                } else {
                    let nextEditableCell = this.getNextEditableCell(this.api.getFocusedCell());
                    if (nextEditableCell) {
                        this.api.clearFocusedCell();
                        this.api.setFocusedCell(nextEditableCell.row, nextEditableCell.col.getColId());
                    } else {
                        this.api.tabToNextCell();
                    }
                }
            } else {
                const currentCell = this.api.getFocusedCell();
                const finalRowIndex = this.api.paginationGetRowCount() - 1;

                // If we are editing the last row in the grid, don't move to next line
                if (currentCell.rowIndex === finalRowIndex) {
                    return;
                }
                this.api.stopEditing();
                this.api.clearFocusedCell();

                this.api.setFocusedCell(currentCell.rowIndex + 1, currentCell.column.getColId());
            }
            const currentFocusedCell = this.api.getFocusedCell();
            const selectedNodes = this.api.getSelectedNodes();
            if (currentFocusedCell && selectedNodes && selectedNodes.length) {
                if (selectedNodes[0].rowIndex != currentFocusedCell.rowIndex) {
                    this.selectRowIndex(currentFocusedCell.rowIndex);
                }
            }
        }

        if (evt.code === 'Space') {
            const currentCell = this.api.getFocusedCell();
            const colDef = currentCell.column.getColDef();

            if (
                (colDef.cellRendererFramework && colDef.cellRendererFramework.name === 'ControlCheckboxCellRenderer') ||
                (colDef.refData && colDef.refData.controlType === 'Checkbox')
            ) {
                const matCheckboxElm = evt.target.querySelector('mat-checkbox');
                if (
                    matCheckboxElm &&
                    !matCheckboxElm.classList.contains('mat-checkbox-disabled') &&
                    (colDef.field == ColHeaderKey.Delete ||
                        colDef.field == ColHeaderKey.SelectAll ||
                        (colDef.refData && colDef.refData.controlType == 'Checkbox'))
                ) {
                    let rowNode = this.api.getDisplayedRowAtIndex(currentCell.rowIndex);

                    rowNode.data[colDef.field] = !rowNode.data[colDef.field];
                    this.api.applyTransaction({ update: [rowNode.data] });

                    evt.stopPropagation();
                }
            } else if (
                (colDef.cellRendererFramework && colDef.cellRendererFramework.name === 'TemplateButtonCellRenderer') ||
                (colDef.refData && colDef.refData.controlType === 'Button')
            ) {
                const buttonElm = evt.target.querySelector('button');
                if (buttonElm) {
                    buttonElm.click();
                    evt.stopPropagation();
                }
            }
        }

        this.outputWhenDataChange(evt.keyCode);
    }

    private outputWhenDataChange(keycode: any) {
        if (
            !this.isStartEditing ||
            !(
                (
                    (keycode > 47 && keycode < 58) || // number keys
                    keycode == 32 ||
                    keycode == 46 ||
                    keycode == 8 || // spacebar & return key(s) (if you want to allow carriage returns)
                    (keycode > 64 && keycode < 91) || // letter keys
                    (keycode > 95 && keycode < 112) || // numpad keys
                    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                    (keycode > 218 && keycode < 223)
                ) // [\]' (in order)
            )
        )
            return;
        this.cellEditting.emit();
    }

    private getNextEditableCell(currentCell: CellPosition) {
        let allCols = this.columnApi.getAllGridColumns();

        if (!allCols.filter((x) => x.getColDef().editable === true).length) {
            return null;
        }

        let allColsWithIndex = allCols.map((col, index) => {
            return {
                col,
                editable: col.getColDef().editable,
                index,
            };
        });

        let returnNextRow = () => {
            if (
                currentCell.rowIndex + 1 === this.gridOptions.rowData.length ||
                !allColsWithIndex.find((x) => x.editable === true && x.col.getColDef().hide === false)
            ) {
                return null;
            } else {
                return {
                    row: currentCell.rowIndex + 1,
                    col: allColsWithIndex.find((x) => x.editable === true && x.col.getColDef().hide === false).col,
                };
            }
        };

        if (currentCell && currentCell.column) {
            let currentCellColIndex = allCols.findIndex((x) => x.getColId() === currentCell.column.getColId());

            if (currentCellColIndex === allColsWithIndex.length - 1) {
                returnNextRow();
            } else {
                let nextCol = allColsWithIndex.find(
                    (x) => x.index > currentCellColIndex && x.editable === true && x.col.getColDef().hide === false,
                );
                if (nextCol) {
                    return {
                        row: currentCell.rowIndex,
                        col: nextCol.col,
                    };
                } else {
                    returnNextRow();
                }
            }
        }
    }

    /**
     * initGrid
     * */
    private initGrid(resetGridOptions = true) {
        if (resetGridOptions) {
            if (this.gridOptions) {
                this.gridOptions = null;
            }
            this.gridOptions = <GridOptions>{
                onFirstDataRendered: (params) => {
                    params.api.sizeColumnsToFit();
                    this.updateHeaderCellEditable(this.isEditting);
                },
                context: {
                    componentParent: this,
                },
                rowHeight: this.rowHeight,
            };
        }

        this.hasCellStartChange = false;
        this.itemsAdded = [];
        this.itemsRemoved = [];
        this.itemsEdited = [];
        this.itemsHasCellInvalid = [];
    }

    /**
     * getRowStyle
     * @param params
     */
    private getRowStyle(params) {
        let rowPinnedStyle = {};
        let cellStyle = {};
        if (params.node.rowPinned) {
            rowPinnedStyle = {
                'background-color': '#f4f4f4',
                'border-top': 'solid #d6d6d6 1px',
                'font-weight': 'bold',
            };
        }
        const gridStyle = this.gridStyle;
        if (gridStyle && gridStyle.rowStyle && !isEmpty(gridStyle.rowStyle)) {
            cellStyle = {
                color: gridStyle.rowStyle['color'],
                fontFamily: gridStyle.rowStyle['font-family'],
                fontSize: gridStyle.rowStyle['font-size'],
                fontWeight: gridStyle.rowStyle['font-weight'],
                fontStyle: gridStyle.rowStyle['font-style'],
                textDecoration: gridStyle.rowStyle['text-decoration'],
            };
        }
        return Object.assign(cellStyle, rowPinnedStyle);
    }

    /**
     * updateHeaderStyle
     **/
    private updateHeaderStyle() {
        const gridStyle = this.gridStyle;
        if (gridStyle && gridStyle.headerStyle) {
            if (
                this.agGridViewContainerRef &&
                this.agGridViewContainerRef.element &&
                this.agGridViewContainerRef.element.nativeElement
            ) {
                const headerRow = this.agGridViewContainerRef.element.nativeElement.querySelector(
                    '.ag-header-container .ag-header-row',
                );
                if (headerRow) {
                    this.renderer.setStyle(headerRow, 'color', gridStyle.headerStyle['color']);
                    this.renderer.setStyle(headerRow, 'fontFamily', gridStyle.headerStyle['font-family']);
                    this.renderer.setStyle(headerRow, 'fontSize', gridStyle.headerStyle['font-size']);
                    this.renderer.setStyle(headerRow, 'fontWeight', gridStyle.headerStyle['font-weight']);
                    this.renderer.setStyle(headerRow, 'fontStyle', gridStyle.headerStyle['font-style']);
                    this.renderer.setStyle(headerRow, 'textDecoration', gridStyle.headerStyle['text-decoration']);
                }
            }
        }
    }

    /**
     * updateHeaderCellEditable
     **/
    private updateHeaderCellEditable(isEditing) {
        if (
            this.agGridViewContainerRef &&
            this.agGridViewContainerRef.element &&
            this.agGridViewContainerRef.element.nativeElement
        ) {
            const headerCells: Array<any> = this.agGridViewContainerRef.element.nativeElement.querySelectorAll(
                '.ag-header-container .ag-header-row .ag-header-cell',
            );
            if (headerCells) {
                headerCells.forEach((headerCell) => {
                    if (isEditing) {
                        this.renderer.addClass(headerCell, 'editing');
                    } else {
                        this.renderer.removeClass(headerCell, 'editing');
                    }
                });
            }
        }
    }

    /**
     * onReady
     * @param params
     */
    public onReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.gridOnReady.emit();

        this.loadDataForColumnsLayout();
        this.showToolPanel(this.isShowToolPanels);
        this.updateHeaderStyle();

        if (this.allowDrag) {
            this.initDragDropHandler();
        }
        this.autoSelectRow();

        this.addDropZones();
    }

    addDropZones() {
        if (!this.rowDragMultiRow || !this.dropZoneElementText) return;
        var containers = document.querySelectorAll(this.dropZoneElementText) as any;
        if (!containers?.length) return;

        for (let index = 0; index < containers.length; index++) {
            const element = containers[index];

            const key = element.getAttribute('dataRef-key');
            if (!key) continue;

            const dropZoneItem = this.dropZoneList.find((x) => x.key === key);
            if (dropZoneItem) {
                this.dropZoneList = this.dropZoneList.filter((x) => x.key !== key);
                this.api.removeRowDropZone(dropZoneItem.dropZone);
            }

            const dropZone: RowDropZoneParams = {
                getContainer: () => {
                    return element as any;
                },
                onDragLeave(params) {
                    element.removeAttribute('dropTarget');
                },
                onDragEnter(params) {
                    element.setAttribute('dropTarget', 'true');
                },
                onDragStop: (data) => {
                    const rowsData = data?.nodes;
                    const key = element.getAttribute('dataRef-key');
                    const idLogin = element.getAttribute('dataRef-user');
                    const isUser = element.getAttribute('is-user');
                    const treeData = { idDocumentTree: key, idLogin, isUser };
                    if (!treeData?.idDocumentTree || !rowsData?.length) return;

                    this.dropAction.emit({ treeData, rowsData });
                    element.removeAttribute('dropTarget');
                },
            };
            this.api.getRowDropZoneParams();
            const item = { key, dropZone };
            this.dropZoneList.push(item);
            this.api.addRowDropZone(dropZone);
        }
    }

    /**
     * columnVisible
     **/
    public columnVisible($event) {
        this.updateColumnState($event);
    }

    /**
     * sizeColumnsToFit
     **/
    public sizeColumnsToFit() {
        if (this.api) {
            this.api.sizeColumnsToFit();
        }
    }

    /**
     * onRowClicked
     * */
    // fix bug upgrade ag-grid 18 to 23 and ver 18 will return array so with ver 23 return object, we
    private parseObjectSelectedToArray(data: any) {
        let arrayData = [];
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    arrayData.push({ key, value: data[key] });
                }
            }
        }
        return arrayData;
    }
    public onRowClicked(params) {
        const arrayData = this.parseObjectSelectedToArray(params?.data);
        this.rowClick.emit(arrayData);
    }

    /**
     * onRowDoubleClicked
     * */
    public onRowDoubleClicked(params) {
        this.rowDoubleClicked.emit(params.data);
    }

    /**
     * onRowEditingStarted
     * @param params
     */
    public onRowEditingStarted(params) {
        this.rowEditingStarted.emit(params.data);
    }

    /**
     * onRowEditingStopped
     * @param params
     */
    public onRowEditingStopped(params) {
        this.rowEditingStopped.emit(params.data);
    }

    /**
     * onCellEditingStarted
     * @param params
     */
    public onCellEditingStarted(params) {
        this.isStartEditing = true;
        const inactiveRowWithIsActive =
            params.node.data &&
            (params.node.data[ColHeaderKey.IsActive] == false ||
                params.node.data[ColHeaderKey.IsActive] == 0 ||
                params.node.data[ColHeaderKey.IsActiveDisableRow] == false ||
                params.node.data[ColHeaderKey.IsActiveDisableRow] == 0);
        const inactiveRowWithSelectAll =
            params.node.data &&
            (params as any).isDisableRowWithSelectAll &&
            (params.node.data[ColHeaderKey.SelectAll] == false || params.node.data[ColHeaderKey.SelectAll] == 0);
        const setting = this.agGridService.inactiveRowByColValueSetting(params);
        if (inactiveRowWithIsActive || inactiveRowWithSelectAll || setting.inactiveRowByValueSetting) {
            let ignoreCol;
            if (setting.ignoreCols && setting.ignoreCols.length) {
                if (Array.isArray(setting.ignoreCols)) {
                    ignoreCol = setting.ignoreCols.find((p) => p == params.colDef.field);
                }
            }
            if (!ignoreCol) {
                this.api.stopEditing();
                return;
            }
        }

        this.cellEditingStarted.emit(params.data);
        if (params.data.hasOwnProperty(ColHeaderKey.IsActive) && !params.data[ColHeaderKey.IsActive]) {
            params.data[ColHeaderKey.IsActive] = true;
        }
    }

    /**
     * onCellEditingStopped
     * @param params
     */
    public onCellEditingStopped(params) {
        const data: any = {
            cellType: params.colDef ? params.colDef.refData.controlType : '',
            data: params.data,
            col: params.column,
        };
        this.isStartEditing = false;
        this.cellEditingStopped.emit(data);
    }

    /**
     * onCellValueChanged
     * @param params
     */
    public onCellValueChanged(params) {
        try {
            if (!isEqual(params.newValue, params.oldValue)) {
                if (!params.newValue && !params.oldValue) {
                    return;
                }

                this.hasCellStartChange = true;

                const itemAdded = this.itemsAdded.find((p) => p == params.data);
                if (itemAdded) {
                    this.cellValueChanged.emit(params.data);
                    return;
                }
                const item = this.itemsEdited.find((p) => p == params.data);
                if (!item) {
                    this.itemsEdited.push(params.data);
                }
                this.cellValueChanged.emit(params.data);
            }
        } finally {
            if (this.showTotalRow) {
                this.calculatePinnedRowBottomData();
            }
            const hasError = this.hasError();
            this.hasValidationError.emit(hasError);

            // add-del row invalid to itemsHasCellInvalid
            const uniqueCurentRow = params.data['Guid'];
            const rowIndex = this.itemsHasCellInvalid.indexOf(uniqueCurentRow);
            if (hasError || !this.checkValidateFields(params.data)) {
                if (rowIndex === -1) this.itemsHasCellInvalid.push(uniqueCurentRow);
            } else if (rowIndex > -1) {
                this.itemsHasCellInvalid.splice(rowIndex, 1);
            }
        }
    }

    /**
     * checkValidateFields
     * @param obj
     */
    private checkValidateFields(obj: any) {
        const columnDefsObj = this.gridOptions.columnDefs;
        for (const column of columnDefsObj) {
            if (this.agGridService.checkValidationOfField(column['refData'], obj, column['field'])) {
                return false;
            }
        }

        return true;
    }

    /**
     * filterDataBySearchTxt
     * @param searchTxt
     */
    public filterDataBySearchTxt(searchTxt: string) {
        this.api.setQuickFilter(searchTxt);
    }

    /**
     * filterDataBySearchTxtByColumn
     * @param searchTxt
     * @param columnName
     */
    public filterDataBySearchTxtByColumn(searchTxt: string, columnName: string) {
        this.api.setQuickFilter(searchTxt);
        let filterInstance = this.api.getFilterInstance(columnName);

        // Set the filter model
        filterInstance.setModel({
            filterType: 'text',
            type: 'contains',
            filter: searchTxt,
        });

        // Tell grid to run filter operation again
        this.api.onFilterChanged();
    }

    /**
     * onUpdate1ForAll
     * @param params
     */
    public onUpdate1ForAllWhenEdit(params: any, ignorekeys: string) {
        if (!params || !params.column || !params.data) return;

        // except last item
        for (let index = 0; index < this.api.getDisplayedRowCount(); index++) {
            const element = this.api.getDisplayedRowAtIndex(index).data;
            const isNull = Uti.checkItemIsNull(element, ignorekeys);
            if (isNull) continue;
            element[params.column] = params.data;
        }
    }
    public updateFieldsHas1ForAllWhenAddNew(currentRowIndex: number) {
        // start check from second row
        if (currentRowIndex < 1) return;

        const currentRow = this.api.getDisplayedRowAtIndex(currentRowIndex);
        if (!currentRow || !currentRow.data || !currentRow['columnController']?.columnDefs) return;

        let listColIdMustUpdate1ForAll = [];
        currentRow['columnController']?.columnDefs.forEach((element) => {
            const update1ForAll = this.datatableService.getValueUpdate1ForAll(element.refData?.setting?.Setting);

            if (update1ForAll === '1') {
                listColIdMustUpdate1ForAll.push(element.field);
            }
        });
        if (listColIdMustUpdate1ForAll.length < 0) return;

        const beforeRow = this.api.getDisplayedRowAtIndex(currentRowIndex - 1);
        if (!beforeRow || !beforeRow.data) return;

        listColIdMustUpdate1ForAll.forEach((key) => {
            currentRow.data[key] = beforeRow.data[key];
        });
    }

    /**
     * hasError
     * */
    public hasError() {
        let invalidCells = this.agGridViewContainerRef.element.nativeElement.querySelectorAll('.invalid-cell');
        this.hasValidationErrorLocal = !!invalidCells.length;
        return invalidCells.length;
    }

    /**
     * hasUnsavedRows
     * */
    public hasUnsavedRows() {
        return this.itemsEdited.length > 0 || this.itemsAdded.length > 0 || this.itemsRemoved.length > 0;
    }

    /**
     * getEditedItems
     * */
    public getEditedItems() {
        return {
            itemsAdded: this.itemsAdded,
            itemsEdited: this.itemsEdited,
            itemsRemoved: this.itemsRemoved,
        };
    }

    /**
     * removeAllRowNodes
     **/
    public removeAllRowNodes() {
        if (this.api) {
            let nodeItems = this.getCurrentNodeItems();
            if (nodeItems && nodeItems.length) {
                const res = this.api.applyTransaction({
                    remove: nodeItems,
                });
            }
        }
    }

    /**
     * addNewRow
     **/
    public addNewRow(data?, addIndex = 0, isSelectNewAddedRow: boolean = true) {
        let newItem = {};
        const gridColumns = this.gridOptions.columnDefs.map((colDef: ColDef) => {
            return {
                data: colDef.field,
                setting: colDef.refData ? colDef.refData.setting : null,
            };
        });

        const currentRowCount = this.api?.getDisplayedRowCount() || 0;
        for (const col of gridColumns) {
            const config = null;
            newItem = this.datatableService.createEmptyRowData(newItem, col, config, currentRowCount);
        }

        if (data) {
            for (const col of gridColumns) {
                newItem[col.data] = data[col.data];
            }
        }

        const res = this.api.applyTransaction({
            add: [newItem],
            addIndex: addIndex === -1 ? null : addIndex,
        });

        const item = this.itemsAdded.find((p) => p == newItem);
        if (!item) {
            this.itemsAdded.push(newItem);
        }

        if (isSelectNewAddedRow) {
            this.api.clearFocusedCell();

            //Select new added row
            this.selectRowIndex(0, true, true);
        }

        setTimeout(() => {
            this.hasError();
        });
    }

    /**
     * checkBoxChange
     * @param params
     */
    public checkBoxChange(params, status) {
        let data: any = params.node.data;
        data.colDef = params.colDef;
        if (params.column) {
            switch (params.column.colDef.field) {
                case ColHeaderKey.Delete:
                    this.setDeleteCheckboxStatus(data, status, (item) => {
                        this.api.applyTransaction({ update: [item] });
                        this.checkAndEmitDeleteRowStatus();
                    });
                    this.onDeleteChecked.emit(data);
                    break;
                case ColHeaderKey.SelectAll:
                    data[ColHeaderKey.SelectAll] = status;
                    this.api.applyTransaction({ update: [data] });
                    this.onSelectedAllChecked.emit(data);

                    if (!status) {
                        this.onMarkedAsSelectedAll.emit(
                            this.gridOptions.rowData.filter((item) => item[ColHeaderKey.SelectAll] === true),
                        );
                    } else {
                        const unselectedItems = this.gridOptions.rowData.filter(
                            (item) => item[ColHeaderKey.SelectAll] !== true,
                        );
                        if (!unselectedItems || !unselectedItems.length) {
                            this.onMarkedAsSelectedAll.emit(this.gridOptions.rowData);
                        } else {
                            this.onMarkedAsSelectedAll.emit(
                                this.gridOptions.rowData.filter((item) => item[ColHeaderKey.SelectAll] === true),
                            );
                        }
                    }
                    break;
                case ColHeaderKey.IsActive:
                    data[ColHeaderKey.IsActive] = status;
                    this.api.applyTransaction({ update: [data] });
                    this.cellValueChanged.emit(data);
                    break;

                case ColHeaderKey.MasterCheckbox:
                    // this.isMasterChecked = data[ColHeaderKey.MasterCheckbox] = status;
                    data[ColHeaderKey.MasterCheckbox] = status;
                    this.api.applyTransaction({ update: [data] });

                    if (status) {
                        data[ColHeaderKey.UnMergeCheckbox] = false;
                        this.api.applyTransaction({ update: [data] });
                        this.api.forEachNode((rowNode: RowNode, idx: number) => {
                            if (rowNode != params.node && rowNode.data[ColHeaderKey.MasterCheckbox]) {
                                rowNode.setDataValue(ColHeaderKey.MasterCheckbox, false);
                            }
                        });
                    } else {
                        data[ColHeaderKey.MasterCheckbox] = true;
                        this.api.applyTransaction({ update: [data] });
                    }

                    break;
                case ColHeaderKey.UnMergeCheckbox:
                    // this.isUnMergeChecked = true;
                    data[ColHeaderKey.UnMergeCheckbox] = status;
                    this.api.applyTransaction({ update: [data] });
                    this.cellValueChanged.emit(data);
                    break;

                case ColHeaderKey.noExport:
                    data[ColHeaderKey.noExport] = status;
                    this.api.applyTransaction({ update: [data] });
                    this.cellValueChanged.emit(data);
                    break;

                default:
                    data[params.column.colDef.field] = status;
                    // this.api.applyTransaction({ update: [data] });
                    this.cellValueChanged.emit(data);
                    break;
            }
        }

        if (this.itemsEdited.indexOf(data) >= 0 || params.column.colDef.field == ColHeaderKey.Delete) {
            return;
        }
        this.itemsEdited.push(data);
    }

    /**
     * setDeleteCheckboxStatus
     **/
    public setDeleteCheckboxStatus(data, status, callback?) {
        data[ColHeaderKey.Delete] = status ? true : false;
        if (!status) {
            delete data[ColHeaderKey.IsDeleted];
            this.itemsRemoved = this.itemsRemoved.filter((p) => p != data);
        }

        if (callback) {
            callback(data);
        }
    }

    /**
     * checkAndEmitDeleteRowStatus
     **/
    public checkAndEmitDeleteRowStatus() {
        // const deleteRows = this.gridOptions.rowData.filter(p => p[ColHeaderKey.Delete]);
        const deleteRows = this.getMarkedAsDeletedItems();
        if (deleteRows && deleteRows.length) {
            this.onRowMarkedAsDelete.emit({
                showCommandButtons: true,
                disabledDeleteButton: false,
            });
            this.isMarkedAsDelete = true;
        } else {
            this.onRowMarkedAsDelete.emit({
                showCommandButtons: false,
                disabledDeleteButton: true,
            });
            this.isMarkedAsDelete = false;
        }
    }

    /**
     * Select all checkbox changed event
     * @param data
     * @param status
     * @param callback
     */
    public checkAndEmitSelectAllStatus(status) {
        if (status) this.onMarkedAsSelectedAll.emit(this.gridOptions.rowData);
        else this.onMarkedAsSelectedAll.emit([]);
    }

    /**
     * deleteRows
     **/
    public deleteRows() {
        if (!this.allowDelete && !this.redRowOnDelete) {
            return;
        }
        let removeArray: any = [];
        let updateArray: any = [];
        for (let i = 0; i < this.api.getDisplayedRowCount(); i++) {
            const rowNode = this.api.getDisplayedRowAtIndex(i);
            if (
                rowNode.data[ColHeaderKey.Delete] &&
                (!rowNode.data['DT_RowId'] || rowNode.data['DT_RowId'].indexOf('newrow') < 0)
            ) {
                rowNode.data[ColHeaderKey.IsDeleted] = true;
                // this.api.redrawRows({ rowNodes: [rowNode] });
                const item = this.itemsRemoved.find((p) => p == rowNode.data);
                if (!item) {
                    this.itemsRemoved.push(rowNode.data);
                }
            } else {
                delete rowNode.data[ColHeaderKey.IsDeleted];
                this.itemsRemoved = this.itemsRemoved.filter((p) => p != rowNode.data);
            }
            if (
                rowNode.data[ColHeaderKey.Delete] &&
                rowNode.data['DT_RowId'] &&
                rowNode.data['DT_RowId'].indexOf('newrow') > -1
            ) {
                removeArray.push(rowNode.data);
            } else {
                updateArray.push(rowNode.data);
            }
        }
        if (removeArray.length) this.api.applyTransaction({ remove: removeArray });
        if (updateArray.length) this.api.applyTransaction({ update: updateArray });
        this.onDeletedRows.emit(true);
        // Update value for check-all of delete column
        this.onDeleteChecked.emit({ colDef: { field: ColHeaderKey.Delete } });
    }

    public deleteRowByItem(rowNodeData: any) {
        const uniqueKeyString = 'Guid';

        const indexInAddList = this.itemsAdded.findIndex((x) => x[uniqueKeyString] === rowNodeData[uniqueKeyString]);
        if (indexInAddList > -1) {
            this.itemsAdded.splice(indexInAddList, 1);
        } else {
            this.itemsRemoved.push(rowNodeData);
        }

        const rowIndex = this.itemsHasCellInvalid.indexOf(rowNodeData[uniqueKeyString]);
        if (rowIndex > -1) this.itemsHasCellInvalid.splice(rowIndex, 1);
        this.api.applyTransaction({
            remove: [rowNodeData],
        });
    }

    /**
     * onSelectionChanged
     * @param $event
     */
    public onSelectionChanged($event) {
        if (this.isDragging) {
            return;
        }
        const rowData = this.selectedItem();
        if (rowData) {
            this.rowClick.emit(rowData);
        }
        this.assignSelectedRowForTranslateData();
    }

    /**
     * Auto select row if there's only 01 row OR there's previous selected row
     * */
    public autoSelectRow() {
        if (this.api && this.gridOptions && this.gridOptions.rowData && this.gridOptions.rowData.length) {
            // Auto select row if there's only 01 row
            if (!this.preventAutoSelectFirstRow && this.autoSelectFirstRow) {
                this.selectRowIndex(0);
            } else {
                if (this.autoSelectCurrentRowAfterChangingData) {
                    if (this.selectedNode && this.selectedNode.rowIndex <= this.gridOptions.rowData.length - 1) {
                        this.selectRowIndex(this.selectedNode.rowIndex);
                    }
                }
            }
        }
    }

    /**
     * changeToSingleRowMode
     */
    public changeToSingleRowMode() {
        if (!this.api || !this.selectedNode) {
            return;
        }
        let hardcodedFilter = {};
        //if (this.selectedNode && this.selectedNode.data['DT_RowId']) {
        //    hardcodedFilter['DT_RowId'] = {
        //        type: "contains",
        //        filter: this.selectedNode.data['DT_RowId']
        //    }
        //    this.api.setFilterModel(hardcodedFilter);
        //    this.api.onFilterChanged();
        //}
        if (this.selectedNode) {
            Object.keys(this.selectedNode.data).forEach((key) => {
                hardcodedFilter[key] = {
                    type: 'contains',
                    filter: this.selectedNode.data[key],
                };
            });
            this.api.setFilterModel(hardcodedFilter);
            this.api.onFilterChanged();
        }
    }

    /**
     * changeToMultipleRowMode
     **/
    public changeToMultipleRowMode() {
        if (this.api) {
            this.api.setFilterModel(null);
            this.api.onFilterChanged();
        }
    }

    /**
     * refresh
     **/
    public refresh() {
        if (this.api) {
            this.api.redrawRows();
        }
    }

    /**
     * selectRowIndex
     * @param index
     */
    public selectRowIndex(index: number, thenScrollToIndex: boolean = true, thenEditRow?: boolean) {
        this.api.forEachNode((rowNode: RowNode, rowIndex: number) => {
            if (rowIndex == index) {
                rowNode.setSelected(true);
            }
        });

        if (thenScrollToIndex) {
            this.api.ensureIndexVisible(index);
        }

        if (thenEditRow) {
            const firstCol = this.firstVisibleColumn();
            if (firstCol) {
                this.api.startEditingCell({
                    rowIndex: 0,
                    colKey: firstCol.field,
                });
            }
        }
    }

    /**
     * Get first visible column
     * */
    public firstVisibleColumn(): ColDef {
        return this.gridOptions.columnDefs.find((col: ColDef) => !col.hide);
    }

    /**
     * calculatePinnedRowBottomData
     **/
    public calculatePinnedRowBottomData() {
        let rows = [];
        let data = {};
        this.gridOptions.columnDefs.forEach((colDef: ColDef) => {
            if (colDef.field) {
                data[colDef.field] = null;
                if (colDef.refData && colDef.refData.controlType) {
                    let total = 0;
                    switch (colDef.refData.controlType.toLowerCase()) {
                        case 'numeric':
                            if (this.api && this.api.getDisplayedRowCount()) {
                                this.api.forEachNode((rowNode: RowNode) => {
                                    if (rowNode.data[colDef.field]) {
                                        total += rowNode.data[colDef.field];
                                    }
                                });
                            } else {
                                this.gridOptions.rowData.forEach((item) => {
                                    if (item[colDef.field]) {
                                        total += item[colDef.field];
                                    }
                                });
                            }
                            data[colDef.field] = ceil(total, 2);
                            break;
                    }
                }
            }
        });
        rows.push(data);
        if (this.totalRowMode == 'top') {
            this.pinnedTopRowData = rows;
        } else if (this.totalRowMode == 'bottom') {
            this.pinnedBottomRowData = rows;
        } else {
            this.pinnedTopRowData = rows;
            this.pinnedBottomRowData = rows;
        }
    }

    /**
     * Cell focused event
     * @param $event
     */
    public onCellFocused($event) {
        if (!$event || !$event.column || !$event.column.colDef) {
            return;
        }

        if (this.hasPriorityColumn && $event.column.colDef.field === CONTROL_COLUMNS.Priority) {
            return;
        }

        /*
        const selectedNodes = this.api.getSelectedNodes();
        if (selectedNodes && selectedNodes.length) {
            if (selectedNodes[0].rowIndex != $event.rowIndex) {
                this.selectRowIndex($event.rowIndex);
            }
        } else {
            this.selectRowIndex($event.rowIndex);
        }
        */

        const isNotEditableCheckboxAndButton =
            !!$event.column.colDef.cellRendererFramework &&
            $event.column.colDef.cellRendererFramework.name !== 'CheckboxEditableCellRenderer' &&
            $event.column.colDef.cellRendererFramework.name !== 'TemplateButtonCellRenderer';
        if (
            !$event.column.colDef.editable &&
            (!$event.column.colDef.cellRendererFramework || isNotEditableCheckboxAndButton)
        ) {
            return;
        }

        if (
            this._selectingCell &&
            this._selectingCell.rowIndex === $event.rowIndex &&
            this._selectingCell.colDef.field === $event.column.colDef.field
        ) {
            return;
        }

        this._selectingCell.rowIndex = $event.rowIndex;
        this._selectingCell.colDef = $event.column.colDef;

        this.api.stopEditing();
        $event.api.startEditingCell({
            rowIndex: $event.rowIndex,
            colKey: $event.column.colDef.field,
        });

        //const cellData = $event.api.getValue($event.column.colDef.field, $event.api.getDisplayedRowAtIndex($event.rowIndex));
        //let isBooleanCol = $event.column.colDef.refData && $event.column.colDef.refData.controlType === 'Checkbox' && (isBoolean(cellData) || cellData == 1 || cellData == 0 || isNil(cellData));
        //if (isBooleanCol
        //    || isNil(cellData)
        //    || (isString(cellData) && (!cellData || !cellData.trim()))
        //    || (isObject(cellData) && !cellData.key)) {
        //    this.api.stopEditing();
        //    $event.api.startEditingCell({
        //        rowIndex: $event.rowIndex,
        //        colKey: $event.column.colDef.field
        //    });
        //}
    }

    /**
     * On column resized callback
     * @param $event
     */
    public onColumnResized($event) {
        if ($event) {
            if ($event.source === 'uiColumnDragged' && $event.finished) {
                this.updateColumnState($event);
            } else if ($event.source === 'autosizeColumns' && $event.finished) {
                this.updateColumnState($event);
            }
        }
    }

    /**
     * onColumnPinned
     * @param $event
     */
    public onColumnPinned($event) {
        this.updateColumnState($event);
    }

    /**
     * Update comlumn state after there are some actions occur on col (Resize, Show/Hide Col)
     **/
    private updateColumnState($event?) {
        if (!this.isDirtyFromUserAction()) return;

        if (this.columnsLayoutSettings) {
            this.columnsLayoutSettings.settings = this.getColumnLayout();
            // TamTV will update later
            // this.columnsLayoutSettings.sortState = this.api ? this.api.getSortModel() : null;
            const outputData = {
                columnState: this.getColumnLayout(),
                source: $event ? $event.source : null,
                type: $event ? $event.type : null,
            };
            this.changeColumnLayout.emit(outputData);
        }
        this.isColumnsLayoutChanged = true;
    }

    private isDirtyFromUserAction() {
        const columnsLayout = this.getColumnLayout() || [];
        // TamTV will update later
        const sortModel = [];
        // const sortModel = this.api ? this.api.getSortModel() || [] : [];
        const setting =
            this.columnsLayoutSettings && this.columnsLayoutSettings.settings
                ? this.columnsLayoutSettings.settings
                : [];
        const sortState =
            this.columnsLayoutSettings && this.columnsLayoutSettings.sortState
                ? this.columnsLayoutSettings.sortState
                : [];

        return (
            columnsLayout.length != setting.length ||
            sortModel.length != sortState.length ||
            JSON.stringify(setting) !== JSON.stringify(columnsLayout) ||
            JSON.stringify(sortState) !== JSON.stringify(sortModel)
        );
    }

    /**
     * Load column layout
     * */
    public loadColumnLayout() {
        if (!this.gridOptions || !this.gridOptions.columnDefs) {
            return;
        }
        if (this.allowSetColumnState) {
            if (this.columnApi && this.columnsLayoutSettings) {
                if (this.columnsLayoutSettings.settings && typeof this.columnsLayoutSettings.settings === 'object') {
                    //Check to update column state in case of length of state is not equal to current columns length
                    if (
                        this._isColumnsChanged(
                            this.gridOptions.columnDefs,
                            this.columnsLayoutSettings.settings,
                            'colId',
                        ) ||
                        this.gridOptions.columnDefs.length !== this.columnsLayoutSettings.settings.length
                    ) {
                        let missingColDefs: ColDef[] = [];
                        for (let i = 0; i < this.gridOptions.columnDefs.length; i++) {
                            if (
                                !this.columnsLayoutSettings.settings.find(
                                    (x) => x['colId'] == this.gridOptions.columnDefs[i]['field'],
                                )
                            ) {
                                missingColDefs.push(this.gridOptions.columnDefs[i]);
                            }
                        }

                        for (let i = 0; i < missingColDefs.length; i++) {
                            if (missingColDefs[i].field === BUTTON_COLUMNS.rowColCheckAll) {
                                this.columnsLayoutSettings.settings.splice(1, 0, {
                                    aggFunc: null,
                                    colId: missingColDefs[i].field,
                                    hide: true,
                                    pinned: null,
                                    pivotIndex: null,
                                    rowGroupIndex: null,
                                    width: 100,
                                });
                            } else {
                                this.columnsLayoutSettings.settings.push({
                                    aggFunc: null,
                                    colId: missingColDefs[i].field,
                                    hide: false,
                                    pinned: null,
                                    pivotIndex: null,
                                    rowGroupIndex: null,
                                    width: 100,
                                });
                            }
                        }
                    }

                    this.columnsLayoutSettings.settings = this.columnsLayoutSettings.settings.map((setting) => {
                        return {
                            ...setting,
                            hide: this.hideColumnFromAccessRight(setting),
                        };
                    });

                    this.columnApi.setColumnState(this.columnsLayoutSettings.settings);
                }
                // TamTV will update later
                // if (this.columnsLayoutSettings.sortState) {
                //     this.api.setSortModel(this.columnsLayoutSettings.sortState);
                // }
                //
                this.showHideColumn();
            }
        }
    }

    /**
     * showHideColumn
     **/
    public showHideColumn() {
        //
        if (this.columnApi) {
            this.columnApi.setColumnsVisible([ColHeaderKey.RowDrag], this.isEditting);
            this.columnApi.setColumnsVisible([ColHeaderKey.Delete], !this.readOnly);
        }
    }

    public getColumnLayout() {
        if (this.columnApi) {
            return this.columnApi.getColumnState();
        }

        return null;
    }

    private _buildGroupByColumn(columnDefs: any[]) {
        let groupColumns: any[] = [];

        for (let i = 0; i < columnDefs.length; i++) {
            if (this.datatableService.hasDisplayField(columnDefs[i].refData, 'GroupDisplayColumn')) {
                let colName = this._getColumnName(
                    columnDefs,
                    this.datatableService.getDisplayFieldValue(columnDefs[i].refData, 'GroupDisplayColumn'),
                );
                if (colName) {
                    groupColumns.push(colName);
                }
            }

            if (this.datatableService.hasDisplayField(columnDefs[i].refData, 'AutoGroupColumnDef')) {
                this.gridOptions.autoGroupColumnDef = {
                    headerName: columnDefs[i].headerName,
                    field: columnDefs[i].field,
                };
            }
        }

        groupColumns.forEach((groupCol: string) => {
            let col: ColDef = columnDefs.find((c) => c.field == groupCol);
            if (col) {
                col.rowGroup = true;
            }
        });
    }

    private _getColumnName(columnDefs: any[], originalColumnName: string) {
        let col = columnDefs.find((c) => c.refData && c.refData.setting.OriginalColumnName == originalColumnName);
        if (col) {
            return col.field;
        }

        return null;
    }

    /**
     * toggleDeleteColumn
     * @param isShow
     */
    public toggleDeleteColumn(isShow) {
        //if (this.gridOptions && this.gridOptions.columnDefs) {
        //    const deleteCol: ColDef = this.gridOptions.columnDefs.find((p: ColDef) => {
        //        return p.field == ColHeaderKey.Delete;
        //    });
        //    if (deleteCol) {
        //        const isVisible = this.columnApi.getColumn(ColHeaderKey.Delete).isVisible();
        //        this.columnApi.setColumnVisible(ColHeaderKey.Delete, isShow);
        //        if (!isVisible && isShow) {
        //            if (callback) {
        //                callback();
        //            }
        //        }
        //    }
        //}
    }

    private _isColumnsChanged(oldColumns: any[], newColumns: any[], compareFieldName: string) {
        if (!oldColumns || !newColumns) {
            return true;
        }

        if (oldColumns.length !== newColumns.length) {
            return true;
        }

        for (let i = 0; i < oldColumns.length; i++) {
            if (!newColumns.find((x) => x[compareFieldName] == oldColumns[i][compareFieldName])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Assign selected row for translate data
     **/
    private assignSelectedRowForTranslateData() {
        if (this.api && this.api.getSelectedNodes()) {
            if (this.api.getSelectedNodes()[0]) {
                if (this.translateData) {
                    // service for translate grid data
                    this.translateData.gridSelectedRow = [this.api.getSelectedNodes()[0].data];
                }
            }
        }
    }

    /**
     * Lost focus of grid
     **/
    public stopEditing() {
        if (!this.api) return;

        this.api.stopEditing();
    }

    /**
     * Apply Filter
     **/
    public applyFilter() {
        this.api.clearFocusedCell();
        this.api.setQuickFilter(this.filter);
    }

    /**
     *setSelectedRow
     **/
    public setSelectedRow(selectedRow: any, keyColumnNames?: string) {
        // if (!this.gridOptions || !this.gridOptions.rowData)
        //     return;
        setTimeout(() => {
            if (!this.gridOptions || !this.gridOptions.rowData) return;

            if (keyColumnNames) {
                const keys = keyColumnNames.split(',');
                const compareObj1 = {};
                for (var j = 0; j < keys.length; j++) {
                    const key = keys[j];
                    compareObj1[key] = selectedRow[key];
                }

                for (let i = 0; i < this.gridOptions.rowData.length; i++) {
                    const item = cloneDeep(this.gridOptions.rowData[i]);
                    const compareObj2 = {};
                    for (var j = 0; j < keys.length; j++) {
                        const key = keys[j];
                        compareObj2[key] = item[key];
                    }
                    let isEqual: boolean =
                        JSON.stringify(compareObj1).toLowerCase() === JSON.stringify(compareObj2).toLowerCase();
                    if (isEqual) {
                        this.selectRowIndex(i);
                        break;
                    }
                }
                return;
            }

            for (let i = 0; i < this.gridOptions.rowData.length; i++) {
                let item = cloneDeep(this.gridOptions.rowData[i]);
                delete item['DT_RowId'];
                delete item['isReadOnlyColumn'];
                delete selectedRow['DT_RowId'];
                delete selectedRow['isReadOnlyColumn'];
                if (JSON.stringify(selectedRow) === JSON.stringify(item)) {
                    this.selectRowIndex(i);
                    break;
                }
            }
        }, 500);
    }

    /**
     * scrollToPosition
     * @param mode
     */
    public scrollToPosition(mode) {}

    /**
     * scrollHover
     * @param mode
     */
    public scrollHover(mode) {}

    /**
     * scrollUnHover
     * @param mode
     */
    public scrollUnHover(mode) {}

    /**
     * collapseGroupsToLevel
     * @param level
     */
    public collapseGroupsToLevel(mode) {
        // Calling node.setExpanded() causes the grid to get redrawn.
        // If you have many nodes you want to expand, then it is best to set node.expanded = true directly,
        // and then call api.onGroupExpandedOrCollapsed() when finished to get the grid to
        // redraw the grid again just once
        this.api.forEachNode((node) => {
            node.expanded = mode == 1 ? true : false;
        });
        this.api.onGroupExpandedOrCollapsed();
    }

    /**
     * deselectRow
     **/
    public deselectRow() {
        if (this.api) {
            this.api.deselectAll();
        }
    }

    /**
     * deleteRowByRowId
     * @param rowId
     */
    public deleteRowByRowId(rowId: any) {
        if (this.api) {
            let removeData: Array<any> = [];
            this.api.forEachNode((rowNode: RowNode) => {
                if (rowNode.data[ColHeaderKey.Id] == rowId) {
                    removeData.push(rowNode.data);
                }
            });
            this.api.applyTransaction({ remove: removeData });
        }
    }

    /**
     * setActiveRowByCondition
     * */
    public setActiveRowByCondition(obj) {}

    public onCellClicked($event) {
        const arrayData = this.parseObjectSelectedToArray($event?.data);
        this.cellClick.emit(arrayData);
        if (this.hasPriorityColumn) {
            if (!isNil($event.data['IsActive'])) {
                if ($event.colDef.field !== 'IsActive' && $event.data['IsActive'] === false) {
                    return;
                }
            }

            if (!this.readOnly && $event.colDef.field == CONTROL_COLUMNS.Priority) {
                this.updateCellPriority($event.data);
            }
        } else if (this.isEditting) {
            this.api.startEditingCell({
                rowIndex: $event.rowIndex,
                colKey: $event.colDef.field,
            });
        }
    }

    public onCellContextMenu($event) {
        if (this.hasPriorityColumn) {
            if (!isNil($event.data['IsActive'])) {
                if ($event.colDef.field !== 'IsActive' && $event.data['IsActive'] === false) {
                    return;
                }
            }

            if (!this.readOnly && $event.colDef.field == CONTROL_COLUMNS.Priority) {
                this.api.hidePopupMenu();
                this.deletePriorityForCurrentItem($event.data);
            }
        }
    }

    /**
     * Update value for cell
     */
    public updateCellByOcr(colId: string, value: any, rowNode: RowNode) {
        if (!rowNode || !colId) return;

        const column = rowNode['columnController']?.columnDefs.find((x) => x['field'] === colId)?.refData;
        const controlTypeName = column?.controlType || '';

        switch (controlTypeName.toLowerCase()) {
            case 'numeric':
                const number = Uti.transformNumberHasDecimal(value);
                value = Number(number);
                this.datatableService.influencingField(column.setting?.Setting, rowNode.data, colId, value);
                break;
            case 'combobox':
            case 'tabledropdown':
                if (!value) break;

                value = {
                    valueOcr: value,
                    type: 'ocr',
                    comboboxType: this.datatableService.getComboboxType(column),
                };
                break;
            default:
                break;
        }
        this.updateCellValue(colId, value, rowNode);
    }

    /**
     * Update value for cell
     */
    public updateCellValue(colId: string, value: string, rowNode: RowNode, isRefresh = true) {
        if (!rowNode || !colId) return;

        rowNode.setDataValue(colId, value);

        if (isRefresh) this.refresh();
    }

    /**
     * getHTMLTable
     **/
    public getHTMLTable(): string {
        let tblString = '';
        if (this.api && this.columnApi) {
            //this.columnApi.autoSizeAllColumns();
            this.api.setDomLayout('print');
            tblString = this.agGridViewContainerRef.element.nativeElement.outerHTML;

            setTimeout(() => {
                this.loadColumnLayout();
                this.api.setDomLayout(null);
            });

            //// start table
            //let tbl = '<table width="100%">';

            //// headers
            //tbl += '<thead>';
            //tbl +=  this.renderRowHeader(this.columnApi.getAllDisplayedColumns());
            ////for (let r = 0; r < flex.columnHeaders.rows.length; r++) {
            ////    tbl += this.renderRow(flex.columnHeaders, r);
            ////}
            //tbl += '</thead>';

            //// body
            //tbl += '<tbody>';
            ////for (let r = 0; r < flex.rows.length; r++) {
            ////    tbl += this.renderRow(flex.cells, r);
            ////}
            //tbl += '</tbody>';

            //// done
            //tbl += '</table>';
        }
        return tblString;
    }

    /**
     * Render Row Header
     * @param colHeaders
     */
    private renderRowHeader(colHeaders: Array<Column>) {
        let tr = '';
        tr += '<tr>';
        for (let c = 0; c < colHeaders.length; c++) {
            let col: Column = colHeaders[c];
            if (col.getColDef().field == ColHeaderKey.Delete) {
                break;
            }
            if (col.getActualWidth() > 0) {
                // get cell style, content
                let style = 'width:' + col.getActualWidth() + 'px;text-align: left',
                    content = col.getColDef().headerName,
                    cellElement = '';

                let className = '';

                //if (cellElement) {
                //    className = cellElement.className;
                //}

                tr += '<th style="' + style + '" class="' + className + '" > ' + content + ' </th>';
            }
        }
        tr += '</tr>';
        return tr;
    }

    /**
     *showToolPanel
     * */
    public showToolPanel(status) {
        if (this.api) {
            this.api.setSideBarVisible(status);

            if (this.fitWidth) {
                this.sizeColumnsToFit();
            }

            if (this.columnsLayoutSettings) {
                this.columnsLayoutSettings.isShowToolPanels = status;
            }
        }
    }

    public rightClicked($event) {
        this.store.dispatch(this.processDataActions.dontWantToShowContextMenu());
        this.rowRightClicked.emit();
    }

    public buildContextMenuItems(params) {
        if (this.parentInstance && this.parentInstance.makeContextMenu) {
            this._contextMenuItems = this.parentInstance.makeContextMenu(this.getRowDataByCellFocus());
        }
        this._contextMenuItems = this.appendDefaultContextMenu(this._contextMenuItems || []);
        this.agGridService.buildContextMenuForTranslation(this._contextMenuItems);
        this.contextMenuItemsSubject.next(this._contextMenuItems);
        return this._contextMenuItems;
    }

    public getRowDataByCellFocus() {
        if (this.api) {
            const cell = this.api.getFocusedCell();
            if (!cell) return null;
            const row = this.api.getDisplayedRowAtIndex(cell.rowIndex);
            if (!row || !row.data) return null;
            return Uti.mapObjectToCamel(row.data);
        }
        return null;
    }

    /**
     * Manual update rows data
     * @param data
     */
    public updateRowData(data: any[], isAddToTtemsEditedList = true) {
        this.api.applyTransaction({ update: data });

        if (isAddToTtemsEditedList && !this.itemsEdited.find((x) => x.DT_RowId === data[0].DT_RowId)) {
            this.itemsEdited.push(data[0]);
        }
    }

    private isColumnMoved = false;
    public onColumnMoved($event) {
        if ($event && $event.source === 'uiColumnDragged') {
            this.isColumnMoved = true;
        }
    }

    public onDragStopped($event) {
        if (this.isColumnMoved) {
            this.updateColumnState($event);
            this.isColumnMoved = false;
        }
    }

    public onColumnRowGroupChanged($event) {
        this.updateColumnState($event);
    }

    public onGridSizeChanged($event) {
        if (this.fitWidth) {
            this.sizeColumnsToFit();
        }
    }

    /*Grid Header*/
    public onGridHeaderSearch(keyword: string) {
        this.pageIndex = 1;
        this.hightlightKeywords = keyword;
        this.onTableSearch.emit(keyword);
    }

    public onGridHeaderFilter(keyword: string) {
        this.filter = keyword;
    }

    public uploadFile() {
        this.onUploadFileClick.emit(true);
    }

    public selectedItem(): any {
        if (this.api) {
            let selectedNodes = this.api.getSelectedNodes();
            if (selectedNodes.length) {
                this.selectedNode = selectedNodes[0];
                const rowData = this.agGridService.buildRowClickData(selectedNodes[0].data);
                return rowData;
            }
        }
        return null;
    }

    /*Grid Header*/

    /**
     * currentPageChanged
     * @param event
     */
    public currentPageChanged(event: IPageChangedEvent): void {
        this.pageChanged.emit(event);
    }

    public onPageNumberDefault(pageNumber: number) {
        this.pageNumberChanged.emit(pageNumber);
    }

    /**
     * initDragDropHandler
     **/
    private initDragDropHandler() {
        const createDragContent = function (x, y, offsetX, offsetY, content) {
            const dragImage = document.createElement('div');
            dragImage.innerHTML = content;
            dragImage.style.position = 'absolute';
            dragImage.style.pointerEvents = 'none';
            dragImage.style.top = '0px'; // Math.max(0, y - offsetY) + 'px';
            dragImage.style.left = '0px'; // Math.max(0, x) + 'px';
            dragImage.style.zIndex = '1000';
            dragImage.classList.add('xn-grid-drag');

            document.body.appendChild(dragImage);

            setTimeout(function () {
                dragImage.style.visibility = 'hidden';
            }, 100);

            return dragImage;
        };

        const self = this;
        let node;
        const bodyContainer = this.agGridViewContainerRef.element.nativeElement.querySelector('.ag-body-container');
        if (!bodyContainer) return;
        bodyContainer.draggable = true;
        bodyContainer.addEventListener(
            'dragstart',
            function (e) {
                let focusedCell = self.api.getFocusedCell();
                if (focusedCell) {
                    let row = self.api.getDisplayedRowAtIndex(focusedCell.rowIndex);
                    let item = row.data;
                    item = mapKeys(item, function (v, k) {
                        return camelCase(k.toString());
                    });
                    if (self.customDragContent && self.customDragContent.data) {
                        item['refData'] = self.customDragContent.data;
                    }
                    e.dataTransfer.setData('text', JSON.stringify(item));
                    if (self.customDragContent && self.customDragContent.dragIcon) {
                        node = createDragContent(
                            e.pageX,
                            e.pageY,
                            e.offsetX,
                            e.offsetY,
                            self.customDragContent.dragIcon,
                        );
                        const dataTransfer: any = e.dataTransfer;
                        dataTransfer.setDragImage(node, 5, 5);
                    }
                    self.isDragging = true;
                }
            },
            true,
        );

        bodyContainer.addEventListener(
            'dragend',
            function (e) {
                $('.xn-grid-drag').remove();
                self.isDragging = false;
            },
            true,
        );
    }

    /**
     * Get Value At Focused Cell
     **/
    private getValueAtFocusedCell() {
        let focusedCell = this.api.getFocusedCell();
        if (focusedCell) {
            let row = this.api.getDisplayedRowAtIndex(focusedCell.rowIndex);
            let cellValue = this.api.getValue(focusedCell.column.getColId(), row);
            return cellValue;
        }
        return null;
    }

    /**
     * Get current data items of grid
     **/
    public getCurrentNodeItems() {
        let items: Array<any> = [];
        if (this.api) {
            this.api.forEachNode((rowNode: RowNode) => {
                items.push(rowNode.data);
            });
        }
        return items;
    }

    /**
     * Get all items that marked as deleted
     **/
    public getMarkedAsDeletedItems() {
        let items: Array<any> = [];
        this.api.forEachNode((rowNode: RowNode) => {
            if (rowNode.data[ColHeaderKey.Delete]) {
                items.push(rowNode.data);
            }
        });
        return items;
    }

    private hideColumnFromAccessRight(col) {
        switch (col.colId) {
            case 'Return':
                let gridCol: ColDef = this.gridOptions.columnDefs.find((c: ColDef) => c.field === col.colId);
                if (gridCol && gridCol.refData.controlType === 'Button') {
                    let accessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.SubModule, {
                        idSettingsGUIParent: 5,
                        idSettingsGUI: 29,
                    });

                    if (accessRight) {
                        return !accessRight.read;
                    }
                }

                return col.hide;

            default:
                return col.hide;
        }
    }

    public getSelectedNode(): RowNode {
        return this.api.getSelectedNodes().length ? this.api.getSelectedNodes()[0] : null;
    }

    public getSelectedNodes(): RowNode[] {
        return this.api.getSelectedNodes();
    }

    /**
     * sortChanged
     * @param $event
     */
    public sortChanged($event) {
        this.updateColumnState($event);
    }

    private addSelectedCar(data) {
        const selected = this.getSelectedNodes();
        if (Array.isArray(selected) && selected.length) data.IdPriceTag = map(selected, 'data.IdPriceTag').join(',');
        data.add = true;
        this.onRowClicked({ data });
    }

    private addAllCar() {
        const data = this.getAllCurentData();
        const item = cloneDeep(data[0]);
        if (!item) return;
        item.add = true;
        item.IdPriceTag = map(data, 'IdPriceTag').join(',');
        this.onRowClicked({ data: item });
    }

    private appendDefaultContextMenu(contextMenuItems: Array<any>) {
        const copy = 'copy';
        if (contextMenuItems.indexOf(copy) < 0) {
            contextMenuItems.push(copy);
        }
        const copyWithHeaders = 'copyWithHeaders';
        if (contextMenuItems.indexOf(copyWithHeaders) < 0) {
            contextMenuItems.push(copyWithHeaders);
        }

        let nameCopyRow = 'Copy row',
            keyCopyRow = nameCopyRow
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .replace(/ /g, '_');
        if (!Uti.existItemInArray(contextMenuItems, { key: keyCopyRow }, 'key')) {
            contextMenuItems.push({
                name: nameCopyRow,
                key: keyCopyRow,
                action: (event) => {
                    this.api.copySelectedRowsToClipboard();
                },
                cssClasses: [''],
                icon: `<i class="fa  fa-clipboard  blue-color  ag-context-icon"/>`,
            });
        }

        // TamTV with new version copySelectedRowsToClipboard don't have function copy with header
        // let nameCopyRowWithHeaders = 'Copy row with Headers',
        //     keyCopyRowWithHeaders = nameCopyRowWithHeaders
        //         .replace(/(<([^>]+)>)/gi, '')
        //         .trim()
        //         .replace(/ /g, '_');
        // if (!Uti.existItemInArray(contextMenuItems, { key: keyCopyRowWithHeaders }, 'key')) {
        //     contextMenuItems.push({
        //         name: nameCopyRowWithHeaders,
        //         key: keyCopyRowWithHeaders,
        //         action: (event) => {
        //             this.api.copySelectedRowsToClipboard(true);
        //         },
        //         cssClasses: [''],
        //         icon: `<i class="fa  fa-clipboard  blue-color  ag-context-icon"/>`,
        //     });
        // }

        let nameEnterDirection = 'Enter Direction',
            keyEnterDirection = nameEnterDirection
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .replace(/ /g, '_');
        if (!Uti.existItemInArray(contextMenuItems, { key: keyEnterDirection }, 'key')) {
            contextMenuItems.push('separator');

            let namePrint = 'Print',
                keyPrint = namePrint
                    .replace(/(<([^>]+)>)/gi, '')
                    .trim()
                    .replace(/ /g, '_');
            contextMenuItems.push({
                name: namePrint,
                key: keyPrint,
                action: (event) => {
                    // TamTV with new version copySelectedRowsToClipboard don't have function copy with header
                    this.api.copySelectedRowsToClipboard();
                },
                cssClasses: [''],
                icon: `<i class="fa fa-print blue-color ag-context-icon"/>`,
            });

            let nameRefresh = 'Refresh',
                keyRefresh = nameRefresh
                    .replace(/(<([^>]+)>)/gi, '')
                    .trim()
                    .replace(/ /g, '_');
            contextMenuItems.push({
                name: nameRefresh,
                key: keyRefresh,
                action: (event) => {
                    // TamTV with new version copySelectedRowsToClipboard don't have function copy with header
                    this.api.copySelectedRowsToClipboard();
                },
                cssClasses: [''],
                icon: `<i class="fa fa-undo  blue-color  ag-context-icon"/>`,
            });

            contextMenuItems.push({
                name: nameEnterDirection,
                key: keyEnterDirection,
                action: (event) => {
                    // TamTV with new version copySelectedRowsToClipboard don't have function copy with header
                    this.api.copySelectedRowsToClipboard();
                },
                cssClasses: [''],
                icon: `<i class="fa fa-angle-double-right blue-color"></i>`,
                subMenu: [
                    {
                        name: 'Go to the next row',
                        icon: `<i class="fa fa-arrow-down blue-color"></i>`,
                        action: (event) => {
                            this.enterMovesDown = true;
                            this.api.applyTransaction;
                        },
                    },
                    {
                        name: 'Go to the next column',
                        icon: `<i class="fa fa-arrow-right blue-color"></i>`,
                        action: (event) => {
                            this.enterMovesDown = false;
                        },
                    },
                ],
            });
        }
        const paste = 'paste';
        if (contextMenuItems.indexOf(paste) < 0) {
            contextMenuItems.push(paste);
        }

        let nameExport = 'Export',
            keyExport = nameExport
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .replace(/ /g, '_');
        if (this.canExport && !Uti.existItemInArray(contextMenuItems, { key: keyExport }, 'key')) {
            contextMenuItems.push('separator');
            contextMenuItems.push({
                name: nameExport,
                key: keyExport,
                icon: `<i class="fa fa-file-excel-o  blue-color ag-context-icon"/>`,
                subMenu: [
                    {
                        name: 'CSV Export',
                        action: (event) => {
                            this.api.exportDataAsCsv();
                        },
                    },
                    {
                        name: 'Excel Export (.xlsx)',
                        action: (event) => {
                            this.api.exportDataAsExcel({
                                exportMode: 'xlsx',
                                processCellCallback: (params) => {
                                    return this.exportProcessCellCallback(params);
                                },
                                sheetName: this.sheetName,
                            });
                        },
                    },
                    {
                        name: 'Excel Export (.xml)',
                        action: (event) => {
                            this.api.exportDataAsExcel({
                                exportMode: 'xml',
                                processCellCallback: (params) => {
                                    return this.exportProcessCellCallback(params);
                                },
                            });
                        },
                    },
                ],
            });
        }

        let nameFitWidthColumns = 'Fit width columns',
            keyFitWidthColumns = nameFitWidthColumns
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .replace(/ /g, '_');
        if (!Uti.existItemInArray(contextMenuItems, { key: keyFitWidthColumns }, 'key')) {
            contextMenuItems.push({
                name: nameFitWidthColumns,
                key: keyFitWidthColumns,
                action: (event) => {
                    setTimeout(() => {
                        this.sizeColumnsToFit();
                    }, 200);
                    this.isColumnsLayoutChanged = true;
                },
                cssClasses: [''],
                icon: `<i class="fa  fa-arrows  ag-context-icon"/>`,
            });
        }

        let nameSaveTableSetting = 'Save table setting',
            keySaveTableSetting = nameSaveTableSetting
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .replace(/ /g, '_');
        if (
            this.isColumnsLayoutChanged &&
            !Uti.existItemInArray(contextMenuItems, { key: keySaveTableSetting }, 'key')
        ) {
            contextMenuItems.push({
                name: nameSaveTableSetting,
                key: keySaveTableSetting,
                action: (event) => {
                    this.saveColumnsLayout();
                },
                cssClasses: [''],
                icon: `<i class="fa  fa-save  orange-color  ag-context-icon"/>`,
            });
        }
        if (!this.isColumnsLayoutChanged) {
            Uti.removeItemInArray(contextMenuItems, { key: keySaveTableSetting }, 'key');
        }
        const rowData = this.getRowDataByCellFocus();
        if (rowData?.idPriceTag) {
            contextMenuItems.unshift('separator');
            contextMenuItems.unshift({
                name: `<span class="pull-left">Add all car</span>`, //Ctrl+P
                action: (event) => {
                    this.addAllCar();
                },
                cssClasses: [''],
                icon: `<i class="fa fa-plus-square  green-color  ag-context-icon"/>`,
                key: 'AddAllCars',
            });
            contextMenuItems.unshift({
                name: `<span class="pull-left">Add selected car</span>`, //Ctrl+P
                action: (event) => {
                    this.addSelectedCar(rowData);
                },
                cssClasses: [''],
                icon: `<i class="fa fa-plus  green-color  ag-context-icon"/>`,
                key: 'AddSelectedCar',
            });
        }

        return contextMenuItems;
    }

    /**
     * exportProcessCellCallback
     * */
    private exportProcessCellCallback(params) {
        let data = params.value;
        if (isObject(data)) {
            data = data.value;
        }
        if (
            params &&
            params.column &&
            params.column.getColDef().refData &&
            params.column.getColDef().refData.controlType
        ) {
            switch (params.column.getColDef().refData.controlType.toLowerCase()) {
                case 'date':
                case 'datetimepicker':
                    data = this.agGridService.dateFormatter(params);
                    break;
                case 'checkbox':
                    data = this.agGridService.boolFormatter(params);
            }
        }
        return data;
    }

    private toggleRowColCheckAllColumn() {
        setTimeout(() => {
            if (!this.columnApi) {
                return;
            }

            if (this.hasRowColCheckAll) {
                this.columnApi.setColumnsVisible([BUTTON_COLUMNS.rowColCheckAll], this.isEditting);
                this.sizeColumnsToFit();
            }
        }, 200);
    }

    /**
     * Get all grid columns*/
    public getAllColumns() {
        if (!this.columnApi) {
            return [];
        }

        return this.columnApi.getAllColumns();
    }

    /**
     * Get all grid columns*/
    public getAllCurentData() {
        let rowData = [];
        this.api.forEachNode((node) => rowData.push(node.data));
        return rowData;
    }

    /**
     * Show/hide grid columns
     * @param cols
     * @param isVisible
     */
    public toggleColumns(cols: string[], isVisible: boolean) {
        setTimeout(() => {
            if (!this.columnApi) {
                return;
            }

            this.columnApi.setColumnsVisible(cols, isVisible);
            this.sizeColumnsToFit();
        }, 200);
    }

    /**
     * Show/hide row group header
     * Due to Ag-Grid issue, we need to call addRowGroupColumn & then removeRowGroupColumn to trigger
     * event redraw group header
     **/
    private toggleRowGroupHeader() {
        if (this.columnApi) {
            const cols = this.columnApi.getAllDisplayedColumns();
            if (cols && cols.length) {
                const field = cols[0].getColDef().field;
                this.columnApi.addRowGroupColumn(field);
                this.columnApi.removeRowGroupColumn(field);
            }
        }
    }

    public updatePriority(fromItem: any, changedPriorityOption: any) {
        let data = this.getCurrentNodeItems().filter((p) => p[CONTROL_COLUMNS.Priority]);
        let destItem = data.find((p) => p[CONTROL_COLUMNS.Priority] == changedPriorityOption.key);
        if (fromItem && destItem) {
            const idField = Object.keys(fromItem).find((k) => k == 'id') ? 'id' : 'DT_RowId';
            const fromIndex = data.findIndex((p) => p[idField] == fromItem[idField]);
            const destIndex = data.findIndex((p) => p[idField] == destItem[idField]);
            if (fromIndex < destIndex) {
                let arr = data.map((p) => p[CONTROL_COLUMNS.Priority]);
                arr.splice(fromIndex, 0, changedPriorityOption.key);
                arr.splice(destIndex + 1, 1);
                data.forEach((db, index, dataArr) => {
                    db[CONTROL_COLUMNS.Priority] = arr[index];
                    this.updateRowData([db]);
                });
            }
            if (fromIndex > destIndex) {
                var arr = data.map((p) => p[CONTROL_COLUMNS.Priority]);
                arr.splice(fromIndex + 1, 0, changedPriorityOption.key);
                arr.splice(destIndex, 1);
                data.forEach((db, index, dataArr) => {
                    db[CONTROL_COLUMNS.Priority] = arr[index];
                    this.updateRowData([db]);
                });
            }

            this.onPriorityEditEnded.emit();
        }
    }

    /**
     * Init priority list
     */
    private initPriorityList() {
        this.priorities = [];
        const priorityList = this.gridOptions.rowData.map((o) => o[CONTROL_COLUMNS.Priority]);
        if (priorityList && priorityList.length) {
            const maxValue = Math.max.apply(Math, priorityList);
            for (let i = 0; i < maxValue; i++) {
                this.priorities.push({
                    label: i + 1,
                    value: i + 1,
                });
            }
        }
    }

    private updateCellPriority(item) {
        if (item.hasOwnProperty(CONTROL_COLUMNS.Priority)) {
            const priority = item[CONTROL_COLUMNS.Priority];
            if (!priority) {
                let data = this.getCurrentNodeItems();
                const maxLength = data.length;
                const arr = data.map((p) => toSafeInteger(p[CONTROL_COLUMNS.Priority]));
                const maxValue = max(arr);
                if (maxValue < maxLength) {
                    item[CONTROL_COLUMNS.Priority] = maxValue + 1;
                    this.updateRowData([item]);
                } else {
                    let validPriority = maxValue;
                    let rs;
                    do {
                        validPriority -= 1;
                        rs = data.find((p) => p[CONTROL_COLUMNS.Priority] == validPriority);
                    } while (rs);
                    item[CONTROL_COLUMNS.Priority] = validPriority;
                    this.updateRowData([item]);
                }
                this.initPriorityList();

                setTimeout(() => {
                    this.cellValueChanged.emit(this.selectedNode.data);
                });
            }
        }
    }

    private deletePriorityForCurrentItem(item) {
        const priorityDeleted = item[CONTROL_COLUMNS.Priority];
        if (priorityDeleted) {
            const data = this.getCurrentNodeItems();
            data.forEach((item) => {
                if (item[CONTROL_COLUMNS.Priority] > priorityDeleted && item[CONTROL_COLUMNS.Priority] > 1) {
                    item[CONTROL_COLUMNS.Priority] -= 1;
                    this.updateRowData([item]);
                }
            });
        }
        item[CONTROL_COLUMNS.Priority] = '';
        this.updateRowData([item]);
        this.onPriorityEditEnded.emit();
        this.initPriorityList();
    }

    private navigateToNextCellFunc(params: NavigateToNextCellParams) {
        var previousCell = params.previousCellPosition;
        var suggestedNextCell = params.nextCellPosition;

        var KEY_UP = '38';
        var KEY_DOWN = '40';
        var KEY_LEFT = '37';
        var KEY_RIGHT = '39';

        switch (params.key) {
            case KEY_DOWN:
                previousCell = params.previousCellPosition;
                // set selected cell on current cell + 1
                this.api.forEachNode((node) => {
                    if (previousCell.rowIndex + 1 === node.rowIndex) {
                        node.setSelected(true);
                    }
                });
                return suggestedNextCell;
            case KEY_UP:
                previousCell = params.previousCellPosition;
                // set selected cell on current cell - 1
                this.api.forEachNode((node) => {
                    if (previousCell.rowIndex - 1 === node.rowIndex) {
                        node.setSelected(true);
                    }
                });
                return suggestedNextCell;
            case KEY_LEFT:
            case KEY_RIGHT:
                return suggestedNextCell;
            default:
                throw 'this will never happen, navigation is always one of the 4 keys above';
        }
    }

    public onRowDragEnd(e) {
        this.api.redrawRows();
    }

    public getFocusedCell() {
        if (this.api) return this.api.getFocusedCell();

        return null;
    }

    public startEditingCell(rowIndex, colKey) {
        if (this.api) {
            this.api.startEditingCell({
                rowIndex: rowIndex,
                colKey: colKey,
            });
        }
    }

    public setFocusedCell(rowIndex, colKey) {
        if (this.api) {
            this.api.setFocusedCell(rowIndex, colKey);
        }
    }

    public onRowGroupOpened($event) {
        // Check if this node expand, we need to colapse the other nodes
        if ($event && $event.node.expanded) {
            if (this.autoCollapse) {
                let currentId = $event.node.id;
                this.api.forEachNode((node) => {
                    if (node.id != currentId) {
                        // node.expanded = false;
                        node.setExpanded(false);
                    }
                });
            }
            setTimeout(() => {
                // this.api.onGroupExpandedOrCollapsed();
                if ($event.node.expanded && $event.node.master) {
                    this.api.ensureIndexVisible($event.node.rowIndex, 'top');
                }
            }, 250);
        }
    }

    public startEditingCellForFirstOrLastRow(colKey, isFirstRow: boolean) {
        if (this.api) {
            let rowIndex: number = isFirstRow ? this.api.getFirstRenderedRow() : this.api.getLastRenderedRow();

            this.selectRowIndex(rowIndex, false);

            this.api.startEditingCell({
                rowIndex: rowIndex,
                colKey: colKey,
            });
        }
    }

    public setFocusedCellForFirstOrLastRow(colKey, isFirstRow: boolean) {
        if (this.api) {
            let rowIndex: number = isFirstRow ? this.api.getFirstRenderedRow() : this.api.getLastRenderedRow();

            this.setFocusedCell(rowIndex, colKey);
        }
    }

    public onResendEmailActivationClick($event) {
        this.resendEmailActivationClick.emit();
    }

    public onDeleteUserClick($event) {
        this.deleteUser.emit($event);
    }

    public onEditUserClick($event) {
        this.editUser.emit($event);
    }

    public onResetPassClick($event) {
        this.resetPass.emit($event);
    }

    //#region Save Column Layout
    private saveColumnsLayout() {
        this.isColumnsLayoutChanged = false;
        if (!this.autoSaveColumnsLayout) {
            this.saveColumnsLayoutAction.emit();
            return;
        }
        this.reloadAndSaveItSelfColumnsLayout();
    }

    private reloadAndSaveItSelfColumnsLayout() {
        this._globalSettingService.getAllGlobalSettings('-1').subscribe((data: any) => {
            this._appErrorHandler.executeAction(() => {
                this.saveItSelfColumnsLayout(data);
            });
        });
    }

    private saveItSelfColumnsLayout(data: Array<GlobalSettingModel>) {
        if (!this.currentColumnLayoutData || !this.currentColumnLayoutData.idSettingsGlobal) {
            this.currentColumnLayoutData = new GlobalSettingModel({
                description: 'Grid Columns Layout',
                globalName: this.id,
                globalType: 'GridColLayout',
                idSettingsGUI: '-1',
                objectNr: '-1',
                isActive: true,
                jsonSettings: JSON.stringify(this.prepairColumnsLayout()),
            });
        } else {
            this.currentColumnLayoutData.jsonSettings = JSON.stringify(this.prepairColumnsLayout());
        }
        if (!this.currentColumnLayoutData.objectNr) this.currentColumnLayoutData.objectNr = '-1';
        this._globalSettingService.saveGlobalSetting(this.currentColumnLayoutData).subscribe(
            (data) => this.saveColumnsLayoutSuccess(data),
            (error) => this.serviceError(error),
        );
    }

    private prepairColumnsLayout() {
        return {
            settings: this.getColumnLayout(),
            // tamtv will update later
            // sortState: this.api ? this.api.getSortModel() : null,
            sortState: null,
        };
    }

    private saveColumnsLayoutSuccess(data: any) {
        if (Uti.isResquestSuccess(data)) return;
        this._toasterService.pop('success', 'Success', 'Columns layout is saved successful');
        this.currentColumnLayoutData.idSettingsGlobal = data.returnValue;
        this._globalSettingService.saveUpdateCache('-1', this.currentColumnLayoutData, data);
    }

    private loadDataForColumnsLayout() {
        if (!this.autoSaveColumnsLayout) {
            this.loadColumnLayout();
            return;
        }
        if (!this.id) return;
        this.loadColumnsLayoutByItSelf();
    }

    private loadColumnsLayoutByItSelf() {
        this._globalSettingService.getAllGlobalSettings(-1).subscribe(
            (data) => this.getAllGlobalSettingSuccess(data),
            (error) => this.serviceError(error),
        );
    }

    private getAllGlobalSettingSuccess(data: Array<GlobalSettingModel>) {
        if (!data || !data.length) return;
        this.currentColumnLayoutData = data.find((x) => x.globalName == this.id);
        if (!this.currentColumnLayoutData || !this.currentColumnLayoutData.jsonSettings) return;
        this.columnsLayoutSettings = Uti.tryParseJson(this.currentColumnLayoutData.jsonSettings);
        this.loadColumnLayout();
    }

    private serviceError(error) {
        console.log(error);
    }
    //#endregion
}
