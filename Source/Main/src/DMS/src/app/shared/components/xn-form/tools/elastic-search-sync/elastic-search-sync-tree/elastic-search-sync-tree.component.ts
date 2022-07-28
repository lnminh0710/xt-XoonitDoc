
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    ViewChild,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import { WjTreeView } from 'wijmo/wijmo.angular2.nav';

@Component({
    selector: 'elastic-search-sync-tree',
    styleUrls: ['./elastic-search-sync-tree.component.scss'],
    templateUrl: './elastic-search-sync-tree.component.html'
})
export class ElasticSearchSyncTreeComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() data: Array<any> = [];

    @Output() outputData: EventEmitter<any> = new EventEmitter();

    @ViewChild('wjTreeView') wjTreeView: WjTreeView;

    constructor(router ? : Router) {
        super(router);
    }
    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public onCheckedItemsChanged($event) {
        this.outputData.emit(this.wjTreeView.checkedItems);
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    //#region Make Data Tree

    /*private executeData(data: Array<any>) {
        if (!data || !data.length) {
            this.treeViewData = [];
            this.tempData = [];
            return;
        }
        this.makeTreeViewData(data);
        this.treeViewData = this.tempData;
    }

    private makeTreeViewData(data: Array<any>) {
        this.makeParentTreeViewData(data);
        let child: any;
        for (const item of this.tempData) {
            child = data.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(item, child, 1, data);
        }
    }

    private makeParentTreeViewData(data: Array<any>) {
        const parent = data.filter(x => !x.parentId);
        this.tempData = parent.map(x => {
            return {
                id: x.id,
                header: x.text,
                index: x.index,
                type: x.type,
                parentId: 0,
                level: 0
            };
        });
    }

    private makeChildrenTreeViewData(parent: any, children: any, level: number, data: Array<any>) {
        if (!children || !children.length) { return; }
        parent.items = [];
        let _children: any;
        for (const item of children) {
            const child: any = {
                id: item.id,
                header: item.text,
                index: item.index,
                type: item.type,
                parentId: parent.id,
                level: level
            };
            parent.items.push(child);
            _children = data.filter(x => x.parentId === item.id);
            this.makeChildrenTreeViewData(child, _children, (level + 1), data);
        }
    }*/

    //#endregion
}
