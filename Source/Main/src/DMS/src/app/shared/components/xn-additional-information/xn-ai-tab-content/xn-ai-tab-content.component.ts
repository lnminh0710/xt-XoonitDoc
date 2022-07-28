import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
    AdditionalInfromationTabContentModel
} from '@app/models/additional-information';

import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import isEmpty from 'lodash-es/isEmpty';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppErrorHandler } from '../../../../services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'app-xn-ai-tab-content',
    templateUrl: './xn-ai-tab-content.component.html'
})
export class XnAdditionalInformationTabContentComponent extends BaseComponent implements OnInit, OnDestroy {

    public tabz: AdditionalInfromationTabContentModel;
    public perfectScrollbarConfig: any = {};
    public aiTabContentStyle: Object = {};
    public isRenderTabContent = false;

    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private layoutSubcribe: Subscription;

    @Input()
    set data(data: AdditionalInfromationTabContentModel) {
        this.tabz = data;
        this.isRenderTabContent = !isEmpty(this.tabz.Page);
    }

    @Input() tabID: string;

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        private appErrorHandler: AppErrorHandler
    ) {
        super(router);

        this.layoutInfoModel = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.layoutSubcribe = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.aiTabContentStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.additionalInfoTabHeaderHeight}px)`
                    'height': `calc(100vh - ${layoutInfo.headerHeight}px - ${layoutInfo.additionalInfoTabHeaderHeight}px)`
                };
            });
        });
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

}
