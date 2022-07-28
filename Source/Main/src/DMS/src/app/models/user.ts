export class User {
    public id: string = '';
    public loginName: string = '';
    public password: string = '';
    public fullName: string = '';
    public firstname: string = '';
    public lastname: string = '';
    public email: string = '';
    public creationDate: string = '';
    public preferredLang: string = '';
    public lastLoginDate: Date = new Date();
    public loginPicture: string = '';
    public nickName: string = '';
    public loginMessage: string = '';
    public color: string = '';
    public idCloudConnection: string = '';
    public idApplicationOwner: string = '';
    public isSuperAdmin: boolean;
    public isAdmin: boolean;
    public initials: string;
    public company: string;
    public idPerson: string;
    public phoneNr: string;
    public dateOfBirth: string;
    public roles: string;
    public roleName: string;
    public avatarDefault: string;

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }

    public getName() {
        return this.fullName || (this.firstname || '') + ' ' + (this.lastname || '');
    }

    public getRoleName(): string {
        let roleName = '';
        if (!this.roles) return roleName;

        const rolesObj = JSON.parse(this.roles) || [];
        rolesObj.forEach((element) => {
            roleName += `${element.RoleName}, `;
        });

        return roleName.substring(0, roleName.length - 2);
    }
}
