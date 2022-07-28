import { CustomAction } from '@app/state-management/store/actions';
import { FileUploadXoonit } from '@app/models/import-upload/file-upload-xoonit.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';

export enum ImportUploadActionNames {
    IMPORT_UPLOAD_SUCCESS_ACTION = '[IMPORT UPLOAD] Success Action',
    IMPORT_UPLOAD_FAILED_ACTION = '[IMPORT UPLOAD] Failed Action',
    IMPORT_UPLOAD_DONE = '[IMPORT UPLOAD] Import Upload Done',
    SAVE_DOCUMENT_CAPTURE_WHEN_IMPORTING_DONE = '[IMPORT UPLOAD] Save Document Capture When Importing Done',
    SELECT_FOLDER_TO_IMPORT = '[IMPORT UPLOAD] Select Folder To Import',
    CLEAR_SELECTED_FOLDER = '[IMPORT UPLOAD] Clear Selected Folder',
}

export class ImportUploadSuccessAction implements CustomAction {
    public type = ImportUploadActionNames.IMPORT_UPLOAD_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class ImportUploadFailedAction implements CustomAction {
    public type = ImportUploadActionNames.IMPORT_UPLOAD_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class ImportUploadDoneAction implements CustomAction {
    public type = ImportUploadActionNames.IMPORT_UPLOAD_DONE;

    constructor(
        public payload: {
            fileUploadProgress: FileUploadXoonit;
            idDocumentContainerScans: number;
        },
    ) {}
}

export class SaveDocumentCaptureWhenImportingDoneAction implements CustomAction {
    public type = ImportUploadActionNames.SAVE_DOCUMENT_CAPTURE_WHEN_IMPORTING_DONE;

    constructor(
        public payload: {
            mainDocumentData: MainDocumentModel;
            documentTreeMediaData: DocumentTreeMediaModel;
            fileUpload: FileUploadXoonit;
        },
    ) {}
}

export class SelectFolderToImportAction implements CustomAction {
    public type = ImportUploadActionNames.SELECT_FOLDER_TO_IMPORT;

    constructor(
        public payload: {
            folder: DocumentTreeModel;
        },
    ) {}
}

export class ClearSelectedFolderAction implements CustomAction {
    public type = ImportUploadActionNames.CLEAR_SELECTED_FOLDER;

    constructor() {}
}
