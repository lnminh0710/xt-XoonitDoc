import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import { AppErrorHandler } from '../../../../services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'app-xn-tab-content-new-other-tab',
    templateUrl: './xn-tab-content-new-other-tab.component.html',
})

export class XnTabContentNewOtherTabComponent extends BaseComponent implements OnInit, OnDestroy {

    public tabData: any = null;
    public perfectScrollbarConfig: Object = {};
    public contentStyle: Object = {};
    private layoutInfoModelSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;

    @Input() config: any;
    @Input() globalProperties: any[] = [];

    private _tabContent: any;
    @Input() set tabContent(data: any) {
        this._tabContent = data;
    }

    get tabContent() {
        return this._tabContent;
    }

    @Output() onFormChanged: EventEmitter<any> = new EventEmitter();

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);

        this.layoutInfoModel = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };

        this.subscribeLayoutInfoModel();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.contentStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.formPadding}px)`
                    'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                                            ${this.ofModule.idSettingsGUI != 43 ? layoutInfo.tabHeaderHeight : layoutInfo.tabHeaderBigSizeHeight}px -
                                            ${layoutInfo.formPadding}px)`
                };
            });
        });
    }

    onChanged(data) {
        if (data) {
            this.onFormChanged.emit(data);
        }
    }

}
