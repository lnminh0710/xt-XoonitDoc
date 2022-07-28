import { FormDefinitionType } from './abstract-form-definition.model';

export interface GroupSettingFormDefinition {
    groupId: number | null;
    groupTitle: string;
    order: number | null;
    type: FormDefinitionType;
    addModule?: string;
}
