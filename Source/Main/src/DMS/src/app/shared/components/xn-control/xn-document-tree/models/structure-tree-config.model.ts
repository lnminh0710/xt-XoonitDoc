import { TreeModel } from '@circlon/angular-tree-component';

export class StructureTreeConfig {
    public afterInitTree: (treeModel: TreeModel) => void;

    constructor(params?: Partial<StructureTreeConfig>) {
        Object.assign(this, params);
    }
}
