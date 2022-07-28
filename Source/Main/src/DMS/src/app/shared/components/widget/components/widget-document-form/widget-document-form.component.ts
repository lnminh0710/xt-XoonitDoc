import { BaseComponent } from '@app/pages/private/base';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BaseControl } from './control-model/base-control.model';
import { TextControl } from './control-model/text-control.model';
import { DynamicFormData } from './control-model/dynamic-form-data.model';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document';
import { RadioToggleControl } from './control-model/radio-toggle.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { of } from 'rxjs';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';
import { DropdownControl } from './control-model/dropdown-control.model';
import { dataTypeFormControl } from './control-model/document.enum';
import { isBoolean, cloneDeep } from 'lodash-es';
import { ColumnSettingReponseModel } from './control-model/column-setting-response.model';
import { Uti } from '@app/utilities';
import { parse, format } from 'date-fns';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { Router } from '@angular/router';
import { ComboboxRepositoryStateModel } from '@app/state-management/store/models/administration-document/state/combobox-repository.state.model';
import { QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ControlDynamicHandlerComponent } from './control-dynamic-handler/control-dynamic-handler.component';
import { BadgeTabEnum, TabSummaryModel } from '@app/models';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DetailedDocumentDataState } from '@app/state-management/store/models/administration-document/state/detailed-document-data.state.model';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { ColumnDefinitionSetting } from '@app/models/common/column-definition.model';

export abstract class WidgetDocumentForm extends BaseComponent {
    public badgesColor = [];
    public numberField = [];
    public defaultListControl: BaseControl<any>[] = [];

    protected isFirstLoading: boolean;
    protected defaultData: any;

    protected _prevDocumentContainerOrc: DocumentContainerOcrStateModel;
    protected _documentContainerOcr: DocumentContainerOcrStateModel;
    protected _extractedDataOcrState: ExtractedDataOcrState[];
    protected _folder: DocumentTreeModel;

