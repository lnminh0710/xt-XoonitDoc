import { Component, OnDestroy } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../../shared/base-ag-grid-cell-component';
import { ColHeaderKey } from '../../../shared/ag-grid-constant';
import { Subscription } from 'rxjs';
import { IHeaderParams } from 'ag-grid-community';

@Component({
    selector: 'select-all-checkbox-header-cell-renderer',
    templateUrl: './select-all-checkbox-header-cell-renderer.html',
    styleUrls: ['./select-all-checkbox-header-cell-renderer.scss'],
})
export class SelectAllCheckboxHeaderCellRenderer
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
        this._cellValueChangedSubscription = this.componentParent.onSelectedAllChecked.subscribe((data) => {
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

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    ngOnDestroy() {
        if (this._onDataChangeStateSubscription) this._onDataChangeStateSubscription.unsubscribe();
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
                data[ColHeaderKey.SelectAll] = status;
                itemsToUpdate.push(data);
            }
        });

        if (itemsToUpdate && itemsToUpdate.length) {
            this.params.api.updateRowData({ update: itemsToUpdate });
            this.componentParent.checkAndEmitSelectAllStatus(status);
        }
    }

    onClick(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
}
