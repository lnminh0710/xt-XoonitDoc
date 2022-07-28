import { DocumentProcessingTypeEnum } from '@app/app.constants';
import { Observable } from 'rxjs';

export enum DocumentTreeModeEnum {
    VIEW = 'view',
    CREATE_NEW = 'create new',
    ADD_SUB_FOLDER = 'add',
    RENAME = 'rename',
    DELETE = 'delete',
}

export class DocumentTreeModel {
    private _hasChildren: boolean;
    id?: number;
    idDocument: number;
    idDocumentParent: number;
    idDocumentParentAfterCallApi: number;
    idDocumentType: number;
    name: string;
    quantity: number;
    quantityParent: number;
    isActive: boolean;
    isReadOnly: boolean;
    isNotModify?: boolean;
    isIndexingTree?: boolean;
    idLogin?: number;
    idDocumentContainerScans?: any;
    numberDocuments: number;
    order: number;
    icon: string;
    iconAsync$?: Observable<any>;
    createDate: string;
    updateDate: string;
    children: DocumentTreeModel[];
    mode: DocumentTreeModeEnum;
    isAfterAdjacentRoot: boolean;
    highlightPathName?: boolean;
    highlightPathLine?: boolean;
    highlightNodeBefore?: boolean;
    path?: string;
    visible = true;
    isHiddenAllChildren = false;
    iconShow?: string;
    isCompany?: boolean;
    isUser?: boolean;

    canDelete?: boolean;
    canEdit?: boolean;
    canRead?: boolean;
    canShare?: boolean;

    get hasChildren(): boolean {
        return this.children && !!this.children.length;
    }

    set hasChildren(val: boolean) {
        this._hasChildren = val;
    }
}
