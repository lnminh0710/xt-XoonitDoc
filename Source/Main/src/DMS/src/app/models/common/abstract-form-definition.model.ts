import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { GroupSettingFormDefinition } from './group-setting-form-definition.model';

export enum FormDefinitionType {
    FORM_FIELDS = 'Form',
    DATA_TABLE = 'Table',
    GROUP_FORMS = 'GroupForms',
}

export interface AbstractFormDefinition {
    type: FormDefinitionType;
    groupSetting: GroupSettingFormDefinition;

    setDocumentMetadata(metadata: DocumentMetadata);
    getFormatDataSave(): { [key: string]: any };
    validate(): boolean;
    reset(): void;
    clear(): void;
}
