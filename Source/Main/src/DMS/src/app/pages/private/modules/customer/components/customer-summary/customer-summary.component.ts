import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UploadFileMode } from '@app/app.constants';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { Subscription, Observable } from 'rxjs';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { AppErrorHandler, PropertyPanelService } from '@app/services';
import { parse } from 'date-fns/esm';
import { CustomerSummaryProperty } from '../../models/customer-summary';
import { XnImageLoaderDirective } from '@app/shared/directives/xn-image-loader/xn-image-loader.directive';

@Component({
    selector: 'customer-summary',
    styleUrls: ['./customer-summary.component.scss'],
    templateUrl: './customer-summary.component.html'
})
export class CustomerSummaryComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public globalDateFormat: string = null;
    public formartDateString = 'MM/dd/yyyy';
    public imageUrl: string = '';
    public data: any = this.createDefaultData();

    private globalPropertiesState: Observable<any>;
    private globalPropertiesStateSubscription: Subscription;

    private _widgetDetail: any;
    @Input() set widgetDetail(data: any) {
        if (data) {
            //console.log('widgetDetail', data);
            this._widgetDetail = data;
            this.mapData();
        }
    }

    private _fieldFormatStyle: any;
    @Input() set fieldFormatStyle(data: any) {
        if (data) {
            //console.log('fieldFormatStyle', data);
            this._fieldFormatStyle = data;
            this.rebuildFieldStyle();
        }
    }

    @ViewChild(XnImageLoaderDirective) xnImageLoader: XnImageLoaderDirective;

    constructor(
        protected store: Store<AppState>,
        protected router: Router,
        protected elRef: ElementRef,
        protected uti: Uti,
        private appErrorHandler: AppErrorHandler,
        public propertyPanelService: PropertyPanelService
    ) {
        super(router);

        this.globalPropertiesState = store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    ngOnInit(): void {
        this.subscribe();
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private createDefaultData() {
        return {
            Avatar: {
                Avatar: new CustomerSummaryProperty()
            },
            Address: {
                PersonNr: new CustomerSummaryProperty(),
                Company: new CustomerSummaryProperty(),
                Department: new CustomerSummaryProperty(),
                Street: new CustomerSummaryProperty(),
                Zip: new CustomerSummaryProperty(),
                Place: new CustomerSummaryProperty()
            },
            CompanyOpening: {
                OpeningHours: new CustomerSummaryProperty(),
                OpenDays: new CustomerSummaryProperty(),
                OpenDaysTime: new CustomerSummaryProperty(),
                OpenDay: new CustomerSummaryProperty(),
                OpenDayTime: new CustomerSummaryProperty()
            },
            Created: {
                BorderLeft: {},
                Created: new CustomerSummaryProperty(),//Label
                CreateDate: new CustomerSummaryProperty(),
                LoginName: new CustomerSummaryProperty()
            },
            Updated: {
                BorderLeft: {},
                Updated: new CustomerSummaryProperty(),//Label
                UpdateDate: new CustomerSummaryProperty(),
                LoginName: new CustomerSummaryProperty()
            },
            Notes: {
                Label: new CustomerSummaryProperty(),
                Notes: new CustomerSummaryProperty()
            }
        };
    }

    private subscribe() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    const globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
                    if (globalDateFormat != this.globalDateFormat) {
                        this.globalDateFormat = globalDateFormat;
                        this.rebuildDateWithFormat();
                    }
                }
            });
        });
    }

    private mapData() {
        if (!this._widgetDetail || !this._widgetDetail.contentDetail ||
            !this._widgetDetail.contentDetail.data || this._widgetDetail.contentDetail.data.length < 2) {
            this.data = this.createDefaultData();
            this.imageUrl = Uti.getCustomerLogoUrl('', '300');
            return;
        }

        const data = this._widgetDetail.contentDetail.data[1];
        for (let i = 0, length = data.length; i < length; i++) {
            const item = data[i];
            const group = item['Group'];
            const originalColumnName = item['OriginalColumnName'];

            const arrCol = originalColumnName.split('_');
            const columnName = arrCol.length > 1 ? arrCol[1] : arrCol[0];
            this.data[group][columnName] = this.getColumnDataItemValue(data, i, group, originalColumnName);
        }//for

        this.imageUrl = Uti.getCustomerLogoUrl(this.data.Avatar.Avatar.Value, '300');

        this.rebuildBorderStyleForDate();

        //console.log('mapData', this.data);

        if (this.xnImageLoader) {
            this.xnImageLoader.reloadImg(this.imageUrl);
        }
    }

    private getColumnDataItem(data, startIndex, group, originalColumnName) {
        for (let i = startIndex, length = data.length; i < length; i++) {
            const item = data[i];
            if (item['Group'] == group && item['OriginalColumnName'] == originalColumnName)
                return item;
        }//for

        return null;
    }

    private getColumnDataItemValue(data, startIndex, group, originalColumnName) {
        var item = this.getColumnDataItem(data, startIndex, group, originalColumnName);

        let date: Date;
        let val = item ? (item['Value'] || '') : '';
        if (val && (originalColumnName === 'CreateDate' || originalColumnName === 'UpdateDate')) {
            date = Uti.parseISODateToDate(val);
            val = this.formatDate(date);
        }
        return new CustomerSummaryProperty({
            OriginalColumnName: originalColumnName,
            Value: val,
            Date: date,
            Style: this.appendDataStyle(originalColumnName)
        });
    }

    private rebuildBorderStyleForDate() {
        this.data.Created.BorderLeft = this.appendDataStyle(this.data.Created.LoginName.OriginalColumnName, true);
        this.data.Updated.BorderLeft = this.appendDataStyle(this.data.Updated.LoginName.OriginalColumnName, true);
    }

    private rebuildFieldStyle() {
        for (const key in this.data) {
            const item = this.data[key];
            for (const key2 in item) {
                const item2 = item[key2];
                this.setFieldStyle(item2);
            }
        }//for

        this.rebuildBorderStyleForDate();
    }

    private setFieldStyle(item: CustomerSummaryProperty) {
        item.Style = this.appendDataStyle(item.OriginalColumnName) || {};
    }

    private rebuildDateWithFormat() {
        for (const key in this.data) {
            const item = this.data[key];

            for (const key2 in item) {
                const item2 = item[key2];
                let itemModel: CustomerSummaryProperty = item2;
                if (itemModel.Date)
                    itemModel.Value = this.formatDate(itemModel.Date);
            }
        }//for
    }

    private formatDate(date) {
        let dateObj: any = date;
        if (!dateObj || dateObj.toString() === 'Invalid Date')
            return '';

        if (!(date instanceof Date)) {
            dateObj = parse(dateObj, 'MM/dd/yyyy', new Date());
            if (dateObj.toString() === 'Invalid Date') {
                dateObj = parse(dateObj, 'dd/MM/yyyy', new Date());
                if (dateObj.toString() === 'Invalid Date') {
                    dateObj = parse(dateObj, 'yyyy/MM/dd', new Date());
                    if (dateObj.toString() === 'Invalid Date') {
                        return dateObj;
                    }
                }
            }
        }
        return this.uti.formatLocale(dateObj, this.globalDateFormat);
    }

    private appendDataStyle(key: string, forceBorderLeft?: boolean) {
        const style = (this._fieldFormatStyle && this._fieldFormatStyle[key]) ? (this._fieldFormatStyle[key].fieldStyle || {}) : {};
        if (forceBorderLeft) {
            if (style['color'])
                return { 'border-left': '3px solid ' + style['color'] };
            return {};
            //console.log('appendDataStyle', style)
        }
        return style;
    }

    public getDataForSaving() {
        return {
        };
    }
}
