import {Component} from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'custom-pinned-row-renderer',
    templateUrl: './custom-pinned-row-renderer.html',
    styleUrls: ['./custom-pinned-row-renderer.scss']
})
export class CustomPinnedRowRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {   

    public style: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

}
