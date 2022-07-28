import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class CheckboxMaterialControlConfig extends BaseMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;

    constructor(config: Partial<CheckboxMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
