import { IAutocompleteMaterialControlConfig } from '../interfaces/material-control-config.interface';
import { BaseMaterialControlConfig } from './base-material-control-config.model';
import { Observable } from 'rxjs';
import { DatabaseControlType } from '@app/xoonit-share/processing-form/consts/database-control-type.enum';
import { DatabaseControlTypeV2 } from '../../../../../xoonit-share/processing-form-v2/consts/database-control-type.enum';

export class AutocompleteMaterialControlConfig extends BaseMaterialControlConfig implements IAutocompleteMaterialControlConfig {
    databaseControlType: DatabaseControlType | DatabaseControlTypeV2;
    options: any[] | Observable<any[]>;
    highlightSearchText?: boolean;
    getAutocompleteOptionsState: () => AutocompleteOptionsState;
    displayMemberOpt?: () => string;
    valueMemberOpt?: () => string;
    setOptions: (selectCtrl: AutocompleteMaterialControlConfig) => any;
    updateOptions: (options: any[] | Observable<any[]>) => void;
    disableAutocomplete: () => void;
    enableAutocomplete: () => void;
    openAutocompleteOptions: () => void;
    closeAutocompleteOptions: () => void;
    setValueAtIndex: (index: number) => void;
    getSelectedAutocomplete: () => any;

    constructor(config: Partial<AutocompleteMaterialControlConfig>) {
        super();
        Object.assign(this, config);
    }
}

export interface AutocompleteOptionsState {
    hasOptions: boolean;
    options: any[];
}
