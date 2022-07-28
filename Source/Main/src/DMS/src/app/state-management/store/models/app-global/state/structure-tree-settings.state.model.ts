export interface TreeNodeState {
    idDocument: number;
    visible: boolean;
    order: number;
    children: TreeNodeState[];
}

export interface StructureTreeSettingsStateModel {
    activeFoldersOnly: boolean;
    isCollapsedTree: boolean;
    nodesState: TreeNodeState[];
}
