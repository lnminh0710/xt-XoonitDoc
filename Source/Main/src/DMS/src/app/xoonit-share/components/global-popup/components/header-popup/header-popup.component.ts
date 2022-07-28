import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { PopupHeader } from '../../models/popup-header.interface';
import { PopupRef } from '../../popup-ref';
import { cloneDeep } from 'lodash-es';
import { IconNames } from '@app/app-icon-registry.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'header-popup',
    styleUrls: ['../../popup.scss'],
    templateUrl: 'header-popup.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class HeaderPopupComponent implements OnInit, OnDestroy {
    private _onDestroy = new Subject<boolean>();

    public header: PopupHeader;
    public iconCloseHeader = IconNames.APP_CLOSE_POPUP;

    constructor(private popupRef: PopupRef, private cdRef: ChangeDetectorRef) {
        const params = this.popupRef.params;
        this.header = cloneDeep(params.header);
        if (!this.header) return;
        this._registerSubscriptions();
    }

    private _registerSubscriptions() {
        this.popupRef.titleChanged$.pipe(takeUntil(this._onDestroy.asObservable())).subscribe((title: string) => {
            this._setTitle(title);
        });
    }

    ngOnInit() {}

    ngOnDestroy(): void {
        this._onDestroy.next(true);
    }

    public close() {
        this.popupRef.close({ rollback: true });
    }

    private _setTitle(title: string) {
        this.header.title = title;
        this.cdRef.detectChanges();
    }

    // using the 'esc' key to closes the popup
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.popupRef.close(event);
    }
}
