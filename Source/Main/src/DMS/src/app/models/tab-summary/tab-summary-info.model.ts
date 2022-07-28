export class TabSummaryInfoModel {
    public tabID: string = '';
    public tabName: string = '';
    public tabType: string = '';
    public lastUpdate: string = '';
    public isMainTab: boolean = false;

    public constructor(init?: Partial<TabSummaryInfoModel>) {
        Object.assign(this, init);
    }
}
