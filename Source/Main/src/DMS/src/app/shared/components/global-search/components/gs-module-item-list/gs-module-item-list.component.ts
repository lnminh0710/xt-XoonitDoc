import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { GlobalSearchModuleModel } from '@app/models/global-seach-module.model';
import { Configuration, GlobalSearchConstant, MenuModuleId } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import { TabModel } from '@app/models/tab.model';
import { Module } from '@app/models/module';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { TabSummaryActions, ModuleActions, GlobalSearchActions } from '@app/state-management/store/actions';
import { GlobalSearchService, ModuleService, AppErrorHandler } from '@app/services';
import { Router } from '@angular/router';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';
import { ModuleList } from '@app/pages/private/base';
import { guid } from '@app/pages/private/modules/image-control/components/image-ocr/image-ocr.util';
import { find, cloneDeep } from 'lodash-es';

@Component({
    selector: 'gs-module-item-list',
    templateUrl: './gs-module-item-list.component.html',
})
export class GlobalSeachModuleItemListComponent implements OnInit, OnDestroy {
    items: Array<string> = [];
    tabList: TabModel[];
    model: any = {};
    globalSearchConfig: any = {};
    globalSearchModuleModels: Array<GlobalSearchModuleModel> = [];
    private searchingModuleState: Observable<Module>;
    private searchingModuleStateSubcription: Subscription;
    private navigationEvents: Subscription;

    @Input() set tabs(tabs: TabModel[]) {
        this.tabList = tabs;
    }
    @Input() isWithStar: boolean = false;
    @Input() searchWithStarPattern: string = null;

    @Input() set globalItems(globalItems: Array<GlobalSearchModuleModel>) {
        this.globalSearchModuleModels = globalItems;
    }
    @Input() set towWayConfig(towWayConfig: Array<GlobalSearchModuleModel>) {
        this.globalSearchConfig = towWayConfig;
    }
    @Input() set globalSearchItemClicked(towWayConfig: Array<GlobalSearchModuleModel>) {
        this.globalSearchConfig = towWayConfig;
    }

    @Input() isSearchAllTab: boolean;
    @Input() mainModules: Module[] = [];
    @Input() subModules: Module[] = [];
    @Input() activeModule: Module = null;
    @Input() activeSubModule: Module = null;

    @Output() onGlobalSearchItemClicked: EventEmitter<any> = new EventEmitter();
    @Output() onGlobalSearchItemDoubleClicked: EventEmitter<any> = new EventEmitter();

    constructor(
        private globalSearchConsts: GlobalSearchConstant,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private tabSummaryActions: TabSummaryActions,
        private globalSearchService: GlobalSearchService,
        private moduleService: ModuleService,
        private globalSearchActions: GlobalSearchActions,
        private dispatcher: ReducerManagerDispatcher,
        private appErrorHandler: AppErrorHandler,
        private router: Router,
    ) {
        this.searchingModuleState = store.select((state) => state.mainModule.searchingModule);
    }

    public ngOnInit() {
        this.subscribeData();
        // this.subscribeChangeItemLocalStorageState();
    }

