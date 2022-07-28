import { IInputMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { ControlInputType } from '../consts/control-input-type.enum';
import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class InputMaterialControlConfig extends BaseMaterialControlConfig implements IInputMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    inputType: ControlInputType;

    constructor(config: Partial<InputMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
