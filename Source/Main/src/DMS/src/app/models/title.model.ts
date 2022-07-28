export class Title {
    public idValue: number = -1;
    public textValue: string = '';

    public constructor(init?: Partial<Title>) {
        Object.assign(this, init);
    }
}