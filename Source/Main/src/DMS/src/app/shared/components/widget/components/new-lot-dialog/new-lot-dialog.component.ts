import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'new-lot-dialog',
    styleUrls: ['./new-lot-dialog.component.scss'],
    templateUrl: './new-lot-dialog.component.html'
})

export class NewLotDialogComponent implements OnInit, OnDestroy {

    public showDialog = false;

    constructor(
    ) { }

    ngOnInit() { }

    ngOnDestroy() { }

    public close() {
        this.showDialog = false;
    }

    public open() {
        this.showDialog = true;
    }

    public cancel() {
        this.close();
    }

    public ok() {
        this.close();
    }
}