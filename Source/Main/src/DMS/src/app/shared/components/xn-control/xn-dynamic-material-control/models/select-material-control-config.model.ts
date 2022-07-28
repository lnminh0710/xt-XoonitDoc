import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { Observable } from 'rxjs';
import { ISelectMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class SelectMaterialControlConfig extends BaseMaterialControlConfig implements ISelectMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    options: any[];
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    setOptions: (selectCtrl: ISelectMaterialControlConfig) => any;// Observable<boolean>;

    constructor(config: Partial<SelectMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}
