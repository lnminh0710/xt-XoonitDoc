export class ContractFormModel {
    idContract: string;
    contractNr: string;
    netAnnualPremium: string;
    idRepCurrencyCode: string;
    commencementOfInsurance: string;
    termOfContract: string;
    notes: string;
    cancellationInMonths: string | number;
    cancellationUntilDate: string;
    untilDate: string;
    durationInMonths: string | number;
    memeberNr: string;
    contractDate: string;
    isToDo: string;


    constructor() {
        this.idContract = null;
        this.contractNr = null;
        this.netAnnualPremium = null;
        this.idRepCurrencyCode = null;
        this.commencementOfInsurance = null;
        this.termOfContract = null;
        this.notes = null;
    }
}
