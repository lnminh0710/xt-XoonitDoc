import { Component } from '@angular/core';
import { Uti } from '@app/utilities';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'file-size-cell-renderer',
    templateUrl: './file-size-cell-renderer.html',
    styleUrls: ['./file-size-cell-renderer.scss'],
})
export class FileSizeCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {
    public parseValue: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        this.parseValue = Uti.formatBytes(parseInt(this.value || '0', 10));
    }
}
