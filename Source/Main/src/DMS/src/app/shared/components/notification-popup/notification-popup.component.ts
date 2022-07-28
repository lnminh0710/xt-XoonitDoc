import { Component, ChangeDetectorRef, OnInit, OnDestroy, Input } from '@angular/core';
import { CustomAction, NotificationPopupActions, LayoutSettingActions } from '@app/state-management/store/actions';
import { takeUntil, filter as filterOperator, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

import { has } from 'lodash-es';

import { BaseComponent } from '@app/pages/private/base';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { AppState } from '@app/state-management/store';
import { AppErrorHandler } from '@app/services';

var timeoutHideNotification;

@Component({
    selector: 'notification-popup',
    templateUrl: './notification-popup.component.html',
    styleUrls: ['./notification-popup.component.scss'],
})
export class NotificationPopupComponent extends BaseComponent implements OnInit, OnDestroy {
    private enableWidgetTemplateStateSubscription: Subscription;
    private enableWidgetTemplateState: Observable<EnableWidgetTemplateState>;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);
        this.enableWidgetTemplateState = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
    }
    public title = 'Double click to assign document to appropriate folder';

    public width = 500;
    public docPositionLeft = 10;
    public docPositionTop = -1000;
    private _prevPositionTop = -1000;

    ngOnInit(): void {
        this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === NotificationPopupActions.OPEN_TREE_NOTIFICATION;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this._parseWidthHeight(action.payload);
            });

        this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === NotificationPopupActions.CLOSE_TREE_NOTIFICATION;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.closeNotification();
            });
        this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === NotificationPopupActions.UPDATE_NOTIFICATION_POSITION;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (this.docPositionTop > 0) {
                    this._parseWidthHeight(action.payload);
                }
            });
        this.enableWidgetTemplateStateSubscription = this.enableWidgetTemplateState.subscribe(
            (enableWidgetTemplate) => {
                if (!enableWidgetTemplate || enableWidgetTemplate.previousStatus === undefined) return;

                this.appErrorHandler.executeAction(() => {
                    if (enableWidgetTemplate.status) {
                        if (this.docPositionTop > 0) {
                            this._prevPositionTop = this.docPositionTop;
                            this.docPositionTop = -1000;
                        }
                    } else {
                        this.docPositionTop = this._prevPositionTop;
                        this._prevPositionTop = -1000;
                    }
                });
            },
        );
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: any) => {
                if (data.payload) {
                    if (this.docPositionTop > 0) {
                        this._prevPositionTop = this.docPositionTop;
                    }
                    this.docPositionTop = -1000;
                } else {
                    this.docPositionTop = this._prevPositionTop;
                    this._prevPositionTop = -1000;
                }
            });
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public closeNotification() {
        if (timeoutHideNotification) clearTimeout(timeoutHideNotification);
        this.docPositionTop = -1000;
    }

    private _parseWidthHeight(payload: {
        idElement?: string;
        timeOutRemove?: number;
        left?: number;
        top?: number;
        title?: any;
    }) {
        if (timeoutHideNotification) clearTimeout(timeoutHideNotification);
        if (payload.idElement && document.getElementById(payload.idElement)) {
            const boundingClientRect = document.getElementById(payload.idElement).getBoundingClientRect();
            this.docPositionLeft = boundingClientRect.x + 20;
            this.docPositionTop = 54;
            // this.width = screen.width - this.docPositionLeft - 20;
        } else if (has(payload, 'left') && has(payload, 'top')) {
            this.docPositionLeft = payload.left;
            this.docPositionTop = payload.top;
            // this.width = screen.width - this.docPositionLeft - 100;
        }
        if (payload.title) {
            this.title = payload.title;
        }
        this.cdRef.detectChanges();
        if (payload.timeOutRemove === -1) return;
        timeoutHideNotification = setTimeout(() => {
            this.docPositionTop = -1000;
            this.cdRef.detectChanges();
        }, payload.timeOutRemove || 5000);
    }
}
