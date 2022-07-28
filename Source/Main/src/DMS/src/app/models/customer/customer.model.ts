export class Customer {
    public idPerson: string = '';
    public idPersonInterface: string = '';
    public personNr: string = '';
    public alias: string = '';
    public firstName: string = '';
    public lastName: string = '';
    public street: string = '';
    public streetAddition1: string = '';
    public streetAddition2: string = '';
    public streetAddition3: string = '';
    public zip: string = '';
    public zip2: string = '';
    public createDate: string = '';
    public poboxLabel: string = '';
    public place: string = '';
    public city: string = '';
    public area: string = '';
    public country: string = '';
    public status: string = '';
    public notes: string = '';
    public isActive: boolean = false;

    public constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}