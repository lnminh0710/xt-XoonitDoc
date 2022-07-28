import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { IRadiosMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class RadiosMaterialControlConfig extends BaseMaterialControlConfig implements IRadiosMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    radioOptions: any[];
    displayVertical?: boolean;
    setOptions: (radiosCtrl: IRadiosMaterialControlConfig) => any;

    constructor(config: Partial<RadiosMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    disableRadioGroup: () => void;
    enableRadioGroup: () => void;
    disableRadioButton: (radioValue: any) => void;
    enableRadioButton: (radioValue: any) => void;
}
