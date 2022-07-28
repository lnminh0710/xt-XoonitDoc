import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import 'rxjs/add/observable/forkJoin';

import cloneDeep from 'lodash-es/cloneDeep';
import remove from 'lodash-es/remove';
import pick from 'lodash-es/pick';
import findIndex from 'lodash-es/findIndex';
import get from 'lodash-es/get';
import includes from 'lodash-es/includes';
import has from 'lodash-es/has';

import { cloudConfigs } from './resource';

import { CloudConfigurationService } from '../../services';
import { ToasterService } from 'angular2-toaster';
import { ErrorHandleMessageModel } from '@app/models/error-handle/error-handle-message.model';
import { XnCommonActions, GlobalSearchActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { BaseCloudComponent } from '../base-cloud/base-cloud.component';
import { Configuration } from '@app/app.constants';
import { UserService, AuthenticationService } from '@app/services';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { CloudRemoteConnectionComponent } from '../cloud-remote-connection';
import {
    CloudModel,
    CloudTypeEnum,
    RemoteConfigurationDialogModel,
    RemoteConfigurationModel,
} from '../../models/cloud-configuration.model';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { PopupCloseEvent } from '@app/xoonit-share/components/global-popup/popup-ref';
import { take } from 'rxjs/operators';
var timeoutNotification;

@Component({
    selector: 'cloud-configuration',
    templateUrl: './cloud-configuration.component.html',
    styleUrls: ['./cloud-configuration.component.scss'],
})
export class CloudConfigurationComponent extends BaseCloudComponent implements OnInit {
    public cloudsOfPopup = [];
    public cloudsHasUserSetting = [];
    public idCloud: any;
    public titleCloud: any;
    public linkCloud: string;
    public isShowShareDialog = false;
    public oldItemActivate: any;

    // notification
    public notificationTitle = '';
    public notificationType = '';

    @ViewChild('cloudListItemTemplate') cloudListItemTemplate: TemplateRef<any>;

    constructor(
        protected store: Store<AppState>,
        protected globalSearchActions: GlobalSearchActions,
        private cloudServices: CloudConfigurationService,
        private ref: ChangeDetectorRef,
        private toasterService: ToasterService,
        private commonActions: XnCommonActions,
        protected consts: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        public popupService: PopupService,
        protected authService: AuthenticationService,
        public dialogRemote: MatDialog,
    ) {
        super(consts, userService, authService, uti, router, globalSearchActions, store);
    }

    ngOnInit() {
        this.getAllClouds();
    }

    public changeActivate(cloud: CloudModel) {
        const clouds = cloneDeep(this.cloudsOfPopup);

        const request = [];
        let oldCloudActiveIndex = findIndex(clouds, 'IsActive');
        for (const key in clouds) {
            if (clouds.hasOwnProperty(key)) {
                const cloudItem: CloudModel = clouds[key];
                let isChange = false;
                if (cloudItem.IsActive && cloud.IdCloudProviders !== cloudItem.IdCloudProviders) {
                    cloudItem.IsActive = false;
                    isChange = true;
                }
                if (cloud.IdCloudProviders === cloudItem.IdCloudProviders) {
                    cloudItem.IsActive = !cloudItem.IsActive;
                    isChange = true;
                }
                if (isChange) {
                    const item = pick(cloudItem, ['IdCloudProviders', 'IdCloudConnection', 'IsActive']);
                    // if (!item.IdCloudConnection) {
                    //     item.ConnectionString = {};
                    // }
                    item.ConnectionString = null;
                    item.UserName = null;
                    item.ClientId = null;
                    item.Password = null;
                    item.UserEmail = null;
                    item.cloudType = cloudItem.Title;
                    request.push(item);
                }
            }
        }
        if (!cloud.IdCloudConnection) {
            this.handleClouds(clouds);
            this.oldItemActivate = clouds[oldCloudActiveIndex];
            this.openSharingDialog(cloud);
            return;
        }

        if (!request.length) return;
        this.cloudServices.saveCloudConnection(request).subscribe(
            (response: any) => {
                if (has(response, 'item.isSuccess') && !get(response, 'item.isSuccess')) {
                    this.handleActiveFailed(oldCloudActiveIndex);
                    return;
                }
                this.storeTokenWhenChangeCloud(get(response, 'item.oAuthTokens'));
                if (!cloud.IsActive) {
                    this.pushCloudNotification({ title: 'Connect successfully to ' + cloud.Title, type: 'success' });
                } else {
                    this.pushCloudNotification({ title: cloud.Title + ' is disconnect!', type: 'error' });
                }
                this.closeAllTabsGlobalSearch();
                this.handleClouds(clouds);
                this.ref.detectChanges();
            },
            (error) => {
                this.handleActiveFailed(oldCloudActiveIndex);
            },
        );
    }

    public openSharingDialog(cloud: CloudModel) {
        this.idCloud = cloud.IdCloudProviders;
        this.titleCloud = cloud.Title;
        this.linkCloud = cloud.Link || '';
        if (cloud.Title === 'Remote Connection') {
            this.openDialogRemoteConnection(cloud);
        } else {
            this.isShowShareDialog = true;
        }
    }

    public closeSharingDialog() {
        this.isShowShareDialog = false;
        this.getAllClouds();
        this.idCloud = null;
        this.ref.detectChanges();
    }

    private handleActiveFailed(oldCloudActiveIndex: any) {
        const clouds = cloneDeep(this.cloudsOfPopup);

        for (const key in clouds) {
            if (clouds.hasOwnProperty(key)) {
                const cloudItem: CloudModel = clouds[key];
                if (cloudItem.IsActive) {
                    cloudItem.IsActive = false;
                }
                if (key == oldCloudActiveIndex) {
                    cloudItem.IsActive = true;
                }
            }
        }
        this.handleClouds(clouds);
        this.toasterService.pop('error', 'System', 'Active failed');
        this.ref.detectChanges();
    }

    private getAllClouds() {
        this.cloudServices.getAllClouds().subscribe((response: any) => {
            const data = get(response, 'item.collectionData') || [];

            let clouds: CloudModel[] = cloneDeep(cloudConfigs);
            for (const key in clouds) {
                if (clouds.hasOwnProperty(key)) {
                    const element: CloudModel = clouds[key];
                    const cloudItem =
                        get(data, [findIndex(data, (_c) => includes(element.Title, get(_c, 'providerName.value')))]) ||
                        {};
                    element.IdCloudProviders = get(cloudItem, 'idCloudProviders.value');
                    element.Title = get(cloudItem, 'providerName.value') || element.Title;
                    element.cloudType = get(cloudItem, 'providerName.value') || element.Title;
                    element.IsActive = get(cloudItem, 'isActive.value') === 'True' || false;
                    element.IdCloudConnection = get(cloudItem, 'idCloudConnection.value') || null;
                    element.UserName = get(cloudItem, 'userName.value') || '';
                    element.UserEmail = get(cloudItem, 'userEmail.value') || '';
                }
            }

            this.handleClouds(clouds);
        });
    }

    public pushCloudNotification(event: { title: string; type: 'success' | 'error' }) {
        if (timeoutNotification) clearTimeout(timeoutNotification);
        this.notificationType = event.type;
        this.notificationTitle = event.title;
        this.store.dispatch(this.commonActions.testCloudConnection());
        timeoutNotification = setTimeout(() => {
            this.notificationTitle = '';
            this.notificationType = '';
        }, 3000);
    }
    private openDialogRemoteConnection(cloud: CloudModel) {
        this.dialogRemote.open(CloudRemoteConnectionComponent, {
            width: '500px',
            data: {
                cloudModel: cloud,
                cloudList: this.cloudsHasUserSetting,
                callbackPush: this.pushCloudNotification.bind(this),
                callbackClose: this.closeSharingDialog.bind(this),
                oldItemActivate: this.oldItemActivate,
            },
        });
    }

    public openAddConnectionPopup() {
        const currentWidth = window.screen.width;
        const popupRef = this.popupService.open({
            content: this.cloudListItemTemplate,
            hasBackdrop: true,
            header: {
                title: 'Create Folder',
                iconClose: true,
            },
            disableCloseOutside: true,
            width: (currentWidth * 80) / 100,
            data: {
                cloudList: this.cloudsOfPopup,
            },
        });

        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            console.log(type, data);
        });
    }

    private handleClouds(clouds: CloudModel[]) {
        this.cloudsOfPopup = clouds;
        // remove clouds if not has user setting
        this.cloudsHasUserSetting = clouds.filter((x) => x.UserEmail);
    }
}
