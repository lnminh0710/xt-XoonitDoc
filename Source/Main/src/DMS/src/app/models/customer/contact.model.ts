import { PersonModel } from '../person.model';

export class ContactModel extends PersonModel {
    public idRepContactAddressType?: any = null;
    public idRepPersonBusinessTitle?: any = null;
    public isMainRecord?: boolean = false;
    public position?: any = null;
    public department?: any = null;
    public idRepTitleOfCourtesy?: any = null;
    public expirationDate?: any = null;

    public constructor(init?: Partial<ContactModel>) {
        super(init);
        Object.assign(this, init);
    }
}
