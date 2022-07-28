import { Component, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from "../../../../../../utilities";
import { DatatableService } from "../../../../../../services";

@Component({
    selector: 'master-unmerge-check-box-cell-renderer',
    templateUrl: './master-unmerge-check-box-cell-renderer.html',
    styleUrls: ['./master-unmerge-check-box-cell-renderer.scss']
})
export class MasterUnmergeCheckboxCellRenderer extends BaseAgGridCellComponent<boolean> implements ICellEditorAngularComp, AfterViewInit {


    constructor(
        private datatableService: DatatableService
    ) {
        super();
    }

    ngAfterViewInit() {
       
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
        this.componentParent.checkBoxChange(this.params, status);
    }
}
