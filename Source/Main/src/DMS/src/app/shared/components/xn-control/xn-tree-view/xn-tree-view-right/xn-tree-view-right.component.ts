import {
    Component, Input, Output, EventEmitter
} from '@angular/core';

@Component({
    selector: 'app-xn-tree-view-right',
    styleUrls: ['./xn-tree-view-right.component.scss'],
    templateUrl: './xn-tree-view-right.component.html'
})
export class XnTreeViewRightComponent {
    public treeViewData: Array<any>;

    @Input() set data(data: any) {
        this.treeViewData = data;
    }
    @Input() config: any;

    @Output() dataChange: EventEmitter<any> = new EventEmitter();
    @Output() itemSelect: EventEmitter<any> = new EventEmitter();

    constructor() { }

    public percentChange(treeNode: any) {
        this.dataChange.emit(this.treeViewData);
    }

    public isMainCheckboxChange(treeNode: any) {
        this.itemSelect.emit(treeNode);
        this.dataChange.emit(this.treeViewData);
    }
    public onDataChange($event) {
        this.dataChange.emit(this.treeViewData);
    }

    public treeNodeClick(treeNode: any) {
        this.itemSelect.emit(treeNode);
    }
}
