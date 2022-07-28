import {
    Component, Input, Output, EventEmitter, OnInit,
    OnDestroy, AfterViewInit, ElementRef, ChangeDetectorRef, ViewChild
} from "@angular/core";
import {
    ControlGridModel, ControlGridColumnModel
} from '@app/models';
import isObject from 'lodash-es/isObject';
import cloneDeep from 'lodash-es/cloneDeep';
//import { WijmoGridComponent } from '@app/shared/components/wijmo';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { WidgetDetail } from '@app/models';

@Component({
    selector: 'widget-role-tree-grid',
    templateUrl: './widget-role-tree-grid.component.html',
    styleUrls: ['./widget-role-tree-grid.component.scss']
})
export class WidgetRoleTreeGridComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    // Const
    private IdKey = 'IdLoginAccessRightsModule';
    private ParentIdKey = 'MasterIdLoginAccessRightsModule';
    private IdLoginRolesKey = 'IdLoginRoles';

    private idLoginRoles: number;

    private _dataSource: ControlGridModel;
    @Input() set dataSource(data: ControlGridModel) {
        this._dataSource = data;
        this.formatData();
        setTimeout(() => {
            this.isCompletedRender.emit(true);
        });
    }

    get dataSource() {
        return this._dataSource;
    }

    private _isActivated: boolean = true;
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

    private _gridData: any;
    @Input() set gridData(data: any) {
        this._dataSource = data;
    }

    get gridData() {
        return this._gridData;
    }

    @Input()
    set widgetDetail(data: WidgetDetail) {
        if (!data) {
            return;
        }
        const key = data.widgetDataType.listenKey.key;
        this.idLoginRoles = data.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim)[key];
    }
    @Input() isEditting: boolean = false;
    @Input() gridStyle: any;
    @Input() widgetStyle: any;
    @Input() globalProperties: any;

    @Output() onTableEditStart = new EventEmitter<any>();
    @Output() onTableEditSuccess = new EventEmitter<any>();
    @Output() onRowMarkedAsDelete = new EventEmitter<any>();
    @Output() isCompletedRender: EventEmitter<any> = new EventEmitter();
    @Output() onCheckAllChecked: EventEmitter<any> = new EventEmitter();
    @Output() onScrollPositionChanged: EventEmitter<any> = new EventEmitter();

    //@ViewChild(WijmoGridComponent) wijmoGridComponent: WijmoGridComponent;

    constructor(private _eref: ElementRef, private ref: ChangeDetectorRef, protected router: Router) {
        super(router);
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
    }

    /**
     * formatData
     */
    private formatData() {
        if (this.dataSource && this.dataSource.data && this.dataSource.data.length) {
            for (let i = 0; i < this.dataSource.data.length; i++) {
                this.dataSource.data[i].children = [];
            }
            this.buildTree(this.dataSource.data, null);
        }
        // this.dataSource.data = sortBy(this.dataSource.data, 'ModuleName');
    }

    /**
     * buildTree
     * @param tree
     * @param item
     */
    private buildTree(tree, item) {
        // If item then have parent
        if (item) {
            for (let i = 0; i < tree.length; i++) { // Find the parent
                if (String(tree[i][this.IdKey]) === String(item[this.ParentIdKey])) {
                    tree[i].children.push(item);
                    break;
                }
                else
                    this.buildTree(tree[i].children, item);
            }
        }
        // If no item then is a root item
        else {
            let idx = 0;
            while (idx < tree.length) {
                if (!isObject(tree[idx][this.ParentIdKey]) && tree[idx][this.ParentIdKey])
                    this.buildTree(tree, tree.splice(idx, 1)[0]) // if have parent then remove it from the array to relocate it to the right place
                else
                    idx++;
            }
        }
    }

    /**
     * onCheckboxChanged
     * @param item
     * @param fieldName
     */
    public onCheckboxChanged(item: any, fieldName: string) {
        item['IsEdited'] = true;
        let status = item[fieldName];
        status = status ? 1 : 0;
        item[fieldName] = status;
        item[this.IdLoginRolesKey] = this.idLoginRoles;
        if (item.children && item.children.length) {
            this.setStausForChildrenNode(item.children, fieldName, status);
        }
        if (item[this.ParentIdKey]) {
            let parent = this.dataSource.data.find(p => p[this.IdKey] == item[this.ParentIdKey]);
            if (parent) {
                this.setStatusForParent(parent, fieldName);
            }
        }
        this.onTableEditSuccess.emit(true);
    }

    public checkAllItems(colName, e) {
        //this.wijmoGridComponent.gridData.sourceCollection.forEach((item) => {
        //    if (!item['BorderStatus']) {
        //        this.wijmoGridComponent.gridData.editItem(item);
        //        item[colName] = e.checked;
        //        item['isEdited'] = true;
        //        this.onCheckboxChanged(item, colName);
        //        this.wijmoGridComponent.gridData.commitEdit();
        //    }
        //});
        this.onCheckAllChecked.emit(e.checked);
    }

    /**
     * setStatusForParent
     * @param parentNode
     * @param fieldName
     */
    private setStatusForParent(parentNode: any, fieldName) {
        if (parentNode.children) {
            let status = 0;
            let children: Array<any> = parentNode.children;
            children.forEach(child => {
                if (child[fieldName]) {
                    status = 1;
                }
            });
            parentNode[fieldName] = status;
            parentNode[this.IdLoginRolesKey] = this.idLoginRoles;
            parentNode['IsEdited'] = true;
        }
    }

    /**
     * setStausForChildrenNode
     * @param childs
     * @param fieldName
     * @param status
     */
    private setStausForChildrenNode(childs: Array<any>, fieldName, status) {
        childs.forEach(child => {
            child[fieldName] = status;
            child[this.IdLoginRolesKey] = this.idLoginRoles;
            child['IsEdited'] = true;
            if (child.children && child.children.length) {
                this.setStausForChildrenNode(child.children, fieldName, status);
            }
        });
    }

    /**
     * getEditedDataResult
     */
    public getEditedDataResult(): Array<any> {
        let editedArray: Array<any> = [];
        let dataSource = cloneDeep(this.dataSource);
        this.getEditedData(editedArray, dataSource.data);
        return editedArray;
    }

    /**
     * Get Edited Data
     * @param editedArray
     * @param datasource
     */
    private getEditedData(editedArray: Array<any>, data: Array<any>) {
        data.forEach(item => {
            if (item['IsEdited']) {
                editedArray.push(item);
            }
            if (item.children && item.children.length) {
                this.getEditedData(editedArray, item.children);
            }
        });
    }

    /**
     * tableEditStart
     * @param eventData
     */
    public tableEditStart(eventData) {
        this.onTableEditStart.emit(eventData);
    }

    /**
     * getHTMLTable
     */
    public getHTMLTable() {
        //return this.wijmoGridComponent ? this.wijmoGridComponent.getHTMLTable() : '';
    }

    /**
     * scrollPositionChanged
     * @param e
     */
    public scrollPositionChanged(e) {
        this.onScrollPositionChanged.emit(e);
    }
}
