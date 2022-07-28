export class UserSignUp {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNr: string;
    dateOfBirth: string;
    idRepLanguage: string;
    currentDateTime: any;

    company: string;
    idPerson: string;
    encrypted: string;
    initials: string;
    isBlocked: boolean;
    fullName: string;
}

export class UserInfo {
    email: string;
    active: string;
    isLoginActived: string;
    initials: string;
    fullName: string;
    idLogin: string;
    idApplicationOwner: string;
    currentDateTime: any;
    company: any;
    firstName: string;
    lastName: string;
}

export class UserStatus extends UserInfo {
    statusText: string;
}

export class UserFilterModel {
    companyId: string;
    fullNameId: string;
    email: string;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}

export class ObjectSelection {
    IdValue: any;
    TextValue: any;
}

export class UserProfile {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNr: string;
}

export class UserDataUpdation {
    idLogin: string;
    idApplicationOwner: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNr: string;
    mobileNr: string;
    company: string;
    idPerson: string;
    initials: string;
    isActive: boolean;
    idRole: string;
    isDisableRole: boolean;
}
