import { Component, OnInit, Input, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { Router } from '@angular/router';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import {
    IInputMaterialControlConfig,
    ITextAreaMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Uti } from '@app/utilities';

@Component({
    selector: 'xn-material-input-control',
    templateUrl: 'xn-material-input-control.component.html',
    styleUrls: ['xn-material-input-control.component.scss']
})
export class XnMaterialInputControlComponent extends BaseMaterialControlComponent implements OnInit {
    public ControlInputTypeEnum = ControlInputType;

    @Input() config: IInputMaterialControlConfig | ITextAreaMaterialControlConfig;
    private _value: string;
    @Input() set value(value: string) {
        this._value = value;
    }
    @Input() disabled: boolean;

    @ViewChild('matInputElement') matInputElement: ElementRef;

    constructor(protected router: Router) {
        super(router);
    }

    public ngOnInit() {
        this.disabled = this.config.setting?.DisplayField?.ReadOnly === '1' || this.disabled;
        this.config.setFocus = this.setFocus.bind(this);
    }

    public writeValue(value: string): void {
        const handleValue =
            this.config?.inputType === ControlInputType.NUMBER ? Uti.transformNumberHasDecimal(value, 2) : value;
        this._onChange(handleValue);
    }

    public registerOnChange(fn: (value: string) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: (value: string) => void): void {
        this._onTouch = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public keyPress($event: KeyboardEvent) {
        if (this.config.ignoreKeyCodes && this.config.ignoreKeyCodes.indexOf($event.keyCode) !== -1) {
            $event.preventDefault();
            return false;
        }
        return true;
    }

    public setFocus() {
        this.matInputElement?.nativeElement?.focus();
    }

    private _onChange(value: string) {
        this.value = value;
    }

    private _onTouch(value: string) {
        this.value = value;
    }
}
