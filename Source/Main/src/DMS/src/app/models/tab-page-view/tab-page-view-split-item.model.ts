import { TabPageViewSplitPageModel } from './tab-page-view-split-page.model';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

export class TabPageViewSplitItemModel {
    public ContentSizeOriginal: any = '';
    public ContentSize: any = '';
    public ContentFixSize: string = '';
    public Page: TabPageViewSplitPageModel = null;
    public ID: string;
    public TabID: string;
    public TabName: string;
    public HideAtFirst: string;
    public perfectScrollbarConfig: PerfectScrollbarConfigInterface;

    public Split?: any;
    public SimpleTabs?: any;

    public constructor(init?: Partial<TabPageViewSplitItemModel>) {
        Object.assign(this, init);
    }
}
