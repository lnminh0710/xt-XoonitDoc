import { AbstractFormDefinition } from './abstract-form-definition.model';
import { ColumnDefinition } from './column-definition.model';

export interface FormFieldDefinition extends AbstractFormDefinition {
    title?: string;
    customStyle?: string;
    customClass: string;
    columnDefinitions: ColumnDefinition[];
}
