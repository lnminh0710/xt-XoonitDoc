import { ContactFormModel } from './contact-form.model';

export class PersonBankFormModel extends ContactFormModel {
    b07InvoicePdm_ContoNr: string;
    b07InvoicePdm_SWIFTBIC: string;
    b07InvoicePdm_IBAN: string;

    constructor() {
        super();
        this.b07InvoicePdm_ContoNr = null;
        this.b07InvoicePdm_SWIFTBIC = null;
        this.b07InvoicePdm_IBAN = null;
    }
}
