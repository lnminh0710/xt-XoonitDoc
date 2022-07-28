import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';

export class MainDocumentModel {
    idMainDocument: string;
    mainDocumentTree: MainDocumentTreeModel;
    idDocumentContainerScans: string;
    searchKeyWords: string;
    toDoNotes: string;
    isTodo: string;
}

export class MainDocumentTreeModel {
    idDocumentTree: string;
    oldFolder: DocumentTreeModel;
    newFolder: DocumentTreeModel;
}
