import { PersonBankFormModel } from './person-bank-form.model';
import { PersonFormModel } from './person-form.model';

export class InvoiceFormModel {
    public customerNr: string;
    public invoiceNr: string;
    public payableWithinDays: string;
    public idRepMeansOfPayment: string;
    public purposeOfPayment: string;
    public currency: string;
    public invoiceAmount: string;
    public isPaid: string;
    public isTaxRelevant: string;
    public isGuarantee: string;
    public guaranteeDateOfExpiry: string;
    public vatNr: string;
    public IBAN: string;
    public SWIFTBIC: string;
    public ContoNr: string;
    public notes: string;
    public invoiceDate: string;
    public invoiceExpirydDate: string;
    public guranteeExpiryDate: string;
    public eSRNr: string;

    constructor() {
        this.customerNr = null;
        this.invoiceNr = null;
        this.invoiceDate = null;
        this.payableWithinDays = null;
        this.idRepMeansOfPayment = null;
        this.purposeOfPayment = null;
        this.currency = null;
        this.invoiceAmount = null;
        this.isPaid = '0';
        this.isTaxRelevant = '0';
        this.isGuarantee = '0';
        this.guaranteeDateOfExpiry = null;
        this.vatNr = null;
        this.IBAN = null;
        this.SWIFTBIC = null;
        this.ContoNr = null;
        this.invoiceExpirydDate = null;
        this.guranteeExpiryDate = null;
        this.notes = null;
    }
}

export class SaveInvoiceDataForm {
    invoiceData: InvoiceFormModel;
    bankData: PersonBankFormModel;
    personBeneficiary: PersonFormModel;
    personRemitter: PersonFormModel;
}

export class InvoiceQrCodeModel {
    Currency: string;
    InvoiceAmount: string;
}
