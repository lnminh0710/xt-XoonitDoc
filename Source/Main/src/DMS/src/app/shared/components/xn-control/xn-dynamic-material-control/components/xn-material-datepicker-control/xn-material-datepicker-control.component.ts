import { Component, OnInit, forwardRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { Router } from '@angular/router';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@xn-control/light-material-ui/datepicker';
import { IDatepickerMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import * as moment from 'moment';

@Component({
    selector: 'xn-material-datepicker-control',
    templateUrl: 'xn-material-datepicker-control.component.html',
})
export class XnMaterialDatepickerControlComponent extends BaseMaterialControlComponent implements OnInit {
    @Input() config: IDatepickerMaterialControlConfig;
    @Input() value: Date;
    @Input() disabled: boolean;
    @ViewChild('picker') datepicker: MatDatepicker<Date>;

    constructor(protected router: Router, private cdRef: ChangeDetectorRef) {
        super(router);
    }

    ngOnInit() {
        this.config.setFocus = this.open.bind(this);
    }

    writeValue(value: Date): void {
        this._onChange(value);
    }
    registerOnChange(fn: (value: Date) => void): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: (value: Date) => void): void {
        this._onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public open() {
        this.cdRef.markForCheck();
        this.datepicker.open();
    }

    public close() {
        this.datepicker.close();
        this.cdRef.detectChanges();
    }

    public dateChanged($event: MatDatepickerInputEvent<Date>) {
        const value = moment($event.value).format('DD/MM/YYYY');
    }

    public keyPress($event: KeyboardEvent) {
        if (this.config.ignoreKeyCodes && this.config.ignoreKeyCodes.indexOf($event.keyCode) !== -1) {
            $event.preventDefault();
            return false;
        }
        return true;
    }

    private _onChange(value: Date) {
        this.value = value;
    }

    private _onTouch(value: Date) {
        this.value = value;
    }
}
