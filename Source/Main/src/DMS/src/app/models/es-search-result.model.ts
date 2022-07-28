export class EsSearchResult {
    public pageIndex: number = -1;
    public pageSize: number = -1;
    public total: number = 0;
    public results: Array<any> = [];
    public setting: any = null;

    public constructor(init?: Partial<EsSearchResult>) {
        Object.assign(this, init);
    }
}