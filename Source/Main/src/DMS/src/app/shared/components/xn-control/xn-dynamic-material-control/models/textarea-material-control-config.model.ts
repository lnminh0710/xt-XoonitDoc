import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { ITextAreaMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { ControlInputType } from '../consts/control-input-type.enum';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class TextareaMaterialControlConfig extends BaseMaterialControlConfig implements ITextAreaMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    inputType: ControlInputType;
    cols: number;
    rows: number;
    isResize: boolean;

    constructor(config: Partial<TextareaMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
