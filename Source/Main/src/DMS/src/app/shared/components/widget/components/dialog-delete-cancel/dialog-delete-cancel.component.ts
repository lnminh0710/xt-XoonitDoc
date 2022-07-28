import { Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { DeleteCancelModel } from '@app/models/common/delete-cancel.model';
import { Uti } from '@app/utilities';

@Component({
    selector: 'dialog-delete-cancel',
    styleUrls: ['./dialog-delete-cancel.component.scss'],
    templateUrl: './dialog-delete-cancel.component.html'
})
export class DialogDeleteCancelComponent implements OnInit, OnDestroy, AfterViewInit {
    private callBackAfterClose: Function;
    private callBackAfterSaving: Function;
    public showDialog = false;

    public maxCharactersNotes = 500;
    public leftCharacters = this.maxCharactersNotes;
    public data: DeleteCancelModel = new DeleteCancelModel();

    constructor() {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    ngAfterViewInit() {

    }

    /**
     * open
     * @param callBackAfterClose
     */
    public open(callBackAfterClose, callBackAfterSaving) {
        this.callBackAfterClose = callBackAfterClose;
        this.callBackAfterSaving = callBackAfterSaving;
        this.showDialog = true;
    }

    public save() {
        if (this.callBackAfterSaving) {
            this.callBackAfterSaving(this.data);
        }
        this.showDialog = false;
        if (this.callBackAfterClose) {
            this.callBackAfterClose();
        }
    }

    public cancel() {
        this.showDialog = false;
        if (this.callBackAfterClose) {
            this.callBackAfterClose();
        }
    }

    public updateLeftCharacters(event) {
        setTimeout(() => {
            this.leftCharacters = this.maxCharactersNotes - event.target.value.length;
        });
    }
}
