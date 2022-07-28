import { BaseComponent, ModuleList } from '@app/pages/private/base';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchPageType } from '@app/models/search-page/search-page-type.model';
import { DomHandler } from '@app/services';
import { MatButton } from '@xn-control/light-material-ui/button';
import { Module } from '@app/models';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModuleActions } from '@app/state-management/store/actions';

@Component({
    selector: 'widget-search-page',
    templateUrl: './widget-search-page.component.html',
    styleUrls: ['./widget-search-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetSearchPageComponent extends BaseComponent implements OnInit, OnDestroy {
    public MODULE_LIST_CONSTANT = ModuleList;

    @Input() searchPageType: SearchPageType = new SearchPageType();
    @ViewChild('searchInputElm') searchInputElm: ElementRef;
    @ViewChild('clearSearchElm') clearSearchBtn: MatButton;

    public searchText = '';
    public isFocus: boolean;

    constructor(
        protected router: Router,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        protected cdr: ChangeDetectorRef,
        private domHandler: DomHandler,
    ) {
        super(router);
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit(): void {
        this.searchText = '*';
        this.search();
    }

    focusOutSearchBox() {
        this.isFocus = false;
        this.cdr.markForCheck();
    }

    focusSearchBox() {
        this.isFocus = true;
        this.cdr.markForCheck();
    }

    keypress($event) {
        if ($event.which === 13 || $event.keyCode === 13) {
            $event.preventDefault();
        } else {
            this.searchText = $event.target.value;
            if (this.searchText) {
                this.domHandler.removeClass(this.clearSearchBtn._elementRef.nativeElement, 'hidden');
            } else {
                this.domHandler.addClass(this.clearSearchBtn._elementRef.nativeElement, 'hidden');
            }
            this.cdr.markForCheck();
        }
    }

    clearSearchText() {
        this.searchText = '';
        this.searchInputElm.nativeElement.value = this.searchText;
        this.domHandler.addClass(this.clearSearchBtn._elementRef.nativeElement, 'hidden');
        this.cdr.markForCheck();
    }

    search($event?: any) {
        if (!this.searchText) return;

        this.store.dispatch(
            this.moduleActions.searchKeywordModule(
                new Module({
                    searchKeyword: this.searchText,
                    idSettingsGUI: this.searchPageType.idSettingsGUI,
                    isCanSearch: true,
                }),
            ),
        );

        if ($event) {
            $event.preventDefault();
        }
    }
}
