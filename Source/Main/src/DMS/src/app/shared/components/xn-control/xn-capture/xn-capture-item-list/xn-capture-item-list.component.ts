import { Component, OnInit, Input, Output,
    EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'xn-capture-item-list',
    styleUrls: ['./xn-capture-item-list.component.scss'],
    templateUrl: './xn-capture-item-list.component.html'
})
export class CaptureItemList extends BaseComponent implements OnInit, OnDestroy {
    @Input() captureItems: any;
    @Input() isShowCapture: boolean;

    @Output() actionRemove = new EventEmitter<any>();
    @Output() actionUpdateComment = new EventEmitter<any>();
    constructor(
        router?: Router
    ) {
        super(router);
    }

    public ngOnInit() {

    }

    public ngOnDestroy() {

    }

    public actionRemoveHandler($event) {
        this.actionRemove.emit($event);
    }

    public actionUpdateCommentHandler($event) {
        this.actionUpdateComment.emit($event);   
    }
}
