import {Component, ViewEncapsulation} from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'checkbox-readonly-cell-renderer',
    templateUrl: './check-box-readonly-cell-renderer.html',
    styleUrls: ['./check-box-readonly-cell-renderer.scss']
})
export class CheckboxReadOnlyCellRenderer extends BaseAgGridCellComponent<boolean> implements ICellRendererAngularComp {   

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

}
