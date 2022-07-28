import { Component } from '@angular/core';
import { Uti } from '@app/utilities';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'file-cell-renderer',
    templateUrl: './file-cell-renderer.html',
    styleUrls: ['./file-cell-renderer.scss'],
})
export class FileCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {
    public extension: string;

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        this.extension = this._getExtension(this.value);
    }

    private _getExtension(fileName: any): any {
        const extension = Uti.getFileExtension(fileName);
        let isImage = extension.match(/(jpg|jpeg|png|gif|tiff|ico)$/i);
        if (isImage) {
            return 'image';
        }
        let isDoc = extension.match(/(doc|docx)$/i);
        if (isDoc) {
            return 'doc';
        }
        let isExcel = extension.match(/(xls|xlsx|xlsm|csv)$/i);
        if (isExcel) {
            return 'xls';
        }
        let isPDF = extension.match(/(pdf)$/i);
        if (isPDF) {
            return 'pdf';
        }
        let isPowerpoint = extension.match(/(ppt|pptx)$/i);
        if (isPowerpoint) {
            return 'ppt';
        }
        let isZip = extension.match(/(zip)$/i);
        if (isZip) {
            return 'zip';
        }
        let isMedia = extension.match(/(mp3|mp4)$/i);
        if (isMedia) {
            return 'media';
        }
        return extension;
    }
}
