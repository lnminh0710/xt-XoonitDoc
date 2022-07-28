import { Component } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'control-checkbox-cell-renderer',
    templateUrl: './control-checkbox-cell-renderer.html',
    styleUrls: ['./control-checkbox-cell-renderer.scss']
})
export class ControlCheckboxCellRenderer extends BaseAgGridCellComponent<boolean> implements ICellEditorAngularComp {

    constructor() {
        super();
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    /**
     * onCheckboxChange
     * @param event
     */
    onCheckboxChange(event) {
        const status = event.checked;
        this.componentParent.checkBoxChange(this.params, status)
    }
}