    @ViewChildren(ControlDynamicHandlerComponent) controls: QueryList<ControlDynamicHandlerComponent>;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        protected documentFormName: string,
        protected documentProcessingType: DocumentProcessingTypeEnum,
    ) {
        super(router);
    }

    public abstract initFunction();
    public abstract onSubcribeAction();

    protected countPropertiesObject(obj) {
        return Object.keys(obj).length;
    }

    protected detectChangeValue(formGroup: FormGroup, index: number) {
        // this.setColorBadge(formGroup, index);
        this.setFormEventValueChanges(formGroup);
    }

    public detectControlsChangeValue(formGroup: FormGroup) {
        this.setFormEventValueChanges(formGroup);
    }

    protected createFormGroupWithControls(controls: BaseControl<any>[]) {
        const group: any = {};
        let val: any;

        if (controls.length) {
            controls.forEach((control) => {
                val = isBoolean(control.value) ? control.value : control.value || '';
                const validators: any[] = [];

                if (control.required) {
                    validators.push(Validators.required);
                }
                if (control.validators) {
                    if (control.validators.IgnoreKeyCharacters && control.validators.IgnoreKeyCharacters.length > 0) {
                        const ignoreKeyCodes = JSON.parse(control.validators.IgnoreKeyCharacters) as string[];
                        control.ignoreKeyCodes = [];
                        ignoreKeyCodes.forEach((char) => {
                            const keyCode = char.charCodeAt(0);
                            control.ignoreKeyCodes.push(keyCode);
                        });
                    }

                    if (control.validators.MaxLength) {
                        validators.push(Validators.maxLength(+control.validators.MaxLength));
                    }

                    if (control.validators.Pattern) {
                        validators.push(Validators.pattern(new RegExp(control.validators.Pattern.Regex, '')));
                    }
                }

                group[control.originalColumnName] = new FormControl(val, validators);
            });
        }
        return new FormGroup(group);
    }

    protected newControlWithData(data: any, displayName: string, listComboBox: any[] = []): BaseControl<any> {
        let obj = new BaseControl<any>();
        switch (data.DataType.toLowerCase()) {
            case dataTypeFormControl.nvarchar:
            case dataTypeFormControl.varchar:
            case '':
                obj = new TextControl({
                    originalColumnName: data.OriginalColumnName,
                    columnName: displayName,
                    value: data.Value,
                    required: false,
                    validators: data.Validators,
                    orderBy: data.OrderBy,
                    documentFormName: this.documentFormName,
                    documentFormType: {
                        documentProcessingType: this.documentProcessingType,
                    },
                    dataType: data.DataType,
                });
                break;
            case dataTypeFormControl.datetime:
                obj = new TextControl({
                    originalColumnName: data.OriginalColumnName,
                    columnName: displayName,
                    value: data.Value,
                    required: false,
                    validators: data.Validators,
                    orderBy: data.OrderBy,
                    type: 'text', // TODO
                    documentFormName: this.documentFormName,
                    documentFormType: {
                        documentProcessingType: this.documentProcessingType,
                    },
                    dataType: data.DataType,
                });
                break;
            case dataTypeFormControl.decimal:
            case dataTypeFormControl.bigint:
            case dataTypeFormControl.int:
            case dataTypeFormControl.money:
                obj = new TextControl({
                    originalColumnName: data.OriginalColumnName,
                    columnName: displayName,
                    value: data.Value,
                    required: false,
                    validators: data.Validators,
                    orderBy: data.OrderBy,
                    type: 'number',
                    documentFormName: this.documentFormName,
                    documentFormType: {
                        documentProcessingType: this.documentProcessingType,
                    },
                    dataType: data.DataType,
                });
                break;
            case dataTypeFormControl.bit:
                obj = new RadioToggleControl({
                    originalColumnName: data.OriginalColumnName,
                    columnName: displayName,
                    required: false,
                    validators: data.Validators,
                    value: !data.Value ? false : true,
                    orderBy: data.OrderBy,
                    documentFormName: this.documentFormName,
                    documentFormType: {
                        documentProcessingType: this.documentProcessingType,
                    },
                    dataType: data.DataType,
                });
                break;
            case dataTypeFormControl.comboBox:
                obj = new DropdownControl({
                    originalColumnName: data.OriginalColumnName,
                    columnName: displayName,
                    required: false,
                    validators: data.Validators,
                    value: data.Value,
                    options: listComboBox,
                    orderBy: data.OrderBy,
                    documentFormName: this.documentFormName,
                    documentFormType: { documentProcessingType: this.documentProcessingType },
                    dataType: data.DataType,
                });
                break;
            default:
                break;
        }
        obj.hidden = data.Hidden;
        obj.readOnly = data.ReadOnly;

        return obj;
    }

    protected parseDataDynamicField(data: any, typeEnumGroupField: string): DynamicFormData {
        const dynamicFormData = new DynamicFormData();
        if (data) {
            dynamicFormData.nameForm = data.title;

            if (data.contentDetail && data.contentDetail.data && data.contentDetail.data.length === 2) {
                const listData: BaseControl<any>[] = [];
                data.contentDetail.data[1].forEach((element) => {
                    if (element.GroupField === typeEnumGroupField) {
                        listData.push(this.newControlWithData(element, element.ColumnName));
                    }
                });
                dynamicFormData.listControl = listData.sort((a, b) => a.orderBy - b.orderBy);
            }
        }
        return dynamicFormData;
    }

    protected setEmptyExtractedData(extractedDataList: ExtractedDataFormModel[]) {
        Uti.setEmptyExtractedData(extractedDataList, (originalColumnName) => {
            return false;
        });
    }

    protected setEmptyDataForm(form: FormGroup, ignoreCtrlNames?: string[]) {
        Uti.iterateFormControl(form, (ctrl, ctrlName) => {
            if (ignoreCtrlNames && ignoreCtrlNames.indexOf(ctrlName) !== -1) {
                return;
            }
            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => false);
        });
    }

    protected setEmptyDataValueOfFormAndExtractedData(
        form: FormGroup,
        extractedDataList: ExtractedDataFormModel[],
        ignoreCtrlNames?: string[],
    ) {
        this.setEmptyExtractedData(extractedDataList);
        this.setEmptyDataForm(form, ignoreCtrlNames);
    }

    protected validateAllControlsAsTouched(
        formGroup: FormGroup,
        handleCtrl?: (ctrl: FormControl, ctrlName: string) => void,
    ): boolean {
        const iterator = Uti.iterateFormControl(formGroup, (ctrl, ctrlName) => {
            ctrl.markAsTouched({ onlySelf: true });

            if (handleCtrl) {
                handleCtrl(ctrl, ctrlName);
            }
        });
        return formGroup.valid;
    }

    private setFormEventValueChanges(absCtrl: AbstractControl) {
        Uti.iterateFormControl(absCtrl, (ctrl: FormControl, controlName: string) => {
            this.onValueChange(ctrl as FormControl, controlName);
        });
    }

    private onValueChange(ctrl: FormControl, originalColumnName: string): void {
        ctrl.valueChanges
            .pipe(
                debounceTime(350),
                switchMap((val) => {
                    return of(val);
                }),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((val) => {
                // console.log(`widget-document-form.component: originalColumnName ${originalColumnName} on change: ${val}`);
                this.store.dispatch(
                    this.administrationActions.setValueChangeToFieldFormOnFocus({
                        data: {
                            Value: val,
                            OriginalColumnName: originalColumnName,
                        },
                        documentFormName: this.documentFormName,
                        documentProcessingType: this.documentProcessingType,
                    }),
                );
            });
    }

    protected generateColumnSetting̣(
        action: any,
        displayNameConstant: any,
        isOrginalColumnName: boolean = true,
    ): ColumnSettingReponseModel {
        const response = new ColumnSettingReponseModel();
        const payload = action.payload;

        for (let index = 0; index < payload.item.length; index++) {
            const columnData = payload.item[index];
            const setting = columnData.setting as ColumnDefinitionSetting;

            if (setting) {
                columnData.DataType = setting.ControlType ? setting.ControlType.Type : columnData.dataType;

                if (setting.DisplayField) {
                    columnData.OrderBy = setting.DisplayField.OrderBy;
                    columnData.Hidden = setting.DisplayField.Hidden !== '0' ? true : false;
                    columnData.ReadOnly = setting.DisplayField.ReadOnly !== '0' ? true : false;
                }
            }

            columnData.Validators = setting.Validators;

            if (columnData.Hidden || columnData.ReadOnly) {
                continue;
            }
            const objectConstant = displayNameConstant.find((x) => x.type === columnData.columnName);
            const displayName = columnData.columnName;
            columnData.OriginalColumnName = isOrginalColumnName ? columnData.originalColumnName : columnData.columnName;
            response.listControl.push(this.newControlWithData(columnData, displayName) as any);
        }

        response.listControl = response.listControl.sort((a, b) => a.orderBy - b.orderBy);

        return response;
    }

    protected setListComboBoxToControl(
        action: any,
        numberOfComboBox: number,
        listControl: any[],
    ): ColumnSettingReponseModel {
        const response = new ColumnSettingReponseModel();
        const listComboBox = [];
        if (numberOfComboBox === 0 || !(listControl && listControl.length)) return response;
        if (
            !action ||
            !action.payload ||
            !action.payload.data ||
            action.payload.data.statusCode !== 1 ||
            !action.payload.data.item ||
            !action.payload.data.item.Currency ||
            !action.payload.data.item.Currency.length
        )
            return response;

        action.payload.data.item.Currency.forEach((elementItem) => {
            listComboBox.push({ key: elementItem.idValue, value: elementItem.textValue });
        });

        response.numberOfComboBox = numberOfComboBox - 1;
        listControl.find((x) => x.originalColumnName === action.payload.orginalColumnName)['options'] = listComboBox;
        response.listControl = listControl;
        return response;
    }

    protected setComboboxToControl(comboboxData: ComboboxRepositoryStateModel[], ctrl: DropdownControl) {
        const listComboBox = [];
        for (let i = 0; i < comboboxData.length; i++) {
            const data = comboboxData[i];
            listComboBox.push({ key: data.idValue, value: data.textValue });
        }
        ctrl.options = listComboBox;
    }

    protected formatDate(dateStr: string): string {
        dateStr = dateStr.trim();
        let formatDateStr: string;
        let splitStr: string;
        let dateObj: Date;
        let tryingCount: number;

        if (dateStr.indexOf('.') !== -1) {
            splitStr = '.';
            dateStr = dateStr.replace(' ', '.');
        } else if (dateStr.indexOf('/') !== -1) {
            splitStr = '/';
            dateStr = dateStr.replace(' ', '/');
        } else if (dateStr.indexOf('-') !== -1) {
            splitStr = '-';
            dateStr = dateStr.replace(' ', '-');
        }

        formatDateStr = `dd${splitStr}MM${splitStr}yyyy`;
        dateObj = parse(dateStr, formatDateStr, new Date());
        tryingCount = 0;
        while (isNaN(dateObj.getTime())) {
            switch (++tryingCount) {
                case 1:
                    formatDateStr = formatDateStr = `MM${splitStr}dd${splitStr}yyyy`;
                    break;
                case 2:
                    formatDateStr = formatDateStr = `yyyy${splitStr}MM${splitStr}dd`;
                    break;
                case 3:
                    formatDateStr = formatDateStr = `yyyy${splitStr}MM${splitStr}dd`;
                    break;
                case 4:
                    formatDateStr = formatDateStr = `yyyy${splitStr}dd${splitStr}MM`;
                    break;
                default:
                    throw new Error(`cannot parse date: ${dateStr}`);
            }
            dateObj = parse(dateStr, formatDateStr, new Date());
        }
        const result = format(dateObj, 'MM/dd/yyyy'); // format following SQL
        return result;
    }

    protected areAllFieldsHaveValue(form: FormGroup): BadgeTabEnum {
        let nFieldsHaveValue = 0;
        let nUncountableField = 0;
        let fieldsLength = 0;
        Uti.iterateFormControl(form, (ctrl, ctrlName) => {
            fieldsLength++;

            if (ctrl.errors) return;

            if (isBoolean(ctrl.value)) {
                nUncountableField++;
                return;
            }
            if (ctrl.value && ctrl.value.length > 0) {
                nFieldsHaveValue++;
            }
        });

        // if form has at least 1 field that has text value then we plus uncountable fields for total fields = fieldslength
        if (nFieldsHaveValue > 0) {
            nFieldsHaveValue += nUncountableField;
        }

        if (nFieldsHaveValue && nFieldsHaveValue >= fieldsLength) {
            return BadgeTabEnum.Completed;
        }

        if (nFieldsHaveValue && nFieldsHaveValue < fieldsLength) {
            return BadgeTabEnum.Partial;
        }

        return BadgeTabEnum.None;
    }

    protected getBadgeTabForm(form: FormGroup) {
        if (!form) return () => {};

        const result = this.areAllFieldsHaveValue(form);
        return (tab: TabSummaryModel) => {
            if (!tab) return;
            tab.badgeColorChanged.next(result);
        };
    }

    protected setValueOnForm(
        currentData: ExtractedDataFormModel,
        newData: ExtractedDataFormModel,
        fieldFormOnFocus: FieldFormOnFocusModel,
    ) {
        const focusedCtrl = this.controls.find(
            (ctrl) => ctrl.controlData.originalColumnName === newData.OriginalColumnName,
        );
        if (!focusedCtrl) return;

        if (!focusedCtrl.textControlRef) {
            currentData.Value = newData.Value;
            return;
        }
        const inputElem = focusedCtrl.textControlRef.nativeElement as HTMLInputElement;

        if (newData.isDeletedOcr) {
            this.deleteTextInput(newData, fieldFormOnFocus, inputElem);

            // after delete then need to focus on cursor position has deleted
            focusedCtrl && focusedCtrl.setFocus();
        } else if (newData.WordsCoordinates && newData.WordsCoordinates.length) {
            if (inputElem.type === 'number') {
                const result = newData.Value.match(/(-)?((\d+)|(\,\d{3,3})+)+([.]\d{1,3})/g);
                if (result && result.length) {
                    newData.Value = result.join('').replace(',', '');
                }
            }

            // need to focus first, because if don't get Selection maybe get wrong focus control
            focusedCtrl && focusedCtrl.setFocus();
            this.replaceSelectionText(newData, fieldFormOnFocus, inputElem);
        }

        currentData.WordsCoordinates = cloneDeep(newData.WordsCoordinates);
        currentData.Value = newData.Value;
    }

    protected mapDataOcrStateToExtractedDataModel(
        dataState: ExtractedDataOcrState,
        extractedDataList: ExtractedDataFormModel[],
    ) {
        const foundExtractedData = extractedDataList.find(
            (item) => item.OriginalColumnName === dataState.OriginalColumnName,
        );
        if (!foundExtractedData) {
            return;
        }

        foundExtractedData.Value = dataState.Value;
        foundExtractedData.WordsCoordinates = dataState.WordsCoordinates;
    }

    protected mapControlsToExtractedDataModelList(
        controls: BaseControl<any>[],
        extractedDataList: ExtractedDataFormModel[],
    ) {
        if (!extractedDataList) extractedDataList = [];

        for (let i = 0; i < controls.length; i++) {
            const ctrl = controls[i];
            extractedDataList.push({
                ColumnName: ctrl.columnName,
                OriginalColumnName: ctrl.originalColumnName,
                Value: ctrl.value,
                WordsCoordinates: [],
                isDeletedOcr: false,
                GroupField: ctrl.groupField,
                DataType: ctrl.dataType,
                Data: null,
            });
        }

        return extractedDataList;
    }

    protected onChangeDocumentContainer(newDocumentContainerOrc: DocumentContainerOcrStateModel): void {
        if (this._documentContainerOcr) {
            this._prevDocumentContainerOrc = this._documentContainerOcr;
        }

        this._documentContainerOcr = newDocumentContainerOrc;
        this.documentProcessingType = newDocumentContainerOrc.DocumentType;
    }

    protected onFolderChangedThenInitialFormState(
        extractedData: ExtractedDataFormModel[],
        formGroup: FormGroup,
        formName: DocumentFormNameEnum,
        formatDataBeforeSavingFn: () => any,
        validateData: () => boolean,
        onInit: boolean,
    ) {
        if (!this._folder) return;

        if (
            !this._documentContainerOcr ||
            (this._prevDocumentContainerOrc &&
                this._prevDocumentContainerOrc.DocumentType === this._documentContainerOcr.DocumentType)
        ) {
            return;
        }

        this.store.dispatch(
            this.administrationActions.initialFormState({
                documentProcessingType: this._documentContainerOcr.DocumentType,
                formState: {
                    data: extractedData,
                    form: formGroup,
                    documentFormName: formName,
                    formatDataBeforeSaving: formatDataBeforeSavingFn.bind(this),
                    validateData: validateData.bind(this),
                    onInit: onInit,
                },
            }),
        );
    }

    public getListControlWithoutHidden(controls: BaseControl<any>[]): any[] {
        if (!controls || !controls.length) return [];

        return controls.filter((ctrl) => !ctrl.hidden);
    }

    public getListControlWithoutHiddenAndReadOnly(controls: BaseControl<any>[]): any[] {
        if (!controls || !controls.length) return [];

        return controls.filter((ctrl) => !ctrl.hidden && !ctrl.readOnly);
    }

    private replaceSelectionText(
        newData: ExtractedDataFormModel,
        fieldFormOnFocus: FieldFormOnFocusModel,
        focusedCtrl: HTMLInputElement,
    ) {
        const selection = Uti.getSelectionText();
        const currentValue = fieldFormOnFocus.formOnFocus.controls[fieldFormOnFocus.fieldOnFocus].value as string;

        if (!selection) {
            fieldFormOnFocus.formOnFocus.controls[fieldFormOnFocus.fieldOnFocus].setValue(newData.Value, {
                emitEvent: false,
            });
            return;
        }
        const posCursorAfterInsert = selection.start + newData.Value.length;
        if (!selection.text) {
            newData.Value =
                currentValue.substring(0, selection.start) + newData.Value + currentValue.substring(selection.start);
        } else {
            newData.Value = currentValue.replace(selection.text, newData.Value);
        }
        fieldFormOnFocus.formOnFocus.controls[fieldFormOnFocus.fieldOnFocus].setValue(newData.Value, {
            emitEvent: false,
        });

        if (focusedCtrl.type === 'text') {
            focusedCtrl.selectionEnd = posCursorAfterInsert;
        }
    }

    private deleteTextInput(
        newData: ExtractedDataFormModel,
        fieldFormOnFocus: FieldFormOnFocusModel,
        focusedCtrl: HTMLInputElement,
    ) {
        let currentValue = fieldFormOnFocus.formOnFocus.controls[fieldFormOnFocus.fieldOnFocus].value as string;
        fieldFormOnFocus.formOnFocus.controls[fieldFormOnFocus.fieldOnFocus].setValue(newData.Value, {
            emitEvent: false,
        });

        if (focusedCtrl.type === 'text') {
            let posCursorAfterDelete = newData.Value.length - 1;
            let i = 0;
            while (i < currentValue.length) {
                if (currentValue[i] !== newData.Value[i]) {
                    posCursorAfterDelete = i;
                    break;
                }
                i++;
            }
            focusedCtrl.selectionEnd = posCursorAfterDelete;
        }

        delete newData.isDeletedOcr;
    }
}
