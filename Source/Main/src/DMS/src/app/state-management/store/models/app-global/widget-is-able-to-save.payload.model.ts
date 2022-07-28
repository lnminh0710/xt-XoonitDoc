import { ColumnDefinition } from '@app/models/common/column-definition.model';

export class FormStatus {
    isValid: boolean;
    formTitle: string;
    errorMessages?: Array<string>;
}

export interface IWidgetIsAbleToSave {
    validateForm?(): FormStatus;
    validateBeforeSave(): boolean;
    getDataSave(): { [key: string]: any };
    reset();
    reload?();
}
