import {Component} from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'credit-card-cell-renderer',
    templateUrl: './credit-card-cell-renderer.html',
    styleUrls: ['./credit-card-cell-renderer.scss']
})
export class CreditCardCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {   

    public creditCards: Array<string> = [];

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
            this.creditCards = this.value.split(',');
        }
    }
}
