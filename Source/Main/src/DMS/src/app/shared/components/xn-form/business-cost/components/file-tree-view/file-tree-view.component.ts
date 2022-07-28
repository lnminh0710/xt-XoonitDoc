import {
    Component, OnInit, Input, Output, EventEmitter,
    ChangeDetectorRef, OnDestroy,
    SimpleChanges, OnChanges, ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { Uti } from '@app/utilities';
import { ModalService } from '@app/services';
import { MessageModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { WjTreeView } from 'wijmo/wijmo.angular2.nav';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'app-file-tree-view',
    styleUrls: ['./file-tree-view.component.scss'],
    templateUrl: './file-tree-view.component.html',
    host: {
        '(contextmenu)': 'onRightClick($event)'
    }
})
export class FileTreeViewComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    public contextMenuData: any;
    private currentTreeNodeItem: any;
    public treeViewData: any;
    private tempData: any;

    @Input() data: any;

    @Output() dataChange: EventEmitter<any> = new EventEmitter();
    @Output() showFileUploadDialog: EventEmitter<any> = new EventEmitter();

    @ViewChild('tvEdit') wjTreeView: WjTreeView;

    constructor(
        private ref: ChangeDetectorRef,
        private modalService: ModalService,
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.contextMenuData = this.createMenuContextData(false);
        this.addPerfectScrollbar();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public ngOnChanges(changes: SimpleChanges) {
        const hasChangesData = this.hasChanges(changes['data']);
        if (hasChangesData) {
            this.makeData();
        }
    }

    private addPerfectScrollbar() {
        setTimeout(() => {
            const wijmoGridElm = $(this.wjTreeView.hostElement);
            if (wijmoGridElm.length) {
                const ps = new PerfectScrollbar(wijmoGridElm.get(0));
                // (Ps as any).destroy(wijmoGridElm.get(0));
                // (Ps as any).initialize(wijmoGridElm.get(0));

                setTimeout(() => {
                    $('.ps-scrollbar-x-rail', this.wjTreeView.hostElement).css('z-index', 9999);
                    $('.ps-scrollbar-y-rail', this.wjTreeView.hostElement).css('z-index', 9999);
                }, 200);
            }
        });
    }

    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    //#region Make Data Tree
    private makeData() {
        if (!this.data || !this.data.length) {
            this.treeViewData = [];
            this.tempData = [];
            return;
        }
        this.makeTreeViewData();
        this.treeViewData = this.tempData;
    }
    private makeTreeViewData() {
        this.makeParentTreeViewData();
        let child: any;
        for (const item of this.tempData) {
            child = this.data.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(item, child, 1);
        }
    }

    private makeParentTreeViewData() {
        const parent = this.data.filter(x => !x.parentId);
        this.tempData = parent.map(x => {
            return {
                id: x.id,
                header: x.text,
                img: '',
                parentId: 0,
                level: 0
            };
        });
    }

    private makeChildrenTreeViewData(parent: any, children: any, level: number) {
        if (!children || !children.length) { return; }
        parent.items = [];
        let _children: any;
        for (const item of children) {
            const child: any = {
                id: item.id,
                header: item.text,
                img: '',
                parentId: parent.id,
                level: level
            };
            parent.items.push(child);
            _children = this.data.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(child, _children, (level + 1));
        }
    }
    //#endregion

    //#region ContextMenu
    private rebindContextMenu(isDisable) {
        if (this.treeViewData && this.treeViewData.length) return;

        this.contextMenuData = this.createMenuContextData(isDisable);
    }

    private createMenuContextData(isDisable: boolean) {
        return [
            {
                id: 'campaign-file-tree-view-add-folder',
                title: 'Add Folder',
                iconName: 'fa-plus',
                callback: (event) => { this.addFolder(event); },
                subject: new Subject(),
                disabled: isDisable,
                children: []
            },
            {
                id: 'campaign-file-tree-view-delete',
                title: 'Delete Folder',
                iconName: 'fa-trash-o',
                callback: (event) => { this.deleteFolder(event); },
                subject: new Subject(),
                disabled: isDisable,
                children: []
            },
            {
                id: 'campaign-file-tree-view-add-to-root',
                title: 'Add Folder To Root',
                iconName: 'fa-plus-circle',
                callback: (event) => { this.addToRoot(event); },
                subject: new Subject(),
                disabled: false,
                children: []
            },
            {
                id: 'campaign-file-tree-view-add-to-root',
                title: 'Upload File',
                iconName: 'fa-upload',
                callback: (event) => { this.uploadFile(event); },
                subject: new Subject(),
                disabled: isDisable,
                children: []
            }
        ];
    }

    private addFolder(event) {
        this.currentTreeNodeItem.items = this.currentTreeNodeItem.items || [];

        const addedItemId = this.getTempId();
        this.currentTreeNodeItem.items.push({
            header: 'New Folder', id: addedItemId
        });
        this.resetTreeViewData();

        setTimeout(() => {
            if (this.wjTreeView.selectedNode.nodes) {
                const nodeIndex = this.wjTreeView.selectedNode.nodes.findIndex(n => n.dataItem.id == addedItemId);
                if (nodeIndex >= 0)
                    this.wjTreeView.selectedNode.nodes[nodeIndex].select();
            }
        }, 100);
    }

    private deleteFolder(event) {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            message: [ { key: '<p>' }, { key: 'Modal_Message__AreYouSureToDeleteThisItem' }, { key: '</p>' }],
            callBack1: this.deleteAfterConfirm.bind(this)
        }));
    }

    private deleteAfterConfirm() {
        Uti.removeItemInTreeArray(this.treeViewData, this.currentTreeNodeItem, 'id', 'items');
        this.resetDataForTreeView(true);
    }

    private addToRoot(event) {
        this.treeViewData = this.treeViewData || [];
        this.treeViewData.push({
            header: 'New Folder', id: this.getTempId()
        });
        this.resetDataForTreeView(false);
    }

    private uploadFile(event) {
        this.showFileUploadDialog.emit(true);
    }

    private resetTreeViewData() {
        const temp = this.treeViewData;
        this.treeViewData = [];
        for (const item of temp) {
            this.treeViewData.push(item);
        }
        this.ref.detectChanges();
    }

    private resetDataForTreeView(isDisable) {
        this.resetTreeViewData();
        this.rebindContextMenu(isDisable);
    }
    //#endregion

    //#region Events
    public selectedItemChange(tvEdit: any, event: any) {
        if (!event || !event.id) return;

        this.findTreeViewItemById(this.treeViewData, event.id);

        // call this at the end of this function
        // to get the last seleted data item
        this.dataChange.emit(this.currentTreeNodeItem);
    }

    public nodeEditEnded(tvEdit: any, event: any) {
        const header: string = event.node.dataItem.header;
        if (!header || !header.trim()) {
            event.node.dataItem.header = 'New Folder';
            this.resetTreeViewData();
        }
    }

    public onRightClick($event: MouseEvent) {
        $event.preventDefault();
        $event.stopPropagation();
    }
    //#endregion

    //#region Helpers
    private getTempId(): number {
        let newId = Math.round(((Math.random() * 100000) * -1));
        let currentItem = this.treeViewData.find(x => x.id === newId);
        while (currentItem && currentItem.id) {
            newId = Math.round(((Math.random() * 100000) * -1));
            currentItem = this.treeViewData.find(x => x.id === newId);
        }
        return newId;
    }

    private findTreeViewItemById(treeViewData: any, treeNodeId: any) {
        for (const item of treeViewData) {
            const result = this.findInChildren(item, treeNodeId);
            if (result) return;
        }
    }

    private findInChildren(treeNodeItem: any, treeNodeId: any): boolean {
        if (treeNodeItem.id === treeNodeId) {
            this.currentTreeNodeItem = treeNodeItem;
            return true;
        }
        if (!treeNodeItem.items || !treeNodeItem.items.length) {
            this.currentTreeNodeItem = null;
            return false;
        }
        for (const item of treeNodeItem.items) {
            const result = this.findInChildren(item, treeNodeId);
            if (result) return result;
        }
    }
    //#endregion
}
