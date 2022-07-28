import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from "@app/utilities";

@Component({
    selector: 'icon-text-cell-renderer',
    templateUrl: './icon-text-cell-renderer.html',
    styleUrls: ['./icon-text-cell-renderer.scss']
})
export class IconTextCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public icon: string;
    public title: string;
    public color: string;

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
            let icon = obj.icon;
            if (icon) {
                if (icon.indexOf('fa-') !== -1) {
                    this.icon = icon;
                } else {
                    this.icon = 'fa-' + icon;
                }
            }
        }
    }
}
