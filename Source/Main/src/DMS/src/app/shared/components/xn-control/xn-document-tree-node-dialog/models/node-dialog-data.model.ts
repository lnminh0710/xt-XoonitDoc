import { TreeNode } from '@circlon/angular-tree-component';
import { DocumentTreeModeEnum } from '@app/models/administration-document/document-tree.payload.model';

export class NodeDialogDataModel {
    node: TreeNode;
    mode: DocumentTreeModeEnum;
}
