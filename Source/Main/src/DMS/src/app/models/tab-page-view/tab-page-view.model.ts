import { TabPageViewSplitModel } from './tab-page-view-split.model';
import { PageModel } from '@app/models/page.model';

export class TabPageViewModel {
    public Page: PageModel = null;
    public Split: TabPageViewSplitModel = null;

    public constructor(init?: Partial<TabPageViewModel>) {
        Object.assign(this, init);
    }
}
