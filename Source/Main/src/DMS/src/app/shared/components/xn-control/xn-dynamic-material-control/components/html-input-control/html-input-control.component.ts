import { Component, OnInit, Input, forwardRef, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { Router } from '@angular/router';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import {
    IInputMaterialControlConfig,
    ITextAreaMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Uti } from '@app/utilities';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'html-input-control',
    templateUrl: 'html-input-control.component.html',
    styleUrls: ['html-input-control.component.scss'],
})
export class HTMLInputControlComponent extends BaseMaterialControlComponent implements OnInit {
    public ControlInputTypeEnum = ControlInputType;
    public isFocus = false;
    public innerHTML = '';

    @Input() config: IInputMaterialControlConfig | ITextAreaMaterialControlConfig;
    private _value: string;
    @Input() set value(value: string) {
        this._value = value;
    }
    @Input() disabled: boolean;

    @ViewChild('matInputElement') matInputElement: ElementRef;

    constructor(protected router: Router, private cdRef: ChangeDetectorRef) {
        super(router);
    }

    public ngOnInit() {
        this.disabled = this.config.setting?.DisplayField?.ReadOnly === '1' || this.disabled;
        this.config.setFocus = this.setFocus.bind(this);
    }

    public writeValue(value: string): void {
        this.innerHTML = value;
        this._onChange(value);
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

    public onFocusField(ctrl: AbstractControl) {
        if (this.config.setting?.DisplayField?.ReadOnly === '1') return;
        this.setFocus();
        this.onFocus(ctrl);
    }

    public onBlurField(ctrl: AbstractControl) {
        this.isFocus = false;
        this.onBlur(ctrl);
    }

    public setFocus() {
        this.isFocus = true;
        setTimeout(() => {
            this.matInputElement?.nativeElement?.focus();
        }, 100);
    }

    private _onChange(value: string) {
        this.value = value;
    }

    private _onTouch(value: string) {
        this.value = value;
    }
}
