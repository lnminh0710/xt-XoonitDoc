import { Component, OnInit, Input, ViewChild, OnDestroy, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { TabPageViewSplitItemModel } from '@app/models/tab-page-view';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { LayoutInfoActions, GridActions, CustomAction, LayoutSettingActions } from '@app/state-management/store/actions';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Observable, Subscription } from 'rxjs';
import { Uti, String } from '@app/utilities';
import { XnTabContentSimpleTabsComponent } from '../../xn-tab';
import { SplitterService, AppErrorHandler, GlobalSettingService } from '@app/services';
import { GlobalSettingModel } from '@app/models';
import { GlobalSettingConstant } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { filter, takeUntil } from 'rxjs/operators';
import { SplitComponent } from 'angular-split';
import { IArea } from 'angular-split/lib/interface';
import { ScanningProcess } from '../../../../pages/private/modules/scanning/services';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { EnableWidgetTemplateState } from '../../../../models/widget-template/enable-widget-template.model';

@Component({
    selector: 'app-xn-double-page-view-horizontal',
    styleUrls: ['./xn-double-page-view-horizontal.component.scss'],
    templateUrl: './xn-double-page-view-horizontal.component.html',
})
export class XnDoublePageViewHorizontalComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    private _hiddenAreaNumber = 0;
    public pageItems: TabPageViewSplitItemModel[];
    public lastHidePageItem: TabPageViewSplitItemModel;
    private _configSplitters: any;

    @Input()
    set data(data: any) {
        if (!data) return;

        this.pageItems = data.Items;
        this._configSplitters = data.Splitters;
        this.splitter.buildPageItems(this.pageItems, data.Splitters);
    }

    @Input() isOrderDataEntry?: boolean;
    @Input() isActivated;
    @Input() tabID: string;
    @Input() isSplitterDragging;

    @ViewChild(PerfectScrollbarDirective) perfectScrollbarDirective: PerfectScrollbarDirective;
    @ViewChild(XnTabContentSimpleTabsComponent) xnTabContentSimpleTabsComponent: XnTabContentSimpleTabsComponent;
    @ViewChild(SplitComponent) splitComponent: SplitComponent;

    public contentHeight = 0;
    private globalSettingName = '';
    public isDragging = false;

    private layoutInfoModel: Observable<SubLayoutInfoState>;

    private layoutInfoModelSubscription: Subscription;
    private globalSettingServiceSubscription: Subscription;
    private globalSettingItem: GlobalSettingModel = null;

    private enableWidgetTemplateStateSubscription: Subscription;
    private enableWidgetTemplateState: Observable<EnableWidgetTemplateState>;
    private enableWidgetCustomization = false;

    private requestEditLayoutTogglePanelStateSubscription: Subscription;
    private enableDesignPageLayout = false;

    constructor(
        private store: Store<AppState>,
        private renderer2: Renderer2,
        private layoutInfoActions: LayoutInfoActions,
        private gridActions: GridActions,
        private splitter: SplitterService,
        private appErrorHandler: AppErrorHandler,
        private scanningProcess: ScanningProcess,
        private globalSettingConstant: GlobalSettingConstant,
        private globalSettingService: GlobalSettingService,
        private reducerMgrDispatcher: ReducerManagerDispatcher,
        protected router: Router,
    ) {
        super(router);

        this.layoutInfoModel = store.select((state) => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.enableWidgetTemplateState = store.select((state) => widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate);
    }

    ngOnInit() {
        this.subscribe();
    }

    ngAfterViewInit() {
        this._onInitialPage();
    }

    ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    public dragEnd(splittersSize: any, pageItems: any) {
        this.isDragging = false;
        this.storeSplitterState(splittersSize, pageItems);

        this.store.dispatch(this.layoutInfoActions.resizeSplitter(this.ofModule));
        this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));

        if (this.xnTabContentSimpleTabsComponent) {
            this.xnTabContentSimpleTabsComponent.onWindowResize(null);
        }
    }

    private storeSplitterState(splittersSize: any, pageItems: any): void {
        const findSize = splittersSize.sizes.find(n => n === 0);
        //If there is any pageItem with ContentSize = 0 -> don't save Splitter
        const findItem = pageItems.find(n => n.ContentSize === 0 && (!n.Split && !n.SimpleTabs));
        if (findSize === 0 && findItem) {
            this.splitter.updatePageItemsContentSize(pageItems, splittersSize);
            return;
        }

        this.globalSettingServiceSubscription = this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.globalSettingName = String.Format('{0}_{1}', this.globalSettingConstant.moduleLayoutSetting, String.hardTrimBlank(this.ofModule.moduleName));
                this.globalSettingItem = data.find(x => x.globalName && x.idSettingsGlobal && x.globalName === this.globalSettingName);
                if (!this.globalSettingItem)
                    this.globalSettingItem = data.find(x => x.globalName === this.globalSettingName);

                //#region Parse  ModuleSetting
                let moduleSetting: any = null;
                if (this.globalSettingItem && this.globalSettingItem.jsonSettings) {
                    moduleSetting = JSON.parse(this.globalSettingItem.jsonSettings);
                    if (!moduleSetting.item) return;

                    moduleSetting.item[0].jsonSettings = JSON.parse(moduleSetting.item[0].jsonSettings);
                }
                //#endregion

                this.splitter.rebuildAndUpdateSplitters(moduleSetting, splittersSize, pageItems, this._configSplitters, this.saveGlobalSetting.bind(this));
            });
        });
    }

    private saveGlobalSetting(moduleSetting) {
        if (!this.globalSettingItem || !this.globalSettingItem.idSettingsGlobal || !this.globalSettingItem.globalName) {
            this.globalSettingItem = new GlobalSettingModel({
                globalName: this.globalSettingName,
                description: 'Module Layout Setting',
                globalType: this.globalSettingConstant.moduleLayoutSetting,
                idSettingsGUI: this.ofModule.idSettingsGUI,
                isActive: true,
                objectNr: this.ofModule.idSettingsGUI.toString()
            });
        }

        this.globalSettingItem.jsonSettings = JSON.stringify(moduleSetting);
        this.globalSettingItem.idSettingsGUI = this.ofModule.idSettingsGUI;

        this.globalSettingServiceSubscription = this.globalSettingService.saveGlobalSetting(this.globalSettingItem).subscribe(
            response => this.saveGlobalSuccess(response),
            error => this.saveGlobalError(error));
    }

    private saveGlobalSuccess(data: any) {
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.globalSettingItem, data);
    }

    private saveGlobalError(error) {
        console.log(error);
    }

    public refreshPerfectScrollbar(event) {
        if (event) {
            if (this.perfectScrollbarDirective) {
                setTimeout(() => {
                    this.perfectScrollbarDirective.update();
                });
            }
        }
    }

    public dragStart() {
        this.isDragging = true;
        Uti.handleWhenSpliterResize();
    }

    subscribe() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.contentHeight =
                    window.innerHeight -
                    parseInt(layoutInfo.headerHeight, null) -
                    parseInt(
                        this.ofModule.idSettingsGUI != 43
                            ? layoutInfo.tabHeaderHeight
                            : layoutInfo.tabHeaderBigSizeHeight,
                        null,
                    ) -
                    parseInt(layoutInfo.smallHeaderLineHeight, null) -
                    parseInt(layoutInfo.dashboardPaddingTop, null) -
                    1;
            });
        });

        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.HIDE_SPLIT_AREA_TAB_ID &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { tabID: string; acknowledge: (ack: boolean) => void };
                this.appErrorHandler.executeAction(() => {
                    if (this.enableWidgetCustomization || this.enableDesignPageLayout) return;

                    const found = this.pageItems.find((p) => p.TabID === payload.tabID);
                    if (!found) return;

                    this.lastHidePageItem = found;
                    const hidden = this._hideArea(found);
                    payload.acknowledge && payload.acknowledge(hidden);
                    if (hidden) {
                        this._hiddenAreaNumber++;
                    }
                });
            });

        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.SHOW_SPLIT_AREA_TAB_ID &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { tabID: string; acknowledge: (ack: boolean) => void };
                this.appErrorHandler.executeAction(() => {
                    if (this.enableWidgetCustomization || this.enableDesignPageLayout) return;

                    const found = this.pageItems.find((p) => p.TabID === payload.tabID);
                    if (!found) return;

                    this.lastHidePageItem = found;
                    const result = this._showArea(found);
                    payload.acknowledge && payload.acknowledge(result);
                });
            });

        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.SET_SPLIT_AREAS_SIZE &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const payload = action.payload as {
                    tabID: string;
                    config: { hideSplitter: boolean; sizes: number[] };
                };
                this.appErrorHandler.executeAction(() => {
                    if (this.enableWidgetCustomization || this.enableDesignPageLayout) return;

                    const findPageItem = this.pageItems.find((p) => p.TabID === payload.tabID);
                    if (!findPageItem) return;

                    const sizes = [];
                    this.pageItems.forEach((pageItem) => {
                        pageItem.ContentSize = this.splitter.fixContentSize(pageItem.ContentSize);
                        sizes.push(pageItem.ContentSize);
                    });

                    if (payload.config.hideSplitter && payload.config.sizes && payload.config.sizes.length) {
                        sizes[0] = payload.config.sizes[0];
                        this.pageItems[0]['HideSplitter'] = true;
                    }
                    else {
                        sizes[0] = findPageItem.ContentSizeOriginal;
                        this.pageItems[0]['HideSplitter'] = false;
                    }

                    if (sizes.length) {
                        let countAreaHasSize = 0;
                        let sumAreas = 0;
                        for (let i = 0; i < sizes.length; i++) {
                            if (i > 0 && sizes[i]) {
                                countAreaHasSize++;
                            }
                            sumAreas += sizes[i];
                        }
                        const remainingSize = 100 - sumAreas;
                        if (remainingSize) {
                            if (countAreaHasSize) {
                                const addSize = remainingSize / countAreaHasSize;
                                for (let i = 1; i < sizes.length; i++) {
                                    if (sizes[i]) {
                                        sizes[i] += addSize;
                                    }
                                }
                            } else {
                                sizes[1] = remainingSize;
                            }
                        }
                        this.pageItems.forEach((pageItem, index) => {
                            pageItem.ContentSize = sizes[index];
                        });
                    }

                    this.splitComponent.setVisibleAreaSizes(sizes);
                    this._updateSizesAndSplitGutter(sizes);
                });
            });

        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.TOGGLE_SCAN_SPLIT_AREA &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.enableWidgetCustomization || this.enableDesignPageLayout) return;

                    const payload = action.payload as { isShowPreview: boolean; isShowConfiguration: boolean };
                    this._toggleScanSplitArea(payload.isShowPreview, payload.isShowConfiguration);
                });
            });

        this.subscribeEnableWidgetTemplateState();
        this.subscribeEnableDesignPageLayoutState();
    }//subscribe

    private subscribeEnableWidgetTemplateState() {
        if (this.enableWidgetTemplateStateSubscription) {
            this.enableWidgetTemplateStateSubscription.unsubscribe();
        }
        this.enableWidgetTemplateStateSubscription = this.enableWidgetTemplateState.subscribe(
            (enableWidgetTemplate) => {
                if (!enableWidgetTemplate || enableWidgetTemplate.previousStatus === undefined) return;

                this.appErrorHandler.executeAction(() => {
                    this.enableWidgetCustomization = enableWidgetTemplate.status;
                    this.turnOnOffPageLayout();
                });
            },
        );
    }

    private subscribeEnableDesignPageLayoutState() {
        if (this.requestEditLayoutTogglePanelStateSubscription) {
            this.requestEditLayoutTogglePanelStateSubscription.unsubscribe();
        }

        this.requestEditLayoutTogglePanelStateSubscription = this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
                })
            ).subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.enableDesignPageLayout = data.payload;
                    this.turnOnOffPageLayout();
                });
            });
    }

    private turnOnOffPageLayout() {
        if (this.lastHidePageItem) {
            if (this.enableWidgetCustomization || this.enableDesignPageLayout) {
                this._showArea(this.lastHidePageItem);
            }
            else {
                //If this area has any items -> don't hide
                if ($('[data-pageid="' + this.lastHidePageItem.TabID + '"]').length) return;

                const hidden = this._hideArea(this.lastHidePageItem);
                if (hidden) {
                    this._hiddenAreaNumber++;
                }
            }
        }
    }

    private _onInitialPage() {
        const hiddenAreas = [];
        this.pageItems.forEach((pageArea) => {
            if (pageArea.HideAtFirst && pageArea.HideAtFirst === '1') {
                hiddenAreas.push(pageArea);
            }
        });

        this._setHiddenAtFirstPageAreas(hiddenAreas);
    }

    private _setHiddenAtFirstPageAreas(hiddenAreas: TabPageViewSplitItemModel[]) {
        this._hiddenAreaNumber = hiddenAreas.length || 0;

        if (this._areAreasInvisible()) {
            this._setInvisibleAllAreas();
            return;
        }

        hiddenAreas.forEach((pageArea) => {
            this._hideArea(pageArea);
        });
    }

    private _areAreasInvisible() {
        return this._hiddenAreaNumber === this.splitComponent.displayedAreas.length;
    }

    private _setInvisibleAllAreas() {
        const areas = [];
        this.splitComponent.displayedAreas.forEach((area) => {
            areas.push(area);
        });

        areas.forEach((area) => {
            area.component.visible = false;
        });
    }

    private _hideArea(pageArea: TabPageViewSplitItemModel) {
        if (!pageArea) return false;

        const sp = this.splitComponent;

        if (!sp.displayedAreas || !sp.displayedAreas.length) return;

        const _areaIndex = sp.displayedAreas.findIndex(
            (area) => (area.component.elRef.nativeElement as HTMLElement).firstElementChild?.id === pageArea.TabID,
        );
        if (_areaIndex === -1) return false;
        const _area = sp.displayedAreas[_areaIndex];

        if (_area.size === 0) return false;

        // console.log(`HIDE SPLIT AREA ${pageArea.TabName}`);
        this._setSplitGutterSizeOfSplitCompIndex(_areaIndex, 0);
        const sizes = [];
        let otherAreaVisibleLength = sp.displayedAreas.length - this._hiddenAreaNumber;

        // if don't have any area component being displayed. then set hidden this area and return;
        if (otherAreaVisibleLength <= 0) {
            _area.component.visible = false;
            return true;
        } else if (otherAreaVisibleLength === sp.displayedAreas.length) {
            otherAreaVisibleLength -= 1;
        }

        sizes.splice(_areaIndex, 0, 0);
        const eachSize = 100 / otherAreaVisibleLength;
        this._setVisibleAreaSizes(sizes, sp, _area, eachSize);

        return true;
    }

    private _showArea(pageArea: TabPageViewSplitItemModel) {
        if (!pageArea) return;
        const sp = this.splitComponent;
        let _area: IArea = null;
        const sizes = [];
        this._hiddenAreaNumber = this._hiddenAreaNumber - 1;
        if (this._hiddenAreaNumber < 0) {
            this._hiddenAreaNumber = 0;
            return false;
        }

        // if don't have any area component being displayed. then just visible this pageAgea and library is going to do the rest.
        if (!sp.displayedAreas || !sp.displayedAreas.length) {
            _area = (sp as any).hidedAreas.find(
                (area) => (area.component.elRef.nativeElement as HTMLElement).firstElementChild?.id === pageArea.TabID,
            );
            _area.component.visible = true;
            return false;
        }

        const _areaIndex = sp.displayedAreas.findIndex(
            (area) => (area.component.elRef.nativeElement as HTMLElement).firstElementChild?.id === pageArea.TabID,
        );
        if (_areaIndex === -1) return false;

        this._setSplitGutterSizeOfSplitCompIndex(_areaIndex, 5);

        _area = sp.displayedAreas[_areaIndex];
        sizes.splice(_areaIndex, 0, pageArea.ContentSize);
        let otherAreaVisibleLength = sp.displayedAreas.length - this._hiddenAreaNumber || 0;

        if (otherAreaVisibleLength === sp.displayedAreas.length) {
            otherAreaVisibleLength -= 1;
        }

        // console.log(`SHOW SPLIT AREA ${pageArea.TabName}`);

        const eachSize = (100 - pageArea.ContentSize) / otherAreaVisibleLength;
        this._setVisibleAreaSizes(sizes, sp, _area, eachSize);
        return true;
    }

    private _setVisibleAreaSizes(
        sizes: number[],
        splitComponent: SplitComponent,
        exceptArea: IArea,
        eachSizeOtherArea: number,
    ) {
        splitComponent.displayedAreas.forEach((area, idx) => {
            if (area === exceptArea) return;
            sizes.splice(idx, 0, eachSizeOtherArea);
        });

        splitComponent.setVisibleAreaSizes(sizes);
    }

    private _getAreaByTabId(sp, tabID) {
        return (
            sp.displayedAreas[
            sp.displayedAreas.findIndex(
                (area) => (area.component.elRef.nativeElement as HTMLElement).firstElementChild?.id === tabID,
            )
            ] ||
            sp.hidedAreas[
            sp.hidedAreas.findIndex(
                (area) => (area.component.elRef.nativeElement as HTMLElement).firstElementChild?.id === tabID,
            )
            ]
        );
    }

    private _toggleScanSplitArea(isShowPreview: boolean, isShowConfiguration: boolean) {
        const configurationZone = this.pageItems.find((p) => p.TabID === this.scanningProcess.TabIDScanningConfiguration);
        const imagePreviewZone = this.pageItems.find((p) => p.TabID === this.scanningProcess.TabIDScanningImagePreview);
        const imageListZone = this.pageItems.find((p) => p.TabID === this.scanningProcess.TabIDScanningImageList);
        const treeZone = this.pageItems.find((p) => p.TabID === this.scanningProcess.TabIDScanningStructTree);
        if (!configurationZone || !imagePreviewZone || !imageListZone) return;

        const sp: SplitComponent = this.splitComponent;
        if (!sp.displayedAreas || !sp.displayedAreas.length) return;

        const _configurationArea = this._getAreaByTabId(sp, configurationZone.TabID);
        const _imagePreviewArea = this._getAreaByTabId(sp, imagePreviewZone.TabID);
        const _imageListArea = this._getAreaByTabId(sp, imageListZone.TabID);

        if (!_configurationArea || !_imagePreviewArea || !_imageListArea) return;
        const areas = [...sp.displayedAreas];

        sp.gutterSize = 5;
        const sizes = [];
        const treeSize = treeZone.ContentSize;
        const remainingSize = 100 - treeSize - imageListZone.ContentSize;
        areas.forEach((area, idx) => {
            if (area === _configurationArea) {
                if (!isShowConfiguration) {
                    _configurationArea.component.lockSize = true;
                    sizes.splice(idx, 0, 0);
                } else {
                    _configurationArea.component.lockSize = false;
                    sizes.splice(idx, 0, isShowPreview ? remainingSize / 2 : 100 - treeSize);
                }
            } else if (area === _imagePreviewArea) {
                if (!isShowPreview) {
                    sizes.splice(idx, 0, 0);
                    _imagePreviewArea.component.lockSize = true;
                } else {
                    _imagePreviewArea.component.lockSize = false;
                    sizes.splice(idx, 0, isShowConfiguration ? remainingSize / 2 : 100 - treeSize - imageListZone.ContentSizeOriginal);
                }
            } else if (area === _imageListArea) {
                if (!isShowPreview) {
                    sizes.splice(idx, 0, 0);
                    _imageListArea.component.lockSize = true;
                } else {
                    _imageListArea.component.lockSize = false;
                    sizes.splice(idx, 0, imageListZone.ContentSizeOriginal);
                }
            } else {
                sizes.splice(idx, 0, treeSize);
            }
        });
        // console.log('sizes',sizes)
        sp.setVisibleAreaSizes(sizes);
        this._updateSizesAndSplitGutter(sizes);
    }

    private _updateSizesAndSplitGutter(sizes) {
        if (sizes.length === this.pageItems.length) {
            const tabID = this.pageItems[0].TabID;
            this.pageItems.forEach((pageItem, index) => {
                pageItem.ContentSize = sizes[index];
                const splittIndex = pageItem.ContentSize === 0 && index > 1 ? index - 1 : index;
                const isLocked = pageItem.ContentSize === 0 || pageItem['HideSplitter'] ? true : false;
                this._toggleClassCssForSplitGutter(tabID, isLocked, splittIndex);
            });
        }
    }

    private _toggleClassCssForSplitGutter(id: string, isLocked: boolean, index: number) {
        const $gutters = $('[data-splitareaid="' + id + '"]')
            .parent('as-split')
            .find('> .as-split-gutter');
        if (!$gutters.length) return;

        if (isLocked)
            $gutters.eq(index).addClass('locked-area');
        else
            $gutters.eq(index).removeClass('locked-area');
    }

    private _setSplitGutterSizeOfSplitCompIndex(splitComponentIndex: number, unitPixel: number) {
        const _splitterIndex = this._getSplitterIndexOfSplitComponentIndex(splitComponentIndex);

        _splitterIndex.forEach((index) => {
            const htmlElem = ((this.splitComponent as any).gutterEls._results as Array<ElementRef>)[index]
                .nativeElement as HTMLElement;

            this.renderer2.setStyle(htmlElem, 'flex-basis', unitPixel + 'px');
        });
    }
    private _getSplitterIndexOfSplitComponentIndex(splitComponentIndex: number) {
        let _splitterIndex = [];

        // SplitComponentA | SplitComponentB | SplitComponent C | SplitComponent D
        //     index 0     ^    index 1      ^     index 2      ^      index 3
        //              splitter           splitter         splitter
        // so if SplitComponent is at index 0 then splitter at index 0
        if (splitComponentIndex > 0) {
            // if SplitComponent as at index > 0 && < splitter Array length then hide splitter between SplitComponent
            if (
                splitComponentIndex <=
                ((this.splitComponent as any).gutterEls._results as Array<ElementRef>).length - 1
            ) {
                _splitterIndex = [splitComponentIndex - 1, splitComponentIndex];
            } else {
                _splitterIndex = [splitComponentIndex - 1];
            }
        } else {
            // splitComponent at index 0
            _splitterIndex = [splitComponentIndex];
        }

        return _splitterIndex;
    }
}
