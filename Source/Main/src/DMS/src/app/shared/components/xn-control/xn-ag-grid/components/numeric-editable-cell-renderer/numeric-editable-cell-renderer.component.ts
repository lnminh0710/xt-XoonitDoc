import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DatatableService } from '@app/services';
import { ICellRendererAngularComp, ICellEditorAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'numeric-editable-cell-renderer',
    templateUrl: './numeric-editable-cell-renderer.html',
    styleUrls: ['./numeric-editable-cell-renderer.scss'],
})
export class NumericEditableCellRenderer
    extends BaseAgGridCellComponent<any>
    implements ICellEditorAngularComp, AfterViewInit {
    public globalNumberFormat: string;

    @ViewChild('input', { read: ViewContainerRef }) public input;

    constructor(private datatableService: DatatableService) {
        super();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        });
    }

    isCancelAfterEnd?(): any {
        this.implementWhenBlur();
    }

    /**
     * getCustomParam
     * @param params
     */
    protected getCustomParam(params: any) {
        if (this.componentParent) {
            this.globalNumberFormat = this.componentParent.globalNumberFormat;
        }
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    lostFocus(event) {
        this.componentParent.stopEditing();
    }
    private implementWhenBlur() {
        this.datatableService.influencingField(
            this.params.column.colDef.refData?.setting?.Setting,
            this.params.node.data,
            this.params?.column?.colId,
            this.value,
        );
    }
    valueChange() {
        if (!this.value || this.value === this.params.node.data[this.params?.column?.colId]) return;

        this.params.node.data[this.params?.column?.colId] = this.value;
        const affectingField = this.datatableService.affectingField(
            this.params.column.colDef.refData?.setting?.Setting,
            this.params.node.data,
            this.params?.column?.colId
        );

        this.componentParent.updateCellValue(affectingField.colId, affectingField.data, this.params.node, false);
    }
}
