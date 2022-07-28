import { Directive, HostListener, Input, ElementRef, OnDestroy, Output, EventEmitter, forwardRef, Renderer2 } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { InputTypeNumber } from '@app/models/input-numeric-type.enum';

@Directive({
    selector: '[xn-numeric]',
    host: {
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => XnInputNumericDirective),
            multi: true
        },
        NgModel
    ]
})

export class XnInputNumericDirective implements OnDestroy, ControlValueAccessor {

    @Input() typeNumber = InputTypeNumber.Decimal; // 2 type: integer, decimal
    @Input() format = ''; // 2 type: N: has separator, F: don't have
    @Input() min: number;
    @Input() max: number;
    @Input() set isDisabled(isDisabled: boolean) {
        this.elementRef.nativeElement.disabled = isDisabled ? true : null;
    }
    @Input() set hidden(hidden: boolean) {
        if (hidden) {
            this.renderer2.setStyle(this.elementRef.nativeElement, 'display', 'none');
        } else {
            this.renderer2.setStyle(this.elementRef.nativeElement, 'display', 'block');
        }
    }
    @Input() set textAlign(textAlign: string) {
        // 2 type: left, right. Default is left
        const value = textAlign ? textAlign : 'left';
        this.renderer2.setStyle(this.elementRef.nativeElement, 'text-align', value);
    }

    @Input() isRequired: any;
    @Input() showSpinner: any;
    @Input() inputType: any;

    @Output() initialized = new EventEmitter<any>();

    previousValue: any = '';
    regexDecimal = '^-?[0-9]*\.?[0-9]{0,2}$';
    regexInteger = '^-?[0-9]*$';
    maxLength = 16;

    public onChange: any = Function.prototype;
    public onTouched: any = Function.prototype;

    constructor(
        private elementRef: ElementRef,
        private renderer2: Renderer2,
        private decimalPipe: DecimalPipe) {
        renderer2.setStyle(elementRef.nativeElement, 'border', 'solid 1px #d2d6de');
        renderer2.setStyle(elementRef.nativeElement, 'text-align', 'left');
        renderer2.setStyle(elementRef.nativeElement, 'padding-right', '15px');
    }

