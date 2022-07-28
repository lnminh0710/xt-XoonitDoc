import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Module } from '@app/models';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { DocumentManagementActionNames, GetDocumentsByKeywordAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';

@Component({
    selector: 'widget-es-mydm-management',
    templateUrl: './widget-es-mydm-management.component.html',
    styleUrls: ['./widget-es-mydm-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetEsMyDmManagementComponent extends BaseComponent implements OnInit {

    public moduleFromRoute: Module;
    public columns: any[];
    public keyword: string;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private documentManagementSelectors: DocumentManagementSelectors,
    ) {
        super(router);
        this.moduleFromRoute = this.ofModule;
        // console.log(`widget-es-mydm-management.component constructor: `, { moduleFromRoute: this.moduleFromRoute }, 'color: red');
        // super.registerSubscriptionsToAutomaticallyUnsubscribe(
        //     this.documentManagementSelectors.actionOfType$(DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD)
        //         .filter((action: GetDocumentsByKeywordAction) => !!action.payload)
        //         .subscribe((action: GetDocumentsByKeywordAction) => {
        //             this.keyword = action.payload.keyword;
        //             this.cdRef.detectChanges();
        //         }),
        // );

    }

    ngOnInit(): void { }

    public rowClicked($event) {
        // console.log(`widget-es-mydm-management.component rowClicked: `, { $event: $event }, 'color: blue');
    }

    public rowDoubleClicked($event) {
        // console.log(`widget-es-mydm-management.component rowDoubleClicked: `, { $event: $event }, 'color: blue');
    }

    public onSearchCompleted($event: any) {
        // console.log(`widget-es-mydm-management.component onSearchCompleted: `, { $event: $event }, 'color: blue');
        if (!$event) return;

        this.columns = $event.columns;
    }
}
