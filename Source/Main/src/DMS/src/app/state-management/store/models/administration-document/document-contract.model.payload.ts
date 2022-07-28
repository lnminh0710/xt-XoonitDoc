import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';
import { PersonFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { CapturedBaseDocumentModel } from './captured-base-document.model';
import { ContactFormModel } from '@app/models/administration-document/document-form/contact-form.model';

export class GetDocumentContractPayloadModel {
    idPerson: number;
}

export class SaveDocumentContractForms extends CapturedBaseDocumentModel {
    contract?: ContractFormModel;
    personContractingParty?: PersonFormModel | ContactFormModel;
    personContractor?: PersonFormModel;
}
