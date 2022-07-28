import { Injectable } from '@angular/core';
import { Uti } from '@app/utilities';

@Injectable()
export class WidgetChartService {
    public buildSingleData(collectionData: any, columns: any) {
        const xSeries = columns.xSeries.map(v => v);
        const ySeries = columns.ySeries.map(v => v);
        if (!collectionData || xSeries.length < 1 || ySeries.length < 1) {
            return [];
        }

        const result = [];
        const copyXSeries = { ...xSeries };
        const copyYSeries = { ...ySeries };
        for (const key of collectionData) {
            if (key[copyXSeries[0]] && key[copyYSeries[0]]) {
                result.push({
                    name: key[copyXSeries[0]],
                    value: this.convertValue(key[copyYSeries[0]])
                });
            }
        }
        return result;
    }

    public buildMultiData(collectionData: any, columns: any) {
        const xSeries = columns.xSeries.map(v => v);
        const ySeries = columns.ySeries.map(v => v);
        if (!collectionData || xSeries.length < 1 || ySeries.length < 1) {
            return [];
        }

        const reduceData = collectionData.reduce((val, obj) => {
            const valueXSeries = obj[xSeries[0]];
            for (const key of ySeries) {
                (val[valueXSeries] = val[valueXSeries] || []).push({
                    name: key,
                    value: this.convertValue(obj[key])
                });
            }
            return val;
        }, {});

        const value = [];
        Object.keys(reduceData).forEach((name) => {
            value.push({
                name: name,
                series: reduceData[name]
            });
        });

        return value;
    }
    // check column is Date type
    public isDate(sDate) {
        if (sDate.toString() == parseInt(sDate, 10).toString()) return false;
        const tryDate = new Date(sDate);
        return (tryDate && tryDate.toString() != 'NaN' && tryDate.toString() != 'Invalid Date');
    }

    private convertValue(value) {
        if (!Uti.isNullUndefinedEmptyObject(value)) {
            const floatValue = parseFloat(value)
            if (isNaN(floatValue)) {
                return 0;
            }

            return floatValue;
        }

        return 0;
    }
}
