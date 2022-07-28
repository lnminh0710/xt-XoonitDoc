import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResultResponse, SearchResultItemModel, User } from '@app/models';
import { Note, NoteDocument } from '@app/models/note.model';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { DocumentService, InvoiceAprrovalService } from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
    DocumentThumbnailActions,
} from '@app/state-management/store/actions';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
// import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { DocumentContainerScanStateModel } from '@app/state-management/store/models/administration-document/state/document-container-scan.state.model';
import { DataState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
// import { disableEditAllWidgetsSelector } from '@app/state-management/store/reducer';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Uti } from '@app/utilities';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { Actions, ofType } from '@ngrx/effects';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { WidgetMyDmFormActionNames } from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { Observable, of } from 'rxjs';
import { filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
// import { OpenMyDMFormAction, WidgetMyDmFormActionNames } from '../widget-mydm-form/actions/widget-mydm-form.actions';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';

const DATE_FORMAT_SAVE = 'dd-MM-yyyy';

@Component({
    selector: 'widget-note-form',
    templateUrl: './widget-note-form.component.html',
    styleUrls: ['./widget-note-form.component.scss'],
})
export class WidgetNoteFormComponent
    extends BaseComponent
    implements OnInit, AfterViewInit, OnDestroy, IWidgetIsAbleToSave
{
    notes = this.fb.control([] as Note[]);
    formFocusing: { form: FormControl; id: string } = null;

    currentUser: User = new User();
    idDocument: number = null;
    idInvoiceMainApproval: number = null;
    inited: boolean = false;
    mustHide: boolean = true;
    isShowEmailBox: boolean;
    globalSearchHideState: Observable<boolean>;
    isApprovalModule: boolean = false;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    constructor(
        private fb: FormBuilder,
        private invoiceAprrovalService: InvoiceAprrovalService,
        private store: Store<AppState>,
        private uti: Uti,
        protected router: Router,
        private activatedRoute: ActivatedRoute,
        private datePipe: DatePipe,
        private action$: Actions,
        private administrationDocSelectors: AdministrationDocumentSelectors,
        private administrationActions: AdministrationDocumentActions,
        private elementRef: ElementRef,
        private dispatcher: ReducerManagerDispatcher,
        private appStore: Store<AppState>,
        private documentService: DocumentService,
    ) {
        super(router);
        this._selectedSearchResultState$ = appStore.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
    }
    reset() {
        this.notes.setValue([]);
    }

    ngOnInit() {
        this.activatedRoute.queryParamMap
            .pipe(
                switchMap((param) => {
                    const params = param?.['params'];
                    if (params?.['idInvoiceMainApproval'] !== undefined) {
                        this.idInvoiceMainApproval = param?.['params']?.['idInvoiceMainApproval'];
                    }
                    if (params?.['idDocument'] !== undefined) {
                        this.idDocument = param?.['params']?.['idDocument'];
                        this.mustHide = false;
                        return this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI
                            ? this.documentService.getNotes(this.idDocument)
                            : this.invoiceAprrovalService.getNotes(this.idDocument);
                    }
                    return of([]);
                }),
                tap(() => {
                    if (!this.inited && !this.idDocument) {
                        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
                    }
                    this.inited = true;
                }),
                tap((data: ApiResultResponse) => {
                    let notesData: any[] = [];
                    if (this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI) {
                        notesData = data?.item?.[0].map(
                            (d) => new NoteDocument({ ...d, idInvoiceMainApproval: this.idInvoiceMainApproval }),
                        ) as NoteDocument[];
                    } else {
                        notesData = data?.item?.[0].map(
                            (d) => new Note({ ...d, idInvoiceMainApproval: this.idInvoiceMainApproval }),
                        ) as Note[];
                    }

                    this.notes.patchValue(notesData || []);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe();
        this.currentUser = this.uti.getUserInfo();
        // this.globalSearchHideState = this.store.select(disableEditAllWidgetsSelector);
        this.globalSearchHideState = of(false);
        this.isApprovalModule = this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI;
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {
        if (!this.idDocument) {
            this.action$
                .pipe(
                    ofType(WidgetMyDmFormActionNames.CLEAR_FORM, DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                    tap(() => this.notes.setValue([])),
                    ofType(DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                    tap(() => (this.mustHide = true)),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe();
        }
        this.administrationDocSelectors.documentContainerScan$
            .pipe(
                filter((docContainerOcr: DocumentContainerScanStateModel) => !!docContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                this.mustHide = false;
            });
        this.administrationDocSelectors
            .actionOfType$(AdministrationDocumentActionNames.SCAN_OCR_TEXT)
            .pipe(
                filter((action: CustomAction) => this.formFocusing?.id === action.payload?.OriginalColumnName),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const currentValue = this.formFocusing.form.value;
                if (action.payload.DataState === DataState.DELETE) {
                    this.formFocusing.form.patchValue(currentValue.replace(action.payload.Value, ''));
                } else {
                    this.formFocusing.form.patchValue(`${currentValue}${action.payload.Value}`);
                }
            });
        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) => action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (this.mustHide) {
                    this.mustHide = false;
                    this.idDocument = null;
                } else {
                    this.reset();
                }
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                if (!data.idMainDocument) {
                    if (this.mustHide) {
                        this.mustHide = false;
                        this.idDocument = null;
                    } else {
                        this.reset();
                    }
                }
            });
    }

    getDataSave(): { [key: string]: any } {
        if (!this.notes.value.filter((note: Note) => note.notes.trim()).length) {
            return;
        }
        let data;
        if (
            this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI ||
            this.ofModule.idSettingsGUI === ModuleList.Processing.idSettingsGUI
        ) {
            data = {
                JSONMainDocumentNotes: {
                    MainDocumentNotes: this.notes.value.map((note: Note) => {
                        delete note.idInvoiceApprovalNotes;
                        delete note.idInvoiceMainApproval;
                        return {
                            ...this.transformDataForSave(note),
                            IdMainDocumentNotes: this.idInvoiceMainApproval || null,
                            IdMainDocument: this.idDocument || null,
                        };
                    }),
                },
            };
        } else {
            data = {
                JSONInvoiceApprovalNotes: {
                    InvoiceApprovalNotes: this.notes.value.map((note: Note) => {
                        return {
                            ...this.transformDataForSave(note),
                            IdInvoiceMainApproval: this.idInvoiceMainApproval || null,
                        };
                    }),
                },
            };
        }
        return data;
    }

    validateBeforeSave(): boolean {
        return this.notes.valid;
    }

    validateForm(): FormStatus {
        return <FormStatus>{
            isValid: true,
            formTitle: 'Note',
            errorMessages: [],
        };
    }

    setFocusOCRScan(event: { form: FormControl; id: string }) {
        this.formFocusing = event;

        const formFocus = {
            fieldOnFocus: event.id,
            formOnFocus: new FormGroup({ [event.id]: new FormControl() }),
            documentFormName: '',
            isFieldImageCrop: false,
            fieldConfig: {
                type: MaterialControlType.INPUT,
            },
        };
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(formFocus as any));
    }

    saveForm(event: { form: AbstractControl; callback: Function }) {
        if (this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI) {
            this.documentService
                .saveNotes({
                    ...this.transformDataForSave(event.form.value),
                    IdMainDocument: this.idDocument || null,
                })
                .subscribe((data) => {
                    event.form.patchValue({
                        idMainDocumentNotes: event.form.value.idMainDocumentNotes || data?.returnID,
                    });
                    this.formFocusing = null;
                    event.callback();
                });
        } else {
            this.invoiceAprrovalService
                .saveSupportNotes({
                    ...this.transformDataForSave(event.form.value),
                    IdInvoiceMainApproval: this.idInvoiceMainApproval || null,
                })
                .subscribe((data) => {
                    event.form.patchValue({
                        idInvoiceApprovalNotes: event.form.value.idInvoiceApprovalNotes || data?.returnID,
                    });
                    this.formFocusing = null;
                    event.callback();
                });
        }
    }

    shareForm(event) {
        setTimeout(() => {
            this.isShowEmailBox = true;
            event.callback();
        }, 200);
    }

    downloadForm(event) {
        this.invoiceAprrovalService
            .getPdfFile(this.idDocument)
            .pipe(
                finalize(() => {
                    event.callback();
                }),
            )
            .subscribe((response: any) => {
                const blobUrl = URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `ReportNotes_${this.datePipe.transform(new Date(), DATE_FORMAT_SAVE)}`;
                this.elementRef.nativeElement.appendChild(a);
                a.click();
            });
    }

    printForm(event) {
        this.invoiceAprrovalService
            .getPdfFile(this.idDocument)
            .pipe(
                finalize(() => {
                    event.callback();
                }),
            )
            .subscribe((response: any) => {
                const blobUrl = URL.createObjectURL(response);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = blobUrl;
                this.elementRef.nativeElement.appendChild(iframe);
                iframe.contentWindow.print();
            });
    }

    private transformDataForSave(data: Note): { [key: string]: any } {
        const dataSave = {} as any;
        Object.keys(data).forEach((k: string) => {
            if (k === 'date') {
                dataSave.Date = this.datePipe.transform(data[k], DATE_FORMAT_SAVE);
                return;
            }
            dataSave[k.charAt(0).toUpperCase() + k.slice(1)] = data[k];
        });
        return dataSave;
    }
}
