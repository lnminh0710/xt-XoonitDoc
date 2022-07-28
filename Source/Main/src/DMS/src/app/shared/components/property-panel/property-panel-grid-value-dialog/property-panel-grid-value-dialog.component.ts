import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
    selector: 'property-panel-grid-value-dialog',
    styleUrls: ['./property-panel-grid-value-dialog.component.scss'],
    templateUrl: './property-panel-grid-value-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelGridValueDialogComponent {
    public showDialog = false;
    public displayFields: any[] = [];
    public checkAll: boolean;

    @Output() onApply = new EventEmitter<any>();

    constructor(
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.checkAll = false;
    }

    public open(item) {
        this.displayFields = cloneDeep(item.options) || [];
        this.showDialog = true;
        this.checkAll = this.isCheckAll(this.displayFields);

        this.changeDetectorRef.markForCheck();
    }

    public close() {
        this.showDialog = false;

        this.changeDetectorRef.markForCheck();
    }

    public apply() {
        this.close();
        this.onApply.emit(this.displayFields.filter(i => i.selected === true));
    }

    public onCheckboxChanged() {
        this.checkAll = this.isCheckAll(this.displayFields);

        this.changeDetectorRef.markForCheck();
    }

    public selectAll() {
        for (const f of this.displayFields) {
            f.selected = this.checkAll;
        }

        this.changeDetectorRef.markForCheck();
    }

    private isCheckAll(options) {
        for (const opt of options) {
            if (opt.selected === false) {
                return false;
            }
        }
        return true;
    }

    public itemsTrackBy(index, item) {
        return item ? item.value : undefined;
    }

}
