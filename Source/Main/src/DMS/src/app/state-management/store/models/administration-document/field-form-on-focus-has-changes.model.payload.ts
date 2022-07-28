import { DocumentFormNameEnum, DocumentProcessingTypeEnum } from '@app/app.constants';

export class FieldFormOnFocusHasChanges {
    documentProcessingType: DocumentProcessingTypeEnum;
    documentFormName: string;
    data: any;
}
