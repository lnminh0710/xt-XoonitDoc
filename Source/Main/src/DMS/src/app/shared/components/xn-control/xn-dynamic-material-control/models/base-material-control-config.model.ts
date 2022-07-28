import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { ValidationErrors, FormControl, AbstractControl } from '@angular/forms';
import { ColumnDefinitionSetting } from '@app/models/common/column-definition.model';
import { EventEmitter } from '@angular/core';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';
import { MaterialControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/material-control-type.enum';

export class BaseMaterialControlConfig implements IMaterialControlConfig {
    showBtnRemove?: boolean;
    setFocus?: () => void;
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    type: MaterialControlType | MaterialControlTypeV2;
    id?: string;
    label: string;
    formControlName: string;
    placeholder: string;
    class?: string;
    style?: any;
    value?: any;
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
    showBtnClearValue?: boolean = false;
    isFocused?: boolean = false;
    pattern?: string;
    ignoreKeyCodes?: number[];
    validation?: ValidationErrors[];
    setting?: ColumnDefinitionSetting;
    onControlBlur: EventEmitter<AbstractControl> = new EventEmitter<AbstractControl>();
    onControlHover: EventEmitter<AbstractControl> = new EventEmitter<AbstractControl>();
}
