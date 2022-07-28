import { FormControl, FormGroup } from '@angular/forms';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { IControlConfig, IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

export interface XFormConfigDefinitionV2 {
    title: string;
    customStyle?: string;
    controlConfigs: IControlConfig[];
    formCtrls: { [key: string]: FormControl };
    formGroup: FormGroup;
    columnDefinitions: ColumnDefinition[];
}
