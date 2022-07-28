import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Configuration } from '@app/app.constants';
import { Module } from '@app/models';
import { CloudConnectionStatus } from '@app/models/cloud-connection.model';
import { ModuleList } from '@app/pages/private/base';
import { CloudConfigurationService } from '@app/pages/private/modules/mydm/services';
import { AppErrorHandler, UserService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { ModuleActions } from '@app/state-management/store/actions';
import { UpdateUserProfileAction } from '@app/state-management/store/actions/app/app.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { get, includes } from 'lodash-es';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { PopupRef } from '../global-popup/popup-ref';

@Component({
    selector: 'test-cloud-connection-popup',
    styleUrls: ['test-cloud-connection-popup.component.scss'],
    templateUrl: 'test-cloud-connection-popup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCloudConnectionPopupComponent implements OnInit {
    private cloudConnectionInterval = null;
    private moduleExcludePopup = ['cloud', 'changepassword'];
    private activeModule: Module;
    private activeModuleState: Observable<Module>;

    public cloudStatus = CloudConnectionStatus.connecting;
    public isLockUI = true;
    public isHidePopup = false;
    public isCallAPI = false;
    public cloudConnectionStatus = CloudConnectionStatus;
    public countdown = 15;
    public isSignedIn = false;

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private uti: Uti,
        private userService: UserService,
        private cloudServices: CloudConfigurationService,
        private changeDetectorRef: ChangeDetectorRef,
        private consts: Configuration,
        private moduleActions: ModuleActions,
        private popupRef: PopupRef<TestCloudConnectionPopupComponent>,
    ) {
        this.activeModuleState = store.select((state) => state.mainModule.activeModule);

        this._registerSubscriptions();
        this.testCloudConnection();
    }

    ngOnInit() {}

    private _registerSubscriptions() {
        this.activeModuleState.subscribe((activeModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                this.activeModule = activeModuleState;
            });
        });
    }

    public testCloudConnection() {
        if (this.cloudConnectionInterval) clearInterval(this.cloudConnectionInterval);

        if (this.isCallAPI) {
            return;
        }

        this.isCallAPI = true;
        this.countdown = 15;

        this.cloudServices.getStatusCloudConnection().subscribe(
            (response: any) => {
                this.isCallAPI = false;
                // no cloud config
                if (response.item !== CloudConnectionStatus.connected) {
                    this.countdown = 7;
                    this.isLockUI = true;
                    this.popupRef.updatePopupTitle('No cloud config');
                } else {
                    // this.isLockUI = false;
                    this.popupRef.close();
                    this.countdown = 15;
                }
                this.cloudStatus = response.item;
                if (this._checkModuleExclude(response.item)) {
                    // this.isLockUI = false;
                    this.popupRef.close();
                }
                this.changeDetectorRef.detectChanges();
                this._setIntervalConnection();
            },
            (error: any) => {
                this.countdown = 7;
                if (get(error, 'name') === 'HttpErrorResponse') {
                    // this.cloudStatus = CloudConnectionStatus.apiLostConnect;
                    this.popupRef.updatePopupTitle('Network error');
                } else {
                    // this.cloudStatus = CloudConnectionStatus.lostConnect;
                    this.popupRef.updatePopupTitle('Lost connection');
                }
                this.isLockUI = true;
                if (this._checkModuleExclude()) {
                    // this.isLockUI = false;
                    this.popupRef.close();
                }
                this.isCallAPI = false;
                this.changeDetectorRef.detectChanges();
                this._setIntervalConnection();
            },
        );
    }

    public gotoCloudConfig() {
        // this.isLockUI = false;
        this.popupRef.close();
        this.store.dispatch(this.moduleActions.requestChangeModule(ModuleList.Cloud));
    }

    private _checkModuleExclude(cloudStatus?: CloudConnectionStatus) {
        if (this.activeModule && includes(this.moduleExcludePopup, this.activeModule.moduleNameTrim?.toLowerCase())) {
            return true;
        }

        if (this.router.url === '/') {
            if (cloudStatus !== CloudConnectionStatus.connected) {
                this.cloudStatus = this.cloudConnectionStatus.connecting;
            }
            return false;
        }
        const urlSplit = this.router.url?.split('/') || [];
        const url = urlSplit[urlSplit.length - 1]?.toLowerCase();
        return includes(this.moduleExcludePopup, url);
    }

    private _setIntervalConnection() {
        if (this.cloudConnectionInterval) clearInterval(this.cloudConnectionInterval);

        this.cloudConnectionInterval = setInterval(() => {
            if (!this.countdown || this.countdown < 0) {
                this.testCloudConnection();
            } else {
                this.countdown = this.countdown - 1;
                this.changeDetectorRef.detectChanges();
            }
        }, 1200);
    }
}
