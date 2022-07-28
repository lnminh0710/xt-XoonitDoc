import { FormGroup, ControlValueAccessor, FormControl, AbstractControl } from '@angular/forms';
import { ValidationErrors, Validators } from '@angular/forms';
import { ColumnDefinitionSetting } from '@app/models/common/column-definition.model';
import { ControlInputType } from '../consts/control-input-type.enum';
import { Observable } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { AutocompleteOptionsState } from '../models/autocomplete-material-control-config.model';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';
import { MaterialControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/material-control-type.enum';

export interface IControlConfig {
    id?: string;
    class?: string;
    style?: any;
    setting?: ColumnDefinitionSetting;
    hidden?: boolean;
    invisible?: boolean;
    formControlName: string;
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
}

export interface IClearValueControlConfig {
    clearForm?(): void;
}

export interface IMaterialControlConfig extends IControlConfig {
    type: MaterialControlType | MaterialControlTypeV2;
    id?: string;
    label: string;
    placeholder: string;
    value?: any;
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
    icon?: string;
    showBtnClearValue?: boolean;
    showBtnRemove?: boolean;
    isFocused?: boolean;
    pattern?: string;
    ignoreKeyCodes?: number[];
    validation?: ValidationErrors[];
    onControlBlur: EventEmitter<AbstractControl>;
    onControlHover: EventEmitter<AbstractControl>;
    setFocus?: () => void;
}

export interface IInputMaterialControlConfig extends IMaterialControlConfig {
    inputType: ControlInputType;
}
export interface IAutocompleteMaterialControlConfig extends IMaterialControlConfig {
    options: any[] | Observable<any[]>;
    getAutocompleteOptionsState: () => AutocompleteOptionsState;
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    setOptions: (autocompleteCtrl: IAutocompleteMaterialControlConfig) => any;
    updateOptions: (options: any[] | Observable<any[]>) => void;
    disableAutocomplete: () => void;
    enableAutocomplete: () => void;
    openAutocompleteOptions: () => void;
    closeAutocompleteOptions: () => void;
    setValueAtIndex: (index: number) => void;
    getSelectedAutocomplete: () => any;
    highlightSearchText?: boolean;
}

export interface IDatepickerMaterialControlConfig extends IMaterialControlConfig {
    displayPlaceHolderOpt: DisplayPlaceHolderOpt;
    format: string;
}

export interface ITextAreaMaterialControlConfig extends IInputMaterialControlConfig {
    cols: number;
    rows: number;
}

export interface ISelectMaterialControlConfig extends IMaterialControlConfig {
    options: any[];
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    setOptions: (selectCtrl: ISelectMaterialControlConfig) => Observable<boolean> | any;
}

export interface ISlideToggleMaterialControlConfig extends IMaterialControlConfig {

}

export interface IRadiosMaterialControlConfig extends IMaterialControlConfig {
    radioOptions: any[];
    displayVertical?: boolean;
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    setOptions: (radiosCtrl: IRadiosMaterialControlConfig) => any;
    disableRadioGroup: () => void;
    enableRadioGroup: () => void;
    disableRadioButton: (radioValue: any) => void;
    enableRadioButton: (radioValue: any) => void;
}

export enum DisplayPlaceHolderOpt {
    PLACEHOLDER = 1,
    FORMAT = 2,
}
