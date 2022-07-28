import { Directive, HostListener, Output, EventEmitter, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AppErrorHandler } from '../../../services';
import { Uti } from '@app/utilities';

@Directive({
    selector: '[xn-click-outside]'
})

export class ClickOutsideDirective implements OnInit, OnDestroy {
    private listening: boolean;
    private globalClick: Subscription;

    @Output('clickOutside') clickOutside: EventEmitter<Object>;

    constructor(
        private _elRef: ElementRef,
        private appErrorHandler: AppErrorHandler,
    ) {
        this.listening = false;
        this.clickOutside = new EventEmitter();
    }

    ngOnInit() {
        this.globalClick = fromEvent(document, 'click')
        .pipe(
            delay(1),
            tap(() => {
                this.listening = true;
            })
        ).subscribe((event: MouseEvent) => {
                this.appErrorHandler.executeAction(() => {
                    this.onGlobalClick(event);
                });
            });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    onGlobalClick(event: MouseEvent) {
        if (event instanceof MouseEvent && this.listening === true) {
            if (this.isDescendant(this._elRef.nativeElement, event.target) === true) {
                this.clickOutside.emit({
                    target: (event.target || null),
                    value: false
                });
            } else {
                this.clickOutside.emit({
                    target: (event.target || null),
                    value: true
                });
            }
        }
    }

    isDescendant(parent, child) {
        let node = child;
        while (node !== null) {
            if (node === parent) {
                return true;
            } else {
                node = node.parentNode;
            }
        }
        return false;
    }
}

