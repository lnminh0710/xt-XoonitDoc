import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from "@app/utilities";

@Component({
    selector: 'image-text-cell-renderer',
    templateUrl: './image-text-cell-renderer.html',
    styleUrls: ['./image-text-cell-renderer.scss']
})
export class ImageTextCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public image: string;
    public title: string;
    public tooltip: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            //{"Image":"Full File Path","Text":"Trung Do",  "Tooltip":"abc"}
            this.title = obj.Text;
            this.image = obj.Image;
            this.tooltip = obj.Tooltip;
        }
    }
}
