import { Directive, ElementRef, HostListener, Input, Optional, Renderer2, Self } from '@angular/core';
import { NgControl  } from '@angular/forms';
import { Uti } from '@app/utilities';

@Directive({
    selector: '[XnDecimalNumber]',
})
export class XnDecimalNumberDirective {

    private specialKeys: Array<string> = [
        'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', 'Control', 'Shift',
        'Enter', 'CapsLock'
    ];

    private integerRegex: RegExp = /^\d+(?=\d)\d$/;
    private middleRegex: RegExp = /^\d+(?=\.)\.{1}$/;
    private middleRegexstr: string = '^\\d+(?=\\.)\\.{1}';
    private decimalRegex: RegExp = /^\d+(?=\.)\.{1}\d{1,2}$/;

    private _decimalNumber: number = 2;
    @Input() set XnDecimalNumber(dec: number) {
        this._decimalNumber = dec;
    };

    @Input() isAutoTransform: boolean = true;
    @Input() isInteger: boolean;

    private _limit: number = 9;
    @Input() set limit(l : number) {
        this._limit = l - this._decimalNumber > 1 ? l : this._decimalNumber + 2;
    };

    constructor(
        private elementRef: ElementRef,
        @Optional() @Self() private ngControl: NgControl
    ) {
    }

    @HostListener('paste', ['$event'])
    onPatse(event: ClipboardEvent) {
        const value =  event.clipboardData.getData('text/plain')?.replace(/\'/g, '');
        this.preventAndStop(event);
        if (isNaN(Number(value))) {
            return;
        } else {
            this.ngControl.control?.patchValue(value);
            this.elementRef.nativeElement.value = value;
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if (this.specialKeys.includes(event.key) || event.shiftKey || event.ctrlKey) {
            return;
        }
        const valueRef = this.elementRef.nativeElement.value;
        if (this.isInteger) {
            this.checkInteger(event, valueRef);
        } else {
            this.checkDecimal(event, valueRef);
        }
    }
    @HostListener('input', ['$event'])
    onInputChange(event: InputEvent) {
        this.transformDecimal();
    }

    @HostListener('blur')
    onBlur() {
        if (this.isAutoTransform && !this.isInteger) {
            const valueRef = Uti.transformCommaNumber(this.elementRef.nativeElement.value);
            this.elementRef.nativeElement.value = isNaN(+valueRef) ? valueRef : Uti.transformCommaNumber(Uti.transformNumberHasDecimal(
                valueRef,
                this._decimalNumber,
                false
            ), true)
        }
    }

    private checkInteger(event: KeyboardEvent, value: string) {
        value = Uti.transformCommaNumber(value);
        let selectionStart = this.elementRef.nativeElement.selectionStart;
        let selectionEnd = this.elementRef.nativeElement.selectionEnd;
        if (/\d/.test(event.key)) {
            if (value.length >= this._limit && selectionStart === selectionEnd) {
                this.preventAndStop(event);
            }
            return;
        }
        this.preventAndStop(event);
    }

    private checkDecimal(event: KeyboardEvent, value: string) { 
        value = Uti.transformCommaNumber(value);
        const index = value.indexOf('.');
        let split = value.split('.');
        let selectionStart = this.elementRef.nativeElement.selectionStart;
        let selectionEnd = this.elementRef.nativeElement.selectionEnd;
        const selectionRedundancy = split[0].length / 3;
        if (selectionRedundancy > 1) {
            selectionStart = selectionRedundancy > Math.floor(selectionRedundancy)
                ? selectionStart - selectionRedundancy
                : selectionStart - selectionRedundancy - 1;
            selectionEnd = selectionRedundancy > Math.floor(selectionRedundancy)
                ? selectionEnd - selectionRedundancy
                : selectionEnd - selectionRedundancy - 1;
        }

        const lengthAfterCalculation = split[0].length - (selectionEnd - selectionStart);

        if (lengthAfterCalculation >= this._limit - this._decimalNumber) {
            if (
                (index > -1 && selectionStart <= index) ||
                (index < 0 && event.key !== '.')
            ) {
                this.preventAndStop(event);
            }
        }

        if (/\d|\./g.test(event.key)) {
            if (event.key === '.' && /\./g.test(value)) {
                this.preventAndStop(event);
            }
            return;
        }
        this.preventAndStop(event);
    }

    private transformDecimal() {
        let valueRef = Uti.transformCommaNumber(this.elementRef.nativeElement.value);
        const caret = this.elementRef.nativeElement.selectionStart;
        let split = valueRef.split('.');
        if (split[1]) {
            valueRef = split[0] + '.' + split[1].substr(0, 2);
        }
        const returnValue =  Uti.transformCommaNumber(valueRef, true);
        if (this.elementRef.nativeElement.value !== returnValue) {
            this.elementRef.nativeElement.value = returnValue;
            this.ngControl.control?.patchValue(returnValue);
            this.elementRef.nativeElement.setSelectionRange(caret + 1, caret + 1);
        }
    }

    private preventAndStop(event, needStop?: boolean) {
        event.preventDefault();
        if (needStop) {
            event.stopPropagation();
        }
    }
}
