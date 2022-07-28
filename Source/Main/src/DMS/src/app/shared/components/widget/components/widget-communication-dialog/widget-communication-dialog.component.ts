import {
    Component, Input, Output,
    EventEmitter, OnInit, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { AppErrorHandler } from '@app/services';
import {
    WidgetDetail,
    LayoutPageInfoModel
} from '@app/models';
import { WidgetUtils } from '../../utils';
import * as commonReducer from '@app/state-management/store/reducer/xn-common';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { WidgetDetailActions } from '@app/state-management/store/actions';

/**
 * IWidgetInfo
 */
export interface IWidgetInfo {
    id: string;
    title: string;
}

/**
 * ICommunicationWidget
 */
export interface ICommunicationWidget {
    // Widget to define an connection
    srcWidgetDetail: WidgetDetail;

    // Parent widget infos that can be connected to srcWidgetDetail
    relatingWidgetInfos: Array<IWidgetInfo>;

    // Children widget infos that can be connected to srcWidgetDetail
    childrenRelatingWidgetInfos: Array<IWidgetInfo>;

    // Check the widget with the same type need to sync.
    sameTypeWidgetInfos?: Array<IWidgetInfo>;

    // Check the chart widget with table need to sync.
    chartLinkTableInfos?: Array<IWidgetInfo>;

    // Flag to define if srcWidgetDetail can connect to Parked Item
    isConnectToMainSupport: boolean;
}

@Component({
    selector: 'widget-communication-dialog',
    styleUrls: ['./widget-communication-dialog.component.scss'],
    templateUrl: './widget-communication-dialog.component.html'
})
export class WidgetCommunicationDialogComponent extends BaseComponent implements OnInit, OnDestroy {

    @Input() communicationWidgetInfo: ICommunicationWidget;
    @Output() onSuccessLinkingWidget = new EventEmitter<WidgetDetail>();

    public showDialog = true;
    private parentSelectedEntry: IWidgetInfo;
    private childSelectedEntry: IWidgetInfo;
    private sameTypeSelectedEntry: IWidgetInfo;
    private chartLinkTableEntry: IWidgetInfo;
    private connectWithParkedItem = false;
    private layoutPageInfoModelState: Observable<LayoutPageInfoModel[]>;
    private layoutPageInfoModelStateSubscription: Subscription;
    private layoutPageInfo: LayoutPageInfoModel[];

    constructor(
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private widgetUtils: WidgetUtils,
        private widgetDetailActions: WidgetDetailActions,
        protected router: Router
    ) {
        super(router);
        this.layoutPageInfoModelState = store.select(state => commonReducer.getCommonState(state, this.ofModule.moduleNameTrim).layoutPageInfo);
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        this.subscribe();
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    /**
     * subscribe
     */
    public subscribe() {
        this.layoutPageInfoModelStateSubscription = this.layoutPageInfoModelState.subscribe((layoutInfoState: LayoutPageInfoModel[]) => {
            this.appErrorHandler.executeAction(() => {
                this.layoutPageInfo = layoutInfoState;
                if (this.layoutPageInfo && this.layoutPageInfo.length) {
                    if (this.communicationWidgetInfo) {
                        this.updateTitle(this.communicationWidgetInfo.sameTypeWidgetInfos);
                        this.updateTitle(this.communicationWidgetInfo.relatingWidgetInfos);
                    }
                }
            });
        });
    }

    /**
     * updateTitle
     * @param widgetInfos
     */
    private updateTitle(widgetInfos: Array<IWidgetInfo>) {
        if (widgetInfos && widgetInfos.length) {
            widgetInfos.forEach((widgetInfo: IWidgetInfo) => {
                for (let i = 0; i < this.layoutPageInfo.length; i++) {
                    if (this.layoutPageInfo[i] && this.layoutPageInfo[i].widgetboxesTitle && this.layoutPageInfo[i].widgetboxesTitle.length) {
                        let widgetBox = this.layoutPageInfo[i].widgetboxesTitle.find(p => p.id == widgetInfo.id);
                        if (widgetBox) {
                            widgetInfo.title = widgetBox.title;
                            break;
                        }
                    }
                }
            });
        }
    }

    close() {
        this.save();
    }

    save() {
        let isConnected: boolean;
        if (this.parentSelectedEntry) {
            this.widgetUtils.buildListenKeyConfigForWidgetDetail(this.communicationWidgetInfo.srcWidgetDetail, false);
            this.communicationWidgetInfo.srcWidgetDetail.widgetDataType.parentWidgetIds = [this.parentSelectedEntry.id];
            isConnected = true;
            const communicationWidget: ICommunicationWidget = {
                srcWidgetDetail: this.communicationWidgetInfo.srcWidgetDetail,
                childrenRelatingWidgetInfos: null,
                relatingWidgetInfos: [this.parentSelectedEntry],
                isConnectToMainSupport: null,
                sameTypeWidgetInfos: null
            };
            this.store.dispatch(this.widgetDetailActions.setConnectForParentFromChildWidget(communicationWidget, this.ofModule));
        }

        if (this.connectWithParkedItem) {
            this.widgetUtils.buildListenKeyConfigForWidgetDetail(this.communicationWidgetInfo.srcWidgetDetail, true);
            isConnected = true;
        }

        if (this.childSelectedEntry) {
            const communicationWidget: ICommunicationWidget = {
                srcWidgetDetail: this.communicationWidgetInfo.srcWidgetDetail,
                childrenRelatingWidgetInfos: [this.childSelectedEntry],
                relatingWidgetInfos: null,
                isConnectToMainSupport: null,
                sameTypeWidgetInfos: null
            };
            this.store.dispatch(this.widgetDetailActions.setConnectForChildFromParentWidget(communicationWidget, this.ofModule));
            isConnected = true;
        }

        if (this.sameTypeSelectedEntry) {
            this.communicationWidgetInfo.srcWidgetDetail.syncWidgetIds = [this.sameTypeSelectedEntry.id];
            isConnected = true;
            const communicationWidget: ICommunicationWidget = {
                srcWidgetDetail: this.communicationWidgetInfo.srcWidgetDetail,
                childrenRelatingWidgetInfos: null,
                relatingWidgetInfos: null,
                isConnectToMainSupport: null,
                sameTypeWidgetInfos: [this.sameTypeSelectedEntry]
            };
            this.store.dispatch(this.widgetDetailActions.setConnectForSameTypeWidget(communicationWidget, this.ofModule));
        }
        if (this.chartLinkTableEntry) {
            this.communicationWidgetInfo.srcWidgetDetail.syncWidgetIds = [this.chartLinkTableEntry.id];
            const data = this.layoutPageInfo.reduce((total, current) => {

                if (current.widgetboxesTitle.length > 0) {
                    current.widgetboxesTitle.forEach(item => total.push(item))

                }
                return total
            }, []).find(v => v.id === this.chartLinkTableEntry.id);
            this.communicationWidgetInfo.srcWidgetDetail.contentDetail = { ...data.widgetDetail.contentDetail };
            isConnected = true;
            const communicationWidget: ICommunicationWidget = {
                srcWidgetDetail: this.communicationWidgetInfo.srcWidgetDetail,
                childrenRelatingWidgetInfos: null,
                relatingWidgetInfos: null,
                isConnectToMainSupport: null,
                chartLinkTableInfos: [this.chartLinkTableEntry]
            };
            this.store.dispatch(this.widgetDetailActions.setConnectForSameTypeWidget(communicationWidget, this.ofModule));
        }

        if (isConnected) {
            this.onSuccessLinkingWidget.emit(this.communicationWidgetInfo.srcWidgetDetail);
        } else {
            this.onSuccessLinkingWidget.emit(null);
        }

        this.showDialog = false;
    }

    /**
     * connectToMain
     * */
    connectToMain() {
        this.parentSelectedEntry = null;
        this.childSelectedEntry = null;
        this.connectWithParkedItem = true;
    }

    /**
     * connectToParent
     * @param entry
     */
    connectToParent(entry: IWidgetInfo) {
        this.parentSelectedEntry = entry;
        this.childSelectedEntry = null;
        this.connectWithParkedItem = false;
    }

    /**
     * connectToChild
     * @param entry
     */
    connectToChild(entry: IWidgetInfo) {
        this.childSelectedEntry = entry;
        this.parentSelectedEntry = null;
        this.connectWithParkedItem = false;
    }

    /**
     * connectToChild
     * @param entry
     */
    connectToChart(entry: IWidgetInfo) {
        this.chartLinkTableEntry = entry;

    }

    /**
     * onSameTypeSelectionChange
     * @param entry
     */
    onSameTypeSelectionChange(entry: IWidgetInfo) {
        this.sameTypeSelectedEntry = entry;
    }

    public itemsTrackBy(index, item) {
        return item ? item.id : undefined;
    }
}
