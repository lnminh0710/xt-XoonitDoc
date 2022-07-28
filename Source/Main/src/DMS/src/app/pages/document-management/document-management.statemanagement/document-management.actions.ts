import { CustomAction } from '@app/state-management/store/actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { GetDocumentsByKeywordModelPayload } from './models/payload/get-documents-by-keyword.model.payload';

export enum DocumentManagementActionNames {
    DOCUMENT_MANAGEMENT_SUCCESS_ACTION = '[DOCUMENT MANAGEMENT] Success Action',
    DOCUMENT_MANAGEMENT_FAILED_ACTION = '[DOCUMENT MANAGEMENT] Failed Action',
    GET_DOCUMENTS_BY_KEYWORD = '[DOCUMENT MANAGEMENT] Get Documents By Keyword',
    GET_DOCUMENT_FILES_BY_FOLDER = '[DOCUMENT MANAGEMENT] Get Document Files By Folder',
    OPEN_FILE_INTO_VIEWER = '[DOCUMENT MANAGEMENT] Open File Into Viewer',
    GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID = '[DOCUMENT MANAGEMENT] Get File By Url For Widget Viewer Id',
    DOUBLE_CLICK_ON_WIDGET_VIEWER = '[DOCUMENT MANAGEMENT] Double CLick On Widget Viewer',
    SAVE_DATA_GLOBAL_SEARCH_ACTION = '[DOCUMENT MANAGEMENT] Save Data Global Search Action',
}

export class GetDocumentsByKeywordAction implements CustomAction {
    public type = DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD;

    constructor(
        public payload: {
            fieldName: string;
            folder: DocumentTreeModel;
            index: string;
            moduleId: number;
            pageIndex: number;
            pageSize: number;
            searchPattern: string;
            fieldNames: string[];
            fieldValues: string[];
        },
    ) {}
}

export class GetDocumentFilesByFolderAction implements CustomAction {
    public type = DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER;
    public payload: DocumentTreeModel;

    constructor(folder: DocumentTreeModel) {
        this.payload = folder;
    }
}

export class OpenFileIntoViewerAction implements CustomAction {
    public type = DocumentManagementActionNames.OPEN_FILE_INTO_VIEWER;
    public payload: { idWidget: string; file: any; folder: DocumentTreeModel };

    constructor(idWidget: string, file: any, folder: DocumentTreeModel) {
        this.payload = { idWidget, file, folder };
    }
}

export class GetFileByUrlForWidgetViewerIdAction implements CustomAction {
    public type = DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID;
    public payload: { filePath: string; idWidget: string };

    constructor(filePath: string, idWidget: string) {
        this.payload = { filePath, idWidget };
    }
}

export class DblClickOnWidgetViewerAction implements CustomAction {
    public type = DocumentManagementActionNames.DOUBLE_CLICK_ON_WIDGET_VIEWER;
    public payload: { idDocumentType: number; idMainDocument: string };

    constructor(idDocumentType: number, idMainDocument: string) {
        this.payload = { idDocumentType, idMainDocument };
    }
}

export class DocumentManagementSuccessAction implements CustomAction {
    public type = DocumentManagementActionNames.DOCUMENT_MANAGEMENT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class DocumentManagementFailedAction implements CustomAction {
    public type = DocumentManagementActionNames.DOCUMENT_MANAGEMENT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class SaveDataGlobalSearchAction implements CustomAction {
    public type = DocumentManagementActionNames.SAVE_DATA_GLOBAL_SEARCH_ACTION;

    constructor(public payload?: any) {}
}
