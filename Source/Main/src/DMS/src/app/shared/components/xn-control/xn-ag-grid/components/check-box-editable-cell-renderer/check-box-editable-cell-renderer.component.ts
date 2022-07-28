import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ICellRendererAngularComp, ICellEditorAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from '../../../../../../utilities';
import { DatatableService } from '../../../../../../services';

@Component({
    selector: 'check-box-editable-cell-renderer',
    templateUrl: './check-box-editable-cell-renderer.html',
    styleUrls: ['./check-box-editable-cell-renderer.scss'],
})
export class CheckboxEditableCellRenderer
    extends BaseAgGridCellComponent<any>
    implements ICellEditorAngularComp, AfterViewInit
{
    public isDisabled = false;
    public isDisplay = true;

    constructor(private datatableService: DatatableService) {
        super();
    }

    ngAfterViewInit() {
        if (this.params) {
            this.isDisplay = this.params.data.IsDisabledRow !== undefined ? !this.params.data.IsDisabledRow : true;
            let hasDisabledBy = this.datatableService.hasDisplayField(this.params.colDef.refData, 'DisabledBy');
            if (hasDisabledBy) {
                let disabledByField = this.datatableService.getDisplayFieldValue(
                    this.params.colDef.refData,
                    'DisabledBy',
                );
                if (disabledByField) {
                    this.isDisabled =
                        !Uti.isEmptyObject(this.params.data) &&
                        this.params.data['DT_RowId'].indexOf('newrow') === -1 &&
                        !!this.params.data[disabledByField];
                }
            }
        }
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
