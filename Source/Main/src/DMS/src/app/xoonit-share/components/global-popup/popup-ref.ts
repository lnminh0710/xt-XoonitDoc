import { OverlayRef } from '@angular/cdk/overlay';
import { TemplateRef, Type } from '@angular/core';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { isBoolean } from 'wijmo/wijmo';
import { PopupParams } from './models/popup-params.interface';

export type PopupRenderSectionMethod = 'template' | 'component' | 'text';
export type PopupContent = TemplateRef<any> | Type<any> | string;

export interface PopupCloseEvent<T = any> {
    type: 'backdropClick' | 'close';
    data: T;
}

export class PopupRef<T = any> {
    private _disableCloseOutside = true;

    private _afterClosed = new Subject<PopupCloseEvent<T>>();
    public afterClosed$ = this._afterClosed.asObservable();

    private _afterPopupOpened = new Subject<any>();
    public afterPopupOpened$ = this._afterPopupOpened.asObservable();

    private _setTitle = new Subject<string>();

    public get titleChanged$() {
        return this._setTitle.asObservable();
    }

    constructor(public overlay: OverlayRef, public params: PopupParams<T>) {
        this._disableCloseOutside = isBoolean(params.disableCloseOutside) ? params.disableCloseOutside : false;

        overlay
            .backdropClick()
            .pipe(take(1))
            .subscribe(() => {
                if (this._disableCloseOutside) return;

                this._close('backdropClick', null);
            });
    }

    public close(data?: T) {
        this._close('close', data);
    }

    public updatePopupTitle(title: string) {
        this._setTitle.next(title);
    }

    public handleAfterInit() {
        this._afterPopupOpened.next();
        this._afterPopupOpened.complete();
    }

    private _close(type: PopupCloseEvent['type'], data?: T) {
        this.overlay.dispose();
        this._afterClosed.next({
            type,
            data,
        });
        this._afterClosed.complete();
    }
}
