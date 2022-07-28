import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { IDocumentManagementState } from '@app/pages/document-management/document-management.statemanagement/document-management.state';
import { Store } from '@ngrx/store';
import { GetDocumentsByKeywordAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';

@Component({
    selector: 'widget-search-mydm',
    templateUrl: './widget-search-mydm.component.html',
    styleUrls: ['./widget-search-mydm.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetSearchMyDmComponent extends BaseComponent implements OnInit {
    constructor(
        protected router: Router,
        private doucumentManagementStore: Store<IDocumentManagementState>,
    ) {
        super(router);
    }

    ngOnInit(): void { }

    public okToSearch($event) {
        const input = ($event.target as HTMLInputElement);
        const val = input.value;
        // this.doucumentManagementStore.dispatch(new GetDocumentsByKeywordAction({
        //     keyword: val,
        //     widgetName: this.constructor.name
        // }));
    }
}
