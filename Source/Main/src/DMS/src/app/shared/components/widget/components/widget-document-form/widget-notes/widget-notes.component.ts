import {
    OnInit,
    OnDestroy,
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { WidgetDocumentForm } from '../widget-document-form.component';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer/administration-document/administration-document.selectors';
import { AdministrationDocumentActionNames } from '@app/state-management/store/actions/administration-document/administration-document.action';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { DocumentFormNameEnum, DocumentGroupFieldEnum, DocumentTabIddEnum } from '@app/app.constants';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { Router } from '@angular/router';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { Observable, Subject } from 'rxjs';
import { TabSummaryModel, BadgeTabEnum } from '@app/models';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppErrorHandler } from '@app/services';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { Uti } from '@app/utilities';
import { MatAutocompleteTrigger } from '@app/shared/components/xn-control/light-material-ui/autocomplete';
import { cloneDeep } from 'lodash-es';
import { CustomAction } from '@app/state-management/store/actions';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { ControlData } from '@app/models/control-model/control-data';
import { of } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged, switchMap, map, startWith } from 'rxjs/operators';

@Component({
    selector: 'widget-notes',
    styleUrls: ['./widget-notes.component.scss'],
    templateUrl: './widget-notes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetNotesComponent extends WidgetDocumentForm implements OnInit, OnDestroy {
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    // local vaiable for ocr
    private _extractedData: ExtractedDataFormModel[] = [];
    private _isUpdateMode: boolean = false;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _tabWidget: TabSummaryModel;
    private _notesCapturedFormElement: CapturedFormElement;

    // START: Modal add new note
    private dynamicTypeList = [];
    public autoCompleteFilteredOptions: Observable<string[]>;
    public newNoteFormGroup: FormGroup;
    public newNoteControlsName = {
        name: 'FieldName',
        value: 'FieldValue',
    };
    public newNoteListControlData: ControlData[] = [
        { controlName: this.newNoteControlsName.name, order: 1 } as ControlData,
        { controlName: this.newNoteControlsName.value, order: 2 } as ControlData,
    ];
    // setting for dialog
    public isShowDialog = false;
    public dialogClass = 'diaglog-add-note';
    public dialogWidth = '500';
    // END: Modal add new note

    // Dynamic Notes
    public formGroup: FormGroup = this.fb.group({}); // just empty form for adapt with old strcuture
    public notesList: DynamicFieldsPayloadModel[] = [];
    private fieldValueChanged: Subject<DynamicFieldsPayloadModel> = new Subject<DynamicFieldsPayloadModel>();

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private documentManagementSelectors: DocumentManagementSelectors,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private fb: FormBuilder,
        private cdRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
        private el: ElementRef,
    ) {
        super(router, store, administrationActions, administrationSelectors, DocumentFormNameEnum.WIDGET_NOTES, null);
        this.isFirstLoading = true;
        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this._notesCapturedFormElement = new CapturedFormElement(DocumentFormNameEnum.WIDGET_NOTES);
        this._notesCapturedFormElement.notifyOnAccept = () => {
            this.setExtractedOcrData(this._notesCapturedFormElement.ocrData);
        };
        this.store.dispatch(this.administrationActions.registerTabFormElement(this._notesCapturedFormElement));
        this.onSubcribeAction();
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    public onSubcribeAction() {
        this.administrationSelectors.capturedFormMode$
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((mode: CapturedFormModeEnum) => {
                switch (mode) {
                    case CapturedFormModeEnum.Updated:
                        this._isUpdateMode = true;
                        break;

                    case CapturedFormModeEnum.Created:
                    default:
                        this._isUpdateMode = false;
                        break;
                }
            });

        this.administrationSelectors.folder$.pipe(takeUntil(super.getUnsubscriberNotifier())).subscribe((folder) => {
            this._folder = folder;
            if (this._folder) {
                this.store.dispatch(this.administrationActions.getDocumentDynamicCombobox(this._folder.idDocument));
            }
        });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_DYNAMIC_COMBOBOX)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (action && action.payload && action.payload.length) {
                    action.payload.forEach((element) => {
                        this.dynamicTypeList.push({ key: element.idDynamicFieldsEntityName, value: element.fieldName });
                    });
                }

                this.initFunction();
            });

        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                // clear dynamic fields in array extracted list data
                this._extractedData = this._isUpdateMode ? this._extractedData : [];
                this._documentContainerOcr = documentContainerOcr;
                this.documentProcessingType = documentContainerOcr.DocumentType;

                this.callEventInitialFormState();
            });

        this.administrationSelectors.documentsState$
            .pipe(
                filter(
                    (documentsState) =>
                        documentsState &&
                        documentsState.documentOnUpdate.formName === DocumentFormNameEnum.WIDGET_NOTES,
                ),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentsState) => {
                if (!this._extractedData) {
                    return;
                }
                const currentData = this._extractedData.find(
                    (item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName,
                );
                if (!currentData) return;

                const newDataState = documentsState.documentsForm[this._documentContainerOcr.DocumentType].formsState[
                    DocumentFormNameEnum.WIDGET_NOTES
                ].data.find((item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName);

                currentData.Value = newDataState.Value;
                currentData.WordsCoordinates = newDataState.WordsCoordinates;

                const note = this.notesList.find((x) => x.TemporaryId === newDataState.OriginalColumnName);
                if (!note) return;
                note.FieldValue = newDataState.Value;
                this.setErrorVarriable(!note.FieldValue, note);
            });

        this.administrationSelectors.detailedDocumentDataState$
            .pipe(
                filter((detailedDocumentDataState) => this._isUpdateMode === true),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((detailedDocumentDataState) => {
                if (!detailedDocumentDataState || !detailedDocumentDataState.length) return;

                const found = detailedDocumentDataState.find((data) => data.OriginalColumnName === 'JsonDynamicFields');
                if (!found || !found.Value) return;

                this.notesList = JSON.parse(found.Value);

                this.notesList.forEach((note) => {
                    note.TemporaryId = Uti.guid();
                    this.addNoteToExtractData(note);
                });

                this.defaultData = cloneDeep(this.notesList);
                this.callEventInitialFormState(false);
            });

        // this.administrationSelectors.extractedDataFromOcr$
        //     .filter((extractedData) => this._isUpdateMode === true)
        //     .takeUntil(super.getUnsubscriberNotifier())
        //     .subscribe((extractedDataState) => {
        //         if (!extractedDataState || !extractedDataState.length) return;

        //         const found = extractedDataState.find((data) => data.OriginalColumnName === 'JsonDynamicFields');
        //         if (!found || !found.Value) return;

        //         this.notesList = JSON.parse(found.Value);

        //         this.notesList.forEach((note) => {
        //             note.TemporaryId = Uti.guid();
        //             this.addNoteToExtractData(note);
        //         });

        //         this.defaultData = cloneDeep(this.notesList);
        //         this.callEventInitialFormState(false);
        //     });

        this._tabHeaderDataModel
            .pipe(
                filter((tabHeaders) => tabHeaders && tabHeaders.length >= 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this._tabWidget = tabHeaderDataModel.find((tab) => tab.tabSummaryInfor.tabID === 'NotizenTags');
                });
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_EMPTY_FORM_STATE)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.setEmptyExtractedData(this._extractedData);
                this.notesList = [];
                this.setBadge();
                this.cdRef.detectChanges();
            });

        this.documentManagementSelectors
            .actionOfType$(AdministrationDocumentActionNames.SHOW_DIALOG_ADD_NEW_NOTE)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.isShowDialog = true;
                this.cdRef.detectChanges();
                // set focus to field name
                this.setFocusToFieldName();

                this.newNoteFormGroup.valueChanges
                    .pipe(
                        debounceTime(350),
                        switchMap((val) => {
                            return of(val);
                        }),
                        takeUntil(this.getUnsubscriberNotifier()),
                    )
                    .subscribe(() => {
                        this.cdRef.detectChanges();
                    });
            });

        this.fieldValueChanged
            .pipe(debounceTime(50), distinctUntilChanged(), takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((noteChanged: DynamicFieldsPayloadModel) => {
                const note = this.notesList.find((x) => x.TemporaryId === noteChanged.TemporaryId);
                if (!note) return;

                this.setErrorVarriable(!noteChanged.FieldValue, note);
                this.callEventSetValueChangeToFieldFormOnFocus(note);
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.RESET_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.NOTES),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (!this._isUpdateMode) {
                    this.notesList = [];
                    return;
                }

                this.notesList = cloneDeep(this.defaultData);
                this.setBadge();
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLEAR_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.NOTES),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (!this.notesList) return;

                this.notesList.forEach((element) => {
                    element.FieldValue = '';
                    element.IsError = true;
                });
                this.setBadge();
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.defaultData = cloneDeep(this.notesList);
            });
    }

    public initFunction() {
        this.initNewNoteFormGroup();
        this.setBadge();

        this.autoCompleteFilteredOptions = this.newNoteFormGroup.controls[
            this.newNoteControlsName.name
        ].valueChanges.pipe(
            startWith(null),
            map((value) => (value ? this._filterAutoComplete(value.trim()) : this.dynamicTypeList.slice())),
        );
    }

    private formatDataBeforeSaving(): any {
        return this.notesList as DynamicFieldsPayloadModel[];
    }

    private validateData(): boolean {
        if (!this.notesList.length) return true;

        const notes = this.notesList.filter((x) => !!x.IsError);
        return notes.length > 0 ? false : true;
    }

    private callEventInitialFormState(onInit: boolean = true) {
        super.onFolderChangedThenInitialFormState(
            this._extractedData,
            this.formGroup,
            DocumentFormNameEnum.WIDGET_NOTES,
            this.formatDataBeforeSaving,
            this.validateData,
            onInit,
        );
    }

    private callEventSetFieldFormOnFocus(note: DynamicFieldsPayloadModel) {
        const payload = new FieldFormOnFocusModel();
        payload.formOnFocus = this.formGroup;
        payload.fieldOnFocus = note.TemporaryId;
        payload.documentFormType = {
            documentProcessingType: this.documentProcessingType,
        };
        payload.documentFormName = this.documentFormName;
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(payload));
    }

    private callEventSetValueChangeToFieldFormOnFocus(note: DynamicFieldsPayloadModel) {
        this.store.dispatch(
            this.administrationActions.setValueChangeToFieldFormOnFocus({
                data: {
                    Value: note.FieldValue,
                    OriginalColumnName: note.TemporaryId,
                },
                documentFormName: this.documentFormName,
                documentProcessingType: this.documentProcessingType,
            }),
        );
    }

    private addNoteToExtractData(note: DynamicFieldsPayloadModel) {
        this._extractedData.push({
            ColumnName: note.TemporaryId,
            OriginalColumnName: note.TemporaryId,
            GroupField: DocumentGroupFieldEnum.NOTES,
            Value: note.FieldValue,
            WordsCoordinates: null,
            DataType: 'text',
        });
    }

    public removeNote(note: DynamicFieldsPayloadModel) {
        const index = this.notesList.findIndex((x) => x.TemporaryId === note.TemporaryId);
        this.notesList.splice(index, 1);
        this._extractedData.splice(index, 1);
        this.setBadge();
    }

    public onChangedField(fieldValue: string, tempId: string) {
        this.fieldValueChanged.next({ FieldValue: fieldValue, TemporaryId: tempId } as DynamicFieldsPayloadModel);
    }

    public onFocus(note: DynamicFieldsPayloadModel) {
        this.callEventSetFieldFormOnFocus(note);
        note.isFocus = true;
        note.isShowIconClearField = true;
        this.cdRef.detectChanges();
    }

    public onFocusOut(note: DynamicFieldsPayloadModel) {
        note.isFocus = false;
        note.isShowIconClearField = false;
        this.cdRef.detectChanges();
    }

    public onMouseEnter(note: DynamicFieldsPayloadModel) {
        note.isShowIconClearField = true;
        this.cdRef.detectChanges();
    }

    public onMouseLeave(note: DynamicFieldsPayloadModel) {
        if (note.isFocus) return;

        note.isShowIconClearField = false;
        this.cdRef.detectChanges();
    }

    public onEnter(note: DynamicFieldsPayloadModel) {
        this.onFocusOut(note);
        const currentIndex = this.notesList.indexOf(note);
        if (currentIndex === this.notesList.length - 1) {
            document.getElementById(note.TemporaryId).blur();
            return;
        }

        const nextNote = this.notesList[currentIndex + 1];
        document.getElementById(nextNote.TemporaryId).focus();
        this.onFocus(nextNote);
    }

    public onFocusFieldValue() {
        this.cdRef.detectChanges();
    }

    private setBadge() {
        if (!this.notesList) {
            this._tabWidget.badgeColorChanged.next(BadgeTabEnum.Completed);
            return;
        }

        let result = null;
        const errorNotes = this.notesList.filter((x) => !!x.IsError);
        const errorNumber = errorNotes.length;
        const notesLength = this.notesList.length;
        switch (errorNumber) {
            case 0:
                result = BadgeTabEnum.Completed;
                break;
            case notesLength:
                result = BadgeTabEnum.None;
                break;
            default:
                result = BadgeTabEnum.Partial;
                break;
        }
        this._tabWidget.badgeColorChanged.next(result);
    }

    private setErrorVarriable(isError: boolean, note: DynamicFieldsPayloadModel) {
        note.IsError = isError;
        this.setBadge();
        this.cdRef.detectChanges();
    }

    public close() {
        this.isShowDialog = false;
        this.newNoteFormGroup.reset();
        this.callEventInitialFormState(false);

        const controls = document.querySelectorAll('.dms-list-widget .dynamic-notes input.ng-invalid');
        if (controls && controls.length) {
            const control = document.getElementById(controls[0].id);
            this.setFocusToElement(control);
        }
    }

    public isRequired(controlName: string) {
        if (controlName) {
            return (
                (this.newNoteFormGroup.controls[controlName].dirty ||
                    this.newNoteFormGroup.controls[controlName].touched) &&
                this.newNoteFormGroup.controls[controlName].errors &&
                this.newNoteFormGroup.controls[controlName].errors.required
            );
        }
    }

    private setFocusToElement(ele: HTMLElement) {
        setTimeout(() => {
            ele.focus();
            this.cdRef.detectChanges();
        }, 0);
    }

    public clearTextField(temId) {
        const note = this.notesList.find((x) => x.TemporaryId === temId);
        if (!note || (note && !note.FieldValue)) return;

        note.FieldValue = '';
        note.IsError = true;

        this.cdRef.detectChanges();
    }

    private setExtractedOcrData(ocrData: any) {}

    /**
     * START: Modal add new note
     */
    private initNewNoteFormGroup() {
        let formGroup = this.fb.group({});
        this.newNoteListControlData.forEach((element) => {
            formGroup.addControl(element.controlName, new FormControl('', Validators.required));
        });
        this.newNoteFormGroup = formGroup;
        this.cdRef.detectChanges();
    }

    private _filterAutoComplete(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.dynamicTypeList.filter((option) => option.value.toLowerCase().includes(filterValue));
    }

    private setFocusToFieldName() {
        const control = document.getElementById(this.newNoteControlsName.name);
        if (!control) return;

        this.setFocusToElement(control);
    }

    public onEnterFieldName($event: KeyboardEvent) {
        if ($event && $event.srcElement && $event.srcElement['id'] === this.newNoteControlsName.name) {
            this.autocomplete.closePanel();
        }

        // add new note to list
        const value = this.newNoteFormGroup.controls[this.newNoteControlsName.name].value;
        if (!this.newNoteFormGroup.valid || !value) return;

        const autocompleteEle = document.querySelector('.mat-autocomplete-panel.mat-autocomplete-visible');
        const item = this.dynamicTypeList.find((x) => x.value.toLowerCase() === value.toLowerCase());
        const selectedValue = this.autocomplete.activeOption;
        if (autocompleteEle && (item || (selectedValue && selectedValue.value))) {
            const value = item ? item.value : selectedValue.value;
            this.newNoteFormGroup.get(this.newNoteControlsName.name).setValue(value);
            this.autocomplete.closePanel();
        } else {
            this.addNewNote(true);
        }
    }

    private addNewNote(isContinue = false) {
        const note = this.newNoteFormGroup.value as DynamicFieldsPayloadModel;
        note.IsError = !note.FieldValue;
        note.IdDocumentTree = this._folder.idDocument.toString();
        note.TemporaryId = Uti.guid();
        const entitField = this.dynamicTypeList.find((x) => x.value.toLowerCase() === note.FieldName.toLowerCase());
        note.IdDynamicFieldsEntityName = entitField ? entitField.key : null;
        note.isShowIconClearField = false;

        if (!this.notesList) this.notesList = [];
        this.notesList.push(note);
        this.setBadge();

        this.addNoteToExtractData(note);
        this.callEventSetFieldFormOnFocus(note);

        this.newNoteFormGroup.reset();
        this.newNoteFormGroup.markAsPristine();
        this.newNoteFormGroup.markAsUntouched();
        this.newNoteFormGroup.updateValueAndValidity();
        if (isContinue) this.setFocusToFieldName();
    }

    public onAddNewNote() {
        if (!this.newNoteFormGroup.valid) return;

        this.addNewNote();
        this.close();
    }

    public onAddNoteAndContinue() {
        if (!this.newNoteFormGroup.valid) return;

        this.addNewNote(true);
    }
    /**
     * END: Modal add new note
     */
}
