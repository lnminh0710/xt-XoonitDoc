import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { ContextMenuService, AppErrorHandler } from '@app/services';
import { Subscription } from 'rxjs';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { XnCommonActions, CustomAction, ProcessDataActions } from '@app/state-management/store/actions';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'xn-context-menu',
    styleUrls: ['./xn-context-menu.component.scss'],
    templateUrl: './xn-context-menu.component.html'
})
export class XnContextMenuComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() childrenData: any;
    private isChildren = false;
    public showMenuCss: any;
    public menuData: Array<any> = [];
    private isShown = false;
    public locationCss: any;
    private opacity: number;
    private showMenuSubcribe: Subscription;
    private mouseLocation: { left: number, top: number } = { left: 0, top: 0 };
    private dontWantToShowContextSubscription: Subscription;

    @HostListener('document:click.out-zone', ['$event'])
    public onDocumentClick(event) {
        this.clickedOutside();
    }

    constructor(private contextMenuService: ContextMenuService,
        private ref: ChangeDetectorRef,
        private store: Store<AppState>,
        private xnCommonActions: XnCommonActions,
        private dispatcher: ReducerManagerDispatcher,
        private appErrorHandler: AppErrorHandler,
        protected router: Router
    ) {
        super(router);

        this.showMenuSubcribe = this.contextMenuService.show.subscribe(e => this.showMenu(e.event, e.obj));
    }

    private subcribeDontWantToShowContext() {
        this.dontWantToShowContextSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.DONT_WANT_TO_SHOW_CONTEXT_MENU;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.clickedOutside();
            });
        });
    }

    private setLocationCss() {
        this.locationCss = this.isChildren ?
            {
                'display': 'block'
            } :
            {
                'position': 'fixed',
                'display': this.isShown ? 'block' : 'none',
                'left': this.mouseLocation.left + 'px',
                'top': this.mouseLocation.top + 'px',
                'z-index': 9999,
                'opacity': this.opacity ? 1 : 0
            };
        this.opacity = 0;
        this.removeAllGridMenu();
    }

    private removeAllGridMenu() {
        if (this.isShown) {
            var gridMenu = $('.ag-theme-balham .ag-menu');
            if (!gridMenu || !gridMenu.length) return;
            gridMenu.each((index, x) => {
                ($(x)).remove();
            });
        }
    }

    public ngOnInit() {
        this.subcribeDontWantToShowContext();
        if (!this.childrenData || !this.childrenData.length) { return; }
        this.isChildren = true;
        this.menuData = this.childrenData;
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public clickedOutside() {
        this.isShown = false;
        this.setLocationCss();
    }

    private showMenu(event: any, menuData: any) {
        if (this.childrenData && this.childrenData.length) {
            this.isChildren = true;
            return;
        }
        this.mouseLocation = {
            left: event.clientX,
            top: event.clientY
        };
        this.showMenuCss = { 'display': 'block' };
        this.isShown = true;
        this.menuData = menuData.filter(x => !x.hidden);
        this.setLocationCss();
        this.makeMousePostion(event);
    }

    private makeMousePostion(event: any) {
        setTimeout(() => {
            const elContext = $('#xn-menu-context');
            if (!elContext.length) {
                this.makeMousePostion(event);
                return;
            }

            const firstContext = $(elContext[0]);
            const contextWidth = firstContext.outerWidth();
            const contextHeight = firstContext.outerHeight();
            if (!contextWidth || !contextHeight) {
                this.makeMousePostion(event);
                return;
            }
            const documentBody = $(document.body);
            const fullWidth = documentBody.width();
            const fullHeight = documentBody.height();
            if ((fullWidth - event.clientX) < contextWidth) {
                this.mouseLocation.left = (event.clientX - contextWidth);
            }
            if ((fullHeight - event.clientY) < contextHeight) {
                this.mouseLocation.top = (event.clientY - contextHeight);
            }
            this.opacity = 1;
            this.setLocationCss();
            this.ref.detectChanges();
        }, 10);
    }

    public hoverOnLink($event) {
        const link = $($event.currentTarget);
        const childs = link.find('div ul');
        if (!childs || !childs.length) { return; }
        const child = $(childs[0]);

        const documentBody = $(document.body);
        const fullWidth = documentBody.width();
        const fullHeight = documentBody.height();
        const childWidth = child.outerWidth();
        const childHeight = child.outerHeight();
        child.css('opacity', '0');
        if ((childWidth * 2 + link.offset().left) > fullWidth) {
            child.css('left', '-260px');
        }
        if ((childHeight + link.offset().top) > fullHeight) {
            child.css('top', '-' + (childHeight - (fullHeight - link.offset().top)).toString() + 'px');
        }
        child.css('opacity', '1');
    }

    public menuItemClicked(func) {
        if (!func) { return; }
        this.store.dispatch(this.xnCommonActions.contextMenuClicked(true, this.ofModule));
        func();
    }
}
