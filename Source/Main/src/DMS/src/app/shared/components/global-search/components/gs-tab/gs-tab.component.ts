import {
    Component,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    ViewChild,
    Input,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import {
    GlobalSearchConstant,
    MenuModuleId,
    Configuration,
    LocalStorageKey,
    GlobalSettingConstant,
} from '@app/app.constants';
import replace from 'lodash-es/replace';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import findIndex from 'lodash-es/findIndex';
import remove from 'lodash-es/remove';

import {
    GlobalSearchModuleModel,
    TabModel,
    Module,
    SearchResultItemModel,
    ParkedItemModel,
    ApiResultResponse,
    GlobalSettingModel,
} from '@app/models';
import {
    GlobalSearchService,
    AppErrorHandler,
    ModuleService,
    AccessRightsService,
    DomHandler,
    PropertyPanelService,
    GlobalSettingService,
    ModalService,
    DocumentService,
} from '@app/services';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    SearchResultActions,
    TabSummaryActions,
    ModuleActions,
    CustomAction,
    ProcessDataActions,
    GlobalSearchActions,
    TabButtonActions,
    OrderProcessingActions,
} from '@app/state-management/store/actions';

import { GlobalSearchResultComponent } from '../gs-result';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as commonReducer from '@app/state-management/store/reducer/xn-common';
import * as uti from '@app/utilities';
import { Uti, String } from '@app/utilities';
import {
    DocUpdateMode,
    DocType,
    OrderProcessingUpdateModel,
} from '@app/pages/private/modules/customer/models/document';
import { map, finalize, filter, takeUntil } from 'rxjs/operators';
import { guid } from '@app/pages/private/modules/image-control/components/image-ocr/image-ocr.util';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { cloneDeep, find, map as _map } from 'lodash-es';
import { Router } from '@angular/router';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { AppGlobalSelectors } from '@app/state-management/store/reducer';
import { SaveStructureTreeSettingsGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';

@Component({
    selector: 'gs-tab',
    styleUrls: ['./gs-tab.component.scss'],
    templateUrl: './gs-tab.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchTabComponent extends BaseComponent implements OnInit, OnDestroy {
    public tabList: TabModel[];
    public tabType: string;
    public gridId: string;
    public currentTab: TabModel;
    public perfectScrollbarConfig: any = {};
    public allowDrag: any = {
        value: false,
    };

    private selectedSearchResult: SearchResultItemModel = null;
    private willSelectSearchResult: SearchResultItemModel = null;
    private isCollapsed = true;
    private modulePrimaryKey = '';
    private parkedItems: any;
    private contextMenuData: any = [];
    private moduleToPersonType: any;

    private xnContextMenuState: Observable<any>;
    private isCollapsedState: Observable<boolean>;
    private modulePrimaryKeyState: Observable<string>;
    private parkedItemsState: Observable<ParkedItemModel[]>;
    private moduleToPersonTypeState: Observable<any>;

    private xnContextMenuStateSubscription: Subscription;
    private isCollapsedStateSubscription: Subscription;
    private parkedItemsStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private globalServSubscription: Subscription;
    private loadParkedItemsCompletedSubscription: Subscription;
    private moduleToPersonTypeStateSubcription: Subscription;

    private mainItemClassParent = 'gs_module-item__parent';
    private mainItemClassChild = 'gs_module-item__child';
    private searchItemClassName = 'form-control__circle';
    private searchItemClassNameSmall: string = this.searchItemClassName + '--sm';
    private searchItemBgClassName = 'gs__all-icon__bg';
    private searchItemBgClassNameSearched: string = this.searchItemBgClassName + '--searched';
    private searchTextClassName = 'gs__result';
    private searchTextClassNameSmall: string = this.searchTextClassName + '--sm';

    public globalSearchConfig: any = {
        isAdministrationClicked: false,
        isAllDocumentModuleClicked: false,
        isSearched: false,
    };
    public globalSearchModuleModels: Array<GlobalSearchModuleModel> = [];
    public globalSearchModuleModelsAdminChildren: Array<GlobalSearchModuleModel> = [];
    public globalSearchModuleModelsAllDocumentChildren: Array<GlobalSearchModuleModel> = [];
    public globalSearchModuleModelsAllDocumentChildrenStore: Array<GlobalSearchModuleModel> = [];
    public that: any;

    @Input() set type(type: string) {
        this.tabType = type;
    }
    @Input() set tabs(tabs: TabModel[]) {
        this.tabList = tabs;
    }
    @Input() set tabz(tabz: TabModel) {
        this.currentTab = tabz;

        if (tabz) {
            //accessRight For ParkedItem
            this.accessRight = this.accessRightsService.GetAccessRightsForParkedItem(tabz.module);
        }

        setTimeout(() => {
            this.allowDrag.value = this.setAllowDrag(this.currentTab);
        });
    }
    @Input() isWithStar: boolean = false;
    @Input() searchWithStarPattern: string = null;

    @Input() mainModules: Module[] = [];
    @Input() subModules: Module[] = [];
    @Input() showFullPage: boolean;

    private _activeModule: Module;
    @Input() set activeModule(data: Module) {
        this._activeModule = data;
    }

    get activeModule() {
        return this._activeModule;
    }

    private _activeSubModule: Module;
    @Input() set activeSubModule(data: Module) {
        this._activeSubModule = data;
    }

    get activeSubModule() {
        return this._activeSubModule;
    }

    @Input() set active(isActive: boolean) {
        if (!isActive) return;

        this.onClickSearch();
    }

    @Input() ofModule: Module = null;

    @Output() onMarkForCheck: EventEmitter<any> = new EventEmitter();
    @Output() onSearchResultCompleted: EventEmitter<any> = new EventEmitter();

    @ViewChild(GlobalSearchResultComponent)
    public globalSearchResult: GlobalSearchResultComponent;

    public accessRight: any = {};

    constructor(
        public globalSearchConsts: GlobalSearchConstant,
        private globalServ: GlobalSearchService,
        public ref: ChangeDetectorRef,
        private store: Store<AppState>,
        private searchResultActions: SearchResultActions,
        private moduleActions: ModuleActions,
        private tabSummaryActions: TabSummaryActions,
        private moduleService: ModuleService,
        private processDataActions: ProcessDataActions,
        private appErrorHandler: AppErrorHandler,
        private dispatcher: ReducerManagerDispatcher,
        private accessRightsService: AccessRightsService,
        private globalSearchActions: GlobalSearchActions,
        private tabButtonActions: TabButtonActions,
        private orderProcessingActions: OrderProcessingActions,
        private domHandler: DomHandler,
        private propertyPanelService: PropertyPanelService,
        private _globalSettingConstant: GlobalSettingConstant,
        private _globalSettingService: GlobalSettingService,
        private _modalService: ModalService,
        private documentService: DocumentService,
        private appGlobalSelectors: AppGlobalSelectors,
        protected router: Router,
    ) {
        super(router);
        this.isCollapsedState = this.store.select((state) => state.searchResult.isCollapsed);
        this.moduleToPersonTypeState = this.store.select(
            (state) =>
                commonReducer.getCommonState(state, this.ofModule ? this.ofModule.moduleNameTrim : '')
                    .moduleToPersonType,
        );
        this.that = this;
    }

    public ngOnInit() {
        this.getAllModule();
        this.getTreeListForGS();
        this.initHotkeys();

        this.isCollapsedStateSubscription = this.isCollapsedState.subscribe((isCollapsedState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isCollapsed = isCollapsedState;
            });
        });

        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false,
        };

        if (this.ofModule) {
            this.modulePrimaryKeyState = this.store.select(
                (state) =>
                    moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey,
            );
            this.parkedItemsState = this.store.select(
                (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).parkedItems,
            );
            this.xnContextMenuState = this.store.select(
                (state) => commonReducer.getCommonState(state, this.ofModule.moduleNameTrim).contextMenuData,
            );

            this.subcribeModulePrimaryKeyState();
            this.subcribeParkedItemsState();
            this.subcribeLoadParkedItemsCompletedState();
            this.subscibeXnContextMenuState();
            this.subscribeModuleToPersonTypeState();
        }
    }

    public ngOnDestroy() {
        //this.hotkeysService.remove(this.ctrlP);
        uti.Uti.unsubscribe(this);
        super.onDestroy();
    }

    private subscibeXnContextMenuState() {
        this.xnContextMenuStateSubscription = this.xnContextMenuState.subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!data) {
                    return;
                }
                this.contextMenuData = data;
            });
        });
    }

    private subscribeModuleToPersonTypeState() {
        this.moduleToPersonTypeStateSubcription = this.moduleToPersonTypeState.subscribe(
            (moduleToPersonTypeState: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.moduleToPersonType = moduleToPersonTypeState;
                });
            },
        );
    }

    private setAllowDrag(currentTab) {
        if (!this.accessRight.read || isEmpty(this.activeModule) || !currentTab.module) {
            return false;
        }

        const childModule = this.subModules.find((child) => child.idSettingsGUI === currentTab.module.idSettingsGUI);
        if (childModule && this.activeModule.idSettingsGUI === childModule.idSettingsGUIParent) {
            return true;
        } else if (currentTab.module.idSettingsGUI === this.activeModule.idSettingsGUI) {
            return true;
        }

        return false;
    }

    private initHotkeys() {
        //this.ctrlP = new Hotkey('ctrl+p', (event: KeyboardEvent): boolean => {
        //    this.addToParkedItem();
        //    return false; // Prevent bubbling
        //},
        //    ['INPUT', 'SELECT', 'TEXTAREA']
        //);
    }

    private addToParkedItem(data) {
        if (data) {
            if (Uti.isSearchUrl()) this.storeMenuContextAction({ action: 'AddToParkedItem', data: data });
            else this.store.dispatch(this.processDataActions.requestAddToParkedItems(data, this.ofModule));
        }
    }

    private addToDoublet(data) {
        if (data) {
            if (Uti.isSearchUrl()) this.storeMenuContextAction({ action: 'AddToDoublet', data: data });
            else this.store.dispatch(this.processDataActions.requestAddToDoublet(data, this.ofModule));
        }
    }

    private removeFromParkedItem(data) {
        if (data) {
            if (Uti.isSearchUrl()) this.storeMenuContextAction({ action: 'RemoveFromParkedItem', data: data });
            else this.store.dispatch(this.processDataActions.requestRemoveFromParkedItems(data, this.ofModule));
        }
    }

    private getAllModule() {
        this.globalServSubscription = this.globalServ.getAllSearchModules().subscribe(
            (data) => this.getAllModulesSuccess(data),
            (error) => {
                console.log(error);
            },
        );
    }

    private getTreeListForGS() {
        this.documentService
            .getDocumentTree(<GetDocumentTreeOptions>{ idPerson: null, shouldGetDocumentQuantity: false })
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (data) => {
                    if (!data?.length) return;

                    const trees = [];
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        if (!element?.data) continue;

                        trees.push(element.data);
                    }

                    this.store.dispatch(this.globalSearchActions.updateTreeListStorageAction(trees));
                    this._makeChildrenSummaryForAllDocumentModule(trees);
                },
                (error) => {
                    console.log(error);
                },
            );
    }

    private getAllModulesSuccess(data: ApiResultResponse) {
        if (!data) return;
        if (this.currentTab.module?.idSettingsGUI === MenuModuleId.invoiceApprovalMain) {
            this.makeModuleDataForChildrenModules(find(data.item, ['idSettingsGUI', MenuModuleId.invoiceApprovalMain]));
        } else {
            this.globalSearchModuleModels = data.item;
            this.makeClientDataForAllModules();
        }

        if (this.globalSearchModuleModels && this.globalSearchModuleModels.length) {
            this.globalSearchModuleModels.forEach((item) => {
                // fix for routing
                item.moduleNameTrim = item.moduleName;
                if (
                    item.idSettingsGUI == MenuModuleId.selectionCampaign ||
                    item.idSettingsGUI == MenuModuleId.selectionBroker ||
                    item.idSettingsGUI == MenuModuleId.selectionCollect
                ) {
                    if (!item.children || !item.children.length) {
                        item.children = [
                            new GlobalSearchModuleModel({
                                idSettingsGUI: item.idSettingsGUI,
                                idSettingsGUIParent: item.idSettingsGUI,
                                moduleName: 'Active',
                                iconName: 'fa-check',
                                isCanNew: true,
                                isCanSearch: true,
                                searchIndexKey: item.searchIndexKey + 'isactive',
                            }),
                            new GlobalSearchModuleModel({
                                idSettingsGUI: item.idSettingsGUI,
                                idSettingsGUIParent: item.idSettingsGUI,
                                moduleName: 'Archived',
                                iconName: 'fa-archive',
                                isCanNew: true,
                                isCanSearch: true,
                                searchIndexKey: item.searchIndexKey + 'isarchived',
                            }),
                        ];
                    }
                    //Set accessRight for Module
                    this.accessRightsService.SetAccessRightsForModule(item.children);
                }
            });
        }

        const currentModule = this.globalServ.getCurrentModule(
            this.globalSearchModuleModels,
            this.globalSearchModuleModelsAdminChildren,
            this.currentTab,
        );

        if (currentModule) {
            this.currentTab.module = new Module(Object.assign({}, currentModule));
        }
        this.ref.markForCheck();
    }

    private makeClientDataForAllModules() {
        if (this.globalSearchModuleModels.length <= 0) {
            return;
        }
        // Make for master
        for (const module of this.globalSearchModuleModels) {
            module.controlClassName = this.searchItemBgClassName + '  ' + this.searchItemClassName;
            module.textClassName = this.searchTextClassName;
            module.mainClassName = this.mainItemClassParent;
        }
        const adminChildrenModules = this.getAdminChildrenModule();
        if (adminChildrenModules.length <= 0) {
            return;
        }
        // Make for detail
        for (const module of adminChildrenModules) {
            module.controlClassName = this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall;
            module.textClassName = this.searchTextClassNameSmall;
            module.parentName = this.globalSearchConsts.searchAdministration;
            module.mainClassName = this.mainItemClassChild;
        }
        this.globalSearchModuleModelsAdminChildren = adminChildrenModules;
    }

    private getAdminChildrenModule(): GlobalSearchModuleModel[] {
        const moduleAdministration = this.globalServ.getModuleByName(
            this.globalSearchModuleModels,
            this.globalSearchConsts.searchAdministration,
        );
        if (!moduleAdministration || !moduleAdministration.children || moduleAdministration.children.length <= 0) {
            return [];
        }
        return moduleAdministration.children;
    }

    public onClickSearch() {
        this.search(this.currentTab.textSearch);
    }

    public search(value: string) {
        this.currentTab = this.globalServ.getCurrentTabModelItem(this.tabList);

        if (this.currentTab.textSearch == value && this.globalSearchResult) {
            this.globalSearchResult.search();
        }

        this.currentTab.textSearch = value;

        const currentModule = this.globalServ.getCurrentModule(
            this.globalSearchModuleModels,
            this.globalSearchModuleModelsAdminChildren,
            this.currentTab,
        );
        if (currentModule) {
            this.currentTab.module = new Module(Object.assign({}, currentModule));
        }

        this.setLoadingForModule(this.globalSearchModuleModels, true);
        this.setLoadingForModule(this.globalSearchModuleModelsAllDocumentChildren, true);
        //if (!this.currentTab.textSearch) {
        //    this.globalServ.setSearchResultForModule(this.globalSearchModuleModels, null, this.searchItemBgClassName + '  ' + this.searchItemClassName);
        //    this.globalServ.setSearchResultForModule(this.globalSearchModuleModelsAdminChildren, null, this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall);
        //    this.globalSearchConfig.isSearch = false;
        //    this.onSearchResultCompleted.emit();
        //    return;
        //}

        //Only search all when don't stay at any tabs
        if (!this.currentTab.module && this.tabType === this.globalSearchConsts.searchAll) {
            // Search Admin Group
            this.searchForAdminstration();
            // Search Other Group
            this.searchOtherGroup();
        } else if (
            this.currentTab?.module?.idSettingsGUI == MenuModuleId.invoiceApprovalMain &&
            this.tabType === this.globalSearchConsts.invoiceApproval
        ) {
            this.searchOtherGroup();
        }
    }

    private searchOtherGroupTimeout: any;
    private searchOtherGroup() {
        clearTimeout(this.searchOtherGroupTimeout);
        this.searchOtherGroupTimeout = null;
        this.searchOtherGroupTimeout = setTimeout(() => {
            const indexSearchKeys = this.globalSearchModuleModels
                .map((p) => p.searchIndexKey)
                .filter((p) => p)
                .join(',');
            if (!indexSearchKeys) return;

            this.globalServSubscription = this.getSearchSummary(
                indexSearchKeys,
                this.currentTab.textSearch,
                this.globalSearchModuleModels,
            ).subscribe((rs) => {
                this.appErrorHandler.executeAction(() => {
                    this.setLoadingForModule(this.globalSearchModuleModels, false);
                    this.ref.detectChanges();
                    this.ref.markForCheck();
                    this.onSearchResultCompleted.emit();
                });
            });
            this.globalSearchConfig.isSearch = true;
        }, 1000);
    }

    // public component function
    public globalSearchItemClicked($event: any) {
        if (this.globalSearchConfig.isAdministrationClicked) {
            this.searchForAdminstration();
        }
        if (
            $event.idSettingsGUI == MenuModuleId.selectionCampaign ||
            $event.idSettingsGUI == MenuModuleId.selectionBroker ||
            $event.idSettingsGUI == MenuModuleId.selectionCollect
        ) {
            this.makeClientDataForChildrenModules($event);
        }
    }

    // public component function
    public globalSearchItemDoubleClicked($event: any) {
        this.currentTab = this.globalServ.getCurrentTabModelItem(this.tabList);
        if (this.globalSearchConfig.isAdministrationClicked) {
            this.searchForAdminstration();
        }
        if (
            $event.idSettingsGUI == MenuModuleId.selectionCampaign ||
            $event.idSettingsGUI == MenuModuleId.selectionBroker ||
            $event.idSettingsGUI == MenuModuleId.selectionCollect
        ) {
            this.makeClientDataForChildrenModules($event);
        }
        this.onMarkForCheck.emit();
    }

    /**
     * Used for Selection modules
     * @param parentModule
     */
    private makeClientDataForChildrenModules(parentModule: any) {
        const globalSearchModuleModelChildren = parentModule.children;
        if (globalSearchModuleModelChildren.length <= 0) {
            return;
        }
        // Make for detail
        for (const module of globalSearchModuleModelChildren) {
            module.controlClassName = this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall;
            module.textClassName = this.searchTextClassNameSmall;
            module.parentName = this.globalSearchConsts.searchAdministration;
            module.mainClassName = this.mainItemClassChild;
        }
        this.globalSearchModuleModelsAdminChildren = globalSearchModuleModelChildren;
    }

    private makeModuleDataForChildrenModules(parentModule: any) {
        const globalSearchModuleModelChildren = parentModule.children;
        if (globalSearchModuleModelChildren.length <= 0) {
            return;
        }
        // Make for detail
        for (const module of globalSearchModuleModelChildren) {
            module.controlClassName = this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall;
            module.textClassName = this.searchTextClassNameSmall;
            module.parentName = this.globalSearchConsts.searchAdministration;
            module.mainClassName = module.searchIndexKey;
        }
        this.globalSearchModuleModels = globalSearchModuleModelChildren;
    }

    private searchForAdminstration() {
        if (!this.currentTab.textSearch) {
            this.globalServ.setSearchResultForModule(
                this.globalSearchModuleModelsAdminChildren,
                null,
                this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall,
            );
            this.globalSearchConfig.isSearch = false;
            return;
        }

        // Get Count Summary for Administrator
        const adminModule = this.globalSearchModuleModels.filter((p) => p.idSettingsGUI === 1);
        if (adminModule.length) {
            const indexSearchKeys = this.globalSearchModuleModelsAdminChildren.map((p) => p.searchIndexKey).join(',');
            if (!indexSearchKeys) return;
            this.setLoadingForModule(this.globalSearchModuleModelsAdminChildren, true);

            this.globalServSubscription = this.getSearchSummary(
                indexSearchKeys,
                this.currentTab.textSearch,
                this.globalSearchModuleModelsAdminChildren,
            ).subscribe((rs) => {
                this.appErrorHandler.executeAction(() => {
                    adminModule[0].isLoading = false;
                    adminModule[0].searchResult = rs;
                    adminModule[0].isSearchEmpty = adminModule[0].searchResult === 0;
                    this.ref.detectChanges();
                    this.ref.markForCheck();
                    this.onSearchResultCompleted.emit();
                });
            });
        }
    }

    private getSearchSummary(
        idexSearchKeys: string,
        textSearch: string,
        searchModuleModels: Array<GlobalSearchModuleModel>,
    ) {
        const idDocumentTree = _map(this.globalSearchModuleModelsAllDocumentChildren, 'idDocumentTree') || [];
        const searchPattern = this.searchWithStarPattern || 'Both_*X*';
        return this.globalServ
            .getSearchSummary(textSearch, idexSearchKeys, this.isWithStar, searchPattern, idDocumentTree.join(','))
            .pipe(
                map((indexSearchSummaries) => {
                    let count = 0;
                    for (const indexSearchSummary of indexSearchSummaries.item) {
                        count += indexSearchSummary.count;
                        let rs = searchModuleModels.filter((p) => p.searchIndexKey === indexSearchSummary.key);
                        if (indexSearchSummary.key === 'approvalmain') {
                            rs = searchModuleModels.filter((p) => p.idSettingsGUI === MenuModuleId.invoiceApprovalMain);
                        }
                        if (!rs || !rs.length) {
                            continue;
                        }

                        rs[0].searchResult = indexSearchSummary.count;
                        rs[0].isLoading = false;
                        rs[0].isSearchEmpty = rs[0].searchResult === 0;

                        if (indexSearchSummary.children && rs[0].idSettingsGUI === MenuModuleId.allDocuments) {
                            this._updateSumaryChildrentForAllDocumentModule(indexSearchSummary.children);
                        }

                        // Used for Selection modules
                        if (
                            // (rs[0].idSettingsGUI != MenuModuleId.selectionCampaign &&
                            //     rs[0].idSettingsGUI != MenuModuleId.selectionBroker &&
                            //     rs[0].idSettingsGUI != MenuModuleId.selectionCollect) ||
                            !rs[0].children ||
                            !rs[0].children.length
                        ) {
                            continue;
                        }
                        // Set search result for children Item
                        rs[0].searchResultChildren = [];
                        for (let child of rs[0].children) {
                            const currentChildResult = indexSearchSummaries.item.find(
                                (x) => x.key === child.searchIndexKey,
                            );
                            if (currentChildResult) {
                                rs[0].searchResultChildren.push({
                                    ...currentChildResult,
                                    moduleName: child.moduleName,
                                });
                                child.searchResult = currentChildResult.count;
                                child.isLoading = false;
                                child.isSearchEmpty = currentChildResult.count === 0;
                                if (!child.isSearchEmpty) {
                                    rs[0].searchResult = rs[0].searchResult || 1;
                                    rs[0].isSearchEmpty = false;
                                }
                            }
                        }
                    }
                    return count;
                }),
            );
    }

    private subscribeStructureTreeSettings() {
        this.appGlobalSelectors.structureTreeSettings$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((settings) => {
                if (!settings?.nodesState?.length) {
                    this._globalSettingService.getAllGlobalSettings().subscribe((data: any) => {
                        if (data && data.length) {
                            const found = data.find(
                                (x) => x.globalName === this._globalSettingConstant.structureTreeSettings,
                            );
                            if (!found) {
                                return;
                            }

                            const setting = JSON.parse(found.jsonSettings);
                            this.store.dispatch(new SaveStructureTreeSettingsGlobalAction(setting));
                        }
                    });
                    return;
                }

                for (let index = 0; index < settings.nodesState.length; index++) {
                    const node = settings.nodesState[index];
                    const indexItem = this.globalSearchModuleModelsAllDocumentChildren.findIndex(
                        (x) => x.idDocumentTree === node.idDocument,
                    );
                    // folder is visible and current list has || folder not visible and current list don't have --> do nothing
                    if ((node.visible && indexItem > -1) || (!node.visible && indexItem < 0)) continue;
                    else if (node.visible && indexItem < 0) {
                        // folder is visible and current list don't have --> push to list
                        const item = this.globalSearchModuleModelsAllDocumentChildrenStore.find(
                            (x) => x.idDocumentTree === node.idDocument,
                        );
                        if (!item) continue;

                        this.globalSearchModuleModelsAllDocumentChildren.push(item);
                        continue;
                    } else if (!node.visible && indexItem > -1) {
                        // folder not visible and current list has --> remove from list
                        this.globalSearchModuleModelsAllDocumentChildren.splice(indexItem, 1);
                    }
                }
            });
    }
    private _makeChildrenSummaryForAllDocumentModule(trees: any) {
        for (const key in trees) {
            if (Object.prototype.hasOwnProperty.call(trees, key)) {
                const element = trees[key];
                this.globalSearchModuleModelsAllDocumentChildren.push(
                    new GlobalSearchModuleModel({
                        idSettingsGUI: MenuModuleId.allDocuments,
                        idSettingsGUIParent: MenuModuleId.allDocuments,
                        moduleName: element.groupName,
                        iconName: element.iconName,
                        isCanNew: true,
                        isCanSearch: true,
                        searchIndexKey: ModuleList.AllDocumentGlobalSearch.searchIndexKey,
                        controlClassName: this.searchItemBgClassName + '  ' + this.searchItemClassNameSmall,
                        textClassName: this.searchTextClassNameSmall,
                        parentName: ModuleList.AllDocumentGlobalSearch.moduleNameTrim,
                        mainClassName: this.mainItemClassChild,
                        idDocumentTree: element.idDocumentTree,
                    }),
                );

                this.accessRightsService.SetAccessRightsForModule(this.globalSearchModuleModelsAllDocumentChildren);
            }
        }
        this.globalSearchModuleModelsAllDocumentChildrenStore = [...this.globalSearchModuleModelsAllDocumentChildren];
        this.subscribeStructureTreeSettings();
    }

    private _updateSumaryChildrentForAllDocumentModule(results: any) {
        this.globalSearchModuleModelsAllDocumentChildren.forEach((child) => {
            const rs = find(results, (_r) => _r.key == child.idDocumentTree);
            child.searchResult = rs?.count;
            child.isLoading = false;
            child.isSearchEmpty = child.searchResult === 0;
        });
    }

    public searchEachItem(keyWord: string, model: GlobalSearchModuleModel) {
        this.globalServSubscription = this.globalServ
            .getSearchSummary(keyWord, model.searchIndexKey, this.isWithStar, this.searchWithStarPattern)
            .pipe(finalize(() => (model.isLoading = false)))
            .subscribe(
                (data) => this.getSearchSummarySuccess(data.item, model),
                (error) => {
                    console.log(error);
                },
            );
    }

    private getSearchSummarySuccess(data: Array<any>, model: GlobalSearchModuleModel) {
        model.isLoading = false;
        let count = 0;
        if (data && data.length > 0) {
            const rs = data.filter((p) => p.key === model.searchIndexKey);
            if (rs.length > 0) {
                count = rs[0].count;
            }
        }
        model.searchResult = count;
        model.isSearchEmpty = model.searchResult === 0;
        model.controlClassName =
            this.searchItemBgClassNameSearched +
            '  ' +
            (model.parentName ? this.searchItemClassNameSmall : this.searchItemClassName);
        this.ref.detectChanges();
        this.ref.markForCheck();
    }

    private setLoadingForModule(modules: GlobalSearchModuleModel[], loading: boolean) {
        for (const item of modules) {
            item.isLoading = loading;
            if (!item.searchResult && !loading) item.isSearchEmpty = true;
        }
        this.ref.markForCheck();
    }

    public onTableRowClicked(data) {
        let tabInfo = this.currentTab;
        const tabActivate = this.globalServ.getCurrentTabModelItem(this.tabList);
        if (this.activeModule.idSettingsGUI == MenuModuleId.processing && data.idRepPersonType) {
            for (let key in this.moduleToPersonType) {
                if (this.moduleToPersonType[key] == data.idRepPersonType) {
                    tabInfo.moduleID = key;
                }
            }
        }
        if (get(tabActivate, 'title') == ModuleList.Contact.moduleName) {
            const attachmentModel = cloneDeep(
                this.globalSearchModuleModels.find((x) => x.idSettingsGUI === ModuleList.Contact.idSettingsGUI),
            );
            attachmentModel.idSettingsGUI = ModuleList.AttachmentGlobalSearch.idSettingsGUI;
            attachmentModel.subModuleName = ModuleList.AttachmentGlobalSearch.moduleName;

            const filter = new GlobalSearchFilterModel({
                fieldsName: ['contacts.idPerson'],
                fieldsValue: [data.idPerson],
            });
            remove(this.tabList, ['title', ModuleList.AttachmentGlobalSearch.moduleName]);
            const contactIndex = findIndex(this.tabList, ['title', 'Contact']);
            this.tabList[contactIndex].tabClass = 'show-attachment';
            // this.tabList[contactIndex].active = false;
            this.tabList.splice(contactIndex + 1, 0, {
                id: guid(),
                title: ModuleList.AttachmentGlobalSearch.moduleName,
                active: false,
                removable: true,
                textSearch: '*',
                titleSecondary: data.company,
                filter: filter,
                module: new Module(Object.assign({}, attachmentModel)),
                searchIndex: 'attachments',
                isWithStar: this.isWithStar,
                searchWithStarPattern: this.searchWithStarPattern,
                histories: [],
                tabClass: 'attachment-tab',
            });
            this.store.dispatch(this.globalSearchActions.updateTab(this.tabList));
        }

        if (get(tabActivate, 'title') == ModuleList.History.moduleName) {
            const historyDetailModel = cloneDeep(
                this.globalSearchModuleModels.find((x) => x.idSettingsGUI === ModuleList.History.idSettingsGUI),
            );
            historyDetailModel.moduleName = ModuleList.HistoryDetail.moduleName;
            historyDetailModel.idSettingsGUI = ModuleList.HistoryDetail.idSettingsGUI;
            historyDetailModel.subModuleName = ModuleList.HistoryDetail.moduleName;

            const filter = new GlobalSearchFilterModel({
                fieldsJson: JSON.stringify([
                    {
                        Name: 'idBranches',
                        Val: data.idBranches,
                        QType: 'Term',
                    },
                    {
                        Name: 'idLogin',
                        Val: data.idLogin,
                        QType: 'Term',
                    },
                ]),
            });
            remove(this.tabList, ['title', ModuleList.HistoryDetail.moduleName]);
            const historyIndex = findIndex(this.tabList, ['title', 'History']);
            this.tabList[historyIndex].tabClass = 'show-attachment';
            this.tabList[historyIndex].active = false;
            this.tabList.splice(historyIndex + 1, 0, {
                id: guid(),
                title: ModuleList.HistoryDetail.moduleName,
                active: true,
                removable: true,
                textSearch: '*',
                titleSecondary: data.branchName,
                filter: filter,
                module: new Module(Object.assign({}, historyDetailModel)),
                searchIndex: ModuleList.HistoryDetail.searchIndexKey,
                isWithStar: this.isWithStar,
                searchWithStarPattern: this.searchWithStarPattern,
                histories: [],
                tabClass: 'attachment-tab',
            });
            this.store.dispatch(this.globalSearchActions.updateTab(this.tabList));
            return;
        }

        let selectedModule = null;
        if (get(tabActivate, 'title') == ModuleList.AttachmentGlobalSearch.moduleName) {
            selectedModule = cloneDeep(
                this.globalSearchModuleModels.find((x) => x.idSettingsGUI === ModuleList.Contact.idSettingsGUI),
            );
            if (!selectedModule) {
                selectedModule = cloneDeep(this.globalSearchModuleModels[0]);
                selectedModule.moduleName = ModuleList.Contact.moduleName;
                selectedModule.moduleNameTrim = ModuleList.Contact.moduleNameTrim;
            }
            selectedModule.subModuleName = ModuleList.AttachmentGlobalSearch.moduleName;
            selectedModule.idSettingsGUI = ModuleList.AttachmentGlobalSearch.idSettingsGUI;
        } else {
            const currentModule = this.globalServ.getCurrentModule(
                this.globalSearchModuleModels,
                this.globalSearchModuleModelsAdminChildren,
                this.currentTab,
            );
            selectedModule = new Module(currentModule);
        }
        this.store.dispatch(
            this.globalSearchActions.rowDoubleClick({
                data,
                selectedModule,
            }),
        );

        this.updateSearchHighlight(tabInfo.textSearch);
        if (this.showFullPage) return;

        // null when init and first click || id and idDocumentContainerScans have to different
        const isOtherDataWithSameModule =
            !this.selectedSearchResult ||
            (data &&
                this.selectedSearchResult &&
                (data.id !== this.selectedSearchResult['id'] ||
                    data.idDocumentContainerScans !== this.selectedSearchResult['idDocumentContainerScans']));
        const status = this.moduleService.loadContentDetailBySelectedModule(
            selectedModule,
            this.activeModule,
            this.activeSubModule,
            this.mainModules,
            isOtherDataWithSameModule,
        );
        this.addSearchResultDataToStore(Object.assign({}, data));
        if (status) {
            this.willSelectSearchResult = data;
            setTimeout(() => {
                if (this.activeModule.idSettingsGUI == MenuModuleId.processing && this.currentTab.moduleID) {
                    this.onTableRowClicked(data);
                }
            }, 1000);
        }
        //else {
        //    this.addSearchResultDataToStore(Object.assign({}, data));
        //}
    }

    public onTableRowDoubleClicked(data) {
        const tabActivate = this.globalServ.getCurrentTabModelItem(this.tabList);
        if (get(tabActivate, 'title') == ModuleList.Contact.moduleName) {
            const item = find(this.tabList, ['title', ModuleList.AttachmentGlobalSearch.moduleName]);
            const itemSelect = find(this.tabList, 'active');
            // return when dbclick from other page. Will handle later
            if (this.activeModule.moduleName && this.activeModule.moduleName !== ModuleList.Contact.moduleName) return;
            if (!item) {
                setTimeout(() => {
                    this.onTableRowDoubleClicked(data);
                }, 500);
                return;
            }
            itemSelect.active = false;
            item.active = true;
            this.store.dispatch(this.globalSearchActions.updateTab(this.tabList));
        } else if (
            get(tabActivate, 'title') == ModuleList.Indexing.moduleName ||
            get(tabActivate, 'title') == ModuleList.Email.moduleName
        ) {
            const selectedModule = tabActivate.module;
            this.moduleService.loadContentDetailBySelectedModule(
                selectedModule,
                selectedModule,
                {},
                this.mainModules,
                true,
            );
            return;
        }
    }

    public makeContextMenu(data?: any) {
        return this.makeMenuRightClick(uti.Uti.mapObjectToCamel(data));
    }

    /******************************* */

    private updateSearchHighlight = (value: string) => {
        localStorage.setItem(LocalStorageKey.LocalStorageGSCaptureSearchText, replace(value, '*', ''));
    };

    private addSearchResultDataToStore(data) {
        let module: Module = this.ofModule;
        if (this.ofModule.idSettingsGUIParent && this.ofModule.idSettingsGUIParent == MenuModuleId.processing) {
            module = this.mainModules.find((m) => m.idSettingsGUI == MenuModuleId.processing);
        }

        this.store.dispatch(this.processDataActions.selectSearchResult(data, module));
        this.selectedSearchResult = data;
    }

    private subcribeModulePrimaryKeyState() {
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe(
            (modulePrimaryKeyState: string) => {
                this.appErrorHandler.executeAction(() => {
                    this.modulePrimaryKey = modulePrimaryKeyState;
                });
            },
        );
    }
    private subcribeParkedItemsState() {
        this.parkedItemsStateSubscription = this.parkedItemsState.subscribe((parkedItemsState: ParkedItemModel[]) => {
            this.appErrorHandler.executeAction(() => {
                this.parkedItems = parkedItemsState;
            });
        });
    }

    private subcribeLoadParkedItemsCompletedState() {
        this.loadParkedItemsCompletedSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ProcessDataActions.LOAD_PARKED_ITEMS_COMPLETED;
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.willSelectSearchResult) {
                        this.addSearchResultDataToStore(this.willSelectSearchResult);

                        if (this.ofModule && this.ofModule.idSettingsGUI == MenuModuleId.warehouseMovement) {
                            this.store.dispatch(
                                this.tabSummaryActions.requestUpdateTabHeader(
                                    this.willSelectSearchResult[this.modulePrimaryKey],
                                    this.ofModule,
                                ),
                            );
                        }

                        this.willSelectSearchResult = null;
                    }
                });
            });
    }

    private createGridMenuContextData(data: any) {
        let result: any = [];

        // if (this.accessRight.read) {
        //     result.push({
        //         name: `<span class="pull-left">Add to parked items</span>
        //                <span class="ag-context-shortcut"></span>`, //Ctrl+P
        //         action: event => {
        //             this.addToParkedItem(data);
        //         },
        //         cssClasses: [''],
        //         icon: `<i class="fa  fa-plus  green-color  ag-context-icon"/>`,
        //         key: 'AddToParkedItems',
        //     });
        //     result.push({
        //         name: 'Remove from parked items',
        //         action: event => {
        //             this.removeFromParkedItem(data);
        //         },
        //         cssClasses: [''],
        //         icon: `<i class="fa  fa-times  red-color  ag-context-icon"/>`,
        //         key: 'RemoveFromParkedItems',
        //     });
        // }

        if (this.currentTab.searchIndex.toLowerCase().indexOf('customer') >= 0) {
            result.push({
                name: 'Order Processing',
                icon: `<i class="fa fa-cart-plus blue-color ag-context-icon"/>`,
                subMenu: [
                    {
                        name: 'Create Invoice',
                        icon: `<i class="fa fa-address-book-o blue-color ag-context-icon"/>`,
                        action: (event) => {
                            this.openEditMode(data, DocType.Invoice);
                        },
                    },
                    {
                        name: 'Create Order',
                        icon: `<i class="fa fa-cart-plus blue-color ag-context-icon"/>`,
                        action: (event) => {
                            this.openEditMode(data, DocType.Order);
                        },
                    },
                    {
                        name: 'Create Offer',
                        icon: `<i class="fa fa-bullhorn blue-color ag-context-icon"/>`,
                        action: (event) => {
                            this.openEditMode(data, DocType.Offer);
                        },
                    },
                ],
            });
        }
        if (result.length) result.push('separator');

        return result;
    }

    private openEditMode(data, docType: DocType) {
        // First: We need to get Order Processing Module
        let orderProcessingModule = this.globalSearchModuleModels.find(
            (p) => p.idSettingsGUI == MenuModuleId.orderProcessing,
        );
        if (!orderProcessingModule) {
            return;
        }
        const selectedModule = new Module(orderProcessingModule);
        const status = this.moduleService.loadContentDetailBySelectedModule(
            selectedModule,
            this.activeModule,
            this.activeSubModule,
            this.mainModules,
        );

        let requestNewStatus: boolean;

        this.store.dispatch(
            this.orderProcessingActions.requestOrder(
                {
                    updateMode: DocUpdateMode.New,
                    data: new OrderProcessingUpdateModel({
                        idOffer: data.idOffer,
                        idOrder: data.idOrder,
                        idInvoice: data.idInvoice,
                        idOrderProcessing: data.idOrderProcessing,
                        idPerson: data.idPerson,
                    }),
                    documentType: docType,
                },
                selectedModule,
            ),
        );

        // True : Wait to change to other module/submodule
        if (status) {
            this.willSelectSearchResult = data;
        }
        // At the current module
        else {
            // Check if tab exists
            const elm = this.domHandler.findSingle(document, 'xn-tab');
            if (elm) {
                requestNewStatus = true;
                this.store.dispatch(this.tabButtonActions.requestNew(selectedModule));
            } else {
                this.addSearchResultDataToStore(Object.assign({}, data));
            }
        }
        if (!requestNewStatus) {
            setTimeout(() => {
                this.store.dispatch(this.moduleActions.requestTriggerClickNewFromModule(selectedModule));
            }, 1000);
        }
    }

    public makeMenuRightClick(data: any) {
        const menuContext: any = this.createGridMenuContextData(data);

        if (this.accessRight.read) {
            const id = data[this.modulePrimaryKey];
            const currentParkedItem = this.parkedItems.find((x) => x.id.value == id);
            const hasNotParkedItem = isEmpty(currentParkedItem);

            for (let menuItem of menuContext) {
                if (menuItem !== 'string') {
                    if (menuItem.key === 'AddToParkedItems')
                        menuItem.cssClasses = !hasNotParkedItem ? ['xn-disabled'] : [''];
                    else if (menuItem.key === 'RemoveFromParkedItems')
                        menuItem.cssClasses = hasNotParkedItem ? ['xn-disabled'] : [''];
                }
            } //for
        }

        return menuContext;
    }

    private storeMenuContextAction(data) {
        if (!Configuration.PublicSettings.enableGSNewWindow) return;

        this.store.dispatch(this.globalSearchActions.menuContextAction(data));
    }

    /**
     * onSearchCompleted
     */
    public onSearchCompleted() {
        this.onSearchResultCompleted.emit();
    }

    public addToHistoryHandler(event: any) {
        if (!this.currentTab || !this.currentTab.histories) return;
        this.getGlobalAndSaveData(event);
    }

    public deleteAllHandler() {
        this._modalService.confirmDeleteMessageHtmlContent({
            headerText: 'Delete data',
            message: [{ key: '<p>' }, { key: 'Modal_Message__AreYouSureWantToDeleteAllItems' }, { key: '<p>' }],
            callBack1: () => {
                this.currentTab.histories.length = 0;
                this.detectChange();
                this.getGlobalAndSaveData();
            },
        });
    }

    public texClickedHandler(curentHistoryItem: any) {
        this.search(curentHistoryItem.text);
    }

    public deleteItemHandler(item: any) {
        Uti.removeItemInArray(this.currentTab.histories, item, 'text');
        this.getGlobalAndSaveData();
    }
    private globalSettingItem: any = {};
    private limitHistoriesNumber = 15;

    private getGlobalAndSaveData(addNewItem?: any) {
        this._globalSettingService.getAllGlobalSettings('-1').subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                let globalSettingName = String.Format(
                    '{0}_{1}',
                    this._globalSettingConstant.gsHistoryTabSearching,
                    this.currentTab.title.replace(/ /g, ''),
                );

                this.globalSettingItem = data.find((x) => x.globalName === globalSettingName);

                if (
                    !this.globalSettingItem ||
                    !this.globalSettingItem.idSettingsGlobal ||
                    !this.globalSettingItem.globalName
                ) {
                    this.globalSettingItem = new GlobalSettingModel({
                        globalName: globalSettingName,
                        description: 'Global Search History Tab Searching',
                        globalType: this._globalSettingConstant.gsHistoryTabSearching,
                        idSettingsGUI: '-1',
                        isActive: true,
                        objectNr: '-1',
                    });
                }
                if (addNewItem) {
                    if (!this.currentTab.histories || !this.currentTab.histories.length) {
                        this.currentTab.histories = Uti.tryParseJson(this.globalSettingItem.jsonSettings, []);
                    }
                    // If exists dont need update to global setting
                    if (this.checkAndAddNewItem(addNewItem)) return;
                }
                this.globalSettingItem.jsonSettings = JSON.stringify(this.buildGSHistoryDataForSaving());
                this.globalSettingItem.idSettingsGUI = '-1';

                this._globalSettingService.saveGlobalSetting(this.globalSettingItem).subscribe(
                    (response) => this.saveGlobalSuccess(response),
                    (error) => this.saveGlobalError(error),
                );
            });
        });
    }

    private checkAndAddNewItem(addNewItem) {
        let isExistedItem: boolean = false;
        for (let item of this.currentTab.histories) {
            item.active = false;
            if (item.text === addNewItem.keyword) {
                item.num = addNewItem.numberOfResult;
                item.active = true;
                isExistedItem = true;
            }
        }
        if (isExistedItem) return true;
        this.currentTab.histories.push({
            text: addNewItem.keyword,
            num: addNewItem.numberOfResult,
            active: true,
        });
        this.limitHistoriesLength();
        return false;
    }

    private limitHistoriesLength() {
        if (this.currentTab.histories.length < this.limitHistoriesNumber + 1) {
            return;
        }
        this.currentTab.histories.shift();
    }

    private buildGSHistoryDataForSaving(): Array<any> {
        if (!this.currentTab.histories || !this.currentTab.histories.length) return [];
        return this.currentTab.histories.map((x) => {
            return {
                text: x.text,
                active: x.active,
            };
        });
    }

    public detectChange() {
        setTimeout(() => {
            this.ref.markForCheck();
            this.ref.detectChanges();
        }, 300);
    }

    private saveGlobalSuccess(response: any) {
        this._globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.globalSettingItem, response);
    }

    private saveGlobalError(response: any) {
        // handle after save golbal setting error
    }
}
