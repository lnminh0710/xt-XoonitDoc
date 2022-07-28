import { Component, TemplateRef } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'template-cell-renderer',
    templateUrl: './template-cell-renderer.html',
    styleUrls: ['./template-cell-renderer.scss']
})
export class TemplateCellRenderer extends BaseAgGridCellComponent<any> implements ICellRendererAngularComp {   

    public template: TemplateRef<any>;
    public templateContext: { $implicit: any, params: any };

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    public getCustomParam() {
        this.template = this.params['ngTemplate'];
        this.templateContext = {
            $implicit: !this.params['customParam'] ? this.params.value : this.params['customParam'],
            params: this.params
        };
    }
}
