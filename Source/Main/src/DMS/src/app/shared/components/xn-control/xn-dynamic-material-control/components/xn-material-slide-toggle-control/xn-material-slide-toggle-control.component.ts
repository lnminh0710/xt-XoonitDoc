import { Component, OnInit, Input } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { Router } from '@angular/router';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

@Component({
    selector: 'xn-material-slide-toggle-control',
    templateUrl: 'xn-material-slide-toggle-control.component.html'
})

export class XnMaterialSlideToggleControlComponent  extends BaseMaterialControlComponent implements OnInit {

    @Input() value: boolean;
    @Input() config: IMaterialControlConfig;
    @Input() disabled: boolean;

    constructor(
        protected router: Router,
    ) {
        super(router);
    }

    ngOnInit() {}

    writeValue(value: boolean): void {
        this._onChange(value);
    }
    registerOnChange(fn: (value: boolean) => void): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: (value: boolean) => void): void {
        this._onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    private _onChange(value: boolean) {
        this.value = value;
    }

    private _onTouch(value: boolean) {
        this.value = value;
    }
}
