import { Component, OnInit, AfterViewInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IPageEvent } from '../models/page-event.model';
import { BaseComponent } from '@app/pages/private/base';

@Component({
    selector: 'xn-paginator',
    templateUrl: './xn-paginator.component.html',
    styleUrls: ['./xn-paginator.component.scss'],
})
export class XnPaginatorComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    private _page: number;
    private _pageSize: number;
    private _totalPages: number;
    private _formControlClassStyle: string;
    private _btnNavigationClassStyle: string;

    @Input() public set page(val: number) {
        this._page = val;
    }

    public get page() {
        return this._page;
    }

    @Input() public set pageSize(val: number) {
        this._pageSize = val;
    }

    public get pageSize() {
        return this._pageSize;
    }

    @Input() public set totalPages(val: number) {
        this._totalPages = val;
    }

    public get totalPages() {
        return this._totalPages;
    }

    @Input() public set formControlClassStyle(val: string) {
        this._formControlClassStyle = val;
    }
    public get formControlClassStyle() {
        return this._formControlClassStyle ? ' ' + this._formControlClassStyle : null;
    }

    @Input() public set btnNavigationClassStyle(val: string) {
        this._btnNavigationClassStyle = val;
    }
    public get btnNavigationClassStyle() {
        return this._btnNavigationClassStyle ? ' ' + this._btnNavigationClassStyle : null;
    }

    @Output() pageChangedEvent = new EventEmitter<IPageEvent>();

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit(): void {}
    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy;
    }

    public goToPreviousPage(page: number) {
        if (!this.canPreviousPage(page)) return;

        this._page -= 1;
        this.pageChangedEvent.emit({
            page: this._page,
            pageSize: this._pageSize,
            totalPages: this._totalPages,
        });
    }

    public goToNextPage(page: number) {
        if (!this.canNextPage(page, this.totalPages)) return;

        this._page += 1;
        this.pageChangedEvent.emit({
            page: this._page,
            pageSize: this._pageSize,
            totalPages: this._totalPages,
        });
    }

    public changePage($event: KeyboardEvent) {
        const inputElem = $event.srcElement as HTMLInputElement;
        if (!inputElem.value) return;

        const page = +inputElem.value;

        if (page <= 0 || page > this._totalPages) {
            return;
        }

        this._page = page;
        this.pageChangedEvent.emit({
            page: this._page,
            pageSize: this._pageSize,
            totalPages: this._totalPages,
        });
    }

    public changePageSize($event: KeyboardEvent) {
        const inputElem = $event.srcElement as HTMLInputElement;
        if (!inputElem.value) return;

        this._pageSize = +inputElem.value;
        this.pageChangedEvent.emit({
            page: this._page,
            pageSize: this._pageSize,
            totalPages: this._totalPages,
        });
    }

    public canNextPage(page: number, totalPages: number) {
        return page < totalPages ? true : false;
    }

    public canPreviousPage(page: number) {
        return page > 1 ? true : false;
    }
}
