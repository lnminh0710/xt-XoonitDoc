import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { format } from 'date-fns/esm';
import { Locale } from 'date-fns';
import { Uti } from '@app/utilities';

@Component({
    selector: 'property-panel-date-format-dialog',
    styleUrls: ['./property-panel-date-format-dialog.component.scss'],
    templateUrl: './property-panel-date-format-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelDateFormatDialogComponent {
    public showDialog = false;
    public perfectScrollbarConfig = {
        suppressScrollX: false,
        suppressScrollY: false
    };
    public customDateFormat: string;
    public listItem: { id: string, format: string, disabled?: boolean, active?: boolean }[] = [
        {
            id: 'shortDate',
            format: 'Short Date',
            disabled: true
        }, {
            id: 'M/d/yyyy',
            format: 'M/d/yyyy',
        }, {
            id: 'M/d/yy',
            format: 'M/d/yy',
        }, {
            id: 'MM/dd/yy',
            format: 'MM/dd/yy',
        }, {
            id: 'MM/dd/yyyy',
            format: 'MM/dd/yyyy',
        }, {
            id: 'yy/MM/dd',
            format: 'yy/MM/dd',
        }, {
            id: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
        }, {
            id: 'dd-MMM-yy',
            format: 'dd-MMM-yy',
        }, {
            id: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
        }, {
            id: 'longDate',
            format: 'Long Date',
            disabled: true
        }, {
            id: 'EEEE, MMMM d,yyyy',
            format: 'EEEE, MMMM d,yyyy',
        }, {
            id: 'MMMM d,yyyy',
            format: 'MMMM d,yyyy',
        }, {
            id: 'EEE, d MMMM, yyyy',
            format: 'EEE, d MMMM, yyyy',
        }, {
            id: 'EEEE, d MMMM, yyyy',
            format: 'EEEE, d MMMM, yyyy',
        }, {
            id: 'd MMMM, yyyy',
            format: 'd MMMM, yyyy',
        }, {
            id: 'MMMM d, yyyy',
            format: 'MMMM d, yyyy',
        }, {
            id: 'MMMM yyyy',
            format: 'MMMM yyyy',
        }, {
            id: 'MMMM, yyyy',
            format: 'MMMM, yyyy',
        }, {
            id: 'yyyy qqq',
            format: 'yyyy qqq',
        }
    ];
    public dateSample: string;
    public disabledApplyBtn = true;

    @Output() onApply = new EventEmitter<any>();

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private uti: Uti
    ) {
    }

    public open(item) {
        this.showDialog = true;

        if (item.value) {
            let found: any = this.listItem.find(x => x.format === item.value);
            if (found) {
                found.active = true;
            } else {
                this.customDateFormat = item.value;
                this.dateSample = this.uti.formatLocale(new Date(), this.customDateFormat);
            }

            this.checkToDisabledApplyBtn();
        }

        this.changeDetectorRef.markForCheck();
    }

    public close() {
        this.showDialog = false;

        this.changeDetectorRef.markForCheck();
    }

    public apply() {
        let selectedFormat: any = this.customDateFormat;
        if (!selectedFormat) {
            selectedFormat = this.listItem.find(x => x.active);
            if (selectedFormat) {
                selectedFormat = selectedFormat.format;
            }
        }

        this.onApply.emit(selectedFormat);
        this.close();
    }

    public selectDateFormat(item) {
        this.listItem.forEach((item) => {
            item.active = false;
        });

        item.active = true;

        this.dateSample = this.uti.formatLocale(new Date(), item.format);
        this.customDateFormat = '';
        this.checkToDisabledApplyBtn();

        this.changeDetectorRef.markForCheck();
    }

    public onCustomDateFormatChanged($event) {
        if (this.customDateFormat && this.customDateFormat.length) {
            this.listItem.forEach((item) => {
                item.active = false;
            });

            this.dateSample = this.uti.formatLocale(new Date(), this.customDateFormat);
        } else {
            this.dateSample = '';
        }

        this.checkToDisabledApplyBtn();

        this.changeDetectorRef.markForCheck();
    }

    public checkToDisabledApplyBtn() {
        this.disabledApplyBtn = (!this.customDateFormat || !this.customDateFormat.length) && !this.listItem.find(x => x.active);
    }
}
