import { Component, OnInit, Input, Output, OnDestroy, ViewChild, ChangeDetectorRef, isDevMode } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { CommonService, AppErrorHandler, ModalService, SignalRService } from '@app/services';
import { Uti } from '@app/utilities/uti';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { FakeData } from './fake';
import { SignalRNotifyModel, MessageModel } from '@app/models';
import { SignalRActionEnum, SignalRJobEnum, SystemScheduleServiceName, MessageModal } from '@app/app.constants';
import { ElasticSearchSyncGridComponent } from '../elastic-search-sync-grid';
import { ElasticSearchSyncCommandComponent } from '../elastic-search-sync-command';
import { Subscription } from 'rxjs';

@Component({
    selector: 'elastic-search-sync-main',
    styleUrls: ['./elastic-search-sync-main.component.scss'],
    templateUrl: './elastic-search-sync-main.component.html',
})
export class ElasticSearchSyncMainComponent extends BaseComponent implements OnInit, OnDestroy {
    private fake = new FakeData();
    private syncItem: any = [];
    private syncMode: string = 'All';
    private isCallStart: boolean = false;

    public tabs: Array<any> = [];
    public percentValue: number = 0;
    public isIdle: boolean = true;
    public isGettingData: boolean = false;
    public gettingDataMessage: string;
    public dataSource: any = {
        data: [],
        columns: this.fake.createGridColumns(),
    };

    @Input() searchSyncGridId: string;

    @ViewChild('searchSyncGrid') searchSyncGrid: ElasticSearchSyncGridComponent;
    @ViewChild('searchSyncCommand') searchSyncCommand: ElasticSearchSyncCommandComponent;

    private messageReIndexElasticSearchSubscription: Subscription;

    constructor(
        private _commonService: CommonService,
        private _appErrorHandler: AppErrorHandler,
        private _toasterService: ToasterService,
        private _signalRService: SignalRService,
        private _modalService: ModalService,
        private _ref: ChangeDetectorRef,
        router?: Router,
    ) {
        super(router);
    }

