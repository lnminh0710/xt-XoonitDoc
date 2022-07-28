export class RefCommunicationModel {
    dataType: string;
    idValue: string;
    textValue: string;
}
export class CommunicationDataModel {
    idSharingCommunication: number;
    defaultValue: string;
    commValue1: string;
    isMainCommunication: string;
}

export class ContactDetailMoldel {
    id: number;
    contactAddressType: string;
    company: string;
    coName: string;
    firstName: string;
    lastName: string;
    street: string;
    place: string;
    createDate: string;
    notes: string;
    idPersonInterfaceContactAddressGw: string;
    idPersonInterface: string;
    idPerson: string;
    idPersonType: string;
    isActive: string;
    communication: string;
    plz: string;
    pobox: string;
    phone: string;
    eMails: string;
    internet: string;
    idSharingCompany: string;
    idSharingName: string;
    idSharingAddress: string;
    personType: string;
}

export class ContactDetailRequestModel {
    idPersonType: string;
    idPerson: string;
}
