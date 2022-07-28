import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp, ICellEditorAngularComp, IHeaderAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../../shared/base-ag-grid-cell-component';
import { ColHeaderKey } from '../../../shared/ag-grid-constant';
import { Subscription } from 'rxjs';
import { IHeaderParams } from 'ag-grid-community';

@Component({
    selector: 'check-box-header-cell-renderer',
    templateUrl: './check-box-header-cell-renderer.html',
    styleUrls: ['./check-box-header-cell-renderer.scss'],
})
export class CheckboxHeaderCellRenderer
    extends BaseAgGridCellComponent<boolean>
    implements IHeaderAngularComp, OnDestroy
{
    private _onDataChangeStateSubscription: Subscription;
    private _cellValueChangedSubscription: Subscription;
    constructor() {
        super();
    }
    refresh(params: IHeaderParams): boolean {
        console.log('Method not implemented.');
        return false;
    }

    public getCustomParam() {
        this._onDataChangeStateSubscription = this.componentParent.onDataChange.subscribe((data) => {
            if (!data || !data.data || !data.data.length) {
                this.value = false;
                return;
            }
            for (let item of data.data) {
                if (!item[this.colDef.field]) {
                    this.value = false;
                    return;
                }
            }
            this.value = true;
        });
        this._cellValueChangedSubscription = this.componentParent.cellValueChanged.subscribe((data) => {
            if (!data || !data.colDef || data.colDef.field != this.colDef.field) {
                return;
            }
            let hasFalseValue: boolean = false;
            this.params.api.forEachNode((node) => {
                const _data = node.data;
                if (!_data[this.colDef.field]) {
                    hasFalseValue = true;
                }
            });
            this.value = !hasFalseValue;
        });
    }

    ngOnDestroy() {
        if (this._onDataChangeStateSubscription) this._onDataChangeStateSubscription.unsubscribe();
        if (this._cellValueChangedSubscription) this._cellValueChangedSubscription.unsubscribe();
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
        const status = (this.value = event.checked);
        const itemsToUpdate = [];
        this.params.api.forEachNode((node) => {
            const data = node.data;

            if (data[ColHeaderKey.IsEditable] != 0 && data[this.colDef.field] != -1) {
                data[this.colDef.field] = status;
                itemsToUpdate.push(data);
            }

            if (
                this.componentParent &&
                this.componentParent.itemsEdited &&
                this.componentParent.itemsEdited.indexOf(data) < 0 &&
                this.colDef.field != ColHeaderKey.Delete
            ) {
                this.componentParent.itemsEdited.push(data);
            }
        });

        if (itemsToUpdate && itemsToUpdate.length) {
            this.params.api.updateRowData({ update: itemsToUpdate });
        }

        this.componentParent.cellValueChanged.emit();
        this.componentParent.onCheckAllChecked.emit(status);
    }
}
