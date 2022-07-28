import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
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
    IClearValueControlConfig,
    IControlConfig,
    IMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { take, takeUntil } from 'rxjs/operators';
import { DocumentMetadataV2 } from '../interfaces/document-metadata.interface';
import { DynamicFieldV2 } from '../interfaces/dynamic-field.interface';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { Observable, Subject } from 'rxjs';
import { IFormHandlerV2 } from './mydm-form-handler.interface';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { Uti } from '@app/utilities';
import {
    CallConfigSetting,
    ColumnDefinition,
    ColumnDefinitionSetting,
    DisplayFieldSetting,
} from '@app/models/common/column-definition.model';
import { DatabaseControlTypeV2 } from '../consts/database-control-type.enum';
import { MaterialControlTypeV2 } from '../consts/material-control-type.enum';
import { InputMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/input-material-control-config.model';
import { DatepickerMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/datepicker-material-control-config.model';
import { SlideToggleMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/slide-toggle-material-control-config.model';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import { AutocompleteMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/autocomplete-material-control-config.model';
import { SelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/select-material-control-config.model';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import {
    DataState,
    ExtractedDataOcrState,
} from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import * as moment from 'moment';
import { Injector } from '@angular/core';
import { BaseMyDmFormComponentV2 } from '../base/base-mydm-form.component';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { XFormConfigDefinitionV2 } from '../interfaces/x-form-config.interface';
import { XFormGroupConfigDefinitionV2 } from '../interfaces/x-form-group-config.interface';
import { CommonService } from '@app/services';
import { lowerFirst } from 'lodash-es';
import { BaseMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/base-material-control-config.model';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FormFieldDefinition } from '@app/models/common/form-field-definition.model';
import { MaterialControlType } from '../../processing-form/consts/material-control-type.enum';
import { TextareaMaterialControlConfig } from '../../../shared/components/xn-control/xn-dynamic-material-control/models/textarea-material-control-config.model';
import { RadiosMaterialControlConfig } from '../../../shared/components/xn-control/xn-dynamic-material-control/models/radios-material-control-config.model';
import { CheckboxMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/checkbox-material-control-config.model';

export abstract class BaseMyDMFormHandlerV2 implements IFormHandlerV2 {
    protected _loadCompletelySubject: Subject<boolean> = new Subject<boolean>();
    protected _onDetachForm: Subject<boolean> = null;

    //#region Services Injection
    protected dynamicMaterialHelper: XnDynamicMaterialHelperService;
    protected administrationSelectors: AdministrationDocumentSelectors;
    protected administrationActions: AdministrationDocumentActions;
    protected store: Store<AppState>;
    protected translateService: TranslateService;
    public commonService: CommonService;
    protected toasterService: ToasterService;
    protected fb: FormBuilder;
    //#endregion

    public formComponent: BaseMyDmFormComponentV2;

    constructor(protected injector: Injector) {
        this.dynamicMaterialHelper = this.injector.get(XnDynamicMaterialHelperService);
        this.administrationSelectors = injector.get(AdministrationDocumentSelectors);
        this.administrationActions = injector.get(AdministrationDocumentActions);
        this.store = injector.get<Store<AppState>>(Store);
        this.translateService = injector.get(TranslateService);
        this.toasterService = injector.get(ToasterService);
        this.commonService = injector.get(CommonService);
        this.fb = injector.get(FormBuilder);
    }

    public abstract applyOcr(ocr: ExtractedDataFormModel[], formGroup: FormGroup): void;
    public abstract applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void;

    public setInstanceFormComponent(formComponent: BaseMyDmFormComponentV2) {
        this.formComponent = formComponent;
    }

    public registerCommonSubscriptions() {
        //this.administrationSelectors
        //    .actionOfType$(AdministrationDocumentActionNames.SCAN_OCR_TEXT)
        //    .pipe(takeUntil(this._onDetachForm.asObservable()))
        //    .subscribe((action: CustomAction) => {
        //        if (!action.payload.OriginalColumnName) {
        //            if (!this.isCurrentForm()) return;
        //        }

        //        // when build dynamic form so formGroupConfigDef has only one child item formConfigDefs[0]
        //        const formDef = this.formComponent.formGroupConfigDef.formConfigDefs[0];

        //        this._applyScanningOcrText(
        //            action.payload,
        //            this.formComponent.ctrlFocusing,
        //            formDef.controlConfigs as IMaterialControlConfig[],
        //        );
        //    });
    }

    private scanOcrText(data: any) {
        if (!data.OriginalColumnName) {
            if (!this.isCurrentForm()) return;
        }

        // when build dynamic form so formGroupConfigDef has only one child item formConfigDefs[0]
        const formDef = this.formComponent.formGroupConfigDef.formConfigDefs[0];

        this._applyScanningOcrText(
            data,
            this.formComponent.ctrlFocusing,
            formDef.controlConfigs as IMaterialControlConfig[],
        );
    }

    private isCurrentForm() {
        try {
            // when build dynamic form so formGroupConfigDef has only one child item formConfigDefs[0]
            return (
                this.commonService.fieldFormOnFocus.formOnFocus['formId'] ===
                this.formComponent.formGroupConfigDef.formConfigDefs[0].formGroup['formId']
            );
        } catch (e) {
            return false;
        }
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
        dynamicFields: DynamicFieldV2[],
        dynamicControls: IMaterialControlConfig[],
    ): { [key: string]: FormControl } {
        const payload = JSON.parse(dynamicFieldsSetting.value) as any[];
        if (!dynamicFields) {
            dynamicFields = [];
        }

        const formControls: { [key: string]: any } = {};

        payload.forEach((dynamicField) => {
            const transformDynamicField = Uti.mapObjectToCamel(dynamicField) as DynamicFieldV2;
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

    public addDynamicFields(dynamicFields: DynamicFieldV2[]): FormGroup {
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
            (f: DynamicFieldV2) => f.fieldName === config.formControlName,
        );
        this.formComponent.dynamicFields.splice(dynamicFieldIndex, 1);
        this.formComponent.dynamicControlConfigList.splice(controlConfigIndex, 1);

        this.formComponent.formDynamic.removeControl(config.formControlName);
    }

    public updateDocumentMetadata(newMetadata: DocumentMetadataV2) {
        this.formComponent.documentMetadata = Object.assign({}, this.formComponent.documentMetadata, newMetadata);
    }

    public onFocusChanged($event: FocusControlEvent) {
        this.formComponent.ctrlFocusing = $event;
        this.commonService.fieldFormOnFocus = {
            fieldOnFocus: $event.config.formControlName,
            formOnFocus: $event.form,
            documentFormName: '',
            isFieldImageCrop: $event.config.type === MaterialControlTypeV2.IMAGE_SIGNATURE,
            fieldConfig: $event.config,
            callback: (data) => this.scanOcrText(data)
        };
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(this.commonService.fieldFormOnFocus));
    }

    public clearAllForms(formGroupDef: XFormGroupConfigDefinitionV2): void {
        if (!formGroupDef) return;

        if (!formGroupDef.formConfigDefs || !formGroupDef.formConfigDefs.length) return;

        const length = formGroupDef.formConfigDefs.length;
        for (let i = 0; i < length; i++) {
            const formConfigDef = formGroupDef.formConfigDefs[i];

            if (!formConfigDef.columnDefinitions || !formConfigDef.columnDefinitions.length) continue;

            const colsLength = formConfigDef.controlConfigs.length;
            for (let colIdx = 0; colIdx < colsLength; colIdx++) {
                const ctrlConfig = formConfigDef.controlConfigs[colIdx];

                if (
                    !ctrlConfig.setting ||
                    !ctrlConfig.setting.DisplayField ||
                    ctrlConfig.setting.DisplayField.Hidden === '1'
                ) {
                    // if control has implemented IClearValueControlConfigType interface
                    if (this._isIClearValueControlConfigType(ctrlConfig)) {
                        ctrlConfig.clearForm();
                    }

                    continue;
                }

                // if this ctrlConfig is not BaseMaterialControlConfig (maybe is AddressLoookupConfig, ...)
                if (!(ctrlConfig instanceof BaseMaterialControlConfig)) {
                    continue;
                }

                // else is xn-material-control
                if (formConfigDef.formGroup.controls.hasOwnProperty(ctrlConfig.formControlName)) {
                    const val = this.dynamicMaterialHelper.getDefaultEmptyValue(ctrlConfig);
                    if (formConfigDef.formGroup.controls[ctrlConfig.formControlName].enabled) {
                        formConfigDef.formGroup.controls[ctrlConfig.formControlName].reset(val, {
                            onlySelf: true,
                        });
                    }
                }
            }
        }
    }

    public clearForm(): void {
        const formGroupDef = this.formComponent.formGroupConfigDef;
        if (!formGroupDef) return;
        if (!formGroupDef.formConfigDefs || !formGroupDef.formConfigDefs.length) return;

        const length = formGroupDef.formConfigDefs.length;
        for (let i = 0; i < length; i++) {
            const formConfigDef = formGroupDef.formConfigDefs[i];
            this._setEmptyDataForm(formConfigDef.formGroup, (ctrl, ctrlName) => {
                return false;
            });
        }
        // this._setEmptyDataForm(this.formComponent.formGroup, (ctrl, ctrlName) => {
        //     return false;
        // });
        // this._setEmptyDataForm(this.formComponent.formDynamic);
    }

    public resetDataForm(): void {
        // if (!this.formComponent.formGroup) return;
        // const values = this._buildObjectControlValue(this.formComponent.columnSettings);
        // this.formComponent.formGroup.reset(values, { onlySelf: true, emitEvent: false });
        const formGroupDef = this.formComponent.formGroupConfigDef;
        if (!formGroupDef) return;

        if (!formGroupDef.formConfigDefs || !formGroupDef.formConfigDefs.length) return;

        const length = formGroupDef.formConfigDefs.length;
        for (let i = 0; i < length; i++) {
            const formConfigDef = formGroupDef.formConfigDefs[i];

            if (!formConfigDef.columnDefinitions || !formConfigDef.columnDefinitions.length) continue;

            const colsLength = formConfigDef.controlConfigs.length;
            for (let colIdx = 0; colIdx < colsLength; colIdx++) {
                const ctrlConfig = formConfigDef.controlConfigs[colIdx];

                if (
                    !ctrlConfig.setting ||
                    !ctrlConfig.setting.DisplayField ||
                    ctrlConfig.setting.DisplayField.Hidden === '1'
                ) {
                    // if control has implemented IClearValueControlConfigType interface
                    if (this._isIClearValueControlConfigType(ctrlConfig)) {
                        ctrlConfig.clearForm();
                    }

                    continue;
                }

                // if this ctrlConfig is not BaseMaterialControlConfig (maybe is AddressLoookupConfig, ...)
                if (!(ctrlConfig instanceof BaseMaterialControlConfig)) {
                    continue;
                }

                // else is xn-material-control
                if (formConfigDef.formGroup.controls.hasOwnProperty(ctrlConfig.formControlName)) {
                    const val = this.dynamicMaterialHelper.getDefaultValueByType(ctrlConfig);
                    formConfigDef.formGroup.controls[ctrlConfig.formControlName].reset(val, {
                        onlySelf: true,
                    });
                    formConfigDef.formGroup.controls[ctrlConfig.formControlName].setErrors(null);
                }
            }
        }
    }

    public patchValueForm(formGroup: FormGroup, values: any) {
        if (!formGroup) return;

        if (values) {
            formGroup.patchValue(values, { onlySelf: true, emitEvent: false });
        }
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

    protected getMaterialControlConfig(columnSetting: ColumnDefinition): IControlConfig {
        let controlConfig: IControlConfig;
        const baseConfig = <IMaterialControlConfig>{
            value: columnSetting.value,
            label: columnSetting.columnName,
            formControlName: columnSetting.originalColumnName,
            placeholder: columnSetting.columnName,
            setting: columnSetting.setting,
            maxLength: columnSetting.dataLength,
            icon: columnSetting.setting?.DisplayField?.Icon,
            hidden: columnSetting.setting?.DisplayField?.Hidden == '1',
        };
        const dataType =
            columnSetting.setting?.ControlType?.Type?.toLowerCase() || columnSetting.dataType?.toLowerCase() || '';

        switch (dataType) {
            case DatabaseControlTypeV2.NVARCHAR:
            case DatabaseControlTypeV2.VARCHAR:
            case DatabaseControlTypeV2.TEXT:
            case '':
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.INPUT,
                    inputType: ControlInputType.TEXT,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.TEXT_AREA:
                controlConfig = new TextareaMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.INPUT,
                    inputType: ControlInputType.TEXT_AREA,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                    cols: columnSetting.setting?.ControlType?.Cols
                        ? Number(columnSetting.setting?.ControlType?.Cols)
                        : 4,
                    rows: columnSetting.setting?.ControlType?.Rows
                        ? Number(columnSetting.setting?.ControlType?.Rows)
                        : 3,
                    isResize:
                        !columnSetting.setting?.ControlType?.IsResize ||
                        (columnSetting.setting?.ControlType?.IsResize &&
                            columnSetting.setting?.ControlType?.IsResize.toLocaleLowerCase() == 'true'),
                });
                break;

            case DatabaseControlTypeV2.DATE_TIME:
            case DatabaseControlTypeV2.DATE_TIME_PICKER:
                controlConfig = new DatepickerMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.DATEPICKER,
                    format: columnSetting.setting?.Validators?.Pattern?.Message,
                    displayPlaceHolderOpt: DisplayPlaceHolderOpt.FORMAT,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                    maxLength: 10,
                });
                break;

            case DatabaseControlTypeV2.BIG_INT:
            case DatabaseControlTypeV2.INT:
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.INPUT,
                    inputType: ControlInputType.INTEGER,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.DECIMAL:
            case DatabaseControlTypeV2.MONEY:
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.INPUT,
                    inputType: ControlInputType.NUMBER,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.BIT:
                controlConfig = new SlideToggleMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.SLIDE_TOGGLE,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.CHECKBOX:
                controlConfig = new CheckboxMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.CHECKBOX,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.RADIO:
                controlConfig = new RadiosMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.RADIO_BUTTON,
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.COMBOBOX:
                controlConfig = new SelectMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.SELECT,
                    options: [],
                    setOptions: this.formComponent.configSelectControl.bind(this.formComponent),
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.AUTOCOMPLETE:
                controlConfig = new AutocompleteMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlTypeV2.AUTOCOMPLETE,
                    options: [],
                    setOptions: this.formComponent.configAutocompleteControl.bind(this.formComponent),
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;

            case DatabaseControlTypeV2.IMAGE_SIGNATURE:
                delete baseConfig.maxLength;
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.IMAGE_SIGNATURE,
                });
                break;
            case DatabaseControlTypeV2.HTML_INPUT:
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.HTML_INPUT,
                });
                break;
            case DatabaseControlTypeV2.SELECT_SEARCH:
                controlConfig = new SelectMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SELECT_SEARCH,
                    options: [],
                    setOptions: this.formComponent.configSelectControl.bind(this.formComponent),
                    databaseControlType: dataType as DatabaseControlTypeV2,
                });
                break;
            default:
                throw new Error(`this dataType "${dataType}" is unknown`);
        }

        return controlConfig;
    }

    public buildFormGroupDefinition(formGroupDefinition: DynamicFormGroupDefinition): XFormGroupConfigDefinitionV2 {
        const formGroupConfigDef: XFormGroupConfigDefinitionV2 = {
            methodName: formGroupDefinition.methodName,
            object: formGroupDefinition.object,
            formConfigDefs: [],
        };

        if (
            !formGroupDefinition ||
            // !formGroupDefinition.methodName ||
            !formGroupDefinition.formDefinitions ||
            !formGroupDefinition.formDefinitions.length
        ) {
            return formGroupConfigDef;
        }

        for (let i = 0; i < formGroupDefinition.formDefinitions.length; i++) {
            const formDef = formGroupDefinition.formDefinitions[i] as FormFieldDefinition;

            if (!formDef.columnDefinitions || !formDef.columnDefinitions.length) continue;

            const { formGroup, controlConfigs } = this.buildForm(formDef.columnDefinitions);
            const xFormConfigDef = <XFormConfigDefinitionV2>{
                formCtrls: formGroup,
                controlConfigs,
                title: formDef.title,
                customStyle: (formDef.customStyle && JSON.parse(formDef.customStyle)) || null,
                customClass: formDef.customClass,
                formGroup: this.fb.group(formGroup),
                columnDefinitions: formDef.columnDefinitions,
            };
            xFormConfigDef.formGroup['formId'] = Uti.guid();
            formGroupConfigDef.formConfigDefs.push(xFormConfigDef);
        }

        return formGroupConfigDef;
    }

    public buildForm(
        columnSettings: ColumnDefinition[],
    ): { controlConfigs: IControlConfig[]; formGroup: { [key: string]: FormControl } } {
        const formGroup = {};
        const controlConfigs = columnSettings
            .filter((column) => this.formComponent.shouldAddColumnToForm(column))
            .map((column: ColumnDefinition) => {
                const controlConfig = this.getMaterialControlConfig(column);
                if (!controlConfig) {
                    return;
                }

                controlConfig.style = this.dynamicMaterialHelper.setStyle(column);
                controlConfig.class = column.setting?.CustomClass;

                if (this.dynamicMaterialHelper.isIMaterialControlConfig(controlConfig)) {
                    this.dynamicMaterialHelper.buildFormControlObject(formGroup, controlConfig);

                    this.formComponent.middlewareMaterialControlConfigFn &&
                        this.formComponent.middlewareMaterialControlConfigFn({
                            config: controlConfig,
                            columnDefinitions: columnSettings,
                        });
                }

                return controlConfig;
            })
            .sort(
                (currentCtrl, nextCtrl) =>
                    parseInt(currentCtrl.setting?.DisplayField?.OrderBy, 10) -
                    parseInt(nextCtrl.setting?.DisplayField?.OrderBy, 10),
            );

        return {
            controlConfigs,
            formGroup,
        };
    }

    public buildFormGroupDefinitionForSaving(
        xFormGroupConfigDef: XFormGroupConfigDefinitionV2,
        hiddenValues: { [key: string]: any },
    ): DynamicFormGroupDefinition {
        if (!this._validateXFormGroupDefBeforeBuild(xFormGroupConfigDef)) {
            return null;
        }

        const formGroupDef: DynamicFormGroupDefinition = {
            methodName: xFormGroupConfigDef.methodName,
            object: xFormGroupConfigDef.object,
            formDefinitions: [],
        };

        const xFormConfigDefs = xFormGroupConfigDef.formConfigDefs;
        for (let i = 0; i < xFormConfigDefs.length; i++) {
            const formConfigDef = xFormConfigDefs[i];

            if (!formConfigDef.columnDefinitions || !formConfigDef.columnDefinitions.length) {
                continue;
            }

            const formDef = <FormFieldDefinition>{
                title: formConfigDef.title,
                columnDefinitions: [],
            };

            const length = formConfigDef.columnDefinitions.length;
            for (let colDefIdx = 0; colDefIdx < length; colDefIdx++) {
                const colDef = formConfigDef.columnDefinitions[colDefIdx];
                const formControls = formConfigDef.formGroup.controls;
                let formCtrl: FormControl;

                if (formControls.hasOwnProperty(colDef.originalColumnName)) {
                    formCtrl = formControls[colDef.originalColumnName] as FormControl;
                    this._setValueForControl(colDef, formCtrl, hiddenValues);
                }

                formDef.columnDefinitions.push(colDef);
            }

            formGroupDef.formDefinitions.push(formDef);
        }

        return formGroupDef;
    }

    public buildJsonForSaving(
        xFormGroupConfigDef: XFormGroupConfigDefinitionV2,
        hiddenValues: { [key: string]: any },
    ): { [key: string]: any } {
        if (!this._validateXFormGroupDefBeforeBuild(xFormGroupConfigDef)) {
            return null;
        }

        const json = new Map<string, any>();

        const formGroupDef: DynamicFormGroupDefinition = {
            methodName: xFormGroupConfigDef.methodName,
            object: xFormGroupConfigDef.object,
            formDefinitions: [],
        };

        const xFormConfigDefs = xFormGroupConfigDef.formConfigDefs;
        for (let i = 0; i < xFormConfigDefs.length; i++) {
            const formConfigDef = xFormConfigDefs[i];

            if (!formConfigDef.columnDefinitions || !formConfigDef.columnDefinitions.length) {
                continue;
            }

            const length = formConfigDef.columnDefinitions.length;
            for (let colDefIdx = 0; colDefIdx < length; colDefIdx++) {
                const colDef = formConfigDef.columnDefinitions[colDefIdx];
                const formControls = formConfigDef.formGroup.controls;
                let formCtrl: FormControl;

                formCtrl = formControls[colDef.originalColumnName] as FormControl;
                this._setValueForJson(json, colDef, formCtrl, hiddenValues);
            }
        }
        const data = {};

        json.forEach((value: any, key: string) => {
            data[key] = value;
        });

        return data;
    }

    protected _buildObjectOcrValue(ocr: ExtractedDataFormModel[]) {
        const objCtrlValues = {};
        ocr.forEach((data: ExtractedDataFormModel) => {
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
                if (!controlConfig || !this.dynamicMaterialHelper.isIMaterialControlConfig(controlConfig)) {
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

    private _getFocusCtrlValue(
        formGroup: FormGroup,
        fieldName: string,
        controlType: MaterialControlType | MaterialControlTypeV2,
    ): string {
        const value = formGroup.controls[fieldName].value;
        switch (controlType) {
            case MaterialControlTypeV2.INPUT:
                return value || '';

            case MaterialControlTypeV2.DATEPICKER:
                if (value == null) {
                    return '';
                }
                return this._parseDateToFormat(value, 'DD.MM.YYYY');

            case MaterialControlTypeV2.AUTOCOMPLETE:
                return value || '';

            case MaterialControlTypeV2.SLIDE_TOGGLE:
                return '';

            case MaterialControlTypeV2.SELECT:
                return '';

            default:
                return '';
        }
    }

    private _isSpecialCaseApplyScanningOcrOnMaterialControl(ctrlFocusing: FocusControlEvent) {
        if (ctrlFocusing.config.type === MaterialControlTypeV2.DATEPICKER) {
            return true;
        }

        if (ctrlFocusing.config.type === MaterialControlTypeV2.INPUT) {
            if ((ctrlFocusing.config as InputMaterialControlConfig).inputType === ControlInputType.NUMBER) {
                return true;
            }
        }

        if (ctrlFocusing.config.type === MaterialControlTypeV2.IMAGE_SIGNATURE) {
            return true;
        }

        return false;
    }

    protected _buildDynamicFieldControl(
        formControls: { [key: string]: FormControl },
        dynamicField: DynamicFieldV2,
        order: number,
    ) {
        const newColumnSetting = <ColumnDefinition>{
            columnName: dynamicField.fieldName,
            columnHeader: '',
            value: dynamicField.fieldValue,
            dataType: DatabaseControlTypeV2.NVARCHAR,
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

        const controlConfig = this.getMaterialControlConfig(newColumnSetting) as IMaterialControlConfig;
        this.dynamicMaterialHelper.buildFormControlObject(formControls, controlConfig);
        formControls[controlConfig.formControlName].setValidators([Validators.required]);

        return controlConfig;
    }

    protected _hasDynamicFieldNameExisted(dynamicFields: DynamicFieldV2[], fieldName: string) {
        if (!dynamicFields || !dynamicFields.length) return false;

        return dynamicFields.findIndex((df) => df.fieldName === fieldName) !== -1;
    }

    protected _markFormGroupTouchedAndDirty(formGroup: FormGroup) {
        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }

    protected _markFormGroupDynamicFieldTouchedAndDirty(formGroup: FormGroup, dynamicFields: DynamicFieldV2[]) {
        if (!dynamicFields || !dynamicFields.length) return;

        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }

    private _validateXFormGroupDefBeforeBuild(xFormGroupConfigDef: XFormGroupConfigDefinitionV2) {
        if (!xFormGroupConfigDef) return false;

        // if do not has methodName
        // if (!xFormGroupConfigDef.methodName || !xFormGroupConfigDef.methodName.trim()) return false;

        // if do not has xFormConfigDefs array
        if (!xFormGroupConfigDef.formConfigDefs || !xFormGroupConfigDef.formConfigDefs.length) return false;

        const xFormConfigDefs = xFormGroupConfigDef.formConfigDefs;

        // validate to make sure all formGroup are valid
        const formValid = xFormConfigDefs.reduce((allValid: boolean, xFormConfigDef: XFormConfigDefinitionV2) => {
            if (!xFormConfigDef.formGroup || xFormConfigDef.formGroup.invalid) {
                allValid = false;
            }

            return allValid;
        }, true);

        // has at least 1 form is invalid. Return
        if (!formValid) {
            return false;
        }

        return true;
    }

    private _setValueForJson(
        json: Map<string, any>,
        colDef: ColumnDefinition,
        formCtrl: FormControl,
        hiddenValues: { [key: string]: any },
    ) {
        if (!colDef || !colDef.setting) {
            return;
        }

        if (!colDef.setting.DisplayField) {
            return;
        }

        if (!colDef.setting.CallConfigs || !colDef.setting.CallConfigs.length) {
            return;
        }

        let value: any;

        // but this field is hidden on UI
        if (colDef.setting.DisplayField.Hidden === '1') {
            value = formCtrl?.value || colDef.value;
            if (!value) {
                value = this._getValueFromHiddenValues(colDef, hiddenValues);
            }
        } else {
            // this field is shown on UI
            value = formCtrl.value;
        }

        value = this._formatValueBeforeSaving(colDef, value);

        const length = colDef.setting.CallConfigs.length;
        for (let i = 0; i < length; i++) {
            const callConfig = colDef.setting.CallConfigs[i];
            if (!callConfig.JsonText) continue;

            this._setJsonValue(json, callConfig, value);
        }
    }

    private _getValueFromHiddenValues(colDef: ColumnDefinition, hiddenValues: { [key: string]: any }) {
        let value: any;

        const camelCaseFieldName = lowerFirst(colDef.originalColumnName);
        const camelCaseOriginalColumnName = lowerFirst(colDef.originalColumnName);

        // check hiddenValues object has own this field name
        if (hiddenValues.hasOwnProperty(camelCaseFieldName)) {
            value = hiddenValues[camelCaseFieldName];
        } else if (hiddenValues.hasOwnProperty(camelCaseOriginalColumnName)) {
            value = hiddenValues[camelCaseOriginalColumnName];
        } else {
            for (let i = 0; i < colDef.setting.CallConfigs?.length; i++) {
                const callConfig = colDef.setting.CallConfigs[i];
                const camelCaseAliasName = lowerFirst(callConfig.Alias);
                if (hiddenValues.hasOwnProperty(camelCaseAliasName)) {
                    value = hiddenValues[camelCaseAliasName];
                    break;
                }
            }
        }

        return value;
    }

    private _setJsonValue(json: Map<string, any>, callConfig: CallConfigSetting, value: any) {
        if (json.has(callConfig.JsonText.Name) === false) {
            this._insertValueIntoJsonArray(json, callConfig, value);
        } else {
            const jsonObjectWrapper = json.get(callConfig.JsonText.Name);
            this._appendValueIntoJsonArray(jsonObjectWrapper, callConfig, value);
        }

        // this._appendValueIntoJsonObject(json, callConfig, value);
    }

    private _appendValueIntoJsonObject(json: Map<string, any>, callConfig: CallConfigSetting): void {
        if (callConfig.IsExtParam == false) {
            return;
        }

        json.set(callConfig.Alias, callConfig.Value);
    }

    private _insertValueIntoJsonArray(json: Map<string, any>, callConfig: CallConfigSetting, value: any): void {
        if (json == null) return;
        if (callConfig.IsExtParam == true) {
            json.set(callConfig.Alias, value);
            return;
        }

        const firstParam = {};
        firstParam[callConfig.Alias] = value;

        // e.g: sample
        // JSONMainDocument: {
        //   MainDocument: [{...}]
        // }
        const jsonObjectWrapper = {
            [callConfig.JsonText.Path]: [firstParam],
        };

        json.set(callConfig.JsonText.Name, jsonObjectWrapper);
    }

    private _appendValueIntoJsonArray(
        jsonObjectWrapper: { [key: string]: any },
        callConfig: CallConfigSetting,
        value: any,
    ): void {
        if (callConfig.IsExtParam == true) return;

        if (jsonObjectWrapper.hasOwnProperty(callConfig.JsonText.Path) === false) {
            return;
        }

        const jsonTextPathObject = (jsonObjectWrapper[callConfig.JsonText.Path] as any[]) || [];

        // if this property has not existed in jsonTextPath object
        if (!jsonTextPathObject.length) {
            const firstParam = {
                [callConfig.Alias]: value,
            };
            jsonTextPathObject.push(firstParam);
            return;
        }

        // has existed then update new value
        jsonTextPathObject[0][callConfig.Alias] = value;
    }

    private _setValueForControl(colDef: ColumnDefinition, formCtrl: FormControl, hiddenValues: { [key: string]: any }) {
        let value: any;

        // but this field is hidden on UI
        if (colDef.setting.DisplayField.Hidden === '1') {
            const camelCaseFieldName = lowerFirst(colDef.originalColumnName);

            // check hiddenValues object has own this field name
            if (hiddenValues.hasOwnProperty(camelCaseFieldName)) {
                value = hiddenValues[camelCaseFieldName];
                colDef.value = value;
                formCtrl.setValue(value, { onlySelf: false, emitEvent: false, emitModelToViewChange: false });
                this.commonService.setCallConfigValueForColDef(colDef, formCtrl.value);
            }
            return;
        }

        colDef.value = formCtrl.value;
        value = formCtrl.value;
        this._setCallConfigValueForColDef(colDef, formCtrl.value);
    }

    private _setCallConfigValueForColDef(colDef: ColumnDefinition, value: any): void {
        if (!colDef || !colDef.setting || (!colDef.setting.CallConfigs && colDef.setting.CallConfigs.length)) {
            return;
        }

        const length = colDef.setting.CallConfigs.length;
        for (let index = 0; index < length; index++) {
            const callConfig = colDef.setting.CallConfigs[index];
            callConfig.Value = value;
        }
    }

    private _formatValueBeforeSaving(colDef: ColumnDefinition, value: any): string {
        if (typeof value === 'undefined' || value == null) {
            return value;
        }

        if ((!colDef.setting || !colDef.setting.ControlType || !colDef.setting.ControlType.Type) && !colDef.dataType) {
            return value;
        }

        const dataType = colDef.setting?.ControlType?.Type?.toLowerCase() || colDef.dataType.toLowerCase();

        switch (dataType) {
            case DatabaseControlTypeV2.NVARCHAR:
            case DatabaseControlTypeV2.VARCHAR:
            case DatabaseControlTypeV2.TEXT:
            case '':
                return value + '';

            case DatabaseControlTypeV2.DATE_TIME:
            case DatabaseControlTypeV2.DATE_TIME_PICKER:
                return this._parseDateToFormat(value, 'YYYY-MM-DD');

            case DatabaseControlTypeV2.DECIMAL:
            case DatabaseControlTypeV2.BIG_INT:
            case DatabaseControlTypeV2.INT:
            case DatabaseControlTypeV2.MONEY:
                return value;

            case DatabaseControlTypeV2.BIT:
            case DatabaseControlTypeV2.CHECKBOX:
                return coerceBooleanProperty(value) ? '1' : '0';

            case DatabaseControlTypeV2.COMBOBOX:
                return value;

            case DatabaseControlTypeV2.AUTOCOMPLETE:
                return value;

            default:
                return value;
        }
    }

    private _isIClearValueControlConfigType(control: any): control is IClearValueControlConfig {
        return 'clearForm' in control;
    }

    private _parseDateToFormat(value: string | Date, format: string): string {
        let _moment = moment(value, format);
        if (_moment.isValid()) {
            if (typeof value === 'string') {
                return value;
            }

            return _moment.format(format);
        }

        const dateStr = new Date(value).toLocaleDateString();
        _moment = moment(dateStr);
        if (!_moment.isValid()) {
            return '';
        }

        return _moment.format(format);
    }
}
