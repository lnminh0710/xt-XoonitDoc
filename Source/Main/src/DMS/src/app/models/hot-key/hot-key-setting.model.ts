export class HotKeySetting {

    public articleNr? : string;
    public quantity? : string;
    [key: string]: any;

    public constructor(init?: Partial<HotKeySetting>) {
        Object.assign(this, init);
    }
}
