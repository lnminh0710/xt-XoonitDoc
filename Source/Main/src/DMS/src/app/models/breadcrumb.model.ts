export class BreadcrumbModel {
	public Name:string;
	public Child: BreadcrumbModel;
	public IsFirst:boolean;
	public constructor(init?: Partial<BreadcrumbModel>) {
        Object.assign(this, init);
    }
}