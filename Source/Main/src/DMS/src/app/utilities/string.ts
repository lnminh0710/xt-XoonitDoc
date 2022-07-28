import { Injectable } from '@angular/core';
@Injectable()
export class String {
    public static Empty = '';

    public static IsNullOrWhiteSpace(value: string): boolean {
        try {
            if (value == null || typeof value == 'undefined')
                return true;

            return value.toString().replace(/\s/g, '').length < 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public static hardTrimBlank(value: string): string {
        try {
            if (value == null || typeof value == 'undefined')
                return '';

            return value.split(' ').join('');
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    public static Join(delimiter, ...args): string {
        try {
            let tempString = String.Empty;
            let count = 0;
            if ($.isArray(args[0]) || args[0] === typeof Array) {
                for (let i = 0; i < args[0].length; i++) {
                    const current = args[0][i];
                    if (i < args[0].length - 1)
                        tempString += current + delimiter;
                    else
                        tempString += current;
                }

                return tempString;
            } else if (typeof args[0] == 'object') {
                $(args[0]).each(function () {
                    if (count < args[0].length - 1)
                        tempString += $(this).text() + delimiter;
                    else
                        tempString += $(this).text();
                    count++;
                });

                return tempString;
            }

            return String.join(delimiter, args);
        } catch (e) {
            console.log(e);
            return String.Empty;
        }
    }

    public static Format(format, ...args): string {
        try {
            return format.replace(/{(\d+(:\w*)?)}/g, function (match, i) { // 0
                const s = match.split(':');
                if (s.length > 1) {
                    i = i[0];
                    match = s[1].replace('}', ''); // U
                }

                const arg = String.parsePattern(match, args[i]);
                return typeof arg != 'undefined' && arg != null ? arg : String.Empty;
            });
        } catch (e) {
            console.log(e);
            return String.Empty;
        }
    }

    private static parsePattern(match, arg): string {
        if (arg == null || arg == undefined)
            return arg;

        let splitted = arg.split('-');
        let day = splitted[splitted.length - 1];
        let month = splitted[splitted.length - 2];
        let year = splitted[splitted.length - 3];
        switch (match) {
            case 'L':
                arg = arg.toLowerCase();
                break;
            case 'U':
                arg = arg.toUpperCase();
                break;
            case 'd':
                if (splitted.length <= 1)
                    return arg;
                day = day.split('T')[0];
                day = day.split(' ')[0];

                arg = day + '.' + month + '.' + year;
                break;
            case 's':
                splitted = arg.replace(',', '').split('.');
                if (splitted.length <= 1)
                    return arg;

                let time = splitted[splitted.length - 1].split(' ');
                if (time.length > 1)
                    time = time[time.length - 1];

                year = splitted[splitted.length - 1].split(' ')[0];
                month = splitted[splitted.length - 2];
                day = splitted[splitted.length - 3];

                arg = year + '-' + month + '-' + day;
                if (time.length > 1)
                    arg += 'T' + time;
                else
                    arg += 'T' + '00:00:00';
                break;
            case 'n':
                if (isNaN(parseInt(arg)) || arg.length <= 3)
                    break;

                arg = arg.toString();
                const mod = arg.length % 3;
                let output = (mod > 0 ? (arg.substring(0, mod)) : String.Empty);
                for (let i = 0; i < Math.floor(arg.length / 3); i++) {
                    if ((mod == 0) && (i == 0))
                        output += arg.substring(mod + 3 * i, mod + 3 * i + 3);
                    else
                        output += '.' + arg.substring(mod + 3 * i, mod + 3 * i + 3);
                }
                arg = output;
                break;
            default:
                break;
        }

        return arg;
    }

    private static join(delimiter, args): string {
        let temp = String.Empty;
        for (let i = 0; i < args.length; i++) {
            if (String.IsNullOrWhiteSpace(args[i]) || (typeof args[i] != 'number' && typeof args[i] != 'string'))
                continue;

            const arg = '' + args[i];
            temp += arg;
            for (let i2 = i + 1; i2 < args.length; i2++) {
                if (String.IsNullOrWhiteSpace(args[i2]))
                    continue;

                temp += delimiter;
                i = i2 - 1;
                break;
            }
        }
        return temp;
    }
}

/*
@Injectable()
export class StringBuilder {
    //public Values = [];

    //constructor(value: string) {
    //    this.Values = new Array(value);
    //}

    //public ToString() {
    //    return this.Values.join('');
    //}
    //public Append(value: string) {
    //    this.Values.push(value);
    //}
    //public AppendFormat(value: string, ...args) {
    //    //this.Values.push(String.Format(value, args));
    //}
    //public Clear() {
    //    this.Values = [];
    //}
}
*/