import * as wjcCore from 'wijmo/wijmo';
import * as wjcGrid from 'wijmo/wijmo.grid';

import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Uti } from '@app/utilities';

// Globalize pipe
@Pipe({
    name: 'glbz',
    // stateful pipe
    pure: false
})
export class GlbzPipe {
    transform(value: any, args: string[]): any {
        return wjcCore.Globalize.format(value, args[0]);
    }
}

// ToDate pipe - converts date/time string to a Date object
@Pipe({
    name: 'toDate'
})
export class ToDatePipe {
    transform(value: any, args: string[]): any {
        if (value && wjcCore.isString(value)) {
            // parse date/time using RFC 3339 pattern
            var dt = wjcCore.changeType(value, wjcCore.DataType.Date, 'r');
            if (wjcCore.isDate(dt)) {
                return dt;
            }
        }
        return value;
    }
}

// CellRange pipe
@Pipe({
    name: 'cellRange'
})
export class CellRangePipe {
    transform(value: any, args: string[]): any {
        var rng = '';
        if (value instanceof wjcGrid.CellRange) {
            rng = '(' + value.row + ';' + value.col + ')';
            if (!value.isSingleCell) {
                rng += '-(' + value.row2 + ';' + value.col2 + ')';
            }
        }
        return rng;
    }
}


@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}


@Pipe({
    name: 'toString'
})
export class ToStringPipe {
    transform(value: any, args: string[]): any {
        if (value && wjcCore.isString(value)) {
            return value;
        }
        return '';
    }
}

@Pipe({
    name: 'displaySeparator'
})
export class DisplaySeparator implements PipeTransform {
    private numberPipe: DecimalPipe;
    constructor(@Inject(LOCALE_ID) private locale: string) {
        this.numberPipe = new DecimalPipe(this.locale);
    }
    transform(value: any, format: string): any {
        if (value && format == 'N') {
            value = this.numberPipe.transform(value);
        }
        return value;
    }
}

@Pipe({
    name: 'toNumber'
})
export class ToNumberPipe implements PipeTransform {
    transform(value: string): any {
        let retNumber = Number(value);
        return isNaN(retNumber) ? 0 : retNumber;
    }
}

//https://blog.fullstacktraining.com/binding-html-with-angular/
@Pipe({
    name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }
    transform(value: any): any {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}

@Pipe({
    name: 'tranformDecimal'
})
export class TransFormDecimalPipe implements PipeTransform {

    constructor() { }

    transform(value: any, withComma?: boolean, quantityNumber = 2, isRounded?: boolean): any {
        value = Uti.transformCommaNumber(value);
        if (isNaN(value)) {
            return;
        }
        return Uti.transformCommaNumber(Uti.transformNumberHasDecimal(value, quantityNumber, isRounded), withComma);
    }
}
