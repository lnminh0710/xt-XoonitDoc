import { Directive, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import {
    ColumnDefinition,
    ColumnDefinitionSetting,
    DisplayFieldSetting,
    ValidatorsSetting,
    PatternValidator,
} from '@app/models/common/column-definition.model';
import {
    IMaterialControlConfig,
    IInputMaterialControlConfig,
    IDatepickerMaterialControlConfig,
    DisplayPlaceHolderOpt,
    ISelectMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { DatabaseControlType } from '@widget/components/widget-mydm-form/consts/database-control-type.enum';
import { MaterialControlType } from '@widget/components/widget-mydm-form/consts/material-control-type.enum';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import { InputMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/input-material-control-config.model';
import { DatepickerMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/datepicker-material-control-config.model';
import { SlideToggleMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/slide-toggle-material-control-config.model';
import { SelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/select-material-control-config.model';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { FolderCapturedChangeModel } from '@app/models/administration-document/document-form/folder-captured-change.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import * as moment from 'moment';
import { isDate, isBoolean, isNumber, isString } from 'util';
import { Uti } from '@app/utilities';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { PatternSetting } from '@widget/components/widget-document-form/control-model/base-control.model';
import { AutocompleteMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/autocomplete-material-control-config.model';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { QrCodeModel } from '@app/models/administration-document/document-form/qr-code.model';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import {
    ExtractedDataOcrState,
    DataState,
} from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Module } from '@app/models';
import { DynamicField } from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { MaterialControlTypeV2 } from '../../processing-form-v2/consts/material-control-type.enum';

@Directive()
export abstract class BaseMyDmFormComponent extends BaseComponent implements OnDestroy {
    public formGroup: FormGroup;
    public currentModule: Module;
    public documentContainerOcr: DocumentContainerOcrStateModel;
    public controls: IMaterialControlConfig[] = [];
    public isShowUI = false;

    public columnSettings: ColumnDefinition[] = [];
    public ctrlFocusing: FocusControlEvent;
    public dynamicFields: DynamicField[];
    public dynamicControlConfigList: IMaterialControlConfig[];
    public formDynamic: FormGroup;
    public documentMetadata: DocumentMetadata;
    public dynamicMaterialHelper: XnDynamicMaterialHelperService;

    private readonly _checkSeparateRealsNumberByDot = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[.][\d]{0,})?|(?:,[\d]{3})*(?:\.[\d]{0,})?)$/,
        'g',
    ); // 10.000,00

    private readonly _checkSeparateRealsNumberByComma = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[,][\d]{0,})?|(?:\.[\d]{3})*(?:,[\d]{0,})?)$/,
        'g',
    ); // 10,000.00

    constructor(protected router: Router, protected injector: Injector) {
        super(router);
        this.currentModule = this.ofModule;
    }

    public ngOnDestroy() {
        this.onDestroy();
    }

    public configSelectControl(selectCtrl: ISelectMaterialControlConfig): void {}
    public configAutocompleteControl(autocompleteCtrl: IAutocompleteMaterialControlConfig): void {}
    public shouldAddColumnToForm(columnSetting: ColumnDefinition): boolean {
        return false;
    }

    protected isColumnHeader(columnSetting: ColumnDefinition) {
        if (columnSetting.columnName.startsWith('**') && columnSetting.columnName.endsWith('**')) {
            return true;
        }
        return false;
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
            case DatabaseControlType.CHECKBOX:
                controlConfig = new SlideToggleMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SLIDE_TOGGLE,
                });
                break;

            case DatabaseControlType.COMBOBOX:
                controlConfig = new SelectMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SELECT,
                    options: [],
                    setOptions: this.configSelectControl.bind(this),
                });
                break;

            case DatabaseControlType.AUTOCOMPLETE:
                controlConfig = new AutocompleteMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.AUTOCOMPLETE,
                    options: [],
                    setOptions: this.configAutocompleteControl.bind(this),
                });
                break;

            case DatabaseControlType.HTML_INPUT:
                controlConfig = new InputMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.HTML_INPUT,
                });
                break;
            case DatabaseControlType.SELECT_SEARCH:
                controlConfig = new SelectMaterialControlConfig({
                    ...baseConfig,
                    type: MaterialControlType.SELECT_SEARCH,
                    options: [],
                    setOptions: this.configSelectControl.bind(this),
                });
                break;
            default:
                throw new Error(`this dataType "${dataType}" is unknown`);
        }

        return controlConfig;
    }

    protected buildForm(
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

                if (this.shouldAddColumnToForm(column)) {
                    this.dynamicMaterialHelper.buildFormControlObject(formGroup, controlConfig);
                }
                return controlConfig;
            });

        return {
            controlConfigs,
            formGroup,
        };
    }

    protected buildObjectControlValue(columnSettings: ColumnDefinition[]): { [key: string]: any } {
        const objCtrlValues = {};
        columnSettings
            .filter((column) => column.setting?.DisplayField?.Hidden === '0')
            .forEach((column: ColumnDefinition) => {
                const controlConfig = this.getMaterialControlConfig(column);
                if (!controlConfig) {
                    return;
                }

                if (this.shouldAddColumnToForm(column)) {
                    objCtrlValues[
                        `${controlConfig.formControlName}`
                    ] = this.dynamicMaterialHelper.getDefaultValueByType(controlConfig);
                }
            });

        return objCtrlValues;
    }

    protected buildObjectOcrValue(ocr: ExtractedDataFormModel[]) {
        const objCtrlValues = {};
        ocr.forEach((data: ExtractedDataFormModel) => {
            objCtrlValues[data.OriginalColumnName] = data.Value;
        });

        return objCtrlValues;
    }

    protected orderByControls(controls: IMaterialControlConfig[]) {
        controls.sort(
            (currentCtrl, nextCtrl) =>
                parseInt(currentCtrl.setting?.DisplayField?.OrderBy, 10) -
                parseInt(nextCtrl.setting?.DisplayField?.OrderBy, 10),
        );
    }

    protected getMainDocumentInfo(
        folder: DocumentTreeModel,
        documentContainerOcr: DocumentContainerOcrStateModel,
        idsStoreForUpdate: {
            IdMainDocument: string;
            IdDocumentTreeMedia: string;
            IdDocumentTree: string;
            OldFolder?: DocumentTreeModel;
            NewFolder?: DocumentTreeModel;
        },
        metadata: DocumentMetadata,
    ): {
        dataMainDocument: MainDocumentModel;
        dataDocumentTreeMedia: DocumentTreeMediaModel;
        folderChange: FolderCapturedChangeModel;
    } {
        const documentTreeMediaModel = folder
            ? this.formatJsonDocumentTreeMedia(
                  folder,
                  idsStoreForUpdate,
                  documentContainerOcr,
                  metadata?.originalFileName,
              )
            : null;
        const isValidJsonDocumentTreeMedia = documentTreeMediaModel
            ? this.validateJsonDocumentTreeMedia(documentTreeMediaModel)
            : false;

        if (!isValidJsonDocumentTreeMedia) return null;

        const mainDocumentModel = folder
            ? this.formatJsonMainDocument(
                  folder,
                  idsStoreForUpdate,
                  documentContainerOcr,
                  metadata?.keyword,
                  metadata?.toDos,
                  metadata?.isTodo,
              )
            : null;
        const isValidJsonMain = mainDocumentModel ? this.validateJsonMainDocument(mainDocumentModel) : false;

        if (!isValidJsonMain) return null;

        let folderChange: FolderCapturedChangeModel = null;

        // in case of change folder
        if (
            idsStoreForUpdate.NewFolder &&
            idsStoreForUpdate.NewFolder.idDocument.toString() !== mainDocumentModel.mainDocumentTree.idDocumentTree
        ) {
            folderChange = {
                idDocumentTree: idsStoreForUpdate.NewFolder.idDocument.toString(),
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
            folderChange: folderChange,
        };
    }

    protected objHasValue(obj: any): boolean {
        if (!obj) return false;

        let hasValue = false;
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value && value.length) {
                    hasValue = true;
                    break;
                }
            }
        }
        return hasValue;
    }

    protected assignFormControlToModel(formControls: { [key: string]: FormControl }, model: any) {
        Object.keys(formControls).forEach((key: string) => {
            const ctrlName = Uti.lowerCaseFirstLetter(key);

            if (isDate(formControls[key].value)) {
                model[ctrlName] = moment(formControls[key].value).format('YYYY-MM-DD');
            } else if (isBoolean(formControls[key].value)) {
                model[ctrlName] = formControls[key].value ? '1' : '0';
            } else {
                model[ctrlName] = formControls[key].value;
            }
        });
    }

    protected parseFormControlDynamicFields(
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

            this.buildDynamicFieldControl(formControls, transformDynamicField, dynamicControls);
        });

        return formControls;
    }

    protected applyScanningOcrText(
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

        const ocrValue = this._convertDataOCR(ctrlFocusing, payload.Value);
        if (!ocrValue) return;

        let currentValue = this.getFocusCtrlValue(ctrlFocusing.form, fieldNameFocus, controlType);
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

    protected getFocusCtrlValue(
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

            case MaterialControlType.SLIDE_TOGGLE:
                return '';

            case MaterialControlType.SELECT:
                return '';

            default:
                return '';
        }
    }

    private _convertDataOCR(ctrlFocusing: FocusControlEvent, value: string) {
        switch (ctrlFocusing.config.type) {
            case MaterialControlType.INPUT:
                if ((ctrlFocusing.config as InputMaterialControlConfig).inputType === ControlInputType.NUMBER) {
                    return this._parseOcrTextToNumber(value);
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

    private formatJsonMainDocument(
        documentTreeModel: DocumentTreeModel,
        idsStoreForUpdate: {
            IdMainDocument: string;
            IdDocumentTreeMedia: string;
            IdDocumentTree: string;
            OldFolder?: DocumentTreeModel;
            NewFolder?: DocumentTreeModel;
        },
        documentContainerOcr: DocumentContainerOcrStateModel,
        documentKeyword: string,
        documentTodos: string,
        isTodo: boolean,
    ): MainDocumentModel {
        return {
            idMainDocument: idsStoreForUpdate?.IdMainDocument || null,
            idDocumentContainerScans: `${documentContainerOcr.IdDocumentContainerScans}`,
            searchKeyWords: documentKeyword,
            toDoNotes: isTodo ? documentTodos : '',
            isTodo: isTodo ? '1' : '0',
            mainDocumentTree: {
                idDocumentTree: idsStoreForUpdate?.IdDocumentTree || documentTreeModel.idDocument.toString(),
                oldFolder: idsStoreForUpdate?.OldFolder,
                newFolder: idsStoreForUpdate?.NewFolder,
            },
        };
    }

    private validateJsonDocumentTreeMedia(documentTreeMedia: DocumentTreeMediaModel) {
        if (!documentTreeMedia || !documentTreeMedia.idDocumentTree) {
            return false;
        }

        return true;
    }

    private formatJsonDocumentTreeMedia(
        documentTreeModel: DocumentTreeModel,
        idsStoreForUpdate: {
            IdMainDocument: string;
            IdDocumentTreeMedia: string;
            IdDocumentTree: string;
            OldFolder?: DocumentTreeModel;
            NewFolder?: DocumentTreeModel;
        },
        documentContainerOcr: DocumentContainerOcrStateModel,
        originalFileName: string,
    ): DocumentTreeMediaModel {
        return {
            idDocumentTreeMedia: idsStoreForUpdate?.IdDocumentTreeMedia || null,
            idDocumentTree: documentTreeModel.idDocument.toString(),
            idRepTreeMediaType: '1',
            mediaName: originalFileName || documentContainerOcr.OriginalFileName,
            cloudMediaPath: documentTreeModel.path,
        };
    }

    private validateJsonMainDocument(mainDocument: MainDocumentModel) {
        if (!mainDocument || !mainDocument.mainDocumentTree.idDocumentTree || !mainDocument.idDocumentContainerScans) {
            return false;
        }

        return true;
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

    protected _setCtrlHidden(ctrl: IMaterialControlConfig) {
        ctrl.setting.DisplayField.Hidden = '1';
    }

    protected _setCtrlShow(ctrl: IMaterialControlConfig) {
        ctrl.setting.DisplayField.Hidden = '0';
    }

    protected _setCtrlReadonly(ctrl: FormControl, readonly: boolean = true) {
        if (readonly) {
            ctrl.disable({ onlySelf: true, emitEvent: false });
        } else {
            ctrl.enable({ onlySelf: true, emitEvent: false });
        }
    }

    protected _resetDefaultValidators(ctrl: FormControl, config: IMaterialControlConfig) {
        ctrl.clearValidators();
        const validators = this.dynamicMaterialHelper.getValidators(config);
        if (validators && validators.length) {
            ctrl.setValidators(validators);
        }
    }

    protected _calcMonthsToDateByFromDate(fromDate: Date, months: number) {
        const _moment = moment(fromDate);

        if (isNumber(months) && months > 0) {
            const duration = _moment.add(moment.duration(months, 'M'));
            return duration.toDate();
        }
        return null;
    }

    protected _calcDateToMonthsByFromDate(fromDate: Date, toDate: Date) {
        const _momentFromDate = moment(fromDate);
        const _momentToDate = moment(toDate);

        if (!_momentFromDate.isValid() || !_momentToDate.isValid()) {
            return null;
        }

        const months = _momentFromDate.diff(_momentToDate, 'M');
        return Math.abs(months);
    }

    protected setEmptyDataForm(form: FormGroup, ignoreCtrl?: (ctrl: FormControl, ctrlName: string) => boolean) {
        Uti.iterateFormControl(form, (ctrl, ctrlName) => {
            const ignored = (ignoreCtrl && ignoreCtrl(ctrl, ctrlName)) || false;
            if (ignored) return;

            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => false);
        });
    }

    protected buildDynamicFieldControl(
        formControls: { [key: string]: FormControl },
        dynamicField: DynamicField,
        controlConfigs: IMaterialControlConfig[],
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
                    OrderBy: controlConfigs.length.toString(),
                    GroupHeader: '0',
                },
            },
        };

        const controlConfig = this.getMaterialControlConfig(newColumnSetting);
        this.dynamicMaterialHelper.buildFormControlObject(formControls, controlConfig);
        formControls[controlConfig.formControlName].setValidators([Validators.required]);

        controlConfigs.push(controlConfig);
    }

    protected markFormGroupTouchedAndDirty(formGroup: FormGroup) {
        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }

    protected markFormGroupDynamicFieldTouchedAndDirty(formGroup: FormGroup, dynamicFields: DynamicField[]) {
        if (!dynamicFields || !dynamicFields.length) return;

        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
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
    protected mappingQrCodeToField(qrCode: any): QrCodeModel {
        if (!qrCode) {
            return { contact: null, invoice: null };
        }
        const qrCodeJson: any = JSON.parse(qrCode);
        const payee: any = qrCodeJson['Payee'] || {};
        const contactModel: SharingContactInformationModel = {
            B00SharingCompany_Company: payee['Company'],
            B00SharingAddress_Street: payee['Street'],
            B00SharingAddress_Zip: payee['ZIP'],
            B00SharingAddress_Place: payee['Place'],
            PersonNr: '',
            B00SharingCommunication_TelOffice: '',
            B00SharingName_FirstName: '',
            B00SharingName_LastName: '',
        };
        const slip: any = qrCodeJson['Slip'] || {};
        const invoiceModel: InvoiceQrCodeModel = {
            Currency: Uti.transformNumberHasDecimal(slip['Curreny'], 2),
            InvoiceAmount: Uti.transformNumberHasDecimal(slip['InvoiceAmount'], 2),
        };

        const model: QrCodeModel = { contact: contactModel, invoice: invoiceModel };
        return model;
    }

    public buildContactModel(): SharingContactInformationModel {
        return {
            B00SharingCompany_Company: '',
            B00SharingAddress_Street: '',
            B00SharingAddress_Zip: '',
            B00SharingAddress_Place: '',
            PersonNr: '',
            B00SharingCommunication_TelOffice: '',
            B00SharingName_FirstName: '',
            B00SharingName_LastName: '',
        };
    }

    protected hasChangedColumnSettings(columnSettings) {
        if (!this.columnSettings) return true;

        return this.columnSettings.length !== columnSettings.length;
    }

    protected hasFieldNameExisted(dynamicFields: DynamicField[], fieldName: string) {
        if (!dynamicFields || !dynamicFields.length) return false;

        return dynamicFields.findIndex((df) => df.fieldName === fieldName) !== -1;
    }
}
