import {
    Component, OnInit, OnDestroy, OnChanges,
    Input, Output, EventEmitter, SimpleChanges,
    ChangeDetectorRef
} from '@angular/core';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import {
    WidgetDetail,
    WidgetType,
    MessageModel
} from '@app/models';
import {
    WidgetTemplateSettingService,
    TreeViewService,
    ModalService,

    AppErrorHandler
} from '@app/services';
import { Uti } from '@app/utilities/uti';
import { MessageModal } from '@app/app.constants';

@Component({
    selector: 'app-xn-tree-view',
    styleUrls: ['./xn-tree-view.component.scss'],
    templateUrl: './xn-tree-view.component.html',
    host: {
        '(contextmenu)': 'onRightClick($event)'
    }
})
export class XnTreeViewComponent implements OnInit, OnDestroy {
    private editMode = false;
    private rawData: any;
    private currentTreeViewData: Array<any>;
    private crossTreeData: Array<any>;
    private crossTreeDataFinal: Array<any>;
    private config: any = { editMode: false };
    private _widgetDetail: WidgetDetail;
    private _data: any;
    private currentNode: any = {};
    private deleteItems: Array<any> = [];
    private addItems: Array<any> = [];

    public contextCompletedBuild: boolean = true;
    public treeViewData: Array<any>;
    public mainHtmlId = Uti.guid();
    public leftHtmlId = Uti.guid();
    public rightHtmlId = Uti.guid();
    public isFormChanged: boolean;
    public contextMenuData: Array<any> = [];

    @Input() set data(_data: any) {
        this._data = _data;
        if (!this.data) {
            this.makeData();
            return;
        }
        this.editMode = (this.data.config && this.data.config.editMode);
        this.deleteItems = [];
        this.config.editMode = this.editMode;
        this.makeData();
        this.bindToTooltip();
    };
    get data() {
        return this._data;
    }

