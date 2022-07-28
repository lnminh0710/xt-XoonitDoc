export class ContactFormModel {
    idPerson: number;
    personNr: string;
    b00SharingCompany_Company: string;
    b00SharingAddress_Street: string;
    b00SharingAddress_Zip: string;
    b00SharingAddress_Place: string;
    b00SharingAddress_PoboxLabel: string;
    b00SharingCommunication_TelOffice: string;
    b00SharingCommunication_Email: string;
    b00SharingCommunication_Internet: string;

    constructor() {
        this.idPerson = null;
        this.personNr = null;
        this.b00SharingCompany_Company = null;
        this.b00SharingAddress_Street = null;
        this.b00SharingAddress_Zip = null;
        this.b00SharingAddress_Place = null;
        this.b00SharingAddress_PoboxLabel = null;
        this.b00SharingCommunication_TelOffice = null;
        this.b00SharingCommunication_Email = null;
        this.b00SharingCommunication_Internet = null;
    }
}
