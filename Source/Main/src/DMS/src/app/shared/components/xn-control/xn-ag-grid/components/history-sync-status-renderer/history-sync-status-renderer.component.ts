import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from '@app/utilities';

@Component({
    selector: 'history-sync-status-renderer',
    templateUrl: './history-sync-status-renderer.html',
    styleUrls: ['./history-sync-status-renderer.scss'],
})
export class HistorySyncStatusRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {
    public code: string;
    public title: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            this.title = obj.title;
            this.code = obj.code;
        }
    }
}
