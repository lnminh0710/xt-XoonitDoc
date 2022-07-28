import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';

@Component({
    selector: 'xn-ngx-dropdown',
    styleUrls: ['./xn-ngx-dropdown.component.scss'],
    templateUrl: './xn-ngx-dropdown.component.html',
})
export class XnNgxDropdownComponent<T> extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _formControlClassStyle: string;

    @Input() dataSource: T[];
    @Input() displayFieldMember: string;
    @Input() valueFieldMember: string;
    @Input() displayNameDefaultOption: string;
    @Input() public set formControlClassStyle(val: string) {
        this._formControlClassStyle = val;
    }
    public get formControlClassStyle() {
        return this._formControlClassStyle ? ' ' + this._formControlClassStyle : null;
    }

    @Output() onSelectedDataChanged = new EventEmitter<T>();

    public selectedItem: T;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    public selectData(data: T) {
        this.selectedItem = data;
        this.onSelectedDataChanged.emit(data);
    }

    public clear() {
        this.selectedItem = null;
    }
}
