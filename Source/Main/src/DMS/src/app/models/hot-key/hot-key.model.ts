export class HotKey {
    public altKey: boolean;
    public keyCombineCode: string;
    public constructor(init?: Partial<HotKey>) {
        Object.assign(this, init);
    }
}