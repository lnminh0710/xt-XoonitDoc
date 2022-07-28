import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { IDatepickerMaterialControlConfig, DisplayPlaceHolderOpt } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class DatepickerMaterialControlConfig extends BaseMaterialControlConfig implements IDatepickerMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2 ;
    displayPlaceHolderOpt: DisplayPlaceHolderOpt;
    format: string;

    constructor(config: Partial<DatepickerMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
