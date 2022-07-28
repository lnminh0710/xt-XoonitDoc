import {
    Component, OnInit, OnDestroy, Input, Output,
    EventEmitter, AfterViewInit
} from '@angular/core';
@Component({
    selector: 'app-xn-tree-view-left',
    styleUrls: ['./xn-tree-view-left.component.scss'],
    templateUrl: './xn-tree-view-left.component.html'
})
export class XnTreeViewLeftComponent implements OnInit, OnDestroy, AfterViewInit {
    public treeViewData: Array<any>;
    private treeViewLeftSideLevel: any;
    private hasParent = false;
    private parentFind: any;
    private rootId: any;

    @Input() mainHtmlId: string;
    @Input() leftHtmlId: string;
    @Input() rightHtmlId: string;

    @Input() set data(data: any) {
        this.treeViewData = data;
    }
    @Input() mainData: any;
    @Input() rawData: any;
    @Input() config: any;

    @Output() dataChange: EventEmitter<any> = new EventEmitter();
    @Output() itemSelect: EventEmitter<any> = new EventEmitter();
    @Output() textChanged: EventEmitter<any> = new EventEmitter();
    @Output() unRename: EventEmitter<any> = new EventEmitter();
    private prevTreeNode: any;

    constructor() { }

    public ngOnInit() {
        if (!this.treeViewData || !this.treeViewData.length) {
            return;
        }
        this.treeViewLeftSideLevel = {
            'padding-left': `${this.treeViewData[0].level * 8}px`
        }
        this.calculateWidthForTreeView.bind(this);
    }

    public ngOnDestroy() {
    }

    public ngAfterViewInit() {
        this.calculateWidthForTreeView(300);
    }

    private waitingElementCounter = 0;
    public calculateWidthForTreeView(timeout: number) {
        if (this.waitingElementCounter > 20) return;
        setTimeout(() => {
            const left = $('#' + this.leftHtmlId);
            if (!left || !left.length) {
                this.waitingElementCounter += 1;
                this.calculateWidthForTreeView(timeout);
                return;
            }
            const main = $('#' + this.mainHtmlId);
            const right = $('#' + this.rightHtmlId);
            main.css('width', (left.outerWidth()) + (right.outerWidth()) + 25);
        }, timeout);
    }

    public expandNodeClick(treeNode: any) {
        this.itemSelect.emit(treeNode);
        $('#' + this.mainHtmlId).css('width', 5000);
        treeNode.expand = !treeNode.expand;
        this.calculateWidthForTreeView(300);
    }

    public checkboxChange(treeNode: any) {
        if (!treeNode.select) {
            treeNode.isMain = false;
        }
        this.setSelectForChild(treeNode);
        this.itemSelect.emit(treeNode);
        this.findRootIdByChild(treeNode);
        this.setSelectForParent(treeNode);
        this.dataChange.emit(this.treeViewData);
    }

    public onDataChange($event) {
        this.dataChange.emit(this.treeViewData);
    }

    public treeNodeClick(treeNode: any) {        
        this.itemSelect.emit(treeNode);
    }

    public onKeyDown($event) {
        if (($event.which === 13 || $event.keyCode === 13)) {
            $event.preventDefault();
            this.unRename.emit();
        } else {
            setTimeout(() => {
                this.dataChange.emit(this.treeViewData);
                this.textChanged.emit();
            });
        }
    }

    public onBlur(treeNode: any, $event) {
        $event.preventDefault();
        if (!treeNode.text)
            treeNode.text = 'New Category';
        this.unRename.emit();
    }

    public treeNodeNameClick($event, treeNode) {
        $event.preventDefault();
        $event.stopPropagation();

        let findNode = this.searchSingleNodeFromTree(this.mainData, 'isSelected', true);
        if (findNode) {
            findNode.isSelected = false;
        }

        treeNode.isSelected = true;
    }

    public treeNodeNameClickDblClick($event, treeNode) {
        $event.preventDefault();
        $event.stopPropagation();

        treeNode.isRename = true;
    }

    public treeNodeTextChnageHandler() {
        setTimeout(() => this.textChanged.emit());
    }

    public unRenameHandler() {
        this.unRename.emit();
    }

    private setSelectForChild(data: any) {
        if (!data.children || !data.children.length) { return; }
        for (const item of data.children) {
            item.select = data.select;
            if (!item.select) {
                item.isMain = false;
            }
            this.setSelectForChild(item);
        }
    }

    private findRootIdByChild(child: any) {
        const parent: any = this.findParentRawByChildId(child);
        if (parent && !parent.parentId) {
            this.rootId = parent.id;
            return;
        }
        this.findRootIdByChild(parent);
    }

    private findParentRawByChildId(child: any): any {
        return this.rawData.find(x => x.id === (!child.parentId ? child.id : child.parentId));
    }

    private setSelectForParent(data: any) {
        const root = this.mainData.find(x => x.id === this.rootId);
        if (!root.select) {
            root.isMain = false;
        }
        this.setSelectParentFirst(data, root);
    }

    private setSelectParentFirst(data: any, root: any) {
        this.setSelectParentDeep(data, root);
        if (!this.hasParent) { return; }
        this.hasParent = false;
        this.parentFind.select = data.select ? true : this.parentFind.select;
        if (!this.parentFind.select) {
            this.parentFind.isMain = false;
        }
        if (this.parentFind.id === root.id) { return; }
        this.setSelectParentFirst(this.parentFind, root);
    }

    private setSelectParentDeep(child: any, parent: any) {
        if (this.hasParent || !parent.children || !parent.children.length) { return; }
        for (const item of parent.children) {
            if (this.hasParent) { return; }
            if (item.id === child.id && item.level === child.level) {
                this.hasParent = true;
                this.parentFind = parent;
                return;
            }
            this.setSelectParentDeep(child, item);
        }
    }

    public setPercentTextViewMode(percentText?: any): string {
        return (percentText && parseFloat(percentText) > 0) ? ' (' + percentText + '%)' : '';
    }

    private searchSingleNodeFromTree(tree, key, valueToCompare) {
        if (!tree || !tree.length) return null;

        var result = null;
        for (let i = 0, length = tree.length; result == null && i < length; i++) {
            result = this.searchTreeNode(tree[i], key, valueToCompare);
            if (result) return result;
        }

        return null;
    }

    private searchTreeNode(node, key, valueToCompare) {
        if (node[key] == valueToCompare) {
            return node;
        } else if (node.children != null) {
            let result = null;
            for (let i = 0, length = node.children.length; result == null && i < length; i++) {
                result = this.searchTreeNode(node.children[i], key, valueToCompare);
            }
            return result;
        }
        return null;
    }
}
