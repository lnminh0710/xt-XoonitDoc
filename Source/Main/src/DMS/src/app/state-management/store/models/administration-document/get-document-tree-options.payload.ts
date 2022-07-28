export class GetDocumentTreeOptions {
    shouldGetDocumentQuantity: boolean;
    idPerson: string;
    idLogin?: string;
    isProcessingModule?: number;
    permissionType?: string;

    treeType?: TreeTypeEnum;

    idMember?: string;
    isLoginGroup?: string;
}

export enum TreeTypeEnum {
    DOCUMENT,
    INDEXING,
    EMAIL,
}
