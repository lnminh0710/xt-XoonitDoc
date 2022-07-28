export class SimpleTabModel {
    public TabID: string = null;
    public TabName: string = null;
    public Toolbar: any = null;
    public Page: any = null;
    public Active: boolean = false;
    public Disabled: boolean = false;
    public Loaded: boolean = false;
    public ParentTabID: string = null;

    public constructor(init?: Partial<SimpleTabModel>) {
        Object.assign(this, init);
    }
}
