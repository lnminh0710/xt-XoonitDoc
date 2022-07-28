import { Component, OnInit, Input, Output, OnDestroy, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ScheduleEvent, MessageModel, ScheduleSettingData } from '@app/models';
import { ModalService, AppErrorHandler, ToolsService, PropertyPanelService } from '@app/services';
import { MessageModal, DateConfiguration } from '@app/app.constants';
import { Subscription } from 'rxjs';
import * as wjcCore from 'wijmo/wijmo';
import * as wjcGrid from 'wijmo/wijmo.grid';
import find from 'lodash-es/find';
import reject from 'lodash-es/reject';
import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import filter from 'lodash-es/filter';
import camelCase from 'lodash-es/camelCase';
import { Uti } from '@app/utilities/uti';
import { WjInputTime } from 'wijmo/wijmo.angular2.input';
import { ScheduleSettingFormComponent } from './components/schedule-setting-form';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { format } from 'date-fns/esm';
import isEmpty from 'lodash-es/isEmpty';

@Component({
    selector: 'schedule-setting',
    styleUrls: ['./schedule-setting.component.scss'],
    templateUrl: './schedule-setting.component.html',
})
export class ScheduleSettingComponent extends BaseComponent implements OnInit, OnDestroy {
    public showDialog = false;
    public allowMerging = wjcGrid.AllowMerging.All;
    public SCHEDULE_JSON_NAME = DateConfiguration.SCHEDULE_JSON_NAME;
    public SCHEDULE_TYPE = DateConfiguration.SCHEDULE_TYPE;
    public scheduleTypePrimary: string = '';
    public scheduleTypes: Array<ScheduleType> = [];
    public scheduleType = this.SCHEDULE_TYPE[0];
    public scheduleSettingData: ScheduleSettingData;
    public globalDateFormat: string = '';

    private scheduleJsonName = this.createScheduleJsonName();
    private scheduleOriginalData: any = {};
    private _currentRowData: any = {};
    private formData: any = {
        formValue: {},
        isDirty: false,
    };

    @Input() set globalProperties(globalProperties: any[]) {
        this.globalDateFormat = this._propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
    }

    @Output() closedAction: EventEmitter<any> = new EventEmitter();

