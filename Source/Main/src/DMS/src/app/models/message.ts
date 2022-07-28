import { User } from './user';

export class Message {
    public content: string = '';
    public title: string = '';
    // message Type:
    // 1. Warning
    // 2. Notice
    // 3. Spam
    public type: string = '';
    public author: User = null;
    public destination: User = null;
    public date: string = '';
    public isRead: boolean = false;

    public constructor(init?: Partial<Message>) {
        Object.assign(this, init);
    }
}
