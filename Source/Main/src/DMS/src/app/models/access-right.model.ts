export class AccessRightModel {
    public read: boolean = false;
    public new: boolean = false;
    public edit: boolean = false;
    public delete: boolean = false;
    public export: boolean = false;

    public constructor(init?: Partial<AccessRightModel>) {
        Object.assign(this, init);
    }
}
