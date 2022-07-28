export class GlobalSearchCounterItem {
    public headerName: string = '';
    public iconCssClassName: string = '';
    public controlClassName: string = '';
    public textClassName: string = '';
    public searchResult: string = '';
    public isClicked: boolean = false;
    public isLoading: boolean = false;

    public constructor(init?: Partial<GlobalSearchCounterItem>) {
        Object.assign(this, init);
    }
}
