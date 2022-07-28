import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    ChangeDetectorRef,
    EventEmitter,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import {
    FormGroup,
    FormBuilder
} from '@angular/forms';
import {
    ControlGridModel,
    MatchingCountry,
    DataColumn,
    Field,
    MatchingGroup,
    MessageModel,
    ScheduleEvent
} from '@app/models';
import {
    ToolsService,
    AppErrorHandler,
    DatatableService,
    ModalService,
    CommonService,

    AccessRightsService
} from '@app/services';
import {
    MessageModal, AccessRightTypeEnum, Configuration
} from '@app/app.constants';
import {
    ToasterService
} from 'angular2-toaster/angular2-toaster';
//import { WijmoGridComponent } from '@app/shared/components/wijmo';
import { Subscription } from 'rxjs';
import * as wjcCore from 'wijmo/wijmo';
import * as wjcGrid from 'wijmo/wijmo.grid';
import filter from 'lodash-es/filter';
import find from 'lodash-es/find';
import reject from 'lodash-es/reject';
import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import findIndex from 'lodash-es/findIndex';
import isNil from 'lodash-es/isNil';
import maxBy from 'lodash-es/maxBy';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    TabsetComponent
} from 'ngx-bootstrap/tabs';
import {
    DoubletCheckMainFake
} from './doublet-check-main.component-fake';
import {
    Uti
} from '@app/utilities/uti';
import {
    WjInputTime
} from 'wijmo/wijmo.angular2.input';
import * as models from '@app/models';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ScheduleSettingComponent, ScheduleSettingRunImmediatelyComponent } from '@app/shared/components/xn-control/';

