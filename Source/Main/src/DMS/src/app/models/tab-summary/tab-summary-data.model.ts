export class TabSummaryDataModel {
    public data: string  = '';
    public isFavorited: boolean = false;
    public httpLink: string = '';
    public iconName: string = '';
    public textColor: string = '';
    public toolTip: string = '';
    public logo: string = '';//logo name
    public logoUrl: string = '';

    public constructor(init?: Partial<TabSummaryDataModel>) {
        Object.assign(this, init);
    }
}
