import { AuthenType } from '@app/app.constants';

export class UserAuthentication {
    public access_token: string = '';
    public expires_in: string = '';
    public refresh_token: string = '';
    public login_date: Date = new Date();
    public token_type: string = '';
    public message: string = '';
    public message_type: string = '';
    public expiredDate: Date = new Date();

    public constructor(init?: Partial<UserAuthentication>) {
        Object.assign(this, init);
    }
}

export class UserToken {
    token: string;
    type: AuthenType;
}
