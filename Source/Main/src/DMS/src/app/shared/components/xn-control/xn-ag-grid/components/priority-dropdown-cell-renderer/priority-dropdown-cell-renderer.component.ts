import { Component, ViewChild } from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp } from "ag-grid-angular";
import * as wjcInput from 'wijmo/wijmo.input';
import { DatatableService, CommonService, AppErrorHandler } from '@app/services';
import { ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'priority-dropdown-cell-renderer',
    templateUrl: './priority-dropdown-cell-renderer.html',
    styleUrls: ['./priority-dropdown-cell-renderer.scss']
})
export class PriorityDropdownCellRenderer extends BaseAgGridCellComponent<any> implements ICellRendererAngularComp, ICellEditorAngularComp {

    public options: Array<any> = [];
    public key: string;

    private cellCombo: wjcInput.ComboBox;
    @ViewChild('cellCombo') set content(content: wjcInput.ComboBox) {
        this.cellCombo = content;
    }

    constructor(private datatableService: DatatableService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler) {
        super();
    }

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.cellStartedEdit = this.params.cellStartedEdit;
        // Edit mode
        if (this.cellStartedEdit) {
            this.buildComboboxData();
        }
        if (this.value) {
            this.key = this.value;
        } else if (this.options.length) {
            this.key = this.options[this.options.length - 1].value;
        }

        setTimeout(() => {
            if (this.cellCombo && this.cellCombo.hostElement) {
                this.cellCombo.hostElement.addEventListener('keydown', this.onKeydown.bind(this));
            }
        });
    }

    refresh(params: any): boolean {
        return false;
    }

    /**
     * buildComboboxData
     **/
    public buildComboboxData() {
        this.options = this.params.context.componentParent.priorities;
    }

    private onKeydown(evt) {
        if (evt.key !== 'Enter' && evt.key !== 'Tab') {
            evt.stopPropagation();
        }
    }

    public onPriorityChangeValue($event) {
        if ($event.selectedItem && $event.selectedItem.value) {
            this.params.context.componentParent.updatePriority(this.params.data, $event.selectedItem);
        }
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.key;
    }
}
