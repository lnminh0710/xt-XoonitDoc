
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    ViewChild,
    ChangeDetectorRef
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    AppErrorHandler,
    UserService,
    PropertyPanelService,
    ToolsService
} from '@app/services';
import { Configuration, OrderSummaryFilterConst, DateConfiguration } from '@app/app.constants';
import { User } from '@app/models';
import { Uti } from '@app/utilities';
import * as wjcInput from 'wijmo/wijmo.input';
import cloneDeep from 'lodash-es/cloneDeep';
import { ScheduleSettingComponent } from '@app/shared/components/xn-control/';
import { DatePickerComponent } from '@app/shared/components/xn-control';
import { format } from 'date-fns/esm';

@Component({
    selector: 'date-filter',
    styleUrls: ['./date-filter.component.scss'],
    templateUrl: './date-filter.component.html'
})
export class DateFilterComponent extends BaseComponent implements OnInit, OnDestroy {
    public currentFilterType: string;
    public today = new Date();
    public uiFilterData: any = [];
    public globalDateFormat: string = null;

    private _const = new Configuration();
    private _idRepAppSystemScheduleServiceName: any = null;

    @Input() set globalProperties(globalProperties: any[]) {
        this.globalDateFormat = this._propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
    }
    @Input() set data(_data: any) { this.executeData(_data) };

    @ViewChild('byDateDateFrom') private byDateDateFrom: DatePickerComponent;
    @ViewChild('byDateDateTo') private byDateDateTo: DatePickerComponent;
    @ViewChild('scheduleSetting') private scheduleSetting: ScheduleSettingComponent;

    @Output() outputDataAction: EventEmitter<any> = new EventEmitter();
    constructor(
        private _propertyPanelService: PropertyPanelService,
        private _appErrorHandler: AppErrorHandler,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toolsService: ToolsService,
        private uti: Uti,
        router?: Router) {
        super(router);
    }
    public ngOnInit() {
        let dateFilter = cloneDeep(DateConfiguration.FILTERDATA);
        Uti.removeItemInArray(dateFilter, dateFilter[dateFilter.length - 1], 'title');
        this.uiFilterData = dateFilter;
        this.currentFilterType = OrderSummaryFilterConst.DAY;
        this.uiFilterData[0].selected = true;
        this.uiFilterData[0].loading = true;
        this.subscribeUserService();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public filterDateRangeEventClicked(): void {
        if (!this._idRepAppSystemScheduleServiceName) {
            return;
        }
        this.currentFilterType = OrderSummaryFilterConst.BY_DATE;
        this.getCounterForByDate();
    }

    public filterTypeClicked($event, index, item): void {
        this.currentFilterType = this.uiFilterData[index].type;
        this.setSelectedForItem(item);
        if (this.currentFilterType) {
            switch (this.currentFilterType) {
                case OrderSummaryFilterConst.DAY:
                case OrderSummaryFilterConst.WEEK:
                case OrderSummaryFilterConst.MONTH:
                    this.uiFilterData[index].loading = true;
                    this.makeOutputRequestData();
                    break;
                default:
                    this.outputDataAction.emit(null);
            }
        }
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private setSelectedForItem(currentItem: any) {
        for (let item of this.uiFilterData) {
            item.selected = (item.type === currentItem.type);
        }
    }
    private makeOutputRequestData() {
        if (!this._idRepAppSystemScheduleServiceName) {
            return;
        }
        this.outputDataAction.emit({
            IdRepAppSystemScheduleServiceName: this._idRepAppSystemScheduleServiceName,
            Mode: this.getModeForRequestService(),
            FromDate: this._const.widgetDotNotAddThisFilter,
            ToDate: this._const.widgetDotNotAddThisFilter
        });
    }
    private makeOutputRequestDataByDate() {
        if (!this.byDateDateFrom) return {};
        const model = {
            IdRepAppSystemScheduleServiceName: this._idRepAppSystemScheduleServiceName,
            Mode: this.getModeForRequestService(),
            FromDate: this.uti.formatLocale(this.byDateDateFrom.value, this._const.dateFormatInDataBase),
            ToDate: this.uti.formatLocale(this.byDateDateTo.value, this._const.dateFormatInDataBase)
        };
        this.outputDataAction.emit(model);
        return model;
    }
    private getModeForRequestService(): number {
        switch (this.currentFilterType) {
            case OrderSummaryFilterConst.DAY:
                return 1;
            case OrderSummaryFilterConst.WEEK:
                return 2;
            case OrderSummaryFilterConst.MONTH:
                return 3;
            case OrderSummaryFilterConst.BY_DATE:
                return 4;
        }
        return 0;
    }
    private subscribeUserService() {
        this._userService.currentUser.subscribe((user: User) => {
            this._appErrorHandler.executeAction(() => {
                if (user) {
                    this.buildDateDetail(user);
                }
            });
        });
    }
    private executeData(data: any) {
        const keyObject = data.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
        this._idRepAppSystemScheduleServiceName = (keyObject && keyObject.IdRepAppSystemScheduleServiceName) ? keyObject.IdRepAppSystemScheduleServiceName : '';
        this.showQuantityData(data);
        this.outputDataWhenRootDataChange();
    }
    private showQuantityData(data: any) {
        if (!this.uiFilterData || !this.uiFilterData.length) return;
        if (!data || !data.contentDetail || !data.contentDetail.data || !data.contentDetail.data.length) {
            this.uiFilterData[0].count = 0;
            this.uiFilterData[1].count = 0;
            this.uiFilterData[2].count = 0;
        } else {
            this.uiFilterData[0].count = data.contentDetail.data[0][0].TotalCount || 0;
            this.uiFilterData[1].count = data.contentDetail.data[0][1].TotalCount || 0;
            this.uiFilterData[2].count = data.contentDetail.data[0][2].TotalCount || 0;
        }
        this.setLoading(false);
        this._changeDetectorRef.detectChanges();
    }
    private outputDataWhenRootDataChange() {
        const currentItem = this.uiFilterData.find(x => x.selected);
        if (!currentItem || !currentItem.type) return;
        switch (currentItem.type) {
            case OrderSummaryFilterConst.DAY:
            case OrderSummaryFilterConst.WEEK:
            case OrderSummaryFilterConst.MONTH:
                this.makeOutputRequestData();
                break;

            case OrderSummaryFilterConst.BY_DATE:
                this.filterDateRangeEventClicked();
        }
    }
    private setLoading(isloading: boolean) {
        for (let item of this.uiFilterData) {
            item.loading = isloading;
        }
    }
    private buildDateDetail(user: User) {
        this.uiFilterData[0].subTitle = this.uti.formatLocale(this.today, 'cccc');
        this.uiFilterData[1].subTitle = this.uti.formatLocale(this.today, 'ww');
        this.uiFilterData[2].subTitle = this.uti.formatLocale(this.today, 'MMMM');
    }
    private getCounterForByDate() {
        this.uiFilterData[3].loading = true;
        const model = this.makeOutputRequestDataByDate();
        this.callGetCounterForByDate(model);
    }
    private callGetCounterForByDate(requestData) {
        this._toolsService.getSummayFileResultSystemSchedule(requestData)
            .subscribe((response: any) => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.data || !response.item.data.length || !response.item.data[0].length) return;
                    this.uiFilterData[3].count = response.item.data[0][0].TotalCount || 0;
                });
            });
    }
}