    public subscribeData() {
        this.searchingModuleStateSubcription = this.searchingModuleState.subscribe((searchModule: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (searchModule && (searchModule.searchKeyword || searchModule.filter)) {
                    setTimeout(() => {
                        if (this.globalSearchModuleModels?.length && this.isSearchAllTab) {
                            let rs = this.globalSearchModuleModels.filter(
                                (p) => p.idSettingsGUI === searchModule.idSettingsGUI,
                            );
                            if (!rs.length) {
                                rs = this._findModuleInChildren(
                                    this.globalSearchModuleModels,
                                    searchModule.idSettingsGUI,
                                );
                            }
                            if (rs.length) {
                                const globalItem = cloneDeep(rs[0]);
                                if (searchModule['forceMainDocument'] && searchModule['moduleName']) {
                                    globalItem.moduleName = searchModule.moduleName;
                                    globalItem['titleSecondary'] = searchModule['titleSecondary'];
                                    globalItem['forceMainDocument'] = true;
                                } else if (searchModule['forceMainDocument'] && !searchModule['moduleName']) {
                                    globalItem.moduleName = searchModule['titleSecondary'];
                                    globalItem.moduleNameTrim = searchModule['titleSecondary'];
                                    globalItem['titleSecondary'] = '';
                                    globalItem['forceMainDocument'] = true;
                                }
                                this._globalItemDoubleClicked(
                                    globalItem,
                                    searchModule.searchKeyword,
                                    searchModule.filter,
                                );
                            } else {
                                const newGlobalItem: any = Object.assign({}, searchModule);
                                newGlobalItem.id = guid();
                                this._globalItemDoubleClicked(
                                    newGlobalItem,
                                    searchModule.searchKeyword,
                                    searchModule.filter,
                                );
                            }
                        }
                    });
                }
            });
        });

        this.navigationEvents = this.router.events.subscribe((e) => {
            // if (e instanceof NavigationEnd) { // you can do it for exact phase
            //     setTimeout(() => {
            //         const rs = this.globalSearchModuleModels.filter(p => p.isClicked);
            //         if (rs.length) {
            //             const globalItem = rs[0];
            //             console.log('gs-module-item-list.component: SET GSSTEP LocalStorage Change ModuleTab', globalItem);
            //             this.store.dispatch(this.globalSearchActions.changeModuleTab(globalItem));
            //         }
            //     });
            // }
        });
    }

    /**
     * subscribeChangeItemLocalStorageState
     */
    //private subscribeChangeItemLocalStorageState() {
    //    if (!Configuration.PublicSettings.enableGSNewWindow) return;

    //    this.dispatcher.filter((action: CustomAction) => {
    //        return action.type === GlobalSearchActions.CHANGE_MODULE_TAB_STORAGE;
    //    }).subscribe((data: CustomAction) => {
    //        this.appErrorHandler.executeAction(() => {
    //            this.globalItemDoubleClicked(data.payload, true);
    //        });
    //    });
    //}

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public globalItemClicked(globalItem: GlobalSearchModuleModel) {
        for (const item of this.globalSearchModuleModels) {
            item.isClicked = false;
            if (globalItem.moduleName === item.moduleName) {
                item.isClicked = true;
            }
        }

        this.globalSearchConfig.isAdministrationClicked =
            globalItem.moduleName === this.globalSearchConsts.searchAdministration;
        this.globalSearchConfig.isAllDocumentModuleClicked = globalItem.idSettingsGUI === MenuModuleId.allDocuments;

        // Used for Selection Modules
        switch (globalItem.idSettingsGUI) {
            case MenuModuleId.selectionBroker:
            case MenuModuleId.selectionCampaign:
            case MenuModuleId.selectionCollect:
                this.globalSearchConfig.isAdministrationClicked = true;
                break;
        }
        this.onGlobalSearchItemClicked.emit(globalItem);
    }

    public globalItemDoubleClicked(globalItem: GlobalSearchModuleModel, fromLocalStorage?) {
        let filter = null;
        if (globalItem.idSettingsGUIParent === MenuModuleId.allDocuments) {
            globalItem.idSettingsGUI = MenuModuleId.allDocuments;
            filter = {
                fieldsName: ['idTreeRoot'],
                fieldsValue: [globalItem.idDocumentTree.toString()],
            };
        }
        this._globalItemDoubleClicked(globalItem, null, filter);
        if (Configuration.PublicSettings.enableGSNewWindow && !fromLocalStorage) {
            this.store.dispatch(this.globalSearchActions.changeModuleTab(globalItem));
            this.store.dispatch(this.globalSearchActions.updateTab(this.tabList));
        }
    }

    private _globalItemDoubleClicked(
        globalItem: GlobalSearchModuleModel,
        searchKeyword: string,
        filter?: GlobalSearchFilterModel,
    ) {
        this.globalSearchService.setAllTabActive(false, this.tabList);
        let title = globalItem.moduleName;
        switch (globalItem.idSettingsGUI) {
            case MenuModuleId.selectionBroker:
            case MenuModuleId.selectionCampaign:
            case MenuModuleId.selectionCollect:
                title = this.getChildrenTabName(globalItem);
                break;
        }

        if (searchKeyword) {
            this.tabList[0].textSearch = searchKeyword;
        }
        if (!this.globalSearchService.checkTabExists(title, this.tabList)) {
            const searchIndex = this.makeSearchIndexKey(globalItem);
            if (searchIndex) {
                let newTab: TabModel;
                if (searchIndex == ModuleList.EmailDetailGlobalSearch.searchIndexKey) {
                    newTab = new TabModel({
                        id: globalItem.gridId,
                        title: title,
                        active: true,
                        removable: true,
                        textSearch: '',
                        filter: filter,
                        module: new Module(Object.assign({}, globalItem)),
                        searchIndex: 'email',
                        isWithStar: this.isWithStar,
                        searchWithStarPattern: this.searchWithStarPattern,
                        histories: [],
                        tabClass: 'attachment-tab',
                        titleSecondary: globalItem['titleSecondary'],
                        moduleID: ModuleList.Email.idSettingsGUI.toString(),
                    });
                } else {
                    newTab = new TabModel({
                        id: globalItem.gridId,
                        title: title,
                        active: true,
                        removable: true,
                        textSearch: this.tabList[0].textSearch,
                        filter: filter,
                        module: new Module(Object.assign({}, globalItem)),
                        searchIndex: searchIndex,
                        isWithStar: this.isWithStar,
                        searchWithStarPattern: this.searchWithStarPattern,
                        histories: [],
                        tabClass: globalItem['tabClass'],
                        titleSecondary: globalItem['titleSecondary'],
                    });
                }
                if (globalItem['forceMainDocument']) {
                    const tabClass = newTab.tabClass || '';
                    newTab.tabClass = `${tabClass} gs-doc-tree`;
                }

                if (title === ModuleList.AllDocumentGlobalSearch.moduleName) {
                    this.tabList.splice(1, 0, newTab);
                } else {
                    this.tabList.push(newTab);
                }
            } else {
                title = this.tabList[0].title;
                this.globalSearchService.setTabActive(
                    title,
                    true,
                    this.tabList,
                    this.tabList[0].textSearch,
                    filter,
                    globalItem['titleSecondary'],
                    globalItem['forceMainDocument'],
                );
            }
        } else {
            this.globalSearchService.setTabActive(
                title,
                true,
                this.tabList,
                this.tabList[0].textSearch,
                filter,
                globalItem['titleSecondary'],
                globalItem['forceMainDocument'],
            );
        }

        // this.updateModuleToStore(globalItem);
        this.onGlobalSearchItemDoubleClicked.emit(globalItem);
    }

    private makeSearchIndexKey(globalItem: any) {
        if (!globalItem.children || !globalItem.children.length) {
            return globalItem.searchIndexKey;
        }
        return globalItem.children.map((p) => p.searchIndexKey).join(',');
    }

    private getChildrenTabName(currentGlobalItem: any): string {
        if (this.mainModules) {
            const currentMainModule = this.mainModules.find(
                (x) => x.idSettingsGUI === currentGlobalItem.idSettingsGUIParent,
            );
            if (currentMainModule) {
                return currentMainModule.moduleName + ' - ' + currentGlobalItem.moduleName;
            }
        }
        return '';
    }

    private updateModuleToStore(globalItem) {
        const selectedModule = new Module(globalItem);
        this.moduleService.loadContentDetailBySelectedModule(
            selectedModule,
            this.activeModule,
            this.activeSubModule,
            this.mainModules,
        );
    }

    public itemsTrackBy(index, item) {
        return item ? item.idSettingsGUI : undefined;
    }

    private _findModuleInChildren(
        globalSearchModuleModels: GlobalSearchModuleModel[],
        idSettingsGUI: any,
    ): GlobalSearchModuleModel[] {
        for (const key in globalSearchModuleModels) {
            if (Object.prototype.hasOwnProperty.call(globalSearchModuleModels, key)) {
                const module = globalSearchModuleModels[key];
                const item = find(module.children, ['idSettingsGUI', idSettingsGUI]);
                if (item) {
                    return [item];
                }
            }
        }
        return [];
    }
}
