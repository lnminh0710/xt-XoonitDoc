import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import {
    DocumentsState,
    FormState,
} from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
} from '@app/state-management/store/actions';
import { ToasterService } from 'angular2-toaster';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { MessageModal, DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { SaveDocumentInvoiceModel } from '@app/state-management/store/models/administration-document/document-invoice.model.payload';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { PersonFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { PersonBankFormModel } from '@app/models/administration-document/document-form/person-bank-form.model';
import { ContactFormModel } from '@app/models/administration-document/document-form/contact-form.model';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';
import { FolderCapturedDocumentModel } from '@app/models/administration-document/document-form/folder-captured-document.model';
import { cloneDeep } from 'lodash-es';
import { ConditionEnableSaveCapturedButton } from '@app/models/administration-document/document-form/condition-enable-save-captured-button.model';
import { filter, takeUntil } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';
import { MatButton } from '@xn-control/light-material-ui/button';

@Component({
    selector: 'widget-dms-actions_original',
    styleUrls: ['./widget-dms-actions.component_original.scss'],
    templateUrl: './widget-dms-actions.component_original.html',
})
export class WidgetDmsActionsOriginal extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    private _documentContainerOcr: DocumentContainerOcrStateModel;
    private _idsStoreForUpdate: {
        IdMainDocument: string;
        IdDocumentTree: string;
        IdDocumentTreeMedia: string;
        OldFolder?: DocumentTreeModel;
        NewFolder?: DocumentTreeModel;
    };
    public isUpdateMode: boolean;
    public isSaving: boolean;

    public svgSkip = IconNames.WIDGET_DMS_ACTIONS_Skip;
    public svgSave = IconNames.WIDGET_DMS_ACTIONS_Save;
    public svgDelete = IconNames.WIDGET_DMS_ACTIONS_Delete;
    public svgToggleCapturedForm = IconNames.WIDGET_DMS_ACTIONS_Toggle_Captured_Form;

    private _invoiceForm: FormState;
    private _contractForm: FormState;
    private _contactForm: FormState;
    private _bankForm: FormState;
    private _notesForm: FormState;

    private _folder: DocumentTreeModel;
    private _documentTodos: string;
    private _documentIsTodo: boolean;
    private _documentKeyword: string;
    private _originalFileName: string;
    private _conditionEnableSaveButton: ConditionEnableSaveCapturedButton = new ConditionEnableSaveCapturedButton();
    private _didManipulateCaptureFile: boolean;
    private _toggleExpanded: boolean;

    @ViewChild('btnNext', { static: true }) btnNextRef: MatButton;
    @ViewChild('btnSave', { static: true }) btnSaveRef: MatButton;
    @ViewChild('btnDelete', { static: true }) btnDeleteRef: MatButton;
    @ViewChild('btnToggleCapturedForm', { static: true }) btnToggleCapturedForm: MatButton;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private toastService: ToasterService,
    ) {
        super(router);
        this.clearIdsStore();
    }

    ngOnInit(): void {
        this.registerSubscriptions();
    }

    ngAfterViewInit(): void {
        this.disableAllButtons(true);
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private registerSubscriptions() {
        this.administrationDocumentSelectors.documentContainerOcr$
            .pipe(
                filter(documentContainerOcr => !!documentContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(documentContainerOcr => {
                this._documentContainerOcr = documentContainerOcr;
                this.disableButtonNext(false);
                this.disableButtonDelete(false);
            });

        this.administrationDocumentSelectors.originalFileName$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(originalFileName => {
                this._originalFileName = originalFileName;
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_MODE_SELECTABLE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(action => {
                // set null when there is no selected folder
                this._folder = null;
                this.disableButtonSave(true);
                this.disableToggleCapturedForm(true);
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.ENABLE_BUTTON_SAVE_WIDGET_DMS_ACTION)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { isEnabled: boolean };
                this.disableButtonSave(!payload.isEnabled);
                this.cdRef.detectChanges();
            });

        this.administrationDocumentSelectors.folder$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(folderState => {
                // on the first setHightLightAndSaveDocumentIntoFolder is dispatch, we didn't set NewFolder and Older yet
                // if change folder again this._folder will be not null
                if (this.isUpdateMode && this._folder) {
                    // we clone the current _documentTreeModel to OldFolder before set a new one
                    this._idsStoreForUpdate.OldFolder = cloneDeep(this._folder);
                    this._idsStoreForUpdate.NewFolder = folderState;
                }

                this.disableToggleCapturedForm(folderState ? false : true);

                if (this._folder && folderState && this._folder.idDocumentType === folderState.idDocumentType) {
                    this.disableButtonSave(false);
                } else if (this._documentContainerOcr) {
                    this.initConditionToEnableSaveButton(this._documentContainerOcr.DocumentType);
                }
                this._folder = folderState;
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.ENABLE_BUTTON_TOGGLED_CAPTURED_FORM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { isEnabled: boolean };
                this.disableToggleCapturedForm(!payload.isEnabled);

                // just update for synchronous data
                this._toggleExpanded = payload.isEnabled;
            });

        this.administrationDocumentSelectors.documentsState$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((documentsState: DocumentsState) => {
                if (!documentsState) {
                    this.resetConditionToEnableSaveButton();
                    this.disableButtonSave(true);
                    return;
                }

                let formName: string;
                if (documentsState.documentOnUpdate.isOnInit) {
                    for (const key in documentsState.documentsForm) {
                        if (documentsState.documentsForm.hasOwnProperty(key)) {
                            const documentFormKey = documentsState.documentsForm[key];
                            for (formName in documentFormKey.formsState) {
                                if (
                                    documentFormKey.formsState.hasOwnProperty(formName) &&
                                    documentFormKey.formsState[formName].onInit
                                ) {
                                    this.setFormState(formName, documentFormKey.formsState);
                                    documentFormKey.formsState[formName].onInit = false;
                                    const isEnabled = this._conditionEnableSaveButton.canEnable(
                                        formName as DocumentFormNameEnum,
                                    );
                                    this.disableButtonSave(!isEnabled);
                                }
                            }
                        }
                    }
                    return;
                }

                const documentType = documentsState.documentOnUpdate.documentType;
                formName = documentsState.documentOnUpdate.formName;

                const documentForm = Uti.getDocumentFormByDocumentProcessingType(documentsState, documentType);
                if (!documentForm) {
                    return;
                }

                this.setFormState(documentsState.documentOnUpdate.formName, documentForm.formsState);
                if (!this._didManipulateCaptureFile) {
                    this.store.dispatch(this.administrationDocumentActions.didManipulateCapturedFile(true));
                }
            });

        this.administrationDocumentSelectors.toDo$
            .pipe(
                filter(data => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((toDo: string) => {
                if (this._documentTodos === toDo) return;

                this._documentTodos = toDo;
            });

        this.administrationDocumentSelectors.isToDo$
            .pipe(
                filter(data => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((isTodo: boolean) => {
                if (this._documentIsTodo === isTodo) return;

                this._documentIsTodo = isTodo;
            });

        this.administrationDocumentSelectors.keyword$
            .pipe(
                filter(data => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((keyword: string) => {
                if (this._documentKeyword === keyword) return;

                this._documentKeyword = keyword;
            });

        this.administrationDocumentSelectors.capturedFormMode$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((mode: CapturedFormModeEnum) => {
                switch (mode) {
                    case CapturedFormModeEnum.Updated:
                        this.isUpdateMode = true;
                        break;

                    case CapturedFormModeEnum.Created:
                    default:
                        this.isUpdateMode = false;
                        break;
                }
            });

        // this.administrationDocumentSelectors.extractedDataFromOcr$
        //     .filter((extractedDataState) => extractedDataState && !!extractedDataState.length)
        //     .takeUntil(this.getUnsubscriberNotifier())
        //     .subscribe((extractedDataState: ExtractedDataOcrState[]) => {
        //         if (!this.isUpdateMode) return;

        //         extractedDataState.forEach((data) => {
        //             if (this._idsStoreForUpdate.hasOwnProperty(data.OriginalColumnName)) {
        //                 this._idsStoreForUpdate[data.OriginalColumnName] = data.Value;
        //             }
        //         });
        //     });

        this.administrationDocumentSelectors.detailedDocumentDataState$
            .pipe(
                filter(detailedDocumentDataState => detailedDocumentDataState && detailedDocumentDataState.length > 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(detailedDocumentDataState => {
                detailedDocumentDataState.forEach(data => {
                    if (this._idsStoreForUpdate.hasOwnProperty(data.OriginalColumnName)) {
                        this._idsStoreForUpdate[data.OriginalColumnName] = data.Value;
                    }
                });
            });

        this.administrationDocumentSelectors
            .actionFailedOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(action => {
                this.disableAllButtons(false);
            });

        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(action => {
                if (!this.isUpdateMode) {
                    this.disableButtonNext(false);
                    this.disableButtonDelete(false);
                    return;
                }

                const newFolder = cloneDeep(this._idsStoreForUpdate.NewFolder || this._folder);

                this._idsStoreForUpdate.OldFolder = newFolder;
                this._idsStoreForUpdate.IdDocumentTree = newFolder.idDocument.toString();

                setTimeout(() => {
                    // delay 200ms until save document successfully then enable all buttons in mode UPDATED
                    this.disableAllButtons(false);
                }, 200);
            });

        this.administrationDocumentSelectors.didManipulateCaptureFile$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(didManipulateCaptureFile => {
                this._didManipulateCaptureFile = didManipulateCaptureFile;
            });
    }

    public nextCapturedDocument($event) {
        if (!this._didManipulateCaptureFile) {
            this.disableButtonNext(true);
        }

        this.store.dispatch(this.administrationDocumentActions.nextDocumentToClassify());
    }

    public saveDocument($event) {
        if (!this.isClickable()) return;

        this.disableAllButtons(true);
        let result = false;
        switch (this._documentContainerOcr.DocumentType) {
            case DocumentProcessingTypeEnum.INVOICE:
                result = this.saveDocumentInvoice();
                break;
            case DocumentProcessingTypeEnum.CONTRACT:
                result = this.saveDocumentContract();
                break;
            default:
                result = this.saveOtherDocument();
                break;
        }

        if (result === false) {
            this.disableAllButtons(false);
        }
    }

    public deleteScanDocument($event) {
        if (!this._documentContainerOcr) return;

        this.store.dispatch(
            this.administrationDocumentActions.deleteImageScanDocumentOnThumbnail(
                this._documentContainerOcr.IdDocumentContainerScans.toString(),
            ),
        );
    }

    public toggleCapturedForm($event) {
        if (this.btnToggleCapturedForm.disabled) return;

        this._toggleExpanded = !this._toggleExpanded;

        this.store.dispatch(this.administrationDocumentActions.expandCapturedForm(this._toggleExpanded));
    }

    private clearIdsStore() {
        this._idsStoreForUpdate = {
            IdMainDocument: null,
            IdDocumentTreeMedia: null,
            IdDocumentTree: null,
            OldFolder: null,
            NewFolder: null,
        };
    }

    private resetState() {
        this._invoiceForm = null;
        this._contractForm = null;
        this._contactForm = null;
        this._bankForm = null;
        this._notesForm = null;

        this._folder = null;
        this._documentTodos = null;
        this._documentIsTodo = false;
        this._documentKeyword = null;
    }

    private isClickable() {
        if (this.btnSaveRef.disabled) {
            this.toastService.pop(MessageModal.MessageType.warning, 'System', `Please choose a folder to save`);
            return false;
        }

        return true;
    }

    private disableAllButtons(isDisabled: boolean) {
        this.disableButtonNext(isDisabled);
        this.disableButtonSave(isDisabled);
        this.disableButtonDelete(isDisabled);
        this.disableToggleCapturedForm(isDisabled);
    }

    private disableButtonNext(isDisabled: boolean) {
        if (!this.btnNextRef) return;

        this.btnNextRef.disabled = isDisabled;
    }

    private disableButtonSave(isDisabled: boolean) {
        this.btnSaveRef.disabled = isDisabled;
    }

    private disableButtonDelete(isDisabled: boolean) {
        this.btnDeleteRef.disabled = isDisabled;
    }

    private disableToggleCapturedForm(isDisabled: boolean) {
        this.btnToggleCapturedForm.disabled = isDisabled;
    }

    /* Save Document Type: INVOICE */
    private validateInvoiceDocumentType(onInvalid: (message: string) => void): boolean {
        const messages: string[] = [];

        // required Contact & Bank & Invoice form must be inputted
        // Notes form  is optional
        const isContactValidated = this._contactForm ? this._contactForm.validateData() : false;
        const isInvoiceValidated = this._invoiceForm ? this._invoiceForm.validateData() : false;
        const isBankValidated = this._bankForm ? this._bankForm.validateData() : false;
        const isNotesValidated = this._notesForm ? this._notesForm.validateData() : true;

        if (!isContactValidated) {
            messages.push('Kontakt');
        }

        if (!isInvoiceValidated) {
            messages.push('Invoice');
        }

        if (!isBankValidated) {
            messages.push('Bank ');
        }

        if (!isNotesValidated) {
            messages.push('Notes');
        }

        if (messages.length) {
            const finalMessage = `${messages.join(', ')} ${messages.length > 1 ? 'are' : 'is'} invalid form`;
            onInvalid && onInvalid(finalMessage);
        }

        return isContactValidated && isInvoiceValidated && isBankValidated && isNotesValidated;
    }

    private saveDocumentInvoice() {
        const result = this.getMainDocumentInfo();

        const isValidInvoice = this.validateInvoiceDocumentType((message: string) => {
            this.toastService.pop(MessageModal.MessageType.warning, 'System', message);
        });

        if (!isValidInvoice) {
            // if (!result) return;

            // this.store.dispatch(this.administrationDocumentActions.saveDocumentInvoiceForms({
            //     mainDocument: result.dataMainDocument,
            //     documentTreeMedia: result.dataDocumentTreeMedia,
            //     folderCapturedDocument: result.dataFolderCapturedDocument,
            // } as SaveDocumentInvoiceModel));
            // return;
            return false;
        }

        const dataFormInvoice: InvoiceFormModel = this._invoiceForm ? this._invoiceForm.formatDataBeforeSaving() : null;
        const { hostPerson, privatePerson }: { [key: string]: PersonFormModel } = this._contactForm
            ? this._contactForm.formatDataBeforeSaving()
            : null;
        const dataFormBank: PersonBankFormModel = this._bankForm ? this._bankForm.formatDataBeforeSaving() : null;
        const dataFormNotes: DynamicFieldsPayloadModel[] = this._notesForm
            ? this._notesForm.formatDataBeforeSaving()
            : null;

        // merge data bank and invoice form
        if (dataFormInvoice && dataFormBank) {
            this.mergeDataBankAndInvoice(dataFormBank, dataFormInvoice);
        }

        this.store.dispatch(
            this.administrationDocumentActions.saveDocumentInvoiceForms({
                mainDocument: result.dataMainDocument,
                documentTreeMedia: result.dataDocumentTreeMedia,
                folderCapturedDocument: result.dataFolderCapturedDocument,

                personBeneficiary: this.checkPersonContactHasValue(hostPerson) ? hostPerson : null,
                personRemitter: this.checkPersonContactHasValue(privatePerson) ? privatePerson : null,
                personBank: this.checkPersonContactHasValue(dataFormBank) ? dataFormBank : null,

                invoice: dataFormInvoice ? dataFormInvoice : null,
                dynamicFields: dataFormNotes ? dataFormNotes : null,
            } as SaveDocumentInvoiceModel),
        );
    }

    private checkPersonContactHasValue(personObj: ContactFormModel): boolean {
        if (this.isUpdateMode) return true;
        if (!personObj) return false;

        let hasValue = false;
        const keys = Object.keys(personObj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (personObj.hasOwnProperty(key)) {
                const value = personObj[key];
                if (value && value.length) {
                    hasValue = true;
                    break;
                }
            }
        }
        return hasValue;
    }

    private mergeDataBankAndInvoice(personBank: PersonBankFormModel, invoice: InvoiceFormModel) {
        for (const key in personBank) {
            if (personBank.hasOwnProperty(key)) {
                const originalColumnName = key.substring(key.lastIndexOf('_') + 1);
                if (!invoice.hasOwnProperty(originalColumnName)) continue;

                invoice[originalColumnName] = personBank[key];
            }
        }
    }
    /* Save Document Type: INVOICE */

    /* Save Document Type: CONTRACT */
    private validateContractDocumentType(onInvalid: (messsage: string) => void): boolean {
        const messages: string[] = [];

        // required Contact & Contract form must be inputted
        // Notes form  is optional
        const isContactValidated = this._contactForm ? this._contactForm.validateData() : false;
        const isContractValidated = this._contractForm ? this._contractForm.validateData() : false;
        const isNotesValidated = this._notesForm ? this._notesForm.validateData() : true;

        if (!isContactValidated) {
            messages.push('Kontakt');
        }

        if (!isContractValidated) {
            messages.push('Contract');
        }

        if (!isNotesValidated) {
            messages.push('Notes');
        }

        if (messages.length) {
            const finalMessage = `${messages.join(', ')} ${messages.length > 1 ? 'are' : 'is'} invalid form`;
            onInvalid && onInvalid(finalMessage);
        }

        return isContactValidated && isContractValidated && isNotesValidated;
    }

    private saveDocumentContract() {
        const result = this.getMainDocumentInfo();

        const isValidContract = this.validateContractDocumentType((message: string) => {
            this.toastService.pop(MessageModal.MessageType.warning, 'System', message);
        });

        if (!isValidContract) {
            // if (!result) return ;

            // this.store.dispatch(this.administrationDocumentActions.saveDocumentContractForms({
            //     mainDocument: result.dataMainDocument,
            //     documentTreeMedia: result.dataDocumentTreeMedia,
            //     folderCapturedDocument: result.dataFolderCapturedDocument,
            // }));
            return false;
        }

        const { hostPerson, privatePerson }: { [key: string]: PersonFormModel } = this._contactForm
            ? this._contactForm.formatDataBeforeSaving()
            : null;
        const dataFormContract: ContractFormModel = this._contractForm
            ? this._contractForm.formatDataBeforeSaving()
            : null;
        const dataFormNotes: DynamicFieldsPayloadModel[] = this._notesForm
            ? this._notesForm.formatDataBeforeSaving()
            : null;

        this.store.dispatch(
            this.administrationDocumentActions.saveDocumentContractForms({
                mainDocument: result.dataMainDocument,
                documentTreeMedia: result.dataDocumentTreeMedia,
                folderCapturedDocument: result.dataFolderCapturedDocument,
                personContractingParty: this.checkPersonContactHasValue(privatePerson) ? privatePerson : null,
                personContractor: this.checkPersonContactHasValue(hostPerson) ? hostPerson : null,
                contract: dataFormContract,
                dynamicFields: dataFormNotes,
            }),
        );
    }
    /* Save Document Type: CONTRACT */

    /* Save Document Type: OTHER_DOCUMENT */
    private validateOtherDocumentType(onInvalid: (messsage: string) => void): boolean {
        const messages: string[] = [];
        // required Contact & Contract form must be inputted
        // Notes form  is optional
        const isContactValidated = this._contactForm ? this._contactForm.validateData() : false;
        const isNotesValidated = this._notesForm ? this._notesForm.validateData() : true;

        if (!isContactValidated) {
            messages.push('Kontakt');
        }

        if (!isNotesValidated) {
            messages.push('Notes');
        }

        if (messages.length) {
            const finalMessage = `${messages.join(', ')} ${messages.length > 1 ? 'are' : 'is'} invalid form`;
            onInvalid && onInvalid(finalMessage);
        }

        return isContactValidated && isNotesValidated;
    }
    private saveOtherDocument() {
        const result = this.getMainDocumentInfo();

        const isValidOtherDocType = this.validateOtherDocumentType((message: string) => {
            this.toastService.pop(MessageModal.MessageType.warning, 'System', message);
        });

        if (!isValidOtherDocType) {
            // if (!result) return;

            // this.store.dispatch(this.administrationDocumentActions.saveOtherDocumentForms({
            //     mainDocument: result.dataMainDocument,
            //     documentTreeMedia: result.dataDocumentTreeMedia,
            //     folderCapturedDocument: result.dataFolderCapturedDocument,
            // }));
            return false;
        }

        const { hostPerson, privatePerson }: { [key: string]: PersonFormModel } = this._contactForm
            ? this._contactForm.formatDataBeforeSaving()
            : null;
        const dataFormNotes: DynamicFieldsPayloadModel[] = this._notesForm
            ? this._notesForm.formatDataBeforeSaving()
            : null;

        this.store.dispatch(
            this.administrationDocumentActions.saveOtherDocumentForms({
                mainDocument: result.dataMainDocument,
                documentTreeMedia: result.dataDocumentTreeMedia,
                folderCapturedDocument: result.dataFolderCapturedDocument,
                otherDocuments: {
                    idDocumentContainerScans: this._documentContainerOcr.IdDocumentContainerScans.toString(),
                    idDocumentTree: this._idsStoreForUpdate.IdDocumentTree || this._folder.idDocument.toString(),
                },

                personContact: this.checkPersonContactHasValue(hostPerson) ? hostPerson : null,
                personPrivat: this.checkPersonContactHasValue(privatePerson) ? privatePerson : null,
                dynamicFields: dataFormNotes,
            }),
        );
    }
    /* Save Document Type: OTHER_DOCUMENT */

    private setFormState(formName: string, documentFormState: any) {
        const formState = Uti.getFormStateByDocumentFormName(documentFormState, formName);

        switch (formName) {
            case DocumentFormNameEnum.WIDGET_CONTACT:
                this._contactForm = formState;
                break;

            case DocumentFormNameEnum.WIDGET_NOTES:
                this._notesForm = formState;
                break;

            case DocumentFormNameEnum.WIDGET_BANK:
                this._bankForm = formState;
                break;

            case DocumentFormNameEnum.WIDGET_INVOICE:
                this._invoiceForm = formState;
                break;

            case DocumentFormNameEnum.WIDGET_CONTRACT:
                this._contractForm = formState;
                break;
            default:
                break;
        }
    }

    private getMainDocumentInfo(): {
        dataMainDocument: MainDocumentModel;
        dataDocumentTreeMedia: DocumentTreeMediaModel;
        dataFolderCapturedDocument: FolderCapturedDocumentModel;
    } {
        const documentTreeMediaModel = this._folder ? this.formatJsonDocumentTreeMedia(this._folder) : null;
        const isValidJsonDocumentTreeMedia = documentTreeMediaModel
            ? this.validateJsonDocumentTreeMedia(documentTreeMediaModel)
            : false;

        if (!isValidJsonDocumentTreeMedia) return null;

        const mainDocumentModel = this._folder ? this.formatJsonMainDocument(this._folder) : null;
        const isValidJsonMain = mainDocumentModel ? this.validateJsonMainDocument(mainDocumentModel) : false;

        if (!isValidJsonMain) return null;

        let folderCapturedDocument: FolderCapturedDocumentModel = null;

        // in case of change folder
        if (this._folder.idDocument.toString() !== mainDocumentModel.mainDocumentTree.idDocumentTree) {
            folderCapturedDocument = {
                idDocumentTree: this._folder.idDocument.toString(),
                idMainDocument: mainDocumentModel.idMainDocument,
            };

            // we need to set this idMainDocument of mainDocument model to null
            // if not => that leads to the case update document
            // in this case of change folder => we need to create new document & delete old one
            mainDocumentModel.idMainDocument = null;
        }

        return {
            dataDocumentTreeMedia: documentTreeMediaModel,
            dataMainDocument: mainDocumentModel,
            dataFolderCapturedDocument: folderCapturedDocument,
        };
    }

    private validateJsonMainDocument(mainDocument: MainDocumentModel) {
        if (!mainDocument || !mainDocument.mainDocumentTree.idDocumentTree || !mainDocument.idDocumentContainerScans) {
            this.toastService.pop(
                MessageModal.MessageType.warning,
                'System',
                'Invalid data main document to save document',
            );
            return false;
        }

        return true;
    }

    private formatJsonMainDocument(documentTreeModel: DocumentTreeModel): MainDocumentModel {
        return {
            idMainDocument: this._idsStoreForUpdate.IdMainDocument || null,
            idDocumentContainerScans: `${this._documentContainerOcr.IdDocumentContainerScans}`,
            searchKeyWords: this._documentKeyword,
            toDoNotes: this._documentTodos,
            isTodo: this._documentIsTodo,
            mainDocumentTree: {
                idDocumentTree: this._idsStoreForUpdate.IdDocumentTree || `${documentTreeModel.idDocument}`,
                oldFolder: this._idsStoreForUpdate.OldFolder,
                newFolder: this._idsStoreForUpdate.NewFolder,
            },
        };
    }

    private validateJsonDocumentTreeMedia(documentTreeMedia: DocumentTreeMediaModel) {
        if (!documentTreeMedia || !documentTreeMedia.idDocumentTree) {
            this.toastService.pop(
                MessageModal.MessageType.warning,
                'System',
                'Invalid data document tree media to save document',
            );
            return false;
        }

        return true;
    }

    private formatJsonDocumentTreeMedia(documentTreeModel: DocumentTreeModel): DocumentTreeMediaModel {
        return {
            idDocumentTreeMedia: this._idsStoreForUpdate.IdDocumentTreeMedia || null,
            idDocumentTree: `${documentTreeModel.idDocument}`,
            idRepTreeMediaType: '1',
            mediaName: this._originalFileName || this._documentContainerOcr.OriginalFileName,
            cloudMediaPath: documentTreeModel.path,
        };
    }

    private initConditionToEnableSaveButton(documentType: DocumentProcessingTypeEnum) {
        // if (this._conditionEnableSaveButton.needInitialForms) return;

        this._conditionEnableSaveButton.documentProcessingType = documentType;
        this._conditionEnableSaveButton.countInitialForm = 0;

        switch (this._conditionEnableSaveButton.documentProcessingType) {
            case DocumentProcessingTypeEnum.INVOICE:
                this._conditionEnableSaveButton.needInitialForms = [
                    DocumentFormNameEnum.WIDGET_CONTACT,
                    DocumentFormNameEnum.WIDGET_BANK,
                    DocumentFormNameEnum.WIDGET_INVOICE,
                    DocumentFormNameEnum.WIDGET_NOTES,
                ];
                break;

            case DocumentProcessingTypeEnum.CONTRACT:
                this._conditionEnableSaveButton.needInitialForms = [
                    DocumentFormNameEnum.WIDGET_CONTACT,
                    DocumentFormNameEnum.WIDGET_CONTRACT,
                    DocumentFormNameEnum.WIDGET_NOTES,
                ];
                break;

            case DocumentProcessingTypeEnum.OTHER_DOCUMENT:
                this._conditionEnableSaveButton.needInitialForms = [
                    DocumentFormNameEnum.WIDGET_CONTACT,
                    DocumentFormNameEnum.WIDGET_NOTES,
                ];
                break;

            default:
                this._conditionEnableSaveButton.needInitialForms = [];
                return;
        }
    }

    private resetConditionToEnableSaveButton() {
        this._conditionEnableSaveButton.needInitialForms = [];
        this._conditionEnableSaveButton.documentProcessingType = null;
        this._conditionEnableSaveButton.countInitialForm = 0;
    }
}
