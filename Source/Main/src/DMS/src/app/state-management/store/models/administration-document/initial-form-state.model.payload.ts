import { FormState } from './state/document-forms.state.model';
import { DocumentProcessingTypeEnum } from '@app/app.constants';

export class InitialFormStateModel {
    documentProcessingType: DocumentProcessingTypeEnum;
    formState: FormState;
}
