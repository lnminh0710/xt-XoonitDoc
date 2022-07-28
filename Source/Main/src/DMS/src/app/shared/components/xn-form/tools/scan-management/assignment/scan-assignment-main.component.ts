import {
    Component, Input, ViewChild, OnInit, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { ScanAssignmentStep1Component, ScanAssignmentStep2Component, ScanAssignmentStep3Component } from '../assignment';
import { SmartWizzardComponent } from '../components';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    GridActions
} from '@app/state-management/store/actions';
import { BaseComponent } from '@app/pages/private/base';
import { Observable, Subscription } from 'rxjs';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import {
    AppErrorHandler
} from '@app/services';

@Component({
    selector: 'app-scan-assignment',
    styleUrls: ['./scan-assignment.component.scss'],
    templateUrl: './scan-assignment-main.component.html'
})
export class ScanAssignmentMainComponent extends BaseComponent implements OnInit, OnDestroy {
    public idPerson: any;
    public globalProperties: any;

    private _globalPropertiesStateSubscription: Subscription;
    private _globalPropertiesState: Observable<any>;

    @ViewChild('compStep1') compStep1: ScanAssignmentStep1Component;
    @ViewChild('compStep2') compStep2: ScanAssignmentStep2Component;
    @ViewChild('compStep3') compStep3: ScanAssignmentStep3Component;
    @ViewChild('wizzard') wizzard: SmartWizzardComponent;
    @ViewChild('scanAssignmentTab') scanAssignmentTab: TabsetComponent;

    dataStep1: any;
    dataStep2: any;
    dataStep3: any;

    private defaultData: any = [
        {
            id: 1,
            text: 'Step 1',
            description: 'Select pool',
            isActive: true,
            isSave: false,
            isCanSelect: true,
            idValid: true,
            isEdit: false
        },
        {
            id: 2,
            text: 'Step 2',
            description: 'Assign user',
            isActive: false,
            isSave: false,
            isCanSelect: true,
            idValid: true,
            isEdit: false
        }
    ];

    public wizzardData = this.defaultData;
    private selectedWizzardDataItem: any;
    private isShowStep1 = true;

    constructor(
        private store: Store<AppState>,
        private gridActions: GridActions,
        private _appErrorHandler: AppErrorHandler,
        protected router: Router
    ) {
        super(router);
        this._globalPropertiesState = store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    ngOnInit() {
        this.showStep1();
        this.selectedWizzardDataItem = this.defaultData[0];
        this.subscribeGlobalProperties();
    }

    ngOnDestroy() {

    }

    getOutputDataStep1(data) {
        this.dataStep1 = data;
    }

    getOutputDataStep2(data) {
        this.dataStep2 = data;
    }

    getOutputDataStep3(data) {
        this.dataStep3 = data;
        this.winzardShowStep1(true);
        this.compStep1.refreshData();
    }

    savedStep2($event) {
        this.wizzardData[1].isSave = true;
        this.compStep1.refreshData();
    }

    savedStep3($event) {
    }

    moveToStepNextTo2(event) {
        if (event && this.compStep3) {
            this.setSelectTab(2);
            this.showStep3();
        }
    }

    public idPersonChanged($event: any) {
        this.idPerson = $event;
    }

    private setSelectTab(tabId: any) {
        this.scanAssignmentTab.tabs[tabId - 1].active = true;
    }

    backToStep2(evet) {
        if (event && this.compStep2) {
            this.setSelectTab(1);
            this.showStep2();
            this.compStep2.handleDisplayStep2(true);
        }
    }

    wizzardClick(event) {
        if (!event)
            return;

        if (event.id === this.selectedWizzardDataItem.id) {
            this.selectedWizzardDataItem = event;
            return;
        }

        if (this.selectedWizzardDataItem.id === 1) {
            this.wizzardData[0].isSave = true;
        }

        switch (event.id) {
            case 1:
                this.showStep1();
                break;
            case 2:
                this.showStep2();
                break;
        }
        this.selectedWizzardDataItem = event;

        this.store.dispatch(this.gridActions.requestInvalidate(this.ofModule));
    }

    selectTab(tabId: any, e) {
        if (!e.tabset) return;

        if (!tabId)
            return;
        switch (tabId) {
            case 1:
                if (this.isShowStep1)
                    this.showStep1();
                else
                    this.showStep2();
                break;
            case 2:
                this.showStep3();
                break;
        }

        this.store.dispatch(this.gridActions.requestInvalidate(this.ofModule));
    }

    public selectStep1AfterSaveHandler() {
        this.showStep1();
        this.winzardShowStep1(true);
    }

    public callToOpenStep2() {
        this.showStep2();
        this.winzardShowStep1(false);
    }

    private showStep1() {
        this.isShowStep1 = true;
        if (this.compStep1)
            this.compStep1.handleDisplayStep1(true);

        if (this.compStep2)
            this.compStep2.handleDisplayStep2(false);

        if (this.compStep3)
            this.compStep3.handleDisplayStep2(false);
    }

    private showStep2() {
        this.isShowStep1 = false;
        if (this.compStep1)
            this.compStep1.handleDisplayStep1(false);

        if (this.compStep2)
            this.compStep2.handleDisplayStep2(true);

        if (this.compStep3)
            this.compStep3.handleDisplayStep2(false);
    }

    private showStep3() {
        if (this.compStep1)
            this.compStep1.handleDisplayStep1(false);

        if (this.compStep2)
            this.compStep2.handleDisplayStep2(false);

        if (this.compStep3)
            this.compStep3.handleDisplayStep2(true);
    }

    private winzardShowStep1(isShow: boolean) {
        this.wizzardData[0].isActive = isShow;
        this.wizzardData[1].isActive = !isShow;
        this.selectedWizzardDataItem = isShow ? this.wizzardData[0] : this.wizzardData[1];
        if (isShow) {
            this.showStep1();
        } else {
            this.showStep2();
        }
    }
    private subscribeGlobalProperties() {
        this._globalPropertiesStateSubscription = this._globalPropertiesState.subscribe((globalProperties: any) => {
            this._appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                }
            });
        });
    }
}
