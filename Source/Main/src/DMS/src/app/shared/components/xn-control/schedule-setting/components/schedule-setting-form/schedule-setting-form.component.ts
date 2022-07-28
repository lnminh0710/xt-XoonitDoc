
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    ViewChild
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    ScheduleEvent,
    MessageModel,
    ScheduleEventConfig,
    TimeSchedule,
    ScheduleSettingData,
    User
} from '@app/models';
import {
    ModalService,
    AppErrorHandler
} from '@app/services';
import {
    MessageModal,
    DateConfiguration,
    Configuration
} from '@app/app.constants';
import find from 'lodash-es/find';
import reject from 'lodash-es/reject';
import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import filter from 'lodash-es/filter';
import { format } from 'date-fns/esm';
import uniqBy from 'lodash-es/uniqBy';
import {
    Uti
} from '@app/utilities/uti';
import * as wjcCore from 'wijmo/wijmo';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import { ScheduleSettingGridComponent } from '../schedule-setting-grid';
import { Subscription } from 'rxjs';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'schedule-setting-form',
    styleUrls: ['./schedule-setting-form.component.scss'],
    templateUrl: './schedule-setting-form.component.html'
})
export class ScheduleSettingFormComponent extends BaseComponent implements OnInit, OnDestroy {
    public SCHEDULE_TYPE = DateConfiguration.SCHEDULE_TYPE;
    public scheduleEventForm: FormGroup;
    public localScheduleType: any = {};
    public dayOfWeekEnum: Array<string> = DateConfiguration.WEEK_DAY;
    public weekDayItems: Array<any> = [];
    public dayItems: Array<any> = [];
    public scheduleEventGridData: Array<ScheduleEvent> = [];
    public scheduleEventGridDataOneTime: Array<ScheduleEvent> = [];
    public scheduleEventGridDataDaily: Array<ScheduleEvent> = [];
    public scheduleEventGridDataWeekly: Array<ScheduleEvent> = [];
    public scheduleEventGridDataMonthly: Array<ScheduleEvent> = [];
    public scheduleEventGridDataAnnual: Array<ScheduleEvent> = [];
    public scheduleEventConfigList: Array<ScheduleEventConfig> = [];
    public isStartDateGreaterThanStopDate: boolean = false;
    public consts: Configuration = new Configuration();

    private currentUserInfo: User;
    private formBuilder: FormBuilder;
    private formValuesChangeSubscription: Subscription;

    @ViewChild('scheduleSettingGrid') scheduleSettingGrid: ScheduleSettingGridComponent;

    @Input() set inputData(data: ScheduleSettingData) { this.execInputData(data); }
    @Input() scheduleTypePrimary: string;
    @Input() globalDateFormat: string;
    @Input() set scheduleType(data: string) { this.execScheduleType(data) }
    @Output() outputDataAction: EventEmitter<any> = new EventEmitter();

