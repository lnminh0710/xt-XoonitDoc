import { Output, EventEmitter } from '@angular/core';
import { XnAgGridComponent } from '../pages/ag-grid-container/xn-ag-grid.component';
import { ColDef } from "ag-grid-community";

/**
 * BaseAgGridCellComponent
 */
export abstract class BaseAgGridCellComponent<T> {

    public params: any;
    public value: T;
    public cellStartedEdit: boolean;
    public colDef: ColDef;

    constructor() {
    }

    protected getCustomParam(params: any) { }

    public get componentParent(): XnAgGridComponent {
        if (this.params && this.params.context) {
            return this.params.context.componentParent;
        }
        return null;
    }

    protected setValue(value: T) {
        this.value = value;
    }

    /**
     * getColDef
     **/
    protected getColDef(): ColDef {
        if (this.params && this.params.column)
            return this.params.column.colDef;
        return null;
    }

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.cellStartedEdit = this.params.cellStartedEdit;
        if (this.componentParent && this.cellStartedEdit) {
            this.componentParent.isEditting = true;
        }
        this.colDef = this.getColDef();
        this.getCustomParam(params); 

        if (this.colDef && this.colDef.refData && this.colDef.refData.controlType &&
            this.colDef.refData.controlType.toLowerCase() == 'checkbox') {
            this.value = this.params.valueFormatted != undefined ? this.params.valueFormatted : this.params.value;
        }
    }

}
