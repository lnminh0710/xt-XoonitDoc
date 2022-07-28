import { NativeDateAdapter } from '@xn-control/light-material-ui/core';
import * as moment from 'moment';

export class XnDateAdapter extends NativeDateAdapter {
    parse(value: any): Date | null {
        if (value === '') return null;

        if (typeof value === 'string' && value.indexOf('.') > -1) {
            const str = value.split('.');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return new Date(timestamp);
    }
    format(date: Date, displayFormat: string): string {
        if (displayFormat === 'DD.MM.YYYY') {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return this._to2digit(day) + '.' + this._to2digit(month) + '.' + year;
        } else if (displayFormat === 'MMM YYYY') {
            return moment(date).format('MMM YYYY');
        } else {
            return date.toDateString();
        }
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}
