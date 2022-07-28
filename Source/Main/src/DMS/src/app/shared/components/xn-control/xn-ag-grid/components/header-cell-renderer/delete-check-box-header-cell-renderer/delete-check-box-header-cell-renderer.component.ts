import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp, ICellEditorAngularComp, IHeaderAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../../shared/base-ag-grid-cell-component';
import { Subscription } from 'rxjs';
import { ColHeaderKey } from '../../../shared/ag-grid-constant';
import { IHeaderParams } from 'ag-grid-community';

@Component({
    selector: 'delete-check-box-header-cell-renderer',
    templateUrl: './delete-check-box-header-cell-renderer.html',
    styleUrls: ['./delete-check-box-header-cell-renderer.scss'],
})
export class DeleteCheckboxHeaderCellRenderer
    extends BaseAgGridCellComponent<boolean>
    implements IHeaderAngularComp, OnDestroy
{
    private _cellValueChangedSubscription: Subscription;
    constructor() {
        super();
    }
    refresh(params: IHeaderParams): boolean {
        console.log('Method not implemented.');
        return false;
    }

    public getCustomParam() {
        this._cellValueChangedSubscription = this.componentParent.onDeleteChecked.subscribe((data) => {
            if (!data || !data.colDef || data.colDef.field != this.colDef.field) {
                return;
            }
            let hasFalseValue: boolean = false;

            this.params.api.forEachNode((node) => {
                if (!node.data[this.colDef.field]) {
                    hasFalseValue = true;
                }
            });
            if (!this.componentParent.getCurrentNodeItems().length) {
                this.value = false;
                return;
            }
            this.value = !hasFalseValue;
        });
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    ngOnDestroy() {
        if (this._cellValueChangedSubscription) this._cellValueChangedSubscription.unsubscribe();
    }

    /**
     * onCheckboxChange
     * @param event
     */
    onCheckboxChange(event) {
        const status = event.checked;
        const itemsToUpdate = [];
        this.params.api.forEachNode((node) => {
            const data = node.data;
            if (data[ColHeaderKey.IsEditable] != 0) {
                this.componentParent.setDeleteCheckboxStatus(data, status);
                itemsToUpdate.push(data);
            }
        });

        if (itemsToUpdate && itemsToUpdate.length) {
            this.params.api.updateRowData({ update: itemsToUpdate });
            this.componentParent.checkAndEmitDeleteRowStatus();
        }
    }
}
