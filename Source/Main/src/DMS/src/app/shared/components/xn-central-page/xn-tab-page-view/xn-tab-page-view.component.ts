import { Component, OnInit, Input } from '@angular/core';
import { TabPageViewModel, PageModel, TabPageViewSplitModel } from '@app/models';

@Component({
    selector: 'app-xn-tab-page-view',
    templateUrl: './xn-tab-page-view.component.html'
})
export class XnTabPageViewComponent implements OnInit {
    public tabPageView: TabPageViewModel;
    public isDoublePage = false;

    @Input()
    set data(data: TabPageViewModel) {
        this.tabPageView = data;
        this.setDoublePage();
    }

    @Input() isOrderDataEntry?: boolean;
    @Input() isActivated;
    @Input() tabID: string;
    @Input() isSplitterDragging;

    constructor() {
    }

    private setDoublePage() {
        if (!this.tabPageView) return;

        this.isDoublePage = !($.isEmptyObject(this.tabPageView.Split));
    }

    ngOnInit() {
        if ($.isEmptyObject(this.tabPageView)) {
            this.tabPageView = new TabPageViewModel({
                Page: new PageModel(),
                Split: new TabPageViewSplitModel()
            });
        }
        this.setDoublePage();
    }

}
