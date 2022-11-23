import { AfterViewInit, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AddonOriginalColumnName, DocumentMyDMType, MessageModal } from '@app/app.constants';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
} from '@app/state-management/store/actions';
import {
    AppInjectWigetInstanceIsAbleToSaveAction,
    SaveGlobalAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Uti } from '@app/utilities';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { OpenMyDMFormAction } from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { ToasterService } from 'angular2-toaster';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { XnFocusErrorDirective } from '../xn-focus-error/xn-focus-error.directive';

@Directive({
    selector: '[processingDocument]',
})
export class XnProcessingDocumentDirective implements OnInit, AfterViewInit, OnDestroy {
    private readonly destroy$: Subject<void> = new Subject<void>();
    private _widgetInstancesToSave: IWidgetIsAbleToSave[] = [];
    private folder: DocumentTreeModel;
    private documentContainerOcr: DocumentContainerOcrStateModel;
    private idDocument: number;

    @Input() xnFocusError: XnFocusErrorDirective;

    constructor(
        private store: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationActions: AdministrationDocumentActions,
        private toasterService: ToasterService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.activatedRoute.queryParamMap
            .pipe(
                tap((param) => {
                    const params = param?.['params'];
                    this.idDocument = params?.['idDocument'];
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    ngAfterViewInit() {
        this.dispatcher
            .pipe(
                filter((action: OpenMyDMFormAction) => this._filterOpenMyDmFormAction(action)),
                takeUntil(this.destroy$),
            )
            .subscribe((action: OpenMyDMFormAction) => {
                this.documentContainerOcr = action.payload.documentContainerOcr;
            });
        this.administrationDocumentSelectors.folder$
            .pipe(takeUntil(this.destroy$))
            .subscribe((folder: DocumentTreeModel) => {
                this.folder = folder;
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: AppInjectWigetInstanceIsAbleToSaveAction) =>
                        action instanceof AppInjectWigetInstanceIsAbleToSaveAction,
                ),
                takeUntil(this.destroy$),
            )
            .subscribe((action: AppInjectWigetInstanceIsAbleToSaveAction) => {
                if (!action.payload) return;

                this._widgetInstancesToSave.push(action.payload);
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_DETAIL_INTO_FOLDER)
            .pipe(takeUntil(this.destroy$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as DocumentTreeModel;
                if (payload.idDocument === this.folder.idDocument) {
                    // this._cacheIds.NewFolder = null;
                    // this._cacheIds.OldFolder = null;
                } else {
                    // this._cacheIds.NewFolder = cloneDeep(action.payload);
                    // this._cacheIds.OldFolder = cloneDeep(this.folder);
                }
            });

        this.dispatcher
            .pipe(
                filter((action: SaveGlobalAction) => action instanceof SaveGlobalAction),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                if (!this._widgetInstancesToSave || !this._widgetInstancesToSave.length) return;
                this.toasterService.clear();

                let formStatus: FormStatus = {
                    isValid: true,
                    formTitle: '',
                };

                for (let i = 0, length = this._widgetInstancesToSave.length; i < length; i++) {
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
                        formStatus.formTitle + ': ' + errMessage,
                    );
                    this.xnFocusError?.setFocusError();
                    this.store.dispatch(this.administrationActions.saveDocumentFormFailAction());
                    return;
                }

                let methodName: string;
                switch (this.folder.idDocumentType) {
                    case DocumentMyDMType.Invoice:
                        methodName = 'saveDocumentInvoiceForms';
                        break;
                    case DocumentMyDMType.Contract:
                        methodName = 'saveDocumentContractForms';
                        break;
                    case DocumentMyDMType.OtherDocuments:
                        methodName = 'saveOtherDocumentForms';
                        break;
                }
                const data = this.getMainDocumentData();
                let waitTimeToSave = 0;
                this._widgetInstancesToSave.forEach((widgetInstance) => {
                    if (widgetInstance['stopEditing']) {
                        widgetInstance['stopEditing']();
                        waitTimeToSave += 200;
                        setTimeout(() => {
                            this.mergeDataSave(data, widgetInstance);
                        }, 200);
                    } else {
                        this.mergeDataSave(data, widgetInstance);
                    }
                });

                data.mainDocument['isTodo'] =
                    data.mainDocument['isTodo'] !== undefined ? data.mainDocument['isTodo'] : '';
                data.mainDocument['toDoNotes'] =
                    data.mainDocument['toDoNotes'] !== undefined ? data.mainDocument['toDoNotes'] : '';
                this.store.dispatch(this.administrationActions[methodName](data));
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    private mergeDataSave(data: { [key: string]: any }, widgetInstance: IWidgetIsAbleToSave) {
        const widgetDataSave = widgetInstance.getDataSave();
        for (let saveNewName in widgetDataSave) {
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

    private getMainDocumentData() {
        const searchKey = (this._widgetInstancesToSave[0] as any)?._documentMetadata?.keyword;
        return {
            mainDocument: {
                idMainDocument: this.idDocument,
                idDocumentContainerScans: this.documentContainerOcr.IdDocumentContainerScans,
                mainDocumentTree: {
                    idDocumentTree: this.folder.idDocument,
                    oldFolder: null,
                    newFolder: null,
                },
                toDoNotes: (this._widgetInstancesToSave[0] as any)?._documentMetadata?.toDos,
                isTodo: (this._widgetInstancesToSave[0] as any)?._documentMetadata?.isTodo,
                searchKeyWords: searchKey,
            },
            documentTreeMedia: {
                idDocumentTreeMedia: null,
                idDocumentTree: this.folder.idDocument,
                idRepTreeMediaType: this.folder.idDocumentType,
                mediaName: this.documentContainerOcr.OriginalFileName,
                cloudMediaPath: this.folder.path,
            },
            folderChange: null,
        };
    }

    private _filterOpenMyDmFormAction(action: OpenMyDMFormAction): boolean {
        if (!(action instanceof OpenMyDMFormAction)) return false;

        const payload = action.payload;
        if (!payload.folder || !payload.folder.idDocumentType) {
            return false;
        }

        if (!payload.documentContainerOcr) return false;

        return true;
    }
}
