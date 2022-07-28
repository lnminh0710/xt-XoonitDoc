import { Directive, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { FormGroup, ControlValueAccessor, FormControl, AbstractControl } from '@angular/forms';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { MaterialControlType } from '@widget/components/widget-mydm-form/consts/material-control-type.enum';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import { Uti } from '@app/utilities';
@Directive()
export abstract class BaseMaterialControlComponent extends BaseComponent implements OnDestroy, ControlValueAccessor {
    public ngStyleMatIcon = {
        color: 'red',
        'font-size': '18px',
    };

    @Input() config: IMaterialControlConfig;
    @Input() formGroup: FormGroup;
    @Output() controlValueChanged = new EventEmitter<any>();
    @Output() onControlFocus = new EventEmitter<FocusControlEvent>();
    @Output() onKeydown = new EventEmitter<KeyboardEvent>();
    @Output() onKeyup = new EventEmitter<KeyboardEvent>();
    @Output() onControlBlur = new EventEmitter<any>();
    @Output() onControlHover = new EventEmitter<any>();
    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();

    constructor(protected router: Router) {
        super(router);
    }

    ngOnDestroy(): void {
        this.formGroup = null;
        this.config = null;
        this.onDestroy();
    }

    public abstract writeValue(obj: any): void;
    public abstract registerOnChange(fn: any): void;
    public abstract registerOnTouched(fn: any): void;
    public abstract setDisabledState?(isDisabled: boolean): void;

    protected onDestroy() {
        super.onDestroy();
    }

    public clearCtrlValue(ctrl: AbstractControl) {
        ctrl.setValue('', { emitEvent: false, onlySelf: true });
        this.config.showBtnClearValue = false;
    }
    public onMouseOver(ctrl: AbstractControl) {
        this.config.showBtnRemove = true;
    }
    public onMouseEnter(ctrl: AbstractControl) {
        if (ctrl.value && !ctrl.disabled) {
            this.config.showBtnClearValue = true;
        }
    }

    public onMouseLeave(ctrl: AbstractControl) {
        this.config.showBtnRemove = false;
        if (this.config.showBtnClearValue) {
            this.config.showBtnClearValue = false;
        }
    }

    public onFocus(ctrl: AbstractControl) {
        if (ctrl.value) {
            this.config.showBtnClearValue = true;
            this.config.showBtnRemove = true;
        }
        this.onControlFocus.emit({
            config: this.config,
            form: this.formGroup,
        });
    }

    public onBlur(ctrl: AbstractControl) {
        if (this.config.showBtnClearValue) {
            this.config.showBtnClearValue = false;
        }
        if (this.config.showBtnRemove) {
            this.config.showBtnRemove = false;
        }

        if (this.config?.type === MaterialControlType.INPUT && this.config['inputType'] === ControlInputType.NUMBER) {
            ctrl.setValue(Uti.transformNumberHasDecimal(ctrl.value, 2));
        }
        // this.onControlBlur.emit(ctrl);
        this.config.onControlBlur.emit(ctrl);
    }

    public onDblClick(ctrl: AbstractControl) {
        this.onControlClick.emit({
            config: this.config,
            form: this.formGroup,
        });
    }

    public onIconClick() {
        this.onControlIconClick.emit({
            config: this.config,
            form: this.formGroup,
        });
    }
}
