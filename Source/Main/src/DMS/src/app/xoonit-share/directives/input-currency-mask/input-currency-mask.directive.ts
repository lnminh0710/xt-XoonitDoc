import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

const noop = () => {};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputCurrencyMaskDirective),
    multi: true,
};

@Directive({
    selector: '[currencyMask]',
    // providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class InputCurrencyMaskDirective {
    private _isDecimal = true;
    @Input() set isDecimal(data: boolean) {
        this._isDecimal = data;
        this.decimalSeparator = data ? this.decimalSeparator : '';
    }
    get isDecimal() {
        return this._isDecimal;
    }
    private _thousandsSeparator = '';
    @Input() set thousandsSeparator(data: string) {
        this._thousandsSeparator = data ? data : "'";
    }
    get thousandsSeparator() {
        return this._thousandsSeparator;
    }

    private prefix: string = '';
    private decimalSeparator: string = '.';

    private el: HTMLInputElement;
    private innerValue: any = 0;
    constructor(private elementRef: ElementRef) {
        this.el = elementRef.nativeElement;
    }

    // Placeholders for the callbacks which are later providesd
    // by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (a: any) => void = noop;

    // set getter
    get value(): any {
        return this.innerValue;
    }

    // set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    // Set touched on blur
    // onBlur() {
    //   this.onTouchedCallback();
    // }

    // From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.el.value = this.transformToFormat(value);
            this.innerValue = value;
        }
    }

    // From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    // From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    ngAfterViewInit() {
        this.el.style.textAlign = 'left';
        this.el.value = this.transformToFormat(this.el.value);
    }

    // On Focus remove all non-digit or decimal separator values
    @HostListener('focus', ['$event.target.value'])
    onfocus(value) {
        this.el.value = this.parseToNumber(value);
    }

    // On Blue remove all symbols except last . and set to currency format
    @HostListener('blur', ['$event.target.value'])
    onBlur(value) {
        this.onTouchedCallback();
        this.el.value = this.transformToFormat(value);
        this.onChangeCallback(this.parseToNumber(this.el.value));
    }

    // On Change remove all symbols except last . and set to currency format
    @HostListener('change', ['$event.target.value'])
    onChange(value) {
        this.el.value = this.transformToFormat(value);
    }

    // Prevent user to enter anything but digits and decimal separator
    @HostListener('keypress', ['$event'])
    onKeyPress(event) {
        const key = event.which || event.keyCode || 0;
        if (!this.isDecimal && key > 31 && (key < 48 || key > 57)) {
            event.preventDefault();
        } else if (this.isDecimal && key !== 46 && key > 31 && (key < 48 || key > 57)) {
            event.preventDefault();
        }
    }

    private transformToFormat(value: string, allowNegative = false, decimalPrecision: number = 2) {
        if (value == undefined || value === '') {
            return null;
        }
        if (allowNegative) {
            value = value.toString();
            if (value.startsWith('(') || value.startsWith('-')) {
                value = '-' + value.substr(1, value.length).replace(/\(|\)|\$|\-/g, '');
            } else {
                value = value.replace(/\(|\)|\$|\-/g, '');
            }
        }
        if (value.includes(this.thousandsSeparator)) value = value.split(this.thousandsSeparator).join('');
        let [integer, fraction = ''] = this.isDecimal
            ? (Number(value).toString() || '').split(this.decimalSeparator)
            : [Number(value).toString(), ''];
        const numberDecimal = this.isDecimal ? 2 : 0;
        fraction =
            decimalPrecision > 0 ? this.decimalSeparator + (fraction + '000000').substring(0, numberDecimal) : '';
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
        // If user types .xx we can display 0.xx
        if (integer === '') {
            integer = '0';
        } else if (integer.startsWith('$')) {
            // If there are multiple transforms, remove the previous dollar sign (blur and change at the same time)
            integer = integer.substr(1, integer.length);
        } else if (allowNegative && integer.startsWith('-')) {
            // If user inputs negative number set to paranthesis format
            integer = integer.substr(1, integer.length);
            return '(' + this.prefix + integer + fraction + ')';
        }
        return this.prefix + integer + fraction;
    }

    private parseToNumber(value: string, allowNegative = false) {
        if (value.includes(this.thousandsSeparator)) value = value.split(this.thousandsSeparator).join('');
        let [integer, fraction = ''] = this.isDecimal
            ? (Number(value).toString() || '').split(this.decimalSeparator)
            : [Number(value).toString(), ''];
        integer = integer.replace(new RegExp(/[^\d\.]/, 'g'), '');
        fraction =
            parseInt(fraction, 10) > 0 && 2 > 0 ? this.decimalSeparator + (fraction + '000000').substring(0, 2) : '';
        if (allowNegative && value.startsWith('(') && value.endsWith(')')) {
            return (-1 * parseFloat(integer + fraction)).toString();
        } else {
            return integer + fraction;
        }
    }
}
