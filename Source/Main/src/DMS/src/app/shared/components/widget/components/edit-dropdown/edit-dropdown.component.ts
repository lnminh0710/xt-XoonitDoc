import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'edit-dropdown',
    styleUrls: ['./edit-dropdown.component.scss'],
    templateUrl: './edit-dropdown.component.html'
})

export class EditDropdownComponent implements OnInit, OnDestroy {

    @Output() editInPopupClick = new EventEmitter<any>();
    @Output() editInlineClick = new EventEmitter<any>();

    constructor() { }

    ngOnInit() { }

    ngOnDestroy() { }

    public editInPopup() {
        this.editInPopupClick.emit();
    }

    public editInline() {
        this.editInlineClick.emit();
    }
}