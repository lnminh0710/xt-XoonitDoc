import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { ISlideToggleMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class SlideToggleMaterialControlConfig extends BaseMaterialControlConfig implements ISlideToggleMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;

    constructor(config: Partial<SlideToggleMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
