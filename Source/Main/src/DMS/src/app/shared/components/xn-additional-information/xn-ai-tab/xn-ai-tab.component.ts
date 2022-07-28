import { Component, OnInit, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AdditionalInformationActions,
    CustomAction,

    WidgetDetailActions
} from '@app/state-management/store/actions';
import { ModuleState } from '@app/state-management/store/reducer/main-module';
import { Observable, Subscription } from 'rxjs';
import { GlobalSettingService, AppErrorHandler } from '@app/services';
import { GlobalSettingModel, Module, AdditionalInfromationTabModel } from '@app/models';
import { GlobalSettingConstant } from '@app/app.constants';
import * as uti from '@app/utilities';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import * as additionalInformationReducer from '@app/state-management/store/reducer/additional-information';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { Uti } from '@app/utilities';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-xn-ai-tab',
    styleUrls: ['./xn-ai-tab.component.scss'],
    templateUrl: './xn-ai-tab.component.html',
    host: {
        '(window:resize)': 'onWindowResize($event)'
    }
})
export class XnAdditionalInformationTabComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public tabs: AdditionalInfromationTabModel[] = [];
    private tabListSettings: any;
    private globalSettingAIName = '';
    public showAddTabButton = false;
    public tabContainerStyle: Object = {};

    private requestSelectAiTabState: Observable<any>;
    private layoutInfoState: Observable<SubLayoutInfoState>;
    private requestResizeSubscription: Subscription;
    private layoutInfoStateSubscription: Subscription;
    private requestSelectAiTabStateSubscription: Subscription;
    private globalSettingServiceSubscription: Subscription;

    @Input()
    set data(data: AdditionalInfromationTabModel[]) {
        this.tabs = data.map(function (item) {
            return new AdditionalInfromationTabModel(item);
        });
    }

    constructor(private store: Store<AppState>,
        private _eref: ElementRef,
        private additionalInformationActions: AdditionalInformationActions,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private appErrorHandler: AppErrorHandler,
        private dispatcher: ReducerManagerDispatcher,
        protected router: Router,
        private widgetDetailActions: WidgetDetailActions
    ) {
        super(router);

        this.requestSelectAiTabState = this.store.select(state => additionalInformationReducer.getAdditionalInformationState(state, this.ofModule.moduleNameTrim).requestSelectAiTab);
        this.layoutInfoState = this.store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
    }

    ngOnInit() {
        this.subscribeRequestSelectAiTabState();
        this.subscribeRequestResize();
        this.subcribeLayoutInfoState();
        this.getModule();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.getTabListFromGlobalSetting();
        }, 200);
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public selectTab(tab: any) {
        if (tab.Disabled) {
            return;
        }

        const activeTabs = this.tabs.filter(p => p.Active);
        activeTabs.forEach(_tab => {
            _tab.Active = false;
        });
        tab.Active = true;
        tab.Loaded = true;

        this.store.dispatch(this.additionalInformationActions.selectAdditionalInformationTab(tab, this.ofModule));
    }

    private getTabListFromGlobalSetting() {
        this.globalSettingServiceSubscription = this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.tabs = this.buildTabs(this.tabs);

                this.tabs = this.buildTabsFromGlobalSetting(this.tabs, data);

                this.showAddTabButton = !this.isAllTabsVisible(this.tabs);

                this.adjustScrollingArea();
            });
        });
    }

    private buildTabsFromGlobalSetting(tabs: any[], data: GlobalSettingModel[]): any[] {
        if (!data || !data.length) {
            return tabs;
        }
        this.tabListSettings = data.find(x => x.globalName === this.globalSettingAIName);
        if (!this.tabListSettings || !this.tabListSettings.idSettingsGlobal) {
            return tabs;
        }
        const tabShowSetting = JSON.parse(this.tabListSettings.jsonSettings) as Array<string>;
        if (!tabShowSetting || !tabShowSetting.length) {
            return tabs;
        }

        const activeTabs = this.tabs.filter(p => p.Active);
        activeTabs.forEach(tab => {
            tab.Visible = false;
        });
        for (const tab of tabs) {
            for (const settingTab of tabShowSetting) {
                if (tab.TabID === settingTab) {
                    tab.Visible = true;
                }
            }
        }

        return tabs;
    }

    private buildTabs(tabs) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i]['Active'] = i === 0;
            tabs[i]['Loaded'] = i === 0;
            tabs[i]['Visible'] = i === 0;
            tabs[i]['Removable'] = i !== 0;
        }

        return tabs;
    }

    private isAllTabsVisible(tabs) {
        if (!tabs || !tabs.length) {
            return true;
        }

        for (const tab of tabs) {
            if (!tab['Visible']) {
                return false;
            }
        }

        return true;
    }

    private isAllTabsInactive(tabs) {
        if (!tabs || !tabs.length) {
            return true;
        }

        for (const tab of tabs) {
            if (tab['Active']) {
                return false;
            }
        }

        return true;
    }

    public dropdownItemClickedHandler(tab) {
        const clickedTab = this.tabs.find(t => t.TabID === tab.TabID);
        if (clickedTab) {
            clickedTab['Visible'] = true;

            if (this.isAllTabsInactive(this.tabs)) {
                clickedTab['Active'] = true;
                clickedTab['Loaded'] = true;
            }

            this.showAddTabButton = !this.isAllTabsVisible(this.tabs);

            this.reloadAndSaveTabsConfig();
            setTimeout(() => {
                this.adjustScrollingArea();
            }, 200);
        }
    }

    private reloadAndSaveTabsConfig() {
        this.globalSettingServiceSubscription = this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.saveTabsConfig(data);
            });
        });
    }

    private saveTabsConfig(data: GlobalSettingModel[]) {
        //this.tabListSettings = data.find(x => x.globalName === this.globalSettingAIName);
        if (!this.tabListSettings || !this.tabListSettings.idSettingsGlobal || !this.tabListSettings.globalName) {
            this.tabListSettings = new GlobalSettingModel({
                globalName: this.globalSettingAIName,
                description: 'Additional Information Tabs Show',
                globalType: this.globalSettingConstant.additionalInformationTabShow
            });
        }
        this.tabListSettings.idSettingsGUI = this.ofModule.idSettingsGUI;
        const visibleTabs = this.tabs.filter(t => t.Visible === true);
        this.tabListSettings.jsonSettings = JSON.stringify(this.getShowTabsNameToList(visibleTabs));
        this.tabListSettings.isActive = true;

        this.globalSettingServiceSubscription = this.globalSettingService.saveGlobalSetting(this.tabListSettings).subscribe(
            _data => this.saveTabsConfigSuccess(_data),
            error => this.saveTabsConfigError(error));
    }

    private getShowTabsNameToList(tabs: any[]): Array<string> {
        const result: Array<string> = [];
        for (const item of tabs) {
            result.push(item.TabID);
        }
        return result;
    }

    private saveTabsConfigSuccess(data: any) {
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.tabListSettings, data);
    }

    private saveTabsConfigError(error) {
        console.log(error);
    }

    public removeTab(tab: any) {
        if (tab) {
            if (!this.tabs.length || this.tabs.length === 1) {
                return;
            }

            tab['Visible'] = false;
            tab['Active'] = false;

            this.selectFirstVisibleTab(this.tabs);
            this.showAddTabButton = !this.isAllTabsVisible(this.tabs);

            this.reloadAndSaveTabsConfig();
        }
    }

    private selectFirstVisibleTab(tabs) {
        if (!tabs || !tabs.length) {
            return true;
        }

        for (const tab of tabs) {
            if (tab['Visible']) {
                this.selectTab(tab);
                return;
            }
        }
    }

    private getModule() {
        this.globalSettingAIName = uti.String.Format('{0}_{1}',
            this.globalSettingConstant.additionalInformationTabShow,
            uti.String.hardTrimBlank(this.ofModule.moduleName));
    }

    private subscribeRequestSelectAiTabState() {
        this.requestSelectAiTabStateSubscription = this.requestSelectAiTabState.subscribe((requestSelectAiTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (requestSelectAiTabState) {
                    const selectedTab = this.tabs.find(t => t.TabID === requestSelectAiTabState.aiTabId);
                    if (selectedTab) {
                        setTimeout(() => {
                            this.selectTab(selectedTab);
                        }, 500);
                    }
                }
            });
        });
    }

    private subscribeRequestResize() {
        this.requestResizeSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === AdditionalInformationActions.REQUEST_RESIZE && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
                })
            ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.onWindowResize(null);
            });
        });
    }

    private subcribeLayoutInfoState() {
        this.layoutInfoStateSubscription = this.layoutInfoState.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.tabContainerStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px
                    'height': `calc(100vh - ${layoutInfo.headerHeight}px
                                - ${layoutInfo.smallHeaderLineHeight}px                                
                                - ${layoutInfo.additionalInfoHeaderHeight}px
                                - ${layoutInfo.smallTabHeaderHeight}px
                                - ${layoutInfo.dashboardPaddingTop}px)
                              `
                };
            });
        });
    }

    private getLeftPos() {
        return $('.ai-tab-summary-list', this._eref.nativeElement).position().left;
    }

    private widthOfList() {
        let itemsWidth = 0;
        $('.ai-tab-summary-list li', this._eref.nativeElement).each(function () {
            const itemWidth = $(this).outerWidth();
            itemsWidth += itemWidth;
        });
        return itemsWidth;
    }

    public adjustScrollingArea() {
        if (!$('.ai-tab-summary-wrapper', this._eref.nativeElement).length) {
            return;
        }

        if ($('.ai-tab-summary-wrapper', this._eref.nativeElement).outerWidth() + $('.ai-tab-summary-list', this._eref.nativeElement).position().left * (-1) > this.widthOfList()) {
            $('.ai-scroller-right', this._eref.nativeElement).hide();
        } else {
            $('.ai-scroller-right', this._eref.nativeElement).show();
        }

        if (this.getLeftPos() < 0) {
            $('.ai-scroller-left', this._eref.nativeElement).show();
        } else {
            $('.ai-tab-summary-list', this._eref.nativeElement).animate({ left: '-=' + this.getLeftPos() + 'px' }, 'fast');
            $('.ai-scroller-left', this._eref.nativeElement).hide();
        }
    }

    private widthOfItem() {
        return $('.ai-tab-summary-list li', this._eref.nativeElement).outerWidth();
    }

    private widthOfMainContainer() {
        return $('app-xn-ai-tab div.ai-tab-header-container').width();
    }

    private maxScrollLeftItems() {
        return $('.ai-tab-summary-list li', this._eref.nativeElement).length - Math.floor(this.widthOfMainContainer() / this.widthOfItem());
    }
    private scrollNo = 0;
    public scrollerLeftClick(event) {
        $('.ai-scroller-right', this._eref.nativeElement).fadeIn('slow');

        if (this.scrollNo >= 0)
            return;

        this.scrollNo++;
        $('.ai-tab-summary-list', this._eref.nativeElement).animate({ left: '+=' + this.widthOfItem() + 'px' }, 'fast', function () { });

        setTimeout(() => {
            if (this.getLeftPos() === 0) {
                $('.ai-scroller-left', this._eref.nativeElement).hide();

                if ($('.ai-tab-summary-wrapper', this._eref.nativeElement).outerWidth() < this.widthOfList()) {
                    $('.ai-scroller-right', this._eref.nativeElement).show();
                } else {
                    $('.ai-scroller-right', this._eref.nativeElement).hide();
                }
            }
        }, 300);
    }

    private widthOfVisible() {
        return this.widthOfList() - this.numberOfHiddenItems() * this.widthOfItem();
    }

    private numberOfHiddenItems() {
        if (parseInt($('.ai-tab-summary-list').get(0).style.left) < 0) {
            return (parseInt($('.ai-tab-summary-list').get(0).style.left) * -1) / this.widthOfItem();
        }

        return parseInt($('.ai-tab-summary-list').get(0).style.left) / this.widthOfItem();
    }

    public scrollerRightClick(event) {
        $('.ai-scroller-left', this._eref.nativeElement).fadeIn('slow');

        if (Math.abs(this.scrollNo) >= this.maxScrollLeftItems())
            return;

        this.scrollNo--;
        $('.ai-tab-summary-list', this._eref.nativeElement).animate({ left: '-=' + this.widthOfItem() + 'px' }, 'fast', function () { });

        setTimeout(() => {
            if (this.getLeftPos() < 0) {
                if ($('.ai-tab-summary-wrapper', this._eref.nativeElement).outerWidth() + $('.ai-tab-summary-list', this._eref.nativeElement).position().left * (-1) > this.widthOfList()) {
                    $('.ai-scroller-right', this._eref.nativeElement).hide();
                } else {
                    $('.ai-scroller-right', this._eref.nativeElement).show();
                }
            }
        }, 300);
    }

    public onWindowResize(event) {
        setTimeout(() => {
            if ($('.ai-scroller-left', this._eref.nativeElement).is(':visible') && this.widthOfMainContainer() - this.widthOfVisible() >= this.widthOfItem()) {
                if (this.numberOfHiddenItems() > 1) {
                    for (let i = 0; i < this.numberOfHiddenItems(); i++) {
                        ((index, numberOfHiddenItems) => {
                            $('.scroller-left', this._eref.nativeElement).click();

                            if (index == numberOfHiddenItems - 1) {
                                setTimeout(() => {
                                    this.adjustScrollingArea();
                                }, 1500);
                            }
                        })(i, this.numberOfHiddenItems());
                    }
                } else {
                    $('.ai-scroller-left', this._eref.nativeElement).click();
                    setTimeout(() => {
                        this.adjustScrollingArea();
                    }, 300);
                }
            } else {
                this.adjustScrollingArea();
            }
        }, 300);
    }

    public itemsTrackBy(index, item) {
        return item ? item.TabID : undefined;
    }

    public refreshTab(tabz) {
        this.store.dispatch(this.widgetDetailActions.requestRefreshWidgetsInTab(tabz.TabID, this.ofModule));
    }
}
