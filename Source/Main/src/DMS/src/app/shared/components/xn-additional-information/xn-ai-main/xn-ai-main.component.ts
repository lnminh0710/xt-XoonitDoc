import { Component, OnInit, Input, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdditionalInfromationMainModel, GlobalSettingModel, Module } from '@app/models';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AdditionalInformationActions,
    DocumentThumbnailActions,
    GridActions,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { Observable, Subscription } from 'rxjs';
import { PageSize } from '@app/app.constants';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { GlobalSettingService } from '@app/services';
import { GlobalSettingConstant } from '@app/app.constants';
import { AppErrorHandler } from '@app/services';
import * as uti from '@app/utilities';
import { XnAdditionalInformationTabComponent } from '../xn-ai-tab';
import { BaseComponent } from '@app/pages/private/base';
import * as additionalInformationReducer from '@app/state-management/store/reducer/additional-information';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { ResizeEvent } from 'angular-resizable-element';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { filter } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';

@Component({
    selector: 'app-xn-ai-main',
    styleUrls: ['./xn-ai-main.component.scss'],
    templateUrl: './xn-ai-main.component.html',
})
export class XnAdditionalInformationMainComponent extends BaseComponent implements OnInit, OnDestroy {
    public IconNamesEnum = IconNames;
    public additionalInformation: AdditionalInfromationMainModel;
    public additionalInformationOn = true;
    private localConfig: any;
    private currentWidth: any = { left: 0, right: 0, spliter: 0 };
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private editingWidgetsStateSubscription: Subscription;
    private getGlobalSettingSubcirbe: Subscription;
    public editingWidgetStatus = false;
    private currentGlobalSettingModel: any;
    private showAIPaneState: Observable<any>;
    private showAIPaneStateSubscription: Subscription;
    private layoutInfoState: Observable<SubLayoutInfoState>;
    private layoutInfoStateSubscription: Subscription;
    private totalImageSubscription: Subscription;
    private isStoredSessionSize = false;
    public collapseExpandStyle: any;
    public panelStyle: { width: string; originalWidth: string } = {
        width: null,
        originalWidth: null,
    };
    public pinned = false;
    public singlePageContainerStyle = {};
    public totalImage: number = 0;
    public ofModuleLocal: Module;

    @Input()
    set data(data: AdditionalInfromationMainModel) {
        this.additionalInformation = data;
    }
    @Input()
    set config(data: any) {
        this.localConfig = data;
    }
    @Input()
    set configWidth(data: any) {
        this.currentWidth = data;
    }

    @ViewChild(XnAdditionalInformationTabComponent)
    xnAdditionalInformationTabComponent: XnAdditionalInformationTabComponent;

    //@HostListener('document:mousedown.out-zone', ['$event'])
    //documentClick($event) {
    //    this.onDocumentClick($event);
    //}

