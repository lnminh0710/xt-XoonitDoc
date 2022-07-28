import { AbstractFormDefinition } from './abstract-form-definition.model';
import { FormDefinition } from './form-definition.model';

export interface FormGroupDefinition {
    methodName: string;
    object: string;
    formDefinitions: FormDefinition[];
}

export interface DynamicFormGroupDefinition {
    methodName: string;
    object: string;
    formDefinitions: AbstractFormDefinition[];
}
