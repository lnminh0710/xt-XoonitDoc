import {
    Component, OnInit, OnDestroy,
    EventEmitter, Input, Output,
    ViewChild, AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DispatcherFromStep1Component, DispatcherFromStep2Component, SmartWizzardComponent } from '@app/shared/components/xn-form';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BaseComponent } from '@app/pages/private/base';
import { Observable, Subscription } from 'rxjs';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AppErrorHandler
} from '@app/services';

@Component({
    selector: 'dispatcher-form-combine',
    templateUrl: './dispatcher-form-combine.component.html'
})
export class DispatcherFromCombineComponent extends BaseComponent  implements OnInit, OnDestroy, AfterViewInit {
    public dispatcherId: any;
    public globalProperties: any;
    public outPutFormStep1: any;

    private outPutFormRow: any;
    private saveAndChangeStep = false;
    private businessCostHeaderSubmitted = false;
    private businessCostRowSubmitted = false;
    private toolbarSetting: any;
    private _globalPropertiesStateSubscription: Subscription;
    private _globalPropertiesState: Observable<any>;

    @ViewChild('dispatcherStep1') dispatcherStep1: DispatcherFromStep1Component;
    @ViewChild('dispatcherStep2') dispatcherStep2: DispatcherFromStep2Component;
    @ViewChild('wizzard') wizzard: SmartWizzardComponent;
    @ViewChild('scanAssignmentTab') scanAssignmentTab: TabsetComponent;

    @Input() poolLeftGridStep1Id: string;
    @Input() poolRightGridStep1Id: string;
    @Input() poolLeftGridStep2Id: string;
    @Input() poolRightGridStep2Id: string;
    @Input() switchForm: string;
    @Output() outputData: EventEmitter<any> = new EventEmitter();

    constructor(
        private _store: Store<AppState>,
        private _appErrorHandler: AppErrorHandler,
        protected router: Router) {
        super(router);
        this._globalPropertiesState = _store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    public ngOnInit() {
        this.setActiveForm();
        this.subscribeGlobalProperties();
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    private setActiveForm() {
        this.setShowStep1Form(true);
    }

    private setShowStep1Form(value: boolean) {
        this.setSelectTab(value ? 1 : 2);
    }

    private setSelectTab(tabId: any) {
        this.scanAssignmentTab.tabs[tabId - 1].active = true;
    }

    public step1FormDataChange($event) {
        this.outPutFormStep1 = $event;
        this.outputData.emit(this.outPutFormStep1);
    }

    public selectTab(tabId: any) {
        switch (tabId) {
            case 1: {
                this.dispatcherStep1.step1Click();
                break;
            }
            case 2: {
                this.dispatcherStep2.step2Click();
                break;
            }
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