    constructor(
        private elementRef: ElementRef,
        private store: Store<AppState>,
        private pageSize: PageSize,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private appErrorHandler: AppErrorHandler,
        private gridActions: GridActions,
        private additionalInformationActions: AdditionalInformationActions,
        private layoutInfoActions: LayoutInfoActions,
        protected router: Router,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private documentAction: DocumentThumbnailActions,
    ) {
        super(router);

        this.ofModuleLocal = this.ofModule;

        this.editingWidgetsState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets,
        );
        this.showAIPaneState = store.select(
            (state) =>
                additionalInformationReducer.getAdditionalInformationState(state, this.ofModule.moduleNameTrim)
                    .showAIPane,
        );
        this.layoutInfoState = this.store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
    }

    ngOnInit() {
        this.setCollapseExpandStyle(0);
        this.setAISessionSize();
        this.subscription();
        setTimeout(() => {
            this.getConfig();
        }, 200);
    }

    ngOnDestroy() {
        uti.Uti.unsubscribe(this);
    }

    private setCollapseExpandStyle(opactiy: any) {
        this.collapseExpandStyle = {
            opacity: opactiy,
        };
    }

    private subscription() {
        this.subscribeWidgetState();
        this.subscribeShowAIPaneState();
        this.subcribeLayoutInfoState();
        this.subscribeTotalImageState();
    }

    private subscribeWidgetState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe(
            (editingWidgets: Array<EditingWidget>) => {
                this.appErrorHandler.executeAction(() => {
                    if (editingWidgets && this.additionalInformation) {
                        this.editingWidgetStatus = false;
                        if (this.additionalInformation.SimpleTabs) {
                            this.additionalInformation.SimpleTabs.forEach((tab) => {
                                if (tab.TabContent.Page) {
                                    const rs = editingWidgets.filter((p) => p.pageId === tab.TabContent.Page.PageId);
                                    if (rs && rs.length > 0) {
                                        this.editingWidgetStatus = true;
                                    }
                                }
                            });
                        } else if (this.additionalInformation.Page) {
                            const rs = editingWidgets.filter(
                                (p) => p.pageId === this.additionalInformation.Page.PageId,
                            );
                            if (rs && rs.length > 0) {
                                this.editingWidgetStatus = true;
                            }
                        }
                    }
                });
            },
        );
    }

    private subcribeLayoutInfoState() {
        this.layoutInfoStateSubscription = this.layoutInfoState.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.singlePageContainerStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px
                    height: `calc(100vh - ${layoutInfo.headerHeight}px
                                - ${layoutInfo.smallHeaderLineHeight}px                                
                                - ${layoutInfo.additionalInfoHeaderHeight}px                                
                                - ${layoutInfo.dashboardPaddingTop}px)
                              `,
                };
            });
        });
    }

    private subscribeTotalImageState() {
        this.totalImageSubscription = this.administrationDocumentSelectors.totalImage$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                try {
                    this.totalImage = data;
                } catch (error) {
                    console.log(error);
                }
            });
    }

    private setAISessionSize() {
        setTimeout(() => {
            const spliters = $('.as-split-gutter');
            const lastSpliter = $(spliters[spliters.length - 1]);
            if (!lastSpliter || !lastSpliter.length) {
                this.setAISessionSize();
                return;
            }
            const leftSize = $('.xn__tab-content__split').innerWidth();
            const rightSize = $('.additional-information__split').innerWidth();
            if (!leftSize && !rightSize) {
                this.setAISessionSize();
                return;
            }
            const splitSize = 5; // lastSpliter.innerWidth();
            this.currentWidth.spliter = splitSize;
            const totalSize = leftSize + rightSize + splitSize;
            this.currentWidth.left = ((leftSize + splitSize / 2) * 100) / totalSize;
            this.currentWidth.right = ((rightSize + splitSize / 2) * 100) / totalSize;
            lastSpliter.dblclick(() => {
                this.showPanelClick(this.additionalInformationOn);
            });
            this.isStoredSessionSize = true;
        }, 50);
    }

    private subscribeShowAIPaneState() {
        this.showAIPaneStateSubscription = this.showAIPaneState.subscribe((showAIPaneState: any) => {
            this.appErrorHandler.executeAction(() => {
                // tslint:disable-next-line:triple-equals
                if (showAIPaneState && this.additionalInformationOn != showAIPaneState.showPanel) {
                    this.showPanelClick(null, true);
                }
            });
        });
    }

    public reload(event) {
        event.preventDefault();
        event.stopPropagation();
        this.store.dispatch(this.documentAction.reloadDocument());
    }

    private getConfig() {
        this.getGlobalSettingSubcirbe = this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe(
                (data) => this.getAllGlobalSettingSuccess(data),
                (error) => this.serviceError(error),
            );
    }

    private getAllGlobalSettingSuccess(data: GlobalSettingModel[]) {
        if (!data || !data.length) {
            this.setCollapseExpandStyle(1);
            this.showPane(true);
            return;
        }

        //this.pinned = this.getCurrentPinState(data);
        //this.panelStyle.width = this.getPanelWidth(data);
        //this.panelStyle.originalWidth = this.panelStyle.width;
        //this.showPane(this.getCurrentExpandCollapse(data));

        const additionalInformationOn = this.getCurrentExpandCollapse(data);
        this.showPane(!additionalInformationOn);
    }
    private serviceError(error) {
        console.log(error);
    }

    private getCurrentExpandCollapse(data: GlobalSettingModel[]): boolean {
        this.currentGlobalSettingModel = data.find((x) => x.globalName === this.getSettingAIExpandCollapseName());
        if (!this.currentGlobalSettingModel || !this.currentGlobalSettingModel.idSettingsGlobal) {
            return this.additionalInformationOn;
        }
        const sessionShowSetting = JSON.parse(this.currentGlobalSettingModel.jsonSettings);
        return sessionShowSetting && sessionShowSetting.IsExpand;
    }

    private getCurrentPinState(data: GlobalSettingModel[]): boolean {
        let additionalInformationPinned = data.find(
            (x) => x.globalName === this.globalSettingConstant.additionalInformationPinned,
        );
        if (!additionalInformationPinned || !additionalInformationPinned.idSettingsGlobal) {
            return this.pinned;
        }
        const isPinnedData = JSON.parse(additionalInformationPinned.jsonSettings);
        return isPinnedData && isPinnedData.IsPinned;
    }

    private getPanelWidth(data: GlobalSettingModel[]): string {
        let additionalInformationPanelWidth = data.find(
            (x) => x.globalName === this.globalSettingConstant.additionalInformationPanelWidth,
        );
        if (!additionalInformationPanelWidth || !additionalInformationPanelWidth.idSettingsGlobal) {
            return '300px';
        }
        const panelWidth = JSON.parse(additionalInformationPanelWidth.jsonSettings);
        return panelWidth ? panelWidth.Width : '300px';
    }

    private reloadAndSaveExpandConfig() {
        this.getGlobalSettingSubcirbe = this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.saveExpandConfig(data);
                });
            });
    }

    private saveExpandConfig(data: GlobalSettingModel[]) {
        if (
            !this.currentGlobalSettingModel ||
            !this.currentGlobalSettingModel.idSettingsGlobal ||
            !this.currentGlobalSettingModel.globalName
        ) {
            this.currentGlobalSettingModel = new GlobalSettingModel({
                globalName: this.getSettingAIExpandCollapseName(),
                description: 'Additional Information Session Show',
                globalType: this.globalSettingConstant.additionalInformationSessionShow,
            });
        }
        this.currentGlobalSettingModel.idSettingsGUI = this.ofModule.idSettingsGUI;
        this.currentGlobalSettingModel.jsonSettings = JSON.stringify({ IsExpand: this.additionalInformationOn });
        this.currentGlobalSettingModel.isActive = true;

        this.getGlobalSettingSubcirbe = this.globalSettingService
            .saveGlobalSetting(this.currentGlobalSettingModel)
            .subscribe(
                (_data) => this.saveExpandConfigSuccess(_data),
                (error) => this.serviceError(error),
            );
    }

    private saveExpandConfigSuccess(data: any) {
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.currentGlobalSettingModel, data);
    }

    private getSettingAIExpandCollapseName() {
        return uti.String.Format(
            '{0}_{1}',
            this.globalSettingConstant.additionalInformationSessionShow,
            uti.String.hardTrimBlank(this.ofModule.moduleName),
        );
    }

    public showPanelClick(event: any, force?) {
        //if (!force && this.pinned && this.additionalInformationOn) {
        //    return;
        //}

        //if (force && this.pinned) {
        //    this.togglePinPanel(null);
        //}

        ////this.reCalculateSize(this.additionalInformationOn);
        //this.additionalInformationOn = !this.additionalInformationOn;
        //this.reloadAndSaveExpandConfig();
        //this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
        //// this.store.dispatch(this.layoutInfoActions.resizeSplitter());

        //if (this.additionalInformationOn) {
        //    this.panelStyle.width = this.panelStyle.originalWidth || '300px';
        //} else {
        //    this.panelStyle.width = null;
        //}

        //this.store.dispatch(this.additionalInformationActions.setCurrentState(this.additionalInformationOn, this.ofModule));
        //this.store.dispatch(this.layoutInfoActions.setRightMenuWidth(this.pinned ? '' + parseInt(this.panelStyle.width) : '0', this.ofModule));
        this.store.dispatch(
            this.additionalInformationActions.requestOpenAiTab(!this.additionalInformationOn, this.ofModule),
        );
        this.reCalculateSize(this.additionalInformationOn);
        this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('', this.ofModule));
        this.reloadAndSaveExpandConfig();
        this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
    }

    // private getTabStored: Observable<any>;
    public showPane(additionalInformationOn: boolean) {
        setTimeout(() => {
            //this.additionalInformationOn = additionalInformationOn;
            //this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
            //if (this.additionalInformationOn) {
            //    this.panelStyle.width = this.panelStyle.originalWidth || '300px';
            //} else {
            //    this.panelStyle.width = null;
            //}

            //this.store.dispatch(this.additionalInformationActions.setCurrentState(this.additionalInformationOn, this.ofModule));
            //this.store.dispatch(this.layoutInfoActions.setRightMenuWidth(this.pinned ? '' + parseInt(this.panelStyle.width) : '0', this.ofModule));

            this.reCalculateSize(additionalInformationOn);
        }, 50);
    }

    public reCalculateSize(additionalInformationOn?: boolean) {
        additionalInformationOn = additionalInformationOn || false;
        const spliters = $('.as-split-gutter');
        const lastSpliter = $(spliters[spliters.length - 1]);
        if (!lastSpliter || !lastSpliter.length || !this.isStoredSessionSize) {
            this.showPane(additionalInformationOn);
            return;
        }
        this.additionalInformationOn = !additionalInformationOn;
        const left = $('.xn__tab-content__split');
        const right = $('.additional-information__split');
        if (this.additionalInformationOn) {
            left.css('flex-basis', 'calc(' + this.currentWidth.left + '% - ' + this.currentWidth.spliter / 2 + 'px)');
            right.css('flex-basis', 'calc(' + this.currentWidth.right + '% - ' + this.currentWidth.spliter / 2 + 'px)');
            lastSpliter.show();

            setTimeout(() => {
                if (this.xnAdditionalInformationTabComponent) {
                    this.xnAdditionalInformationTabComponent.adjustScrollingArea();
                }
            }, 200);
        } else {
            //left.css('flex-basis', 'calc(100% - ' + this.pageSize.AdditionalInformationSize + 'px)');
            //right.css('flex-basis', '29px');
            left.css('flex-basis', '100%');
            right.css('flex-basis', '0px');
            lastSpliter.hide();
        }
        this.setCollapseExpandStyle(1);
        this.store.dispatch(this.layoutInfoActions.resizeSplitter(this.ofModule));

        this.store.dispatch(
            this.additionalInformationActions.setCurrentState(this.additionalInformationOn, this.ofModule),
        );
    }

    public setConfigWidth(data: any) {
        this.currentWidth = data;
    }

    public onResizeEnd(event: ResizeEvent) {
        this.panelStyle = {
            width: `${event.rectangle.width}px`,
            originalWidth: `${event.rectangle.width}px`,
        };

        this.store.dispatch(this.layoutInfoActions.setRightMenuWidth(event.rectangle.width + '', this.ofModule));

        this.savePanelWidth();
        this.store.dispatch(
            this.layoutInfoActions.setRightMenuWidth(
                this.pinned ? '' + parseInt(this.panelStyle.width) : '0',
                this.ofModule,
            ),
        );
    }

    public togglePinPanel(e) {
        this.pinned = !this.pinned;

        this.store.dispatch(
            this.layoutInfoActions.setRightMenuWidth(
                this.pinned ? '' + parseInt(this.panelStyle.width) : '0',
                this.ofModule,
            ),
        );

        this.savePinState();
    }

    private savePinState() {
        this.getGlobalSettingSubcirbe = this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    let additionalInformationPinned = data.find(
                        (x) => x.globalName === this.globalSettingConstant.additionalInformationPinned,
                    );

                    if (
                        !additionalInformationPinned ||
                        !additionalInformationPinned.idSettingsGlobal ||
                        !additionalInformationPinned.globalName
                    ) {
                        additionalInformationPinned = new GlobalSettingModel({
                            globalName: this.globalSettingConstant.additionalInformationPinned,
                            description: 'Additional Information Pinned',
                            globalType: this.globalSettingConstant.additionalInformationPinned,
                        });
                    }
                    additionalInformationPinned.idSettingsGUI = this.ofModule.idSettingsGUI;
                    additionalInformationPinned.jsonSettings = JSON.stringify({ IsPinned: this.pinned });
                    additionalInformationPinned.isActive = true;

                    this.getGlobalSettingSubcirbe = this.globalSettingService
                        .saveGlobalSetting(additionalInformationPinned)
                        .subscribe(
                            (data) =>
                                this.globalSettingService.saveUpdateCache(
                                    this.ofModule.idSettingsGUI,
                                    additionalInformationPinned,
                                    data,
                                ),
                            (error) => this.serviceError(error),
                        );
                });
            });
    }

    private savePanelWidth() {
        this.getGlobalSettingSubcirbe = this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    let additionalInformationPanelWidth = data.find(
                        (x) => x.globalName === this.globalSettingConstant.additionalInformationPanelWidth,
                    );

                    if (
                        !additionalInformationPanelWidth ||
                        !additionalInformationPanelWidth.idSettingsGlobal ||
                        !additionalInformationPanelWidth.globalName
                    ) {
                        additionalInformationPanelWidth = new GlobalSettingModel({
                            globalName: this.globalSettingConstant.additionalInformationPanelWidth,
                            description: 'Additional Information Panel Width',
                            globalType: this.globalSettingConstant.additionalInformationPanelWidth,
                        });
                    }
                    additionalInformationPanelWidth.idSettingsGUI = this.ofModule.idSettingsGUI;
                    additionalInformationPanelWidth.jsonSettings = JSON.stringify({ Width: this.panelStyle.width });
                    additionalInformationPanelWidth.isActive = true;

                    this.getGlobalSettingSubcirbe = this.globalSettingService
                        .saveGlobalSetting(additionalInformationPanelWidth)
                        .subscribe(
                            (data) =>
                                this.globalSettingService.saveUpdateCache(
                                    this.ofModule.idSettingsGUI,
                                    additionalInformationPanelWidth,
                                    data,
                                ),
                            (error) => this.serviceError(error),
                        );
                });
            });
    }

    //public onDocumentClick(event) {
    //    if (!this.elementRef.nativeElement.contains(event.target) && this.additionalInformationOn) {
    //        this.showPanelClick(event);
    //    }
    //}
}
