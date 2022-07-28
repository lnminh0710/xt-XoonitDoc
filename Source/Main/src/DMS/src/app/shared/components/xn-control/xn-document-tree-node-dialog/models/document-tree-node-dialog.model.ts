export class DocumentTreeNodeDialogModel {
    name: string;
    isRoot: boolean;
    position: 'top' | 'bottom';

    constructor(params: Partial<DocumentTreeNodeDialogModel>) {
        Object.assign(this, params);
    }
}
