import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@xn-control/light-material-ui/tree';
import { ItemFlatOfList, ItemOfList } from '../management-list/model';
import { SelectedItemModel } from './checkbox-tree.model';

@Component({
    selector: 'xn-checkbox-tree',
    templateUrl: './xn-checkbox-tree.component.html',
    styleUrls: ['./xn-checkbox-tree.component.scss'],
})
export class XnCheckboxTreeComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() set data(dataChanged: any) {
        if (dataChanged?.length) this.dataSource.data = dataChanged;
    }
    @Input() isUpdate = false;

    @Output() getSelectedList: EventEmitter<ItemFlatOfList[]> = new EventEmitter();
    @Output() clickCheckbox: EventEmitter<SelectedItemModel> = new EventEmitter();
    @Output() clickMorePermission: EventEmitter<ItemFlatOfList> = new EventEmitter();

    public dataSource: MatTreeFlatDataSource<ItemOfList, ItemFlatOfList>;
    public treeControl: FlatTreeControl<ItemFlatOfList>;
    public checklistSelection = new SelectionModel<ItemFlatOfList>(true /* multiple */);
    public treeFlattener: MatTreeFlattener<ItemOfList, ItemFlatOfList>;
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    public flatNodeMap = new Map<ItemFlatOfList, ItemOfList>();
    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    public nestedNodeMap = new Map<ItemOfList, ItemFlatOfList>();

    public getLevel = (node: ItemFlatOfList) => node.level;
    public isExpandable = (node: ItemFlatOfList) => node.expandable;
    public getChildren = (node: ItemOfList): ItemOfList[] => node.children;
    public hasChild = (_: number, _nodeData: ItemFlatOfList) => _nodeData.expandable;
    public hasNoContent = (_: number, _nodeData: ItemFlatOfList) => _nodeData.name === '';

    public isHoverEmail = false;
    public isHoverIndexing = false;
    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    public transformer = (node: ItemOfList, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.name === node.name ? existingNode : new ItemFlatOfList();
        flatNode.id = node.id;
        flatNode.name = node.name;
        flatNode.level = level;
        flatNode.editable = node.editable;
        flatNode.expandable = !!node.children?.length;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        if (node.isActive) {
            this.checklistSelection.select(flatNode);
        }
        return flatNode;
    };

    constructor(protected router: Router) {
        super(router);

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<ItemFlatOfList>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }
    ngOnDestroy(): void {
        super.getUnsubscriberNotifier();
    }

    /** Select the category so we can insert the new item. */
    public addNewItem(node: ItemFlatOfList) {
        const parentNode = this.flatNodeMap.get(node);
        // this._database.insertItem(parentNode!, '');
        this.treeControl.expand(node);
    }

    /** Save the node to database */
    public saveNode(node: ItemFlatOfList, itemValue: string) {
        const nestedNode = this.flatNodeMap.get(node);
        // this._database.updateItem(nestedNode!, itemValue);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    public leafItemSelectionToggle(node: ItemFlatOfList): void {
        const isSelected = this.checklistSelection.isSelected(node);
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);

        this.clickCheckbox.emit(<SelectedItemModel>{
            isSelected: isSelected,
            node: node,
        });
        this.getSelectedList.emit(this.checklistSelection.selected);
    }

    /** Whether all the descendants of the node are selected. */
    public descendantsAllSelected(node: ItemFlatOfList): boolean {
        const descendants = this.treeControl?.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every((child) => {
                return this.checklistSelection.isSelected(child);
            });
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    public descendantsPartiallySelected(node: ItemFlatOfList): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    public itemSelectionToggle(node: ItemFlatOfList): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        const isSelected = this.checklistSelection.isSelected(node);
        isSelected ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.forEach((child) => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);

        this.clickCheckbox.emit(<SelectedItemModel>{
            isSelected: isSelected,
            node: node,
        });
        this.getSelectedList.emit(this.checklistSelection.selected);
    }
    /* Checks all the parents when a leaf node is selected/unselected */
    public checkAllParentsSelection(node: ItemFlatOfList): void {
        let parent: ItemFlatOfList | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }
    /* Get the parent node of a node */
    getParentNode(node: ItemFlatOfList): ItemFlatOfList | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }
    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: ItemFlatOfList): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every((child) => {
                return this.checklistSelection.isSelected(child);
            });
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    public showMorePermission(event: any, node: ItemFlatOfList) {
        event.preventDefault();
        this.clickMorePermission.emit(node);
    }

    public onMouseOver(event: any, node: ItemFlatOfList) {
        switch (node?.name) {
            case 'Indexing':
                this.isHoverIndexing = true;
                this.isHoverEmail = false;
                break;
            case 'Email':
                this.isHoverEmail = true;
                this.isHoverIndexing = false;
                break;
            default:
                this.isHoverEmail = false;
                this.isHoverIndexing = false;
                break;
        }
    }
    public onMouseOut(event: any, node: ItemFlatOfList) {
        switch (node?.name) {
            case 'Indexing':
                this.isHoverIndexing = false;
                break;
            case 'Email':
                this.isHoverEmail = false;
                break;
            default:
                break;
        }
    }
}