@Component({
    selector: 'doublet-check-main',
    styleUrls: ['./doublet-check-main.component.scss'],
    templateUrl: './doublet-check-main.component.html'
})
export class DoubletCheckMainComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public scheduleEventForm: FormGroup;
    public showDialog: boolean = false;
    public groupName: string;
    public isAutoMatching: boolean = true;
    public matchingGroup: MatchingGroup = null;
    public nextScheduleEvent: ScheduleEvent = new ScheduleEvent();
    public dayOfWeekEnum: Array<any> = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    public countryGridData: ControlGridModel;
    public columnsGridData: ControlGridModel;
    public autoMatchingGridData: ControlGridModel;
    public manualMatchingGridData: ControlGridModel;
    public scheduleEventGridData: wjcCore.CollectionView = new wjcCore.CollectionView([]);
    public allowMerging = wjcGrid.AllowMerging.All;
    public showRequire: boolean = false;
    public isDirty: boolean = false;
    public hasDataChanged: boolean = false;
    public matchingStatus: number = 0;
    private cacheAllConfigurationData: string = '';
    private interValTimer: number = 10000;
    private cacheScheduleData: string = '';
    private fake: DoubletCheckMainFake = new DoubletCheckMainFake();
    private formBuilder: FormBuilder;
    private count: number = 1;
    private columnsGridhasError: boolean = false;
    private matchingCountrySubscription: Subscription;
    private matchingColumnsSubscription: Subscription;
    private matchingConfigurationSubscription: Subscription;
    private matchingScheduleSubscription: Subscription;
    private savingConfigurationSubscription: Subscription;
    private callUpdateDataInterval: any = null;
    private scheduleEventArray: Array<ScheduleEvent> = [];
    private cachedConfigurationData: Array<any> = [];
    private cachedCountriesData: Array<any> = [];
    private isColumnsDirty: boolean = false;
    private isEditing: boolean = false;
    private matchingWeight: number;
    public widgetButtonAccessRight: {
        all: boolean,
        createGroup: boolean,
        updateGroup: boolean,
        deleteGroup: boolean,
        scheduleSetting: boolean,
        start: boolean,
    };
    @Input() countryGridId: string;
    @Input() columnsGridId: string;
    @Input() autoMatchingGridId: string;
    @Input() manualMatchingGridId: string;

    @ViewChild('countryGrid') countryGrid: XnAgGridComponent;
    @ViewChild('columnsGrid') columnsGrid: XnAgGridComponent;
    @ViewChild('autoMatchingGrid') autoMatchingGrid: XnAgGridComponent;
    @ViewChild('manualMatchingGrid') manualMatchingGrid: XnAgGridComponent;
    @ViewChild('scheduleEventGrid') scheduleEventGrid: wjcGrid.FlexGrid;
    @ViewChild('groupTab') groupTab: TabsetComponent;
    @ViewChild('scheduleTime') scheduleTime: WjInputTime;
    @ViewChild('scheduleSetting') private scheduleSetting: ScheduleSettingComponent;
    constructor(private toolsService: ToolsService,
        private appErrorHandler: AppErrorHandler,
        private datatableService: DatatableService,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private ref: ChangeDetectorRef,
        protected router: Router,
        private commonService: CommonService,
        private accessRightService: AccessRightsService
    ) {
        super(router);
    }
    public ngOnInit() {
        this.initForm();
        this.initData();
        this.getMatchingWeight();
    }
    public ngAfterViewInit() {
        this.turnOnResizeGird(this.autoMatchingGrid);
        this.turnOnResizeGird(this.manualMatchingGrid);
        this.widgetButtonAccessRight = {
            all: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109 }).read,
            createGroup: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109, widgetButtonName: 'CreateGroup' }).read,
            updateGroup: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109, widgetButtonName: 'UpdateGroup' }).read,
            deleteGroup: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109, widgetButtonName: 'DeleteGroup' }).read,
            scheduleSetting: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109, widgetButtonName: 'ScheduleSetting' }).read,
            start: this.accessRightService.getAccessRight(AccessRightTypeEnum.WidgetButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, idRepWidgetApp: 109, widgetButtonName: 'Start' }).read,
        }
    }
    private turnOnResizeGird(grid: XnAgGridComponent) {
        if (!grid) return;
        setTimeout(() => {
            grid.sizeColumnsToFit();
        });
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public selectTab(tabId: any, e) {
        if (!e.tabset) return;
        switch (tabId) {
            case 1:
                {
                    this.turnOnResizeGird(this.autoMatchingGrid);
                    break;
                }
            case 2:
                {
                    this.turnOnResizeGird(this.manualMatchingGrid);
                    break;
                }
        }
    }
    public groupNameKeyDown() {
        this.showRequire = false;
        this.isColumnsDirty = true;
        this.isEditing = true;
    }
    public onCheckboxChanged() {
        this.isColumnsDirty = true;
    }
    public createGroup(callBackFunc?: Function): void {
        this.countryGrid.stopEditing();
        this.columnsGrid.stopEditing();

        setTimeout(() => {
            if (!this.validationMatchingGroup()) return;
            if (this.isAutoMatching) {
                this.autoMatchingGridData = this.pushRowDataForMatchingGroupGridData(this.autoMatchingGridData);
            } else {
                this.manualMatchingGridData = this.pushRowDataForMatchingGroupGridData(this.manualMatchingGridData);
            }
            this.isEditing = this.isDirty = true;
            this.resetForm();
            if (callBackFunc) {
                callBackFunc();
            }
        });
    }
    public updateGroup(callBackFunc?: Function): void {
        this.countryGrid.stopEditing();
        this.columnsGrid.stopEditing();

        setTimeout(() => {
            if (!this.validationMatchingGroup()) return;
            const datacolumns: Array<DataColumn> = filter(this.columnsGridData.data, this.loopItem.bind(this));
            this.matchingGroup = Object.assign(this.matchingGroup, {
                GroupName: this.groupName,
                IsAutoMatching: this.isAutoMatching,
                Conditions: this.makeMatchingCondition()
            });
            if (this.isAutoMatching) {
                this.autoMatchingGridData = this.updateMatchingGroupGridData(this.autoMatchingGridData, this.manualMatchingGridData);
            } else {
                this.manualMatchingGridData = this.updateMatchingGroupGridData(this.manualMatchingGridData, this.autoMatchingGridData);
            }
            this.isEditing = this.isDirty = true;
            this.resetForm();
            if (callBackFunc) {
                callBackFunc();
            }
        });
    }
    public deleteGroup(): void {
        if (!this.matchingGroup) return;
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Group',
            messageType: MessageModal.MessageType.error,
            message: [ { key: '<p>' }, { key: 'Modal_Message__DoYouWantToDeleteGroup' }, { key: this.matchingGroup.GroupName }, { key: '?</p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.deleteDataRow();
            }
        }));
    }
    public start(): void {
        if (this.matchingStatus == 1) {
            this.matchingStatus = 0;
            this.saveConfigurationToService('Matching is stopped.', 0);
            return;
        }
        this.matchingStatus = 1;
        this.saveConfigurationToService('Matching is started.', 0);
    }
    public saveConfig(): void {
        if (!this.isDirty) {
            return;
        }
        if (this.hasDataChanged) {
            this.showHasDataChangedConfirm();
        } else {
            this.saveConfigurationToService();
        }
    }
    public onCountryGridRowEditEnded($event) {
        this.isEditing = this.isDirty = true;
    }
    public onCountryGridMarkedAsSelectedAll($event) {
        this.isEditing = this.isDirty = true;
    }
    public onColumnsGridRowEditEnded($event) {
        if ($event && $event.select && !$event.Level && this.matchingWeight) {
            $event.Level = this.matchingWeight;
        }

        this.isEditing = this.isColumnsDirty = true;
    }
    public onColumnsGridMarkedAsSelectedAll($event) {
        this.isColumnsDirty = true;
    }
    public columnsGridHasValidationError($event): void {
        this.columnsGridhasError = $event;
    }
    public matchingGroupGridRowDoubleClick($event): void {
        // if (this.matchingGroup && this.matchingGroup.GroupId === $event.GroupId) return;
        if (this.isColumnsDirty) {
            this.modalService.unsavedWarningMessageDefault({
                onModalSaveAndExit: () => {
                    if (this.matchingGroup) {
                        this.updateGroup(() => {
                            this.bindConfigurationData($event);
                        });
                    } else {
                        this.createGroup(() => {
                            this.bindConfigurationData($event);
                        });
                    }
                },
                onModalExit: () => {
                    this.isColumnsDirty = false;
                    this.bindConfigurationData($event);
                }
            });
        } else {
            this.bindConfigurationData($event);
        }
    }
    public openWindowDialog($event): void {
        this.getScheduleData();
        // this.showDialog = !this.showDialog;
        // this.scheduleEventGrid.invalidate();
        this.makeScheduleGridData();
    }
    public closeWindowDialog($event): void {
        this.showDialog = !this.showDialog;
        this.scheduleEventForm.reset();
    }
    public addScheduleEvent(): void {
        for (let propertyName in this.scheduleEventForm.controls) {
            if (!this.scheduleEventForm.controls[propertyName].value) continue;
            const time = this.scheduleTime.value;
            const dataRow: ScheduleEvent = new ScheduleEvent({
                id: Uti.getTempId(),
                on: propertyName,
                minute: time.getMinutes(),
                hour: time.getHours()
            });
            const existedItem = find(this.scheduleEventArray, {
                'on': dataRow.on,
                'at': dataRow.at
            });
            if (!existedItem) this.scheduleEventArray.push(dataRow);
        }
        this.makeScheduleGridData();
        this.setNetxScheduleEvent();
        this.saveScheduleTime();
        this.setNetxScheduleEvent();
    }
    public scheduleEventGridDeleteRow($event): void {
        const item = find(this.scheduleEventArray, {
            'id': $event
        });
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Event',
            messageType: MessageModal.MessageType.error,
            message: [
                { key: '<p>'},
                { key: 'Modal_Message___DoYouWantToDeleteEvent' },
                { key: ' ' + item.on },
                { key: ' - ' },
                { key: item.at },
                { key: '?</p>' }
            ],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.scheduleEventArray = reject(this.scheduleEventArray, {
                    'id': $event
                });
                this.scheduleEventArray = this.sortScheduleItem(this.scheduleEventArray);
                this.scheduleEventGridData = new wjcCore.CollectionView(cloneDeep(this.scheduleEventArray));
                this.setNetxScheduleEvent();
                this.saveScheduleTime();
                this.setNetxScheduleEvent();
            }
        }));
    }
    public refreshData() {
        if (this.isEditing || this.isDirty) {
            this.modalService.confirmMessageHtmlContent(new MessageModel({
                headerText: 'Refresh data',
                messageType: MessageModal.MessageType.error,
                message: [ { key: '<p>' }, { key: 'Modal_Message__DoYouWantToRefresh' }, { key: '?</p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.refreshDataFromService();
                }
            }));
        } else {
            this.refreshDataFromService();
        }
    }

    public onMatchingGridCheckAllChecked(isChecked, gridName) {
        if (this[gridName] && this[gridName].data && this[gridName].data.length) {
            this[gridName].data.forEach(item => {
                let configItem = this.cachedConfigurationData.find(x => x.GroupId == item.GroupId);
                if (configItem) {
                    configItem.IsActive = isChecked;
                }
            });
        }
    }

    public onMatchingGridCheckChanged(data) {
        if (data && data.itemData) {
            let configItem = this.cachedConfigurationData.find(x => x.GroupId == data.itemData.GroupId);
            if (configItem) {
                configItem.IsActive = data.itemData.IsActive;
            }
        }
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private initForm(): void {
        this.formBuilder = new FormBuilder();
        this.scheduleEventForm = this.formBuilder.group({
            'Sunday': false,
            'Monday': false,
            'Tuesday': false,
            'Wednesday': false,
            'Thursday': false,
            'Friday': false,
            'Saturday': false,
            'Time': new Date(new Date().setHours(0, 0, 0, 0))
        });
        this.scheduleEventForm['submitted'] = false;
    }
    private initData(): void {
        this.createEmptyGridData();
        this.getCountriesData();
        this.getColumnsData();
        this.getConfigurationDataFromService();
        this.reloadDataFromService();
    }
    private reloadDataFromService() {
        this.callUpdateDataInterval = setInterval(() => {
            if (!this.hasDataChanged && this.matchingStatus !== 1) {
                this.checkConfigurationDataChange();
                this.checkScheduleDataChange();
            }
        }, this.interValTimer);
    }
    private refreshDataFromService() {
        this.resetForm();
        this.isDirty = this.hasDataChanged = false;
        this.callRender();
        this.getConfigurationDataFromService();
    }
    private getConfigurationDataFromService() {
        this.getConfigurationData();
        this.getScheduleData();
    }
    private showHasDataChangedConfirm() {
        this.modalService.unsavedWarningMessage({
            headerText: 'Saving Changes',
            customClass: 'custom-modal-medium',
            yesButtonText: 'Save overrite',
            noButtonText: 'Refresh',
            message: [
                {   key: '<p>' },
                {   key: 'Modal_Message__ThereWasChangeData' },
                {   key: '</p><p>' },
                {   key: 'Modal_Message__PleaseChooseActionBelow' },
                {   key: '</p>' },
            ],
            onModalSaveAndExit: () => {
                this.saveConfigurationToService();
            },
            onModalExit: () => {
                this.refreshDataFromService();
            },
            onModalCancel: () => {
            }
        });
    }
    private saveConfigurationToService(successMessage?: string, matchingStatus?: number) {
        this.toolsService.saveMatchingConfiguration(this.makeConfigurationSavingData(matchingStatus)).subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                this.toasterService.pop('success', 'Success', successMessage || 'Data saved successfully');
                this.resetForm();
                this.refreshDataFromService();
                if (this.matchingStatus === 1) {
                    this.getConfigurationDataWhenStarting();
                }
            });
        });
    }
    private createEmptyGridData() {
        this.countryGridData = {
            columns: this.fake.createFakedColumnsForCountryGrid(),
            data: []
        };
        this.columnsGridData = {
            columns: this.fake.createFakedColumnsForColumnsGrid(),
            data: []
        };
        this.autoMatchingGridData = {
            columns: this.fake.createFakedColumnsForEventColumnsData(),
            data: []
        };
        this.manualMatchingGridData = {
            columns: this.fake.createFakedColumnsForEventColumnsData(),
            data: []
        };
    }
    private getCountriesData() {
        this.matchingCountrySubscription = this.toolsService.getMatchingCountry().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                const data = (response.item.data[0] as Array<any>).map(p => new MatchingCountry(p));
                this.countryGridData = {
                    data: this.datatableService.appendRowIdForGridData(data),
                    columns: this.countryGridData.columns
                };
                this.buildCountriesData();
                this.callRender();
            });
        });
    }
    private getColumnsData() {
        this.matchingColumnsSubscription = this.toolsService.getMatchingColumns().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                const data = (response.item.data[0] as Array<any>).map(p => {
                    return {
                        Id: p.ColumnName,
                        ColumnName: p.ColumnName,
                        Level: null,
                        select: false
                    }
                });
                this.columnsGridData = {
                    data: this.datatableService.appendRowIdForGridData([...data]),
                    columns: this.columnsGridData.columns
                };
                this.callRender();
            });
        });
    }
    private getConfigurationDataWhenStarting() {
        this.matchingConfigurationSubscription = this.toolsService.getMatchingConfiguration().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (this.matchingStatus !== 1) return;
                setTimeout(() => {
                    this.getConfigurationDataWhenStarting();
                }, 200);
                this.makeAllConfigurationData(response);
            });
        });
    }
    private getConfigurationData(updateCached?: boolean) {
        this.matchingConfigurationSubscription = this.toolsService.getMatchingConfiguration().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                this.makeAllConfigurationData(response, updateCached);
            });
        });
    }
    private makeAllConfigurationData(response: any, updateCached?: boolean) {
        if (!Uti.isResquestSuccess(response)) return;
        try {
            this.cacheAllConfigurationData = this.makeConfigurationStringData(response.item.data[1][0].Value, true);
        } catch (e) {
            this.cacheAllConfigurationData = '';
        }
        if (updateCached) return;
        this.makeConfigurationData(response.item.data);
        this.callRender();
    }
    private checkConfigurationDataChange() {
        this.matchingConfigurationSubscription = this.toolsService.getMatchingConfiguration().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                let cacheAllConfigurationData = '';

                try {
                    cacheAllConfigurationData = this.makeConfigurationStringData(response.item.data[1][0].Value);
                } catch (e) {
                    cacheAllConfigurationData = '';
                }
                if (cacheAllConfigurationData !== this.cacheAllConfigurationData) {
                    this.hasDataChanged = true;
                    this.callRender();
                }
            });
        });
    }
    private callRender() {
        setTimeout(() => {
            this.ref.detectChanges();
        }, 100);
    }
    private makeConfigurationStringData(rawData: any, isSetValueMatchingStatus?: boolean): string {
        try {
            rawData = JSON.parse(rawData);
            if (isSetValueMatchingStatus) {
                this.matchingStatus = rawData.SaveMatchingTool.MatchingStatus;
            }
            for (let item of rawData.SaveMatchingTool.MatchParameter.Groups) {
                delete item.MatchingStatus;
            }
            delete rawData.SaveMatchingTool.MatchingStatus;
            return JSON.stringify(rawData);
        } catch (e) {
            return '';
        }
    }
    private makeConfigurationData(rawData: any) {
        try {
            let data = JSON.parse(rawData[1][0].Value);
            data = data.SaveMatchingTool;
            this.cachedCountriesData = data.CountryCodes;
            this.buildCountriesData();
            this.cachedConfigurationData = data.MatchParameter.Groups || [];
            this.buildConfigurationData();
        } catch (e) {
            this.cachedCountriesData = [];
            this.cachedConfigurationData = [];
            console.error('Json data has incorrect format.');
        }
    }
    private bindConfigurationData($event) {
        this.matchingGroup = cloneDeep($event);
        this.groupName = this.matchingGroup.GroupName;
        this.isAutoMatching = this.matchingGroup.IsAutoMatching;
        this.showRequire = false;
        const conditions: any = this.matchingGroup.Conditions;
        let newData = this.columnsGridData.data;
        for (let item of newData) {
            item.Level = null;
            item.select = false;
            for (let condition of conditions) {
                if (item.ColumnName !== condition.Fields[0].ColumnName) continue;
                item.Level = (condition.Level || 0) * 100;
                item.select = true;
                break;
            }
        }
        this.columnsGridData = {
            data: [...newData],
            columns: this.columnsGridData.columns
        };
    }
    private buildCountriesData() {
        let newData = this.countryGridData.data;
        if (!newData || !newData.length) return;
        if (!this.cachedCountriesData || !this.cachedCountriesData.length) return;
        for (let item of newData) {
            item.select = Uti.checkKeynameExistInArray(this.cachedCountriesData, 'IdRepIsoCountryCode', item.IdRepIsoCountryCode);
        }
        this.countryGridData = {
            data: newData,
            columns: this.countryGridData.columns
        };
        this.callRender();
    }
    private buildConfigurationData() {
        this.autoMatchingGridData = this.buildConfigurationDataForEachGrid(this.autoMatchingGridData, true);
        this.manualMatchingGridData = this.buildConfigurationDataForEachGrid(this.manualMatchingGridData, false);
        this.callRender();
    }
    private buildConfigurationDataForEachGrid(gridData: any, isAutoMatching?: boolean): ControlGridModel {
        let data = this.cachedConfigurationData.filter(x => x.IsAutoMatching === (isAutoMatching || false));
        return new ControlGridModel({
            data: cloneDeep(data),
            columns: gridData.columns
        });
    }
    private getScheduleData(updateCached?: boolean) {
        this.matchingScheduleSubscription = this.toolsService.getScheduleTime().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                this.cacheScheduleData = JSON.stringify(response.item.data[0]);
                if (updateCached) return;
                this.makeScheduleDataFromService(response.item.data[0]);
                if (this.scheduleSetting) {
                    this.scheduleSetting.callShowDialog(this.scheduleEventArray);
                }
                this.callRender();
            });
        });
    }
    private checkScheduleDataChange() {
        this.matchingScheduleSubscription = this.toolsService.getScheduleTime().subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                const cacheScheduleData = JSON.stringify(response.item.data[0]);
                if (cacheScheduleData !== this.cacheScheduleData) {
                    this.hasDataChanged = true;
                    this.callRender();
                }
            });
        });
    }

    private makeScheduleDataFromService(rawData: Array<any>) {
        this.scheduleEventArray = [];
        for (let item of rawData) {
            this.scheduleEventArray.push(new ScheduleEvent({
                id: Uti.getTempId(),
                on: this.dayOfWeekEnum[item.DayOfWeek],
                minute: item.Minute,
                hour: item.Hour
            }));
        }
        // this.makeScheduleGridData();
        this.setNetxScheduleEvent();
        // this.setNetxScheduleEvent();
    }
    private makeScheduleGridData() {
        this.scheduleEventArray = this.sortScheduleItem(this.scheduleEventArray);
        this.scheduleEventGridData = new wjcCore.CollectionView(cloneDeep(this.scheduleEventArray));
    }
    private makeConfigurationSavingData(matchingStatus?: number): any {
        let countryCodes: Array<any> = [];
        for (let item of this.countryGridData.data) {
            if (!item.select) continue;
            countryCodes.push({
                IdRepIsoCountryCode: item.IdRepIsoCountryCode,
                DefaultValue: item.DefaultValue,
                IsoCode: null
            });
        };
        this.makeMatchingStatusForEachConfiguration(0);
        return {
            JSONText: JSON.stringify({
                SaveMatchingTool: {
                    MatchParameter: {
                        Groups: this.removeDTRowId()
                    },
                    CountryCodes: countryCodes,
                    MatchingStatus: this.matchingStatus || 0
                }
            })
        };
    }
    private makeMatchingStatusForEachConfiguration(matchingStatus?: number): void {
        if (isNil(matchingStatus)) return;
        for (let item of this.cachedConfigurationData) {
            if (item.IsActive) {
                item.MatchingStatus = matchingStatus;
            }
        }
    }
    private removeDTRowId() {
        let result = cloneDeep(this.cachedConfigurationData);
        for (let item of result) {
            delete item.DT_RowId;
        }
        return result;
    }
    private saveScheduleTime() {
        this.toolsService.saveScheduleTime(this.makeScheduleTimeData()).subscribe((response: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                this.toasterService.pop('success', 'Success', 'Data saved successfully');
                this.getScheduleData(true);
            });
        });
    }
    private makeScheduleTimeData(): any {
        let scheduleTime: Array<any> = this.scheduleEventGridData.items.map(x => {
            return {
                DayOfWeek: this.mapToDayOfWeek(x.on).toString(),
                Hour: x.hour,
                Minute: x.minute
            };
        });
        return {
            JSONText: JSON.stringify({
                SaveMatchingToolSchedule: scheduleTime
            })
        };
    }
    private mapToDayOfWeek(day: string) {
        for (let i = 0; i < this.dayOfWeekEnum.length; i++) {
            if (this.dayOfWeekEnum[i] === day) return i;
        }
        return 0;
    }
    private setNetxScheduleEvent(): void {
        if (!this.scheduleEventArray.length) {
            this.nextScheduleEvent = new ScheduleEvent();
            return;
        }
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        let day = now.getDay();
        let dayOfWeek = this.dayOfWeekEnum[day];
        let dataRows = filter(this.scheduleEventArray, (function (item, index) {
            return item.on == dayOfWeek && ((hour < item.hour && minute < item.minute) || (hour == item.hour && minute < item.minute));
        }));
        if (!dataRows.length) {
            this.addScheduleWhenEmpty(day, dayOfWeek, dataRows);
            return;
        }
        this.nextScheduleEvent = new ScheduleEvent({
            on: dataRows[0].on,
            at: dataRows[0].at
        });
    }
    private addScheduleWhenEmpty(day: any, dayOfWeek: any, dataRows: any) {
        let foundEvent = null;
        while (foundEvent == null && day < 8) {
            day++;
            dayOfWeek = this.dayOfWeekEnum[day];
            dataRows = filter(this.scheduleEventArray, (function (item, index) {
                return item.on == dayOfWeek;
            }));
            if (dataRows.length > 0) {
                foundEvent = dataRows[0];
                this.nextScheduleEvent = new ScheduleEvent({
                    on: foundEvent.on,
                    at: foundEvent.at
                });
            }
        }
    }
    private pushRowDataForMatchingGroupGridData(gridData: ControlGridModel): ControlGridModel {
        const dataRow = this.createMatchingGroup();
        const data = gridData.data;
        data.push(dataRow);
        this.cachedConfigurationData.push(dataRow);
        return new ControlGridModel({
            columns: gridData.columns,
            data: [...this.datatableService.appendRowIdForGridData(data)]
        });
    }
    private updateMatchingGroupGridData(gridData: ControlGridModel, otherGridData: ControlGridModel): ControlGridModel {
        const data = gridData.data;
        let index = findIndex(data, {
            'GroupId': this.matchingGroup.GroupId
        });
        if (index >= 0) {
            data[index] = this.matchingGroup;
        } else {
            data.push(this.matchingGroup);
            this.deleteGridItemWhenUpdate(otherGridData);
        }
        this.updateCachedConfigurationData();
        return new ControlGridModel({
            columns: gridData.columns,
            data: [...this.datatableService.appendRowIdForGridData(data)]
        });
    }
    private deleteGridItemWhenUpdate(otherGridData: ControlGridModel) {
        // Delete other grid data
        let tempData = otherGridData.data;
        tempData = reject(tempData, {
            'GroupId': this.matchingGroup.GroupId
        });
        this.callRender();
        if (this.isAutoMatching) {
            this.manualMatchingGridData = {
                data: this.datatableService.appendRowIdForGridData(tempData),
                columns: this.manualMatchingGridData.columns
            }
        } else {
            this.autoMatchingGridData = {
                data: this.datatableService.appendRowIdForGridData(tempData),
                columns: this.autoMatchingGridData.columns
            }
        }
    }
    private updateCachedConfigurationData() {
        for (let item of this.cachedConfigurationData) {
            if (item.GroupId !== this.matchingGroup.GroupId) continue;
            item.GroupName = this.matchingGroup.GroupName;
            item.Conditions = this.matchingGroup.Conditions;
            item.IsAutoMatching = this.isAutoMatching
            break;
        }
    }
    private resetForm() {
        this.matchingGroup = null;
        this.groupName = '';
        this.isAutoMatching = true;
        this.isColumnsDirty = false;
        this.columnsGridData = {
            data: Uti.setValueForArrayByProperties([...this.columnsGridData.data], ['select', 'Level'], [false, null]),
            columns: this.columnsGridData.columns
        };
    }
    private deleteDataRow(): void {
        let groupId: any;
        if (this.isAutoMatching) {
            this.autoMatchingGridData = this.deleteEachGridData(this.autoMatchingGrid, this.autoMatchingGridData);
        } else {
            this.manualMatchingGridData = this.deleteEachGridData(this.manualMatchingGrid, this.manualMatchingGridData);
        }
        this.cachedConfigurationData = reject(this.cachedConfigurationData, {
            'GroupId': this.matchingGroup.GroupId
        });
        this.isEditing = this.isDirty = true;
        this.resetForm();
    }
    private deleteEachGridData(grid: XnAgGridComponent, gridData: ControlGridModel): ControlGridModel {
        let data = gridData.data;
        data = reject(data, {
            'GroupId': this.matchingGroup.GroupId
        });
        return new ControlGridModel({
            columns: gridData.columns,
            data: [...data]
        });
    }
    private validationMatchingGroup() {
        if (!this.groupName) {
            this.showRequire = true;
            this.toasterService.pop('warning', 'Validation Failed', 'There are some fields do not pass validation!');
            return false;
        }
        if (this.columnsGridhasError) {
            this.toasterService.pop('warning', 'Validation Failed', 'There are some fields do not pass validation!');
            return false;
        }
        const datacolumns: Array<DataColumn> = filter(this.columnsGridData.data, this.loopItem.bind(this));
        if (datacolumns.length == 0) {
            this.toasterService.pop('warning', 'Validation Failed', 'Please select at least a column!');
            return false;
        }
        this.showRequire = false;
        return true;
    }
    private loopItem(item, index) {
        return item.select && item.Level > 0;
    }
    private createMatchingGroup(): MatchingGroup {
        let maxGroup = maxBy(this.cachedConfigurationData, 'GroupId');
        maxGroup = maxGroup || {};
        const dataRow = new MatchingGroup({
            GroupId: (maxGroup.GroupId || 0) + 1,
            GroupName: this.groupName,
            IsAutoMatching: this.isAutoMatching,
            Conditions: this.makeMatchingCondition(),
            MatchingStatus: 0,
            IsActive: true
        });
        return dataRow;
    }
    private makeMatchingCondition(): Array<DataColumn> {
        let result: Array<DataColumn> = [];
        for (let item of this.columnsGridData.data) {
            if (!item.select || item.Level <= 0) continue;
            result.push(new DataColumn({
                Fields: new Array<Field>(new Field({
                    ColumnName: item.ColumnName
                })),
                Level: (item.Level || 0) / 100,
            }));
        }
        return result;
    }
    private sortScheduleItem(gridData: any): Array<any> {
        let result: Array<any> = [];
        for (let item of this.dayOfWeekEnum) {
            result = [...result, ...this.makeDataForEachDay(gridData, item)];
        }
        return result;
    }
    private makeDataForEachDay(gridData: any, dayName: string): Array<any> {
        let result: Array<any> = [];
        let rawDayData = gridData.filter(x => x.on === dayName);
        if (!rawDayData || !rawDayData.length) return result;
        let dayData = rawDayData.map(x => {
            return {
                id: x.id,
                time: x.hour + x.minute
            };
        });
        dayData = sortBy(dayData, ['time']);
        for (let item of dayData) {
            const currentItem = rawDayData.find(x => x.id === item.id);
            result.push(currentItem);
        }
        return result;
    }

    private getMatchingWeight() {
        this.matchingWeight = Configuration.PublicSettings.matchingWeight;
    }
}