    // Required forControlValueAccessor interface
    public registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }

    // Required forControlValueAccessor interface
    public registerOnTouched(fn: () => {}): void { this.onTouched = fn; };


    writeValue(value: any): void {
        if (value) {
            let formatted = this.checkAndFormatNumber(value);
            this.render(formatted);
        }
        else {
            this.render('');
        }
    }

    private render(value: string) {
        const element = this.elementRef.nativeElement;
        this.renderer2.setProperty(element, 'value', value);
    }

    setDisabledState(isDisabled: boolean): void { }

    @HostListener('keydown.out-zone', ['$event']) onKeyDown(event: KeyboardEvent) {

        const e = <KeyboardEvent>event;

        if (e.key == '.') {
            let value: string = this.elementRef.nativeElement.value;
            if (value && value.indexOf('.') >= 0) {
                e.preventDefault();
                return;
            }
        }

        if (this.allowControlKey(e)) {
            // let it happen, don't do anything
            return;
        }

        // if have selection range , skip this case
        if (this.elementRef.nativeElement.selectionStart == this.elementRef.nativeElement.selectionEnd) {
            // on keydown, elementRef value keep old value so current length will equal length elementRef + 1
            if ((this.elementRef.nativeElement.value.length + 1) > this.maxLength) {
                e.preventDefault();
            }
        }

        // Ensure that it is a number and stop the keypress
        if (e.key === ' ' || isNaN(Number(e.key))) {
            e.preventDefault();
        }

        const numberNotComma = this.elementRef.nativeElement.value.replace(/,/g, '');
        this.previousValue = this.checkRegexExpression(numberNotComma) && numberNotComma.length <= this.maxLength
            ? this.elementRef.nativeElement.value
            : this.previousValue;
    }

    @HostListener('keyup.out-zone', ['$event']) onKeyUp(event: any) {
        let value = this.elementRef.nativeElement.value;
        if (value) {
            const cursorPositionStart = this.elementRef.nativeElement.selectionStart;
            const formatted = this.checkAndFormatNumber(value);
            this.render(formatted);
            this.setTextCursorPosition(value, cursorPositionStart, true);
            let raw = this.reverseFormatNumber(this.elementRef.nativeElement.value, 'en');
            this.onChange(raw);
        }
        else {
            this.onChange(value);
        }
    }

    @HostListener('blur', ['$event']) focusOut(event: any): void {
        let value = this.elementRef.nativeElement.value;
        if (value) {
            let formatted = this.checkAndFormatNumber(value);
            this.removeDot(formatted);
            //this.elementRef.nativeElement.value = this.isExistDotOrMinus(this.elementRef.nativeElement.value) ? this.elementRef.nativeElement.value : '';
            let raw = this.reverseFormatNumber(this.elementRef.nativeElement.value, 'en');
            this.onChange(raw);
        }
        else {
            this.onChange(value);
        }
    }

    private checkAndFormatNumber(value: string) {
        let formatted = '';
        try {
            if (value) {
                value = '' + value;
                const cursorPositionStart = this.elementRef.nativeElement.selectionStart;
                const numberNotComma: any = value.replace(/,/g, '');
                // check valid regex and length must be lower maxLength
                if (this.checkRegexExpression(numberNotComma) && numberNotComma.length <= this.maxLength) {
                    formatted = this.formatDecimalNumber(numberNotComma, cursorPositionStart, value, true);
                } else {
                    const numberNotCommaPrevious = this.previousValue.replace(/,/g, '');
                    if (this.previousValue) {
                        formatted = this.formatDecimalNumber(numberNotCommaPrevious, cursorPositionStart, value, false);
                    }
                }
                if (!formatted) {
                    formatted = this.formatDecimalNumber(numberNotComma, cursorPositionStart, value, true);
                }
            }
        } catch{ }
        return formatted;
    }

    private removeDot(value: string) {
        const indexAfterDot = value.indexOf('.') + 1;
        if (!value.charAt(indexAfterDot)) {
            value = value.replace(/\./g, '');
        }
        return value;
    }

    private removeNegativeSignal(numberNotComma: any): any {
        const hasNegativeSignal = numberNotComma.charAt(0) === '-';
        numberNotComma = numberNotComma.replace(/-/g, '');
        numberNotComma = hasNegativeSignal ? `-${numberNotComma}` : numberNotComma;
        return numberNotComma;
    }

    private formatDecimalNumber(numberNotComma: number, cusorPositionStart: number, value: any, isValid: boolean) {
        let formatted: any;
        numberNotComma = this.removeNegativeSignal(numberNotComma);
        numberNotComma = this.checkMinMaxNumber(numberNotComma);
        const parts = numberNotComma.toString().split('.');
        if (parts[1]) {
            formatted = this.format === 'N' && this.isExistDotOrMinus(this.elementRef.nativeElement.value)
                ? (parts[1].slice(-1) == '0'
                    ? this.decimalPipe.transform(numberNotComma, '.1-2')
                    : this.decimalPipe.transform(numberNotComma, '.0-2'))
                : numberNotComma;
        } else {
            parts[0] = this.format === 'N' && this.isExistDotOrMinus(parts[0])
                ? this.decimalPipe.transform(parts[0], '.0-2')
                : parts[0];
            formatted = parts.join('.');
        }

        //this.setTextCusorPosition(value, cusorPositionStart, isValid);
        return formatted;
    }

    private checkMinMaxNumber(numberNotComma: number): number {
        numberNotComma = !isNaN(Number(this.min)) && numberNotComma < this.min ? this.min : numberNotComma;
        numberNotComma = !isNaN(Number(this.max)) && numberNotComma > this.max ? this.max : numberNotComma;
        return numberNotComma
    }

    private setTextCursorPosition(oldValue: any, currentPosition: number, isValid = true) {
        let newPosition = currentPosition;
        if (isValid) {
            const quantityCommaBeforeCursor = this.countQuantityComma(oldValue, currentPosition);
            const currentQuantityCommaBeforeCursor = this.countQuantityComma(this.elementRef.nativeElement.value, currentPosition);
            newPosition += currentQuantityCommaBeforeCursor - quantityCommaBeforeCursor;
        } else {
            newPosition -= oldValue.length - this.elementRef.nativeElement.value.length;
        }
        this.elementRef.nativeElement.setSelectionRange(newPosition, newPosition, 'none');
    }

    private countQuantityComma(value: string, cusorPosition: number): number {
        return value.substring(0, cusorPosition).match(/,/g)
            ? value.substring(0, cusorPosition).match(/,/g).length : 0;
    }

    private checkRegexExpression(text: string): boolean {
        const regExp = this.typeNumber === InputTypeNumber.Decimal
            ? this.regexDecimal : this.regexInteger;
        const regex = new RegExp(regExp);
        return regex.test(text);
    }

    private isExistDotOrMinus(value: any): boolean {
        const lengthMinus = (value.match(/-/g)) ? (value.match(/-/g)).length : 0;
        const lengthDot = (value.match(/\./g)) ? (value.match(/\./g)).length : 0;
        return value !== '-' && value !== '.' && value !== '-.' && lengthMinus < 2 && lengthDot < 2;
    }

    private allowControlKey(e: any): boolean {
        // Allow: Delete(46), Backspace(8), Tab(9), Escape(27), Enter(13), 2 keyCode of "."(110, 190), 2 keyCode of "-"(109, 189)
        const listAllowKeyCode = this.typeNumber === InputTypeNumber.Decimal
            ? [46, 8, 9, 27, 13, 110, 190, 109, 189]
            : [46, 8, 9, 27, 13, 109, 189];
        return listAllowKeyCode.indexOf(e.keyCode) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) || // Allow: Ctrl+A
            (e.keyCode == 67 && e.ctrlKey === true) || // Allow: Ctrl+C
            (e.keyCode == 86 && e.ctrlKey === true) || // Allow: Ctrl+V
            (e.keyCode == 88 && e.ctrlKey === true) || // Allow: Ctrl+X
            (e.keyCode === 65 && e.metaKey === true) || // Allow: Cmd+A (Mac)
            (e.keyCode === 67 && e.metaKey === true) || // Allow: Cmd+C (Mac)
            (e.keyCode === 86 && e.metaKey === true) || // Allow: Cmd+V (Mac)
            (e.keyCode === 88 && e.metaKey === true) || // Allow: Cmd+X (Mac)
            (e.keyCode >= 35 && e.keyCode <= 39);  // Allow: home, end, left, right
    }

    ngOnDestroy() {
        this.elementRef.nativeElement.removeEventListener('keydown', this.onKeyDown);
        this.elementRef.nativeElement.removeEventListener('keyup', this.onKeyUp);
        this.elementRef.nativeElement.removeEventListener('blur', this.focusOut);
    }

    private reverseFormatNumber(val: string, locale: string | string[]) {
        let group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, '');
        let decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');
        let reversedVal: any = val.replace(new RegExp('\\' + group, 'g'), '');
        reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
        return Number.isNaN(reversedVal) ? 0 : reversedVal;
    }

}

