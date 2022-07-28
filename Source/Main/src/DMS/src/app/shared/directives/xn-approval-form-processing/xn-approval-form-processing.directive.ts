import { Input, Directive, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
    IWidgetIsAbleToSave,
    FormStatus,
} from '../../../state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import {
    AppInjectWigetInstanceIsAbleToSaveAction,
    SaveGlobalAction,
} from '../../../state-management/store/actions/app-global/app-global.actions';
import { ReplaySubject, Observable } from 'rxjs';
import { ToasterService } from 'angular2-toaster';
import { DocumentTypeEnum, MessageModal } from '../../../app.constants';
import { InvoiceAprrovalService } from '../../../services';
import { Uti } from '../../../utilities/uti';
import { AppState } from '../../../state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
} from '../../../state-management/store/actions';
import { XnFocusErrorDirective } from '../xn-focus-error/xn-focus-error.directive';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { PopupCloseEvent } from '@app/xoonit-share/components/global-popup/popup-ref';
import { WidgetConfirmIsTodoComponent } from '@app/xoonit-share/components/widget-confirm-isTodo/widget-confirm-isTodo.component';

@Directive({
    selector: '[aprrovalFormProcessing]',
})
export class XnApprovalFormProcessingDirective implements OnInit, OnDestroy {
    private _unsubscribedNotifer$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    private _widgetInstancesToSave: IWidgetIsAbleToSave[] = [];

    private _isTodo: boolean;
    private _docType: DocumentTypeEnum;

    @Input() idMainDocument: number;
    @Input() idDocumentContainerScans: number;
    @Input() idDocumentTree: number;
    @Input() mediaName: number;
    @Input() xnFocusError: XnFocusErrorDirective;

    constructor(
        private dispatcher: ReducerManagerDispatcher,
        private toasterService: ToasterService,
        private invoiceAprrovalService: InvoiceAprrovalService,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private store: Store<AppState>,
        public popupService: PopupService,
    ) {}

    public ngOnInit() {
        this.subsscribe();
    }

