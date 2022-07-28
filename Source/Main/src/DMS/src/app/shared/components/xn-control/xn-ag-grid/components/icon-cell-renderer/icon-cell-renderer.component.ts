import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'icon-cell-renderer',
    templateUrl: './icon-cell-renderer.html',
    styleUrls: ['./icon-cell-renderer.scss']
})
export class IconCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public icon: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        if (this.value) {
            if (this.value.indexOf('fa-') !== -1) {
                this.icon = this.value;
            } else {
                this.icon = 'fa-' + this.value;
            }
        }
    }
}
