import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChildren,
    QueryList,
    forwardRef,
} from '@angular/core';
import {
    ControlBase,
    FieldFilter,
    NumberBoxControl,
    TextboxControl,
    CheckboxControl,
    DateControl,
    DropdownControl,
    ApiResultResponse,
} from '@app/models';
import { Uti } from '@app/utilities';
import { FilterModeEnum, ControlType, ComboBoxTypeConstant } from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { parse } from 'date-fns/esm';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Observable, of } from 'rxjs';
import { CommonService, ObservableShareService, AppErrorHandler } from '@app/services';
import { InlineEditComponent } from '@app/shared/components/widget';
import { map, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {
    private undisplayFieldList: Array<string> = [];
    private formChangeSubscribeSubcription: Subscription;

    public groupContentList: Array<ControlBase<any>> = [];
    public errorShow: boolean;

    // Form group data
    form: FormGroup;
    originalFormValues: any;

    private _data;
    @Input() set data(data: any) {
        this._data = data;
        this.processData();
    }

    get data() {
        return this._data;
    }

    @Input()
    readonly = false;

    @Input()
    fieldFilters: Array<FieldFilter>;

    @Input()
    filterMode: FilterModeEnum;

    @Output()
    onFormChanged: EventEmitter<any> = new EventEmitter();

    @Output()
    onEditField: EventEmitter<any> = new EventEmitter();

    @ViewChildren(forwardRef(() => InlineEditComponent))
    private inlineEditComponents: QueryList<InlineEditComponent>;

    private _isFormChanged: boolean;
    public set isFormChanged(status: boolean) {
        this._isFormChanged = status;
        this.errorShow = this._isFormChanged;
    }

    public get isFormChanged() {
        return this._isFormChanged;
    }

    constructor(
        private _eref: ElementRef,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        protected obserableShareService: ObservableShareService,
    ) {}

    /**
     * ngOnInit
     */
    public ngOnInit() {}

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {}

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {}

    private processData(): void {
        this.form = null;
        let data = this.data;
        if (data && data.length > 0) {
            const contentList: Array<any> = data;
            if (!contentList) {
                return;
            }
            this.buildGroupList(contentList);
            this.createFormGroup();
        }
    }

    private createFormGroup() {
        const controls: ControlBase<any>[] = this.groupContentList;
        this.toFormGroup(controls)
            .finally(() => {
                this.subscribeFormChange();
            })
            .subscribe((form) => {
                this.appErrorHandler.executeAction(() => {
                    this.form = form;
                    this.originalFormValues = Object.assign({}, form.value);
                });
            });
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

            return observable$.pipe(
                map((response: ApiResultResponse) => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    for (let k = 0; k < comboBoxes.length; k++) {
                        const comboOptions = this.getValidCombobox(response.item, comboBoxes[k].identificationKey);
                        if (comboOptions) {
                            const options: Array<any> = [];
                            let idValue: number = null;
                            for (let i = 0; i < comboOptions.length; i++) {
                                options.push({
                                    key: comboOptions[i].idValue,
                                    value: comboOptions[i].textValue,
                                });
                                if (comboOptions[i].textValue === comboBoxes[k].displayValue) {
                                    idValue = comboOptions[i].idValue;
                                }
                            }
                            comboBoxes[k].options = options;
                            if (idValue) {
                                comboBoxes[k].value = '' + idValue;
                            }
                            // set defaut value for combobox If empty
                            if (!comboBoxes[k].value && options.length) {
                                comboBoxes[k].value = options[0].key;
                                comboBoxes[k].displayValue = options[0].value;
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
                }),
            );
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
        let data = Uti.getParameterCaseInsensitive(listComboBox, idx);
        return data;
    }

    /**
     * Load data for drop-down that depend on other drop-down
     */
    private loadDataForDependDropdown(dropdownControl: DropdownControl, controls: ControlBase<any>[]) {
        if (dropdownControl.filterBy) {
            const dependDropdowns = controls.filter((p) => p.key === dropdownControl.filterBy);
            if (dependDropdowns.length > 0) {
                this.commonService
                    .getComboBoxDataByFilter(dropdownControl.identificationKey, dependDropdowns[0].value, null, true)
                    .subscribe((response: ApiResultResponse) => {
                        this.appErrorHandler.executeAction(() => {
                            this.onSuccessGetDropdownData(response.item, dropdownControl, dependDropdowns[0].value);
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
    private onSuccessGetDropdownData(result, dropdownControl: DropdownControl, filterByValue?) {
        if (!result) {
            if (dropdownControl.value) {
                dropdownControl.value = '';
                this.form.controls[dropdownControl.key].setValue('');
                this.editField({ control: dropdownControl });
            }
            return;
        }
        let identificationKey = dropdownControl.identificationKey;
        if (filterByValue) {
            identificationKey += '_' + filterByValue;
        }
        const comboOptions: Array<any> = this.getValidCombobox(result, identificationKey);
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

            if (!dropdownControl.value) {
                dropdownControl.value = options[0].key;
                dropdownControl.displayValue = options[0].value;
                if (this.form && this.form.controls) {
                    this.form.controls[dropdownControl.key].setValue(options[0].key);
                }
            }

            dropdownControl.options = options;
        }
        if (dropdownControl.type == 'table') {
            if (dropdownControl.options && dropdownControl.options.length) {
                dropdownControl.options.forEach((option, index) => {
                    option = Object.assign(option, comboOptions[index]);
                });
            }
            dropdownControl.itemFormatter = this.customItemFormatter.bind(this, dropdownControl);
        }
        if (dropdownControl.type == 'multi-select') {
            if (dropdownControl.options && dropdownControl.options.length) {
                if (dropdownControl.options.length == 1) {
                    dropdownControl.options[0]['selected'] = true;
                    dropdownControl.value = dropdownControl.options[0].key;
                } else {
                    if (dropdownControl.value) {
                        let keys: Array<string> = dropdownControl.value.split(',');
                        keys.forEach((key) => {
                            let option = dropdownControl.options.find((p) => p.key == key);
                            if (option) {
                                option['selected'] = true;
                            }
                        });
                    }
                }
            }
        }
    }

    public customItemFormatter(dropdownControl: DropdownControl, index, content) {
        let rowContent = '';
        let options = dropdownControl.options;
        let tableKey = dropdownControl.tableKey;
        if (options && options.length) {
            let option = options[index];
            if (tableKey) {
                let cols: Array<string> = tableKey.split(',');
                let colString = '';
                let numberCols = 12 / cols.length;
                cols.forEach((col, index) => {
                    let classCol = 'col-sm-' + numberCols; // index == 0 ? 'col-sm-4' : 'col-sm-3';
                    colString +=
                        '<div class="' +
                        classCol +
                        ' no-padding-left ellipsis-text" title="' +
                        option[col] +
                        '">' +
                        option[col] +
                        '</div>';
                    //if (index < cols.length - 1) {
                    //    colString += '<div class="col-sm-1" style="display:none" > - </div>';
                    //}
                });
                rowContent = '<div class="col-md-12 col-lg-12 xn-wj-ddl-item">' + colString + '</div>';
            }
        }
        return rowContent;
    }

    /**
     * buildGroupList
     * @param contentList
     */
    private buildGroupList(contentList: Array<any>): void {
        this.undisplayFieldList = [];
        this.groupContentList = [];
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
                mappingField: setting.MappingField,
            };

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
                    } else if (
                        isNil(defaultConfig.value) ||
                        (defaultConfig.value.toLowerCase() !== 'true' && defaultConfig.value.toLowerCase() != '1')
                    )
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
                case ControlType.ComboBoxTable:
                case ControlType.ComboBoxMultiSelect:
                    defaultConfig.displayValue = defaultConfig.value;
                    defaultConfig.identificationKey = identificationKey;
                    defaultConfig.filterBy = filterBy;
                    if (controlType == ControlType.ComboBoxTable) {
                        defaultConfig.type = 'table';
                        defaultConfig.tableKey = setting.ControlType.TableKey;
                    } else if (controlType == ControlType.ComboBoxMultiSelect) {
                        defaultConfig.type = 'multi-select';
                    }
                    txtControl = new DropdownControl(defaultConfig);
                    break;

                default:
                    txtControl = new TextboxControl(defaultConfig);
                    break;
            }
            this.groupContentList.push(txtControl);
        }
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

    /**
     * subscribeFormChange
     **/
    private subscribeFormChange() {
        if (!this.form) return;

        if (this.formChangeSubscribeSubcription) this.formChangeSubscribeSubcription.unsubscribe();

        this.formChangeSubscribeSubcription = this.form.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
            this.appErrorHandler.executeAction(() => {
                if (JSON.stringify(this.originalFormValues) !== JSON.stringify(this.form.value)) {
                    this.onFormChanged.emit(true);
                    this.isFormChanged = true;
                } else {
                    this.onFormChanged.emit(false);
                    this.isFormChanged = false;
                }
            });
        });
    }

    public getSavingData() {
        if (this.form) {
            return this.form.value;
        }
        return null;
    }

    public focusOnFirstFieldError() {
        const inlineEditComponents: Array<InlineEditComponent> = this.inlineEditComponents.toArray();
        for (let i = 0; i < inlineEditComponents.length; i++) {
            if (!this.form.controls[inlineEditComponents[i].control.key].valid) {
                this.errorShow = true;
                inlineEditComponents[i].focus();
                break;
            }
        }
    }

    private createData() {
        return [
            {
                ColumnName: 'Notes',
                DataLength: '500',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00Person_Notes',
                Setting: '[]',
                Value: 'test test',
            },
            {
                ColumnName: 'FirstName',
                DataLength: '80',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00SharingName_FirstName',
                Setting: '[]',
                Value: 'test test',
            },
            {
                ColumnName: 'COName',
                DataLength: '80',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00SharingName_COName',
                Setting: '[]',
                Value: '',
            },
            {
                ColumnName: 'StreetAddition1',
                DataLength: '80',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00SharingAddress_StreetAddition1',
                Setting: '[]',
                Value: '',
            },
            {
                ColumnName: 'StreetAddition2',
                DataLength: '80',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00SharingAddress_StreetAddition2',
                Setting: '[]',
                Value: '',
            },
            {
                ColumnName: 'Addition',
                DataLength: '80',
                DataType: 'nvarchar',
                OrderBy: 0,
                OriginalColumnName: 'B00SharingAddress_Addition',
                Setting: '[]',
                Value: '',
            },
        ];
    }

    public editField(data) {
        this.onEditField.emit(data);
    }
}