    public ngOnInit() {
        this.listenSignalRMessage();
        this.getData();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public onTabOutputData($event) {
        this.syncItem = $event;
    }

    public onCommandOutput($event) {
        this.syncMode = $event;
    }

    public onCallStart() {
        if (!this.syncItem || !this.syncItem.checkedItems || !this.syncItem.checkedItems.length) {
            this._modalService.warningText('Please select module to synchronize data');
            return;
        }
        this.isCallStart = true;
        this.sendMessage(SignalRActionEnum.ES_ReIndex_Ping);
    }

    public onCallStop() {
        this._modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Stop synchronizing',
                messageType: MessageModal.MessageType.error,
                message: [ { key: '<p>' }, { key: 'Modal_Message__DoYouWantToSynchronize' }, { key: '?</p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this._commonService.deleteQueues(this.buildDataForDelete()).subscribe((response: any) => {
                        this._appErrorHandler.executeAction(() => {
                            if (!Uti.isResquestSuccess(response)) return;
                            this.sendMessage(SignalRActionEnum.ES_ReIndex_Stop);
                        });
                    });
                },
            }),
        );
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private createQueueAndStart() {
        if (!this.isCallStart) return;

        this.isCallStart = false;
        this._commonService.createQueue(this.buildDataForSave()).subscribe((response: any) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                this.sendMessage(SignalRActionEnum.ES_ReIndex_Start);
            });
        });
    }

    private listenSignalRMessage() {
        if (this.messageReIndexElasticSearchSubscription) this.messageReIndexElasticSearchSubscription.unsubscribe();

        this.messageReIndexElasticSearchSubscription = this._signalRService.messageReIndexElasticSearch.subscribe(
            (message: SignalRNotifyModel) => {
                this._appErrorHandler.executeAction(() => {
                    if (message.Job == SignalRJobEnum.Disconnected) {
                        // BackgroundJob is stopped
                        // Notify an error message to user
                        return;
                    }

                    if (
                        isDevMode() &&
                        message.Action != SignalRActionEnum.ES_ReIndex_SyncProcessState &&
                        message.Action != SignalRActionEnum.ES_ReIndex_DBProcess &&
                        message.Action != SignalRActionEnum.ES_ReIndex_Start
                    ) {
                        console.log(message.Action, message);
                    }

                    switch (message.Action) {
                        case SignalRActionEnum.ES_ReIndex_ServiceAlive:
                            this.createQueueAndStart();
                            break;
                        case SignalRActionEnum.ES_ReIndex_GetStateOfSyncList:
                            this.getStateOfSyncList(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_DBProcess:
                            this.initToProcessData(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_SyncProcess:
                            this.startToProcessData(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_SyncProcessState:
                            this.processingData(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_SyncProcessFinished:
                            this.syncProcessFinished(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_SyncCompleted:
                            this.processDataCompleted(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_StartSuccessfully:
                            this.startSuccessfully(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_StopSuccessfully:
                            this.stopSuccessfully(message);
                            break;
                        case SignalRActionEnum.ES_ReIndex_DBDisconnect:
                            this.processingDBDisconnect();
                            break;
                        case SignalRActionEnum.ES_ReIndex_ShowMessage:
                            this.showMessage(message);
                            break;
                        default:
                            break;
                    }
                });
            },
        );
    }

    private getStateOfSyncList(message: SignalRNotifyModel) {
        // Receive a queue list
        // If length > 0  => Start button: disable, Stop button: enable
        // If length == 0 => Start button: enable, Stop button: disable
        this.setDataForGrid(message);
        this.isIdle = !(message.Data && message.Data.length);
    }

    private initToProcessData(message: SignalRNotifyModel) {
        this.isGettingData = true;
        this.percentValue = 0;
        this.updateDataForGrid(message);
    }

    private startToProcessData(message: SignalRNotifyModel) {
        this.isGettingData = true;
        this.updateDataForGrid(message);
    }

    private processingData(message: SignalRNotifyModel) {
        this.isGettingData = false;
        this.gettingDataMessage = '';
        this.updateDataForGrid(message);
        this.calculatePercentValue(message);
    }

    private showMessage(message: SignalRNotifyModel) {
        this.isGettingData = true;
        this.gettingDataMessage = message.Message;
    }

    private processingDBDisconnect() {
        this._modalService.errorText('Database is disconected.');
    }

    private updateDataForGrid(message: SignalRNotifyModel, isFinished?: boolean) {
        if (!this.dataSource.data || !this.dataSource.data.length) return;
        const data = message.Data && message.Data.length ? message.Data[0] : null;
        if (!data) return;

        let row = this.dataSource.data.find((x) => x.id == data.IdAppSystemScheduleQueue);
        if (!row || !row.id) return;

        row.syncRecords = data.SynchronizedRecords + ' (' + data.Percentage + ' %)';
        if (isFinished) {
            row.syncStatus = data.IsSuccess ? 'fa-check  green-color' : 'fa-times  red-color';
        } else {
            row.syncStatus = 'fa-spinner  fa-spin  orange-color';
        }
        row.totalRecords = data.TotalRecords || 0;
        row.synchronizedRecords = data.SynchronizedRecords || 0;
        row.time = data.TotalSeconds || 0;
        this.searchSyncGrid.updateRowData([row]);
        this.changeDetector();
    }

    private syncProcessFinished(message: SignalRNotifyModel) {
        this.updateDataForGrid(message, true);
        this.percentValue = 100;
    }

    private processDataCompleted(message: SignalRNotifyModel) {
        this.percentValue = 100;
        this.isIdle = true;
        this.isGettingData = false;
        this.gettingDataMessage = '';
    }

    private startSuccessfully(message: SignalRNotifyModel) {
        // BackgroundJob return the success signal => Start button: disable, Stop button: enable
        // Get sync list that will be appear in grid
        this.setDataForGrid(message);
        this.isIdle = false;
        this.isGettingData = true;
        this.percentValue = 0;
        this._toasterService.pop('success', 'Success', 'Data processing is started');
        this.changeDetector();
    }

    private stopSuccessfully(message: SignalRNotifyModel) {
        // BackgroundJob return the success signal => Start button: enable, Stop button: disable

        this.isIdle = true;
        this.isGettingData = false;
        this.gettingDataMessage = '';
        this.percentValue = 0;
        this._toasterService.pop('warning', 'Notification', 'Data processing is stopped');
        this.changeDetector();
    }

    private setDataForGrid(message: SignalRNotifyModel) {
        if (!message.Data || !message.Data.length) {
            return;
        }
        const status = (x) => {
            return x.SynchronizedRecords > 0
                ? x.Percentage < 100
                    ? 'fa-spinner  fa-spin  orange-color'
                    : x.IsSuccess
                    ? 'fa-check  green-color'
                    : 'fa-times  red-color'
                : 'fa-database';
        };

        let data: Array<any> = [];
        for (let x of message.Data) {
            data.push({
                id: x.IdAppSystemScheduleQueue,
                module: x.SearchIndexKey,
                time: x.TotalSeconds,
                syncRecords: x.SynchronizedRecords + ' (' + x.Percentage + ' %)',
                synchronizedRecords: 0,
                totalRecords: x.TotalRecords,
                syncStatus: status(x),
            });
            if (x.Step === SignalRActionEnum.ES_ReIndex_DBProcess) {
                this.isGettingData = true;
            }
        }

        this.dataSource = {
            columns: this.dataSource.columns,
            data: data,
        };
    }

    private sendMessage(action: SignalRActionEnum) {
        let model = this._signalRService.createMessageESReIndex();
        model.Action = action;
        this._signalRService.sendMessage(model);
    }

    private calculatePercentValue(message: SignalRNotifyModel) {
        const data = message.Data && message.Data.length ? message.Data[0] : null;
        if (!data) return;
        this.percentValue = Math.floor((data.SynchronizedRecords * 100) / data.TotalRecords);
    }

    private getData() {
        this.tabs = this.fake.createTabsData();
        this.sendMessage(SignalRActionEnum.ES_ReIndex_GetStateOfSyncList);
    }

    private buildDataForSave() {
        let queueData: Array<any> = [];
        for (let item of this.syncItem.checkedItems) {
            queueData.push({
                IdRepAppSystemScheduleServiceName: SystemScheduleServiceName.RunSchedulerService,
                JsonLog: JSON.stringify([
                    {
                        Index: item.index,
                        ProjectType: this.syncItem.tabz.projectType,
                        SyncMode: this.syncMode,
                        Object: item.object,
                        IdPersonType: item.idPersonType,
                    },
                ]),
            });
        }
        return {
            IdRepAppSystemScheduleServiceName: SystemScheduleServiceName.RunSchedulerService,
            JsonText: JSON.stringify({ SystemScheduleQueue: queueData }),
        };
    }

    private buildDataForDelete(): any {
        if (!this.dataSource || !this.dataSource.data || !this.dataSource.data.length) return '';
        let result = '';
        for (let item of this.dataSource.data) {
            result += item.id + ',';
        }
        result = result.substring(0, result.length - 1);
        return { QueuesId: result };
    }

    private changeDetectorTimeout: any;
    private changeDetector() {
        clearTimeout(this.changeDetectorTimeout);
        this.changeDetectorTimeout = null;
        this.changeDetectorTimeout = setTimeout(() => {
            this._ref.detectChanges();
        }, 300);
    }
}
