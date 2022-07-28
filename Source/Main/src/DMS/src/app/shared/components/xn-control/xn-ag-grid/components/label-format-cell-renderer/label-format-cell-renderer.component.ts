import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from "@app/utilities";

@Component({
    selector: 'label-format-cell-renderer',
    templateUrl: './label-format-cell-renderer.html',
    styleUrls: ['./label-format-cell-renderer.scss']
})
export class LabelFormatCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public backgroundColor: string;
    public borderColor: string;
    public color: string;
    public title: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            this.title = obj.title;
            this.color = obj.color;
            this.borderColor = obj.borderColor;
            this.backgroundColor = obj.backgroundColor;
        }
    }
}
