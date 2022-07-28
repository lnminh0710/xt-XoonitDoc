
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    ToolsService,
    PropertyPanelService,
    AppErrorHandler,
} from '@app/services';
import {
    User
} from '@app/models';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import {
    Uti
} from '@app/utilities/uti';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import {
    Configuration
} from '@app/app.constants';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'schedule-setting-run-immediately',
    styleUrls: ['./schedule-setting-run-immediately.component.scss'],
    templateUrl: './schedule-setting-run-immediately.component.html'
})
export class ScheduleSettingRunImmediatelyComponent extends BaseComponent implements OnInit, OnDestroy {
    public fromGroup: FormGroup;
    public dateType: string = 'currently';
    public showDialog: boolean = false;
    public globalDateFormat: string = '';
    public isFromDateGreaterThanToDate: boolean = false;

    private formBuilder: FormBuilder;
    private scheduleOriginalData: any = {};
    private formValuesChangeSubscription: Subscription;
    private consts: Configuration = new Configuration();
    private currentUserInfo: User;

    @Input() set globalProperties(globalProperties: any[]) {
        this.globalDateFormat = this._propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
    }

    @Output() closeAction: EventEmitter<any> = new EventEmitter();
    @Output() runScheduleAction: EventEmitter<any> = new EventEmitter();

    constructor(
        private _toolsService: ToolsService,
        private _propertyPanelService: PropertyPanelService,
        private _appErrorHandler: AppErrorHandler,
        private _toasterService: ToasterService,
        router ? : Router) {
        super(router);
    }

    public ngOnInit() {
        this.currentUserInfo = (new Uti()).getUserInfo();
        this.createEmptyForm();
    }

    public ngOnDestroy() {
    }

    public submit() {
        if (this.dateType === 'rangeDate' && (!this.fromGroup.valid || this.isFromDateGreaterThanToDate)) {
            this._toasterService.pop('warning', 'Validation Failed', 'No entry data for saving!');
            this.fromGroup['submitted'] = true;
            return;
        }
        this._toolsService.savingQueue(this.buildSavingData())
        .subscribe((response: any) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) return;
                this._toasterService.pop('success', 'Success', 'Schedule is running...');
                this.close();
                this.runScheduleAction.emit({
                    rowData: this.scheduleOriginalData,
                    idAppSystemScheduleQueue: response.item.returnID
                });
            });
        });
    }

    public callShowDiaglog(data?: any) {
        this.showDialog = true;
        this.buildDataWhenShowDialog(data);
    }

    public close() {
        this.showDialog = false;
        this.closeAction.emit();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private createEmptyForm() {
        this.formBuilder = new FormBuilder();
        this.fromGroup = this.formBuilder.group({
            fromDate: [new Date(), Validators.required],
            toDate: [new Date(), Validators.required],
            email: [this.currentUserInfo.email, Validators.required],
            parameter: ''
        });
        this.fromGroup['submitted'] = false;
        this.subscribeFormValueChange();
    }

    private buildDataWhenShowDialog(data: any) {
        this.scheduleOriginalData = Uti.mapObjectToCamel(data);
    }

    private buildSavingData() {
        let result: any = {
            'IdAppSystemSchedule': this.scheduleOriginalData.idAppSystemSchedule,
            'IdRepAppSystemScheduleServiceName': this.scheduleOriginalData.idRepAppSystemScheduleServiceName,
            'JsonLog': JSON.stringify({'JsonLog': this.buildJsonLog()}),
            'IsActive': '1'
        };
        return [result];
    }

    private buildJsonLog() {
        let result: any = {
            Email: this.fromGroup.value.email,
            Parameter: this.fromGroup.value.parameter
        };
        if (this.dateType === 'rangeDate') {
            result['FromDate'] = this.fromGroup.value.fromDate;
            result['ToDate'] = this.fromGroup.value.toDate;
        }
        return result;
    }
    private subscribeFormValueChange() {
        if (this.formValuesChangeSubscription) this.formValuesChangeSubscription.unsubscribe();

        this.formValuesChangeSubscription = this.fromGroup.valueChanges
            .pipe(
                debounceTime(this.consts.valueChangeDeboundTimeDefault)
            )
            .subscribe((data) => {
                this._appErrorHandler.executeAction(() => {
                    this.setIsFromDateGreaterThanToDate();
                });
            });
    }
    private setIsFromDateGreaterThanToDate() {
        const value = this.fromGroup.value;
        this.isFromDateGreaterThanToDate = (value['startDate'] > value['stopDate']);
    }
}
                
