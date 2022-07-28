import { Component, OnInit, OnDestroy, forwardRef, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import isString from 'lodash-es/isString';
import isNumber from 'lodash-es/isNumber';

@Component({
    selector: 'xn-numeric-textbox',
    templateUrl: './xn-numeric-textbox.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => XnNumbericTextboxComponent),
            multi: true
        }
    ]
})
export class XnNumbericTextboxComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private el: HTMLInputElement;

    @Input() id: string;
    @Input() name: string;
    @Input() value: number;
    @Input() maxlength: number;
    @Input() placeholder: string;
    @Input() fontIcon: string;
    @Input() isInteger: boolean;
    @Input() maxValue: number;
    @Input() noInForm: boolean;
    @Input() disabled: boolean;
    @Input() width: any;
    @Input() customClassInput: string;
    @Input() customClassAddOn: string;
    @Input() format: any;

    @Output() change: EventEmitter<any> = new EventEmitter();
    @Output() focus: EventEmitter<any> = new EventEmitter();

    public formClass: any = 'form-control  xn-input  ';
    public customStyle: any;
    private allowDecimal: any = [46, 8, 9, 27, 13, 110, 190];
    private notAllowDecimal: any = [46, 8, 9, 27, 13];

    constructor(
        private elementRef: ElementRef) {
        this.el = this.elementRef.nativeElement;
    }

    public ngOnInit() {
        this.formClass = (this.noInForm ? '' : this.formClass) + (this.customClassInput ? this.customClassInput : '');
        if (isNumber(this.width)) {
            this.customStyle = {
                'width': `${this.width}px`
            };
        } else if (isString(this.width)) {
            this.customStyle = {
                'width': `${this.width}`
            };
        }
    }

    public ngOnDestroy() {
    }

    public valueChanged(val: any) {
      this.value = val;
      if (this._onTouched) this._onTouched();
      if (this._onChange) {
          this._onChange(this.value);
          this.change.emit(this.value);
      }
    }

    public onFocus(event: any) {
        this.focus.emit();
    }

    public onKeyDown(e: any) {
        // Allow: backspace, delete, tab, escape, enter, dot
        if (this.checkAllowInteger(e) ||
            // Allow: Ctrl+A, Command+A
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            // existing dot value
            if ((e.target.value.indexOf('.') > -1) && ($.inArray(e.keyCode, [110, 190]) > -1)) {
                e.preventDefault();
            }
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    public onBlur(e: any) {
        const a = parseFloat(e.target.value);
        if (isNaN(a)) return;

        if (!this.isInteger && a.toString().indexOf('.') === (a.toString().length - 1)) {
            e.target.value = a.toString().substring(0, a.toString().length - 1);
        }

        if (this.maxValue && parseFloat(a.toString()) > this.maxValue) {
            e.target.value = this.maxValue;
        } else {
            e.target.value = a;
        }
    }

    private checkAllowInteger(e: any) {
        // convert "false" to false use "!"
        if (this.isInteger)
            return $.inArray(e.keyCode, this.notAllowDecimal) !== -1;
        return $.inArray(e.keyCode, this.allowDecimal) !== -1;
    }

    /* Override function*/
    private _onChange = (_: any) => { };
    private _onTouched = () => { };
    public writeValue(value: any) {
        if (value !== undefined) {
            this.value = value;
        }
    }
    public registerOnChange(fn: (_: any) => void): void { this._onChange = fn; }
    public registerOnTouched(fn: () => void): void { this._onTouched = fn; }
}
