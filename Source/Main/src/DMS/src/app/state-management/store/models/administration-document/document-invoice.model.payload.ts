import { CapturedBaseDocumentModel } from './captured-base-document.model';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { PersonFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { PersonBankFormModel } from '@app/models/administration-document/document-form/person-bank-form.model';

export class SaveDocumentInvoiceModel extends CapturedBaseDocumentModel {
    invoice: InvoiceFormModel;
    personRemitter: PersonFormModel;
    personBeneficiary: PersonFormModel;
    personBeneficiaryComm: any;
    personBank: PersonBankFormModel;
}