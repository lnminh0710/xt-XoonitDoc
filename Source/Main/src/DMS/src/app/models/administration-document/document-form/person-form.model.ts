import { ContactFormModel } from './contact-form.model';

export class PersonFormModel extends ContactFormModel {
    b00SharingName_FirstName: string;
    b00SharingName_LastName: string;

    constructor() {
        super();
        this.b00SharingName_FirstName = null;
        this.b00SharingName_LastName = null;
    }
}

export class ContactDetailFormModel extends PersonFormModel {
    b00Person_IdPerson: string;

    constructor() {
        super();
        this.b00Person_IdPerson = null;
    }
}
