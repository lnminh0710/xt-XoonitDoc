import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model'
import { FolderCapturedChangeModel } from '@app/models/administration-document/document-form/folder-captured-change.model';

export class CapturedBaseDocumentModel {
    mainDocument: MainDocumentModel;
    documentTreeMedia: DocumentTreeMediaModel;
    dynamicFields?: DynamicFieldsPayloadModel[];
    folderChange?: FolderCapturedChangeModel;
}
