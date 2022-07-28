import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ChangeDetectorRef
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { BaseComponent } from '@app/pages/private/base';
import { AppState } from '@app/state-management/store';
import { CustomAction, XnCommonActions } from '@app/state-management/store/actions';
import { filter, takeUntil } from 'rxjs/operators';
@Component({
    selector: 'xn-feedback-icon',
    styleUrls: ['./xn-feedback-icon.component.scss'],
    templateUrl: './xn-feedback-icon.component.html',
    host: {
        '(window:resize)': 'onWindowResize($event)'
    }
})
export class XnFeedbackIconComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    static isResizeCounter: number = 0;
    public isFeedbackLoading = false;

    constructor(
        protected router : Router,
        private changeDetectorRef: ChangeDetectorRef,
        private store: Store <AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private xnCommonActions: XnCommonActions,
    ) {
        super(router);
    }

    ngOnInit() {
        this.subscribeShowFeedbackCompleteState();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.onWindowResize();
        }, 15000);
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public feedbackClicked() {
        this.isFeedbackLoading = true;
        this.changeDetectorRef.detectChanges();
        this.store.dispatch(this.xnCommonActions.showFeedbackClicked(true));
        this.store.dispatch(this.xnCommonActions.storeFeedbacData({
            isSendToAdmin: false,
            tabID: null
        }));
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private subscribeShowFeedbackCompleteState() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.SHOW_FEEDBACK_COMPLETE;
                }),
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(() => {
                this.isFeedbackLoading = false;
                this.changeDetectorRef.markForCheck();
            });
    }
    private onWindowResize(event?: any, underIcon?: any) {
        XnFeedbackIconComponent.isResizeCounter ++;
        if (XnFeedbackIconComponent.isResizeCounter === 1) return;
        setTimeout(() => {
            const underIcon = $('#xn-feedback-under-icon');
            underIcon.addClass('xn-feedback-hidden');
            if (!underIcon || !underIcon.length) return;
            const position = underIcon.offset();
            let topIcon = $('#xn-feedback-top-icon');
            if (!topIcon || !topIcon.length) return;

            topIcon.css('opacity', 1);
            topIcon.css('top', position.top);
            topIcon.css('left', position.left);
        }, 200);
    }
}
