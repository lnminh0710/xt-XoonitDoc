import { Component, TemplateRef } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'template-edit-cell-renderer',
    templateUrl: './template-edit-cell-renderer.html',
    styleUrls: ['./template-edit-cell-renderer.scss']
})
export class TemplateEditCellRenderer extends BaseAgGridCellComponent<any> implements ICellEditorAngularComp {   

    public template: TemplateRef<any>;
    public templateContext: { $implicit: any, params: any };

    constructor() {
        super();
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    public getCustomParam() {
        this.template = this.params['ngTemplate'];
        this.templateContext = {
            $implicit: !this.params['customParam'] ? this.params.value : this.params['customParam'],
            params: this.params
        };
    }
}
