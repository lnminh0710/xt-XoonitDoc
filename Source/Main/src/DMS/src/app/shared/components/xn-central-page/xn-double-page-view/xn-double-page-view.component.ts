import { Component, OnInit, Input } from '@angular/core';
import { TabPageViewSplitModel } from '@app/models/tab-page-view';
import { PageSettingConstant } from '@app/app.constants';

@Component({
    selector: 'app-xn-double-page-view',
    templateUrl: './xn-double-page-view.component.html'
})
export class XnDoublePageViewComponent implements OnInit {
    public split: TabPageViewSplitModel;
    public isHorizontal = false;
    public isVertical = false;

    @Input() isActivated;
    @Input() isSplitterDragging;

    @Input()
    set data(data: TabPageViewSplitModel) {
        this.split = data;
        this.setSplitType();
    }

    @Input() isOrderDataEntry?: boolean;
    @Input() tabID: string;

    constructor(private pageSettingConstant: PageSettingConstant) {
    }

    ngOnInit() {
        if ($.isEmptyObject(this.split) || $.isEmptyObject(this.split.Items)) {
            this.split = new TabPageViewSplitModel();
        }
        this.setSplitType();
    }

    private setSplitType() {
        if (!this.split) {
            this.isHorizontal = false;
            this.isVertical = false;
            return;
        }

        this.isHorizontal = (this.split.SplitType === this.pageSettingConstant.HorizontalPageName);
        this.isVertical = (this.split.SplitType === this.pageSettingConstant.VerticalPageName);
    }
}
