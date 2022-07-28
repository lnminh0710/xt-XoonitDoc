export class PersonModel {
    public personType: string = '';
    public idPerson: any = {};
    public company: any = {};
    public firstName: any = {};
    public middlename: any = {};
    public lastName: any = {};
    public nameAddition: any = {};
    public suffixName: any = {};
    public personNr: any = {};
    public area: any = {};
    public place: any = {};
    public streetNr: any = {};
    public street: any = {};
    public streetAddition1: any = {};
    public streetAddition2: any = {};
    public streetaddition3: any = {};
    public zip: any = {};
    public zip2: any = {};
    public countryAddition: any = {};
    public addition: any = {};
    public notes: any = {};
    public poboxLabel: any = {};
    public createDate: any = {};
    public updateDate: any = {};
    public icon: string = '';
    // Add more properties for Customer Entity
    public country?: any = null;
	public firstName2?: any = null;
	public lastName2?: any = null;
	public alias?: any = null;
	public idRepPoBox?: any = null;
	public dateOfBirth?: any = null;
	public idRepPersonStatus?: any = null;
    public idRepTitle?: any = null;
	public isActive?: any = null;
	public communication?: any = null;
	public idPersonTypeGw?: any = null;
	public idSharingName?: any = null;
	public idSharingAddress?: any = null;
	public idPersonInterface?: any = null;
	public idPersonMasterData?: any = null;
	public idPersonAlias?: any = null;
	public personAliasNr?: any = null;
	public streetAddition3?: any = null;
	public idPersonStatus?: any = null;
	public idRepAddressType?: any = null;
	public idRepIsoCountryCode?: any = null;
	public idRepPersonType?: any = null;
	public isoCode?: any = null;
    public idRepLanguage?: any = null;

    constructor(init?: Partial<PersonModel>) {
        Object.assign(this, init);
    }
}
