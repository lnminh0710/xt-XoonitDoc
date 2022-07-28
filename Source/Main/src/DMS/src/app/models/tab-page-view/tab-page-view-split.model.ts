import { TabPageViewSplitItemModel } from './tab-page-view-split-item.model';

export class TabPageViewSplitModel {
    //public Id?: string;
    //public Unresizable?: string;
    public SplitType: string = '';
    public Items: TabPageViewSplitItemModel[] = null;
    public Splitters: Array<any> = null;

    public constructor(init?: Partial<TabPageViewSplitModel>) {
        Object.assign(this, init);
    }
}