    @ViewChild('scheduleTime') _scheduleTime: WjInputTime;
    @ViewChild('scheduleSettingForm') scheduleSettingForm: ScheduleSettingFormComponent;
    constructor(
        private _modalService: ModalService,
        private _appErrorHandler: AppErrorHandler,
        private _toolsService: ToolsService,
        private _toasterService: ToasterService,
        private _propertyPanelService: PropertyPanelService,
        private _changeDetectorRef: ChangeDetectorRef,
        private uti: Uti,
        router?: Router,
    ) {
        super(router);
    }
    public ngOnInit() {
        this.buildScheduleTypes();
    }
    public ngOnDestroy() {}
    public callShowDialog(data: any) {
        this.showDialog = true;
        this._currentRowData = data;
        this.getScheduleByServiceId(data);
    }
    public closeWindowDialog(isReload?: boolean): void {
        this.showDialog = false;
        this.closedAction.emit(isReload);
    }
    public saveSetting() {
        if (!this.scheduleSettingForm.isValid()) {
            return;
        }
        this._toolsService.saveSystemSchedule(this.buildSavingData()).subscribe((response: any) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.returnID) {
                    this._toasterService.pop('error', 'Failed', 'Data is not updated successfully');
                    return;
                }
                this._toasterService.pop('success', 'Success', 'Data is updated successfully');
                this.closeWindowDialog(true);
            });
        });
    }
    public outputDataHandler(formData: any) {
        this.formData = formData || this.formData;
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private buildSavingData() {
        return { Schedule: this.getScheduleSavingData() };
    }

    private getScheduleSavingData(): Array<any> {
        let addUpdateItems = this.getAddUpdateItems(this.scheduleSettingForm.buildSavingJsonData());
        let deleteItems = this.getDeleteItems(addUpdateItems);
        return [...addUpdateItems, ...deleteItems];
    }

    private getAddUpdateItems(rawData: Array<any>): Array<any> {
        return rawData.map((x) => {
            let item: any = {
                IdRepAppSystemScheduleServiceName: this._currentRowData.IdRepAppSystemScheduleServiceName,
                StartDate: this.formData.formValue.startDate,
                StopDate: this.formData.formValue.stopDate,
            };
            if (!(x.id < 0)) {
                item.IdAppSystemSchedule = x.id;
            }
            this.setDataForEachType(item, x);
            return item;
        });
    }

    private getDeleteItems(addUpdateItems: Array<any>): Array<any> {
        const deleteItem = Uti.getItemsDontExistItems(this.scheduleOriginalData, addUpdateItems, 'IdAppSystemSchedule');
        return deleteItem.map((x) => {
            return {
                IdAppSystemSchedule: x.IdAppSystemSchedule,
                IsDeleted: '1',
            };
        });
    }

    private setDataForEachType(savingData: any, item: any) {
        switch (this.scheduleType) {
            case this.SCHEDULE_TYPE[0]:
                savingData['IsForEveryHours'] = 1;
                savingData['JHours'] = this.getSaveDataForJData(item);
                break;
            case this.SCHEDULE_TYPE[1]:
                savingData['IsForEverDay'] = 1;
                savingData['JDays'] = this.getSaveDataForJData(item);
                break;
            case this.SCHEDULE_TYPE[2]:
                savingData['IsForEveryWeek'] = 1;
                savingData['JWeeks'] = this.getSaveDataForJData(item);
                break;
            case this.SCHEDULE_TYPE[3]:
                savingData['IsForEveryMonth'] = 1;
                savingData['JMonths'] = this.getSaveDataForJData(item);
                break;
            case this.SCHEDULE_TYPE[4]:
                savingData['IsForEveryYear'] = 1;
                savingData['JYears'] = this.getSaveDataForJData(item);
                break;
        }
    }

    private getSaveDataForJData(item: ScheduleEvent) {
        return JSON.stringify({
            On: item.on instanceof Date ? Uti.getUTCDate(item.on) : item.on,
            Hour: item.hour,
            Minute: item.minute,
            Emails: item.email,
            Parameter: item.parameter,
        });
    }

    private buildScheduleTypes() {
        this.scheduleTypes = this.SCHEDULE_TYPE.map((x) => {
            return new ScheduleType({
                title: x.match(/[A-Z][a-z]+/g).join(' '),
                value: x,
            });
        });
    }

    private createScheduleJsonName(): any {
        let result = {};
        for (let i = 0; i < this.SCHEDULE_TYPE.length; i++) {
            result[this.SCHEDULE_TYPE[i]] = this.SCHEDULE_JSON_NAME[i];
        }
        return result;
    }

    private buildDataWhenShowDialog() {
        if (
            !this.scheduleOriginalData ||
            !this.scheduleOriginalData.length ||
            !this._currentRowData.IdRepAppSystemScheduleServiceName
        )
            return;
        if (Uti.isEmptyOrFalse(this.scheduleOriginalData[0].IsForEveryHours)) {
            this.scheduleType = this.SCHEDULE_TYPE[0];
        } else if (Uti.isEmptyOrFalse(this.scheduleOriginalData[0].IsForEverDay)) {
            this.scheduleType = this.SCHEDULE_TYPE[1];
        } else if (Uti.isEmptyOrFalse(this.scheduleOriginalData[0].IsForEveryWeek)) {
            this.scheduleType = this.SCHEDULE_TYPE[2];
        } else if (Uti.isEmptyOrFalse(this.scheduleOriginalData[0].IsForEveryMonth)) {
            this.scheduleType = this.SCHEDULE_TYPE[3];
        } else if (Uti.isEmptyOrFalse(this.scheduleOriginalData[0].IsForEveryYear)) {
            this.scheduleType = this.SCHEDULE_TYPE[4];
        } else {
            return;
        }
        this.scheduleTypePrimary = this.scheduleType;
        this.buildDataByType(this.scheduleOriginalData);
        this.callRender();
    }

    private getScheduleByServiceId(inputData: any) {
        this._toolsService
            .getScheduleByServiceId(inputData.IdRepAppSystemScheduleServiceName)
            .subscribe((response: any) => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        this.scheduleOriginalData = [];
                        return;
                    }
                    this.scheduleOriginalData = response.item.data[1];
                    this.buildDataWhenShowDialog();
                });
            });
    }

    private buildDataByType(data: any) {
        this.scheduleSettingData = new ScheduleSettingData({
            startDate: data[0].StartDate,
            stopDate: data[0].StopDate,
            scheduleType: this.scheduleType,
            scheduleEvents: this.buildJsonDataDataByType(data) || [],
        });
    }

    private buildJsonDataDataByType(data: Array<any>): Array<ScheduleEvent> {
        return data.map((x) => {
            const scheduleItemData = Uti.tryParseJson(x[this.scheduleJsonName[this.scheduleType]]);
            return new ScheduleEvent({
                id: x.IdAppSystemSchedule,
                on: this.parseRightOn(scheduleItemData.On),
                hour: scheduleItemData.Hour,
                minute: scheduleItemData.Minute,
                dateFormat: this.getRightDateFormat(),
                email: scheduleItemData.Emails,
                parameter: scheduleItemData.Parameter,
            });
        });
    }

    private parseRightOn(on: any) {
        if (!on) return '';
        const weekDayIndex = DateConfiguration.WEEK_DAY.indexOf(on);
        if (weekDayIndex > -1) {
            return on;
        }
        const date = Uti.parseStrDateToRealDate(on);
        if (!date || typeof date.getDate != 'function') {
            return on;
        }
        return date;
        // return this.uti.formatLocale(date, this.globalDateFormat)
    }

    private getRightDateFormat(): string {
        if (this.scheduleType == this.SCHEDULE_TYPE[0] || this.scheduleType == this.SCHEDULE_TYPE[4]) {
            return this.globalDateFormat;
        }
        return '';
    }

    private callRender() {
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 100);
    }
}

class ScheduleType {
    public title: string = '';
    public value: string = '';

    public constructor(init?: Partial<ScheduleType>) {
        Object.assign(this, init);
    }
}
