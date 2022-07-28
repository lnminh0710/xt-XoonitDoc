import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Module } from '@app/models';
import { MyContactSelectors } from '@app/pages/my-contact/my-contact.statemanagement/my-contact.selectors';
import { MyContactActionNames, GetContactByKeywordAction } from '@app/pages/my-contact/my-contact.statemanagement/my-contact.actions'
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-contact-list',
    templateUrl: './widget-contact-list.component.html',
    styleUrls: ['./widget-contact-list.component.scss']
})
export class WidgetContactListComponent extends BaseComponent implements OnInit, OnDestroy {

    private unsubscribe$: Subject<any> = new Subject<any>();

    title: string;
    public moduleFromRoute: Module;
    public columns: any[];
    public keyword = '';
    public isWildStar: boolean;
    public isSearching: boolean;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private myContactSelectors: MyContactSelectors,
    ) {
        super(router);
        this.moduleFromRoute = this.ofModule;
        this.myContactSelectors.actionSuccessOfSubtype$(MyContactActionNames.GET_CONTACT_BY_KEYWORD)
            .pipe(
                filter((action: GetContactByKeywordAction) => !!action.payload),
                takeUntil(this.unsubscribe$),
            )
            .subscribe((action: GetContactByKeywordAction) => {
                this.keyword = action.payload;
                this.cdRef.detectChanges();
            });
    }

    ngOnInit(): void { 
        this.title = 'company'
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public rowClicked($event) {
    }

    public rowDoubleClicked($event) {
    }

    public onSearchCompleted($event: any) {
        // console.log(`widget-es-mydm-management.component onSearchCompleted: `, { $event: $event }, 'color: blue');
        if (!$event) return;

        this.columns = $event.columns;
    }

    public search($event: string) {
        if ($event === this.keyword) return;

        this.isWildStar = $event.trim() === '*' ? true : false;
        this.isSearching = true;
        this.keyword = $event;
        this.cdRef.detectChanges();
    }
}