    constructor(
        private _modalService: ModalService,
        private _appErrorHandler: AppErrorHandler,
        private _toasterService: ToasterService,
        private uti: Uti,
        router?: Router
    ) {
        super(router);
    }
    public ngOnInit() {
        this.currentUserInfo = (new Uti()).getUserInfo();
        this.createEmptyForm();
        this.createTimeSchedule();
        this.buildScheduleEventConfigList();
        this.setDefaultScheduleEventGridData();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
        this.destroyObject();
    }
    public addScheduleEvent() {
        this.scheduleEventForm['submitted'] = true;
        this.scheduleEventForm.updateValueAndValidity();
        this.callAddScheduleEvent(this.scheduleEventForm.value);
    }
    public onDeleteHandle($event) {
        this['scheduleEventGridData' + this.localScheduleType] = reject(this['scheduleEventGridData' + this.localScheduleType], {
            'id': $event
        });
        this.scheduleEventGridData = reject(this.scheduleEventGridData, {
            'id': $event
        });
        this.setDirtyForScheduleEventConfigList();
    }
    public buildSavingJsonData(): Array<any> {
        return this.scheduleEventGridData;
        // return this.scheduleEventGridData.map(x => {
        //     return {
        //         'On': x.realOn,
        //         'Hour': x.hour,
        //         'Minute': x.minute,
        //         'Emails': x.email
        //     };
        // });
    }
    public isValid(): boolean {
        const changeList = this.scheduleEventConfigList.filter(x => x.isChange);
        if ((this.scheduleEventForm.valid && !this.isStartDateGreaterThanStopDate) || (changeList && !!changeList.length)) {
            return true;
        }
        this._toasterService.pop('warning', 'Validation Failed', 'No entry data for saving!');
        return false;
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private subscribeFormValueChange() {
        if (this.formValuesChangeSubscription) this.formValuesChangeSubscription.unsubscribe();

        this.formValuesChangeSubscription = this.scheduleEventForm.valueChanges
            .pipe(
                debounceTime(this.consts.valueChangeDeboundTimeDefault),
            )
            .subscribe((data) => {
                this._appErrorHandler.executeAction(() => {
                    this.setOutputData(true);
                    this.setIsStartDateGreaterThanStopDate();
                });
            });
    }
    private setIsStartDateGreaterThanStopDate() {
        const value = this.scheduleEventForm.value;
        this.isStartDateGreaterThanStopDate = (value['startDate'] > value['stopDate']);
    }
    private setOutputData(isDirty?: boolean) {
        this.outputDataAction.emit(
            {
                formValue: this.scheduleEventForm.value,
                isDirty: isDirty
            });
    }
    private execInputData(data: ScheduleSettingData) {
        if (!data || !data.startDate) return;
        this.setDataForForm(data);
        this['scheduleEventGridData' + data.scheduleType] = data.scheduleEvents;
        this.scheduleEventGridData = cloneDeep(this['scheduleEventGridData' + data.scheduleType]);
        Uti.setValueForArrayByKey(this.scheduleEventConfigList, 'isPrimary', true, 'name', data.scheduleType);
        Uti.setValueForArrayByKey(this.scheduleEventConfigList, 'data', cloneDeep(this['scheduleEventGridData' + data.scheduleType]), 'name', data.scheduleType);
    }
    private setDataForForm(data: ScheduleSettingData) {
        if (!this.scheduleEventForm) return;
        this.scheduleEventForm.controls['startDate'].setValue(Uti.parseStrDateToRealDate(data.startDate));
        this.scheduleEventForm.controls['stopDate'].setValue(Uti.parseStrDateToRealDate(data.stopDate));
    }
    private buildScheduleEventConfigList() {
        this.scheduleEventConfigList = this.SCHEDULE_TYPE.map(x => {
            return new ScheduleEventConfig({
                name: x,
                isChange: false,
                isPrimary: (x === this.scheduleTypePrimary),
                data: this['scheduleEventGridData' + x]
            });
        });
    }
    private setDirtyForScheduleEventConfigList() {
        const currentItem = this.scheduleEventConfigList.find(x => x.name == this.localScheduleType);
        currentItem.isChange = true;
        this.setOutputData(true);
    }
    private setDefaultScheduleEventGridData() {
        this.scheduleEventGridData = cloneDeep(this.scheduleEventGridDataOneTime);
    }
    private callAddScheduleEvent(formValue: any) {
        if (!this.isValid()) {
            return;
        }
        switch (this.localScheduleType) {
            case this.SCHEDULE_TYPE[0]:
                this.addScheduleForOneTime(formValue);
                break;
            case this.SCHEDULE_TYPE[1]:
                this.addScheduleForDaily(formValue);
                break;
            case this.SCHEDULE_TYPE[2]:
                this.addScheduleForWeekly(formValue);
                break;
            case this.SCHEDULE_TYPE[3]:
                this.addScheduleForMonthly(formValue);
                break;
            case this.SCHEDULE_TYPE[4]:
                this.addScheduleForAnnual(formValue);
        }
    }
    private addScheduleForOneTime(formValue: any) {
        const newItem = this.createFirstScheduleEvent(formValue);
        newItem.on = formValue['runDate'];
        newItem.dateFormat = this.globalDateFormat;
        if (this.checkExistData(newItem, true)) return;
        this.scheduleEventGridDataOneTime.push(newItem);
        this.resetGridData();
        this.setDirtyForScheduleEventConfigList();
        this.scheduleSettingGrid.callExpandNodeByData([formValue['runDate']]);
    }
    private addScheduleForDaily(formValue: any) {
        const newItem = this.createFirstScheduleEvent(formValue);
        newItem.on = 'Daily';
        if (this.checkExistData(newItem)) return;
        this.scheduleEventGridDataDaily.push(newItem);
        this.resetGridData();
        this.setDirtyForScheduleEventConfigList();
        this.scheduleSettingGrid.callExpandNodeByData(['Daily']);
    }
    private addScheduleForWeekly(formValue: any) {
        let result: Array<ScheduleEvent> = [];
        let ons: Array<string> = [];
        for (let item of this.weekDayItems) {
            if (!item.select) continue;
            const newItem = this.createFirstScheduleEvent(formValue);
            newItem.on = item.name;
            if (this.checkExistData(newItem, true)) continue;
            ons.push(item.name);
            result.push(newItem);
        }
        if (!result.length) return;
        this.scheduleEventGridDataWeekly = [...this.scheduleEventGridDataWeekly, ...result];
        this.resetGridData();
        this.setDirtyForScheduleEventConfigList();
        this.scheduleSettingGrid.callExpandNodeByData(ons);
    }
    private addScheduleForMonthly(formValue: any) {
        let result: Array<ScheduleEvent> = [];
        let ons: Array<string> = [];
        for (let item of this.dayItems) {
            if (!item.select) continue;
            const newItem = this.createFirstScheduleEvent(formValue);
            newItem.on = item.name;
            if (this.checkExistData(newItem, true)) continue;
            ons.push(item.name);
            result.push(newItem);
        }
        if (!result.length) return;
        this.scheduleEventGridDataMonthly = [...this.scheduleEventGridDataMonthly, ...result];
        this.resetGridData();
        this.setDirtyForScheduleEventConfigList();
        this.scheduleSettingGrid.callExpandNodeByData(ons);
    }
    private addScheduleForAnnual(formValue: any) {
        const newItem = this.createFirstScheduleEvent(formValue);
        newItem.on = formValue['runDate'];
        newItem.dateFormat = this.globalDateFormat;
        if (this.checkExistData(newItem, true)) return;
        this.scheduleEventGridDataAnnual.push(newItem);
        this.resetGridData();
        this.setDirtyForScheduleEventConfigList();
        this.scheduleSettingGrid.callExpandNodeByData([formValue['runDate']]);
    }
    private createFirstScheduleEvent(formValue: any): ScheduleEvent {
        return new ScheduleEvent({
            id: Uti.getTempId(),
            minute: formValue['runTime'].getMinutes(),
            hour: formValue['runTime'].getHours(),
            email: formValue['email'],
            parameter: formValue['parameter']
        });
    }
    private createEmptyForm() {
        this.formBuilder = new FormBuilder();
        this.scheduleEventForm = this.formBuilder.group({
            startDate: [new Date(), Validators.required],
            stopDate: [new Date(), Validators.required],
            runDate: new Date(),
            runTime: new Date(new Date().setHours(0, 0, 0, 0)),
            email: [this.currentUserInfo.email, Validators.required],
            parameter: ''
        });
        this.scheduleEventForm['submitted'] = false;
        this.subscribeFormValueChange();
    }
    private createTimeSchedule() {
        this.weekDayItems = this.createTimeScheduleForWeekly();
        this.dayItems = this.createTimeScheduleForMonthly();
    }
    private createTimeScheduleForWeekly(): Array<TimeSchedule> {
        return this.dayOfWeekEnum.map(x => {
            return new TimeSchedule({
                name: x,
                select: false
            });
        });
    }
    private createTimeScheduleForMonthly(): Array<TimeSchedule> {
        let result: Array<TimeSchedule> = [];
        for (let i = 1; i < 32; i++) {
            result.push(new TimeSchedule({
                name: ('0' + i).slice(-2),
                select: false
            }));
        }
        return result;
    }
    private execScheduleType(data) {
        this.localScheduleType = data;
        this.builScheduleEventGridData();
        this.resetGridData();
    }
    private resetGridData() {
        this.scheduleEventGridData.length = 0;
        this.scheduleEventGridData = cloneDeep(this['scheduleEventGridData' + this.localScheduleType]);
    }
    private builScheduleEventGridData() {
        switch (this.localScheduleType) {
            // One Time
            case this.SCHEDULE_TYPE[0]:
            case this.SCHEDULE_TYPE[4]:
                this.builScheduleEventGridDataForItem();
                break;
            case this.SCHEDULE_TYPE[1]:
                // Daily
                this.builScheduleEventGridDataForItem(true);
        }
    }
    private builScheduleEventGridDataForItem(isDaily?: boolean) {
        const primaryItem = this.scheduleEventConfigList.find(x => x.isPrimary);
        const currentItem = this.scheduleEventConfigList.find(x => x.name == this.localScheduleType);
        if (!primaryItem || !primaryItem.name || currentItem.isChange
            || primaryItem.name == currentItem.name
            || (primaryItem.name != this.SCHEDULE_TYPE[0] && primaryItem.name != this.SCHEDULE_TYPE[4])) {
            return;
        }
        if (isDaily) {
            this.buildDataForDaily(cloneDeep(primaryItem.data));
        } else {
            this['scheduleEventGridData' + this.localScheduleType] = cloneDeep(primaryItem.data);
        }
    }
    private buildDataForDaily(primaryDadta: Array<ScheduleEvent>) {
        for (let item of primaryDadta) {
            item.on = 'Daily';
            item.dateFormat = '';
        }
        this['scheduleEventGridData' + this.localScheduleType] = uniqBy(primaryDadta, 'at');
    }
    private checkExistData(newItem: any, isCheckOn?: boolean): boolean {
        let existedItem: any = false;
        if (isCheckOn) {
            existedItem = find(this['scheduleEventGridData' + this.localScheduleType], {
                'on': newItem.on,
                'at': newItem.at
            });
        } else {
            existedItem = find(this['scheduleEventGridData' + this.localScheduleType], {
                'at': newItem.at
            });
        }
        if (!!existedItem) {
            this._modalService.warningText('Please select other run time');
        }
        return !!existedItem;
    }
    private destroyObject() {
        this.weekDayItems.length = 0;
        this.dayItems.length = 0;
        this.scheduleEventGridData.length = 0;
        this.scheduleEventGridDataOneTime.length = 0;
        this.scheduleEventGridDataDaily.length = 0;
        this.scheduleEventGridDataWeekly.length = 0;
        this.scheduleEventGridDataMonthly.length = 0;
        this.scheduleEventGridDataAnnual.length = 0;
        this.scheduleEventConfigList.length = 0;
    }
}
