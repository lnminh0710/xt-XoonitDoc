import { Component, OnInit, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { Module } from '@app/models';

@Component({
    selector: 'widget-elastic-search',
    templateUrl: './widget-elastic-search.component.html',
    styleUrls: ['./widget-elastic-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetElasticSearchComponent extends BaseComponent implements OnInit {

    public moduleFromRoute: Module;
    public keyword: string;
    public isWildStar: boolean;
    public isSearching: boolean;
    public columns: any[];

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
    ) {
        super(router);
        this.moduleFromRoute = this.ofModule;
        this.keyword = '*';
        this.isSearching = false;
        this.isWildStar = true;
    }

    ngOnInit(): void { }

    public rowClicked($event) {

    }

    public rowDoubleClicked($event) {

    }

    public onSearchCompleted($event: any) {
        if (!$event) return;

        this.isSearching = false;
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