    @Input() widgetModuleInfo: any;
    @Input() set widgetDetail(data: WidgetDetail) {
        if (!data || !data.contentDetail) {
            this._widgetDetail = null;
            return;
        }
        this._widgetDetail = data;
        this.setUpDataForTreeViewAfterGetService(this._widgetDetail);
    };

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        }
        else {
            this.ref.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    @Output() dataChange: EventEmitter<any> = new EventEmitter();
    @Output() noEntryDataEvent: EventEmitter<any> = new EventEmitter();

    constructor(
        private ref: ChangeDetectorRef,
        private treeViewService: TreeViewService,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        private modalService: ModalService,
        private appErrorHandler: AppErrorHandler,
    ) { }

    public ngOnInit() {
        this.contextMenuData = this.createContextData();
    }

    public ngOnDestroy() {
    }

    public onRightClick($event: MouseEvent) {
        $event.preventDefault();
        $event.stopPropagation();
        this.contextCompletedBuild = true;
        let el = $($event.target)[0];
        let treeNodeEle = this.getTreeNodeElement(el);
        if (!treeNodeEle) return;
        let treeNode = Uti.getItemByPropertyInTree(this.treeViewData, 'id', (treeNodeEle.id || '0'));
        this.itemSelectHandler(treeNode);
    }

    public treeNodeTextChnageHandler() {
        if (parseInt(this.currentNode.id) < 0) return;
    }

    public unRenameHandler() {
        this.setAllValueForTreeItem('isRename', false);
        this.bindToTooltip();
    }

    private preventCircle = 0;
    private getTreeNodeElement(element: any): any {
        if (this.preventCircle === 100) {
            this.preventCircle = 0;
            return element;
        }
        this.preventCircle++;
        if (!element || !element.parentNode) return null;
        if (element.parentNode.className && element.parentNode.className.indexOf('xn-tree-node') > -1) {
            return element.parentNode;
        }
        return this.getTreeNodeElement(element.parentNode);
    }

    private bindToTooltip() {
        //console.log('bindToTooltip');
        setTimeout(() => {
            let treeItems: any = $('.tree-view-node-text');
            for (let item of treeItems) {
                $(item).unbind('mouseenter');
                $(item).bind('mouseenter', function () {
                    let $this: any = $(this);
                    if (this.offsetWidth < this.scrollWidth) {
                        $this.tooltip({
                            title: $this.text(),
                            placement: 'top'
                        });
                        $this.tooltip('show');
                    } else {
                        $this.tooltip("destroy")
                        $this.tooltip('hide');
                    }
                });
            }
        }, 1000);
    }

    private makeData() {
        if (!this.data || !this.data.data || typeof this.data.data.length === 'undefined') {
            this.treeViewData = [];
            this.noEntryDataEvent.emit(true);
            return;
        }
        this.rawData = this.data.data;
        if (!this.editMode) {
            this.rawData = this.data.data.filter(x => x.select);
        }
        if (!this.rawData || !this.rawData.length) {
            this.treeViewData = [];
            this.noEntryDataEvent.emit(true);
            return;
        }
        this.currentTreeViewData = cloneDeep(this.treeViewData);
        this.setCurrentExpand();
        this.makeTreeViewData();
    }

    public leftSideChange() {
        this.makeOutPutData();
    }

    public rightSideChange() {
        this.makeOutPutData();
    }

    private makeOutPutData() {
        this.isFormChanged = true;
        this.dataChange.emit(true);
    }

    public getFinalData(): any {
        this.crossTreeDataFinal = [];
        this.makeCrossTreeData(this.crossTreeDataFinal, this.treeViewData);
        this.treeViewDataEdited = this.crossTreeDataFinal;

        const key = Object.keys(this._widgetDetail.widgetDataType.listenKeyRequest(this.widgetModuleInfo.moduleNameTrim))[0];
        const value = this._widgetDetail.widgetDataType.listenKeyRequest(this.widgetModuleInfo.moduleNameTrim)[key];

        const saveData1 = this.treeViewService.makeDataForSaveTreeView(this.treeViewDataEditMode, this.treeViewDataEdited, value);
        const saveData2 = this.treeViewService.makeDataForSaveTreeViewMaster(this.addItems, this.deleteItems, value);
        this.treeViewDataEditMode = this.treeViewDataEdited;
        return [...saveData1, ...saveData2];
    }

    public setExpandForTree(isExpandAll: boolean) {
        $('#' + this.mainHtmlId).css('width', 5000);
        this.setAllValueForTreeItem('expand', isExpandAll);
        this.waitingElementCounter = 0;
        this.calculateWidthForTreeView(500);
    }

    private preventCallManyTimes: number = 0;
    public itemSelectHandler($event) {
        if (!$event) return;
        if (this.preventCallManyTimes) {
            return;
        }
        this.preventCallManyTimes++;
        this.resetPreventCall();
        this.currentNode = $event;

        //this.setAllValueForTreeItem('isSelected', false);
        let findNode = this.searchSingleNodeFromTree(this.treeViewData, 'isSelected', true);
        if (findNode) {
            findNode.isSelected = false;
        }

        $event.isSelected = true;
        this.buildContextData();
        this.bindToTooltip();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
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

    private resetPreventCall() {
        setTimeout(() => {
            this.preventCallManyTimes = 0;
        }, 300);
    }

    private buildContextData() {
        if (this.editMode && this.contextMenuData.length) {
            this.contextMenuData[1].disabled = this.currentNode.isRename;
            this.contextMenuData[2].disabled = (this.currentNode.children && this.currentNode.children.length);
        } else {
            this.contextMenuData = [];
        }
        this.contextCompletedBuild = false;
    }

    private createContextData() {
        return [
            {
                id: 'tree-view-add-category',
                title: 'New Category',
                iconName: 'fa-plus  green-color',
                callback: (event) => { this.addCategory(); },
                disabled: false
            },
            {
                id: 'tree-view-rename-category',
                title: 'Rename',
                iconName: 'fa-pencil  orange-color',
                callback: (event) => { this.renameCategory(); },
                disabled: false
            },
            {
                id: 'tree-view-delete-category',
                title: 'Delete',
                iconName: 'fa-times  red-color',
                callback: (event) => { this.deleteCategory(); },
                disabled: false
            }
        ];
    }

    private addCategory() {
        if (!this.currentNode) return;
        this.currentNode.children = this.currentNode.children || [];
        let item = {
            'id': Uti.getTempId2() + '',
            'select': false,
            'text': 'New category',
            'isMain': false,
            'isMainText': 'Is Main',
            'percentText': 'Percent',
            'percent': '',
            'expand': true,
            'parentId': this.currentNode.id,
            'level': this.currentNode.level + 1,
            'idArticleGroups': this.currentNode.idArticleGroups,
            'isSelected': false,
            'isRename': false,
            'idSharingTreeGroupsRootname': this.currentNode.idSharingTreeGroupsRootname
        };
        this.currentNode.children.push(item);
        this.addItems.push(item);
        this.currentNode.expand = true;

        this.addItemToRawData(item);
    }

    private addItemToRawData(item: any) {
        this.rawData.push(
            {
                'id': item.id,
                'select': false,
                'text': item.text,
                'isMain': false,
                'isMainText': item.isMainText,
                'percentText': item.percentText,
                'percent': '',
                'parentId': item.parentId,
                'idArticleGroups': item.idArticleGroups,
                'idSharingTreeGroupsRootname': item.idSharingTreeGroupsRootname
            });
    }

    private renameCategory() {
        //this.setAllValueForTreeItem('isRename', false);
        let findNode = this.searchSingleNodeFromTree(this.treeViewData, 'isRename', true);
        if (findNode) {
            findNode.isRename = false;
        }

        this.bindToTooltip();
        this.currentNode.isRename = true;

        setTimeout(() => {
            $('#' + this.mainHtmlId + ' #inputCatName' + this.currentNode.id).focus();
        }, 200);
    }

    private deleteCategory() {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Item',
            messageType: MessageModal.MessageType.error,
            message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToDeleteSelectedItem' }, { key: '<p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.deleteCurrentItem();
            }
        }));
    }

    private deleteCurrentItem() {
        Uti.removeItemInTreeArray(this.treeViewData, this.currentNode, 'id', 'children');
        Uti.removeItemInArray(this.addItems, this.currentNode, 'id');
        this.addToDeleteItems();
    }

    private addToDeleteItems() {
        if (parseInt(this.currentNode.id) > 0) {
            this.deleteItems.push(this.currentNode);
        }
        this.currentNode = {};
    }

    private setCurrentExpand() {
        if (!this.currentTreeViewData || !this.currentTreeViewData.length) { return; }
        this.crossTreeData = [];
        this.makeCrossTreeData(this.crossTreeData, this.currentTreeViewData);
    }

    private makeCrossTreeData(crossTreeData, data) {
        for (const item of data) {
            crossTreeData.push({
                id: item.id,
                select: item.select,
                text: item.text,
                isMain: item.isMain,
                isMainText: item.isMainText,
                percentText: item.percentText,
                percent: item.percent,
                expand: this.config.editMode ? item.expand : true,
                parentId: 0,
                level: 0,
                idArticleGroups: item.idArticleGroups,
                isSelected: false,
                idSharingTreeGroupsRootname: item.idSharingTreeGroupsRootname
            });
            this.makeCrossTreeDataChildren(crossTreeData, item);
        }
    }
    private makeCrossTreeDataChildren(crossTreeData, data) {
        if (!data || !data.children || !data.children.length) { return; }
        for (const item of data.children) {
            crossTreeData.push({
                id: item.id,
                select: item.select,
                text: item.text,
                isMain: item.isMain,
                isMainText: item.isMainText,
                percentText: item.percentText,
                percent: item.percent,
                expand: this.config.editMode ? item.expand : true,
                parentId: item.parentId,
                level: item.level,
                idArticleGroups: item.idArticleGroups,
                isSelected: false,
                idSharingTreeGroupsRootname: item.idSharingTreeGroupsRootname
            });
            this.makeCrossTreeDataChildren(crossTreeData, item);
        }
    }

    private findCrossDataById(id: any) {
        if (!this.crossTreeData || !this.crossTreeData.length) { return null; }
        return this.crossTreeData.find(x => x.id === id);
    }

    private getCurrentExpandById(id: any): boolean {
        const currentCrossData = this.findCrossDataById(id);
        if (!currentCrossData) { return false; }
        return currentCrossData.expand;
    }

    private makeTreeViewData() {
        this.makeParentTreeViewData();
        let child: any;
        for (const item of this.treeViewData) {
            child = this.rawData.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(item, child, 1);
        }
    }

    private makeParentTreeViewData() {
        const parent = this.rawData.filter(x => !x.parentId);
        this.treeViewData = parent.map(x => {
            return {
                id: x.id,
                select: x.select,
                text: x.text,
                isMain: x.isMain,
                isMainText: x.isMainText,
                percentText: x.percentText,
                percent: x.percent,
                expand: this.config.editMode ? this.getCurrentExpandById(x.id) : true,
                parentId: 0,
                level: 0,
                idArticleGroups: x.idArticleGroups,
                isSelected: false,
                idSharingTreeGroupsRootname: x.idSharingTreeGroupsRootname
            };
        });
        // For widget tree view know
        this.noEntryDataEvent.emit(this.treeViewData.length == 0);
    }

    private makeChildrenTreeViewData(parent: any, children: any, level: number) {
        if (!children || !children.length) { return; }
        parent.children = [];
        let _children: any;
        for (const item of children) {
            const child: any = {
                id: item.id,
                select: item.select,
                text: item.text,
                isMain: item.isMain,
                isMainText: item.isMainText,
                percentText: item.percentText,
                percent: item.percent,
                expand: this.config.editMode ? this.getCurrentExpandById(item.id) : true,
                parentId: parent.id,
                level: level,
                idArticleGroups: item.idArticleGroups,
                isSelected: false,
                idSharingTreeGroupsRootname: item.idSharingTreeGroupsRootname
            };
            parent.children.push(child);
            _children = this.rawData.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(child, _children, (level + 1));
        }
    }

    private setAllValueForTreeItem(property: string, value: any) {
        if (!this.treeViewData || !this.treeViewData.length) {
            return;
        }

        for (const item of this.treeViewData) {
            this.setValueForAllTreeItem(item, property, value);
        }
    }

    private setValueForAllTreeItem(treeData: any, property: string, value: any) {
        treeData[property] = value;
        if (!treeData.children || !treeData.children.length) return;
        for (const child of treeData.children) {
            this.setValueForAllTreeItem(child, property, value);
        }
    }

    /******************************************************************************************************************************************/
    /* FOR WIDGET */

    protected treeViewDataViewMode: any;
    protected treeViewDataEditMode: any;
    public isCacheViewData = false;
    protected treeViewDataEdited: any;
    public isOnEditTreeView = false;

    protected getTreeViewData(editMode?: boolean) {
        const getParam = cloneDeep(this._widgetDetail);
        if (editMode) {
            getParam.request = getParam.request.replace('\\"Mode\\" : \\"\\"', '\\"Mode\\" : \\"Edit\\"');
        } else {
            getParam.request = getParam.request.replace('\\"Mode\\" : \\"Edit\\"', '\\"Mode\\" : \\"\\"');
        }
        if (!getParam.request) {
            console.log('xn-tree-view.component: getTreeViewData: request cannot empty. WidgetDetail:', this._widgetDetail);
            return;
        }

        const rsObservable = this.widgetTemplateSettingService.getWidgetDetailByRequestString(getParam, this._widgetDetail.widgetDataType.listenKeyRequest(this.widgetModuleInfo.moduleNameTrim));

        rsObservable.subscribe((widgetDetail: WidgetDetail) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(widgetDetail)) {
                    return;
                }
                this.setUpDataForTreeViewAfterGetService(widgetDetail, editMode);
            });
        });
    }

    public setUpDataForTreeView(editMode?: boolean, afterService?: boolean) {
        let tempData: any;
        editMode = editMode || false;

        // 1. Edit Mode
        if (editMode) {
            //check caching data
            if (!isEmpty(this.treeViewDataEditMode) || afterService) {
                // if (this.isCacheEditData || afterService) {
                tempData = this.treeViewDataEditMode;
            }
        }
        // 2. View Mode
        else {
            //check caching data
            if ((this.isCacheViewData || afterService) && this.treeViewDataViewMode) {
                tempData = this.treeViewDataViewMode;
            }
        }

        if (tempData) {
            this.data = {
                data: tempData.sort((a, b) => { return Uti.sortBy(a, b, 'text'); }),
                config: { editMode: editMode }
            };
        }
        else {
            // none caching data to re-get data from service
            this.getTreeViewData(editMode);
        }
    }

    public setUpDataForTreeViewAfterGetService(data: any, editMode?: boolean) {
        if (data.idRepWidgetType !== WidgetType.TreeView ||
            !data || !data.contentDetail ||
            !data.contentDetail.collectionData || !data.contentDetail.collectionData.length) {
            this.noEntryDataEvent.emit(true);
            this.data = {
                data: [],
                config: { editMode: editMode }
            }
            return;
        }
        let treeData = data.contentDetail.collectionData.map(item => {
            return this.treeViewService.makeTreeViewItemData(item);
        });
        treeData = treeData.filter(x => !!x.id);
        if (editMode) {
            this.treeViewDataEditMode = treeData;
            this.isCacheViewData = false;
        } else {
            this.treeViewDataViewMode = treeData;
            this.isCacheViewData = true;
        }
        this.isOnEditTreeView = editMode;
        this.setUpDataForTreeView(editMode, true);
    }

    public resetOnInit() {
        this.isFormChanged = false;
        this.data = [];
        this.treeViewDataViewMode = [];
        this.treeViewDataEditMode = [];
        this.treeViewDataEdited = [];
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
