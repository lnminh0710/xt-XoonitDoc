import { Injectable } from '@angular/core';
import { ControlInputType } from '../consts/control-input-type.enum';
import {
    DisplayFieldSetting,
    ColumnDefinitionSetting,
    ColumnDefinition,
} from '@app/models/common/column-definition.model';
import { InputMaterialControlConfig } from '../models/input-material-control-config.model';
import { AutocompleteMaterialControlConfig } from '../models/autocomplete-material-control-config.model';
import { RadiosMaterialControlConfig } from '../models/radios-material-control-config.model';
import {
    IRadiosMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
    IMaterialControlConfig,
    IInputMaterialControlConfig,
    IControlConfig,
} from '../interfaces/material-control-config.interface';
import { FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { isString, isBoolean } from 'util';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { DatepickerMaterialControlConfig } from '../models/datepicker-material-control-config.model';
import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { MaterialControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/material-control-type.enum';

@Injectable()
export class XnDynamicMaterialHelperService {
    constructor() { }

    public createInputMaterialControlConfig(
        fieldName: string,
        columnName: string,
        orderBy: number,
        overrideColumnSetting?: ColumnDefinitionSetting,
    ) {
        const newColumnSetting = <ColumnDefinitionSetting>{
            DisplayField: <DisplayFieldSetting>{
                Hidden: '0',
                ReadOnly: '0',
                OrderBy: orderBy.toString(),
                GroupHeader: '0',
            },
            ...overrideColumnSetting,
        };

        const controlConfig = new InputMaterialControlConfig({
            value: '',
            label: columnName,
            formControlName: fieldName,
            placeholder: columnName,
            setting: newColumnSetting,
            inputType: ControlInputType.TEXT,
            type: MaterialControlType.INPUT,
        });

        controlConfig.style = this._parseStyle(newColumnSetting?.CustomStyle);
        controlConfig.validation = this.getValidators(controlConfig);

        return controlConfig;
    }

    public createAutocompleteMaterialControlConfig(
        fieldName: string,
        columnName: string,
        orderBy: number,
        setOptions: (autocompleteCtrl: IAutocompleteMaterialControlConfig) => void,
    ) {
        const newColumnSetting = <ColumnDefinitionSetting>{
            DisplayField: <DisplayFieldSetting>{
                Hidden: '0',
                ReadOnly: '0',
                OrderBy: orderBy.toString(),
                GroupHeader: '0',
            },
        };

        const controlConfig = new AutocompleteMaterialControlConfig({
            value: '',
            label: columnName,
            formControlName: fieldName,
            placeholder: columnName,
            setting: newColumnSetting,
            type: MaterialControlType.AUTOCOMPLETE,
            options: [],
            setOptions: setOptions,
        });

        controlConfig.style = this._parseStyle(newColumnSetting?.CustomStyle);
        return controlConfig;
    }

    public createRadiosButtonMaterialControlConfig(
        fieldName: string,
        columnName: string,
        orderBy: number,
        setOptions: (radiosCtrl: IRadiosMaterialControlConfig) => void,
        overrideColumnSetting: ColumnDefinitionSetting,
        displayVertical = true,
    ) {
        const newColumnSetting = <ColumnDefinitionSetting>{
            DisplayField: <DisplayFieldSetting>{
                Hidden: '0',
                ReadOnly: '0',
                OrderBy: orderBy.toString(),
                GroupHeader: '0',
            },
            ...overrideColumnSetting,
        };

        const controlConfig = new RadiosMaterialControlConfig({
            value: '',
            label: columnName,
            formControlName: fieldName,
            placeholder: columnName,
            setting: newColumnSetting,
            displayVertical: displayVertical,
            type: MaterialControlType.RADIO_BUTTON,
            radioOptions: [],
            setOptions: setOptions,
        });

        controlConfig.style = this._parseStyle(newColumnSetting?.CustomStyle);
        return controlConfig;
    }

    public createDatepickerMaterialControlConfig(
        fieldName: string,
        columnName: string,
        orderBy: number,
        overrideColumnSetting?: ColumnDefinitionSetting,
    ) {
        const newColumnSetting = <ColumnDefinitionSetting>{
            DisplayField: <DisplayFieldSetting>{
                Hidden: '0',
                ReadOnly: '0',
                OrderBy: orderBy.toString(),
                GroupHeader: '0',
            },
            ...overrideColumnSetting,
        };

        const controlConfig = new DatepickerMaterialControlConfig({
            value: '',
            label: columnName,
            formControlName: fieldName,
            placeholder: columnName,
            setting: newColumnSetting,
            type: MaterialControlType.DATEPICKER
        });

        controlConfig.style = this._parseStyle(newColumnSetting?.CustomStyle);
        controlConfig.validation = this.getValidators(controlConfig);

        return controlConfig;
    }

    public setStyle(columnDefinition: ColumnDefinition) {
        return this._parseStyle(columnDefinition.setting?.CustomStyle);
    }

    public isIMaterialControlConfig(controlConfig: IControlConfig): controlConfig is IMaterialControlConfig {
        return 'label' in controlConfig && 'placeholder' in controlConfig;
    }

    public buildFormControlObject(
        formControlObj: { [key: string]: FormControl },
        controlConfig: IMaterialControlConfig,
    ) {
        const validators: any[] = this.getValidators(controlConfig);
        controlConfig.validation = validators;
        formControlObj[`${controlConfig.formControlName}`] = new FormControl(
            {
                value: this.getDefaultValueByType(controlConfig),
                disabled: controlConfig.setting?.DisplayField?.ReadOnly === '1',
            }
            //Validators.required
        );
        formControlObj[`${controlConfig.formControlName}`].validator = Validators.compose(validators);
    }

    public getValidators(controlConfig: IMaterialControlConfig) {
        const validators: any[] = [];

        if (controlConfig?.setting?.Validators) {
            const setting = controlConfig.setting;

            if (setting.Validators.IgnoreKeyCharacters && setting.Validators.IgnoreKeyCharacters.length > 0) {
                const ignoreKeyCodes = JSON.parse(setting.Validators.IgnoreKeyCharacters);
                controlConfig.ignoreKeyCodes = [];
                ignoreKeyCodes.forEach((char) => {
                    const keyCode = char.charCodeAt(0);
                    controlConfig.ignoreKeyCodes.push(keyCode);
                });
            }

            if (setting.Validators.MaxLength) {
                validators.push(Validators.maxLength(+setting.Validators.MaxLength));
                controlConfig.maxLength = +setting.Validators.MaxLength;
            }

            if (setting.Validators.Pattern) {
                validators.push(Validators.pattern(new RegExp(setting.Validators.Pattern.Regex, '')));
            }

            const isRequired = setting.Validators.IsRequired === '1';
            if (isRequired) {
                validators.push(Validators.required);
            }
        }

        return validators;
    }

    public getDefaultValueByType(controlConfig: IMaterialControlConfig) {
        switch (controlConfig.type) {
            case MaterialControlType.SLIDE_TOGGLE:
            case MaterialControlType.CHECKBOX:
                return this._getDefaultValueSlideToggle(controlConfig);

            case MaterialControlType.INPUT:
                return this._getDefaultValueInput(controlConfig);

            case MaterialControlType.DATEPICKER:
                return this._getDefaultValueDatepicker(controlConfig);

            default:
                return controlConfig.value;
        }
    }

    public setCtrlValueByControlType(control: FormControl, type: MaterialControlType | MaterialControlTypeV2, value: any) {
        switch (type) {
            case MaterialControlType.INPUT:
                if (isString(value)) {
                    control.setValue(value);
                }
                break;

            case MaterialControlType.DATEPICKER:
                const val = '';
                if (value == null) {
                    control.setValue(val);
                }
                const _moment = moment(value, 'DD.MM.YYYY');
                if (!_moment.isValid()) {
                    control.setValue(val);
                }
                control.setValue(_moment.toDate());
                break;

            case MaterialControlType.AUTOCOMPLETE:
                if (isString(value)) {
                    control.setValue(value);
                }
                break;

            case MaterialControlType.SLIDE_TOGGLE:
                if (isBoolean(value)) {
                    control.setValue(value);
                }
                break;

            case MaterialControlType.SELECT:
                if (isString(value)) {
                    control.setValue(value);
                }
                break;

            case MaterialControlType.IMAGE_SIGNATURE:
                control.setValue(value);
                break;

            default:
                return;
        }
    }

    public getDefaultEmptyValue(controlConfig: IMaterialControlConfig) {
        switch (controlConfig.type) {
            case MaterialControlType.INPUT:
                switch ((controlConfig as IInputMaterialControlConfig).inputType) {
                    case ControlInputType.NUMBER:
                        if (controlConfig.databaseControlType === DatabaseControlType.DECIMAL) {
                            return '0.00';
                        } else {
                            return '0';
                        }

                    default:
                        return '';
                }

            case MaterialControlType.AUTOCOMPLETE:
                return '';

            case MaterialControlType.DATEPICKER:
                return null;

            case MaterialControlType.SLIDE_TOGGLE:
                return false;

            case MaterialControlType.SELECT:
                return null;

            default:
                return;
        }
    }

    private _parseStyle(customStyle: string) {
        if (!customStyle) return null;

        return JSON.parse(customStyle);
    }

    private _getDefaultValueSlideToggle(controlConfig: IMaterialControlConfig): boolean {
        if (!controlConfig.value || controlConfig.value.length <= 0) {
            return false;
        }

        if (controlConfig.value === 'false' || controlConfig.value === '0') {
            return false;
        } else if (controlConfig.value === 'true' || controlConfig.value === '1') {
            return true;
        }
        return false;
    }

    private _getDefaultValueInput(controlConfig: IMaterialControlConfig): string {
        if (!controlConfig.value || controlConfig.value.length <= 0) {
            if (controlConfig.setting?.DisplayField?.Hidden === '1') {
                return null;
            }

            switch ((controlConfig as IInputMaterialControlConfig).inputType) {
                case ControlInputType.NUMBER:
                    return '0.00';
                default:
                    return '';
            }
        }

        return controlConfig.value;
    }

    private _getDefaultValueDatepicker(controlConfig: IMaterialControlConfig): Date {
        if (!controlConfig.value || controlConfig.value.length <= 0) {
            return null;
        }

        const _moment = moment(controlConfig.value, 'DD.MM.YYYY');
        return _moment.toDate();
    }
}
