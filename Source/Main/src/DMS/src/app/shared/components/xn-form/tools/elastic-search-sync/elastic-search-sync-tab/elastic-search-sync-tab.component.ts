
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import { TabDirective } from 'ngx-bootstrap/tabs';

@Component({
    selector: 'elastic-search-sync-tab',
    styleUrls: ['./elastic-search-sync-tab.component.scss'],
    templateUrl: './elastic-search-sync-tab.component.html'
})
export class ElasticSearchSyncTabComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() data: Array<any> = [];
    @Input() isIdle: boolean = true;

    @Output() outputData: EventEmitter<any> = new EventEmitter();

    constructor(router ? : Router) {
        super(router);
    }
    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public onTreeOutputData(checkedItems: Array<any>, tabz: any) {
        this.outputData.emit({
            checkedItems: checkedItems,
            tabz: tabz
        });
    }

    public selectTab(ev, tabz: any) {
        if (!(ev instanceof TabDirective))
            return;
        for (let item of this.data) {
            item.active = (item.title === tabz.title);
        }
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}
