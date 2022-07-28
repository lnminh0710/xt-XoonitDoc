import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ConfirmHistory, HistoryEnum, StatusApprovalEnum } from '@app/models/invoice-approval/confirm.model';
import { BaseComponent } from '@app/pages/private/base';
import { InvoiceAprrovalService, UserService } from '@app/services';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { get, find } from 'lodash-es';
import * as moment from 'moment';

import { AppState } from '@app/state-management/store';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { ToasterService } from 'angular2-toaster';
import { MenuModuleId, MessageModal } from '@app/app.constants';

import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { SearchResultItemModel } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingActions,
} from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { AppActionNames } from '@app/state-management/store/actions/app/app.actions';
import { NextDocument } from '@app/models/next-document.model';
import { AppSelectors } from '@app/state-management/store/reducer/app';

@Component({
    selector: 'invoice-approval-confirm-history',
    templateUrl: './widget-invoice-approval-confirm-history.component.html',
    styleUrls: ['./widget-invoice-approval-confirm-history.component.scss'],
})
export class InvoiceApprovalConfirmHistoryComponent
    extends BaseComponent
    implements OnInit, OnDestroy, AfterViewInit, IWidgetIsAbleToSave {
    public statusApproval: StatusApprovalEnum = StatusApprovalEnum.Pending;

    @ViewChild('confirmSaveHistory') confirmSaveHistory: TemplateRef<any>;
    @ViewChild('focusNote') focusElement: ElementRef;

    public history: ConfirmHistory[] = [];
    public currentUser: any;
    public HistoryEnum = HistoryEnum;
    public StatusApprovalEnum = StatusApprovalEnum;

    public Note: string;
    private noteChanged: Subject<string> = new Subject<string>();

    public isDisabled: boolean;
    public idMainDocument: string;
    private _idInvoiceMainApproval: any;
    private _idInvoiceApprovalPerson: any;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    public isDisableButton = false;
    private _idInvoiceApproval: any;
    public statusApprovalChange: any;
    public currentUrgentState: boolean;
    public urgentStateApproval: any;
    public invoiceApprovalModule: boolean;
    private _idMainDocument: any;
    private _hasUserSelected: boolean;

    public showErrorHighlight: boolean;

    constructor(
        protected router: Router,
        private userService: UserService,
        private dispatcher: ReducerManagerDispatcher,
        private invoiceApprovalService: InvoiceAprrovalService,
        private activatedRoute: ActivatedRoute,
        private store: Store<AppState>,
        private popupService: PopupService,
        private toasterService: ToasterService,
        private invoiceApprovalProcessingActions: InvoiceApprovalProcessingActions,
        private cdRef: ChangeDetectorRef,
        private appSelectors: AppSelectors,
    ) {
        super(router);
        this._selectedSearchResultState$ = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this._subscribe();
    }
    ngAfterViewInit(): void {
        this._getDataFromUrl();
    }

    ngOnInit(): void {
        this._getCurrentUser();
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public openConfirmDialog(statusApproval: StatusApprovalEnum) {
        this.statusApproval = statusApproval;
        this.cdRef.detectChanges();
        if (this.statusApproval === StatusApprovalEnum.Rejected) {
            setTimeout(() => {
                this.focusElement?.nativeElement.focus();
            });
        }
        if (!this.invoiceApprovalModule) {
            this.showErrorHighlight = false;
            setTimeout(() => {
                this.store.dispatch(this.invoiceApprovalProcessingActions.updateConfirmApproval(this.statusApproval));
            }, 1);
            return;
        }
        this.isDisableButton = this.statusApproval !== StatusApprovalEnum.Approved;
        const popup = this.popupService.open({
            content: this.confirmSaveHistory,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'POPUP_action__Confirm',
                withTranslate: true,
            }),
            disableCloseOutside: true,
        });
        popup.afterClosed$.subscribe(
            ((result) => {
                // this.statusApproval = StatusApprovalEnum.Pending;
                if (result.data) {
                    this.statusApproval = this.statusApprovalChange;
                }
                this.Note = '';
            }).bind(this),
        );
    }

    public updateConfirmHistory(close = () => undefined, needNext?: boolean) {
        this.invoiceApprovalService
            .saveDynamicForm({
                ...this._generateDataForSave(),
                SpObject: 'SaveApprovalUser',
                SpMethodName: 'SpCallInvoiceApprovalLogic',
            })
            .subscribe((response) => {
                close();
                if (get(response, ['item', 'isSuccess'])) {
                    this.reloadDataAfterSave();
                    this.store.dispatch({
                        type: AppActionNames.APP_NEXT_DOCUMENT,
                        payload: {
                            currentId: this.idMainDocument,
                            needNext: needNext,
                        } as NextDocument,
                    });
                } else {
                    this.toasterService.pop(
                        MessageModal.MessageType.error,
                        'System',
                        get(response, ['item', 'sqlStoredMessage']) || 'An error occurs when save data',
                    );
                }
            });
    }

    public getDataSave() {
        if (this.invoiceApprovalModule || this.statusApproval === StatusApprovalEnum.Pending) {
            return {};
        }
        return this._generateDataForSave();
    }

    public reloadDataAfterSave() {
        const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        this.idMainDocument = null;
        if (!idMainDocument) {
            this.reset();
            return;
        }
        this._getHistoryById(idMainDocument);
    }

    public reset() {
        this.statusApproval = StatusApprovalEnum.Pending;
        this.Note = '';
        this.store.dispatch(this.invoiceApprovalProcessingActions.updateConfirmApproval(this.statusApproval));
    }

    public reload() {
        this.reloadDataAfterSave();
    }

    public validateForm(): FormStatus {
        if (
            !this.invoiceApprovalModule &&
            this.statusApproval === StatusApprovalEnum.Pending &&
            !this._hasUserSelected
        ) {
            this.store.dispatch(this.invoiceApprovalProcessingActions.showHighlightError(true));
        }

        return <FormStatus>{
            isValid: this.validateBeforeSave(),
            formTitle: 'Confirm Approval',
            errorMessages: [' Note field is required'],
        };
    }

    public validateBeforeSave() {
        if (this.statusApproval === StatusApprovalEnum.Rejected) {
            return !!this.Note.length;
        }
        return true;
    }

    private _subscribe() {
        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            this._getDataFromUrl();
        });
        this.appSelectors.urgentState$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((urgentState) => {
            this.currentUrgentState = urgentState;
        });
        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) =>
                        action.type === InvoiceApprovalProcessingActionNames.UPDATE_CONFIRM_USER &&
                        !this.invoiceApprovalModule,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (action.payload && this.statusApproval !== StatusApprovalEnum.Pending) {
                    this.reset();
                }
                this.showErrorHighlight = false;
                this._hasUserSelected = action.payload;
            });
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === InvoiceApprovalProcessingActionNames.SHOW_HIGH_LIGHT_ERROR;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.showErrorHighlight = action.payload;

                if (!action.payload) return;
                setTimeout(() => {
                    this.showErrorHighlight = false;
                }, 10000);
            });

        this.noteChanged
            .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((text) => {
                if (this.statusApproval === StatusApprovalEnum.Approved) {
                    this.isDisableButton = false;
                    return;
                }

                this.isDisableButton = !text;
            });
    }

    private _getDataFromUrl() {
        const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        const idInvoiceMainApproval = this.activatedRoute.snapshot.queryParams['idInvoiceMainApproval'];
        this._idInvoiceMainApproval = idInvoiceMainApproval;
        this.invoiceApprovalModule = this.ofModule.idSettingsGUI === MenuModuleId.invoiceApproval;
        if (!idMainDocument) {
            this.reset();
            return;
        }
        this._getHistoryById(idMainDocument);
        this._idMainDocument = idMainDocument;

        this.invoiceApprovalService.getPaymentOverview(idMainDocument).subscribe((res) => {
            const dataColumn = get(res, ['item', 1]) || [];
            const data = find(dataColumn, ['OriginalColumnName', 'IsUrgent']);
            this.urgentStateApproval = data?.Value;
        });
    }

    private _getCurrentUser() {
        this.currentUser = this.userService.getCurrentUser();
    }

    private _getHistoryById(idMainDocument: string) {
        if (this.idMainDocument === idMainDocument) {
            return;
        }
        this.idMainDocument = idMainDocument;
        this.invoiceApprovalService.getInvoiceApprovalHistory(idMainDocument).subscribe((response) => {
            this.statusApproval = StatusApprovalEnum.Pending;
            const history = get(response, ['item', 0]) || [];
            if (this.invoiceApprovalModule) {
                this.history = history;
                this.isDisabled = !find(history, (_h) => _h.IdLogin == this.currentUser.id);
            }

            const data = find(history, (_h) => _h.IdLogin == this.currentUser.id);
            this._idInvoiceApproval = data?.IdInvoiceApproval;
            this._idInvoiceApprovalPerson = data?.IdInvoiceApprovalPerson;
            this.statusApproval = data?.Status;
            this.statusApprovalChange = data?.Status;
        });
    }

    private _registerRouterEvent(disposeWhen: MonoTypeOperatorFunction<any>, callback: () => void) {
        this.router.events.pipe(disposeWhen).subscribe((e) => {
            let currentRoute = this.activatedRoute.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }

            if (e instanceof NavigationEnd) {
                callback();
            }
        });
    }

    private _generateDataForSave() {
        const param: any = {
            JSONConfirmInvoiceApproval: {
                ConfirmInvoiceApproval: [
                    {
                        IdInvoiceApproval: this._idInvoiceApproval || null,
                        IdInvoiceMainApproval: this._idInvoiceMainApproval || null,
                        IdInvoiceApprovalPerson: this._idInvoiceApprovalPerson || null,
                        IsInvoiceReleased: this.statusApproval === StatusApprovalEnum.Approved ? '1' : '0',
                        IsInvoiceRejected: this.statusApproval === StatusApprovalEnum.Rejected ? '1' : '0',
                        ChoiceDate: moment(new Date()).format('YYYY.MM.DD'),
                        Notes: this.statusApproval === StatusApprovalEnum.Rejected ? this.Note : '',
                    },
                ],
            },
        };
        if (this.invoiceApprovalModule) {
            param.IdMainDocument = this._idMainDocument || null;
        }
        return param;
    }

    public changeNoteAction(text: string) {
        this.noteChanged.next(text);
    }

    public cancel(close = () => undefined) {
        close();
        this.statusApproval = this.statusApprovalChange;
    }
}
