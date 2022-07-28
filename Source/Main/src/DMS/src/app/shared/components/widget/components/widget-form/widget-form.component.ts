import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter,
    ViewChildren,
    QueryList,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlType, Configuration, SignalRActionEnum, SignalRJobEnum } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import {
    ControlBase,
    TextboxControl,
    DropdownControl,
    CheckboxControl,
    DateControl,
    WidgetDetail,
    ButtonControl,
    NumberBoxControl,
    TextboxMaskControl,
    SignalRNotifyModel,
    Module,
    WidgetDataType,
} from '@app/models';
import {
    CommonService,
    ObservableShareService,
    PropertyPanelService,
    AppErrorHandler,
    SignalRService,
} from '@app/services';
import { InlineEditComponent } from '../inline-edit';
import { ComboBoxTypeConstant, FilterModeEnum, WidgetFormTypeEnum } from '@app/app.constants';
import { Observable, Subscription, of } from 'rxjs';
import { FieldFilter, ApiResultResponse, User } from '@app/models';
import { parse } from 'date-fns/esm';
import { DatePipe } from '@angular/common';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { BaseWidget } from '@app/pages/private/base';
import cloneDeep from 'lodash-es/cloneDeep';
import { TabSummaryActions, DocumentImageOCRActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import groupBy from 'lodash-es/groupBy';
import { debounceTime, finalize } from 'rxjs/operators';

@Component({
    selector: 'widget-form',
    styleUrls: ['./widget-form.component.scss'],
    templateUrl: './widget-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetFormComponent extends BaseWidget implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() dataSource: WidgetDetail;

    @Input() currentModule: Module;

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        } else {
            this.ref.reattach();
        }
    }

    get isActivated() {
        return this._isActivated;
    }

    @Input()
    filterMode: FilterModeEnum;

    @Input()
    fieldFilters: Array<FieldFilter>;

    @Input() readonly = false;

    @Input() isDialogMode = false;

    @Input() set formType(formType: WidgetFormTypeEnum) {
        if (!isNil(formType)) {
            this.widgetFormType = formType;

            setTimeout(() => {
                this.getContainerHeight();
            });

            setTimeout(() => {
                this.activateVirtualContainer(this.resizedNumber, true);
            }, 500);
        }
    }

    @Input() formStyle: any = {
        labelStyle: {},
        dataStyle: {},
    };

    @Input() inlineLabelStyle: any = {};

    @Input() importantFormStyle: any = {
        labelStyle: {},
        dataStyle: {},
        fields: {},
    };

    @Input() set resized(input: string) {
        if (!this.resizedNumber && input) this.resizedNumber = input;
        setTimeout(() => this.activateVirtualContainer(input));
    }

    @Input() set controlUpdated(data: SignalRNotifyModel) {
        this.executeControlUpdated(data);
    }

    @Input() fieldStyle: {
        [key: string]: {
            labelStyle: {};
        };
    }; // { 'IdPersonInterface' : { 'labelStyle' : {} };

    @Input() dataStyle: {
        [key: string]: {
            dataStyle: {};
        };
    }; // { 'IdPersonInterface' : { 'dataStyle' : {} };

    @Input() isDesignWidgetMode = false;
    @Input() isForceReset = false;
    @Input() globalProperties: any[] = [];

    private _supportDOBCountryFormat;
    @Input() set supportDOBCountryFormat(status) {
        this._supportDOBCountryFormat = status;
        this.updateDateOfBirthFormatByCountryCode();
    }

    get supportDOBCountryFormat() {
        return this._supportDOBCountryFormat;
    }

    @Output()
    onEditFormField: EventEmitter<any> = new EventEmitter();

    @Output()
    onCancelEditFormField: EventEmitter<any> = new EventEmitter();

    @Output()
    onFormChanged: EventEmitter<any> = new EventEmitter();

    @Output() formLoaded = new EventEmitter<any>();
    @Output() onPdfFieldClick = new EventEmitter<any>();
    @Output() onTrackingFieldClick = new EventEmitter<any>();
    @Output() onReturnRefundFieldClick = new EventEmitter<any>();
    @Output() dispatchData = new EventEmitter<any>();

    @ViewChildren(InlineEditComponent)
    private inlineEditComponents: QueryList<InlineEditComponent>;

    private resizedNumber: string = null;
    private groupContentListOld: Array<ControlBase<any>> = [];
    private groupContentList: Array<ControlBase<any>> = [];
    private listEditingFields: Array<string> = [];
    private ratioConvertFontSizeToPixcel = 7;
    public labelTextAlign = '';
    public dataTextAlign = '';
    private commonServiceSubscription: Subscription;
    private globalDateFormat: string;
    private consts: Configuration;
    public editDisplayMode = false;

    /* DB const: Specific case for changing country*/
    private SharingAddressIdRepIsoCountryCodeField = 'B00SharingAddress_IdRepIsoCountryCode';
    private CountryCodeSharingAddressHiddenField = 'B00RepIsoCountryCode_SharingAddressHiddenFields';
    private B00SharingAddressZipField = 'B00SharingAddress_Zip';
    private B00SharingAddressZip2Field = 'B00SharingAddress_Zip2';
    private B00PersonMasterData_DateOfBirth = 'B00PersonMasterData_DateOfBirth';
    private SharingAddressHiddenFields = 'sharingAddressHiddenFields';
    private ValidationZip2MaskFormatField = 'validationZip2MaskFormat';
    private ValidationZip2RegExField = 'validationZip2RegEx';
    private ValidationZipMaskFormatField = 'validationZipMaskFormat';
    private ValidationZipRegExField = 'validationZipRegEx';

    // Form group data
    form: FormGroup;
    originalFormValues: any;

    _editFormMode = false;
    set editFormMode(val: boolean) {
        this._editFormMode = val;

        this.subscribeFormChange();
        this.ref.markForCheck();
    }

    get editFormMode() {
        return this._editFormMode;
    }

    _editFieldMode = false;
    set editFieldMode(val: boolean) {
        this._editFieldMode = val;
        this.ref.markForCheck();
    }

    get editFieldMode() {
        return this._editFieldMode;
    }

    _editLanguageMode = false;
    set editLanguageMode(val: boolean) {
        this._editLanguageMode = val;
        this.ref.markForCheck();
    }

    get editLanguageMode() {
        return this._editLanguageMode;
    }

    containerHeight = 0;

    private xnComStateSubcription: Subscription;
    private undisplayFieldList: Array<string> = [];

    private minWidthContainerLabel = 0;
    private minWidthContainer = 0;
    private controlWidth = 0;
    private widgetFormType: WidgetFormTypeEnum = WidgetFormTypeEnum.List;
    private defaultLengthDisplay = 5;
    private minLabelWidth = 100;
    private numberOfVisibleControls = 0;
    private org_numberOfVisibleControls = 0;

    private _isFormChanged: boolean;

    public set isFormChanged(status: boolean) {
        this._isFormChanged = status;
        this.errorShow = this._isFormChanged;
    }

    public get isFormChanged() {
        return this._isFormChanged;
    }

    public errorShow: boolean;
    public fieldFocused: string;
    public idProcessed: any;
    public parentWidgetIds: Array<string>;
    public idDocumentContainerOcr: any;

    constructor(
        private store: Store<AppState>,
        private commonService: CommonService,
        private datePipe: DatePipe,
        private _eref: ElementRef,
        private ref: ChangeDetectorRef,
        protected obserableShareService: ObservableShareService,
        private propertyPanelService: PropertyPanelService,
        private appErrorHandler: AppErrorHandler,
        private signalRService: SignalRService,
        private tabSummaryActions: TabSummaryActions,
        private documentImageAction: DocumentImageOCRActions,
    ) {
        super();
        this.consts = new Configuration();
    }

    public ngOnInit() {}

    ngOnDestroy() {
        Uti.unsubscribe(this);
        this.signalRDisconnectEditing();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            !changes['importantFormStyle'] &&
            !changes['dataSource'] &&
            !changes['filterMode'] &&
            !changes['fieldFilters'] &&
            !changes['editFormMode']
        )
            return;

        const hasChanges =
            this.hasChanges(changes['dataSource']) ||
            this.hasChanges(changes['filterMode']) ||
            this.hasChanges(changes['fieldFilters']);

        if (hasChanges && this.dataSource) {
            this.editDisplayMode = this.getEditModeSetting();
            // Only redraw data if Form has not updated yet and view mode
            let viewModeAndNotChanged = !this.isFormChanged && !this.editFieldMode && !this.editFormMode;
            if (viewModeAndNotChanged || this.isForceReset || this.editDisplayMode) {
                this.processData();
                this.resetToViewMode();
                if (this.isDialogMode || this.editDisplayMode) {
                    this.setEditFormMode();
                }
                this.ref.markForCheck();
            }
            if (this.isForceReset) {
                this.signalRDisconnectEditing();
            }
        }

        if (this.hasChanges(changes['importantFormStyle'])) {
            this.calculateMinLabelWidth();
            setTimeout(() => {
                this.activateVirtualContainer(this.resizedNumber, true);
            }, 500);
            this.ref.markForCheck();
        }
        this.setTextAlign();

        if (this.hasChanges(changes['globalProperties'])) {
            this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(
                changes['globalProperties'].currentValue,
            );
        }
    }

    /**
     * setEditFormMode
     **/
    private setEditFormMode() {
        // if (!this.getEditModeSettingImageOcr()) {
        this.editFormMode = true;
        // }
        if (this.inlineEditComponents && this.inlineEditComponents.length) {
            this.inlineEditComponents.forEach((inlineEditComponent) => {
                inlineEditComponent.editing = true;
            });
        }
    }

    /**
     * getEditModeSetting
     **/
    private getEditModeSetting() {
        let editMode: boolean;
        if (this.dataSource && this.dataSource.widgetDataType && this.dataSource.widgetDataType.editFormSetting) {
            editMode = this.dataSource.widgetDataType.editFormSetting.swithToEdit;
        }
        return editMode;
    }

    /**
     * setTextAlign
     */
    private setTextAlign() {
        // Set Global align
        this.labelTextAlign = this.formStyle.labelStyle['text-align'] || '';
        this.dataTextAlign = this.formStyle.dataStyle['text-align'] || '';

        // Set each field label align
        if (this.fieldStyle && this.groupContentList.length) {
            Object.keys(this.fieldStyle).forEach((key) => {
                const rs = this.groupContentList.filter((p) => p.key == key);
                if (rs.length) {
                    rs[0].labelAlign = this.fieldStyle[key].labelStyle['text-align'] || '';
                }
            });
        }

        // Set each field data align
        if (this.dataStyle && this.groupContentList.length) {
            Object.keys(this.dataStyle).forEach((key) => {
                const rs = this.groupContentList.filter((p) => p.key == key);
                if (rs.length) {
                    rs[0].align = this.dataStyle[key].dataStyle['text-align'] || '';
                }
            });
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.formLoaded.emit(true);
        }, 200);
    }

    resetValue(isResetEditing?: boolean): void {
        if (this.formChangeSubscribeSubcription) this.formChangeSubscribeSubcription.unsubscribe();

        this.inlineEditComponents.forEach((inlineEditComponent) => {
            inlineEditComponent.reset(isResetEditing);
        });

        this.ref.markForCheck();
        this.subscribeFormChange();
    }

    updatePreValue(): void {
        this.inlineEditComponents.forEach((inlineEditComponent) => {
            inlineEditComponent.updatePrevalue();
        });

        this.ref.markForCheck();
    }

    private onEditInlinePrevalue(event) {}

    private onSavePrevalue(event) {}

    private processData(): void {
        if (!this.dataSource) {
            return;
        }
        this.form = null;
        if (this.dataSource && this.dataSource.contentDetail) {
            if (this.dataSource.contentDetail.data && this.dataSource.contentDetail.data.length > 0) {
                const widgetInfo = this.dataSource.contentDetail.data;
                const contentList: Array<any> = widgetInfo[1];
                this.getDataForDirective(this.dataSource.widgetDataType, widgetInfo[0]);
                if (!contentList) {
                    return;
                }
                this.buildGroupList(contentList);
                this.customControl();
                this.createFormGroup();
                this.dispatchDataForValidPrimaryKey();

                setTimeout(() => {
                    this.getContainerHeight();
                    this.calculateMinLabelWidth();
                });

                setTimeout(() => {
                    this.activateVirtualContainer(this.resizedNumber, true);
                }, 500);
            }
        }
    }

    /**
     * dispatchDataForValidPrimaryKey
     **/
    private dispatchDataForValidPrimaryKey() {
        // If have primaryKey , then dispatch data
        if (this.dataSource.widgetDataType && this.dataSource.widgetDataType.primaryKey && this.form) {
            let primaryKey = this.dataSource.widgetDataType.primaryKey;
            let data;
            Object.keys(this.form.value).forEach((key) => {
                if (key.indexOf(primaryKey) >= 0) {
                    data = {
                        key: primaryKey,
                        value: this.form.value[key],
                    };
                }
            });
            if (data) {
                this.dispatchData.emit([data]);
            }
        }
    }

    /**
     * Custom some specific of controls such as : format date, hidden fields ...
     **/
    private customControl() {
        this.setHiddenFieldsByDefaultCountryCode();
    }

    /**
     * setHiddenFieldsByDefaultCountryCode
     */
    private setHiddenFieldsByDefaultCountryCode() {
        if (this.groupContentList && this.groupContentList.length) {
            const hiddenControl = this.groupContentList.find((p) => p.key == this.CountryCodeSharingAddressHiddenField);
            if (hiddenControl && hiddenControl.value) {
                const hiddenValues: Array<string> = (hiddenControl.value as string).split(';');
                this.setHiddenFields(hiddenValues);
            }
        }
    }

    /**
     * setHiddenFields
     * @param hiddenValues
     */
    private setHiddenFields(hiddenFieldValues: Array<any>) {
        if (!hiddenFieldValues || !this.groupContentList) {
            return;
        }
        hiddenFieldValues.forEach((value: string) => {
            if (value) {
                const targetHiddenControl = this.groupContentList.find((p) => {
                    const arr: Array<any> = p.key.split('_');
                    let hiddenField = arr[0];
                    if (arr.length > 1) {
                        hiddenField = arr[1];
                    }
                    return hiddenField.toLowerCase() == value.toLowerCase();
                });
                if (targetHiddenControl) {
                    targetHiddenControl.isHidden = true;
                }
            }
        });
    }

    public syncFormDataToDataSource() {
        if (this.dataSource && this.dataSource.contentDetail) {
            if (this.dataSource.contentDetail.data.length > 0) {
                const widgetInfo = this.dataSource.contentDetail.data;
                const contentList: Array<any> = widgetInfo[1];
                const controls: ControlBase<any>[] = this.groupContentList;
                contentList.forEach((content) => {
                    const rs = controls.filter((c) => c.key === content.OriginalColumnName);
                    if (rs.length > 0) {
                        const control: ControlBase<any> = rs[0];
                        content.Value = control.value;
                        if (control.controlType === 'dropdown') {
                            content.Value = (control as DropdownControl).displayValue;
                        }
                    }
                });
            }
        }
    }

    private formChangeSubscribeSubcription: Subscription;
    private createFormGroup() {
        const controls: ControlBase<any>[] = this.groupContentList;
        //controls.push(new LogoControl({
        //    key: 'logo',
        //    value : 'test.png'
        //}));
        this.toFormGroup(controls)
            .pipe(
                finalize(() => {
                    this.emitCompletedRenderEvent();
                }),
            )
            .subscribe((form) => {
                this.appErrorHandler.executeAction(() => {
                    this.form = form;
                    this.originalFormValues = Object.assign({}, form.value);
                    this.updateDateOfBirthFormatByCountryCode();
                    this.ref.markForCheck();
                    this.signalRIsThereAnyoneEditing();
                });
            });
    }

    private subscribeFormChangeTimeout: any;
    private subscribeFormChange() {
        if (!this.form) return;
        clearTimeout(this.subscribeFormChangeTimeout);
        this.subscribeFormChangeTimeout = null;
        this.subscribeFormChangeTimeout = setTimeout(() => {
            if (this.formChangeSubscribeSubcription) this.formChangeSubscribeSubcription.unsubscribe();

            if (!this.form) return;

            this.formChangeSubscribeSubcription = this.form.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.editFieldMode || this.editFormMode) {
                        if (JSON.stringify(this.originalFormValues) !== JSON.stringify(this.form.value)) {
                            this.onFormChanged.emit(true);
                            this.isFormChanged = true;
                        } else {
                            this.onFormChanged.emit(false);
                            this.isFormChanged = false;
                        }
                        this.ref.markForCheck();
                    }
                    this.broastCastSignalRMessage();
                });
            });

            if (this.editFieldMode || this.editFormMode) {
                if (JSON.stringify(this.originalFormValues) !== JSON.stringify(this.form.value)) {
                    this.onFormChanged.emit(true);
                    this.isFormChanged = true;
                } else {
                    this.onFormChanged.emit(false);
                    this.isFormChanged = false;
                }
            }
        }, 500);
    }

    /**
     * updateOriginalFormValues
     */
    public updateOriginalFormValues() {
        this.originalFormValues = Object.assign({}, this.form.value);
    }

    private broastCastSignalRMessage() {
        if (!this.form.dirty) return;
        let fieldsChanged = this.filterValidFormField();
        this.notifyFields = [];

        for (let controlName in fieldsChanged) {
            if (this.undisplayFieldList.indexOf(controlName) > -1) continue;
            this.notifyFields.push({
                fieldName: controlName,
                fieldValue: fieldsChanged[controlName],
            });
        }
        this.mapValueToTextForFiedl();
        if (!this.notifyFields.length) {
            this.signalRDisconnectEditing();
        } else {
            this.signalRConnectEditing();
        }
    }

    private mapValueToTextForFiedl() {
        if (!this.notifyFields || !this.notifyFields.length) return;
        for (let item of this.notifyFields) {
            const control = this.groupContentList.find((x) => x.key === item.fieldName);
            if (!(control instanceof DropdownControl)) continue;
            for (let opt of control['options']) {
                if (opt.key != item.fieldValue) continue;
                item.fieldValue = opt.value;
                break;
            }
        }
    }

    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    private getValidCombobox(listComboBox: any, identificationKey: any) {
        const keys = Object.keys(ComboBoxTypeConstant);
        let idx: string;
        keys.forEach((key) => {
            // TODO
            if (ComboBoxTypeConstant[key] == identificationKey) {
                idx = key;
            }
        });

        if (!idx) {
            idx = identificationKey;
        }

        return listComboBox[idx];
    }

    /**
     * Create Form Group
     * @param controls
     */
    toFormGroup(controls: ControlBase<any>[]) {
        const group: any = {};

        // Find all drop-down control
        let comboBoxes: DropdownControl[] = controls.filter((p) => p.controlType === 'dropdown') as DropdownControl[];

        if (comboBoxes.length > 0) {
            const filterByComboboxes = comboBoxes.filter((p) => p.filterBy);
            comboBoxes = comboBoxes.filter((p) => !p.filterBy);

            let key = comboBoxes.map((p) => p.identificationKey).join(',');
            let observable = this.commonService.getListComboBox(key);
            this.obserableShareService.setObservable(key, observable);

            let observable$ = this.obserableShareService.getObservable(key);

            return observable$.map((response: ApiResultResponse) => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                for (let k = 0; k < comboBoxes.length; k++) {
                    const comboOptions = this.getValidCombobox(response.item, comboBoxes[k].identificationKey);
                    if (comboOptions) {
                        const options: Array<any> = [];
                        let idValue: number = null;
                        for (let i = 0; i < comboOptions.length; i++) {
                            if (comboBoxes[k].key === this.SharingAddressIdRepIsoCountryCodeField) {
                                options.push({
                                    key: comboOptions[i].idValue,
                                    value: comboOptions[i].textValue,
                                    isoCode: comboOptions[i].isoCode,
                                    sharingAddressHiddenFields: comboOptions[i][this.SharingAddressHiddenFields],
                                    validationZip2MaskFormat: comboOptions[i][this.ValidationZip2MaskFormatField],
                                    validationZip2RegEx: comboOptions[i][this.ValidationZip2RegExField],
                                    validationZipMaskFormat: comboOptions[i][this.ValidationZipMaskFormatField],
                                    validationZipRegEx: comboOptions[i][this.ValidationZipRegExField],
                                });
                            } else {
                                options.push({
                                    key: comboOptions[i].idValue,
                                    value: comboOptions[i].textValue,
                                });
                            }
                            if (comboOptions[i].textValue === comboBoxes[k].displayValue) {
                                idValue = comboOptions[i].idValue;
                            }
                        }
                        comboBoxes[k].options = options;
                        if (idValue) {
                            comboBoxes[k].value = '' + idValue;
                        }
                    }
                }
                if (filterByComboboxes.length > 0) {
                    filterByComboboxes.forEach((filterByCombobo) => {
                        this.loadDataForDependDropdown(filterByCombobo, controls);
                    });
                }
                controls.forEach((control) => {
                    group[control.key] = new FormControl(control.value || '');
                    const arr = [];
                    if (control.required) {
                        arr.push(Validators.required);
                    }
                    if (control.pattern && control.pattern.length)
                        arr.push(Validators.pattern(new RegExp(control.pattern)));
                    if (control.controlType === 'numberbox') {
                        const maxValue = (control as NumberBoxControl).maxValue;
                        if (maxValue) {
                            arr.push(Validators.max(maxValue));
                        }
                    }
                    (<FormControl>group[control.key]).validator = Validators.compose(arr);
                    (<FormControl>group[control.key]).updateValueAndValidity();
                });
                return new FormGroup(group);
            });
        }
        controls.forEach((control) => {
            group[control.key] = new FormControl(control.value || '');
            const arr = [];
            if (control.required) {
                arr.push(Validators.required);
            }
            if (control.pattern && control.pattern.length) arr.push(Validators.pattern(new RegExp(control.pattern)));
            if (control.controlType === 'numberbox') {
                const maxValue = (control as NumberBoxControl).maxValue;
                if (maxValue) {
                    arr.push(Validators.max(maxValue));
                }
            }
            (<FormControl>group[control.key]).validator = Validators.compose(arr);
            (<FormControl>group[control.key]).updateValueAndValidity();
        });
        return of(new FormGroup(group));
    }

    private isHiddenFieldByService(fieldName: string, checkList: Array<string>) {
        const rs: Array<string> = checkList.filter((s) => fieldName.indexOf(s) >= 0);
        return rs.length > 0;
    }

    private isHiddenFieldByFilterMode(content) {
        let isHidden = false;
        // Filter Data
        switch (this.filterMode) {
            case FilterModeEnum.HasData:
                if (!content.Value) {
                    isHidden = true;
                }
                break;

            case FilterModeEnum.EmptyData:
                if (content.Value) {
                    isHidden = true;
                }
                break;
            default:
                break;
        }
        return isHidden;
    }

    private isHiddenFieldByFieldFilter(content) {
        let isHidden = false;
        const displayFields: Array<FieldFilter> = this.fieldFilters.filter((p) => p.selected === true);
        const displayContent = displayFields.filter((p) => p.fieldName === content.OriginalColumnName);
        if (displayContent.length === 0) {
            isHidden = true;
        }
        return isHidden;
    }

    /**
     * buildGroupList
     * @param contentList
     */
    private buildGroupList(contentList): void {
        this.numberOfVisibleControls = 0;
        this.groupContentListOld = cloneDeep(this.groupContentList);
        this.undisplayFieldList = [];
        this.groupContentList = [];
        let hasGroupField: boolean = false;
        for (let i = 0; i < contentList.length; i++) {
            const itemContent = contentList[i];
            let _isHidden = false;
            let identificationKey = 0;
            let filterBy: string;
            let groupName: string;
            let isReadOnly = false;
            let isRequired = false;
            let _pattern = '';
            let _isNeedForUpdate = false;
            let isHiddenFromSetting = false;
            let setting: any = {};
            if (itemContent.Setting && itemContent.Setting.length) {
                const settingArray = JSON.parse(itemContent.Setting);
                setting = Uti.getCloumnSettings(settingArray);
                _isHidden =
                    setting.DisplayField && setting.DisplayField.Hidden && parseInt(setting.DisplayField.Hidden) > 0;
                isHiddenFromSetting = _isHidden;
                if (_isHidden)
                    _isNeedForUpdate =
                        setting.DisplayField &&
                        setting.DisplayField.NeedForUpdate &&
                        parseInt(setting.DisplayField.NeedForUpdate) > 0;
                if (_isNeedForUpdate && itemContent && itemContent.Value)
                    this.undisplayFieldList.push(itemContent.OriginalColumnName);
                else
                    isReadOnly =
                        this.readonly === true ||
                        (this.readonly === false &&
                            setting.DisplayField &&
                            setting.DisplayField.ReadOnly &&
                            parseInt(setting.DisplayField.ReadOnly) > 0);
                if (setting.ControlType && /ComboBox/i.test(setting.ControlType.Type) && setting.ControlType.Value) {
                    // identificationKey = parseInt(setting.ControlType.Value);
                    identificationKey = setting.ControlType.Value;
                    filterBy = setting.ControlType.FilterBy;
                }
                if (setting.ControlType && /Checkbox/i.test(setting.ControlType.Type)) {
                    groupName = setting.ControlType.GroupName;
                }
                isRequired =
                    setting.Validation && setting.Validation.IsRequired && parseInt(setting.Validation.IsRequired) > 0;
                _pattern =
                    setting.Validation && setting.Validation.ValidationExpresion
                        ? setting.Validation.ValidationExpresion
                        : '';
            }
            if (!_isHidden) {
                if (this.fieldFilters && this.fieldFilters.length > 0) {
                    _isHidden = this.isHiddenFieldByFieldFilter(contentList[i]);
                }
                // Allow to display by display fields, so need to check if it can display by filter mode
                if (!_isHidden) {
                    _isHidden = this.isHiddenFieldByFilterMode(contentList[i]);
                }
            }
            if (identificationKey) {
                contentList[i].DataType = 'combo-box';
            }

            const defaultConfig: any = {
                key: contentList[i].OriginalColumnName,
                label: contentList[i].ColumnName,
                value: contentList[i].Value,
                isHidden: _isHidden,
                readOnly: isReadOnly,
                required: isRequired,
                pattern: _pattern,
                maxLength: contentList[i].DataLength,
                groupField: contentList[i].GroupField,
                words: contentList[i].WordsCoordinates || '',
            };
            this.numberOfVisibleControls += _isHidden ? 0 : 1;

            if (!hasGroupField && defaultConfig.groupField) {
                hasGroupField = true;
            }

            let txtControl: ControlBase<any>;
            let controlType = setting.ControlType && setting.ControlType.Type ? setting.ControlType.Type : '';
            if (!controlType) {
                controlType = this.getControlTypeNameFromColumnDefine(itemContent);
            }
            if (!controlType) {
                controlType = ControlType.Textbox;
            }

            controlType = controlType.toLowerCase();
            switch (controlType) {
                case ControlType.Numeric:
                    defaultConfig.type = 'number';
                    defaultConfig.value = defaultConfig.value ? parseFloat(defaultConfig.value) : null;
                    defaultConfig.maxValue =
                        setting && setting.Validation && setting.Validation.MaxValue
                            ? setting.Validation.MaxValue
                            : null;
                    txtControl = new NumberBoxControl(defaultConfig);
                    break;

                case ControlType.Textbox:
                    txtControl = new TextboxControl(defaultConfig);
                    break;

                case ControlType.Checkbox:
                    defaultConfig.groupName = groupName;
                    txtControl = new CheckboxControl(defaultConfig);
                    txtControl.value = true;
                    if (typeof defaultConfig.value === 'boolean') {
                        txtControl.value = defaultConfig.value;
                    } else if (isNil(defaultConfig.value) || defaultConfig.value.toLowerCase() !== 'true')
                        txtControl.value = false;
                    break;

                case ControlType.DateTimePicker:
                    if (!isEmpty(defaultConfig.value)) {
                        if (typeof defaultConfig.value === 'object' || defaultConfig.value.indexOf('.') !== -1) {
                            defaultConfig.value = parse(defaultConfig.value, 'dd.MM.yyyy', new Date());
                        }
                    } else defaultConfig.value = null;
                    txtControl = new DateControl(defaultConfig);
                    break;

                case ControlType.ComboBox:
                    defaultConfig.displayValue = defaultConfig.value;
                    defaultConfig.identificationKey = identificationKey;
                    defaultConfig.filterBy = filterBy;
                    txtControl = new DropdownControl(defaultConfig);
                    break;

                case ControlType.Button:
                    defaultConfig.clickFunc = this.buildButtonControlClickFunc(itemContent, contentList);
                    txtControl = new ButtonControl(defaultConfig);
                    break;

                default:
                    txtControl = new TextboxControl(defaultConfig);
                    break;
            }
            this.buildHasJustUpdatedForOldControl(txtControl);
            this.groupContentList.push(txtControl);
            if (hasGroupField) {
                this.buildGroupForGroupContentList();
            }
            this.resetControlUpdated();
        } //for
    }

    private buildGroupForGroupContentList() {
        if (!this.groupContentList || !this.groupContentList.length) return;

        let groups = groupBy(this.groupContentList, 'groupField');

        Object.keys(groups).forEach((key, index, arr) => {
            let firstItemInGroup = groups[key].find((control) => !control.isHidden);
            if (firstItemInGroup) {
                let findItem = this.groupContentList.find((control) => control.key == firstItemInGroup.key);
                if (findItem) {
                    findItem.groupTitle = firstItemInGroup.groupField;
                }
            }
        });
    }

    private buildHasJustUpdatedForOldControl(control: ControlBase<any>) {
        if (!this.groupContentListOld || !this.groupContentListOld.length) return;
        for (let ctr of this.groupContentListOld) {
            if (ctr.key !== control.key) {
                continue;
            }
            control.hasJustUpdated = ctr.hasJustUpdated;
            break;
        }
    }

    private getControlTypeNameFromColumnDefine(itemContent) {
        if (itemContent.DataType) {
            switch (itemContent.DataType) {
                case 'datetime':
                    return 'DatetimePicker';
                default:
                    return '';
            }
        }

        return '';
    }

    private buildButtonControlClickFunc(itemContent, contentList) {
        if (!itemContent || !itemContent.ColumnName) {
            return null;
        }

        let clickData = this.buildButtonControlClickData(contentList);
        switch (itemContent.ColumnName.toLowerCase()) {
            case 'tracking':
                return () => {
                    this.onTrackingFieldClick.emit(clickData);
                };

            case 'invoicepdf':
            case 'pdf':
                return () => {
                    this.onPdfFieldClick.emit(clickData);
                };

            case 'return':
                return () => {
                    this.onReturnRefundFieldClick.emit(clickData);
                };
        }
    }

    private buildButtonControlClickData(contentList) {
        if (!contentList || !contentList.length) {
            return null;
        }

        let result: any = {};
        for (let i = 0; i < contentList.length; i++) {
            result[contentList[i]['ColumnName']] = contentList[i]['Value'];
        }

        return result;
    }

    getContainerHeight() {
        this.containerHeight = $('form', $(this._eref.nativeElement)).height();
    }

    onEditField(event): void {
        if (isNil(event) || (isNil(event.isEditing) && isNil(event.id))) return;
        // only emit that not in edit Field mode if no editing fields
        if (!event.isEditing && !this.listEditingFields.length) {
            this.editFieldMode = false;
            this.onEditFormField.emit(this.editFieldMode);
            this.subscribeFormChange();
        } else {
            const index = this.listEditingFields.findIndex((item) => event.id == item);
            if (event.isEditing && (isNil(index) || index < 0)) {
                this.listEditingFields.push(event.id);
            } else if (!event.isEditing && index >= 0) this.listEditingFields.splice(index, 1);
            if (this.listEditingFields.length && (isNil(index) || index < 0)) {
                this.editFieldMode = true;
                this.onEditFormField.emit(this.editFieldMode);
                this.subscribeFormChange();
            }
            // only emit that not in edit Field mode if no editing fields
            else if (!this.listEditingFields.length) {
                this.editFieldMode = false;
                this.onEditFormField.emit(this.editFieldMode);
                this.subscribeFormChange();
            }
        }
    }

    onCancelEditField($event): void {
        if (!this.listEditingFields.length) {
            this.onCancelEditFormField.emit(true);
        }
    }

    resetToViewMode(): void {
        if (this.formChangeSubscribeSubcription) this.formChangeSubscribeSubcription.unsubscribe();
        // Edit Form Mode
        this.editFieldMode = false;
        this.editFormMode = false;
        this.listEditingFields = [];
        if (this.inlineEditComponents && this.inlineEditComponents.length) {
            this.inlineEditComponents.forEach((inlineEditComponent) => {
                inlineEditComponent.reset();
            });
        }
        // Translate Mode
        this.editLanguageMode = false;

        this.listEditingFields = [];

        if (this.form) {
            this.originalFormValues = this.form.value;
        }
        this.subscribeFormChange();
        this.ref.markForCheck();
        this.signalRDisconnectEditing();
    }

    updateEditLanguageMode(isEditing: boolean): void {
        this.editLanguageMode = isEditing;
        this.ref.markForCheck();
    }

    onEnterKeyPress(control: ControlBase<any>) {
        let inlineEditComponents: Array<InlineEditComponent> = this.inlineEditComponents.toArray();
        inlineEditComponents = inlineEditComponents.filter((p) => p.control.isHidden === false && !p.control.readOnly);

        if (inlineEditComponents && inlineEditComponents.length) {
            let inlineEditComponent: InlineEditComponent;
            for (let i = 0; i < inlineEditComponents.length; i++) {
                if (inlineEditComponents[i].control.key === control.key) {
                    if (i === inlineEditComponents.length - 1) {
                        inlineEditComponent = inlineEditComponents[0];
                    } else {
                        inlineEditComponent = inlineEditComponents[i + 1];
                    }
                    break;
                }
            }
            if (inlineEditComponent) {
                inlineEditComponent.focus();
            }
        }
    }

    focusOnFirstFieldError() {
        const inlineEditComponents: Array<InlineEditComponent> = this.inlineEditComponents.toArray();
        for (let i = 0; i < inlineEditComponents.length; i++) {
            if (!this.form.controls[inlineEditComponents[i].control.key].valid) {
                this.errorShow = true;
                inlineEditComponents[i].focus();
                this.activeChildAndParentTab();
                this.ref.detectChanges();
                break;
            }
        }
    }

    private activeChildAndParentTab() {
        let $form = $('form', $(this._eref.nativeElement));
        let $curentTab: any = $form.closest('.tab-pane');

        //active Child And Parent Tab
        const tabId = $curentTab.attr('id');
        if (!tabId) return;

        //select current tab
        this.activeTab($curentTab);

        //select parent tab
        const $parentTab = $curentTab.parent().closest('.tab-pane');
        if ($parentTab && $parentTab.length) {
            this.activeTab($parentTab);
        }
    }

    private activeTab($curentTab: any) {
        if (!$curentTab.length) return;

        const tabId = $curentTab.attr('id');
        if (!tabId) return;

        const $currentNav = $('li a[href$="' + tabId + '"]');
        if ($currentNav.length) {
            this.store.dispatch(this.tabSummaryActions.requestSelectSimpleTab(tabId, this.currentModule));
        }
    }

    public getSavingData() {
        return this.filterValidFormField();
    }

    // Only get new update value from Form and ids list to support update.
    public filterValidFormField() {
        const formValues = Object.assign({}, this.form.value);
        const originalFormValues = this.originalFormValues;

        const formValueKeys = Object.keys(formValues);
        const ignoreFields: Array<string> = [];
        formValueKeys.forEach((formField) => {
            let rs: Array<string> = [];
            if (this.undisplayFieldList) {
                rs = this.undisplayFieldList.filter((p) => formField.indexOf(p) >= 0);
            }
            if (rs.length === 0) {
                if (formValues[formField] === originalFormValues[formField]) {
                    ignoreFields.push(formField);
                } else if (formValues[formField]['key'] && formValues[formField]['value']) {
                    if (formValues[formField]['key'] === originalFormValues[formField]) ignoreFields.push(formField);
                    else formValues[formField] = formValues[formField]['key'];
                }
            }
            if (formValues[formField] instanceof Date) {
                // Fix format follow store procedure convert formater
                formValues[formField] = this.datePipe.transform(
                    formValues[formField],
                    this.consts.dateFormatInDataBase,
                );
            }
        });

        if (ignoreFields.length > 0) {
            ignoreFields.forEach((ignoreField) => {
                delete formValues[ignoreField];
            });
        }
        return formValues;
    }

    /**
     * Load data for drop-down that depend on other drop-down
     */
    private loadDataForDependDropdown(dropdownControl: DropdownControl, controls: ControlBase<any>[]) {
        if (dropdownControl.filterBy) {
            const dependDropdowns = controls.filter((p) => p.key === dropdownControl.filterBy);
            if (dependDropdowns.length > 0) {
                this.commonServiceSubscription = this.commonService
                    .getComboBoxDataByFilter(dropdownControl.identificationKey, dependDropdowns[0].value)
                    .subscribe((response: ApiResultResponse) => {
                        this.appErrorHandler.executeAction(() => {
                            this.onSuccessGetDropdownData(response.item, dropdownControl);
                            this.ref.markForCheck();
                        });
                    });
            }
        }
    }

    /**
     * Map new item to drop-down after getting from service.
     * @param result
     * @param dropdownControl
     */
    private onSuccessGetDropdownData(result, dropdownControl: DropdownControl) {
        if (!result) return;
        const comboOptions: Array<any> = this.getValidCombobox(result, dropdownControl.identificationKey);
        if (comboOptions) {
            let options: Array<any> = [];
            let idValue: string;
            options = comboOptions.map((option) => {
                if (option.textValue === dropdownControl.displayValue) {
                    idValue = option.idValue;
                }
                return {
                    key: option.idValue,
                    value: option.textValue,
                };
            });
            if (idValue) {
                dropdownControl.value = idValue;
                this.form.controls[dropdownControl.key].setValue(idValue);
            }
            dropdownControl.options = options;
        }
    }

    /**
     * resetHiddenField
     */
    private resetHiddenField() {
        let contentList: any;
        if (
            this.dataSource &&
            this.dataSource.contentDetail &&
            this.dataSource.contentDetail.data &&
            this.dataSource.contentDetail.data.length > 0
        ) {
            const widgetInfo = this.dataSource.contentDetail.data;
            contentList = widgetInfo[1];
        }
        if (!contentList || !this.groupContentList) {
            return;
        }
        for (let i = 0; i < contentList.length; i++) {
            const itemContent = contentList[i];
            let isHidden = false;
            if (itemContent.Setting && itemContent.Setting.length) {
                const settingArray = JSON.parse(itemContent.Setting);
                let setting = Uti.getCloumnSettings(settingArray);
                isHidden =
                    setting.DisplayField && setting.DisplayField.Hidden && parseInt(setting.DisplayField.Hidden) > 0;
            }
            if (!isHidden) {
                if (this.fieldFilters && this.fieldFilters.length > 0) {
                    isHidden = this.isHiddenFieldByFieldFilter(contentList[i]);
                }
                // Allow to display by display fields, so need to check if it can display by filter mode
                if (!isHidden) {
                    isHidden = this.isHiddenFieldByFilterMode(contentList[i]);
                }
            }
            let control = this.groupContentList.find((p) => p.key == contentList[i].OriginalColumnName);
            if (control) {
                control.isHidden = isHidden;
            }
        }
    }

    /**
     * setDateFormatByCountryCode
     * @param dropdownControl
     */
    private setDateFormatByCountryCode(dropdownControl: DropdownControl) {
        if (dropdownControl.key == this.SharingAddressIdRepIsoCountryCodeField) {
            this.updateDateOfBirthFormatByCountryCode();
        }
    }

    /**
     * setMaskAndValidationForZipCodeByCountryCode
     * @param dropdownControl
     */
    private setMaskAndValidationForZipCodeByCountryCode(dropdownControl: DropdownControl) {
        if (dropdownControl.key == this.SharingAddressIdRepIsoCountryCodeField) {
            const option = dropdownControl.options.find((p) => p.key == dropdownControl.value);
            if (option && option[this.ValidationZipMaskFormatField]) {
                let validationZipMaskFormatField = option[this.ValidationZipMaskFormatField] as string;
                const validationZipRegExField = option[this.ValidationZipRegExField] as string;
                this.updateMaskForZipControl(
                    this.B00SharingAddressZipField,
                    validationZipMaskFormatField,
                    validationZipRegExField,
                );

                let validationZip2MaskFormatField = option[this.ValidationZip2MaskFormatField] as string;
                const validationZip2RegExField = option[this.ValidationZip2RegExField] as string;
                this.updateMaskForZipControl(
                    this.B00SharingAddressZip2Field,
                    validationZip2MaskFormatField,
                    validationZip2RegExField,
                );
            }
        }
    }

    /**
     * updateMaskForZipControl
     * @param zipControlKey
     * @param validationZipMaskFormatField
     * @param validationZipRegExField
     */
    private updateMaskForZipControl(zipControlKey, validationZipMaskFormatField, validationZipRegExField) {
        let zipTxtControl = this.groupContentList.find((p) => p.key == zipControlKey);
        if (zipTxtControl) {
            let textMaskControl = new TextboxMaskControl(zipTxtControl);
            textMaskControl.controlType = ControlType.TextboxMask;
            textMaskControl.pattern = validationZipRegExField;
            if (validationZipMaskFormatField) {
                validationZipMaskFormatField = validationZipMaskFormatField.replace(/§/g, 'A');
                textMaskControl.mask = validationZipMaskFormatField;
            }
            zipTxtControl = Object.assign(zipTxtControl, textMaskControl);

            /* TODO: reopen after updating format in DB
            let arr = [];
            if (zipTxtControl.pattern && zipTxtControl.pattern.length) {
                if (Uti.isValidRegExp(zipTxtControl.pattern)) {
                    arr.push(Validators.pattern(new RegExp(zipTxtControl.pattern)));
                    (<FormControl>this.form.controls[zipTxtControl.key]).validator = Validators.compose(arr);
                    (<FormControl>this.form.controls[zipTxtControl.key]).updateValueAndValidity();
                }
            }
            */
        }
    }

    /**
     * setHiddenFieldsByCountryCode
     * Update hidden fields following country code.
     * @param dropdownControl
     */
    private setHiddenFieldsByCountryCode(dropdownControl: DropdownControl) {
        if (dropdownControl.key == this.SharingAddressIdRepIsoCountryCodeField) {
            const option = dropdownControl.options.find((p) => p.key == dropdownControl.value);
            if (option && option[this.SharingAddressHiddenFields]) {
                this.resetHiddenField();
                const hiddenFields = (option[this.SharingAddressHiddenFields] as string).split(';');
                this.setHiddenFields(hiddenFields);
            }
        }
    }

    /**
     * Update value of control
     * @param control
     */
    onUpdateValue(control: ControlBase<any>) {
        switch (control.controlType) {
            case 'dropdown':
                const dropdownControl = control as DropdownControl;
                this.changeItemOnDropdown(dropdownControl);
                this.setHiddenFieldsByCountryCode(dropdownControl);
                this.setMaskAndValidationForZipCodeByCountryCode(dropdownControl);
                this.setDateFormatByCountryCode(dropdownControl);
                break;
            case 'checkbox':
                const checkboxControl = control as CheckboxControl;
                this.changeStatusCheckBox(checkboxControl);
                break;
            case 'date':
                const dateControl = control as DateControl;
                if (this.form && this.form.controls[dateControl.key]) {
                    this.form.controls[dateControl.key].setValue(dateControl.value);
                    this.form.updateValueAndValidity();
                }
                break;
        }
        this.ref.markForCheck();
    }

    /**
     * When changing status of check box , we need to filter the others with the same group.
     */
    private changeStatusCheckBox(checkboxControl: CheckboxControl) {
        if (checkboxControl.value && checkboxControl.groupName) {
            const controls: ControlBase<any>[] = this.groupContentList;
            // Find all other checkbox with the same group.
            const checkBoxGroup = controls.filter((p) => p.key !== checkboxControl.key && p.controlType === 'checkbox');
            if (checkBoxGroup.length) {
                const checkboxControls = checkBoxGroup as CheckboxControl[];
                checkboxControls.forEach((checkbox) => {
                    if (checkbox.groupName === checkboxControl.groupName) {
                        checkbox.value = false;
                        this.form.controls[checkbox.key].setValue(false);
                    }
                });
            }
        }
        this.ref.markForCheck();
    }

    /**
     * updateDateOfBirthFormatByCountryCode
     **/
    private updateDateOfBirthFormatByCountryCode() {
        const controls: ControlBase<any>[] = this.groupContentList;
        if (controls && controls.length) {
            const countryCodeControl = controls.find((p) => p.key == this.SharingAddressIdRepIsoCountryCodeField);
            if (countryCodeControl && countryCodeControl.value) {
                const options = (countryCodeControl as DropdownControl).options;
                if (options && options.length) {
                    const option = options.find((p) => p.key == countryCodeControl.value);
                    if (option) {
                        let dateControl = controls.find(
                            (p) => p.controlType === 'date' && p.key == this.B00PersonMasterData_DateOfBirth,
                        );
                        if (dateControl) {
                            (dateControl as DateControl).format = null;
                            if (this.supportDOBCountryFormat) {
                                const dateFormat = Uti.getDateFormatFromIsoCode(option['isoCode']);
                                (dateControl as DateControl).format = dateFormat;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * When changing an item in drop down , we need to filter the others dropdown following that changing.
     * @param dropdownControl
     */
    private changeItemOnDropdown(dropdownControl: DropdownControl) {
        const id = dropdownControl.value;
        const key = dropdownControl.key;
        const controls: ControlBase<any>[] = this.groupContentList;
        // Find all dependency drop-downs.
        const filterByDropdowns = controls.filter((p) => p.controlType === 'dropdown' && p.filterBy === key);
        if (filterByDropdowns.length > 0) {
            let observables = new Array<Observable<any>>();
            filterByDropdowns.forEach((filterByDropdown) => {
                const control = filterByDropdown as DropdownControl;
                control.options = [];
                observables.push(this.commonService.getComboBoxDataByFilter(control.identificationKey, id));
            });

            // Excute request
            for (let i = 0; i < observables.length; i++) {
                observables[i].subscribe((response: ApiResultResponse) => {
                    this.appErrorHandler.executeAction(() => {
                        let rs = response.item;
                        if (!rs) return;
                        for (let j = 0; j < filterByDropdowns.length; j++) {
                            const control = filterByDropdowns[j] as DropdownControl;
                            this.onSuccessGetDropdownData(rs, control);
                            this.ref.markForCheck();
                        }
                    });
                });
            }
        }
    }

    /**
     * calculateMinLabelWidth
     */
    private calculateMinLabelWidth() {
        this.groupContentList.forEach((control) => {
            if (control.label && !control.isHidden) {
                if (
                    this.importantFormStyle.labelStyle &&
                    this.importantFormStyle.labelStyle['font-size'] &&
                    this.importantFormStyle.fields &&
                    this.importantFormStyle.fields[control.key]
                ) {
                    const ratioConvert =
                        (parseInt(this.importantFormStyle.labelStyle['font-size'].replace('px').trim(), null) / 12) * 7;
                    this.changeMinLabelWidth(control.label.length, ratioConvert);
                } else this.changeMinLabelWidth(control.label.length, this.ratioConvertFontSizeToPixcel);
            }
        });
        this.ref.markForCheck();
    }

    /**
     * changeMinLabelWidth
     * @param event
     */
    private changeMinLabelWidth(lbLength, ratioConvert) {
        if (isNil(lbLength)) return;

        this.minLabelWidth = Math.max(this.minLabelWidth, lbLength * ratioConvert + 10);
        const containerWidth = $('form', $(this._eref.nativeElement)).width();
        if (containerWidth > 0 && this.minLabelWidth > (containerWidth / 5) * 2)
            this.minLabelWidth = containerWidth / 2;
    }

    private listVirtualElements: any;
    private listVirtualElementNames: string[] = [];
    private activateVirtualContainer(input: string, isChangeData?: boolean) {
        if (this.org_numberOfVisibleControls !== this.numberOfVisibleControls)
            this.org_numberOfVisibleControls = this.numberOfVisibleControls;
        else if (isChangeData && this.listVirtualElementNames.length) return;

        const vContainers = $('.virtual-container', $(this._eref.nativeElement));
        if (!vContainers.length) return;

        if (this.numberOfVisibleControls > 20 || this.widgetFormType === WidgetFormTypeEnum.List) {
            vContainers.hide();
            this.listVirtualElementNames = [];
            return;
        }

        if (input && this.dataSource) {
            const id = this.dataSource.id;
            // do nothing for invalid Widget Id or not to be resized by spliter
            if (input.indexOf('-' + id + '-') < 0 && input.indexOf('spliter-') < 0) return;

            // start resizing, hide all virtual element
            if (input.indexOf('start-') >= 0) {
                vContainers.hide();
                return;
            }
        }
        // find the start point to activate virtual elements
        const containerW = $('form', $(this._eref.nativeElement)).width();
        const cols = Math.min(6, Math.floor(containerW / 265));
        const rows = vContainers.length;
        const numberItemsRemain = rows % cols;
        const rowsFullOfItems = (rows - numberItemsRemain) / cols;
        const numberItemsWillAdd = cols - numberItemsRemain;
        const startPoint =
            numberItemsRemain <= 0
                ? rowsFullOfItems - 1
                : (rowsFullOfItems + 1) * numberItemsRemain + rowsFullOfItems - 1;
        vContainers.hide();
        this.listVirtualElementNames = [];
        for (let i = 0; i < numberItemsWillAdd; i++) {
            const element = $(vContainers.get(startPoint + i * rowsFullOfItems));
            element.show();
            this.listVirtualElementNames.push(element.attr('data-id'));
        }
    }

    /**
     * trackControl
     * @param index
     * @param control
     */
    trackControl(index, control) {
        return control ? control.key : undefined;
    }

    //#region SignalR
    public notifyObjectId: any;
    private notifyFields: Array<any> = null;
    private signalRAskEditingTimeout: any = null;

    private signalRGetObjectId() {
        if (
            !this.dataSource ||
            !this.dataSource.widgetDataType ||
            !this.dataSource.widgetDataType.listenKey ||
            !this.dataSource.widgetDataType.listenKey.key
        )
            return null;

        let key: string = this.dataSource.widgetDataType.listenKey.key;
        let keyValue: string = this.dataSource.widgetDataType.listenKeyRequest(this.dataSource.moduleName)[key];

        if (!keyValue) return null;

        //ModuleName + IdRepWidgetApp + WidgetId + ListenKey + ID
        return this.dataSource.moduleName + this.dataSource.idRepWidgetApp + '_' + key + keyValue;
    }

    public signalRIsThereAnyoneEditing() {
        if (!Configuration.PublicSettings.enableSignalR) return;

        clearTimeout(this.signalRAskEditingTimeout);
        this.signalRAskEditingTimeout = null;

        this.signalRAskEditingTimeout = setTimeout(() => {
            this.notifyObjectId = this.signalRGetObjectId();
            if (!this.notifyObjectId) return;

            let model = this.signalRService.createMessageWidgetFormEditing();
            model.Action = SignalRActionEnum.IsThereAnyoneEditing;
            model.ObjectId = this.notifyObjectId;

            this.signalRService.sendMessage(model);
        }, 500);
    }

    private signalRConnectEditing(action?: SignalRActionEnum) {
        if (!Configuration.PublicSettings.enableSignalR) return;

        if (!this.notifyObjectId || !this.notifyFields || !this.notifyFields.length) {
            if (action === SignalRActionEnum.StopEditing) {
                this.broastCastMessage(action);
            }
            return;
        }

        this.broastCastMessage(action);
    }

    private signalRDisconnectEditing() {
        if (!this.notifyFields) return;
        this.signalRConnectEditing(SignalRActionEnum.StopEditing);
        setTimeout(() => {
            this.notifyFields = [];
        }, 1000);
    }

    private broastCastMessage(action?: SignalRActionEnum) {
        let model = this.signalRService.createMessageWidgetFormEditing();
        model.Action = action || SignalRActionEnum.ConnectEditing;
        model.ObjectId = this.notifyObjectId;
        model.Data = this.notifyFields;

        this.signalRService.sendMessage(model);
    }

    public invokeSaveWidgetSuccess() {
        let model = this.signalRService.createMessageWidgetFormEditing();
        model.Action = SignalRActionEnum.SavedSuccessfully;
        model.ObjectId = this.notifyObjectId;
        model.Data = this.notifyFields;

        this.signalRService.sendMessage(model);
    }

    private executeControlUpdated(data: SignalRNotifyModel) {
        if (!data || !data.Data || !data.Data.length) return;
        for (let item of data.Data) {
            let updateItem = this.groupContentList.find((x) => x.key === item.fieldName);
            if (!updateItem || !updateItem.key) continue;
            updateItem.hasJustUpdated = true;
        }
        this.resetControlUpdated();
    }

    private resetControlUpdated() {
        setTimeout(() => {
            for (let item of this.groupContentList) {
                item.hasJustUpdated = false;
            }
            this.ref.detectChanges();
        }, 3000);
    }

    public focusField(field) {
        if (this.fieldFocused !== field) {
            this.fieldFocused = field;
            this.store.dispatch(this.documentImageAction.changeFieldFocused(field));
        }
    }

    private getDataForDirective(widgetDataType: WidgetDataType, widgetInfo: any) {
        this.getIdProcessed(widgetInfo, 'IdDocumentContainerProcessed');
        this.parentWidgetIds = widgetDataType.parentWidgetIds;
        this.idDocumentContainerOcr = this.getIdProcessed(
            this.dataSource.contentDetail.data[0],
            'IdDocumentContainerOcr',
        );
    }

    private getIdProcessed(widgetData: any, key: string) {
        let value = null;
        if (widgetData[0]) {
            value = widgetData[0][key];
        }
        if (key === 'IdDocumentContainerProcessed') {
            this.idProcessed = value;
        }
        return value;
    }

    /**
     * getEditModeSettingImageOcr
     **/
    private getEditModeSettingImageOcr() {
        let editMode: boolean;
        if (this.dataSource && this.dataSource.widgetDataType && this.dataSource.widgetDataType.editFormSetting) {
            editMode = this.editDisplayMode && this.dataSource.widgetDataType.editFormSetting.key === 'ImageOcrData';
        }
        return editMode;
    }

    public dispatchDataFromDirective(event) {
        this.dispatchData.emit([
            {
                key: 'IdDocumentContainerOcr',
                value: this.getIdProcessed(this.dataSource.contentDetail.data[0], 'IdDocumentContainerOcr'),
            },
        ]);
    }

    //#endregion
}
