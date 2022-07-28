import { FileUploadProgress, FileUploadProgressOptions } from './file-upload-progress.model';
import { isNullOrUndefined } from 'util';
import { has } from 'lodash-es';
export class FileUploadXoonit extends FileUploadProgress {
    checked?: boolean;
    documentPath?: string;
    documentId?: number;
    documentType?: number;
    documentTypeParent?: number;
    isSentToCapture?: boolean;

    constructor(options: FileUploadProgressOptions, checked?: boolean) {
        super(options);
        this.checked = checked || false;
        this.documentPath = '';
        this.documentId = 0;
    }

    public updateWith(updatedData: any) {
        this.checked = isNullOrUndefined(updatedData.checked) ? this.checked : updatedData.checked;
        this.documentPath = updatedData.documentPath || this.documentPath;
        this.documentId = updatedData.documentId || this.documentId;
        this.documentType = updatedData.documentType || this.documentType;
        this.documentTypeParent = has(updatedData, 'documentTypeParent')
            ? updatedData.documentTypeParent
            : this.documentTypeParent;
    }
}
