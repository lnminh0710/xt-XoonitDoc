import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'xn-bs-datepicker',
    styleUrls: ['./xn-bs-datepicker.component.scss'],
    templateUrl: './xn-bs-datepicker.component.html',
})
export class XnBsDatepickerComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _formControlClassStyle: string;

    @Input() bsConfig: Partial<BsDatepickerConfig>;
    @Input() disabled: boolean;
    @Input() public set formControlClassStyle(val: string) {
        this._formControlClassStyle = val;
    }
    public get formControlClassStyle() {
        return this._formControlClassStyle ? ' ' + this._formControlClassStyle : null;
    }

    @Output() onDatepickerChanged = new EventEmitter<Date>();

    @ViewChild('datepickerCtrl') datepickerDirective: BsDatepickerDirective;

    private _date: Date;

    public set date(val: Date) {
        this._date = val;

        if (this.datepickerDirective._bsValue === this._date) {
            return;
        }
        this.datepickerDirective.bsValue = this._date;
    }

    public get date() {
        return this._date;
    }

    public set minDate(val: Date) {
        this.datepickerDirective.minDate = val;
    }

    public get minDate() {
        return this.datepickerDirective.minDate;
    }

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    public onChangedDatepicker($event: Date) {
        if (!$event || isNaN($event.getTime())) {
            return;
        }
        this.date = $event;
        this.onDatepickerChanged.emit($event);
    }

    public onDatepickerEmpty($event: Event) {
        const inputElem = $event.target as HTMLInputElement;
        if (!inputElem.value) {
            this._date = null;
            this.onDatepickerChanged.emit(null);
        }
    }
}