    private subsscribe() {
        this.dispatcher
            .pipe(
                filter(
                    (action: AppInjectWigetInstanceIsAbleToSaveAction) =>
                        action instanceof AppInjectWigetInstanceIsAbleToSaveAction,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: AppInjectWigetInstanceIsAbleToSaveAction) => {
                if (!action.payload) return;

                this._widgetInstancesToSave.push(action.payload);
            });

        this.dispatcher
            .pipe(
                filter((action: SaveGlobalAction) => action instanceof SaveGlobalAction),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                if (!this._widgetInstancesToSave || !this._widgetInstancesToSave.length) return;
                this.toasterService.clear();

                // currently disable TODO flow, waiting confirm from MrTuan
                // if (this._isTodo) {
                //     // const currentWidth = window.screen.width;
                //     // (currentWidth * 27) / 100 // calculate width by screen
                //     const widthPopup = 440;
                //     const popupRef = this.popupService.open({
                //         content: WidgetConfirmIsTodoComponent,
                //         hasBackdrop: true,
                //         header: {
                //             title: 'Confirm',
                //             iconClose: true,
                //         },
                //         disableCloseOutside: true,
                //         width: widthPopup,
                //         data: '',
                //     });
                //     popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
                //         if (type === 'close' && data?.isSuccess) {
                //             this._docType = data?.docType;
                //             this.saveInvoiceApproval();
                //         } else {
                //             this.store.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
                //         }
                //     });
                //     return;
                // }

                this.saveInvoiceApproval();
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_IS_TODO_INVOICE_APPROVAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                this._isTodo = action?.payload;
            });
    }

    private saveInvoiceApproval() {
        let formStatus: FormStatus = {
            isValid: true,
            formTitle: '',
        };

        const data = this.getMainDocumentData();
        let waitTimeToSave = 0;

        //const allValid = this._widgetInstancesToSave.reduce((formStatus, widgetInstance) => {
        //    if (!formStatus.isValid) {
        //        return formStatus;
        //    }

        //    return widgetInstance.validateForm();
        //}, formStatus);

        if (this._docType === DocumentTypeEnum.INVOICE_APPROVAL_PROCESSING) {
            data.IsKeepApprovalProcessing = '1';
            for (let i = 0; i < this._widgetInstancesToSave.length; i++) {
                const widgetInstance = this._widgetInstancesToSave[i];
                if (widgetInstance.validateForm) {
                    formStatus = widgetInstance.validateForm();
                }
                if (!formStatus.isValid) continue;

                this.calculateTimeToWaitMergeDataSave(widgetInstance, data, waitTimeToSave);
            }
        } else {
            for (let i = 0; i < this._widgetInstancesToSave.length; i++) {
                if (this._widgetInstancesToSave[i].validateForm) {
                    formStatus = this._widgetInstancesToSave[i].validateForm();
                }
                if (!formStatus.isValid) {
                    break;
                }
            }

            if (!formStatus?.isValid) {
                const errMessage = formStatus.errorMessages?.join();
                this.toasterService.pop(
                    MessageModal.MessageType.warning,
                    'System',
                    formStatus.formTitle + ':' + errMessage,
                );
                this.xnFocusError?.setFocusError();
                this.store.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
                return;
            }

            this._widgetInstancesToSave.forEach((widgetInstance) => {
                this.calculateTimeToWaitMergeDataSave(widgetInstance, data, waitTimeToSave);
            });
        }

        setTimeout(() => {
            this.invoiceAprrovalService.saveProcessingForm(data).subscribe(
                (response: any) => {
                    // Error
                    if (!response || isNaN(+response.returnID) || +response.returnID < 0) {
                        this.saveDocumentProcessingError();
                    }
                    // Success
                    else {
                        this.saveDocumentProcessingSuccessfully(response);
                    }
                },
                (error) => {
                    this.saveDocumentProcessingError(error);
                },
            );
        }, waitTimeToSave + 100);
    }

    private calculateTimeToWaitMergeDataSave(widgetInstance: any, data: any, waitTimeToSave: number) {
        if (widgetInstance['stopEditing']) {
            widgetInstance['stopEditing']();
            waitTimeToSave += 200;
            setTimeout(() => {
                this.mergeDataSave(data, widgetInstance);
            }, 200);
        } else {
            this.mergeDataSave(data, widgetInstance);
        }
    }

    private getMainDocumentData() {
        return {
            IsKeepApprovalProcessing: '0',
            JSONMainDocument: {
                MainDocument: [
                    {
                        IdMainDocument: this.idMainDocument ? '' + this.idMainDocument : null,
                        IdDocumentContainerScans: this.idDocumentContainerScans
                            ? '' + this.idDocumentContainerScans
                            : null,
                        IdDocumentTree: this.idDocumentTree ? '' + this.idDocumentTree : null,
                        // SearchKeyWords: '',
                        // IsToDo: '',
                        // ToDoNotes: '',
                        Notes: '',
                        IsActive: '1',
                        IsDeleted: '0',
                        MediaName: this.mediaName,
                    },
                ],
            },
        };
    }

    public ngOnDestroy() {
        this.unsubscribeFromNotifier();
    }

    private mergeDataSave(data: { [key: string]: any }, widgetInstance: IWidgetIsAbleToSave) {
        const widgetDataSave = widgetInstance.getDataSave();
        for (const saveNewName in widgetDataSave) {
            if (!widgetDataSave.hasOwnProperty(saveNewName)) {
                continue;
            }

            if (Array.isArray(widgetDataSave[saveNewName])) {
                data[saveNewName] = data[saveNewName] || [];
                data[saveNewName] = [...data[saveNewName], ...widgetDataSave[saveNewName]];
                continue;
            }

            if (widgetDataSave[saveNewName]?.constructor === Object) {
                // if data key has existed then merge two into one
                if (data[saveNewName]) {
                    data[saveNewName] = Uti.mergeTwoObject(data[saveNewName], widgetDataSave[saveNewName]);
                } else {
                    // if key has not existed then set as normal
                    data[saveNewName] = widgetDataSave[saveNewName];
                }
                continue;
            }

            // if value is primitive type then then last value win (override value)
            data[saveNewName] = widgetDataSave[saveNewName];
        }
    }

    private saveDocumentProcessingSuccessfully(response: any) {
        this.store.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
        this.toasterService.pop(MessageModal.MessageType.success, 'System', `Save document successfully`);
        this.store.dispatch(this.administrationDocumentActions.nextDocumentToClassify(true));
        this.resetForm();
    }

    private saveDocumentProcessingError(error?: any) {
        this.store.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
        this.toasterService.pop(MessageModal.MessageType.error, 'System', `An error occurs when saving document`);
        // this.resetForm();
    }

    private resetForm() {
        this.resetIsTodo();
        if (!!this.idMainDocument) {
            this._widgetInstancesToSave.forEach((widgetInstance) => {
                if (widgetInstance.reload) widgetInstance.reload();
            });
            return;
        }
        this._widgetInstancesToSave.forEach((widgetInstance) => {
            widgetInstance.reset();
        });
    }

    private resetIsTodo() {
        this._isTodo = false;
        this._docType = null;
    }

    protected getUnsubscriberNotifier(): Observable<any> {
        return this._unsubscribedNotifer$.asObservable();
    }

    protected unsubscribeFromNotifier() {
        this._unsubscribedNotifer$.next(true);
        this._unsubscribedNotifer$.complete();
    }
}
