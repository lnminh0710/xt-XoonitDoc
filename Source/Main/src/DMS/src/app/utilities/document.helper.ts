import { Injectable } from '@angular/core';
import { DocumentProcessingTypeEnum, DocumentTreeParams } from '@app/app.constants';
import {
    DocumentTreeModel,
    DocumentTreeModeEnum,
} from '@app/models/administration-document/document-tree.payload.model';

@Injectable()
export class DocumentHelper {
    static parseDocumentProcessingType(typeString: any): DocumentProcessingTypeEnum {
        const type = typeString.toLowerCase();
        switch (type) {
            case 'invoice':
                return DocumentProcessingTypeEnum.INVOICE;
            case 'contract':
                return DocumentProcessingTypeEnum.CONTRACT;
            default:
            case 'other_document':
                return DocumentProcessingTypeEnum.OTHER_DOCUMENT;
        }
    }

    static parseDocumentTypeToDocumentProcessingTypeEnum(idDocumentType: number): DocumentProcessingTypeEnum {
        switch (idDocumentType) {
            case 1: // Invoice
                return DocumentProcessingTypeEnum.INVOICE;
            case 2: // Contracts
                return DocumentProcessingTypeEnum.CONTRACT;
            case 3: // Others
            default:
                // Else
                return DocumentProcessingTypeEnum.OTHER_DOCUMENT;
        }
    }

    static parseDocumentProcessingTypeEnumToDocumentType(documentProcessingType: DocumentProcessingTypeEnum): number {
        switch (documentProcessingType) {
            case DocumentProcessingTypeEnum.INVOICE:
                return 1; // Invoice
            case DocumentProcessingTypeEnum.CONTRACT:
                return 2; // Contracts
            case DocumentProcessingTypeEnum.OTHER_DOCUMENT:
            default:
                return 3; // Others || Else
        }
    }

    static mapToDocumentNode(data: any[], treeParams: DocumentTreeParams, isSkipNodeWithQuantityZero = false): any[] {
        return data
            .filter((node: any) => {
                if (isSkipNodeWithQuantityZero && !node?.data?.quantity) return false;
                return true;
            })
            .map((node, index, array) => {
                let prevSibling = null;
                if (index > 0 && array[index - 1].children && array[index - 1].children.length) {
                    prevSibling = array[index - 1];
                }
                const model = this.mapDocumentTreeModel(null, prevSibling, node, treeParams);
                return model;
            })
            .sort((a: DocumentTreeModel, b: DocumentTreeModel) => a.order - b.order);
    }

    static mapData(data: any, treeParams: DocumentTreeParams): DocumentTreeModel {
        return <DocumentTreeModel>{
            idDocument: data[treeParams.id],
            idDocumentParent: data.idDocumentTreeParent,
            idDocumentParentAfterCallApi: data.idDocumentParentAfterCallApi,
            idDocumentType: data.idRepDocumentGuiType,
            name: data[treeParams.name],
            quantity: data.quantity,
            quantityParent: data.quantityParent,
            isActive: data.isActive,
            isReadOnly: data.isReadOnly,
            isNotModify: data.isNotModify,
            isIndexingTree: data.isIndexingTree,
            idLogin: data.idLogin,
            numberDocuments: data.numberDocuments,
            icon: data.iconName,
            order: data.sortingIndex,
            createDate: data.createDate,
            updateDate: data.updateDate,
            children: null,
            hasChildren: false,
            isAfterAdjacentRoot: false,
            visible: true,
            isHiddenAllChildren: false,
            mode: DocumentTreeModeEnum.VIEW,
            isCompany: data.isCompany,
            isUser: data.isUser,
            canDelete: data.canDelete,
            canEdit: data.canEdit,
            canRead: data.canRead,
            canShare: data.canShare,
        };
    }

    static mapDocumentTreeModel(
        parent: any,
        prevSibling: any,
        node: any,
        treeParams: DocumentTreeParams,
    ): DocumentTreeModel {
        const mapDocumentTreeModelData = this.mapData(node.data, treeParams);

        if (prevSibling && prevSibling.children && prevSibling.children.length) {
            mapDocumentTreeModelData.isAfterAdjacentRoot = true;
        }

        if (!node.children || !node.children.length) return mapDocumentTreeModelData;

        mapDocumentTreeModelData.children = [];
        mapDocumentTreeModelData.hasChildren = true;
        mapDocumentTreeModelData.isHiddenAllChildren = false;
        for (let i = 0; i < node.children.length; i++) {
            const _prevSibling = i <= 0 ? null : node.children[i - 1];
            const childNode = this.mapDocumentTreeModel(node, _prevSibling, node.children[i], treeParams);
            mapDocumentTreeModelData.children.push(childNode);
        }

        return mapDocumentTreeModelData;
    }
}
