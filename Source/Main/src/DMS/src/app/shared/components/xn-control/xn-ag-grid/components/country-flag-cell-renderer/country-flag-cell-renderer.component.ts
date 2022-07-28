import { Component, ViewEncapsulation } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { AppState } from '@app/state-management/store';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'country-flag-cell-renderer',
    templateUrl: './country-flag-cell-renderer.html',
    styleUrls: ['./country-flag-cell-renderer.scss']
})
export class CountryFlagCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public code: string = null;
    public country: string = null;
    public countryList: any[] = [];

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    /**
     * getCustomParam
     * @param params
     */
    protected getCustomParam(params: any) {
        if (this.value) {
            this.value = this.value.replace(/;\s*$/, "");
            if (this.value.indexOf(';') !== -1) {
                let countryList = this.value.split(';');
                countryList.forEach((country) => {
                    const arr: Array<string> = country.split(',');
                    this.countryList.push({
                        code: arr[0],
                        country: arr[1],
                        language: arr[2]
                    });
                })
            } else {
                const arr: Array<string> = this.value.split(',');
                if (arr.length) {
                    if (arr.length > 1) {
                        this.code = arr[0];
                        this.country = arr[1].indexOf('-') !== -1 ? arr[1].split('-')[0] : arr[1];
                    } else if (arr.length === 1 && params.data && (params.data.IsoCode || params.data.isoCode)) {
                        let isoCode = params.data.IsoCode || params.data.isoCode;
                        this.code = isoCode;
                        this.country = arr[0];
                    } else {
                        this.code = arr[0];
                        this.country = arr[0];
                    }
                }
            }
        }
    }

}
