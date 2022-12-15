import {
    Component,
    OnInit,
    OnChanges,
    Input,
    Output,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    EventEmitter,
    SimpleChanges,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Module, TabModel } from '@app/models';
import {
    SearchService,
    DatatableService,
    PropertyPanelService,
    AppErrorHandler,
    PreissChildService,
} from '@app/services';
import { IPageChangedEvent } from '@app/shared/components/xn-pager';
import camelCase from 'lodash-es/camelCase';
import cloneDeep from 'lodash-es/cloneDeep';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import {
    ProcessDataActions,
    CustomAction,
    GlobalSearchActions,
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { Configuration, LocalStorageKey, MenuModuleId } from '@app/app.constants';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';
import { filter, finalize } from 'rxjs/operators';
import { Uti } from '@app/utilities';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';

@Component({
    selector: 'gs-result',
    templateUrl: './gs-result.component.html',
    styleUrls: ['./gs-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '(mouserelease)': 'rightClicked($event)' },
})
export class GlobalSearchResultComponent implements OnInit, OnChanges, OnDestroy {
    @Input() parentInstance: any = null;
    @Input() keyword: string;
    @Input() filter: GlobalSearchFilterModel;
    @Input() isWithStar: boolean = false;
    @Input() searchWithStarPattern: string = null;
    @Input() searchIndex: string; // Used for elasticsearch
    @Input() allowDrag: any = {
        value: false,
    };
    @Input() gridContextMenuData: any;
    @Input() activeModule: Module = null;
    highlightKeywords: string;
    @Input() set module(module: Module) {
        this.moduleLocal = module;
        if (this.moduleLocal && this.moduleLocal.iconName) {
            let icon = this.moduleLocal.iconName;
            this.customDragContent = {
                dragIcon:
                    `<span class="text-center" style="font-size: 35px"><i aria-hidden="true" class="fa ` +
                    icon +
                    `"></i></span>`,
                data: module,
            };
        }
    }
    @Input() isGlobalSearch = false;
    @Input() dontAllowSearchWhenInit: boolean = false;
    @Input() gridId: string;

    private _tab;
    @Input() set tab(data: TabModel) {
        this._tab = data;
        if (this._tab && this._tab.payload && this._tab.payload.pageIndex) {
            this.pageIndex = this.tab.payload.pageIndex;
            this.pageSize = this.tab.payload.pageSize;
            this.paginationFromPopup = Object.assign({}, this.tab.payload);
        }
        this.updateStateForTabData();
    }

    get tab() {
        return this._tab;
    }

    @Input() tabs: TabModel[];

    @Output() onRowClicked: EventEmitter<any> = new EventEmitter();
    @Output() onRowDoubleClicked: EventEmitter<any> = new EventEmitter();
    @Output() searchItemRightClick: EventEmitter<any> = new EventEmitter();
    @Output() onSearchCompleted: EventEmitter<any> = new EventEmitter();
    @Output() pagingChanged: EventEmitter<any> = new EventEmitter();
    @Output() addToHistoryAction: EventEmitter<any> = new EventEmitter();

    public globalNumberFormat = '';
    public that: any;
    public totalResults: number = 0;
    public numberOfEntries: number = 0;
    private resuleSelectTimer;
    private resuleSelectInterval = 200;
    dataResult: any;
    public customDragContent: any;
    public pageIndex: number = Configuration.pageIndex;
    public pageSize: number = 0; //Configuration.pageSize;
    public moduleList = ModuleList;
    private COLUMN_SETTING_INDEX: number = 1;
    // private globalSearchHeightState: Observable<string>;
    // private globalSearchHeightStateSubcription: Subscription;
    private searchServiceSubscription: Subscription;
    private moduleLocal: Module;
    private globalPropertiesStateSubscription: Subscription;
    private globalPropertiesState: Observable<any>;
    private okToChangeSearchResultStateSubscription: Subscription;
    private fiterByFieldSubscription: Subscription;
    private forceSetResultDataSubscription: Subscription;
    private allowSelectFirstRow: boolean; // select first row of attachment tab

    private advancedSearchCondition: any;
    private advanceSearchSubscription: Subscription;

    private willChangeCell: any;
    public globalProperties: any;
    public paginationFromPopup: any;
    private lastKeyword: string;
    private rowClickTimer = null;

    @ViewChild(XnAgGridComponent) private agGridComponent: XnAgGridComponent;

    constructor(
        private searchService: SearchService,
        private ref: ChangeDetectorRef,
        private datatableService: DatatableService,
        private propertyPanelService: PropertyPanelService,
        private appErrorHandler: AppErrorHandler,
        private store: Store<AppState>,
        private processDataActions: ProcessDataActions,
        private globalSearchActions: GlobalSearchActions,
        private dispatcher: ReducerManagerDispatcher,
        private toasterService: ToasterService,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private popupService: PopupService,
        private preissChildService: PreissChildService,
    ) {
        this.that = this;
        this.subscribeFilterSearch();
    }

    ngOnInit() {
        // this.globalSearchHeightState = this.store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.moduleLocal.moduleNameTrim).globalSearchHeight);
        this.globalPropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );

        //let _currentGlobalSearchHeight: string = '';
        // this.globalSearchHeightStateSubcription = this.globalSearchHeightState.subscribe((height: string) => {
        //     this.appErrorHandler.executeAction(() => {
        //         if (height && height.length && height != _currentGlobalSearchHeight && this.agGridComponent) {
        //             _currentGlobalSearchHeight = height;
        //             this.agGridComponent.sizeColumnsToFit();
        //         }
        //     });
        // });
        this.subscribeGlobalProperties();
        this.subscribeOkToChangeSearchResultState();
        this.subscribeAdvanceSearchState();
    }

    public searchAdvance(formData) {
        const pageSize = this.pageSize;
        this.searchServiceSubscription = this.searchService
            .searchAdvance(this.searchIndex, this.moduleLocal.idSettingsGUI, this.pageIndex, pageSize, formData)
            .finally(() => {
                if (this.tab) {
                    this.tab.activeAdvanceSearchStatus = true;
                }
                this.changeDetectorRef();
            })
            .subscribe(
                (response: any) => {
                    this.appErrorHandler.executeAction(() => {
                        response = response.item;
                        this.dataResult = this.datatableService.buildDataSourceFromEsSearchResult(
                            response,
                            this.COLUMN_SETTING_INDEX,
                        );
                        this.buildDataResultForModules();
                        this.totalResults = response.total;
                        this.numberOfEntries = response && response.results ? response.results.length : 0;
                        this.onSearchCompleted.emit();
                        if (this.agGridComponent && pageSize) {
                            this.agGridComponent.isSearching = false;
                            this.changeDetectorRef();
                        }
                    });
                },
                (err) => {
                    //reset data on grid
                    this.dataResult = {
                        data: [],
                        columns: this.dataResult && this.dataResult.columns ? this.dataResult.columns : [],
                        totalResults: 0,
                        idSettingsGUI: this.moduleLocal.idSettingsGUI,
                    };
                    this.totalResults = 0;
                    this.numberOfEntries = 0;
                    this.onSearchCompleted.emit();
                    //show error
                    this.toasterService.pop('error', 'Error', 'Search failed please try again');
                    if (this.agGridComponent) {
                        this.agGridComponent.isSearching = false;
                        this.changeDetectorRef();
                    }
                },
            );
    }

    private buildDataResultForModules() {
        if (!this.dataResult) return;

        this.dataResult.idSettingsGUI = this.moduleLocal.idSettingsGUI;
    }

    private browserTabId: string = Uti.defineBrowserTabId();
    public subscribeAdvanceSearchState() {
        const localStorageGSFieldCondition = LocalStorageKey.buildKey(
            LocalStorageKey.LocalStorageGSFieldCondition,
            this.browserTabId,
        );
        this.advanceSearchSubscription = Observable.fromEvent<StorageEvent>(window, 'storage')
            .filter((evt) => {
                return evt.key == localStorageGSFieldCondition && evt.newValue !== null && evt.newValue != 'undefined';
            })
            .subscribe((evt) => {
                if (evt.newValue) {
                    this.advancedSearchCondition = JSON.parse(evt.newValue);
                    this.searchAdvanceData(this.advancedSearchCondition);
                }
            });
    }

    private changeDetectorRef() {
        setTimeout(() => {
            this.ref.markForCheck();
            this.ref.detectChanges();
        }, 300);
    }

    private searchAdvanceData(advancedSearchCondition) {
        if (advancedSearchCondition.browserTabId && advancedSearchCondition.browserTabId != this.browserTabId) return;
        if (advancedSearchCondition.moduleId == this.moduleLocal.idSettingsGUI) {
            if (advancedSearchCondition.formData && advancedSearchCondition.formData.length) {
                this.searchAdvance(advancedSearchCondition.formData);
                let value = '';
                (advancedSearchCondition.formData as Array<any>).forEach((p) => {
                    value += p.value + ' ';
                });
                this.highlightKeywords = value;
            }
        }
    }

    public makeContextMenu(data?: any) {
        if (!this.parentInstance || !this.parentInstance.makeContextMenu) {
            return [];
        }
        return this.parentInstance.makeContextMenu(data);
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.dontAllowSearchWhenInit) {
            this.dontAllowSearchWhenInit = false;
            this.searchData('');
            return;
        }

        if (!changes['keyword'] && !changes['filter']) return;

        const hasChanges = this.hasChanges(changes['keyword']) || this.hasChanges(changes['filter']);
        this.allowSelectFirstRow =
            changes['keyword']?.firstChange && this.tab.title === ModuleList.AttachmentGlobalSearch.moduleName;
        if (hasChanges && (this.lastKeyword != this.keyword || changes['filter']?.currentValue)) {
            this.search();
        }
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                    this.globalNumberFormat =
                        this.propertyPanelService.buildGlobalNumberFormatFromProperties(globalProperties);
                    this.refreshGrid();
                }
            });
        });
    }

    private subscribeOkToChangeSearchResultState() {
        this.okToChangeSearchResultStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    if (action.type === ProcessDataActions.OK_TO_CHANGE_SEARCH_RESULT) {
                        let module = this.moduleLocal;
                        //if (module.idSettingsGUIParent == ModuleList.Administration.idSettingsGUI) {
                        //    module = ModuleList.Administration;
                        //}

                        return action.module.idSettingsGUI == module.idSettingsGUI;
                    }

                    return false;
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.willChangeCell) {
                        this.willChangeCell = null;
                    }
                });
            });
    }

    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    public refreshGrid() {
        if (this.agGridComponent) {
            this.agGridComponent.sizeColumnsToFit();
        }
    }

    public search(filter: GlobalSearchFilterModel = new GlobalSearchFilterModel()): void {
        if (this.agGridComponent) {
            this.agGridComponent.isSearching = true;
        }
        this.searchData(this.keyword, filter);
        this.ref.detectChanges();
    }

    public searchData(keyword: string, filter: GlobalSearchFilterModel = new GlobalSearchFilterModel()): void {
        if (!this.pageSize || !this.searchIndex) return;

        if (this.filter) {
            filter.fieldsName = filter.fieldsName || [];
            filter.fieldsValue = filter.fieldsValue || [];
            filter.fieldsName.push(...(this.filter.fieldsName || []));
            filter.fieldsValue.push(...(this.filter.fieldsValue || []));

            filter.fieldsJson = this.filter.fieldsJson;
            // if (this.tab.title !== ModuleList.AttachmentGlobalSearch.moduleName) {
            //     keyword = '';
            // }
        }

        this.lastKeyword = keyword;
        const pageSize = this.pageSize;
        const searchPattern = this.searchWithStarPattern || 'Both_*X*';
        this.highlightKeywords = this.keyword;
        this.searchServiceSubscription = this.searchService
            .search(
                this.searchIndex,
                keyword,
                this.moduleLocal.idSettingsGUI,
                this.pageIndex,
                pageSize,
                null,
                filter.fieldsName,
                filter.fieldsValue,
                this.isWithStar,
                searchPattern,
                filter.fieldsJson,
            )
            .pipe(
                finalize(() => {
                    this.onSearchCompleted.emit();
                    if (this.agGridComponent) this.agGridComponent.isSearching = false;

                    this.ref.detectChanges();
                    this.ref.markForCheck();
                }),
            )
            .subscribe(
                (response: any) => {
                    this.appErrorHandler.executeAction(() => {
                        response = response.item;

                        this.setResultData(response, filter.fieldsName);
                        this.addToHistory(keyword, this.totalResults);
                    });
                },
                (err) => {
                    //reset data on grid
                    this.dataResult = {
                        data: [],
                        columns: this.dataResult && this.dataResult.columns ? this.dataResult.columns : [],
                        totalResults: 0,
                    };
                    this.totalResults = 0;
                    this.numberOfEntries = 0;
                    //show error
                    this.toasterService.pop('error', 'Error', 'Search failed please try again');
                },
            );
    }

    private setResultData(response: any, fieldsName: string[]) {
        if (this.tab.active) {
            this.agGridComponent.autoSelectFirstRow = this.allowSelectFirstRow || response?.total == 1;
            this.allowSelectFirstRow = false;
        }
        this.dataResult = this.datatableService.buildDataSourceFromEsSearchResult(response, this.COLUMN_SETTING_INDEX);
        this.totalResults = response.total;
        this.numberOfEntries = response && response.results ? response.results.length : 0;
        if ((fieldsName && fieldsName.length > 0) || (fieldsName && fieldsName.length > 0)) {
            this.store.dispatch(this.administrationDocumentActions.globalSearchCollaspe(false));
        }
    }

    onRowDoubleClick(data: any) {
        //console.log('onRowDoubleClick');
        if (!data) return;

        //prevent calling onRowClicked twice
        this.isMouseDoubleClick = true;

        let model: any = {};
        Object.keys(data).forEach((key) => {
            model[camelCase(key)] = data[key];
        });
        this.onRowClicked.emit(model);
        this.onRowDoubleClicked.emit(model);
        this.store.dispatch(this.globalSearchActions.updateTab(this.tabs));
    }

    onPageChanged(event: IPageChangedEvent) {
        // if pagnation not change will return
        if (this.pageIndex === event.page && this.pageSize === event.itemsPerPage) return;

        this.pageIndex = event.page;
        this.pageSize = event.itemsPerPage;
        if (!this.tab || (this.tab && !this.tab.activeAdvanceSearchStatus)) {
            this.search();
        } else {
            if (this.advancedSearchCondition) {
                this.searchAdvanceData(this.advancedSearchCondition);
            }
        }
        this.updateStateForTabData();
    }

    public onPageNumberChanged(pageNumber: number) {
        this.pageSize = pageNumber ? pageNumber : Configuration.pageSize;
        this.search();
        this.updateStateForTabData();
    }

    private gridItemRightClick($event: any) {
        this.searchItemRightClick.emit($event);
    }

    public onSelectionChangingHandler(e) {
        this.willChangeCell = cloneDeep(e);

        let module = this.moduleLocal;
        //if (module.idSettingsGUIParent == ModuleList.Administration.idSettingsGUI) {
        //    module = ModuleList.Administration;
        //}
        this.store.dispatch(this.processDataActions.requestChangeSearchResult(module));
    }

    // #region [Grid mouse up/down]
    private isMouseDown: boolean;
    private deferResultSelect: any;
    private isMouseDoubleClick: boolean;

    /**
     * gridMouseDown
     **/
    public gridMouseDown($event) {
        this.isMouseDown = true;
    }

    public gridKeyDown($event) {
        if (
            this.moduleLocal &&
            this.activeModule &&
            this.moduleLocal.idSettingsGUI !== this.activeModule.idSettingsGUI
        ) {
            return;
        }

        this.isMouseDown = false;
    }
    /**
     * gridMouseUp
     **/
    public gridMouseUp($event) {
        if (
            this.moduleLocal &&
            this.activeModule
            //this.moduleLocal.moduleNameTrim !== this.activeModule.moduleNameTrim
        ) {
            if (this.activeModule.idSettingsGUI && this.moduleLocal.idSettingsGUI === MenuModuleId.allDocuments) {
                if (!Uti.isRoutingToDocumentFromGlobalSearch(this.activeModule.idSettingsGUI)) return;
            } else if (
                this.activeModule.moduleNameTrim &&
                this.moduleLocal.moduleNameTrim !== this.activeModule.moduleNameTrim
            )
                return;
        }
        if (
            JSON.parse(localStorage.getItem(LocalStorageKey.LocalStorageActiveModule))?.moduleNameTrim !==
                this.moduleLocal.moduleNameTrim &&
            !document.querySelector('#main > div > app-root > main > div > gs-main')
        )
            return;
        this.isMouseDown = false;
        switch ($event.which) {
            // Left mouse click
            case 1:
            case 2:
                if (this.deferResultSelect) {
                    this.onResultSelect(this.deferResultSelect);
                    this.deferResultSelect = null;
                }
                break;
            // Right mouse click
            case 3:
                this.deferResultSelect = null;
                break;
        }
    }

    deleteCar(data) {
        const popoverRef = this.popupService.open({
            content: `Are you sure you want delete this car?`,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Confirmation',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'No', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'Yes',
                        buttonType: 'flat',
                        onClick: (() => {
                            this.preissChildService.deletePriceTag({ IdPriceTag: data.idPriceTag }).subscribe((res) => {
                                popoverRef.close();
                                setTimeout(() => {
                                    this.search();
                                }, 500);
                            });
                        }).bind(this),
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }

    onResultSelect(data: Array<any>) {
        //console.log('onResultSelect');
        clearTimeout(this.rowClickTimer);
        this.rowClickTimer = setTimeout(() => {
            //use 'isMouseDoubleClick' to prevent calling onRowClicked twice
            if (!this.isMouseDown && !this.isMouseDoubleClick) {
                let model: any = {};
                data.forEach((item) => {
                    model[camelCase(item.key)] = item.value;
                });
                this.onRowClicked.emit(model);
            } else {
                this.deferResultSelect = data;
            }

            this.isMouseDoubleClick = false;
        }, 500);
    }
    // #endregion [Grid mouse up/down]

    /**
     * updateStateForTabData
     **/
    private updateStateForTabData() {
        if (!Configuration.PublicSettings.enableGSNewWindow) return;

        if (this.tab) {
            if (!this.tab.payload) {
                this.tab.payload = {};
            }
            this.tab.payload.pageSize = this.pageSize;
            this.tab.payload.pageIndex = this.pageIndex;
            this.store.dispatch(this.globalSearchActions.updateTab(this.tabs));
        }
    }

    private subscribeFilterSearch() {
        this.fiterByFieldSubscription = this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.GLOBAL_SEARCH_FILTER_BY_FOLDER)
            .subscribe((action: any) => {
                if (!action && !action.payload) return;

                const data = action.payload as GlobalSearchFilterModel;
                this.search(data);
            });

        this.fiterByFieldSubscription = this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.GLOBAL_SEARCH_CONTACT)
            .subscribe((action: any) => {
                this.search();
            });

        //this.forceSetResultDataSubscription = this.administrationDocumentSelectors
        //    .actionOfType$(AdministrationDocumentActionNames.GLOBAL_SEARCH_FORCE_SET_RESULT)
        //    .subscribe((action: any) => {
        //        if (!action && !action.payload) return;

        //        const filter = action.payload as Module;
        //        if (filter.searchIndexKey !== this.searchIndex) return;
        //        this.searchServiceSubscription = this.searchService
        //            .search(
        //                filter.searchIndexKey,
        //                null,
        //                filter.idSettingsGUI,
        //                this.pageIndex,
        //                this.pageSize,
        //                null,
        //                filter.fieldNameForceSetDataResult,
        //                filter.fieldValueForceSetDataResult,
        //                this.isWithStar,
        //                this.searchWithStarPattern,
        //            )
        //            .pipe(
        //                finalize(() => {
        //                    this.onSearchCompleted.emit();
        //                    if (this.agGridComponent) this.agGridComponent.isSearching = false;

        //                    this.ref.detectChanges();
        //                    this.ref.markForCheck();
        //                }),
        //            )
        //            .subscribe(
        //                (response: any) => {
        //                    this.appErrorHandler.executeAction(() => {
        //                        response = response.item;

        //                        this.setResultData(response, []);
        //                    });
        //                },
        //                (err) => {
        //                    //reset data on grid
        //                    this.dataResult = {
        //                        data: [],
        //                        columns: this.dataResult && this.dataResult.columns ? this.dataResult.columns : [],
        //                        totalResults: 0,
        //                    };
        //                    this.totalResults = 0;
        //                    this.numberOfEntries = 0;
        //                    //show error
        //                    this.toasterService.pop('error', 'Error', 'Search failed please try again');
        //                },
        //            );
        //    });
    }

    private addToHistory(keyword: string, numberOfResult: number) {
        this.addToHistoryAction.emit({
            keyword: keyword,
            numberOfResult: numberOfResult,
        });
    }
}
