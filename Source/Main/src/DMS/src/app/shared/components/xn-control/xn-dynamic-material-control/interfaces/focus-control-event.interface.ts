import { FormGroup } from '@angular/forms';
import { IMaterialControlConfig } from './material-control-config.interface';

export interface FocusControlEvent {
    config: IMaterialControlConfig;
    form: FormGroup;
}