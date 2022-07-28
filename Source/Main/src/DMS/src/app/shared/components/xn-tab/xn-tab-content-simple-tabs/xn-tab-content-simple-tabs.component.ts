import { Component, Input, Output, ElementRef, AfterViewInit, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import {
    ModuleSettingActions,
    LayoutInfoActions,
    TabSummaryActions,
    GridActions,
    CustomAction
} from '@app/state-management/store/actions';
import { AppErrorHandler, HotKeySettingService } from '@app/services';
import { SimpleTabModel, HotKeySetting } from '@app/models';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import isNil from 'lodash-es/isNil';
import { Uti } from '@app/utilities';
import { XnTabPageViewComponent } from '@app/shared/components/xn-central-page/xn-tab-page-view';
import { Configuration } from '@app/app.constants';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'xn-tab-content-simple-tabs',
    styleUrls: ['./xn-tab-content-simple-tabs.component.scss'],
    templateUrl: './xn-tab-content-simple-tabs.component.html',
})
export class XnTabContentSimpleTabsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public isSelectionProject: boolean = false;
    public simpleTabs: SimpleTabModel[] = [];
    public perfectScrollbarConfig: Object = {};
    public contentStyle: Object = {};

    private layoutInfoModelSubscription: Subscription;
    private requestSelectSimpleTabStateSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;

    @Input() config: any;
    @Input() globalProperties: any[] = [];
    @Input() set data(data: any) {
        if (data['SimpleTabs']) {
            this.simpleTabs = data['SimpleTabs'];

            this.simpleTabs.forEach(tab => {
                tab.TabID = tab.TabID.split(' ').join('');
            });

            if (this.simpleTabs.length) {
                const curActiveTab = this.simpleTabs.find(tab => tab.Active == true);
                if (!curActiveTab) {
                    this.selectTab(this.simpleTabs[0]);
                } else {
                    this.selectTab(curActiveTab);
                }
            }
        }
    }
    @Input() isActivated;
    @Input() tabID: string;
    @Input() isSplitterDragging;

    @Output() onFormChanged: EventEmitter<any> = new EventEmitter();

    constructor(
        private _eref: ElementRef,
        private store: Store<AppState>,
        private moduleSettingActions: ModuleSettingActions,
        private layoutInfoActions: LayoutInfoActions,
        private tabSummaryActions: TabSummaryActions,
        private appErrorHandler: AppErrorHandler,
        private gridActions: GridActions,
        public hotKeySettingService: HotKeySettingService,
        private dispatcher: ReducerManagerDispatcher,
        private ref: ChangeDetectorRef,
        protected router: Router
    ) {
        super(router);

        this.layoutInfoModel = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
    }

    ngOnInit() {
        this.isSelectionProject = Configuration.PublicSettings.isSelectionProject;

        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
        this.subscribeLayoutInfoModel();
        this.subcribeRequestSelectSimpleTabState();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.adjustScrollingArea();
        });

        //If in view [isActivated] = "simpleTab.Active" -> must uncomment the below code
        if (this.isSelectionProject)
            this.initXnTabPageViewChanges();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public onChanged(data) {
        if (data) {
            this.onFormChanged.emit(data);
        }
    }

    //#region Prcess For XnTabPageViewChanges

    @ViewChildren('xnTabPageViewCtrl')
    private xnTabPageViewCtrls: QueryList<XnTabPageViewComponent>;
    private xnTabPageViewSubscription: Subscription;

    private initXnTabPageViewChanges() {
        if (this.xnTabPageViewCtrls.length == this.simpleTabs.length) {
            this.prcessForXnTabPageViewChanges();
        }
        this.xnTabPageViewSubscription = this.xnTabPageViewCtrls.changes.subscribe(() => {
            if (this.xnTabPageViewCtrls.length == this.simpleTabs.length) {
                this.prcessForXnTabPageViewChanges();
            }
        });
    }

    private prcessForXnTabPageViewChanges() {
        setTimeout(() => {
            //force load all tabs
            this.xnTabPageViewCtrls.forEach(tabCtrl => {
                tabCtrl.isActivated = true
            });

            //Set the 'isActivated' = true for the 'active' simpleTab and set false for the remainings
            setTimeout(() => {
                this.processForActiveSimpleTab();
            }, 100);

        }, 500);
    }

    private processForActiveSimpleTab(tab?: SimpleTabModel) {
        if (!this.xnTabPageViewCtrls || !this.xnTabPageViewCtrls.length) return;

        const activeSimpleTab = tab || this.simpleTabs.find(item => item.Active);
        this.xnTabPageViewCtrls.forEach(tabCtrl => {
            tabCtrl.isActivated = activeSimpleTab.TabID == tabCtrl.tabPageView['TabID'];
        });
    }

    //#endregion

    private subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                if (layoutInfo) {
                    this.contentStyle = {
                        // height: `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px - ${layoutInfo.simpleTabHeight}px)`
                        height: `calc(100vh - ${layoutInfo.headerHeight}px -
                                              ${this.ofModule.idSettingsGUI != 43 ? layoutInfo.tabHeaderHeight : layoutInfo.tabHeaderBigSizeHeight}px -
                                              ${layoutInfo.smallHeaderLineHeight}px -
                                              ${layoutInfo.dashboardPaddingTop}px -
                                              ${layoutInfo.simpleTabHeight}px)`
                    };
                }
            });
        });
    }

    private subcribeRequestSelectSimpleTabState() {
        this.requestSelectSimpleTabStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabSummaryActions.REQUEST_SELECT_SIMPLE_TAB && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            }),
            map((action: CustomAction) => {
                return action.payload;
            })
        ).subscribe((simpleTabID: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!isNil(simpleTabID)) {
                    let simpleTab: any;
                    if (typeof simpleTabID === 'string') {
                        //get tab by ID
                        simpleTab = this.simpleTabs.find(tab => tab.TabID == simpleTabID);

                    } else if (typeof simpleTabID === 'number') {
                        //get tab by Index
                        simpleTab = this.simpleTabs[simpleTabID];
                    }

                    if (simpleTab) {
                        this.selectTab(simpleTab);
                    }
                }
            });
        });
    }

    public selectTab(tab: SimpleTabModel) {
        if (tab.Disabled) return;

        const activeTabs = this.simpleTabs.filter(p => p.Active);
        activeTabs.forEach(_tab => {
            _tab.Active = false;
        });
        tab.Active = true;
        tab.Loaded = true;
        tab.ParentTabID = this.tabID;
        //this.processForActiveSimpleTab(tab);

        if (tab.Toolbar)
            this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(tab.Toolbar, this.ofModule));

        // this.store.dispatch(this.layoutInfoActions.resizeSplitter(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.selectSimpleTab(tab, this.ofModule));

        if (this.isSelectionProject) {
            this.store.dispatch(this.gridActions.requestInvalidate(this.ofModule));
        }

        this.ref.detectChanges();
    }

    private getLeftPos() {
        return $('.simple-tab-summary-list', this._eref.nativeElement).position().left;
    }

    private widthOfList() {
        let itemsWidth = 0;
        $('.simple-tab-summary-list li', this._eref.nativeElement).each(function () {
            const itemWidth = $(this).outerWidth();
            itemsWidth += itemWidth;
        });
        return itemsWidth;
    }

    public adjustScrollingArea() {
        if (!$('.simple-tab-summary-wrapper', this._eref.nativeElement).length) {
            return;
        }

        if (($('.simple-tab-summary-wrapper', this._eref.nativeElement).outerWidth()) < this.widthOfList()) {
            $('.simple-scroller-right', this._eref.nativeElement).show();
        } else {
            $('.simple-scroller-right', this._eref.nativeElement).hide();
        }

        if (this.getLeftPos() < 0) {
            $('.simple-scroller-left', this._eref.nativeElement).show();
        } else {
            $('.simple-tab-summary-list', this._eref.nativeElement).animate({ left: '-=' + this.getLeftPos() + 'px' }, 'fast');
            $('.simple-scroller-left', this._eref.nativeElement).hide();
        }
    }

    private widthOfItem() {
        return $('.simple-tab-summary-list li', this._eref.nativeElement).outerWidth();
    }

    private widthOfMainContainer() {
        return $('xn-tab-content-simple-tabs div.simple-tab-header-container').width();
    }

    private maxScrollLeftItems() {
        return $('.simple-tab-summary-list li', this._eref.nativeElement).length - Math.floor(this.widthOfMainContainer() / this.widthOfItem());
    }
    private scrollNo = 0;
    public scrollerLeftClick(event) {
        $('.simple-scroller-right', this._eref.nativeElement).fadeIn('slow');

        if (this.scrollNo >= 0)
            return;

        this.scrollNo++;
        $('.simple-tab-summary-list', this._eref.nativeElement).animate({ left: '+=' + this.widthOfItem() + 'px' }, 'fast', function () { });

        setTimeout(() => {
            if (this.getLeftPos() === 0) {
                $('.simple-scroller-left', this._eref.nativeElement).hide();

                if ($('.simple-tab-summary-wrapper', this._eref.nativeElement).outerWidth() < this.widthOfList()) {
                    $('.simple-scroller-right', this._eref.nativeElement).show();
                } else {
                    $('.simple-scroller-right', this._eref.nativeElement).hide();
                }
            }
        }, 300);
    }

    private widthOfVisible() {
        return this.widthOfList() - this.numberOfHiddenItems() * this.widthOfItem();
    }

    private numberOfHiddenItems() {
        if (parseInt($('.simple-tab-summary-list').get(0).style.left) < 0) {
            return (parseInt($('.simple-tab-summary-list').get(0).style.left) * -1) / this.widthOfItem();
        }

        return parseInt($('.simple-tab-summary-list').get(0).style.left) / this.widthOfItem();
    }

    public scrollerRightClick(event) {
        $('.simple-scroller-left', this._eref.nativeElement).fadeIn('slow');

        if (Math.abs(this.scrollNo) >= this.maxScrollLeftItems())
            return;

        this.scrollNo--;
        $('.simple-tab-summary-list', this._eref.nativeElement).animate({ left: '-=' + this.widthOfItem() + 'px' }, 'fast', function () { });

        setTimeout(() => {
            if (this.getLeftPos() < 0) {
                if ($('.simple-tab-summary-wrapper', this._eref.nativeElement).outerWidth()
                    + $('.simple-tab-summary-list', this._eref.nativeElement).position().left * (-1) > this.widthOfList()) {
                    $('.simple-scroller-right', this._eref.nativeElement).hide();
                } else {
                    $('.simple-scroller-right', this._eref.nativeElement).show();
                }
            }
        }, 300);
    }

    public onWindowResize(event) {
        setTimeout(() => {
            if ($('.simple-scroller-left', this._eref.nativeElement).is(':visible') && this.widthOfMainContainer() - this.widthOfVisible() >= this.widthOfItem()) {
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
                    $('.simple-scroller-left', this._eref.nativeElement).click();
                    setTimeout(() => {
                        this.adjustScrollingArea();
                    }, 300);
                }
            } else {
                this.adjustScrollingArea();
            }
        }, 300);
    }
}
