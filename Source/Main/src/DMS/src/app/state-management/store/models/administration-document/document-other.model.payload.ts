import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { PersonFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { OtherDocumentsFormModel } from '@app/models/administration-document/document-form/other-documents-form.model';
import { CapturedBaseDocumentModel } from './captured-base-document.model';

export class GetOtherDocumentPayloadModel {
    idPerson: number;
}

export class SaveOtherDocumentForms extends CapturedBaseDocumentModel {
    otherDocuments?: OtherDocumentsFormModel;
    personContact?: PersonFormModel;
    personPrivat?: PersonFormModel;
}
