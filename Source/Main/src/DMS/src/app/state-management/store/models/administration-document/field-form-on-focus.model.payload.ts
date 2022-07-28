import { FormGroup } from '@angular/forms';
import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

export class FieldFormOnFocusModel {
    documentFormType?: DocumentFormType;
    documentFormName?: string;
    fieldOnFocus: string;
    formOnFocus: FormGroup;
    fieldConfig?: IMaterialControlConfig;
    isFieldImageCrop?: boolean;
    callback?: Function;
}
