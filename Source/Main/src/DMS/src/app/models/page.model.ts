export class PageModel {
	public PageId: string = '';

    public constructor(init?: Partial<PageModel>) {
        Object.assign(this, init);
    }
}
