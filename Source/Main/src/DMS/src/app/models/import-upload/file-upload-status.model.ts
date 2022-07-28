import { FileUploadProgress, FileUploadProgressOptions, FileUploadStatusEnum } from './file-upload-progress.model';
import { isNullOrUndefined } from 'util';
export enum DocumentProcessEnum {
    SUCCESSED = 1,
    PROCESSING = 2,
    FAILED = 3,
    CANCELLED = 4,
    INVALID = 5,
    READY_TO_UPLOAD = 6,
    OUT_OF_SESSION = 7,
}
export class FileUploadXoonit {
    checked?: boolean;
    documentPath?: string;
    documentId?: number;
    documentName?: string;
    status: DocumentProcessEnum;

    constructor() {
        this.checked = false;
        this.documentPath = '';
        this.documentName = '';
        this.documentId = 0;
        this.status = DocumentProcessEnum.PROCESSING;
    }

    // public updateWith(updatedData: any) {
    //     this.checked = isNullOrUndefined(updatedData.checked) ? this.checked : updatedData.checked;
    //     this.documentPath = updatedData.documentPath || this.documentPath;
    //     this.documentId = updatedData.documentId || this.documentId;
    //     this.documentName = updatedData.documentName || this.documentName;
    //     this.status = updatedData.status || this.status;
    // }
}
