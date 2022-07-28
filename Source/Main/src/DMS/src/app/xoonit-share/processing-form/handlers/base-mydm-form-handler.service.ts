import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Store } from '@ngrx/store';
import {
    DisplayPlaceHolderOpt,
    IMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { DocumentMetadata } from '../interfaces/document-metadata.interface';
import { DynamicField } from '../interfaces/dynamic-field.interface';
import { IOpenFormParamsAction } from '../interfaces/open-form-params-action.interface';
import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { DocumentProcessingTypeEnum, MessageModal } from '@app/app.constants';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { Observable, Subject } from 'rxjs';
import { IFormHandler } from './mydm-form-handler.interface';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { Uti } from '@app/utilities';
import {
    ColumnDefinition,
    ColumnDefinitionSetting,
    DisplayFieldSetting,
} from '@app/models/common/column-definition.model';
import { DatabaseControlType } from '../consts/database-control-type.enum';
import { MaterialControlType } from '../consts/material-control-type.enum';
import { InputMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/input-material-control-config.model';
import { DatepickerMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/datepicker-material-control-config.model';
import { SlideToggleMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/slide-toggle-material-control-config.model';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import { AutocompleteMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/autocomplete-material-control-config.model';
import { SelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/select-material-control-config.model';
import { TranslateService } from '@ngx-translate/core';
import { defaultLanguage } from '@app/app.resource';
import { ToasterService } from 'angular2-toaster';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import {
    DataState,
    ExtractedDataOcrState,
} from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import * as moment from 'moment';
import { Injector } from '@angular/core';
import { BaseMyDmFormComponent } from '../base/base-mydm-form.component';
import { MaterialControlTypeV2 } from '../../processing-form-v2/consts/material-control-type.enum';
import { CheckboxMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/checkbox-material-control-config.model';

export abstract class BaseMyDMFormHandler implements IFormHandler {
    protected _loadCompletelySubject: Subject<boolean> = new Subject<boolean>();
    protected _onDetachForm: Subject<boolean> = null;

    //#region Services Injection
    protected dynamicMaterialHelper: XnDynamicMaterialHelperService;
    protected administrationSelectors: AdministrationDocumentSelectors;
    protected administrationActions: AdministrationDocumentActions;
    protected store: Store<AppState>;
    protected translateService: TranslateService;
    protected toasterService: ToasterService;
    protected fb: FormBuilder;
    //#endregion
    protected _ocrValues = null;
    protected _qrCodeValues = null;
    public formComponent: BaseMyDmFormComponent;

    constructor(protected injector: Injector) {
        this.dynamicMaterialHelper = this.injector.get(XnDynamicMaterialHelperService);
        this.administrationSelectors = injector.get(AdministrationDocumentSelectors);
        this.administrationActions = injector.get(AdministrationDocumentActions);
        this.store = injector.get<Store<AppState>>(Store);
        this.translateService = injector.get(TranslateService);
        this.toasterService = injector.get(ToasterService);
        this.fb = injector.get(FormBuilder);
    }

    public abstract applyOcr(ocr: ExtractedDataFormModel[]): void;
    public abstract applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void;

    public setInstanceFormComponent(formComponent: BaseMyDmFormComponent) {
        this.formComponent = formComponent;
    }

    public registerCommonSubscriptions() {
        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SCAN_OCR_TEXT)
            .pipe(takeUntil(this._onDetachForm.asObservable()))
            .subscribe((action: CustomAction) => {
                this._applyScanningOcrText(
                    action.payload,
                    this.formComponent.ctrlFocusing,
                    this.formComponent.controls,
                );
            });
    }

    public listenDetachEvent(detachObservable: Observable<boolean>): void {
        // already set listener
        if (this._onDetachForm) return;

        this._onDetachForm = new Subject<boolean>();

        detachObservable.pipe(take(1)).subscribe(() => {
            this._onDetachForm.next(true);
            this._onDetachForm.complete();
            this._onDetachForm = null;
        });
    }

    public orderByControls(controls: IMaterialControlConfig[]): void {
        controls.sort(
            (currentCtrl, nextCtrl) =>
                parseInt(currentCtrl.setting?.DisplayField?.OrderBy, 10) -
                parseInt(nextCtrl.setting?.DisplayField?.OrderBy, 10),
        );
    }

    public parseFormControlDynamicFields(
        dynamicFieldsSetting: ColumnDefinition,
        dynamicFields: DynamicField[],
        dynamicControls: IMaterialControlConfig[],
    ): { [key: string]: FormControl } {
        const payload = JSON.parse(dynamicFieldsSetting.value) as any[];
        if (!dynamicFields) {
            dynamicFields = [];
        }

        const formControls: { [key: string]: any } = {};

        payload.forEach((dynamicField) => {
            const transformDynamicField = Uti.mapObjectToCamel(dynamicField) as DynamicField;
            dynamicFields.push(transformDynamicField);

            const dynamicCtrlConfig = this._buildDynamicFieldControl(
                formControls,
                transformDynamicField,
                dynamicControls.length,
            );
            dynamicControls.push(dynamicCtrlConfig);
        });

        return formControls;
    }

    public addDynamicFields(dynamicFields: DynamicField[]): FormGroup {
        if (!dynamicFields || !dynamicFields.length) return;
        const formControls: { [key: string]: FormControl } = {};
        let skipAll = true;

        for (let i = 0; i < dynamicFields.length; i++) {
            const dynamicField = dynamicFields[i];
            if (this._hasDynamicFieldNameExisted(this.formComponent.dynamicFields, dynamicField.fieldName)) {
                continue;
            }
            skipAll = false;

            const dynamicCtrlConfig = this._buildDynamicFieldControl(
                formControls,
                dynamicField,
                this.formComponent.dynamicControlConfigList.length,
            );
            this.formComponent.dynamicControlConfigList.push(dynamicCtrlConfig);
            this.formComponent.dynamicFields.push(dynamicField);
        }

        // it means that all item dynamicFields are inserted (user click on Add & Continue each item into form)
        if (skipAll) {
            return this.formComponent.formDynamic;
        }

        if (!this.formComponent.formDynamic || !Object.keys(this.formComponent.formDynamic.controls).length) {
            this.formComponent.formDynamic = this.fb.group(formControls);
        } else {
            Object.keys(formControls).forEach((key) => {
                this.formComponent.formDynamic.addControl(key, formControls[key]);
            });
        }

        return this.formComponent.formDynamic;
    }

    public removeDynamicField(config: IMaterialControlConfig) {
        const controlConfigIndex = this.formComponent.dynamicControlConfigList.indexOf(config);
        if (controlConfigIndex === -1) return;

        const dynamicFieldIndex = this.formComponent.dynamicFields.findIndex(
            (f: DynamicField) => f.fieldName === config.formControlName,
        );
        this.formComponent.dynamicFields.splice(dynamicFieldIndex, 1);
        this.formComponent.dynamicControlConfigList.splice(controlConfigIndex, 1);

        this.formComponent.formDynamic.removeControl(config.formControlName);
    }

    public updateDocumentMetadata(newMetadata: DocumentMetadata) {
        this.formComponent.documentMetadata = Object.assign({}, this.formComponent.documentMetadata, newMetadata);
    }

    public onFocusChanged($event: FocusControlEvent) {
        this.formComponent.ctrlFocusing = $event;
        this.store.dispatch(
            this.administrationActions.setFieldFormOnFocus({
                fieldOnFocus: $event.config.formControlName,
                formOnFocus: $event.form,
                documentFormName: '',
                fieldConfig: $event.config,
            }),
        );

        //this.commonService.fieldFormOnFocus = {
        //    fieldOnFocus: $event.config.formControlName,
        //    formOnFocus: cloneDeep($event.form),
        //    documentFormName: '',
        //    isFieldImageCrop: $event.config.type === MaterialControlTypeV2.IMAGE_SIGNATURE,
        //    fieldConfig: $event.config,
        //};
        //this.store.dispatch(this.administrationActions.setFieldFormOnFocus(this.commonService.fieldFormOnFocus));
    }

    public clearForm(): void {
        if (!this.formComponent.formGroup) return;
        this._setEmptyDataForm(this.formComponent.formGroup, (ctrl, ctrlName) => {
            return false;
        });
        this._setEmptyDataForm(this.formComponent.formDynamic);
    }

    public resetDataForm(): void {
        if (!this.formComponent.formGroup) return;
        const values = this._buildObjectControlValue(this.formComponent.columnSettings);
        this.formComponent.formGroup.reset(values, { onlySelf: true, emitEvent: false });
    }

    public patchValueForm(formGroup: FormGroup, values: any) {
        if (!formGroup) return;

        if (values) {
            formGroup.patchValue(values, { onlySelf: true, emitEvent: false });
        }
    }

    public validateBeforeSave(): boolean {
        this._markFormGroupTouchedAndDirty(this.formComponent.formGroup);
        this._markFormGroupDynamicFieldTouchedAndDirty(
            this.formComponent.formDynamic,
            this.formComponent.dynamicFields,
        );

        if (this.formComponent.formGroup.invalid || this.formComponent.formDynamic?.invalid) {
            this.translateService
                .get(defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid)
                .subscribe((val) => {
                    this.toasterService.pop(MessageModal.MessageType.warning, 'System', val);
                });
            return false;
        }

        return true;
    }

    protected _applyScanningOcrText(
        payload: ExtractedDataOcrState,
        ctrlFocusing: FocusControlEvent,
        controlConfigs: IMaterialControlConfig[],
    ) {
        if (!ctrlFocusing) return;

        let fieldNameFocus = ctrlFocusing.config.formControlName;
        let controlType = ctrlFocusing.config.type;
        if (payload.OriginalColumnName) {
            fieldNameFocus = payload.OriginalColumnName;
        }

        // if ctrl focusing different from payload.OrignalColumnName that means we are on focusing on ctrlA, but want to delete capture text on ctrlB
        // so we need to get control type of ctrlB and to get the right format type & value
        if (fieldNameFocus !== ctrlFocusing.config.formControlName) {
            const found = controlConfigs.find((c) => c.formControlName === fieldNameFocus);
            if (!found) return;

            controlType = found.type;
        }

        const ocrValue = payload.Value;
        if (!ocrValue) return;

        let currentValue = this._getFocusCtrlValue(ctrlFocusing.form, fieldNameFocus, controlType);
        const specialCase = this._isSpecialCaseApplyScanningOcrOnMaterialControl(ctrlFocusing);

        if (payload.DataState === DataState.DELETE) {
            currentValue = currentValue.replace(ocrValue, '');
            if (specialCase) {
                currentValue = '';
            }
        } else if (specialCase) {
            currentValue = ocrValue;
        } else {
            const selection = Uti.getSelectionText();
            if (!selection.text) {
                currentValue =
                    currentValue.substring(0, selection.start) + ocrValue + currentValue.substring(selection.start);
            } else {
                currentValue = currentValue.replace(selection.text, payload.Value);
            }
            ctrlFocusing.config.setFocus();
        }
        this.dynamicMaterialHelper.setCtrlValueByControlType(
            ctrlFocusing.form.controls[fieldNameFocus] as FormControl,
            controlType,
            currentValue,
        );
    }

    protected getMaterialControlConfig(columnSetting: ColumnDefinition) {
        let controlConfig: IMaterialControlConfig;
        const baseConfig = <IMaterialControlConfig>{
            value: columnSetting.value,
            label: columnSetting.columnName,
            formControlName: columnSetting.originalColumnName,
            placeholder: columnSetting.columnName,
            setting: columnSetting.setting,            
            maxLength: columnSetting.dataLength,
            hidden: columnSetting.setting?.DisplayField?.Hidden == '1'
        };
        const dataType =
            columnSetting.setting?.ControlType?.Type?.toLowerCase() || columnSetting.dataType.toLowerCase();
        switch (dataType) {
            case DatabaseControlType.NVARCHAR:
            case DatabaseControlType.VARCHAR:
            case '':
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.INPUT,
                    inputType: ControlInputType.TEXT,
                });
                break;

            case DatabaseControlType.DATE_TIME:
            case DatabaseControlType.DATE_TIME_PICKER:
                controlConfig = new DatepickerMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.DATEPICKER,
                    format: columnSetting.setting?.Validators?.Pattern?.Message,
                    displayPlaceHolderOpt: DisplayPlaceHolderOpt.FORMAT,
                });
                break;

            case DatabaseControlType.DECIMAL:
            case DatabaseControlType.BIG_INT:
            case DatabaseControlType.INT:
            case DatabaseControlType.MONEY:
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.INPUT,
                    inputType: ControlInputType.NUMBER,
                });
                break;

            case DatabaseControlType.BIT:
                controlConfig = new SlideToggleMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SLIDE_TOGGLE,
                });
                break;
            case DatabaseControlType.CHECKBOX:
                controlConfig = new CheckboxMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.CHECKBOX,
                });
                break;

            case DatabaseControlType.COMBOBOX:
                controlConfig = new SelectMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SELECT,
                    options: [],
                    setOptions: this.formComponent.configSelectControl.bind(this.formComponent),
                });
                break;

            case DatabaseControlType.AUTOCOMPLETE:
                controlConfig = new AutocompleteMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.AUTOCOMPLETE,
                    options: [],
                    setOptions: this.formComponent.configAutocompleteControl.bind(this.formComponent),
                });
                break;

            default:
                throw new Error(`this dataType "${dataType}" is unknown`);
        }

        return controlConfig;
    }

    public buildForm(
        columnSettings: ColumnDefinition[],
    ): { controlConfigs: IMaterialControlConfig[]; formGroup: { [key: string]: FormControl } } {
        const formGroup = {};
        const controlConfigs = columnSettings
            .filter(
                (column) =>
                    column.setting?.DisplayField?.Hidden === '0' || column.setting?.DisplayField?.ReadOnly === '0',
            )
            .sort(
                (currentCtrl, nextCtrl) =>
                    parseInt(currentCtrl.setting?.DisplayField?.OrderBy, 10) -
                    parseInt(nextCtrl.setting?.DisplayField?.OrderBy, 10),
            )
            .map((column: ColumnDefinition) => {
                const controlConfig = this.getMaterialControlConfig(column);
                if (!controlConfig) {
                    return;
                }

                controlConfig.style = this.dynamicMaterialHelper.setStyle(column);

                if (this.formComponent.shouldAddColumnToForm(column)) {
                    this.dynamicMaterialHelper.buildFormControlObject(formGroup, controlConfig);
                }
                return controlConfig;
            });

        return {
            controlConfigs,
            formGroup,
        };
    }

    protected _buildObjectOcrValue(ocr: ExtractedDataFormModel[]) {
        const objCtrlValues = {};
        ocr?.forEach?.((data: ExtractedDataFormModel) => {
            objCtrlValues[data.OriginalColumnName] = data.Value;
        });
        return objCtrlValues;
    }

    protected _buildObjectControlValue(columnSettings: ColumnDefinition[]): { [key: string]: any } {
        const objCtrlValues = {};
        columnSettings
            .filter((column) => column.setting?.DisplayField?.Hidden === '0')
            .forEach((column: ColumnDefinition) => {
                const controlConfig = this.getMaterialControlConfig(column);
                if (!controlConfig) {
                    return;
                }

                if (this.formComponent.shouldAddColumnToForm(column)) {
                    objCtrlValues[
                        `${controlConfig.formControlName}`
                    ] = this.dynamicMaterialHelper.getDefaultValueByType(controlConfig);
                }
            });

        return objCtrlValues;
    }

    protected _setEmptyDataForm(form: FormGroup, ignoreCtrl?: (ctrl: FormControl, ctrlName: string) => boolean) {
        Uti.iterateFormControl(form, (ctrl, ctrlName) => {
            const ignored = (ignoreCtrl && ignoreCtrl(ctrl, ctrlName)) || false;
            if (ignored) return;

            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => false);
        });
    }

    private _convertDataOCR(ctrlFocusing: FocusControlEvent, value: string) {
        switch (ctrlFocusing.config.type) {
            case MaterialControlType.INPUT:
                if ((ctrlFocusing.config as InputMaterialControlConfig).inputType === ControlInputType.NUMBER) {
                    return this._parseOcrTextToNumber(value);
                }

                // special case for ESRNr field
                if (ctrlFocusing.config.formControlName === 'ESRNr') {
                    return this._parseValueOfEsPNrField(value);
                }

                return value;

            case MaterialControlType.DATEPICKER:
                const _moment = moment(value, 'DD.MM.YYYY');
                if (_moment.isValid()) {
                    return value;
                }

                const dateStr = new Date(value).toLocaleDateString();
                return moment(dateStr).format('DD.MM.YYYY');

            default:
                return value;
        }
    }

    private _getFocusCtrlValue(
        formGroup: FormGroup,
        fieldName: string,
        controlType: MaterialControlType | MaterialControlTypeV2,
    ): string {
        const value = formGroup.controls[fieldName].value;
        switch (controlType) {
            case MaterialControlType.INPUT:
                return value || '';

            case MaterialControlType.DATEPICKER:
                if (value == null) {
                    return '';
                }
                const _moment = moment(value, 'DD.MM.YYYY');
                if (!_moment.isValid()) {
                    return '';
                }
                return _moment.format('DD.MM.YYYY');

            case MaterialControlType.AUTOCOMPLETE:
                return value || '';

            case MaterialControlType.SLIDE_TOGGLE:
                return '';
            
            case MaterialControlType.CHECKBOX:
                return '';

            case MaterialControlType.SELECT:
                return '';

            default:
                return '';
        }
    }

    private _isSpecialCaseApplyScanningOcrOnMaterialControl(ctrlFocusing: FocusControlEvent) {
        if (ctrlFocusing.config.type === MaterialControlType.DATEPICKER) {
            return true;
        }

        if (ctrlFocusing.config.type === MaterialControlType.INPUT) {
            if ((ctrlFocusing.config as InputMaterialControlConfig).inputType === ControlInputType.NUMBER) {
                return true;
            }
        }

        return false;
    }

    private _parseOcrTextToNumber(value: string) {
        if (!value) return '0';
        value = value.trim();
        value = value.replace(/'/g, ''); // 1'000
        const checkSeparateRealsNumberByDot = new RegExp(
            /^[\d]{1,3}(?:[\d]*(?:[.][\d]{0,})?|(?:,[\d]{3})*(?:\.[\d]{0,})?)$/,
            'g',
        ); // 10.000,00

        const checkSeparateRealsNumberByComma = new RegExp(
            /^[\d]{1,3}(?:[\d]*(?:[,][\d]{0,})?|(?:\.[\d]{3})*(?:,[\d]{0,})?)$/,
            'g',
        ); // 10,000.00
        if (checkSeparateRealsNumberByComma.test(value)) {
            // 10.000,00
            value = value.replace(/\./g, '');
            value = value.replace(/,/g, '.');
        } else if (checkSeparateRealsNumberByDot.test(value)) {
            // 10,000.00
            value = value.replace(/,/g, '');
        } else {
            value = '0';
        }

        value = Uti.transformNumberHasDecimal(value, 2);
        return value;
    }

    private _parseValueOfEsPNrField(value: string) {
        return value.replace(/(?<=\d) +(?=\d)/g, '');
    }

    protected _buildDynamicFieldControl(
        formControls: { [key: string]: FormControl },
        dynamicField: DynamicField,
        order: number,
    ) {
        const newColumnSetting = <ColumnDefinition>{
            columnName: dynamicField.fieldName,
            columnHeader: '',
            value: dynamicField.fieldValue,
            dataType: DatabaseControlType.NVARCHAR,
            dataLength: null,
            originalColumnName: dynamicField.fieldName,
            setting: <ColumnDefinitionSetting>{
                DisplayField: <DisplayFieldSetting>{
                    Hidden: '0',
                    ReadOnly: '0',
                    OrderBy: order.toString(),
                    GroupHeader: '0',
                },
            },
        };

        const controlConfig = this.getMaterialControlConfig(newColumnSetting);
        this.dynamicMaterialHelper.buildFormControlObject(formControls, controlConfig);
        formControls[controlConfig.formControlName].setValidators([Validators.required]);

        return controlConfig;
    }

    protected _hasDynamicFieldNameExisted(dynamicFields: DynamicField[], fieldName: string) {
        if (!dynamicFields || !dynamicFields.length) return false;

        return dynamicFields.findIndex((df) => df.fieldName === fieldName) !== -1;
    }

    protected _markFormGroupTouchedAndDirty(formGroup: FormGroup) {
        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }

    protected _markFormGroupDynamicFieldTouchedAndDirty(formGroup: FormGroup, dynamicFields: DynamicField[]) {
        if (!dynamicFields || !dynamicFields.length) return;

        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }
}
