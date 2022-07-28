import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ContextMenuService, AppErrorHandler } from '@app/services';
import { Subscription } from 'rxjs';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { ProcessDataActions, CustomAction } from '@app/state-management/store/actions';
import { filter } from 'rxjs/operators';

@Directive({
    selector: '[context-menu-directive]',
    host: { '(contextmenu)': 'rightClicked($event)' },
})
export class XnContextMenuDirective implements OnInit, OnDestroy {
    @Input('context-menu-directive') menus: Array<any>;
    @Input() waiting = false;
    @Input() wantToLeftClick = true;
    @Input() isShowMenu = true;

    private waitingTimes = 0;
    private recursiveCounter = 0;
    private isLeftClicked = false;
    private dontWantToShowContextSubscription: Subscription;
    private dontWantToShowContextMenu: boolean = false;

    constructor(
        private contextMenuService: ContextMenuService,
        private elementRef: ElementRef,
        private dispatcher: ReducerManagerDispatcher,
        private appErrorHandler: AppErrorHandler,
    ) {}

    ngOnInit() {
        this.subcribeDontWantToShowContext();
    }

    ngOnDestroy() {
        if (this.dontWantToShowContextSubscription) {
            this.dontWantToShowContextSubscription.unsubscribe();
        }
    }

    rightClicked(event: MouseEvent) {
        if (this.isIgnore(event)) return;
        setTimeout(() => {
            // console.log('show');
            if (this.dontWantToShowContextMenu) {
                this.dontWantToShowContextMenu = false;
                return;
            }
            if (!this.menus || !this.menus.length || !this.isShowMenu) return;

            if (this.wantToLeftClick && !this.isLeftClicked) {
                $(event.srcElement).click();
                this.isLeftClicked = true;
            }
            const timeout = this.menus[0].timeout || 0;
            event.preventDefault();
            if (this.waitingTimes === 50) {
                this.waitingTimes = 0;
                return;
            }
            if (this.waiting) {
                setTimeout(() => {
                    this.waitingTimes++;
                    this.rightClicked(event);
                }, 50);
                return;
            }
            setTimeout(() => {
                setTimeout(() => {
                    this.contextMenuService.show.next({ event: event, obj: this.menus });
                    this.isLeftClicked = false;
                    this.waitingTimes = 0;
                }, timeout);
            }, 100);
        }, 100);
    }

    private subcribeDontWantToShowContext() {
        this.dontWantToShowContextSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ProcessDataActions.DONT_WANT_TO_SHOW_CONTEXT_MENU;
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    // console.log('set');
                    this.dontWantToShowContextMenu = true;
                    setTimeout(() => {
                        this.dontWantToShowContextMenu = false;
                    }, 500);
                });
            });
    }

    private isIgnore(event: MouseEvent) {
        // if (!event || !event.toElement) return true;
        if (!event || !event.relatedTarget) return true;
        this.recursiveCounter = 0;
        // return this.hasIgnoreClass(event.toElement);
        return this.hasIgnoreClass(event.relatedTarget);
    }

    private hasIgnoreClass(element: any) {
        if (element == this.elementRef.nativeElement) return false;
        if (element.className && element.className.indexOf('ignore-context-menu') > -1) return true;
        if (this.recursiveCounter > 1000) return false;
        this.recursiveCounter++;
        return this.hasIgnoreClass(element.parentNode);
    }
}
