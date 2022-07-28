import { Component, AfterViewInit, ViewChild, ViewContainerRef} from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'date-cell-renderer',
    templateUrl: './date-cell-renderer.html',
    styleUrls: ['./date-cell-renderer.scss']
})
export class DateCellRenderer extends BaseAgGridCellComponent<string> implements ICellEditorAngularComp, AfterViewInit {   

    public globalDateFormat: string;

    @ViewChild('input', { read: ViewContainerRef }) public input;

    constructor() {
        super();
    }   

    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        })
    }

    /**
     * getCustomParam
     * @param params
     */
    protected getCustomParam(params: any) {
        if (this.componentParent) {
            this.globalDateFormat = this.componentParent.globalDateFormat;
        }
    }


    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }
}
