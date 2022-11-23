import {
    AfterViewInit,
    Component,
    ElementRef,
    EmbeddedViewRef,
    HostListener,
    Inject,
    Injector,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { DocumentService } from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    FormHasContactHandler,
    IFormHasContactHandler,
} from '@app/xoonit-share/processing-form/handlers/form-has-contact-handler.service';
import { FORM_HANDLER, IFormHandler } from '@app/xoonit-share/processing-form/handlers/mydm-form-handler.interface';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { auditTime, debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { CommonXoonitFormComponent } from '../common-xoonit-form.component';
import { AddonOriginalColumnName, DocumentMyDMType } from '@app/app.constants';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { AppActionNames } from '@app/state-management/store/actions/app/app.actions';
import { combineLatest, Subject } from 'rxjs';
import * as moment from 'moment';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';

@Component({
    selector: 'invoice-addon',
    templateUrl: 'invoice-addon.component.html',
    styleUrls: ['invoice-addon.component.scss'],
    providers: [{ provide: FORM_HANDLER, useClass: FormHasContactHandler }],
})
export class InvoiceAddonComponent
    extends CommonXoonitFormComponent
    implements IMyDMForm<IToolbarForm>, ISaveFormHandler, IWidgetIsAbleToSave, OnInit, AfterViewInit, OnDestroy
{
    public readonly AddonOriginalColumnName = AddonOriginalColumnName;

    private _cacheIds: {
        IdMainDocument: string;
        IdDocumentTree: string;
        IdDocumentTreeMedia: string;
        OldFolder?: DocumentTreeModel;
        NewFolder?: DocumentTreeModel;
    } = {
        IdMainDocument: null,
        IdDocumentTree: null,
        IdDocumentTreeMedia: null,
        OldFolder: null,
        NewFolder: null,
    };

    public viewRef: {
        embeddedViewRef: EmbeddedViewRef<any>;
        templateRef: TemplateRef<any>;
        node: HTMLElement;
    } = {} as any;

    private destroy$: Subject<void> = new Subject<void>();
    private idDocumentType: number;
    private idDocument: number;
    private inited: boolean;

    public isShowNote: boolean;
    public formAddon: FormGroup;
    public note: FormControl = new FormControl('');
    public isTodo: boolean;

    @ViewChild('noteTemplate') templateRef: TemplateRef<any>;
    @ViewChild('iconNote') iconNote: ElementRef<HTMLElement>;
    @ViewChild('noteForm') noteForm: ElementRef<HTMLElement>;

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected store: Store<AppState>,
        private fb: FormBuilder,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private documentService: DocumentService,
        private activatedRoute: ActivatedRoute,
        @Inject(FORM_HANDLER) private formHandler: FormHasContactHandler,
        private dispatcher: ReducerManagerDispatcher,
        private appSelectors: AppSelectors,
        private elementRef: ElementRef,
    ) {
        super(router, injector);
        this.setup();
    }

    ngOnInit() {
        this.activatedRoute.queryParamMap
            .pipe(
                filter((param) => !!param['params']?.['idDocument']),
                switchMap((param) => {
                    const params = param?.['params'];
                    if (params?.['idDocumentType'] !== undefined) {
                        this.idDocumentType = param?.['params']?.['idDocumentType'];
                    }
                    if (params?.['idDocument'] !== undefined) {
                        this.idDocument = param?.['params']?.['idDocument'];
                        let methodName: string;
                        switch (+this.idDocumentType) {
                            case DocumentMyDMType.Invoice:
                                methodName = 'getCapturedInvoiceDocumentDetail';
                                break;
                            case DocumentMyDMType.Contract:
                                methodName = 'getCapturedContractDocumentDetail';
                                break;
                            case DocumentMyDMType.OtherDocuments:
                                methodName = 'getCapturedOtherDocumentDetail';
                                break;
                        }
                        this.reset();
                        return this.documentService[methodName]?.(this.idDocument, { addOnFields: 'AddOnFields' });
                    }
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res: any) => {
                const payload = res;
                const columnSettings = payload as ColumnDefinition[];
                if (!columnSettings || !columnSettings.length) return;

                this.columnSettings.push(...columnSettings);
                const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);

                this.controls.push(...controlConfigs);
                this.formAddon = this.fb.group(formGroup);
                super.publishEventFormIntialized(!!this.formAddon);
            });
    }

    ngAfterViewInit() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                auditTime(100),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                // this.destroyNoteForm();
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.destroy$.next();
    }

    public save(): void {}

    validateBeforeSave() {
        return this.formGroup.valid;
    }

    validateForm() {
        return <FormStatus>{
            isValid: this.formGroup.valid,
            formTitle: 'Widget Addon',
            errorMessages: ['Please check again, something errors'],
        };
    }

    getDataSave() {
        const data = this.formGroup.value;
        const dataSave = {} as any;

        Object.keys(data).forEach((k: string) => {
            dataSave[
                k === AddonOriginalColumnName.IS_TODO
                    ? 'isTodo'
                    : k === AddonOriginalColumnName.B07MAINDOCUMENT_TODO_NOTES
                    ? 'toDoNotes'
                    : k.charAt(0).toLowerCase() + k.slice(1)
            ] = data[k] === true ? '1' : data[k] === false ? '0' : data[k];
        });
        return {
            mainDocument: {
                ...dataSave,
            },
        };
    }

    public applyQRCode() {}

    protected registerSubscriptions() {
        this.onFormInitialized$
            .pipe(
                filter((val) => val),
                takeUntil(this.onDetachForm$),
            )
            .subscribe((_) => {
                this.formHandler.orderByControls(this.controls);
                this.formGroup = this.fb.group({
                    ...(this.formAddon?.controls || []),
                });
                this.listenChanges();

                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_DETAIL_INTO_FOLDER)
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as DocumentTreeModel;
                if (payload.idDocument === this.folder.idDocument) {
                    this._cacheIds.NewFolder = null;
                    this._cacheIds.OldFolder = null;
                } else {
                    this._cacheIds.NewFolder = cloneDeep(action.payload);
                    this._cacheIds.OldFolder = cloneDeep(this.folder);
                }
            });
    }

    protected configFormHandlerDependency(): IFormHandler {
        return this.formHandler;
    }

    public getColumnSettings(idDocumentType?: number): void {
        let methodName: string;
        switch (idDocumentType) {
            case DocumentMyDMType.Invoice:
                methodName = 'getDocumentInvoice';
                break;
            case DocumentMyDMType.Contract:
                methodName = 'getColumnSettingsOfContract';
                break;
            case DocumentMyDMType.OtherDocuments:
                methodName = 'getColumnSettingsOfOtherDocuments';
                break;
        }

        this.documentService[methodName]?.({ addOnFields: 'AddOnFields' }).subscribe((res) => {
            const payload = res.item;
            const columnSettings = payload as ColumnDefinition[];
            if (!columnSettings || !columnSettings.length) return;

            this.columnSettings.push(...columnSettings);
            const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);

            this.controls.push(...controlConfigs);
            this.formAddon = this.fb.group(formGroup);
            super.publishEventFormIntialized(!!this.formAddon);
        });
    }

    protected configFormHasContactHandlerDependency(): IFormHasContactHandler {
        return this.formHandler;
    }

    public shouldAddColumnToForm(columnSetting: ColumnDefinition): boolean {
        if (super.isColumnHeader(columnSetting)) {
            return false;
        }
        return true;
    }

    public registerGetDetailFn(fn: () => ColumnDefinition[]) {
        this.formHandler.orderByControls(this.controls);
        this.formGroup = this.fb.group({
            ...(this.formAddon?.controls || []),
        });
        this.listenChanges();
    }

    public reset() {
        this.formAddon = null;
        this.note.setValue('');

        Object.keys(this._cacheIds).forEach((key) => {
            this._cacheIds[key] = null;
        });

        super.reset();
    }

    toggleNote(event?: MouseEvent) {
        if (this.isTodo) {
            this.isShowNote = true;
            this.inited && setTimeout(() => this.noteForm.nativeElement.querySelector('input')?.focus());
        }
        event?.stopPropagation();
    }

    private destroyNoteForm() {
        this.isShowNote = false;
    }

    // @HostListener('document:click', ['$event.target'])
    // clickOutsideNote(target) {
    //     try {
    //         if (!this.noteForm.nativeElement.contains(target)) {
    //             this.isShowNote = false;
    //         }
    //     } catch {
    //     }
    // }

    private listenChanges() {
        this.destroy$.next();
        this.inited = false;
        const isGuaranteeCtrl = this.formGroup.controls[AddonOriginalColumnName.IS_GUARANTEE] as FormControl;
        const isTodoCtrl = this.formGroup.controls[AddonOriginalColumnName.IS_TODO] as FormControl;
        const todoNoteCtrl = (this.formGroup.controls[AddonOriginalColumnName.TODO_NOTES] ||
            this.formGroup.controls[AddonOriginalColumnName.B07MAINDOCUMENT_TODO_NOTES]) as FormControl;
        const guaranteeExpiryDateCtrl = this.formGroup.controls[
            AddonOriginalColumnName.GUARANTEEE_EXPIRY_DATE
        ] as FormControl;
        const guaranteeExpiryDateConfig = this.controls.find(
            (ctrl) => ctrl.formControlName === AddonOriginalColumnName.GUARANTEEE_EXPIRY_DATE,
        );
        const guaranteeExpiryDateValidators = this.dynamicMaterialHelper.getValidators(guaranteeExpiryDateConfig);

        this.appSelectors.isGuarantee$.pipe(takeUntil(this.destroy$)).subscribe((isGuarentee: boolean) => {
            if (!guaranteeExpiryDateCtrl) return;
            if (isGuarentee) {
                guaranteeExpiryDateCtrl.setValidators([Validators.required, ...guaranteeExpiryDateValidators]);
                this._setCtrlShow(guaranteeExpiryDateConfig);
                this._setCtrlReadonly(guaranteeExpiryDateCtrl, false);
                this.cdRef.detectChanges();
                this.cdRef.markForCheck();
                this.inited &&
                    setTimeout(() =>
                        (
                            (this.elementRef.nativeElement as HTMLElement).querySelector(
                                `[control-key=${AddonOriginalColumnName.GUARANTEEE_EXPIRY_DATE}] input`,
                            ) as HTMLInputElement
                        )?.focus(),
                    );
            } else {
                this._resetDefaultValidators(guaranteeExpiryDateCtrl, guaranteeExpiryDateConfig);
                this._setCtrlHidden(guaranteeExpiryDateConfig);
                this.cdRef.detectChanges();
                this.cdRef.markForCheck();
            }
        });

        isGuaranteeCtrl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
            this.store.dispatch({
                type: AppActionNames.TOGGLE_IS_GUARANTEE,
                payload: {
                    isGuarantee: value,
                },
            });
        });

        isTodoCtrl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
            this.isTodo = value;
            if (this.isTodo) {
                this.toggleNote();
                this.inited && setTimeout(() => this.noteForm.nativeElement.querySelector('input')?.focus());
            } else {
                this.isShowNote = false;
                this.note.setValue('');
            }
            this.store.dispatch(this.administrationActions.setDocumentIsTodo(value));
        });

        guaranteeExpiryDateCtrl?.valueChanges
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((value: Date) => {});

        this.note.valueChanges.pipe(debounceTime(200), takeUntil(this.destroy$)).subscribe((value: string) => {
            todoNoteCtrl?.patchValue(value);
            this.store.dispatch(this.administrationActions.setDocumentTodo(value));
        });

        this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((allAddons) => {
            this.store.dispatch(this.administrationActions.setAllAddons({ ...this.formGroup?.controls }));
        });

        this.store.dispatch({
            type: AppActionNames.TOGGLE_IS_GUARANTEE,
            payload: {
                isGuarantee: isGuaranteeCtrl?.value,
            },
        });
        this.isTodo = isTodoCtrl?.value;
        this.store.dispatch(this.administrationActions.setDocumentIsTodo(this.isTodo));
        this.note.patchValue(todoNoteCtrl?.value);
        if (this.isTodo) this.toggleNote();
        setTimeout(() => (this.inited = true));
    }
}
