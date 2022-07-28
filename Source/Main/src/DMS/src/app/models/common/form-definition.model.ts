import { ColumnDefinition } from './column-definition.model';

export interface FormDefinition {
    title?: string;
    customStyle?: string;
    columnDefinitions: ColumnDefinition[];
}
